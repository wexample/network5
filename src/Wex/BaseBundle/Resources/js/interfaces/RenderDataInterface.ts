import AssetsCollectionInterface from './AssetsCollectionInterface';

export default interface RenderDataInterface {
  assets: AssetsCollectionInterface;
  translations: {
    catalog: object;
    domain: string;
  };
  vars: object;
}
