import type { ObjectValues } from "../types.js";

/** https://discord.com/developers/docs/topics/gateway#list-of-intents */
export const GatewayIntents = {
    /**
     * This intents allows receiving the following events:
     * - GUILD_CREATE
     * - GUILD_UPDATE
     * - GUILD_DELETE
     * - GUILD_ROLE_CREATE
     * - GUILD_ROLE_UPDATE
     * - GUILD_ROLE_DELETE
     * - CHANNEL_CREATE
     * - CHANNEL_UPDATE
     * - CHANNEL_DELETE
     * - CHANNEL_PINS_UPDATE
     * - THREAD_CREATE
     * - THREAD_UPDATE
     * - THREAD_DELETE
     * - THREAD_LIST_SYNC
     * - THREAD_MEMBER_UPDATE
     * - THREAD_MEMBERS_UPDATE
     * - STAGE_INSTANCE_CREATE
     * - STAGE_INSTANCE_UPDATE
     * - STAGE_INSTANCE_DELETE
     */
    Guilds: 1 << 0,
    /**
     * This intents allows receiving the following events:
     * - GUILD_MEMBER_ADD
     * - GUILD_MEMBER_UPDATE
     * - GUILD_MEMBER_REMOVE
     * - THREAD_MEMBERS_UPDATE
     *
     * @remarks
     * This is a privileged intent.
     */
    GuildMembers: 1 << 1,
    /**
     * This intents allows receiving the following events:
     * - GUILD_AUDIT_LOG_ENTRY_CREATE
     * - GUILD_BAN_ADD
     * - GUILD_BAN_REMOVE
     */
    GuildModeration: 1 << 2,
    /**
     * This intents allows receiving the following events:
     * - GUILD_EMOJIS_UPDATE
     * - GUILD_STICKERS_UPDATE
     */
    GuildEmojisAndStickers: 1 << 3,
    /**
     * This intents allows receiving the following events:
     * - GUILD_INTEGRATIONS_UPDATE
     * - INTEGRATION_CREATE
     * - INTEGRATION_UPDATE
     * - INTEGRATION_DELETE
     */
    GuildIntegrations: 1 << 4,
    /**
     * This intents allows receiving the following events:
     * - WEBHOOKS_UPDATE
     */
    GuildWebhooks: 1 << 5,
    /**
     * This intents allows receiving the following events:
     * - INVITE_CREATE
     * - INVITE_DELETE
     */
    GuildInvites: 1 << 6,
    /**
     * This intents allows receiving the following events:
     * - VOICE_STATE_UPDATE
     * - VOICE_CHANNEL_EFFECT_SEND
     */
    GuildVoiceStates: 1 << 7,
    /**
     * This intents allows receiving the following events:
     * - PRESENCE_UPDATE
     *
     * This is a privileged intent.
     */
    GuildPresences: 1 << 8,
    /**
     * This intents allows receiving the following events:
     * - MESSAGE_CREATE
     * - MESSAGE_UPDATE
     * - MESSAGE_DELETE
     * - MESSAGE_DELETE_BULK
     *
     * @remarks
     * The message content is only received if {@link GatewayIntents.MessageContent} is enabled.
     */
    GuildMessages: 1 << 9,
    /**
     * This intents allows receiving the following events:
     * - MESSAGE_REACTION_ADD
     * - MESSAGE_REACTION_REMOVE
     * - MESSAGE_REACTION_REMOVE_ALL
     * - MESSAGE_REACTION_REMOVE_EMOJI
     */
    GuildMessageReactions: 1 << 10,
    /**
     * This intents allows receiving the following events:
     * - TYPING_START
     */
    GuildMessageTyping: 1 << 11,
    /**
     * This intents allows receiving the following events:
     * - CHANNEL_CREATE
     * - MESSAGE_CREATE
     * - MESSAGE_UPDATE
     * - MESSAGE_DELETE
     * - CHANNEL_PINS_UPDATE
     */
    DirectMessages: 1 << 12,
    /**
     * This intents allows receiving the following events:
     * - MESSAGE_REACTION_ADD
     * - MESSAGE_REACTION_REMOVE
     * - MESSAGE_REACTION_REMOVE_ALL
     * - MESSAGE_REACTION_REMOVE_EMOJI
     */
    DirectMessageReactions: 1 << 13,
    /**
     * This intents allows receiving the following events:
     * - TYPING_START
     */
    DirectMessageTyping: 1 << 14,
    /**
     * This intent will add all content related values to message events.
     *
     * @remarks
     * This is a privileged intent.
     */
    MessageContent: 1 << 15,
    /**
     * This intents allows receiving the following events:
     * - GUILD_SCHEDULED_EVENT_CREATE
     * - GUILD_SCHEDULED_EVENT_UPDATE
     * - GUILD_SCHEDULED_EVENT_DELETE
     * - GUILD_SCHEDULED_EVENT_USER_ADD
     * - GUILD_SCHEDULED_EVENT_USER_REMOVE
     */
    GuildScheduledEvents: 1 << 16,
    /**
     * This intents allows receiving the following events:
     * - AUTO_MODERATION_RULE_CREATE
     * - AUTO_MODERATION_RULE_UPDATE
     * - AUTO_MODERATION_RULE_DELETE
     */
    AutoModerationConfiguration: 1 << 20,
    /**
     * This intents allows receiving the following events:
     * - AUTO_MODERATION_ACTION_EXECUTION
     */
    AutoModerationExecution: 1 << 21,
    /**
     * This intents allows receiving the following events:
     * - MESSAGE_POLL_VOTE_ADD
     * - MESSAGE_POLL_VOTE_REMOVE
     */
    GuildMessagePolls: 1 << 24,
    /**
     * This intents allows receiving the following events:
     * - MESSAGE_POLL_VOTE_ADD
     * - MESSAGE_POLL_VOTE_REMOVE
     */
    DirectMessagePolls: 1 << 25,
} as const;

