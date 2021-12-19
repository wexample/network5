import ServiceRegistryAppInterface from './ServiceRegistryAppInterface';
import EventsService from '../services/EventsService';
import PromptService from '../services/PromptsService';
import AdaptiveService from '../services/AdaptiveService';
import ComponentsService from '../services/ComponentsService';

export interface ServiceRegistryPageInterface
  extends ServiceRegistryAppInterface {
  adaptive: AdaptiveService;
  events: EventsService;
  prompt: PromptService;
  components: ComponentsService;
}
