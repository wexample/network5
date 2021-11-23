import AppService from "../class/AppService";
import PagesService from "./Pages";
import MixinsAppService from "../class/MixinsAppService";

export default class VueService extends AppService {
  public static dependencies: typeof AppService[] = [
    PagesService,
  ]

  registerHooks(): { app?: {}; page?: {} } {
    return {
      app: {
        init(registry) {
          // Wait for vue to be loaded.
          if (
            registry.assets === MixinsAppService.LOAD_STATUS_COMPLETE &&
            registry.pages === MixinsAppService.LOAD_STATUS_COMPLETE
          ) {
            return MixinsAppService.LOAD_STATUS_COMPLETE;
          }
          return MixinsAppService.LOAD_STATUS_WAIT;
        },
      },
    };
  }
};
