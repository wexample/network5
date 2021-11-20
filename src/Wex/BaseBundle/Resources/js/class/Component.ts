import RenderDataComponentInterface from '../interfaces/RenderDataComponentInterface';
import Events from '../helpers/Events';
import { ServiceRegistryComponentInterface } from '../interfaces/ServiceRegistryComponentInterface';
import RenderNode from './RenderNode';

export default abstract class Component extends RenderNode {
  protected listenKeyboardKey: string[] = [];
  protected onKeyUpProxy: Function;
  public renderData: RenderDataComponentInterface;
  protected readonly services: ServiceRegistryComponentInterface;

  public static INIT_MODE_CLASS: string = 'class';

  public static INIT_MODE_LAYOUT: string = 'layout';

  public static INIT_MODE_PARENT: string = 'parent';

  public static INIT_MODE_PREVIOUS: string = 'previous';

  public getId(): string {
    return this.renderData.id;
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
    this.deactivateListeners();

    this.el.parentNode.removeChild(this.el);
  }
}
