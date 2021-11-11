import App from '../../../src/Wex/BaseBundle/Resources/js/class/App';
import MixinComponents from '../../../src/Wex/BaseBundle/Resources/js/mixins/Components';
import MixinInterface from "../../../src/Wex/BaseBundle/Resources/js/interfaces/MixinInterface";

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
