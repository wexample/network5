import Component from '../class/Component';

export default class extends Component {
  protected interval: any;
  protected onIntervalProxy: Function;
  protected elBlink: HTMLElement;

  async init() {
    await super.init();

    this.app.layout.vars.testComponentLoaded = true;

    let el = this.el.querySelector('.test-component-test-js') as HTMLElement;
    el.style.backgroundColor = 'green';

    this.elBlink = this.el.querySelector('.test-blink');
    this.onIntervalProxy = this.onInterval.bind(this);
    this.interval = setInterval(this.onIntervalProxy, 1000);
  }

  async exit() {
    await super.exit();

    delete this.app.layout.vars.testComponentLoaded;
  }

  onInterval() {
    this.elBlink.style.display =
      this.elBlink.style.display ===
      'none' ? 'inline' : 'none';
  }
}
