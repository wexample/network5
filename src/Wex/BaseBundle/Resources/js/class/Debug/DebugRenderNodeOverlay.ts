// Script par of a Vue component.
import RenderNode from "../RenderNode";
import Variables from "../../helpers/Variables";
import RenderDataInterface from "../../interfaces/RenderDataInterface";
import RequestOptionsInterface from "../../interfaces/RequestOptionsInterface";
import DebugRenderNode from "./DebugRenderNode";

// Used to be mixed with render node and track changes.
export default {
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

  loadRenderData(
    methodOriginal: Function,
    renderNode: RenderNode,
    debugRenderNode: DebugRenderNode
  ) {
    return function (
      renderData: RenderDataInterface,
      requestOptions: RequestOptionsInterface
    ) {
      debugRenderNode.vueInfo.$.props.name
        = renderData.name;

      return methodOriginal.apply(renderNode, arguments);
    }
  }
}