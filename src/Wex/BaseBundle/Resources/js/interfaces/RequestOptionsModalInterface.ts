import RequestOptionsPageInterface from './RequestOptionsPageInterface';
import Page from "../class/Page";

export default interface RequestOptionsModalInterface
  extends RequestOptionsPageInterface {
  callingPage?: Page
  layout?: string
}
