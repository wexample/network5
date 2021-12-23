import UnitTest from '../../../../class/UnitTest';

export default class AdaptiveRenderingTest extends UnitTest {
  public getTestMethods() {
    return [
      this.testNonAdaptivePage,
      this.testAdaptivePage
    ]
  }

  async testNonAdaptivePage() {
    await this.fetchTestPage(
      '/_core/test/view',
      'VIEW'
    );
  }

  async testAdaptivePage() {
    await this.fetchTestPage(
      '/_core/test/adaptive',
      'ADAPTIVE'
    );
  }

  private fetchTestPage(path, pageContent) {
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