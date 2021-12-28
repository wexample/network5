import Component from '../class/Component';

export default class extends Component {
  async init() {
    await super.init();

    this.app.layout.vars.testComponentLoaded = true;

    let el = this.el.querySelector('.test-component-test-js') as HTMLElement;
    el.style.backgroundColor = 'green';
  }

  async exit() {
    await super.exit();

    delete this.app.layout.vars.testComponentLoaded;
  }
}
