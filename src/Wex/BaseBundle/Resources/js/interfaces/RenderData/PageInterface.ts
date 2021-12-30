import RenderDataInterface from './RenderDataInterface';

export default interface PageInterface extends RenderDataInterface {
  body: string;
  components: any;
  el: HTMLElement;
  isInitialPage: boolean;
}
