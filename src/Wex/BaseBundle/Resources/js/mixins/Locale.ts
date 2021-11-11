import MixinInterface from '../interfaces/MixinInterface';
import AppService from '../class/AppService';
import { format as StringFormat } from '../helpers/String';

const mixin: MixinInterface = {
  name: 'locale',

  service: class extends AppService {
    transDomains: object = {};

    trans(
      string = '',
      args = {},
      domains = this.transDomains,
      catalog = this.app.registry.layoutData.translations.catalog
    ) {
      let stringWithDomain;
      let sep = this.app.registry.layoutData.translationsDomainSeparator;

      // A domain is specified.
      if (string.indexOf(sep) !== -1) {
        if (string[0] === '@') {
          let exp = string.split(sep);
          let domainPart = exp[0].substr(1);
          if (domains[domainPart]) {
            stringWithDomain = domains[domainPart] + sep + exp[1];
          }
        } else {
          stringWithDomain = string;
        }
      }
      // Use default domain
      else {
        stringWithDomain = 'messages' + sep + string;
      }

      return StringFormat(catalog[stringWithDomain] || string, args);
    }
  },

  methods: {
    page: {
      trans(string = '', args = {}) {
        return this.app.locale.trans(string, args, this.translations.domains, {
          ...this.app.registry.layoutData.translations.catalog,
          ...this.translations.catalog,
        });
      },
    },
  },
};

export default mixin;
