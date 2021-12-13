import AppService from '../class/AppService';
import { icon as faIcon, library as faLibrary } from '@fortawesome/fontawesome-svg-core'

export default class IconsService extends AppService {
  add(icon) {
    faLibrary.add.apply(faLibrary, arguments);
  }

  render(icon) {
    this.add(icon);

    return faIcon(icon).html;
  }
}
