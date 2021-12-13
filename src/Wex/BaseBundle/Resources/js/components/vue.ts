import Component from '../class/Component';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';
import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';

export default {
  bundleGroup: 'component',

  definition: class extends Component {
    loadRenderData(
      renderData: RenderDataComponentInterface,
      requestOptions: RequestOptionsInterface
    ) {
      super.loadRenderData(renderData, requestOptions);

      let vueApp = this.app.services['vue']
        .createVueAppForComponent(
          renderData.options.path,
          renderData,
          requestOptions
        );

      vueApp.mount(this.el);
    }
  },
};
