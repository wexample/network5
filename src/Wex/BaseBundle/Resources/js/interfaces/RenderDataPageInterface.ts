import RenderDataInterface from './RenderDataInterface';
import PageHandlerComponent from '../class/PageHandlerComponent';

export default interface RenderDataPageInterface extends RenderDataInterface {
  body: string;
  components: any;
  el: HTMLElement;
  isInitialPage: boolean;
  pageHandler: PageHandlerComponent;
}
