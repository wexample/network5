import Page from './Page';
import AppChild from './AppChild';
import RenderDataPageInterface from '../interfaces/RenderDataPageInterface';

export default class extends AppChild {
  protected readonly page: Page;

  constructor(page) {
    super(page.app);
    this.page = page;
  }

  init(renderData: RenderDataPageInterface) {
    // To override...
  }
}
