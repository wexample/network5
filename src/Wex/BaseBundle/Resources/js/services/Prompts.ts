import AppService from '../class/AppService';
import LocaleService from "./Locale";

export default class PromptService extends AppService {
  public static dependencies: typeof AppService[] = [LocaleService];
  protected service: PromptService;

  systemError(message, args = {}, debugData: any = null) {
    message = this.services.locale.trans(message, args);
    console.error(message);

    if (debugData) {
      console.warn(debugData);
    }
  }
}
