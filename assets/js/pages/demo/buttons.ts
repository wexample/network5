import {MDCRipple} from '@material/ripple/index';
import Page from "../../../../src/Wex/BaseBundle/Resources/js/class/Page";
import AssetBundleInterface from "../../../../src/Wex/BaseBundle/Resources/js/interface/AssetBundleInterface";

const bundle: AssetBundleInterface = {
    classContext: 'page',

    definition: class extends Page {
        init() {
            // TODO cleanup
            const ripple = new MDCRipple(document.querySelector('.foo-button'));
        }
    }
};

export default bundle;