/** https://discord.com/developers/docs/topics/opcodes-and-status-codes#gateway-gateway-opcodes */
export const GatewayOpcodes = {
    /**
     * An event was dispatched.
     * This opcode is only received.
     */
    dispatch: 0,
    /**
     * Fired periodically by the client to keep the connection alive.
     * This opcode may be sent from both the Shard and Discord.
     */
    heatbeat: 1,
    /**
     * Starts a new session during the initial handshake.
     * This opcode may only be sent from the Shard.
     */
    identify: 2,
    /**
     * Update the client's presence.
     * This opcode may only be sent from the Shard.
     */
    presenceUpdate: 3,
    /**
     * Used to join/leave or move between voice channels.
     * This opcode may only be sent from the Shard.
     */
    voiceStateUpdate: 4,
    /**
     * Resume a previous session that was disconnected.
     * This opcode may only be sent from the Shard.
     */
    resume: 6,
    /**
     * You should attempt to reconnect and resume immediately.
     * This opcode is only received.
     */
    reconnect: 7,
    /**
     * Request information about offline guild members in a large guild.
     * This opcode may only be sent from the Shard.
     */
    requestGuildMembers: 8,
    /**
     * The session has been invalidated. You should reconnect and identify/resume accordingly.
     * This opcode is only received.
     */
    invalidSession: 9,
    /**
     * Sent immediately after connecting.
     * This opcode is only received.
     */
    hello: 10,
    /**
     * Sent in response to receiving a heartbeat to acknowledge that it has been received.
     * This opcode is only received.
     */
    heatbeatACK: 11,
} as const;

export type GatewayOpcodes = ObjectValues<typeof GatewayOpcodes>;

export const ShardWebSocketCloseCodes = {
    zombieConnection: 3000,
};

/** https://discord.com/developers/docs/topics/gateway-events#payload-structure */
export interface DiscordGatewayMessage<
    TOpcode extends GatewayOpcodes = GatewayOpcodes,
    TEvent extends DiscordGatewayDispatchNames | undefined =
        | DiscordGatewayDispatchNames
        | undefined,
> {
    /**
     * Gateway opcode, which indicates the payload type
     */
    op: TOpcode;
    /**
     * Event data
     */
    d: MappingGatewayEvent<TEvent>[TOpcode];
    /**
     * Sequence number of event used for resuming sessions and heartbeating
     */
    s: TEvent extends string ? number : undefined;
    /**
     * Event name
     */
    t: TEvent;
}

interface MappingGatewayEvent<
    TEvent extends DiscordGatewayDispatchNames | undefined,
