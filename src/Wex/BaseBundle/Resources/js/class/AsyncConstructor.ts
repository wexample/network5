export default abstract class {
  public isReady: boolean = false;
  public readyCallbacks: Function[] = [];

  async(callback) {
    setTimeout(callback);
  }

  ready(callback) {
    if (this.isReady) {
      callback();
    } else {
      this.readyCallbacks.push(callback);
    }
  }

  readyComplete(...args: any[]) {
    this.isReady = true;
    // Launch callbacks.
    this.async(() => this.callbacks(this.readyCallbacks, args));
  }

  /**
   * Execute an array of callbacks functions.
   */
  callbacks(callbacksArray, args = [], thisArg = null) {
    let method = args ? 'apply' : 'call';
    let callback = null;

    while ((callback = callbacksArray.shift())) {
      if (!callback) {
        throw 'Trying to execute undefined callback.';
      }

      callback[method](thisArg || this, args);
    }
  }
}
