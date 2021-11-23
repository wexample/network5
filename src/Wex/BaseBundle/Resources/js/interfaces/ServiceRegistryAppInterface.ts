import AssetsService from '../services/Assets';
import MixinsService from '../services/Mixins';
import PagesService from '../services/Pages';
import ResponsiveService from '../services/Responsive';
import ThemeService from '../services/Theme';

export default interface ServiceRegistryAppInterface {
  assets?: AssetsService;
  mixins?: MixinsService;
  pages?: PagesService;
  responsive?: ResponsiveService;
  theme?: ThemeService;
}
