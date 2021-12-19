import AppInterface from './AppInterface';
import ComponentsService from '../../services/ComponentsService';

export interface ComponentInterface extends AppInterface {
  components: ComponentsService;
}
