import {MDCRipple} from '@material/ripple/index';

document.addEventListener('DOMContentLoaded', () => {
  const ripple = new MDCRipple(document.querySelector('.foo-button'));
})

export default {
  classType: 'pages',
};
