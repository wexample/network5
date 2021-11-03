import AssetsCollectionInterface from "./AssetsCollectionInterface";

export default interface RenderDataInterface {
    assets: {
        all?: AssetsCollectionInterface,
        responsive?: AssetsCollectionInterface
        theme?: AssetsCollectionInterface
    }
    translations: {
        catalog: object,
        domain: string,
    }
    vars: object
}