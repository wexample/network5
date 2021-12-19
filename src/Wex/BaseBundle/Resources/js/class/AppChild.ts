import App from './App';
import AppInterface from '../interfaces/ServiceRegistry/AppInterface';
import AsyncConstructor from './AsyncConstructor';

export default class extends AsyncConstructor {
  protected readonly app: App;
  protected readonly services: AppInterface;

  constructor(app: App) {
    super();

    this.app = app;
    this.services = app.services;
  }
}
