export class Queue {
    #promises: QueuePromise[] = [];

    enqueue(): Promise<void> {
        const promise = new QueuePromise();
        this.#promises.push(promise);

        if (this.#promises.length === 1) {
            // If this is the first promise, resolve it immediately
            promise.resolve();
        }

        return promise.promise;
    }

    dequeue(): void {
        const promise = this.#promises.shift();

        // The queue was empty
        if (!promise) {
            return;
        }

        // If there are still promises in the queue, resolve the next one
        this.#promises[0]?.resolve();
    }
}

class QueuePromise {
    readonly promise: Promise<void>;
    readonly resolve: () => void;

    constructor() {
        const { promise, resolve } = Promise.withResolvers<void>();
        this.promise = promise;
        this.resolve = resolve;
    }
}
