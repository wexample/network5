import App from './App';

export default class AppService {
  public app: App;
  public services: any = {};
  public name: string;
  public static dependencies: typeof AppService[] = [];

  constructor(app: App) {
    this.app = app;
    this.services = this.app.services;
    this.name = this.app.buildServiceName(this.constructor.name);
  }

  registerHooks(): { app?: {}; page?: {} } {
    return {};
  }

  registerMethods() {
    return {};
  }
}
