/* =============================================================================
   JOGAMOS SHOP — visual do hero
   Um campo de partículas desenhando o arco do sorriso do logotipo.
   Canvas 2D puro. Sem biblioteca. Pausa fora da viewport.
   ========================================================================== */
(function () {
  'use strict';

  var cv = document.getElementById('heroFx');
  if (!cv || !cv.getContext) return;

  var ctx = cv.getContext('2d', { alpha: true });
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var small  = window.matchMedia('(max-width: 760px)');

  var W = 0, H = 0, dpr = 1;
  var parts = [];
  var raf = 0;
  var visible = true;
  var t = 0;

  function build() {
    var n = small.matches ? 190 : 460;
    parts = [];

    for (var i = 0; i < n; i++) {
      // 80% no arco do sorriso, 20% soltos ao fundo
      var onArc = Math.random() < 0.8;
      parts.push({
        arc: onArc,
        a: 0.04 * Math.PI + Math.random() * 0.92 * Math.PI, // ângulo no arco
        j: (Math.random() - 0.5) * (onArc ? 0.13 : 0),      // desvio radial
        x: Math.random(),                                    // posição livre (0..1)
        y: Math.random(),
        r: onArc ? 0.6 + Math.random() * 1.5 : 0.5 + Math.random() * 1.1,
        sp: 0.15 + Math.random() * 0.5,                      // velocidade do brilho
        ph: Math.random() * Math.PI * 2,                     // fase
        w: Math.random() < 0.14                              // partícula branca
      });
    }
  }

  function size() {
    var rect = cv.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    dpr = Math.min(window.devicePixelRatio || 1, small.matches ? 1.25 : 1.5);
    W = rect.width;
    H = rect.height;
    cv.width  = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    var cx = W * 0.5;
    var cy = H * 0.40;
    var R  = Math.min(W, H) * (small.matches ? 0.52 : 0.44);

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i], x, y;

      if (p.arc) {
        // onda sutil percorrendo o arco
        var wave = Math.sin(t * 0.5 + p.a * 3.2) * 0.022;
        var rad = R * (1 + p.j + wave);
        x = cx + Math.cos(p.a) * rad;
        y = cy + Math.sin(p.a) * rad;
      } else {
        x = p.x * W + Math.cos(t * 0.16 + p.ph) * 8;
        y = p.y * H + Math.sin(t * 0.12 + p.ph) * 8;
      }

      if (x < -8 || x > W + 8 || y < -8 || y > H + 8) continue;

      var tw = 0.42 + 0.58 * (0.5 + 0.5 * Math.sin(t * p.sp + p.ph));
      var alpha = (p.arc ? 0.85 : 0.32) * tw;

      ctx.beginPath();
      ctx.arc(x, y, p.r, 0, 6.2832);
      ctx.fillStyle = p.w
        ? 'rgba(255,255,255,' + (alpha * 0.9).toFixed(3) + ')'
        : 'rgba(74,74,255,' + alpha.toFixed(3) + ')';
      ctx.fill();
    }
  }

  function loop() {
    t += 0.016;
    draw();
    raf = requestAnimationFrame(loop);
  }

  function play() {
    if (raf || reduce.matches) return;
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  function boot() {
    size();
    build();
    draw();                       // primeiro quadro imediato (sem flash)
    if (reduce.matches) return;   // movimento desativado: fica no quadro estático
    if (visible) play();
  }

  // pausa quando o hero sai da tela ou a aba fica em segundo plano
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting;
      visible ? play() : stop();
    }, { threshold: 0 }).observe(cv);
  }
  document.addEventListener('visibilitychange', function () {
    document.hidden || !visible ? stop() : play();
  });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(boot, 180);
  }, { passive: true });

  if (reduce.addEventListener) reduce.addEventListener('change', boot);

  boot();
})();
