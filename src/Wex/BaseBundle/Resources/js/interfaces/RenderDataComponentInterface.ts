import RenderDataInterface from './RenderDataInterface';

export default interface RenderDataComponentInterface
  extends RenderDataInterface {
  id: string;
  initMode: string;
  name: string;
  options: any;
  renderRequestId: string;
}
