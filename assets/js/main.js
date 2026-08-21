/* =============================================================================
   JOGAMOS SHOP — motor da página
   Um único requestAnimationFrame + IntersectionObserver.
   Zero dependências. Só transform/opacity (compositor).
   ========================================================================== */
(function () {
  'use strict';

  var cfg = window.siteConfig || {};
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* ---------------------------------------------------------- 1. CONFIG --
     Aplica site.config.js sobre o HTML. Os links já existem no HTML para
     que a página funcione sem JavaScript; aqui eles são sobrescritos.
     -------------------------------------------------------------------- */
  function applyConfig() {
    var map = [
      ['[data-wa]',        cfg.whatsappGroupUrl],
      ['[data-wa-direct]', cfg.whatsappDirectUrl],
      ['[data-ig]',        cfg.instagramUrl]
    ];
    map.forEach(function (pair) {
      if (!pair[1]) return;
      $$(pair[0]).forEach(function (el) { el.setAttribute('href', pair[1]); });
    });

    if (cfg.email) {
      $$('[data-email]').forEach(function (el) { el.setAttribute('href', 'mailto:' + cfg.email); });
    }

    // Números de prova social. Nada é inventado: sem valor, o card fica marcado.
    var stats = cfg.stats || [];
    $$('[data-stat]').forEach(function (el) {
      var s = stats[Number(el.getAttribute('data-stat'))];
      var box = el.closest('.stat');
      if (!s || s.value === null || s.value === undefined || s.value === '') {
        if (box) box.classList.add('is-empty');
        el.textContent = '—';
        return;
      }
      el.textContent = String(s.value) + (s.suffix || '');
      el.setAttribute('data-final', String(s.value) + (s.suffix || ''));
      if (s.label) {
        var lbl = box && box.querySelector('.stat__l');
        if (lbl) lbl.textContent = s.label;
      }
    });

    // Imagens reais substituem os placeholders.
    var imgs = cfg.images || {};
    $$('[data-img]').forEach(function (el) {
      var src = imgs[el.getAttribute('data-img')];
      if (!src) return;
      // Foto real já no HTML: basta trocar o endereço.
      if (el.tagName === 'IMG') { el.src = src; return; }
      // Placeholder: injeta a imagem por cima.
      var img = new Image();
      img.src = src;
      img.alt = el.getAttribute('aria-label') || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      el.appendChild(img);
      el.classList.add('has-img');
      el.removeAttribute('role');
      el.removeAttribute('aria-label');
    });

    // A nota de edição some sozinha assim que todos os números forem preenchidos.
    var pend = document.querySelectorAll('.stat.is-empty').length;
    var note = document.querySelector('.proof .note');
    if (note && pend === 0) note.remove();

    var y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------- 2. REVELAÇÕES */
  function initReveals() {
    var items = $$('[data-reveal],[data-reveal-x],[data-reveal-scale]');

    // Stagger: data-d define a ordem; filhos de [data-reveal-scale] escalonam sozinhos.
    items.forEach(function (el) {
      var d = el.getAttribute('data-d');
      if (d) el.style.setProperty('--d', d);
      if (el.hasAttribute('data-reveal-scale')) {
        $$(':scope > span', el).forEach(function (sp, i) { sp.style.setProperty('--d', i); });
      }
    });

    var phone = $('#phone');
    var watch = phone ? items.concat([phone]) : items;

    if (reduce.matches || !('IntersectionObserver' in window)) {
      watch.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    watch.forEach(function (el) { io.observe(el); });
  }

  /* --------------------------------------------------------- 3. SCROLL --
     Um só loop. Lê layout de todos, depois escreve — evita layout thrashing.
     Elementos com parallax só são calculados enquanto estão na viewport.
     -------------------------------------------------------------------- */
  function initScroll() {
    var nav   = $('#nav');
    var fab   = $('#fab');
    var track = $('#track');
    var fill  = $('#trackFill');
    var finalSec = $(".final");
    var finalBg = $('.final__bg');

    var pxEls = $$('[data-px]');
    var live  = [];   // elementos com parallax atualmente visíveis
    var ticking = false;

    if ('IntersectionObserver' in window && !reduce.matches) {
      var pio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var i = live.indexOf(e.target);
          if (e.isIntersecting && i === -1) live.push(e.target);
          else if (!e.isIntersecting && i > -1) live.splice(i, 1);
        });
      }, { rootMargin: '20% 0px 20% 0px' });
      pxEls.forEach(function (el) { pio.observe(el); });
    }

    function frame() {
      ticking = false;
      var vh = window.innerHeight;
      var y  = window.scrollY || window.pageYOffset;

      // ---- leituras
      var reads = live.map(function (el) {
        return { el: el, r: el.getBoundingClientRect(), s: parseFloat(el.getAttribute('data-px')) || 0 };
      });
      var trackR = track ? track.getBoundingClientRect() : null;
      var finalR = finalSec ? finalSec.getBoundingClientRect() : null;

      // ---- escritas
      if (nav) nav.classList.toggle('is-stuck', y > 24);

      if (fab) {
        // aparece depois do hero; some quando o CTA final já está na tela
        var finalVisible = finalR ? finalR.top < vh * 0.72 : false;
        fab.classList.toggle('is-on', y > vh * 0.6 && !finalVisible);
      }

      if (!reduce.matches) {
        reads.forEach(function (o) {
          var off = ((o.r.top + o.r.height / 2) - vh / 2) / vh;
          o.el.style.setProperty('--py', (off * o.s * 110).toFixed(1) + 'px');
        });

        if (trackR && fill) {
          var p = clamp((vh * 0.72 - trackR.top) / Math.max(1, trackR.height * 0.72), 0, 1);
          fill.style.setProperty('--fill', (p * 100).toFixed(1) + '%');
        }

        if (finalR && finalBg) {
          var fp = clamp((vh - finalR.top) / (vh + finalR.height), 0, 1);
          finalBg.style.setProperty('--zoom', (1 + fp * 0.3).toFixed(3));
        }
      } else if (trackR && fill) {
        fill.style.setProperty('--fill', '100%');
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    frame();
  }

  /* ------------------------------------------------------- 4. ACCORDION */
  function initAccordion() {
    $$('.acc__q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        var open  = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        if (panel) panel.setAttribute('data-open', String(!open));
      });
    });
  }

  /* ----------------------------------------------------- 5. MENU MOBILE */
  function initMenu() {
    var burger = $('#burger');
    var menu   = $('#menu');
    if (!burger || !menu) return;

    function set(open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      menu.classList.toggle('is-open', open);
    }

    burger.addEventListener('click', function () {
      set(burger.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') set(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        set(false);
        burger.focus();
      }
    });
  }

  /* --------------------------------------------------- 6. MEDIR CLIQUES --
     Envia o evento para o dataLayer (GTM) ou gtag, se existirem.
     Sem nenhuma das duas, não faz nada e não quebra.
     -------------------------------------------------------------------- */
  function initTracking() {
    $$('[data-track]').forEach(function (el) {
      el.addEventListener('click', function () {
        var where = el.getAttribute('data-track');
        if (window.dataLayer) {
          window.dataLayer.push({ event: 'clique_grupo_whatsapp', origem: where });
        }
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'clique_grupo_whatsapp', { origem: where });
        }
      });
    });
  }

  /* ------------------------------------------------------------- START -- */
  function start() {
    applyConfig();
    initReveals();
    initScroll();
    initAccordion();
    initMenu();
    initTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
