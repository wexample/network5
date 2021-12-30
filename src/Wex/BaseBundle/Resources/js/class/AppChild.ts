import App from './App';
import AsyncConstructor from './AsyncConstructor';
import AppInterface from '../interfaces/ServicesRegistryInterface';

export default class extends AsyncConstructor {
  protected readonly app: App;
  protected readonly services: AppInterface;

  constructor(app: App) {
    super();

    this.app = app;
    this.services = app.services;
  }
}
