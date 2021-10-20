import FrontElement from "../FrontElement/FrontElement";

export default class extends FrontElement {
  constructor(manager) {
    super();

    this.manager = manager;

    Object.assign(this, {
      timeTotal: 1000,
      timePercentageSecondPoint: .3,
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

    this.setPoint(
      'start',
      manager.mouseX,
      manager.mouseY
    );

    setTimeout(() => {
      this.setPoint(
        'end',
        manager.mouseX,
        manager.mouseY
      );

      this.elSvg = document.createElement('svg');
      this.elSvg.setAttribute('id', 'mouse-tail-svg');

      this.setSvgPosition('x');
      this.setSvgPosition('y');

      document.body.appendChild(this.elSvg);
    }, this.timeTotal * this.timePercentageSecondPoint);

    setTimeout(() => {
      this.elSvg.parentNode.removeChild(this.elSvg);
    }, this.timeTotal);
  }

  setSvgPosition(direction) {
    let length = this.manager[this.direction[direction].mouse] - this.points.start[direction];
    let pointName = length > 0 ? 'start' : 'end';
    this.elSvg.style[this.direction[direction].position] = this.points[pointName][direction] + 'px';
    this.elSvg.style[this.direction[direction].size] = Math.abs(length) + 'px';
  }

  setPoint(name, x, y) {
    this.points[name].x = x;
    this.points[name].y = y;
  }
}