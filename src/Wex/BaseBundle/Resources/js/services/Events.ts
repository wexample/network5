import AppService from '../class/AppService';

export default class EventsService extends AppService {
  forget(name, callback, el = window.document) {
    el.removeEventListener(name, callback);
  }

  listen(name, callback, el = window.document) {
    el.addEventListener(name, callback);
  }

  trigger(name, data, el = window.document) {
    el.dispatchEvent(
      new CustomEvent(name, {
        detail: data,
      })
    );
  }
}
