import PageResponsiveBreakpoint from "../../../../src/Wex/BaseBundle/Resources/js/class/PageResponsiveBreakpoint";
import AssetBundleInterface from "../../../../src/Wex/BaseBundle/Resources/js/interface/AssetBundleInterface";

const bundle: AssetBundleInterface = {
    classContext: 'page',

    definition: class extends PageResponsiveBreakpoint {
        onResponsiveEnter() {
            console.log('index m init');
        }

        onResponsiveExit() {
            console.log('index m exit');
        }
    }
};

export default bundle;

