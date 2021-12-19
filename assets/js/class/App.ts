import App from '../../../src/Wex/BaseBundle/Resources/js/class/App';
import AppService from '../../../src/Wex/BaseBundle/Resources/js/class/AppService';
import DebugService from '../../../src/Wex/BaseBundle/Resources/js/services/DebugService';
import VueService from '../../../src/Wex/BaseBundle/Resources/js/services/VueService';

export default class extends App {
  getServices(): typeof AppService[] {
    return [...super.getServices(), ...[VueService, DebugService]];
  }
}

// TODO On en est pas ici du tout.
//      > A noter qu'on a créé un moyer récement de charger juste une vue via l'api (system_vue_entity_load)
//        et qu'il faut soit garder le système, soit l'étendre à d'autres composants.
//      > On peut aussi peut être différencier API de l'AJAX
//        - API => API Platform, liste d'assets, etc
//        - AJAX => Requètes variables, composants JS, actions success / fails
