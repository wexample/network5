import App from "./App";

export default class {
    private readonly app: App;
    private callbacks: Function[] = [];
    private commands: Function[] = [];
    private readonly name: string;
    public started: boolean = false;

    constructor(app: App, name: string) {
        this.app = app;
        this.name = name;
    }

    add(command: Function) {
        this.commands.push(command);

        return this;
    }

    reset() {
        this.callbacks = [];
        this.commands = [];
        this.started = false;

        return this;
    }

    next() {
        if (this.started) {
            this.app.async(() => {
                if (this.commands.length) {
                    let command = this.commands.shift();
                    let response = command(this);

                    if (response !== false) {
                        this.next();
                    }
                } else {
                    this.complete();
                }
            });
        }

        return this;
    }

    start() {
        if (!this.started) {
            this.started = true;

            this.app.async(() => this.next());
        }

        return this;
    }

    then(callback: Function) {
        if (!this.commands.length
            && !this.callbacks.length
        ) {
            this.app.async(callback);
        } else {
            this.callbacks.push(callback);
        }
    }

    private complete(after?: Function) {
        if (this.started && !this.commands.length) {
            this.then(() => {
                delete this.app.getMixin('queues').queues[this.name];

                this.reset();

                after && after();
            });

            this.app.callbacks(this.callbacks);

        } else if (after) {
            this.then(after);
        }

        return this;
    }
}