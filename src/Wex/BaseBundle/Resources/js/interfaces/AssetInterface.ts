export default interface AssetsInterface {
  // Defines that assets should be rendered
  // even the loading process is not finished.
  active: boolean;
  colorScheme?: string;
  filesize: number;
  el: HTMLElement;
  id: string;
  initial: string;
  media: string;
  loaded: boolean;
  name: string;
  path: string;
  preload: boolean;
  resolver: Function;
  renderContext: string;
  responsive?: string;
  // Defines that asset has been fully loaded once,
  // so browser will not load it again
  // if we append it again to document.
  rendered: boolean;
  type: string;
  usage?: string;
}
