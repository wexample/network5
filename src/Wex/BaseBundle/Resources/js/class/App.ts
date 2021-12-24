import Page from './Page';

import AppInterface from '../interfaces/ServiceRegistry/AppInterface';

import AssetsService from '../services/AssetsService';
import EventsService from '../services/EventsService';
import LayoutsService from '../services/LayoutsService';
import MixinsService from '../services/MixinsService';
import PagesService from '../services/PagesService';
import ResponsiveService from '../services/ResponsiveService';
import RoutingService from "../services/RoutingService";

import ColorSchemeService from '../services/ColorSchemeService';
import { unique as arrayUnique } from '../helpers/Arrays';
import RenderDataInterface from '../interfaces/RenderData/RenderDataInterface';
import LayoutInitial from './LayoutInitial';
import LayoutInterface from '../interfaces/RenderData/LayoutInterface';
import AsyncConstructor from './AsyncConstructor';
import RequestOptionsInterface from '../interfaces/RequestOptions/RequestOptionsInterface';
import AppService from './AppService';
import { toCamel } from '../helpers/String';

export default class extends AsyncConstructor {
  public bundles: any;
  public hasCoreLoaded: boolean = false;
  public layout: LayoutInitial = null;
  public mixins: typeof AppService[] = [];
  public elLayout: HTMLElement;
  public lib: object = {};
  public services: AppInterface = {};

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

    let run = async () => {
      await this.loadAndInitServices(this.getServices());

      let registry: {
        bundles: any;
        layoutRenderData: LayoutInterface;
      } = window['appRegistry'];

      this.bundles = registry.bundles;
      // Save layout class definition to allow loading it as a normal render node definition.
      this.bundles.classes[registry.layoutRenderData.name] = LayoutInitial;

      this.layout = (await this.services.layouts.createRenderNode(
        registry.layoutRenderData.name,
        doc.getElementById('layout'),
        registry.layoutRenderData,
        {}
      )) as LayoutInitial;

      this.addLibraries(this.lib);

      // The main functionalities are ready.
      this.hasCoreLoaded = true;

      await this.loadLayoutRenderData(this.layout.renderData);

      // Display page content.
      this.layout.el.classList.remove('layout-loading');

      // Execute ready callbacks.
      await this.readyComplete();

      readyCallback && (await readyCallback());
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

  async loadLayoutRenderData(
    renderData: RenderDataInterface,
    requestOptions: RequestOptionsInterface = {}
  ): Promise<any> {
    await this.services.mixins.invokeUntilComplete(
      'loadLayoutRenderData',
      'app',
      [
        renderData,
        requestOptions,
      ]);

    // Execute ready callbacks.
    await this.readyComplete();
    // Display page content.
    this.layout.el.classList.remove('layout-loading');
  }

  buildServiceName(serviceName: string): string {
    return toCamel(serviceName.slice(0, -'Service'.length));
  }

  getClassPage() {
    return Page;
  }

  getServices(): typeof AppService[] {
    return [
      AssetsService,
      ColorSchemeService,
      EventsService,
      LayoutsService,
      MixinsService,
      PagesService,
      ResponsiveService,
      RoutingService,
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

  async loadAndInitServices(
    ServicesDefinitions: typeof AppService[]
  ): Promise<any> {
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
   * @param bundled
   */
  getBundleClassDefinition(
    classRegistryName: string,
    bundled: boolean = false
  ): any | null {
    let bundle = this.bundles.classes[classRegistryName];

    if (bundled) {
      return bundle ? bundle : null;
    }

    return bundle;
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
