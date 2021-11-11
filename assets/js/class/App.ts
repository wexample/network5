import App from '../../../src/Wex/BaseBundle/Resources/js/class/App';
import MixinInterface from "../../../src/Wex/BaseBundle/Resources/js/interfaces/MixinInterface";
import {MixinComponents} from '../../../src/Wex/BaseBundle/Resources/js/mixins/Components';

export default class extends App {
  getMixins(): MixinInterface[] {
    return [
      ...super.getMixins(),
      ...[
        MixinComponents,
      ],
    ];
  }
}
