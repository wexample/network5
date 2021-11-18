import { QueuesService } from '../mixins/Queues';
import AppChild from './AppChild';
import ServiceRegistryAppInterface from '../interfaces/ServiceRegistryAppInterface';

interface ServiceRegistryQueueInterface extends ServiceRegistryAppInterface {
  queues: QueuesService;
}

export default class Queue extends AppChild {
  public async: boolean = false;
  public callbacks: Function[] = [];
  public commands: Function[] = [];
  private nextProxy: Function;
  private readonly name: string;
  private runningCounter: number = 0;
  public started: boolean = false;
  public static readonly EXEC_STOP = 'exec_stop';
  protected readonly services: ServiceRegistryQueueInterface;

  constructor(service: QueuesService, name: string) {
    super(service.app);

    this.name = name;
    this.nextProxy = this.next.bind(this);
  }

  add(command: Function) {
    this.commands.push(command);

    return this;
  }

  reset() {
    this.callbacks = [];
    this.commands = [];
    this.started = false;
    this.runningCounter = 0;

    return this;
  }

  next() {
    if (this.started) {
      if (this.async) {
        this.runningCounter--;

        if (this.runningCounter === 0) {
          this.complete();
        }
      } else {
        this.app.async(() => {
          if (this.commands.length) {
            this.execOneCommand();
          } else {
            this.complete();
          }
        });
      }
    }

    return this;
  }

  execOneCommand() {
    let command = this.commands.shift();
    let response = command(this.nextProxy, this);

    if (response !== Queue.EXEC_STOP) {
      this.next();
    }
  }

  start() {
    if (!this.started) {
      this.started = true;

      // Async mode will launch every command in the same time.
      if (this.async) {
        this.app.async(() => {
          while (this.commands.length) {
            this.runningCounter++;
            this.execOneCommand();
          }
        });
      } else {
        // Start first command.
        this.app.async(() => this.next());
      }
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
