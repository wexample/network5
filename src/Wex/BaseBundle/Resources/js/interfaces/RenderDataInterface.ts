import AssetsCollectionInterface from "./AssetsCollectionInterface";
import PageRenderDataInterface from "./PageRenderDataInterface";

export default interface RenderDataInterface {
    assets: {
        all?: AssetsCollectionInterface,
        responsive?: AssetsCollectionInterface
        theme?: AssetsCollectionInterface
    },
    displayBreakpoints?: object
    env: string
    page?: PageRenderDataInterface
    translations: {
        catalog: object,
        domain: string,
    },
    translationsDomainSeparator: string
    vars: object
}