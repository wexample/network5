import PageResponsiveDisplay from '../../../../src/Wex/BaseBundle/Resources/js/class/PageResponsiveDisplay';

export default class extends PageResponsiveDisplay {
  onResponsiveEnter() {
    console.log('index l init');
  }

  onResponsiveExit() {
    console.log('index l exit');
  }
}
