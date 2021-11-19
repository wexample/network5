import RequestOptionsPageInterface from './RequestOptionsPageInterface';
import Page from '../class/Page';

export default interface RequestOptionsModalInterface
  extends RequestOptionsPageInterface {
  layout?: string;
  pageCalling?: Page;
}
