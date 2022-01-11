import AppService from '../class/AppService';
import LocaleService from './LocaleService';

export default class PromptService extends AppService {
  public static dependencies: typeof AppService[] = [LocaleService];
  protected service: PromptService;

  systemError(
    message,
    args: {} = {},
    debugData: any = null,
    fatal: boolean = false
  ) {
    message = this.services.locale.trans(message, args);

    if (fatal) {
      throw new Error(message);
    } else {
      console.error(message);
    }

    if (debugData) {
      console.warn(debugData);
    }
  }
}
