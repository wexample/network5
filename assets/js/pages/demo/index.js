import {MDCRipple} from '@material/ripple/index';

export default {
    classType: 'pages',

    init() {
        // TODO cleanup
        const ripple = new MDCRipple(document.querySelector('.foo-button'));
    }
};
