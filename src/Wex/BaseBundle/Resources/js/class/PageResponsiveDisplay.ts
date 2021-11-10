import Page from './Page';
import AppChild from './AppChild';
import PageRenderDataInterface from '../interfaces/PageRenderDataInterface';

export default class extends AppChild {
  protected readonly page: Page;

  constructor(page) {
    super(page.app);
    this.page = page;
  }

  init(renderData: PageRenderDataInterface) {
    // To override...
  }
}
