import RenderDataInterface from "./RenderDataInterface";
import PageRenderDataInterface from "./PageRenderDataInterface";

export default interface LayoutRenderDataInterface extends RenderDataInterface {
    page: PageRenderDataInterface,
}