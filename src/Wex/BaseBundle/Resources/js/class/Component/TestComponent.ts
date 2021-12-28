import Component from '../Component';

export default class extends Component {
  protected interval: any;
  protected onIntervalProxy: Function;
  protected elBlink: HTMLElement;
  protected suffix: string = '';

  async init() {
    await super.init();

    this.app.layout.vars.testComponentLoaded = true;

    let el = this.el.querySelector(`.test-component-test-js${this.suffix}`) as HTMLElement;
    el.style.backgroundColor = 'green';

    this.elBlink = this.el.querySelector(`.test-blink${this.suffix}`);
    this.onIntervalProxy = this.onInterval.bind(this);
    this.interval = setInterval(this.onIntervalProxy, 1000);

    let elTranslations = this.el.querySelector(`.test-component-string-translated-client${this.suffix}`) as HTMLElement;
    elTranslations.innerText = this.trans('@component::string.client_side');
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
