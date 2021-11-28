import AppChild from '../AppChild';
import RenderNode from '../RenderNode';
import DebugService from '../../services/Debug';
import Variables from '../../helpers/Variables';
import VueService from '../../services/Vue';
import DebugRenderNodeInfo from './DebugRenderNodeInfo';
import DebugRenderNodeOverlay from './DebugRenderNodeOverlay';

export default class DebugRenderNode extends AppChild {
  public borderColors: any = {
    component: 'yellow',
    page: 'blue',
    layout: 'red',
  };
  public el: HTMLElement;
  public elDebugHelpers: HTMLElement;
  public renderNode: RenderNode;
  public service: DebugService;
  protected renderNodeDebugOverlay = DebugRenderNodeOverlay;
  public vueInfo: any;

  constructor(renderNode) {
    super(renderNode.app);

    this.renderNode = renderNode;
    this.service = this.app.services['debug'] as DebugService;

    this.createEl();

    let vueService = this.services['vue'] as VueService;
    this.vueInfo = vueService
      .createApp(DebugRenderNodeInfo, {
        app: this.app,
        renderNode: renderNode,
        debugRenderNode: this,
      })
      .mount(this.el);

    if (this.renderNode.getRenderNodeType() === Variables.PAGE) {
      this.createElDebugHelpers();
    }

    this.addTrackers();

    // After app loaded.
    renderNode.ready(() => {
      this.service.debugRenderNodes[this.renderNode.getId()] = this;
      // Wait rendering complete.
      setTimeout(() => {
        this.update();
      }, 100);
    });
  }

  addTrackers() {
    let methods = Object.entries(this.renderNodeDebugOverlay);

    methods.forEach((data) => {
      let name: string = data[0];
      let methodReplacementGenerator = data[1];

      if (typeof methodReplacementGenerator === 'function') {
        this.renderNode[name] = methodReplacementGenerator(
          this.renderNode[name],
          this.renderNode,
          this
        );
      }
    });
  }

  blur() {
    this.el.classList.remove('focus');
  }

  focus() {
    this.el.classList.add('focus');
  }

  convertPosition(number) {
    return `${number}px`;
  }

  createEl() {
    this.el = document.createElement('div');
    this.el.classList.add('debug-render-node');
    this.el.style.borderColor = this.getBorderColor();

    this.service.elDebugHelpers.appendChild(this.el);

    this.renderNode.ready(() => {
      this.el.setAttribute('id', `debug-${this.renderNode.getId()}`);
    });
  }

  createElDebugHelpers() {
    this.elDebugHelpers = document.createElement('div');
    this.service.elDebugHelpers.appendChild(this.elDebugHelpers);
  }

  update() {
    let rect = this.renderNode.el.getBoundingClientRect();

    Object.assign(this.el.style, {
      top: this.convertPosition(rect.top),
      left: this.convertPosition(rect.left),
      width: this.convertPosition(rect.width),
      height: this.convertPosition(rect.height),
    });
  }

  getBorderColor(): string {
    return this.borderColors[this.renderNode.getRenderNodeType()];
  }
}
