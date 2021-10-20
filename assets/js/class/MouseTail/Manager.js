import Tail from "./Tail";
import FrontElement from "../FrontElement/FrontElement";

window.log = (m) => {
  // Temp
  console.log(m);
}

export default class extends FrontElement {
  constructor() {
    super();

    Object.assign(this, {
      minLimitTail: 150,
      mouseCircleRadius: 0,
      mouseCircleRadiusPrevious: 0,
      mouseX: 0,
      mouseXPrevious: 0,
      mouseY: 0,
      mouseYPrevious: 0,
      frameRate: 20,
    });

    this.elMouseCircle = document.createElement('div');
    this.elMouseCircle.classList.add('mouse-circle');

    this.elMouseCircle.style.width = '100px';
    this.elMouseCircle.style.height = '100px';

    document.body.appendChild(this.elMouseCircle);

    document.addEventListener('mousemove', this.onMouseMove.bind(this));

    this.start();
  }

  start() {
    this.mouseTailInterval = setInterval(this.onFrame.bind(this), 1000 / this.frameRate);
  }

  stop() {
    clearInterval(this.mouseTailInterval);
  }

  onFrame() {
    this.refreshMouseDistance();
    this.refreshMouseCircle();
    this.refreshMouseTails();
  }

  refreshMouseDistance() {
    this.mouseDistance = this.calcDistance(
      this.mouseX,
      this.mouseY,
      this.mouseXPrevious,
      this.mouseYPrevious
    );
  }

  refreshMouseTails() {
    if (this.mouseDistance > this.minLimitTail) {
      let tail = new Tail(this);
    }
  }

  refreshMouseCircle() {
    let style = this.elMouseCircle.style;
    let minLimitCircle = 15;
    let maxLimitCircle = 50;
    let persistence = 0.8;
    let multiplier = 10;

    this.mouseCircleRadius = this.mouseDistance * multiplier;

    // Max size limit.
    if (this.mouseCircleRadius > maxLimitCircle) {
      this.mouseCircleRadius = maxLimitCircle;
    }

    this.mouseCircleRadius = (this.mouseCircleRadius * (1 - persistence))
      + (this.mouseCircleRadiusPrevious * persistence);

    if (this.mouseCircleRadius < minLimitCircle) {
      style.display = 'none';
    } else {
      style.display = '';
    }

    let mouseCircleRadiusHalf = this.mouseCircleRadius / 2;

    Object.assign(style, {
      width: this.mouseCircleRadius + 'px',
      height: this.mouseCircleRadius + 'px',
      left: (this.mouseX - mouseCircleRadiusHalf) + 'px',
      top: (this.mouseY - mouseCircleRadiusHalf) + 'px',
    });

    this.mouseXPrevious = this.mouseX;
    this.mouseYPrevious = this.mouseY;
    this.mouseCircleRadiusPrevious = this.mouseCircleRadius;
  }

  onMouseMove(event) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }
}