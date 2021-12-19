import ServiceRegistryAppInterface from './ServiceRegistryAppInterface';
import ComponentsService from '../services/ComponentsService';

export interface ServiceRegistryComponentInterface
  extends ServiceRegistryAppInterface {
  components: ComponentsService;
}
