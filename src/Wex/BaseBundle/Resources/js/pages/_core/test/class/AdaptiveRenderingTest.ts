import UnitTest from '../../../../class/UnitTest';

export default class AdaptiveRenderingTest extends UnitTest {
  public getTestMethods() {
    return [
      this.testNonAdaptivePage
    ]
  }

  public testNonAdaptivePage() {
    let path = '/_core/test/view';
    let pageContent = 'VIEW';

    fetch(path)
      .then((response: Response) => {
        this.assertTrue(response.ok, `Fetch succeed of ${path}`);
        return response.text();
      })
      .then((html) => {
        let elHtml = document.createElement('html');

        elHtml.innerHTML = html;

        this.assertTrue(
          !!elHtml.querySelector('body'),
          `Fetched page content is a standard html document in  ${path}`
        )
        this.assertEquals(
          elHtml.querySelector('.page').innerHTML,
          pageContent,
          `Page content is ${pageContent}`
        )
      });
  }
}