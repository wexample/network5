import UnitTest from '../../../../class/UnitTest';
import modal from "../../../../components/modal";
import ModalComponent from "../../../../components/modal";

export default class AdaptiveRenderingTest extends UnitTest {
  public getTestMethods() {
    return [
      this.testNonAdaptivePage,
      this.testAdaptivePage,
      // this.testAdaptiveErrorMissingVue,
    ];
  }

  async testNonAdaptivePage() {
    await this.fetchTestPageAdaptiveHtml('/_core/test/view', 'VIEW');
  }

  async testAdaptivePage() {
    let pageNamePart = '_core/test/adaptive';
    let path = `/${pageNamePart}`;

    // Load in html.
    await this.fetchTestPageAdaptiveHtml(path, 'ADAPTIVE');

    this.fetchTestPageAdaptiveJson(path)
      .then(async () => {
        let pageFocused = this.app.layout.pageFocused;

        this.assertEquals(
          pageFocused.renderData.name,
          `pages/${pageNamePart}`,
          'The focused page is the modal content page'
        );

        this.assertEquals(
          pageFocused.parentRenderNode.renderData.name,
          `components/modal`,
          'The focused page is a child of modal component'
        );

        this.assertEquals(
          this.app
            .layout
            .pageFocused
            .el.querySelector('.modal-header h2').innerHTML,
          'ADAPTIVE_PAGE_TITLE',
          'The modal page title has been translated'
        );

        // Close modal.
        let modal = pageFocused.parentRenderNode as ModalComponent;
        await modal.close();

        this.assertEquals(
          this.app.layout.pageFocused,
          this.app.layout.page,
          'The focus has been thrown back to the main page'
        );
      });
  }

  async testAdaptiveErrorMissingVue() {
    await this.app.services['adaptive'].fetch('/_core/test/error-missing-view');
  }

  private fetchTestPageAdaptiveJson(path) {
    // Load in json.
    return this.app.services['adaptive'].get(path).then((response) => {
      this.assertTrue(!!response.page, 'The response contains page data');

      this.assertTrue(
        !!response.templates,
        'The response contains template html'
      );

      return response;
    });
  }

  private fetchTestPageAdaptiveHtml(path, pageContent) {
    // Use normal fetch to fake a non ajax get request.
    return fetch(path)
      .then((response: Response) => {
        this.assertTrue(response.ok, `${path} : Fetch succeed`);
        return response.text();
      })
      .then((html) => {
        let elHtml = document.createElement('html');

        elHtml.innerHTML = html;

        this.assertTrue(
          !!elHtml.querySelector('body'),
          `${path} : Fetched page content is a standard html document `
        );

        this.assertEquals(
          elHtml.querySelectorAll('.page').length,
          1,
          `${path} : Page element exists and is unique`
        );

        this.assertEquals(
          elHtml.querySelector('.page').innerHTML,
          pageContent,
          `Page content is ${pageContent}`
        );
      });
  }
}
