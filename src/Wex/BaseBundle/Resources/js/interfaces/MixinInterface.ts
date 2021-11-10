import { MixinMethodsInterface } from '../class/MixinMethodsInterface';

export default interface MixinInterface {
  name: string;
  dependencies?: object;
  methods?: MixinMethodsInterface;
  service?: any;
  hooks?: object;
}
