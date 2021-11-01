import AssetsCollectionInterface from "./AssetsCollectionInterface";

export default interface RenderDataInterface {
    assets?: {
        all?: AssetsCollectionInterface,
        responsive?: AssetsCollectionInterface
    },
    vars?: object
}