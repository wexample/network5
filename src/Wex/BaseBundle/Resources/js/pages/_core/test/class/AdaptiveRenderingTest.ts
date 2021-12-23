import UnitTest from '../../../../class/UnitTest';

export default class AdaptiveRenderingTest extends UnitTest {
  public getTestMethods() {
    return [
      this.testNonAdaptivePage,
      this.testAdaptivePage,
      // this.testAdaptiveErrorMissingVue,
    ]
  }

  async testNonAdaptivePage() {
    await this.fetchTestPageAdaptiveHtml(
      '/_core/test/view',
      'VIEW'
    );
  }

  async testAdaptivePage() {
    let path = '/_core/test/adaptive';
    // Load in html.
    await this.fetchTestPageAdaptiveHtml(
      path,
      'ADAPTIVE'
    );

    this.fetchTestPageAdaptiveJson(path);
  }

  async testAdaptiveErrorMissingVue() {
    await this.app.services['adaptive'].fetch(
      '/_core/test/error-missing-view',
    );
  }

  private fetchTestPageAdaptiveJson(path) {
    // Load in json.
    return this.app.services['adaptive']
      .get(path)
      .then((response) => {
        this.assertTrue(!!response.page, 'The response contains page data');

        this.assertTrue(!!response.templates, 'The response contains template html');
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
        )

        this.assertEquals(
          elHtml.querySelectorAll('.page').length,
          1,
          `${path} : Page element exists and is unique`
        )

        this.assertEquals(
          elHtml.querySelector('.page').innerHTML,
          pageContent,
          `Page content is ${pageContent}`
        )
      });
  }
}