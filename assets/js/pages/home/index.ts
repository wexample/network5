import Page from "../../../../src/Wex/BaseBundle/Resources/js/class/Page";
import AssetBundleInterface from "../../../../src/Wex/BaseBundle/Resources/js/interfaces/AssetBundleInterface";

const bundle: AssetBundleInterface = {
    bundleGroup: 'page',

    definition: class extends Page {
        init() {
            // TODO Rewrite new Manager();
        }
    }
};

export default bundle;
