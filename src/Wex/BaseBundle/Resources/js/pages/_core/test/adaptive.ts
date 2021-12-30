import Page from '../../../class/Page';

export default class extends Page {
  async mounted(): Promise<void> {
    await super.mounted();

    let el = this.el.querySelector('.adaptive-page-test-js') as HTMLElement;
    el.style.backgroundColor = 'green';
  }
}