> {
    [GatewayOpcodes.dispatch]: TEvent extends DiscordGatewayDispatchNames
        ? MappingGatewayDispatch[TEvent]
        : undefined;
    /** https://discord.com/developers/docs/topics/gateway-events#heartbeat */
    [GatewayOpcodes.heatbeat]: number | null;
    [GatewayOpcodes.identify]: DiscordGatewayIdentify;
    // TODO: Add the proper type for this
    /** https://discord.com/developers/docs/topics/gateway-events#update-presence */
    [GatewayOpcodes.presenceUpdate]: object;
    // TODO: Add the proper type for this
    /** https://discord.com/developers/docs/topics/gateway-events#update-voice-state */
    [GatewayOpcodes.voiceStateUpdate]: object;
    [GatewayOpcodes.resume]: DiscordGatewayResume;
    [GatewayOpcodes.reconnect]: null;
    // TODO: Add the proper type for this
    /** https://discord.com/developers/docs/topics/gateway-events#request-guild-members */
    [GatewayOpcodes.requestGuildMembers]: object;
    [GatewayOpcodes.invalidSession]: boolean;
    [GatewayOpcodes.hello]: DiscordGatewayHello;
    [GatewayOpcodes.heatbeatACK]: undefined;
}

interface MappingGatewayDispatch {
    READY: DiscordGatewayReady;
    GUILD_CREATE: object;
}

export type DiscordGatewayDispatchNames = keyof MappingGatewayDispatch;

// #region === Gateway Events ===

/** https://discord.com/developers/docs/topics/gateway-events#hello */
export interface DiscordGatewayHello {
    /**
     * Interval (in milliseconds) an app should heartbeat with
     */
    heartbeat_interval: number;
}

/** https://discord.com/developers/docs/topics/gateway-events#resume */
export interface DiscordGatewayResume {
    /**
     * Session token
     */
    token: string;
    /**
     * Session ID
     */
    session_id: string;
    /**
     * Last sequence number received
     */
    seq: number;
}

/** https://discord.com/developers/docs/topics/gateway-events#identify */
export interface DiscordGatewayIdentify {
    /**
     * Authentication token
     */
    token: string;
    /**
     * Connection properties
     */
    proprieties: {
        /**
         * Your operating system
         */
        os: string;
        /**
         * Your library name
         */
        browser: string;
        /**
         * Your library name
         */
        device: string;
    };
    /**
     * Whether this connection supports compression of packets
     */
    compress?: boolean;
    /**
     * Value between 50 and 250, total number of members where the gateway will stop sending offline members in the guild member list.
     */
    large_threshold?: number;
    /**
     * Used for Guild Sharding
     */
    shard?: [number, number];
    // TODO: Add the proper type
    /**
     * Presence structure for initial presence information
     */
    presence: object;
    /**
     * Gateway Intents you wish to receive
     */
    intents: number;
}

// #endregion
// #region === Dispatch Events ===

/** https://discord.com/developers/docs/topics/gateway-events#ready */
export interface DiscordGatewayReady {
    /**
     * API version
     */
    v: number;
    /**
     * Information about the user including email
     */
    // TODO: Add the proper type
    user: object;
    /**
     * Guilds the user is in
     */
    // TODO: Add the proper type
    guilds: object[];
    /**
     * Used for resuming connections
     */
    session_id: string;
    /**
     * Gateway URL for resuming connections
     */
    resume_gateway_url: string;
    /**
     * Shard information associated with this session, if sent when identifying
     */
    shard?: [number, number];
    /**
     * Contains id and flags
     */
    // TODO: Add the proper type
    application: Partial<object>;
}

// #endregion

export function gatewayMessageIsOfType<const TOpcode extends GatewayOpcodes>(
    message: DiscordGatewayMessage,
    opcode: TOpcode,
): message is DiscordGatewayMessage<
    TOpcode,
    TOpcode extends 0 ? DiscordGatewayDispatchNames : undefined
>;
export function gatewayMessageIsOfType<
    const TEvent extends DiscordGatewayDispatchNames | undefined,
>(
    message: DiscordGatewayMessage,
    event: TEvent,
): message is DiscordGatewayMessage<0, TEvent>;
export function gatewayMessageIsOfType<T>(
    message: DiscordGatewayMessage,
    opcode: T,
) {
    if (typeof opcode === "string") {
        return message.op === 0 && message.t === opcode;
    }

    return message.op === opcode;
}
