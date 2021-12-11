import AppService from '../class/AppService';

export class EventsServiceEvents {
  public static DISPLAY_CHANGED: string = 'display-changed';
}

export default class EventsService extends AppService {
  forget(name, callback, el = window.document) {
    this.applyEvents(
      'remove',
      name,
      callback,
      el
    );
  }

  listen(name, callback, el = window.document) {
    this.applyEvents(
      'add',
      name,
      callback,
      el
    );
  }

  /**
   * Execute addEventListener or removeEventListener for string callback name or an array of names.
   *
   * @param callbackName
   * @param eventName
   * @param callback
   * @param el
   */
  applyEvents(callbackName: string, eventName, callback, el = window.document) {
    callbackName += 'EventListener';

    if (Array.isArray(eventName)) {
      eventName.forEach((subName) => el[callbackName](subName, callback))
    } else {
      el[callbackName](eventName, callback);
    }
  }

  trigger(name, data: any = {}, el = window.document) {
    el.dispatchEvent(
      new CustomEvent(name, {
        detail: data,
      })
    );
  }
}
