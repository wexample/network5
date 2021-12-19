import Page from './Page';
import AppChild from './AppChild';
import PageInterface from '../interfaces/RenderData/PageInterface';

export default class extends AppChild {
  protected readonly page: Page;

  constructor(page) {
    super(page.app);
    this.page = page;
  }

  init(renderData: PageInterface) {
    // To override...
  }
}
