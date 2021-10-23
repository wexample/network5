export default class {
    constructor(app, name) {
        Object.assign(this, {
            app: app,
            callbacks: [],
            commands: [],
            name: name,
            started: false,
        });
    }

    add(command) {
        this.commands.push(command);
        return this;
    }

    die() {
        this.callbacks = [];
        this.commands = [];
        this.started = false;

        return this;
    }

    next() {
        if (this.commands.length) {
            (this.commands.shift())();
        } else {
            this.complete();
        }

        return this;
    }

    start() {
        if (!this.started) {
            this.started = true;

            setTimeout(() => {
                this.next();
            })
        }

        return this;
    }

    then(callback) {
        this.callbacks.push(callback);

        // No more command to execute.
        if (this.commands.length) {
            // Execute now.
            this.complete();
        }
    }

    complete() {
        if (this.started) {
            delete this.app.queues.queues[this.name];

            this.app.callbacks(this.callbacks);
        }

        this.die();

        return this;
    }
}