import AppService from '../class/AppService';
import { format as StringFormat } from '../helpers/String';

export default class LocaleService extends AppService {
  registerMethods() {
    return {
      renderNode: {
        trans(string: string = '', args: {} = {}) {
          return this.app.services.locale.trans(string, args, {
            ...this.app.layout.translations,
            ...this.translations,
          });
        },
      },
      vue: {
        methods: {
          trans() {
            return this.rootComponent.trans.apply(
              this.rootComponent,
              arguments
            );
          },
        }
      }
    };
  }

  trans(
    string: string = '',
    args: {} = {},
    catalog: object = this.app.layout.translations
  ) {
    return StringFormat(catalog[string] || string, args);
  }
}
