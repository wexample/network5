import Component from '../class/Component';
import ComponentInterface from '../interfaces/RenderData/ComponentInterface';

export default class extends Component {
  loadRenderData(renderData: ComponentInterface) {
    super.loadRenderData(renderData);

    if (!this.app.services['vue']) {
      this.services['prompt'].systemError(
        'page_message.error.vue_service_missing',
        {},
        renderData
      );

      return;
    }

    this.app.services['vue']
      .createVueAppForComponent(this, renderData)
      .mount(this.el);
  }
}
