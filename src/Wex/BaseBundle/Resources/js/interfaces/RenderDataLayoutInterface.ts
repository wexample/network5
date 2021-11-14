import RenderDataInterface from './RenderDataInterface';
import RenderDataPageInterface from './RenderDataPageInterface';
import RenderDataComponentInterface from "./RenderDataComponentInterface";

export default interface RenderDataLayoutInterface extends RenderDataInterface {
  displayBreakpoints?: object;
  components?: RenderDataComponentInterface[];
  env: string;
  page: RenderDataPageInterface;
  theme: string;
  translationsDomainSeparator: string;
}
