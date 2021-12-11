import Component from '../class/Component';
import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';

export default {
  bundleGroup: 'component',

  definition: class extends Component {
    loadRenderData(
      renderData: RenderDataComponentInterface,
      requestOptions: RequestOptionsInterface
    ) {
      // TODO

      super.loadRenderData(renderData, requestOptions);
    }
  },
};
