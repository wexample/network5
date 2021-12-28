import ComponentInterface from '../interfaces/RenderData/ComponentInterface';
import Events from '../helpers/Events';
import { ComponentInterface as ServiceRegistryComponentInterface } from '../interfaces/ServiceRegistry/ComponentInterface';
import RenderNode from './RenderNode';

export default abstract class Component extends RenderNode {
  protected listenKeyboardKey: string[] = [];
  protected onKeyUpProxy: Function;
  public options: any = {};
  public renderData: ComponentInterface;
  protected readonly services: ServiceRegistryComponentInterface;

  public static INIT_MODE_CLASS: string = 'class';

  public static INIT_MODE_LAYOUT: string = 'layout';

  public static INIT_MODE_PARENT: string = 'parent';

  public static INIT_MODE_PREVIOUS: string = 'previous';

  async init() {
    await this.services.mixins.invokeUntilComplete(
      'initComponent',
      'component',
      [this]
    );
  }

  mergeRenderData(renderData: ComponentInterface) {
    super.mergeRenderData(renderData);

    this.options = { ...this.options, ...renderData.options };
  }

  public getRenderNodeType(): string {
    return 'component';
  }

  protected onKeyUp(event: KeyboardEvent) {
    if (this.focused && this.listenKeyboardKey.indexOf(event.key) !== -1) {
      this.onListenedKeyUp(event);
    }
  }

  protected activateListeners(): void {
    if (this.listenKeyboardKey.length) {
      this.onKeyUpProxy = this.onKeyUp.bind(this);

      document.addEventListener(
        Events.KEYUP,
        this.onKeyUpProxy as EventListenerOrEventListenerObject
      );
    }
  }

  protected deactivateListeners(): void {
    if (this.listenKeyboardKey.length) {
      document.removeEventListener(
        Events.KEYUP,
        this.onKeyUpProxy as EventListenerOrEventListenerObject
      );
    }
  }

  protected onListenedKeyUp(event: KeyboardEvent) {
    // To override...
  }

  public exit() {
    super.exit();

    this.deactivateListeners();

    this.el.remove();
  }
}
