import AssetsCollectionInterface from './AssetsCollectionInterface';

export default interface RenderDataInterface {
  assets: AssetsCollectionInterface;
  renderRequestId: string;
  translations: {
    catalog: object;
    domain: string;
  };
  vars: object;
  templates: string
}
