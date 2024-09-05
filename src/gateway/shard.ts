/** @import { gatewayIntents } from "./types.js" */

import {
    type DiscordGatewayMessage,
    GatewayOpcodes,
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
        const connectionUrl = new URL(this.#options.url);
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

        return promise;
    }

    /**
     * Send a message
     */
    send<TOpcode extends GatewayOpcodes>(
        message: DiscordGatewayMessage<TOpcode>,
    ) {
        this.#socket?.send(JSON.stringify(message));
    }

    close(code?: number) {
        this.#socket?.close(code);
        this.#socket = undefined;
    }

    async #handleMessage({ data }: MessageEvent) {
        const message: DiscordGatewayMessage = JSON.parse(data);

        // Some opcodes / events require some internal handling, so we do it in here
        switch (true) {
            case gatewayMessageIsOfType(message, GatewayOpcodes.hello): {
                this.#startHeatbeat(message.d.heartbeat_interval);
                break;
            }
            case gatewayMessageIsOfType(message, GatewayOpcodes.heatbeatACK): {
                this.heatbeat.ack = true;
                this.heatbeat.ping = Date.now() - this.heatbeat.lastHeatbeat;
                break;
            }
            case gatewayMessageIsOfType(message, "READY"): {
                this.#resumeUrl = message.d.resume_gateway_url;
                this.#session = message.d.session_id;

                break;
            }
        }

        if (gatewayMessageIsOfType(message, GatewayOpcodes.dispatch)) {
            this.#seq = message.s;
        }
    }

    #handleClose() {
        this.#socket = undefined;

        // TODO: handle reconnecting
    }

    async #startHeatbeat(interval: number) {
        clearInterval(this.#heatbeatTimeout);

        // `Math.random()` can be `0` so we use `0.5` if this happens
        const jitter = Math.ceil(interval * (Math.random() || 0.5));

        this.#heatbeatTimeout = setTimeout(() => {
            this.send({
                op: GatewayOpcodes.heatbeat,
                d: this.#seq,
                s: undefined,
                t: undefined,
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
                    s: undefined,
                    t: undefined,
                });

                this.heatbeat.ack = false;
                this.heatbeat.lastHeatbeat = Date.now();
            }, interval);
        }, jitter);
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
