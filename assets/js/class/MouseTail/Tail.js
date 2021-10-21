import FrontElement from "../FrontElement/FrontElement";

export default class extends FrontElement {
  constructor(manager) {
    super();
    this.manager = manager;

    Object.assign(this, {
      timeTotal: 500,
      timePercentageSecondPoint: .1,
      secondPointRendered: false,
      strokeWidth: 10,
      points: {
        start: {
          x: 0,
          y: 0,
        },
        end: {
          x: 0,
          y: 0,
        }
      }
    });

    this.strokeWidthHalf = this.strokeWidth / 2;
  }

  render() {
    this.setPoint(
      'start',
      this.manager.mouseX,
      this.manager.mouseY
    );

    setTimeout(
      this.renderSecondPoint.bind(this),
      this.timeTotal * this.timePercentageSecondPoint
    );

    setTimeout(
      this.renderEnd.bind(this),
      this.timeTotal
    );
  }

  renderPoint(name) {
    let point = this.points[name];
    let elPoint = document.createElement('div');
    elPoint.classList.add('mouse-tail-point');
    document.body.appendChild(elPoint);
    elPoint.style.left = this.convertPosition(point.x);
    elPoint.style.top = this.convertPosition(point.y);
  }

  convertPosition(number) {
    return number + 'px';
  }

  renderSecondPoint() {
    this.setPoint(
      'end',
      this.manager.mouseX,
      this.manager.mouseY
    );

    this.elSvg = this.createSvgElement('svg');
    this.elSvg.classList.add('mouse-tail-svg');

    let width = this.setSvgPosition('x');
    let height = this.setSvgPosition('y');

    this.elPath = this.createSvgElement('path');
    this.elPath.style.strokeWidth = this.strokeWidth;
    this.elPath.setAttribute('d',
      `M`
      + `${width < 0 ? -width + this.strokeWidthHalf : this.strokeWidthHalf} `
      + `${height < 0 ? -height + this.strokeWidthHalf : this.strokeWidthHalf}, `
      + `${width > 0 ? width + this.strokeWidthHalf : this.strokeWidthHalf} `
      + `${height > 0 ? height + this.strokeWidthHalf : this.strokeWidthHalf} `
    );

    this.elSvg.appendChild(this.elPath);
    document.body.appendChild(this.elSvg);

    this.secondPointRendered = true;
  }

  renderEnd() {
    this.elSvg.parentNode.removeChild(this.elSvg);
  }

  setSvgPosition(direction) {
    let directionsMap = this.directionsMap;
    let length = this.manager[directionsMap[direction].mouse] - this.points.start[direction];
    let pointName = length > 0 ? 'start' : 'end';
    let position = this.points[pointName][direction] - this.strokeWidthHalf;
    this.elSvg.style[directionsMap[direction].position] = position + 'px';
    this.elSvg.style[directionsMap[direction].size] = (Math.abs(length) + this.strokeWidth) + 'px';

    return length;
  }

  setPoint(name, x, y) {
    this.points[name].x = x;
    this.points[name].y = y;
  }
}