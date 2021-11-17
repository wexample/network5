import ServiceRegistryAppInterface from './ServiceRegistryAppInterface';
import { ComponentsService } from '../mixins/Components';

export interface ServiceRegistryComponentInterface
  extends ServiceRegistryAppInterface {
  components: ComponentsService;
}