const MyMath = {};

(function() {
  MyMath.PI2Rad = (angle) => { return angle * (Math.PI / 180.0); };
  MyMath.Rad2PI = (rad) => { return rad * (180.0 / Math.PI); };
  MyMath.Lerp = Lerp;
  MyMath.Lerp2 = Lerp2;

  function Magnitude(v) {
    return sqrt(pow(v.x, 2) + pow(v.y, 2));
  }

  function Lerp(a, b, t) {
    t = t > 1.0 ? 1.0 : t;
    return a + (b - a) * t;
  }

  function Lerp2(a, b, t) {
    t = t > 1.0 ? 1.0 : t;
    return {
      x: Lerp(a.x, b.x, t),
      y: Lerp(a.y, b.y, t)
    };
  }
})();
