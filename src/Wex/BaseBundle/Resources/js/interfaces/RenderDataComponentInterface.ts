import RenderDataInterface from './RenderDataInterface';

export default interface RenderDataComponentInterface
  extends RenderDataInterface {
  id: string;
  initMode: string;
  options: any;
  renderRequestId: string;
}
