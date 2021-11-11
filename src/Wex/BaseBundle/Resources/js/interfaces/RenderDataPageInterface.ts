import RenderDataInterface from './RenderDataInterface';

export default interface RenderDataPageInterface extends RenderDataInterface {
  components: any;
  el: HTMLElement;
  isLayoutPage: boolean;
  name: string;
}
