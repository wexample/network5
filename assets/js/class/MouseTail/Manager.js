window.log = (m) => {
  // Temp
  console.log(m);
}

export default class {
  constructor() {
    Object.assign(this, {
      mouseCircleRadius: 0,
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
    this.mouseCircleRadius =
      Math.sqrt(
        Math.pow(this.mouseX - this.mouseXPrevious, 2)
        + Math.pow(this.mouseY - this.mouseYPrevious, 2)
      );
    let style = this.elMouseCircle.style;
    let maxLimit = 80;

    // Max size limit.
    if (this.mouseCircleRadius > maxLimit) {
      this.mouseCircleRadius = maxLimit;
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
  }

  onMouseMove(event) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }
}