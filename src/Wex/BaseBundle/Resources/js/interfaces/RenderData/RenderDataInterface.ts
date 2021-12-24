import AssetsCollectionInterface from '../AssetsCollectionInterface';
import ComponentInterface from './ComponentInterface';
import TranslationsInterface from '../TranslationsInterface';
import RequestOptionsInterface from '../RequestOptions/RequestOptionsInterface';

export default interface RenderDataInterface {
  assets: AssetsCollectionInterface;
  components: ComponentInterface[];
  id: string;
  name: string;
  renderRequestId: string;
  requestOptions?: RequestOptionsInterface;
  translations: TranslationsInterface;
  vars: object;
  templates: string;
}
