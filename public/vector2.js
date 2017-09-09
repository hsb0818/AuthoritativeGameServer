class Vector2 {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  RotateByRad(radian) {
    const ca = Math.cos(radian);
    const sa = Math.sin(radian);
    this.x = (ca * this.x - sa * this.y);
    this.y = (sa * this.x + ca * this.y);
  }

  RotateByDeg(degree) {
    this.RotateByRad(degree * Math.PI / 180);
  }

  Mul(scalar) {
    this.x *= scalar;
    this.y *= scalar;
  }
}

if (typeof module !== 'undefined') {
  module.exports = Vector2;
}
