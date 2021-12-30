import Layout from './Layout';

export default class extends Layout {
  public id: string = 'layout-initial';

  attachHtmlElements() {
    this.el = document.getElementById('layout');
  }
}
