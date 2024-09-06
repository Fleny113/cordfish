/** @import { gatewayIntents } from "./types.js" */

import {
    type DiscordGatewayMessage,
    GatewayOpcodes,
    ShardConnectionState,
    ShardWebSocketCloseCodes,
    gatewayMessageIsOfType,
} from "./types.js";

export class Shard {
    #socket: WebSocket | undefined = undefined;
    #options: ShardOptions;
    #resumeUrl: string | null = null;
    #session: string | null = null;
    #seq: number | null = null;
    #heatbeatTimeout?: NodeJS.Timeout;
    heatbeat: ShardHeatbeat = { ack: true, ping: -1, lastHeatbeat: -1 };
    state: ShardConnectionState = ShardConnectionState.NotConnected;

    constructor(options: ShardOptions) {
        this.#options = options;
    }

    /**
     * The zero-base index of the shard
     */
    get id() {
        return this.#options.id;
    }

    /**
     * Connect to the Discord Gateway.
     */
    async connect() {
        const url = this.state === ShardConnectionState.Resuming && this.#resumeUrl ? this.#resumeUrl : this.#options.url;

        const connectionUrl = new URL(url);
        connectionUrl.searchParams.set("v", "10");
        connectionUrl.searchParams.set("encoding", "json");

        this.#socket = new WebSocket(connectionUrl);

        const { promise, resolve } = Promise.withResolvers<void>();

        // We bind on this because otherwise `onXXX` will set this to WebSocket, causing bugs
        this.#socket.onmessage = this.#handleMessage.bind(this);
        this.#socket.onclose = this.#handleClose.bind(this);

        this.#socket.onopen = () => {
            resolve();
        };

