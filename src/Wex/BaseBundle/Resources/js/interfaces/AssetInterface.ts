export default interface AssetsInterface {
  // Defines that assets should be rendered
  // event the loading process is not finished.
  active: boolean;
  context: string;
  id: string;
  media: string;
  name: string;
  path: string;
  preload: boolean;
  responsive?: string;
  // Defines that asset has been fully loaded once,
  // so browser will not load it again
  // if we append it again to document.
  rendered: boolean;
  theme?: string;
  type: string;
}
