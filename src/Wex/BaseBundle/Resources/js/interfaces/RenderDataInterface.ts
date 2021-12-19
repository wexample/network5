import AssetsCollectionInterface from './AssetsCollectionInterface';
import RenderDataComponentInterface from './RenderDataComponentInterface';
import TranslationsInterface from './TranslationsInterface';

export default interface RenderDataInterface {
  assets: AssetsCollectionInterface;
  components: RenderDataComponentInterface[];
  renderRequestId: string;
  translations: TranslationsInterface;
  vars: object;
  templates: string;
  name: string;
}
