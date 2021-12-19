import AppInterface from './AppInterface';
import EventsService from '../../services/EventsService';
import PromptService from '../../services/PromptsService';
import AdaptiveService from '../../services/AdaptiveService';
import ComponentsService from '../../services/ComponentsService';

export interface PageInterface
  extends AppInterface {
  adaptive: AdaptiveService;
  events: EventsService;
  prompt: PromptService;
  components: ComponentsService;
}
