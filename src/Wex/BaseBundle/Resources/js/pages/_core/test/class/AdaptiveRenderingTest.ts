import UnitTest from '../../../../class/UnitTest';
import ModalComponent from '../../../../components/modal';
import LayoutInterface from '../../../../interfaces/RenderData/LayoutInterface';

export default class AdaptiveRenderingTest extends UnitTest {
  public getTestMethods() {
    return [
      this.testNonAdaptivePage,
      this.testAdaptivePage,
      this.testAdaptiveErrorMissingView,
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

    await this.fetchTestPageAdaptiveJson(path).then(async () => {
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
        pageFocused.vars.pageLevelTestVar,
        'value',
        'The modal page has vars'
      );

      this.assertEquals(
        this.app.layout.vars.layoutLevelTestVar,
        'value',
        'The layout has a new var'
      );

      this.assertTrue(
        pageFocused.components[0].options.testOption,
        'The component option has been loaded'
      );

      this.assertEquals(
        getComputedStyle(pageFocused.el.querySelector('.adaptive-page-test-css')).backgroundColor,
        'rgb(0, 128, 0)',
        'The adaptive CSS has applied green'
      );

      this.assertEquals(
        getComputedStyle(pageFocused.el.querySelector('.adaptive-page-test-css')).backgroundColor,
        'rgb(0, 128, 0)',
        'The adaptive JS has applied green'
      );

      this.assertEquals(
        pageFocused.el.querySelector('.test-component-string-translated').innerHTML,
        'SERVER_SIDE_COMPONENT_TRANSLATION',
        `Test string equals "SERVER_SIDE_COMPONENT_TRANSLATION"`
      );

      this.assertEquals(
        pageFocused.el.querySelector('.test-component-string-translated-client').innerHTML,
        'CLIENT_SIDE_COMPONENT_TRANSLATION',
        `Test string equals "CLIENT_SIDE_COMPONENT_TRANSLATION"`
      );

      // // Close modal.
      let modal = pageFocused.parentRenderNode as ModalComponent;
      await modal.close();

      this.assertEquals(
        this.app.layout.pageFocused,
        this.app.layout.page,
        'The focus has been thrown back to the main page'
      );
    });
  }

  async testAdaptiveErrorMissingView() {
    await this.app.services['adaptive']
      .get(this.app.services.routing.path('_core_test_error-missing-view'))
      .then(async () => {
        let pageFocused = this.app.layout.pageFocused;

        this.assertTrue(
          pageFocused.el
            .querySelector('.modal-body')
            .innerHTML.indexOf('Unable to find template') !== -1,
          'Error message has been displayed into modal'
        );

        this.assertTrue(pageFocused.vars.hasError, 'Page has error');

        // Close modal.
        let modal = pageFocused.parentRenderNode as ModalComponent;

        await modal.close();
      });
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

  protected createElDocument(html: string) {
    let elHtml = document.createElement('html');
    elHtml.innerHTML = html;

    return elHtml;
  }

  private fetchTestPageAdaptiveHtml(path: string, testString: string) {
    // Use normal fetch to fake a non ajax get request.
    return fetch(path)
      .then((response: Response) => {
        this.assertTrue(response.ok, `${path} : Fetch succeed`);
        return response.text();
      })
      .then((html) => {
        let elHtml = this.createElDocument(html);

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
          elHtml.querySelector('.page .test-string').innerHTML,
          testString,
          `Test string equals "${testString}"`
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