        return await promise;
    }

    /**
     * Send a message
     */
    send<TOpcode extends GatewayOpcodes>(message: Omit<DiscordGatewayMessage<TOpcode>, "s" | "t">) {
        this.#socket?.send(JSON.stringify(message));
    }

    /**
     * Close the connection
     */
    close(code?: number) {
        this.#socket?.close(code);
        this.#socket = undefined;
    }

    onmessage(_message: DiscordGatewayMessage): unknown {
        return;
    }

    async #handleMessage({ data }: MessageEvent) {
        const message: DiscordGatewayMessage = JSON.parse(data);

        // Some opcodes / events require some internal handling, so we do it in here
        switch (true) {
            case gatewayMessageIsOfType(message, GatewayOpcodes.hello): {
                this.#startHeatbeat(message.d.heartbeat_interval);

                if (this.state === ShardConnectionState.Resuming) {
                    this.#resume();
                    break;
                }

                this.#identify();

                break;
            }
            case gatewayMessageIsOfType(message, GatewayOpcodes.heatbeat): {
                this.send({
                    op: GatewayOpcodes.heatbeat,
                    d: this.#seq,
                });

                this.heatbeat.lastHeatbeat = Date.now();

                break;
            }
            case gatewayMessageIsOfType(message, GatewayOpcodes.heatbeatACK): {
                this.heatbeat.ack = true;
                this.heatbeat.ping = Date.now() - this.heatbeat.lastHeatbeat;
                break;
            }
            case gatewayMessageIsOfType(message, GatewayOpcodes.reconnect): {
                // The actual reconnection is handled in #handleClose
                this.close(ShardWebSocketCloseCodes.reconnectRequested);
                break;
            }
            case gatewayMessageIsOfType(message, GatewayOpcodes.invalidSession): {
                if (message.d) {
                    // The actual reconnection is handled in #handleClose
                    this.close(ShardWebSocketCloseCodes.reconnectRequested);
                    break;
                }

                this.close(ShardWebSocketCloseCodes.NormalClosure);

                break;
            }
            case gatewayMessageIsOfType(message, "RESUMED"): {
                this.state = ShardConnectionState.Connected;
                break;
            }

            case gatewayMessageIsOfType(message, "READY"): {
                this.#resumeUrl = message.d.resume_gateway_url;
                this.#session = message.d.session_id;
                this.state = ShardConnectionState.Connected;

                break;
            }
        }

        if (gatewayMessageIsOfType(message, GatewayOpcodes.dispatch)) {
            this.#seq = message.s;
        }

        // After we are done with the message, we can forward it to the onmessage event
        this.onmessage(message);
    }

    async #handleClose(event: CloseEvent) {
        this.#socket = undefined;
        clearInterval(this.#heatbeatTimeout);
        console.log("Shard - Closed with code %d", event.code);

        switch (event.code) {
            // Something went wrong, with these codes it is better that we don't try again
            case ShardWebSocketCloseCodes.InvalidShard:
            case ShardWebSocketCloseCodes.ShardingRequired:
            case ShardWebSocketCloseCodes.AuthenticationFailed:
            case ShardWebSocketCloseCodes.InvalidIntents:
            case ShardWebSocketCloseCodes.InvalidApiVersion:
            case ShardWebSocketCloseCodes.DisallowedIntents: {
                this.state = ShardConnectionState.NotConnected;

                break;
            }

            // This includes:
            //  - Unknown close codes
            //  - Abnormal closure
            //  - Reconnect required
            //  - Discord close codes where we can try reconnecting
            default: {
                this.state =
                    this.state === ShardConnectionState.Resuming ? ShardConnectionState.NotConnected : ShardConnectionState.Resuming;

                await this.connect();

                break;
            }
        }
    }

    #startHeatbeat(interval: number) {
        clearInterval(this.#heatbeatTimeout);

        // `Math.random()` can be `0` so we use `0.5` if this happens
        const jitter = Math.ceil(interval * (Math.random() || 0.5));

        this.#heatbeatTimeout = setTimeout(() => {
            this.send({
                op: GatewayOpcodes.heatbeat,
                d: this.#seq,
            });

            this.heatbeat.ack = false;
            this.heatbeat.lastHeatbeat = Date.now();

            this.#heatbeatTimeout = setInterval(() => {
                // Check if discord ACK-ed the last heatbeat. If it didn't this is a zombie connection and should be terminated.
                if (!this.heatbeat.ack) {
                    this.close(ShardWebSocketCloseCodes.zombieConnection);
                    clearInterval(this.#heatbeatTimeout);
                    return;
                }

                this.send({
                    op: GatewayOpcodes.heatbeat,
                    d: this.#seq,
                });

                this.heatbeat.ack = false;
                this.heatbeat.lastHeatbeat = Date.now();
            }, interval);
        }, jitter);
    }

    #identify() {
        this.send({
            op: GatewayOpcodes.identify,
            d: {
                token: `Bot ${this.#options.token}`,
                properties: {
                    os: this.#options.properties.os,
                    browser: this.#options.properties.browser,
                    device: this.#options.properties.device,
                },
                shard: [this.id, this.#options.totalShards],
                intents: this.#options.intents,
            },
        });
    }

    #resume() {
        // We cannot resume a session without these values.
        if (!this.#seq || !this.#session) {
            this.#identify();
            return;
        }

        this.send({
            op: GatewayOpcodes.resume,
            d: {
                token: `Bot ${this.#options.token}`,
                session_id: this.#session,
                seq: this.#seq,
            },
        });
    }
}

export interface ShardOptions {
    /**
     * The Discord Bot Token.
     */
    token: string;
    /**
     * The Shard Id
     * A zero-based index to identify this shard.
     */
    id: number;
    /**
     * The intents bitfield for the connection
     * @see {@link gatewayIntents}
     */
    intents: number;
    /**
     * Identify properties to use
     */
    properties: {
        /**
         * Operating system the shard runs on.
         */
        os: string;
        /**
         * The "browser" where this shard is running on.
         */
        browser: string;
        /**
         * The device on which the shard is running.
         */
        device: string;
    };
    /**
     * The URL of the gateway which should be connected to.
     */
    url: string;
    /**
     * Total number of shards.
     * This value is used in sharding.
     */
    totalShards: number;
}

export interface ShardHeatbeat {
    /** Has discord ACK-ed the last heatbeat? */
    ack: boolean;
    /** The shard ping */
    ping: number;
    /** The last heatbeat */
    lastHeatbeat: number;
}
