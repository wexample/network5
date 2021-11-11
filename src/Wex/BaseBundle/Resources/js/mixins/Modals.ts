import MixinInterface from '../interfaces/MixinInterface';
import AppService from '../class/AppService';

const service: MixinInterface = {
  name: 'modals',

  service: class extends AppService {
    open() {
      // TODO
      console.log('open modal')
    }
  },
};

export default service;
