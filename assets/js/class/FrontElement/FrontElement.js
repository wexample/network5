export default class {
  constructor() {
    Object.assign(this, {
      directionsMap: {
        x: {
          position: 'left',
          size: 'width',
          mouse: 'mouseX'
        },
        y: {
          position: 'top',
          size: 'height',
          mouse: 'mouseY'
        }
      }
    });
  }

  calcDistance(x1, y1, x2, y2) {
    return Math.sqrt(
      Math.pow(x1 - x2, 2)
      + Math.pow(y1 - y2, 2)
    );
  }

  createSvgElement(tagName) {
    return document.createElementNS(
      'http://www.w3.org/2000/svg',
      tagName
    );
  }
}