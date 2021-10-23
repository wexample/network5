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
            let response = (this.commands.shift())(this);

            if (response !== false) {
                this.next();
            }
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