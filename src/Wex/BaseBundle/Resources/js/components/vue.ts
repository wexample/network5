import Component from '../class/Component';

export default class extends Component {
  attachHtmlElements() {
    super.attachHtmlElements();

    if (!this.app.services['vue']) {
      this.services['prompt'].systemError(
        'page_message.error.vue_service_missing',
      );

      return;
    }

    this.app.services['vue']
      .createVueAppForComponent(this)
      .mount(this.el);
  }
}
