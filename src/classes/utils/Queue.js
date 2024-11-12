
export class Queue {

    constructor() {
        this.queue = [];
        this.processing = false;
    }

    // Add a new promise (API call) to the queue
    add(promiseFunction) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                promiseFunction,
                resolve,
                reject,
            });
            this.processNext();
        });
    }

    // Process the next promise in the queue
    async processNext() {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;
        const { promiseFunction, resolve, reject } = this.queue.shift();

        try {
            const result = await promiseFunction();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.processing = false;
            this.processNext(); // Process the next promise in the queue
        }
    }
}

