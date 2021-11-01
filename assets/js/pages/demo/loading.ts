import {MDCRipple} from '@material/ripple/index';
import Page from "../../../../src/Wex/BaseBundle/Resources/js/class/Page";
import UnitTest from "../../../../src/Wex/BaseBundle/Resources/js/class/UnitTest";
import AssetBundleInterface from "../../../../src/Wex/BaseBundle/Resources/js/interface/AssetBundleInterface";

const bundle: AssetBundleInterface = {
    classContext: 'page',

    definition: class extends Page {
        unitTest: UnitTest

        init() {
            this.unitTest = new UnitTest();
            // TODO cleanup
            document.querySelectorAll('.button')
                .forEach(el => new MDCRipple(el));
        }
    }
};

export default bundle;

