import Page from './Page';

import MixinInterface from '../interfaces/MixinInterface';
import ServiceRegistryAppInterface from '../interfaces/ServiceRegistryAppInterface';

import { MixinAssets } from '../mixins/Assets';
import { MixinMixins } from '../mixins/Mixins';
import { MixinPages } from '../mixins/Pages';
import { MixinResponsive } from '../mixins/Responsive';
import { MixinTheme } from '../mixins/Theme';
import { MixinQueues } from '../mixins/Queues';

import { unique as arrayUnique } from '../helpers/Arrays';
import RenderDataInterface from '../interfaces/RenderDataInterface';
import LayoutInitial from './LayoutInitial';
import RenderDataLayoutInterface from '../interfaces/RenderDataLayoutInterface';
import AsyncConstructor from './AsyncConstructor';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';

export default class extends AsyncConstructor {
  public bootJsBuffer: string[] = [];
  public bundles: any;
  public hasCoreLoaded: boolean = false;
  public layout: LayoutInitial = null;
  public layoutRenderData: RenderDataLayoutInterface = null;
  public mixins: MixinInterface[] = [];
  public elLayout: HTMLElement;
  public lib: object = {};
  public services: ServiceRegistryAppInterface = {};

  constructor(readyCallback?: any | Function, globalName = 'app') {
    super();

    window[globalName] = this;

    // Allow callback as object definition.
    if (typeof readyCallback === 'object') {
      Object.assign(this, readyCallback);
      // Allow object.readyCallback property.
      readyCallback = readyCallback.readyCallback || readyCallback;
    }

    let doc = window.document;

    let run = () => {
      let registry: {
        bundles: any;
        layoutRenderData: RenderDataLayoutInterface;
      } = window['appRegistry'];
      this.bundles = registry.bundles;
      this.layoutRenderData =
        registry.layoutRenderData as RenderDataLayoutInterface;
      this.layout = new LayoutInitial(this);
      this.layout.el = doc.getElementById('layout');

      this.loadAndInitMixins(this.getMixins(), () => {
        this.addLibraries(this.lib);

        // The main functionalities are ready.
        this.hasCoreLoaded = true;

        this.loadRenderData(this.layout.renderData, {}, () => {
          // Display page content.
          this.layout.el.classList.remove('layout-loading');
          // Execute ready callbacks.
          this.readyComplete();
          // Launch constructor argument callback.
          readyCallback && readyCallback.apply(this);
        });
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

  loadRenderData(
    renderData: RenderDataInterface,
    requestOptions: RequestOptionsInterface,
    complete?: Function
  ) {
    this.services.mixins.invokeUntilComplete(
      'loadRenderData',
      'app',
      [renderData, requestOptions],
      () => {
        // Execute ready callbacks.
        this.readyComplete();
        // Display page content.
        this.layout.el.classList.remove('layout-loading');
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

  loadAndInitMixins(mixins: MixinInterface[], complete) {
    this.loadMixins(mixins);

    // Init mixins.
    this.services.mixins.invokeUntilComplete(
      'init',
      'app',
      [],
      complete,
      undefined,
      mixins
    );
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
   * @param classRegistryName
   */
  getBundleClassDefinition(classRegistryName: string): any | null {
    let bundle = this.bundles.classes[classRegistryName];

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
