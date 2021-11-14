import { AssetsService } from '../mixins/Assets';
import { MixinService } from '../mixins/Mixins';
import { PagesService } from '../mixins/Pages';
import { ResponsiveService } from '../mixins/Responsive';
import { ThemeService } from '../mixins/Theme';

export default interface ServiceRegistryAppInterface {
  assets?: AssetsService;
  mixins?: MixinService;
  pages?: PagesService;
  responsive?: ResponsiveService;
  theme?: ThemeService;
}
