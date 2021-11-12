import { QueuesService } from '../mixins/Queues';
import AppChild from './AppChild';
import { ServiceRegistryAppInterface } from '../interfaces/ServiceRegistryAppInterface';

interface ServiceRegistryQueueInterface extends ServiceRegistryAppInterface {
  queues: QueuesService;
}

export default class Queue extends AppChild {
  public callbacks: Function[] = [];
  public commands: Function[] = [];
  private readonly name: string;
  public started: boolean = false;
  public static readonly EXEC_STOP = 'exec_stop';
  protected readonly services: ServiceRegistryQueueInterface;

  constructor(service: QueuesService, name: string) {
    super(service.app);

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

          if (response !== Queue.EXEC_STOP) {
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
    if (!this.commands.length && !this.callbacks.length) {
      this.app.async(callback);
    } else {
      this.callbacks.push(callback);
    }
  }

  private complete(after?: Function) {
    if (this.started && !this.commands.length) {
      this.then(() => {
        delete this.services.queues[this.name];

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
