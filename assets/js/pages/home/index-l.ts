import PageResponsiveBreakpoint from "../../../../src/Wex/BaseBundle/Resources/js/class/PageResponsiveBreakpoint";
import AssetBundleInterface from "../../../../src/Wex/BaseBundle/Resources/js/interface/AssetBundleInterface";

const bundle: AssetBundleInterface = {
    classContext: 'page',

    definition: class extends PageResponsiveBreakpoint {
        onResponsiveEnter() {
            console.log('index l init');
        }

        onResponsiveExit() {
            console.log('index l exit');
        }
    }
};

export default bundle;

