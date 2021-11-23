import App from '../../../src/Wex/BaseBundle/Resources/js/class/App';
import AppService from '../../../src/Wex/BaseBundle/Resources/js/class/AppService';
import DebugService from '../../../src/Wex/BaseBundle/Resources/js/services/Debug';
import VueService from "../../../src/Wex/BaseBundle/Resources/js/services/Vue";

export default class extends App {
  getServices(): typeof AppService[] {
    return [
      ...super.getServices(),
      ...[
        VueService,
        DebugService,
      ]
    ];
  }
}
