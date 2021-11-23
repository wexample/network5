import App from '../../../src/Wex/BaseBundle/Resources/js/class/App';
import AppService from '../../../src/Wex/BaseBundle/Resources/js/class/AppService';
import DebugService from '../../../src/Wex/BaseBundle/Resources/js/services/Debug';

export default class extends App {
  getMixins(): typeof AppService[] {
    return super.getServices().concat([DebugService]);
  }
}
