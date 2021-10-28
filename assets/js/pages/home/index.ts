import Manager from "../../class/MouseTail/Manager";
import Page from "../../../../src/Wex/BaseBundle/Resources/js/class/Page";
import AssetBundleInterface from "../../../../src/Wex/BaseBundle/Resources/js/interface/AssetBundleInterface";

const bundle: AssetBundleInterface = {
    classContext: 'page',

    definition: class extends Page {
        init() {
            // TODO Rewrite new Manager();
        }
    }
};

export default bundle;
