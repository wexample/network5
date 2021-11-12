import App from './App';

export default class AppService {
  public app: App;
  public services: any = {};

  constructor(app: App) {
    this.app = app;
    this.services = this.app.services;
  }

  registerServices(services: string[]) {
    services.forEach((name) => {
      this.services[name] = this.app.services[name];
    });
  }
}
