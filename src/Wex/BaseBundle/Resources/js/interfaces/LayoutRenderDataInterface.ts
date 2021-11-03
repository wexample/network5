import RenderDataInterface from "./RenderDataInterface";
import PageRenderDataInterface from "./PageRenderDataInterface";

export default interface LayoutRenderDataInterface extends RenderDataInterface {
    displayBreakpoints?: object
    env: string
    page: PageRenderDataInterface
    theme: string
    translationsDomainSeparator: string,
}