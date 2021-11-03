import Page from "../../../../src/Wex/BaseBundle/Resources/js/class/Page";
import AssetBundleInterface from "../../../../src/Wex/BaseBundle/Resources/js/interfaces/AssetBundleInterface";

const bundle: AssetBundleInterface = {
    bundleGroup: 'page',

    definition: class extends Page {
        init() {
            console.log('Home init');
        }
    }
};

export default bundle;
