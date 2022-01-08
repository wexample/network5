import AssetsService from '../services/AssetsService';
import AdaptiveService from '../services/AdaptiveService';
import ColorSchemeService from '../services/ColorSchemeService';
import EventsService from '../services/EventsService';
import LayoutsService from '../services/LayoutsService';
import MixinsService from '../services/MixinsService';
import ModalsService from '../services/ModalsService';
import PagesService from '../services/PagesService';
import ResponsiveService from '../services/ResponsiveService';
import PromptService from '../services/PromptsService';
import RoutingService from '../services/RoutingService';
import ComponentsService from '../services/ComponentsService';
import VueService from '../services/VueService';
import DebugService from '../services/DebugService';
import LocaleService from '../services/LocaleService';
import RenderNodeService from '../services/RenderNodeService';

export default interface AppInterface {
  adaptive?: AdaptiveService;
  assets?: AssetsService;
  colorScheme?: ColorSchemeService;
  components?: ComponentsService;
  debug?: DebugService;
  events?: EventsService;
  layouts?: LayoutsService;
  locale?: LocaleService;
  mixins?: MixinsService;
  modals?: ModalsService;
  pages?: PagesService;
  prompt?: PromptService;
  responsive?: ResponsiveService;
  renderNode?: RenderNodeService;
  routing?: RoutingService;
  vue?: VueService;
}
