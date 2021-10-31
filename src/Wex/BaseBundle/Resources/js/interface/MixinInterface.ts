import {ServiceMethodsInterface} from "../class/ServiceMethodsInterface";

export default interface MixinInterface {
    name: string
    dependencies?: object
    methods?: ServiceMethodsInterface
    service?: any
    hooks?: object
}
