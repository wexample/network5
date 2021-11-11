import RenderDataInterface from './RenderDataInterface';

export default interface PageRenderDataInterface extends RenderDataInterface {
  components: any;
  el: HTMLElement;
  isLayoutPage: boolean;
  name: string;
}
