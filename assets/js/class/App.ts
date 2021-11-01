import App from '../../../src/Wex/BaseBundle/Resources/js/class/App';
import MixinComponents from '../../../src/Wex/BaseBundle/Resources/js/mixins/Components';

export default class extends App {
    getMixins() {
        return {
            ...super.getMixins(),
            ...{
                MixinComponents
            }
        };
    }
}
