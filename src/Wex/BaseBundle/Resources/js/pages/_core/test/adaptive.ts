import Page from '../../../class/Page';

export default class extends Page {
  async init(): Promise<void> {
    await super.init();

    let el = this.el.querySelector('.adaptive-page-test-js') as HTMLElement;
    el.style.backgroundColor = 'green';
  }
}
