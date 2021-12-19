import PageResponsiveDisplay from '../../../../src/Wex/BaseBundle/Resources/js/class/PageResponsiveDisplay';

export default class extends PageResponsiveDisplay {
  onResponsiveEnter() {
    console.log('index m init');
  }

  onResponsiveExit() {
    console.log('index m exit');
  }
};
