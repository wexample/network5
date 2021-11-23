import ServiceRegistryAppInterface from './ServiceRegistryAppInterface';
import ComponentsService from '../services/Components';

export interface ServiceRegistryComponentInterface
  extends ServiceRegistryAppInterface {
  components: ComponentsService;
}
