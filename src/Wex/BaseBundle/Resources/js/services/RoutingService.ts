import Routing from '../../../../../../vendor/friendsofsymfony/jsrouting-bundle/Resources/public/js/router.min.js';
import AppService from '../class/AppService';

export default class RoutingService extends AppService {
  registerHooks() {
    return {
      app: {
        hookInit() {
          Routing.setRoutingData(
            require('../../../../../../public/js/fos_js_routes.json')
          );
        },
      },
    };
  }

  path(route: string, params: any = {}): string {
    return Routing.generate(route, params);
  }
}
