import RenderDataInterface from './RenderDataInterface';
import PageInterface from './PageInterface';
import ComponentInterface from './ComponentInterface';

export default interface LayoutInterface extends RenderDataInterface {
  displayBreakpoints?: object;
  components: ComponentInterface[];
  env: string;
  page: PageInterface;
  colorScheme: string;
  translationsDomainSeparator: string;
  vueTemplates?: string[]
}
