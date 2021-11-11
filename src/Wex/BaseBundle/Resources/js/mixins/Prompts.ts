import AppService from '../class/AppService';
import MixinLocale from './Locale';

export default {
  name: 'prompts',

  dependencies: [
    MixinLocale,
  ],

  service: class extends AppService {
    systemError(message, args = {}, debugData: any = null) {
      message = this.app.getService('locale').trans(message, args);
      console.error(message);

      if (debugData) {
        console.warn(debugData);
      }
    }
  },
};
