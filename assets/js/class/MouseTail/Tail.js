export default class {
  constructor(manager) {
    this.manager = manager;

    Object.assign(this, {
      lifetime: 300,
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

    this.elSvg = document.createElement('svg');
    this.elSvg.setAttribute('id', 'mouse-tail-svg');
    document.body.appendChild(this.elSvg);

    this.elSvg.style.left = this.points.start.x + 'px';
    this.elSvg.style.top = this.points.start.y + 'px';

    setTimeout(() => {
      this.elSvg.parentNode.removeChild(this.elSvg);
    }, this.lifetime);
  }

  setPoint(name, x, y) {
    this.points[name].x = x;
    this.points[name].y = y;
  }
}