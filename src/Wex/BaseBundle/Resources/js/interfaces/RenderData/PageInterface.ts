import RenderDataInterface from './RenderDataInterface';
import PageManagerComponent from '../../class/PageManagerComponent';

export default interface PageInterface extends RenderDataInterface {
  body: string;
  components: any;
  el: HTMLElement;
  isInitialPage: boolean;
}
