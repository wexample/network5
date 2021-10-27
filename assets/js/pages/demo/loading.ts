import UnitTest from "../../../../src/Wex/BaseBundle/Resources/js/class/Tests/UnitTest";
import {MDCRipple} from '@material/ripple/index';

export default {
    classContext: 'page',

    init() {
        this.unitTest = new UnitTest();
        // TODO cleanup
        document.querySelectorAll('.button')
            .forEach(el => new MDCRipple(el));
    },
};
