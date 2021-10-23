import {MDCRipple} from '@material/ripple/index';

export default {
    classContext: 'page',

    init() {
        // TODO cleanup
        const ripple = new MDCRipple(document.querySelector('.foo-button'));
    }
};
