export default interface MixinInterface {
    name: string
    dependencies?: object
    methods?: ServiceMethodsInterface
    service?: any
    hooks?: object
}

export interface ServiceMethodsInterface {
    app?: object
}
