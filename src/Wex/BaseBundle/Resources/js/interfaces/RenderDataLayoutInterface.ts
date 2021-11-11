import RenderDataInterface from './RenderDataInterface';
import RenderDataPageInterface from './RenderDataPageInterface';

export default interface RenderDataLayoutInterface extends RenderDataInterface {
  displayBreakpoints?: object;
  env: string;
  page: RenderDataPageInterface;
  theme: string;
  translationsDomainSeparator: string;
}
