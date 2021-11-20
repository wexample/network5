import App from '../../class/App';
import { MixinDebug } from "../../../../src/Wex/BaseBundle/Resources/js/mixins/Debug";
import MixinInterface from "../../../../src/Wex/BaseBundle/Resources/js/interfaces/MixinInterface";

class AppPublic extends App {
  getMixins(): MixinInterface[] {
    return super.getMixins().concat([MixinDebug]);
  }
}

new AppPublic();
