import UnitTest from '../../../../class/UnitTest';
import LayoutInterface from "../../../../interfaces/RenderData/LayoutInterface";

export default abstract class AbstractResponsiteTest extends UnitTest {
  protected pathCoreTestAdaptive: string;

  public init() {
    this.pathCoreTestAdaptive = this.app.services.routing.path('_core_test_adaptive');
  }

  protected async fetchAdaptiveAjaxPage(path: string = this.pathCoreTestAdaptive): Promise<LayoutInterface> {
    return this.app.services.pages
      .get(path);
  }

  protected async fetchAdaptiveHtmlPage(path: string = this.pathCoreTestAdaptive): Promise<string> {
    return fetch(path)
      .then((response: Response) => {
        this.assertTrue(response.ok, `Fetch succeed of ${path}`);

        return response.text();
      });
  }
}
