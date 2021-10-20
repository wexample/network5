export default class {
  constructor() {
    Object.assign(this, {
      mouseCircleRadius: 0,
      mouseXPrevious: 0,
      mouseYPrevious: 0,
    });

    this.elMouseCircle = document.createElement('div');
    this.elMouseCircle.classList.add('mouse-circle');

    this.elMouseCircle.style.width = '100px';
    this.elMouseCircle.style.height = '100px';

    document.body.appendChild(this.elMouseCircle);

    document.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onMouseMove(event) {
    this.mouseCircleRadius =
      Math.sqrt(
        Math.pow(event.clientX - this.mouseXPrevious, 2)
        + Math.pow(event.clientY - this.mouseYPrevious, 2)
      );
    let style = this.elMouseCircle.style;
    let maxLimit = 80;

    // Min size limit.
    if (this.mouseCircleRadius < 30) {
      this.mouseCircleRadius = 0;
      style.display = 'none';
    } else {
      style.display = '';
      // Max size limit.
      if (this.mouseCircleRadius > maxLimit) {
        this.mouseCircleRadius = maxLimit;
      }
    }

    let mouseCircleRadiusHalf = this.mouseCircleRadius / 2;

    Object.assign(style, {
      width: this.mouseCircleRadius + 'px',
      height: this.mouseCircleRadius + 'px',
      left: (event.clientX - mouseCircleRadiusHalf) + 'px',
      top: (event.clientY - mouseCircleRadiusHalf) + 'px',
    });

    this.mouseXPrevious = event.clientX;
    this.mouseYPrevious = event.clientY;
  }
}