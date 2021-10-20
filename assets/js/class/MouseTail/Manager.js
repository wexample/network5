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
    this.mouseCircleRadius = Math.abs(event.clientX - this.mouseXPrevious);

    this.elMouseCircle.style.width = this.mouseCircleRadius + 'px';
    this.elMouseCircle.style.height = this.mouseCircleRadius + 'px';

    this.elMouseCircle.style.left = event.clientX + 'px';
    this.elMouseCircle.style.top = event.clientY + 'px';

    this.mouseXPrevious = event.clientX;
    this.mouseYPrevious = event.clientY;
  }
}