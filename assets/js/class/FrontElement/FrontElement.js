export default class {
  constructor() {
    Object.assign(this, {
      animationPathCounter: 0,
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

  animatePath(path, animation, animationDelay = 0) {
    let length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;

    if (typeof animation === 'function') {
      animation(path, length);
    } else {
      path.style.animation = animation;
    }
    path.style.animationDelay = animationDelay + 's';
  }

  animatePathShadowItem(path, length) {
    let sheet = this.elStyleSheet.sheet;

    sheet.insertRule('\
            @keyframes displayPathShadow' + this.animationPathCounter + ' {\
                0% {\
                  stroke-dashoffset: ' + length + ';\
                }\
                50% {\
                  stroke-dashoffset: 0;\
                }\
                100% {\
                  stroke-dashoffset: ' + -length + ';\
                }\
            }\
            ', (sheet.cssRules || sheet.rules).length);
    path.style.animation = 'displayPathShadow' + this.animationPathCounter + ' .4s cubic-bezier(.36,.34,.29,1) forwards';

    this.animationPathCounter++;
  }
}