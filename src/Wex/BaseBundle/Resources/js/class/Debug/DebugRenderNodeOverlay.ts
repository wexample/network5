// Script par of a Vue component.
import RenderNode from '../RenderNode';
import RenderDataInterface from '../../interfaces/RenderData/RenderDataInterface';
import RequestOptionsInterface from '../../interfaces/RequestOptions/RequestOptionsInterface';
import DebugRenderNode from './DebugRenderNode';
import { EventsServiceEvents } from '../../services/EventsService';

// Used to be mixed with render node and track changes.
export default {
  init: function (
    methodOriginal: Function,
    renderNode: RenderNode,
    debugRenderNode: DebugRenderNode
  ) {
    return function () {
      this.app.services.events.listen(
        EventsServiceEvents.DISPLAY_CHANGED,
        debugRenderNode.updateProxy
      );

      methodOriginal.apply(renderNode, arguments);
    };
  },

  exit: function (
    methodOriginal: Function,
    renderNode: RenderNode,
    debugRenderNode: DebugRenderNode
  ) {
    return function () {
      debugRenderNode.el.remove();

      this.app.services.events.forget(
        EventsServiceEvents.DISPLAY_CHANGED,
        debugRenderNode.updateProxy
      );

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

      renderNode.forEachChildRenderNode((childRenderNode:RenderNode) => {
        debugRenderNode.service.debugRenderNodes[
          childRenderNode.id
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

      renderNode.forEachChildRenderNode((childRenderNode:RenderNode) => {
        debugRenderNode.service.debugRenderNodes[
          childRenderNode.id
        ].blur();
      });

      methodOriginal.apply(renderNode, arguments);
    };
  },

  loadRenderData(
    methodOriginal: Function,
    renderNode: RenderNode,
    debugRenderNode: DebugRenderNode
  ) {
    return function (
      renderData: RenderDataInterface,
      requestOptions: RequestOptionsInterface
    ) {
      debugRenderNode.vueInfo.$.props.renderData = renderData;
      debugRenderNode.vueInfo.$.props.requestOptions = requestOptions;

      return methodOriginal.apply(renderNode, arguments);
    };
  },
};
