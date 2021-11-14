import Page from './Page';

import MixinInterface from '../interfaces/MixinInterface';
import ServiceRegistryAppInterface from '../interfaces/ServiceRegistryAppInterface';

import {MixinAssets} from '../mixins/Assets';
import {MixinMixins} from '../mixins/Mixins';
import {MixinPages} from '../mixins/Pages';
import {MixinResponsive} from '../mixins/Responsive';
import {MixinTheme} from '../mixins/Theme';
import {MixinQueues} from '../mixins/Queues';

import {unique as arrayUnique} from '../helpers/Arrays';
import RenderDataInterface from "../interfaces/RenderDataInterface";

export default class {
  public bootJsBuffer: string[] = [];
  public hasCoreLoaded: boolean = false;
  public layoutPage: Page = null;
  public mixins: MixinInterface[] = [];
  public readyCallbacks: Function[] = [];
  public elLayout: HTMLElement;
  public lib: object = {};
  public registry: any;
  public services: ServiceRegistryAppInterface = {};
  public isReady: boolean = false;

  constructor(readyCallback?: any | Function, globalName = 'app') {
    window[globalName] = this;

    this.registry = window['appRegistry'];

    // Allow callback as object definition.
    if (typeof readyCallback === 'object') {
      Object.assign(this, readyCallback);
      // Allow object.readyCallback property.
      readyCallback = readyCallback.readyCallback || readyCallback;
    }

    let doc = window.document;

    let run = () => {
      this.loadMixins(this.getMixins());

      // Init mixins.
      this.services.mixins.invokeUntilComplete('init', 'app', [], () => {
        this.elLayout = doc.getElementById('layout');

        this.addLibraries(this.lib);

        // The main functionalities are ready.
        this.hasCoreLoaded = true;

        this.loadRenderData(
          this.registry.layoutData,
          () => {
            // Execute ready callbacks.
            this.readyComplete();
            // Display page content.
            this.elLayout.classList.remove('layout-loading');
            // Launch constructor argument callback.
            readyCallback && readyCallback.apply(this);
          }
        );
      });
    };

    let readyState = doc.readyState;

    // Document has been parsed.
    // Allows running after loaded event.
    if (['complete', 'loaded', 'interactive'].indexOf(readyState) !== -1) {
      this.async(run);
    } else {
      doc.addEventListener('DOMContentLoaded', run);
    }
  }

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

  readyComplete() {
    this.isReady = true;
    // Launch callbacks.
    this.callbacks(this.readyCallbacks);
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

  loadRenderData(data: RenderDataInterface, complete?: Function) {
    this.services.mixins.invokeUntilComplete(
      'loadRenderData',
      'app',
      [data],
      () => {
        // Execute ready callbacks.
        this.readyComplete();
        // Display page content.
        this.elLayout.classList.remove('layout-loading');
        // Launch constructor argument callback.
        complete && complete.apply(this);
      }
    );
  }

  getClassPage() {
    return Page;
  }

  getMixins(): MixinInterface[] {
    return [
      MixinAssets,
      MixinMixins,
      MixinPages,
      MixinQueues,
      MixinResponsive,
      MixinTheme,
    ];
  }

  loadMixins(mixins: MixinInterface[]): void {
    mixins = this.getMixinsAndDependencies(mixins);

    mixins.forEach((mixin: MixinInterface) => {
      if (mixin.service) {
        this.services[mixin.name] = new mixin.service(this);
      }
    });

    this.mixins = arrayUnique([...mixins, ...this.mixins]) as MixinInterface[];
  }

  getMixinsAndDependencies(mixins: MixinInterface[]): MixinInterface[] {
    mixins.forEach((mixin: any) => {
      if (mixin.dependencies) {
        mixins = [
          ...mixins,
          ...this.getMixinsAndDependencies(mixin.dependencies),
        ];
      }
    });

    return arrayUnique(mixins) as MixinInterface[];
  }

  mix(parentDest, group, split = false) {
    this.mixins.forEach((mixin) => {
      if (mixin.methods && mixin.methods[group]) {
        let dest;
        let toMix = mixin.methods[group];

        if (split) {
          dest = {};
          parentDest[mixin.name] = dest;
        } else {
          dest = parentDest;
        }

        // Use a "one level deep merge" to allow mix groups of methods.
        for (let i in toMix) {
          let value = toMix[i];

          // Mix objects.
          if (value && value.constructor && value.constructor === Object) {
            dest[i] = dest[i] || {};

            Object.assign(dest[i], toMix[i]);
          }
          // Methods, bind it to main object.
          else if (typeof value === 'function') {
            dest[i] = toMix[i].bind(parentDest);
          }
          // Override others.
          else {
            dest[i] = toMix[i];
          }
        }
      }
    });
  }

  /**
   * @param registryGroup
   * @param classRegistryName
   */
  getBundleClassDefinition(registryGroup: string, classRegistryName: string) {
    let bundle =
      this.registry.bundles[registryGroup].classes[classRegistryName];

    return bundle ? bundle.definition : null;
  }

  addLib(name, object) {
    this.lib[name] = object;
  }

  addLibraries(libraries) {
    // Initialize preexisting libs.
    Object.entries(libraries).forEach((data) => {
      this.addLib(data[0], data[1]);
    });
  }
}
