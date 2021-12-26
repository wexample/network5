import UnitTest from '../../../../class/UnitTest';
import ModalComponent from '../../../../components/modal';
import LayoutInterface from '../../../../interfaces/RenderData/LayoutInterface';

export default class AdaptiveRenderingTest extends UnitTest {
  public getTestMethods() {
    return [
      this.testNonAdaptivePage,
      this.testAdaptivePage,
      // this.testAdaptiveErrorMissingVue,
    ];
  }

  async testNonAdaptivePage() {
    await this.fetchTestPageAdaptiveHtml(
      this.app.services.routing.path('_core_test_view'),
      'VIEW'
    );
  }

  async testAdaptivePage() {
    let pageNamePart = '_core/test/adaptive';
    let path = this.app.services.routing.path('_core_test_adaptive');

    // Load in html.
    await this.fetchTestPageAdaptiveHtml(path, 'ADAPTIVE');

    this.fetchTestPageAdaptiveJson(path).then(async () => {
      let pageFocused = this.app.layout.pageFocused;

      this.assertEquals(
        pageFocused.name,
        `pages/${pageNamePart}`,
        'The focused page is the modal content page'
      );

      this.assertEquals(
        pageFocused.parentRenderNode.name,
        `components/modal`,
        'The focused page is a child of modal component'
      );

      this.assertEquals(
        pageFocused.el.querySelector('.modal-header h2').innerHTML,
        'ADAPTIVE_PAGE_TITLE',
        'The modal page title has been translated'
      );

      this.assertEquals(
        pageFocused.vars.page_level_test_var,
        'value',
        'The modal page has vars'
      );

      this.assertEquals(
        this.app.layout.vars.layout_level_test_var,
        'value',
        'The layout has a new var'
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
    await this.app.services['adaptive'].fetch(
      this.app.services.routing.path('_core_test_error-missing-view')
    );
  }

  private fetchTestPageAdaptiveJson(path) {
    // Load in json.
    return this.app.services['adaptive']
      .get(path)
      .then((renderData: LayoutInterface) => {
        this.assertTrue(
          !renderData.assets.css.length,
          `Layout data contains any CSS assets`
        );

        this.assertTrue(
          !renderData.assets.js.length,
          `Layout data contains any JS assets`
        );

        this.assertTrue(!!renderData.page, 'The response contains page data');

        this.assertTrue(
          !!renderData.templates,
          'The response contains template html'
        );

        return renderData;
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

        let found = elHtml
          .querySelector('#layout-data')
          .innerHTML.match(/layoutRenderData = ([.\S\s\n]*);(\s*)/);

        this.assertTrue(!!found, `Layout data found`);

        let layoutData = JSON.parse(found[1]);

        this.assertTrue(!!layoutData, `Layout data is valid JSON`);

        this.assertTrue(
          !!layoutData.assets.css.length,
          `Layout data contains CSS assets`
        );

        this.assertTrue(
          !!layoutData.assets.js.length,
          `Layout data contains JS assets`
        );
      });
  }
}
