import RenderNode from "../class/RenderNode";

export function traceRenderNodes(root: RenderNode) {
  console.log(
    traceRenderNodesPart(root)
  );
}

export function traceRenderNodesPart(
  root: RenderNode,
  depth = 0
): string {
  let output = '';
  let treeCharNode = '└─';
  let treeCharProperty = ' ';
  let ident = '   '.repeat(depth);
  let depthLimit = 10;

  if (depth > depthLimit) {
    return;
  }

  output += "\n" + ident + ' ' + treeCharNode + '» ' + root.getRenderNodeType();
  output += "\n" + ident + ' ' + treeCharProperty + '     #' + root.getId();
  output += "\n" + ident + ' ' + treeCharProperty + '     #' + root.el;

  let children = Object.values(root.childRenderNodes);

  children.forEach((renderNode: RenderNode) => {
    output += traceRenderNodesPart(
      renderNode,
      depth + 1
    );
  });

  return output;
}
