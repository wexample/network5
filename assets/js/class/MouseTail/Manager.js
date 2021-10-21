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
      frameRate: 20,
      tails: [],
      minLimitTail: 10,
      mouseCircleRadius: 0,
      mouseCircleRadiusPrevious: 0,
      mouseX: 0,
      mouseXPrevious: 0,
      mouseY: 0,
      mouseYPrevious: 0,
    });

    // Create circle el.
    this.elMouseCircle = document.createElement('div');
    this.elMouseCircle.classList.add('mouse-circle');
    this.elMouseCircle.style.width = '100px';
    this.elMouseCircle.style.height = '100px';
    document.body.appendChild(this.elMouseCircle);

    // Create style sheet.
    this.elStyleSheet = document.createElement('style');
    document.head.appendChild(this.elStyleSheet);

    document.addEventListener('mousemove', this.onMouseMove.bind(this));

    this.start();
  }

  start() {
    this.mouseTailInterval = setInterval(this.onInterval.bind(this), 1000 / this.frameRate);
  }

  stop() {
    clearInterval(this.mouseTailInterval);
  }

  onInterval() {
    window.requestAnimationFrame(this.onFrame.bind(this));
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
      // Create e new tail only for certain conditions.
      if (!this.tailCurrent || this.tailCurrent.secondPointRendered) {
        this.tailCurrent = new Tail(this);
        this.tails.push(this.tailCurrent);

        this.tailCurrent.render();
      }
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