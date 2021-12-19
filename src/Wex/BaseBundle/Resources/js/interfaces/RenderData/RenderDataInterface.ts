import AssetsCollectionInterface from '../AssetsCollectionInterface';
import ComponentInterface from './ComponentInterface';
import TranslationsInterface from '../TranslationsInterface';

export default interface RenderDataInterface {
  assets: AssetsCollectionInterface;
  components: ComponentInterface[];
  renderRequestId: string;
  translations: TranslationsInterface;
  vars: object;
  templates: string;
  name: string;
}
