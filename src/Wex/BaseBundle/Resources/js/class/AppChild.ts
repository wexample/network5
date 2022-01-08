import App from './App';
import AsyncConstructor from './AsyncConstructor';
import AppInterface from '../interfaces/ServicesRegistryInterface';

export default class extends AsyncConstructor {
  protected readonly services: AppInterface;

  constructor(protected readonly app: App) {
    super();

    this.app = app;
    this.services = app.services;
  }
}
