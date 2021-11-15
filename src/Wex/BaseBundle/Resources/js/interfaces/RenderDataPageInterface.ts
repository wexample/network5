import RenderDataInterface from './RenderDataInterface';

export default interface RenderDataPageInterface extends RenderDataInterface {
  body: string;
  components: any;
  el: HTMLElement;
  isLayoutPage: boolean;
  name: string;
}
