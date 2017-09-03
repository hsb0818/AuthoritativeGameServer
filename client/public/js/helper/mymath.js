const MyMath = {};

(function() {
  MyMath.Lerp = Lerp;
  MyMath.Lerp2 = Lerp2;

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
