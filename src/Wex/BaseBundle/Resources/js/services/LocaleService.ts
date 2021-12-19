import AppService from '../class/AppService';
import { format as StringFormat } from '../helpers/String';

export default class LocaleService extends AppService {
  public transDomains: object = {};

  registerMethods() {
    return {
      page: {
        trans(string = '', args = {}) {
          return this.app.locale.trans(
            string,
            args,
            this.translations.domains,
            {
              ...this.app.layout.renderData.translations.catalog,
              ...this.translations.catalog,
            }
          );
        },
      },
    };
  }

  trans(
    string = '',
    args = {},
    domains = this.transDomains,
    catalog = this.app.layout.renderData.translations.catalog
  ) {
    let stringWithDomain;
    let sep = this.app.layout.renderData.translationsDomainSeparator;

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
}
