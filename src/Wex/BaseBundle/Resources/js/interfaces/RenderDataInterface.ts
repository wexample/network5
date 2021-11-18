import AssetsCollectionInterface from './AssetsCollectionInterface';
import RenderDataComponentInterface from './RenderDataComponentInterface';

export default interface RenderDataInterface {
  assets: AssetsCollectionInterface;
  components: RenderDataComponentInterface[];
  renderRequestId: string;
  translations: {
    catalog: object;
    domain: string;
  };
  vars: object;
  templates: string;
}
