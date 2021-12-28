import App from './App';
import AppService from './AppService';
import VueService from '../services/VueService';

export default class extends App {
  getServices(): typeof AppService[] {
    return [...super.getServices(), ...[VueService]];
  }
}
