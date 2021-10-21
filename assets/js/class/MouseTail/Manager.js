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
      minLimitTail: 100,
      mouseCircleRadius: 0,
      mouseCircleRadiusPrevious: 0,
      mouseX: 0,
      mouseXPrevious: 0,
      mouseY: 0,
      mouseYPrevious: 0,
      tailTimeSecondPoint: 200
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

    this.requestNextFrame();
  }

  requestNextFrame(time, callback) {
    setTimeout(() => {
      window.requestAnimationFrame(this.onFrame.bind(this));
      callback && callback();
    }, time);
  }

  onFrame() {
    this.refreshMouseDistance();
    this.refreshMouseTails(this.refreshMouseCircle.bind(this));
  }

  refreshMouseDistance() {
    this.mouseDistance = this.calcDistance(
      this.mouseX,
      this.mouseY,
      this.mouseXPrevious,
      this.mouseYPrevious
    );
  }

  refreshMouseTails(onNewTail) {
    if (this.mouseDistance > this.minLimitTail) {
      // Create e new tail only for certain conditions.
      let tail = new Tail(this);
      tail.render();
      // Wait at least the time of the second point creation,
      // it let the time to avoid two lines overlaps.
      this.requestNextFrame(this.tailTimeSecondPoint, onNewTail);
      return true;
    } else {
      this.requestNextFrame();
      return false;
    }
  }

  refreshMouseCircle() {
    let style = this.elMouseCircle.style;
    let maxLimitCircle = 200;
    let persistence = 0.4;
    let multiplier = .3;

    this.mouseCircleRadius = this.mouseDistance * multiplier;

    // Max size limit.
    if (this.mouseCircleRadius > maxLimitCircle) {
      this.mouseCircleRadius = maxLimitCircle;
    }

    this.mouseCircleRadius = (this.mouseCircleRadius * (1 - persistence))
      + (this.mouseCircleRadiusPrevious * persistence);

    style.display = 'block';

    let mouseCircleRadiusHalf = this.mouseCircleRadius / 2;

    Object.assign(style, {
      width: this.convertPosition(this.mouseCircleRadius),
      height: this.convertPosition(this.mouseCircleRadius),
      left: this.convertPosition(this.mouseX - mouseCircleRadiusHalf),
      top: this.convertPosition(this.mouseY - mouseCircleRadiusHalf),
    });

    this.mouseCircleRadiusPrevious = this.mouseCircleRadius;

    setTimeout(() => {
      style.display = 'none';
    }, 200);
  }

  onMouseMove(event) {
    this.mouseXPrevious = this.mouseX;
    this.mouseYPrevious = this.mouseY;
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }
}