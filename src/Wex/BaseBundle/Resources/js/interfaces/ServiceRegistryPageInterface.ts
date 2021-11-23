import ServiceRegistryAppInterface from './ServiceRegistryAppInterface';
import EventsService from '../services/Events';
import PromptService from '../services/Prompts';
import AdaptiveService from '../services/Adaptive';
import ComponentsService from '../services/Components';

export interface ServiceRegistryPageInterface
  extends ServiceRegistryAppInterface {
  adaptive: AdaptiveService;
  events: EventsService;
  prompts: PromptService;
  components: ComponentsService;
}
