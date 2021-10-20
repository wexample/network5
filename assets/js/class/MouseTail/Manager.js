window.log = (m) => {
  // Temp
  console.log(m);
}

export default class {
  constructor() {
    Object.assign(this, {
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
    this.refreshMouseTail();
  }

  refreshMouseTail() {
    let style = this.elMouseCircle.style;
    let minLimit = 15;
    let maxLimit = 50;
    let persistence = 0.8;
    let multiplier = 10;

    this.mouseCircleRadius =
      Math.sqrt(
        Math.pow(this.mouseX - this.mouseXPrevious, 2)
        + Math.pow(this.mouseY - this.mouseYPrevious, 2)
      )
      * multiplier;

    // Max size limit.
    if (this.mouseCircleRadius > maxLimit) {
      this.mouseCircleRadius = maxLimit;
    }

    this.mouseCircleRadius = (this.mouseCircleRadius * (1 - persistence))
      + (this.mouseCircleRadiusPrevious * persistence);

    if (this.mouseCircleRadius < minLimit) {
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