import { Queue } from "../queue.ts";
import { setTimeout as delay } from "node:timers/promises";

export class Rest {
    readonly #token: string;
    // TODO: This implementation is very basic and doesn't work most of the time, in fact this works only if you always call the same endpoint over and oven again
    queue: Queue;

    constructor(token: string) {
        this.#token = token;
        this.queue = new Queue();
    }

    async request(req: Request): Promise<unknown> {
        req.headers.set("User-Agent", "DiscordBot (cordfish, v0.0.0)");
        req.headers.set("Content-Type", "application/json");
        req.headers.set("Authorization", `Bot ${this.#token}`);

        await this.queue.enqueue();

        const ratelimitData = {
            remaining: 0,
            resetAfter: 0,
        };

        try {
            const res = await fetch(req);

            ratelimitData.remaining = Number(res.headers.get("X-RateLimit-Remaining"));
            ratelimitData.resetAfter = Number(res.headers.get("X-RateLimit-Reset-After"));

            if (!res.ok) {
                throw new Error(`Request failed with status ${res.status}`);
            }

            const data = await res.json();

            if (data.code) {
                throw new Error(`Discord API error: ${data.message} (${data.code})`);
            }

            return data;
        } finally {
            // If we hit the ratelimit, wait for the reset time
            if (ratelimitData.remaining === 0) {
                await delay(ratelimitData.resetAfter * 1000);
            }

            this.queue.dequeue();
        }
    }

    get(url: string) {
        const req = new Request(`https://discord.com/api/v10${url}`, {
            method: "GET",
        });

        return this.request(req);
    }

    post(url: string, body: object) {
        const req = new Request(`https://discord.com/api/v10${url}`, {
            method: "POST",
            body: JSON.stringify(body),
        });

        return this.request(req);
    }
}
