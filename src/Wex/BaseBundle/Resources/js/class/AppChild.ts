import App from './App';
import AsyncConstructor from './AsyncConstructor';
import ServicesRegistryInterface from '../interfaces/ServicesRegistryInterface';

export default class extends AsyncConstructor {
  protected readonly services: ServicesRegistryInterface;

  constructor(protected readonly app: App) {
    super();

    this.app = app;
    this.services = app.services;
  }
}
