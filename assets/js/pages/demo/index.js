import {MDCRipple} from '@material/ripple/index';

// TODO cleanup
document.addEventListener('DOMContentLoaded', () => {
  const ripple = new MDCRipple(document.querySelector('.foo-button'));
})

export default {
  classType: 'pages',
};
