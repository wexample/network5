import FrontElement from '../FrontElement/FrontElement';

export default class extends FrontElement {
  constructor(manager) {
    super();
    this.manager = manager;

    Object.assign(this, {
      minDistance: 10,
      strokeWidth: 10,
      points: {
        start: {
          x: 0,
          y: 0,
        },
        end: {
          x: 0,
          y: 0,
        },
      },
    });

    this.strokeWidthHalf = this.strokeWidth / 2;
  }

  render() {
    this.setPoint('start', this.manager.mouseX, this.manager.mouseY);

    setTimeout(
      this.renderSecondPoint.bind(this),
      this.manager.tailTimeSecondPoint
    );
  }

  renderSecondPoint() {
    let pointStart = this.points.start;
    let distance = this.calcDistance(
      this.manager.mouseX,
      this.manager.mouseY,
      pointStart.x,
      pointStart.y
    );

    // The minimal distance between first and second points is too small.
    if (distance < this.minDistance) {
      this.destroy();
      return;
    }

    this.setPoint('end', this.manager.mouseX, this.manager.mouseY);

    this.elSvg = this.createSvgElement('svg');
    this.elSvg.classList.add('mouse-tail-svg');

    let width = this.setSvgPosition('x');
    let height = this.setSvgPosition('y');

    this.elPath = this.createSvgElement('path');
    this.elPath.style.strokeWidth = this.strokeWidth;
    this.elPath.setAttribute(
      'd',
      `M` +
        `${width < 0 ? -width + this.strokeWidthHalf : this.strokeWidthHalf} ` +
        `${
          height < 0 ? -height + this.strokeWidthHalf : this.strokeWidthHalf
        }, ` +
        `${width > 0 ? width + this.strokeWidthHalf : this.strokeWidthHalf} ` +
        `${height > 0 ? height + this.strokeWidthHalf : this.strokeWidthHalf} `
    );

    this.animatePath(
      this.elPath,
      this.animatePathShadowItem.bind(this.manager),
      0.05
    );

    this.elSvg.appendChild(this.elPath);
    document.body.appendChild(this.elSvg);
  }

  destroy() {
    this.renderEnd();
  }

  renderEnd() {
    this.elSvg && this.elSvg.parentNode.removeChild(this.elSvg);
  }

  setSvgPosition(direction) {
    let directionsMap = this.directionsMap;
    let length =
      this.manager[directionsMap[direction].mouse] -
      this.points.start[direction];
    let pointName = length > 0 ? 'start' : 'end';
    let position = this.points[pointName][direction] - this.strokeWidthHalf;
    this.elSvg.style[directionsMap[direction].position] =
      this.convertPosition(position);
    this.elSvg.style[directionsMap[direction].size] = this.convertPosition(
      Math.abs(length) + this.strokeWidth
    );

    return length;
  }

  setPoint(name, x, y) {
    this.points[name].x = x;
    this.points[name].y = y;
  }
}
