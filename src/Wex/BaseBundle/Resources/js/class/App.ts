import Page from './Page';

import ServiceRegistryAppInterface from '../interfaces/ServiceRegistryAppInterface';

import AssetsService from '../services/Assets';
import MixinsService from '../services/Mixins';
import PagesService from '../services/Pages';
import ResponsiveService from '../services/Responsive';
import ThemeService from '../services/Theme';
import QueuesService from '../services/Queues';

import { unique as arrayUnique } from '../helpers/Arrays';
import RenderDataInterface from '../interfaces/RenderDataInterface';
import LayoutInitial from './LayoutInitial';
import RenderDataLayoutInterface from '../interfaces/RenderDataLayoutInterface';
import AsyncConstructor from './AsyncConstructor';
import RequestOptionsInterface from '../interfaces/RequestOptionsInterface';
import AppService from './AppService';

export default class extends AsyncConstructor {
  public bootJsBuffer: string[] = [];
  public bundles: any;
  public hasCoreLoaded: boolean = false;
  public layout: LayoutInitial = null;
  public layoutRenderData: RenderDataLayoutInterface = null;
  public mixins: typeof AppService[] = [];
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

      this
        .loadAndInitServices(this.getServices())
        .then(() => {
          this.addLibraries(this.lib);

          // The main functionalities are ready.
          this.hasCoreLoaded = true;

          return this
            .loadRenderData(this.layout.renderData)
            .then(() => {
              // Display page content.
              this.layout.el.classList.remove('layout-loading');
              // Execute ready callbacks.
              this.readyComplete();
            })
            .then(readyCallback);
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

  async loadRenderData(
    renderData: RenderDataInterface,
    requestOptions: RequestOptionsInterface = {}
  ): Promise<any> {
    return this.services.mixins.invokeUntilComplete(
      'loadRenderData',
      'app',
      [renderData, requestOptions]
    ).then(() => {
      // Execute ready callbacks.
      this.readyComplete();
      // Display page content.
      this.layout.el.classList.remove('layout-loading');
    });
  }

  buildServiceName(serviceName: string): string {
    return serviceName.slice(0, -'Service'.length).toLowerCase();
  }

  getClassPage() {
    return Page;
  }

  getServices(): typeof AppService[] {
    return [
      AssetsService,
      MixinsService,
      PagesService,
      QueuesService,
      ResponsiveService,
      ThemeService,
    ];
  }

  loadServices(services: typeof AppService[]): AppService[] {
    services = this.getServicesAndDependencies(services);
    let instances = [];

    services.forEach((service: typeof AppService) => {
      let name = this.buildServiceName(service.name);

      if (!this.services[name]) {
        this.services[name] = new service(this);
        instances.push(this.services[name]);
      }
    });

    return instances;
  }

  loadAndInitServices(ServicesDefinitions: typeof AppService[]): Promise<any> {
    let services = this.loadServices(ServicesDefinitions);

    // Init mixins.
    return this.services.mixins.invokeUntilComplete(
      'init',
      'app',
      [],
      undefined,
      services
    );
  }

  getServicesAndDependencies(
    services: typeof AppService[]
  ): typeof AppService[] {
    services.forEach((service: typeof AppService) => {
      if (service.dependencies) {
        services = [
          ...services,
          ...this.getServicesAndDependencies(service.dependencies),
        ];
      }
    });

    return arrayUnique(services) as typeof AppService[];
  }

  mix(parentDest, group, split = false) {
    Object.values(this.services).forEach((service: AppService) => {
      let methods = service.registerMethods();

      if (methods && methods[group]) {
        let dest;
        let toMix = methods[group];

        if (split) {
          dest = {};
          parentDest[service.name] = dest;
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

  addLib(name: string, object: any) {
    this.lib[name] = object;
  }

  addLibraries(libraries) {
    // Initialize preexisting libs.
    Object.entries(libraries).forEach((data) => {
      this.addLib(data[0], data[1]);
    });
  }
}
