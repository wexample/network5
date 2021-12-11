import AssetsService from '../services/Assets';
import MixinsService from '../services/Mixins';
import PagesService from '../services/Pages';
import ResponsiveService from '../services/Responsive';
import ThemeService from '../services/Theme';
import EventsService from '../services/Events';

export default interface ServiceRegistryAppInterface {
  assets?: AssetsService;
  events?: EventsService;
  mixins?: MixinsService;
  pages?: PagesService;
  responsive?: ResponsiveService;
  theme?: ThemeService;
}
