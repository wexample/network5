import RenderDataInterface from "./RenderDataInterface";

export default interface PageRenderDataInterface extends RenderDataInterface {
    isLayoutPage: boolean,
    name: string,
}