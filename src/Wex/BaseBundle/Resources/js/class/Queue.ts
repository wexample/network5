import App from "./App";

export default class {
    private readonly app: App;
    private callbacks: Function[] = [];
    private commands: Function[] = [];
    private readonly name: string;
    private started: boolean;

    constructor(app: App, name: string) {
        this.app = app;
        this.name = name;
    }


    add(command: Function) {
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

    then(callback: Function) {
        this.callbacks.push(callback);
    }

    complete() {
        if (this.started) {
            delete this.app.getMixin('queues').queues[this.name];

            this.app.callbacks(this.callbacks);
        }

        this.die();

        return this;
    }
}