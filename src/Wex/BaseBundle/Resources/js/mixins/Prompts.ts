import AppService from '../class/AppService';
import MixinInterface from "../interfaces/MixinInterface";

import {MixinLocale} from './Locale';

export class PromptService extends AppService {
  systemError(message, args = {}, debugData: any = null) {
    message = this.services.locale.trans(message, args);
    console.error(message);

    if (debugData) {
      console.warn(debugData);
    }
  }
}

export const MixinPrompts: MixinInterface = {
  name: 'prompts',

  dependencies: [
    MixinLocale,
  ],

  service: PromptService,
};
