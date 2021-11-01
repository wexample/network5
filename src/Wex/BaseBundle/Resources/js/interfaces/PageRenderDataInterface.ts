import RenderDataInterface from "./RenderDataInterface";

export default interface PageRenderDataInterface extends RenderDataInterface {
    components: any,
    isLayoutPage: boolean,
    name: string,
}