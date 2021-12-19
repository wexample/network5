import AssetsService from '../services/AssetsService';
import MixinsService from '../services/MixinsService';
import PagesService from '../services/PagesService';
import ResponsiveService from '../services/ResponsiveService';
import ThemeService from '../services/ThemeService';
import EventsService from '../services/EventsService';
import LayoutsService from '../services/LayoutsService';

export default interface ServiceRegistryAppInterface {
  assets?: AssetsService;
  events?: EventsService;
  layouts?: LayoutsService;
  mixins?: MixinsService;
  pages?: PagesService;
  responsive?: ResponsiveService;
  theme?: ThemeService;
}
