import Page from "../../../../src/Wex/BaseBundle/Resources/js/class/Page";
import UnitTest from "../../../../src/Wex/BaseBundle/Resources/js/class/UnitTest";
import AssetBundleInterface from "../../../../src/Wex/BaseBundle/Resources/js/interfaces/AssetBundleInterface";

const bundle: AssetBundleInterface = {
    bundleGroup: 'page',

    definition: class extends Page {
        unitTest: UnitTest

        init() {

        }
    }
};

export default bundle;

