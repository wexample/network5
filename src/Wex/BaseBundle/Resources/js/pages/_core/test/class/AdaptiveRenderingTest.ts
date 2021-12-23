import UnitTest from '../../../../class/UnitTest';

export default class AdaptiveRenderingTest extends UnitTest {
  public getTestMethods() {
    return [
      this.testNonAdaptivePage
    ]
  }

  public testNonAdaptivePage() {
    fetch('/_core/test/view')
      .then((response: Response) => {
        this.assertTrue(response.ok, 'Fetch succeed');
        return response.text();
      })
      .then((html) => {
        let elHtml = document.createElement('html');

        elHtml.innerHTML = html;

        this.assertTrue(
          !!elHtml.querySelector('body'),
          'Fetched page content is a standard html document'
        )

        let pageContent = 'VIEW';
        this.assertEquals(
          elHtml.querySelector('.page').innerHTML,
          pageContent,
          `Page content is ${pageContent}`
        )
      });
  }
}