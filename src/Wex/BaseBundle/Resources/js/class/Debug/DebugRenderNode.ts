import AppChild from '../AppChild';
import RenderNode from '../RenderNode';
import DebugService from '../../services/Debug';
import Variables from '../../helpers/Variables';
import VueService from "../../services/Vue";

export default class DebugRenderNode extends AppChild {
  public borderColors: any = {
    component: 'yellow',
    page: 'blue',
    layout: 'red',
  };
  public el: HTMLElement;
  public elDebugHelpers: HTMLElement;
  public renderNode: RenderNode;
  protected service: DebugService;
  protected renderNodeDebugOverlay = {
    exit: function (
      methodOriginal: Function,
      renderNode: RenderNode,
      debugRenderNode: DebugRenderNode
    ) {
      return function () {
        debugRenderNode.el.remove();

        if (debugRenderNode.renderNode.getRenderNodeType() === Variables.PAGE) {
          // debugRenderNode.elDebugHelpers.remove();
        }

        methodOriginal.apply(renderNode, arguments);
      };
    },

    focus: function (
      methodOriginal: Function,
      renderNode: RenderNode,
      debugRenderNode: DebugRenderNode
    ) {
      return function () {
        debugRenderNode.focus();

        renderNode.forEachChildRenderNode((childRenderNode) => {
          debugRenderNode.service.debugRenderNodes[
            childRenderNode.getId()
            ].focus();
        });

        methodOriginal.apply(renderNode, arguments);
      };
    },

    blur: function (
      methodOriginal: Function,
      renderNode: RenderNode,
      debugRenderNode: DebugRenderNode
    ) {
      return function () {
        debugRenderNode.blur();

        renderNode.forEachChildRenderNode((childRenderNode) => {
          debugRenderNode.service.debugRenderNodes[
            childRenderNode.getId()
            ].blur();
        });

        methodOriginal.apply(renderNode, arguments);
      };
    },
  };

  constructor(renderNode) {
    super(renderNode.app);

    this.renderNode = renderNode;
    this.service = this.app.services['debug'] as DebugService;

    this.createEl();

    let vueService = this.services['vue'] as VueService;
    vueService.createApp({
      props: {
        renderNode: {
          type: Object,
          default: this.renderNode
        }
      },

      methods: {
        renderDebugInfo() {
          return [
            `Name : ${this.renderNode.renderData ? this.renderNode.renderData.name : 'n/a'}`,
          ].join('<br>')
        }
      }
    }).mount(this.el);

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
    this.el.innerHTML = `<div class="debug-info" style="background-color:${this.getBorderColor()}" v-html="renderDebugInfo()"></div>`;
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
