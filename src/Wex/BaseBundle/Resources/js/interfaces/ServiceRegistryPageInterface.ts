import ServiceRegistryAppInterface from './ServiceRegistryAppInterface';
import { EventsService } from '../mixins/Events';
import { PromptService } from '../mixins/Prompts';
import { AdaptiveService } from '../mixins/Adaptive';
import { ComponentsService } from '../mixins/Components';

export interface ServiceRegistryPageInterface
  extends ServiceRegistryAppInterface {
  adaptive: AdaptiveService;
  events: EventsService;
  prompts: PromptService;
  components: ComponentsService;
}
