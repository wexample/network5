export class CssStyleValue {
  public static BACKGROUND_COLOR: string = 'background-color';
}

export class CssColorName {
  public static BLACK = 'black';

  public static TRANSPARENT = 'transparent';

  public static WHITE = 'white';
}

export function convertToHexRgba(englishColor) {
  // Creates a temporary div.
  let el = document.createElement("div");
  el.style.color = englishColor;
  document.body.appendChild(el);

  let rgba = window.getComputedStyle(el).color;
  el.remove();

  return rgba;
}
