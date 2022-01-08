import App from './App';
import AppChild from './AppChild';

export default class AppService extends AppChild {
  public app: App;
  public services: any = {};
  public name: string;
  public static dependencies: typeof AppService[] = [];

  constructor(app: App) {
    super(app);

    this.services = this.app.services;
    this.name = this.app.buildServiceName(this.constructor.name);
  }

  registerHooks(): { app?: {}; page?: {} } {
    return {};
  }

  registerMethods(object: any, group: string) {
    return {};
  }
}
