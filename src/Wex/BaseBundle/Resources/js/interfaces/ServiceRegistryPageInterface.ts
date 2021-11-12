import { ServiceRegistryAppInterface } from './ServiceRegistryAppInterface';
import { EventsService } from '../mixins/Events';
import { PromptService } from '../mixins/Prompts';
import { AdaptiveService } from '../mixins/Adaptive';

export interface ServiceRegistryPageInterface
  extends ServiceRegistryAppInterface {
  adaptive: AdaptiveService;
  events: EventsService;
  prompts: PromptService;
}
