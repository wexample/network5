import AssetsService from "../services/AssetsService";
import AdaptiveService from "../services/AdaptiveService";
import ColorSchemeService from "../services/ColorSchemeService";
import EventsService from "../services/EventsService";
import LayoutsService from "../services/LayoutsService";
import MixinsService from "../services/MixinsService";
import ModalsService from "../services/ModalsService";
import PagesService from "../services/PagesService";
import ResponsiveService from "../services/ResponsiveService";
import PromptService from "../services/PromptsService";
import RoutingService from "../services/RoutingService";
import ComponentsService from "../services/ComponentsService";

export default interface AppInterface {
  assets?: AssetsService;
  adaptive?: AdaptiveService;
  colorScheme?: ColorSchemeService;
  components?: ComponentsService;
  events?: EventsService;
  layouts?: LayoutsService;
  mixins?: MixinsService;
  modals?: ModalsService;
  pages?: PagesService;
  responsive?: ResponsiveService;
  prompt?: PromptService;
  routing?: RoutingService;
}