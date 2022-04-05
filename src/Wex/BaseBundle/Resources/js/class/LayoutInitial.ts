import Layout from './Layout';
import { ColorSchemeServiceEvents } from "../services/ColorSchemeService";

export default class extends Layout {
  public id: string = 'layout-initial';
  protected onChangeColorSchemeProxy: Function;

  protected async activateListeners(): Promise<void> {
    await super.activateListeners();

    this.onChangeColorSchemeProxy = this.onChangeColorScheme.bind(this);

    this.services.events.listen(
      ColorSchemeServiceEvents.COLOR_SCHEME_CHANGE,
      this.onChangeColorSchemeProxy
    );
  }

  protected async deactivateListeners(): Promise<void> {
    await super.deactivateListeners();

    this.services.events.forget(
      ColorSchemeServiceEvents.COLOR_SCHEME_CHANGE,
      this.onChangeColorSchemeProxy
    );
  }

  attachHtmlElements() {
    this.el = document.getElementById('layout');
  }

  getElWidth(forceCache: boolean = false): number {
    // Responsiveness is relative to real window size.
    return window.innerWidth;
  }

  getElHeight(forceCache: boolean = false): number {
    return window.innerHeight;
  }

  onChangeColorScheme(event:CustomEvent) {
    if (event.detail.renderNode===this) {
      this.services.colorScheme.setColorSchemeClass(
        document.body,
        this.colorSchemeActive
      );
    }
  }
}
