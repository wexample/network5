import App from './App';
import { ServiceRegistryAppInterface } from '../interfaces/ServiceRegistryAppInterface';

export default class {
  protected readonly app: App;
  protected readonly services: ServiceRegistryAppInterface;

  constructor(app) {
    this.app = app;
    this.services = app.services;
  }
}
