import App from './App';
import ServiceRegistryAppInterface from '../interfaces/ServiceRegistryAppInterface';
import AsyncConstructor from './AsyncConstructor';

export default class extends AsyncConstructor {
  protected readonly app: App;
  protected readonly services: ServiceRegistryAppInterface;

  constructor(app: App) {
    super();

    this.app = app;
    this.services = app.services;
  }
}
