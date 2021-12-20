import AssetsService from '../../services/AssetsService';
import MixinsService from '../../services/MixinsService';
import PagesService from '../../services/PagesService';
import ResponsiveService from '../../services/ResponsiveService';
import ColorSchemeService from '../../services/ColorSchemeService';
import EventsService from '../../services/EventsService';
import LayoutsService from '../../services/LayoutsService';

export default interface AppInterface {
  assets?: AssetsService;
  events?: EventsService;
  layouts?: LayoutsService;
  mixins?: MixinsService;
  pages?: PagesService;
  responsive?: ResponsiveService;
  colorScheme?: ColorSchemeService;
}