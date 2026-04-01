// ==============================
// ANTI-SPAM GLOBAL COUNTERS
// ==============================
var omegaMouseMoves = 0, omegaKeysPressed = 0, omegaHasScrolled = false;
var omegaIsTouched = ('ontouchstart' in window);
document.addEventListener('mousemove', function () { omegaMouseMoves++; });
document.addEventListener('keydown',   function () { omegaKeysPressed++; });
window.addEventListener('scroll',      function () { omegaHasScrolled = true; }, { passive: true });

(function ($) {
  "use strict";

  /* ==============================
     01. Preloader
  ================================ */
  $(window).on('load', function () {
    setTimeout(function () {
      $('.preloader').addClass('hide');
    }, 800);
  });

  /* ==============================
     02. Sticky Header
  ================================ */
  var $header = $('header.main-header .header-sticky');
  var lastScroll = 0;

  $(window).on('scroll', function () {
    var scrollY = $(this).scrollTop();

    // active = stronger shadow when scrolled
    if (scrollY > 80) {
      $header.addClass('active');
    } else {
      $header.removeClass('active');
    }

    // hide = slide up when scrolling down past fold
    if (scrollY > lastScroll && scrollY > 300) {
      $header.addClass('hide');
    } else {
      $header.removeClass('hide');
    }
    lastScroll = scrollY;
  });

  /* ==============================
     03. Mobile Menu (SlickNav)
  ================================ */
  if ($('#menu').length) {
    $('#menu').slicknav({
      label: '',
      prependTo: '.responsive-menu',
      allowParentLinks: true,
      afterClose: function () {
        // Hide the menu container after slicknav finishes its slideUp animation
        $('.slicknav_menu').hide();
      }
    });
  }

  // Connect custom hamburger to SlickNav menu
  // NOTE: .triggerHandler() vs .trigger() - must use triggerHandler to prevent
  // event bubbling back up to #mobileToggle (slicknav_btn is injected inside navbar-toggle)
  $('#mobileToggle').on('click', function (e) {
    if ($(e.target).closest('.slicknav_btn').length) return;
    var isOpen = $(this).hasClass('open');
    $(this).toggleClass('open');
    if (!isOpen) {
      // Opening: show container first so slicknav can animate nav inside it
      $('.slicknav_menu').show();
    }
    // Closing: slicknav slideUp nav, then afterClose callback hides container
    $('.slicknav_btn').triggerHandler('click');
  });

  /* ==============================
     04. WOW Animations
  ================================ */
  if (typeof WOW !== 'undefined') {
    new WOW({
      boxClass: 'wow',
      animateClass: 'animated',
      offset: 80,
      mobile: false,
      live: true
    }).init();
  }

  /* ==============================
     05. Counter Up
  ================================ */
  if ($('.count-up').length) {
    $('.count-up').counterUp({
      delay: 10,
      time: 1500
    });
  }

  /* ==============================
     06. Testimonials / Logo Slider (Swiper)
  ================================ */
  if ($('.client-swiper').length) {
    new Swiper('.client-swiper .swiper', {
      slidesPerView: 2,
      spaceBetween: 24,
      loop: true,
      autoplay: { delay: 2500, disableOnInteraction: false },
      breakpoints: {
        480: { slidesPerView: 3 },
        768: { slidesPerView: 4 },
        1024: { slidesPerView: 5 },
      }
    });
  }

  if ($('.news-swiper').length) {
    new Swiper('.news-swiper .swiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoplay: { delay: 4000 },
      pagination: { el: '.news-pagination', clickable: true },
      breakpoints: {
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }
    });
  }

  if ($('.testimonial-slider').length) {
    new Swiper('.testimonial-slider .swiper', {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: true,
      autoplay: { delay: 5000 },
      pagination: { el: '.testimonial-pagination', clickable: true },
      navigation: {
        nextEl: '.testimonial-button-next',
        prevEl: '.testimonial-button-prev',
      },
      breakpoints: {
        1024: { slidesPerView: 2 },
      }
    });
  }

  /* ==============================
     07. Video Popup (Magnific)
  ================================ */
  if ($('.popup-video').length && typeof $.fn.magnificPopup !== 'undefined') {
    $('.popup-video').magnificPopup({
      type: 'iframe',
      iframe: {
        markup: '<div class="mfp-iframe-scaler">' +
          '<div class="mfp-close"></div>' +
          '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +
          '</div>',
        patterns: {
          youtube: { index: 'youtube.com/', id: 'v=', src: '//www.youtube.com/embed/%id%?autoplay=1' }
        },
        srcAction: 'iframe_src'
      }
    });
  }

  /* ==============================
     08. Smooth Scroll to anchor
  ================================ */
  $('a[href^="#"]').not('[href="#"]').on('click', function (e) {
    var target = $(this.hash);
    if (target.length) {
      e.preventDefault();
      $('html, body').animate({ scrollTop: target.offset().top - 80 }, 600, 'swing');
    }
  });

  /* ==============================
     09. Tech Canvas – Particle Network (reusable)
  ================================ */
  function initTechCanvas(canvas, count) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W, H, particles = [];
    var PARTICLE_COUNT = count || 70;
    var MAX_DIST = 120;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r:  Math.random() * 2 + 1
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var dx   = particles[i].x - particles[j].x;
          var dy   = particles[i].y - particles[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0,166,81,' + (1 - dist / MAX_DIST) * 0.35 + ')';
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(82,194,122,0.7)';
        ctx.fill();
        p.x += p.vx;  p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* Hero canvas (index.html) */
  var heroCanvas = document.getElementById('tech-canvas');
  if (heroCanvas) initTechCanvas(heroCanvas, 80);

  /* ==============================
     09b. Greek Letters Network — ve-omega.html
     Ω (red, bold) + Greek letters (green). Lightning bolts when close.
  ================================ */
  function initGreekNetwork(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W, H;
    var GREEK = ['α','β','γ','δ','ε','ζ','η','θ','ι','κ','λ','μ','ν','ξ','ο','π','ρ','σ','τ','υ','φ','χ','ψ','ω'];
    var LIGHTNING_DIST = 130, CONNECT_DIST = 90;
    var letters = [];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', function() { resize(); buildLetters(); });
    resize();

    function buildLetters() {
      letters = [];
      var count = Math.floor(W * H / 14000);
      count = Math.max(18, Math.min(count, 40));
      /* Ω anchors */
      for (var k = 0; k < 4; k++) {
        letters.push({
          ch: 'Ω', x: Math.random()*W, y: Math.random()*H,
          vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5,
          angle: Math.random()*Math.PI*2,
          va: (Math.random()-0.5)*0.012,
          size: 24, bold: true, isOmega: true
        });
      }
      for (var i = 0; i < count; i++) {
        letters.push({
          ch: GREEK[i % GREEK.length],
          x: Math.random()*W, y: Math.random()*H,
          vx: (Math.random()-0.5)*0.55, vy: (Math.random()-0.5)*0.55,
          angle: Math.random()*Math.PI*2,
          va: (Math.random()-0.5)*0.015,
          size: 12 + Math.random()*6, bold: false, isOmega: false
        });
      }
    }
    buildLetters();

    /* Draw a jagged lightning bolt from (x1,y1) to (x2,y2) */
    function drawLightning(x1, y1, x2, y2, alpha) {
      var segs = 6;
      var dx = (x2-x1)/segs, dy = (y2-y1)/segs;
      var pts = [{x:x1,y:y1}];
      for (var s = 1; s < segs; s++) {
        var perp = (Math.random()-0.5) * 18;
        pts.push({ x: x1 + dx*s + dy/Math.abs(dy||1)*perp, y: y1 + dy*s - dx/Math.abs(dx||1)*perp });
      }
      pts.push({x:x2,y:y2});
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (var p = 1; p < pts.length; p++) ctx.lineTo(pts[p].x, pts[p].y);
      ctx.strokeStyle = 'rgba(255,26,34,'+Math.min(alpha*0.5,0.55)+')';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      /* connections */
      for (var i = 0; i < letters.length; i++) {
        for (var j = i+1; j < letters.length; j++) {
          var dx = letters[i].x - letters[j].x;
          var dy = letters[i].y - letters[j].y;
          var dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < LIGHTNING_DIST && (letters[i].isOmega || letters[j].isOmega)) {
            /* lightning only if one is Ω */
            var a = (1 - dist/LIGHTNING_DIST) * 0.7;
            drawLightning(letters[i].x, letters[i].y, letters[j].x, letters[j].y, a);
          } else if (dist < CONNECT_DIST && !letters[i].isOmega && !letters[j].isOmega) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255,255,255,'+(1-dist/CONNECT_DIST)*0.25+')';
            ctx.lineWidth = 0.7;
            ctx.moveTo(letters[i].x, letters[i].y);
            ctx.lineTo(letters[j].x, letters[j].y);
            ctx.stroke();
          }
        }
      }
      /* letters */
      letters.forEach(function(l) {
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.angle);
        ctx.font = (l.bold ? 'bold ' : '') + l.size + 'px serif';
        ctx.fillStyle = l.isOmega ? 'rgba(255,26,34,1)' : 'rgba(255,255,255,0.35)';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(l.ch, 0, 0);
        ctx.restore();
        l.x += l.vx; l.y += l.vy; l.angle += l.va;
        if (l.x < -20) l.x = W+20; if (l.x > W+20) l.x = -20;
        if (l.y < -20) l.y = H+20; if (l.y > H+20) l.y = -20;
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ==============================
     09c. Omega Assembly — giai-phap.html
     Latin letters float, then O m e g a converge → spell OMEGA → flash.
  ================================ */
  function initOmegaAssembly(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W, H;
    var LATIN = 'bcdfhijklnpqrstuvwxyz'.split('');
    var KEY   = ['O','m','e','g','a'];
    var letters = [], keyLetters = [];
    var phase = 0; /* 0=scatter 1=converge 2=flash 3=scatter */
    var phaseTimer = 0;
    var PHASE_SCATTER = 220, PHASE_CONVERGE = 120, PHASE_FLASH = 60;
    var flashAlpha = 0;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function buildLetters() {
      letters = [];
      var count = Math.floor(W * H / 12000);
      count = Math.max(15, Math.min(count, 35));
      for (var i = 0; i < count; i++) {
        letters.push({
          ch: LATIN[i % LATIN.length],
          x: Math.random()*W, y: Math.random()*H,
          vx: (Math.random()-0.5)*0.7, vy: (Math.random()-0.5)*0.7,
          angle: Math.random()*Math.PI*2, va: (Math.random()-0.5)*0.018,
          size: 14 + Math.random()*5
        });
      }
      /* key letters start scattered */
      KEY.forEach(function(ch) {
        keyLetters.push({
          ch: ch,
          x: Math.random()*W, y: Math.random()*H,
          vx: (Math.random()-0.5)*0.8, vy: (Math.random()-0.5)*0.8,
          angle: 0, va: (Math.random()-0.5)*0.02,
          size: 20
        });
      });
    }
    buildLetters();

    /* Convergence centre — randomised fresh each cycle */
    var convergeCx = W/2, convergeCy = H/2;

    function pickNewConvergePoint() {
      var fontSize = Math.min(W * 0.07, 52);
      var halfW = fontSize * (KEY.length - 1) / 2 + fontSize;
      var mX = Math.max(halfW + 10, W * 0.18);
      var mY = Math.max(fontSize, H * 0.18);
      convergeCx = mX + Math.random() * (W - mX * 2);
      convergeCy = mY + Math.random() * (H - mY * 2);
    }

    /* Target positions: "OMEGA" centred on convergence point */
    function getTargets() {
      var fontSize = Math.min(W * 0.07, 52);
      var spacing  = fontSize * 1.0;
      var totalW   = spacing * (KEY.length - 1);
      return KEY.map(function(_, i) {
        return { x: convergeCx - totalW/2 + i*spacing, y: convergeCy };
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      phaseTimer++;

      /* --- background letters --- */
      letters.forEach(function(l) {
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.angle);
        ctx.font = l.size + 'px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.30)';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(l.ch, 0, 0);
        ctx.restore();
        l.x += l.vx; l.y += l.vy; l.angle += l.va;
        if (l.x < -20) l.x = W+20; if (l.x > W+20) l.x = -20;
        if (l.y < -20) l.y = H+20; if (l.y > H+20) l.y = -20;
      });

      /* --- phase logic --- */
      if (phase === 0) {
        /* scatter: key letters roam freely */
        keyLetters.forEach(function(l) {
          l.x += l.vx; l.y += l.vy; l.angle += l.va;
          if (l.x < 20 || l.x > W-20) l.vx *= -1;
          if (l.y < 20 || l.y > H-20) l.vy *= -1;
        });
        if (phaseTimer > PHASE_SCATTER) { phase = 1; phaseTimer = 0; pickNewConvergePoint(); }

      } else if (phase === 1) {
        /* converge: each key letter moves toward its target */
        var targets = getTargets();
        var done = 0;
        keyLetters.forEach(function(l, i) {
          var tx = targets[i].x, ty = targets[i].y;
          l.x += (tx - l.x) * 0.06;
          l.y += (ty - l.y) * 0.06;
          l.angle += (0 - l.angle) * 0.1;
          if (Math.abs(l.x - tx) < 2 && Math.abs(l.y - ty) < 2) done++;
        });
        if (done === KEY.length || phaseTimer > PHASE_CONVERGE) { phase = 2; phaseTimer = 0; flashAlpha = 0; }

      } else if (phase === 2) {
        /* flash: draw assembled OMEGA with growing glow */
        flashAlpha = Math.min(1, phaseTimer / 20);
        var targets = getTargets();
        var fSize = Math.min(W * 0.07, 52) * (1 + flashAlpha * 0.35);
        /* glow – 2 lớp đỏ: halo rộng + tight glow */
        ctx.save();
        ctx.font = 'bold ' + fSize + 'px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,26,34,' + flashAlpha + ')';
        /* pass 1 – halo xanh lá neon rộng (tương phản bổ sung với đỏ) */
        ctx.shadowColor = '#39FF6A';
        ctx.shadowBlur  = 70 * flashAlpha;
        ctx.fillText('OMEGA', convergeCx, convergeCy);
        /* pass 2 – tight green glow sát chữ */
        ctx.shadowBlur  = 22 * flashAlpha;
        ctx.fillText('OMEGA', convergeCx, convergeCy);
        ctx.restore();
        /* keep key letters at target */
        keyLetters.forEach(function(l, i) { l.x = targets[i].x; l.y = targets[i].y; l.angle = 0; });
        if (phaseTimer > PHASE_FLASH) {
          phase = 3; phaseTimer = 0;
          /* re-scatter key letters */
          keyLetters.forEach(function(l) {
            l.vx = (Math.random()-0.5)*1.2; l.vy = (Math.random()-0.5)*1.2;
            l.va = (Math.random()-0.5)*0.02;
          });
        }

      } else {
        /* phase 3: fade out & scatter back to phase 0 */
        var targets = getTargets();
        keyLetters.forEach(function(l) {
          l.x += l.vx * 2; l.y += l.vy * 2;
        });
        if (phaseTimer > 50) { phase = 0; phaseTimer = 0; buildLetters(); keyLetters = []; KEY.forEach(function(ch) {
          keyLetters.push({ ch:ch, x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-0.5)*0.8, vy:(Math.random()-0.5)*0.8, angle:0, va:(Math.random()-0.5)*0.02, size:20 });
        }); }
      }

      /* draw key letters (phases 0,1,3) */
      if (phase !== 2) {
        keyLetters.forEach(function(l) {
          ctx.save();
          ctx.translate(l.x, l.y);
          ctx.rotate(l.angle);
          ctx.font = 'bold ' + l.size + 'px sans-serif';
          ctx.fillStyle = 'rgba(255,26,34,0.85)';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(l.ch, 0, 0);
          ctx.restore();
        });
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ==============================
     09d. Module Orbit — san-pham.html
     OMEGA product modules as capsule labels orbiting the core Ω in 3 depth-shaded
     elliptical rings. Integration beams flash when adjacent-ring modules align.
  ================================ */
  function initModuleOrbit(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W, H;

    var MODULES = [
      { name: 'OMEGA.ERP', ring: 0 },
      { name: 'OMEGA.GL',  ring: 0 },
      { name: 'OMEGA.HR',  ring: 0 },
      { name: 'OMEGA.MM',  ring: 1 },
      { name: 'OMEGA.WM',  ring: 1 },
      { name: 'OMEGA.PO',  ring: 1 },
      { name: 'OMEGA.SO',  ring: 1 },
      { name: 'OMEGA.CRM', ring: 1 },
      { name: 'OMEGA.FA',  ring: 2 },
      { name: 'OMEGA.PC',  ring: 2 },
      { name: 'OMEGA.QC',  ring: 2 },
      { name: 'OMEGA.APV', ring: 2 },
      { name: 'OMEGA.SCR', ring: 2 },
      { name: 'GAMA.SMB',  ring: 2 },
    ];
    var SPEED = [0.007, 0.0042, 0.0022];

    var nodes = [], beams = [], stars = [];
    var omegaPulse = 0, beamTimer = 0;

    /* logo SVG thay cho Ω */
    var logoImg = new Image(), logoReady = false;
    logoImg.onload = function() { logoReady = true; };
    logoImg.src = 'assets/images/omega-1A-white-buffer.svg';

    /* mouse tracking — center dời theo chuột */
    var mouseX = null, mouseY = null;
    var smoothCx, smoothCy;
    canvas.addEventListener('mousemove', function(e) {
      var r = canvas.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    });
    canvas.addEventListener('mouseleave', function() { mouseX = null; mouseY = null; });

    function getRingDims() {
      var base = Math.min(W * 0.48, H * 0.90);
      return [
        { rx: base * 0.36, ry: Math.min(base * 0.20, H * 0.38) },
        { rx: base * 0.65, ry: Math.min(base * 0.36, H * 0.40) },
        { rx: base * 0.96, ry: Math.min(base * 0.53, H * 0.44) },
      ];
    }

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      smoothCx = W / 2; smoothCy = H * 0.42;
      stars = [];
      for (var i = 0; i < 55; i++) {
        stars.push({ x: Math.random()*W, y: Math.random()*H,
                     r: 0.4 + Math.random()*1.1, a: 0.12 + Math.random()*0.30 });
      }
      var ringCounts = [0, 0, 0];
      MODULES.forEach(function(m) { ringCounts[m.ring]++; });
      var ringIdx = [0, 0, 0];
      nodes = MODULES.map(function(m) {
        var r = m.ring, idx = ringIdx[r]++;
        return {
          name: m.name, ring: r,
          angle: (idx / ringCounts[r]) * Math.PI * 2,
          speed: SPEED[r] * (0.88 + Math.random() * 0.24),
          glow: 0, wx: 0, wy: 0, depth: 0
        };
      });
    }
    window.addEventListener('resize', resize);
    resize();

    function draw() {
      ctx.clearRect(0, 0, W, H);
      /* smooth center: drift toward mouse, return to W/2,H/2 when no mouse */
      var targetCx = mouseX !== null ? mouseX : W / 2;
      var targetCy = mouseY !== null ? mouseY : H * 0.42;
      smoothCx += (targetCx - smoothCx) * 0.06;
      smoothCy += (targetCy - smoothCy) * 0.06;
      var cx = smoothCx, cy = smoothCy;
      var dims = getRingDims();

      /* star field */
      stars.forEach(function(s) {
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,' + s.a + ')'; ctx.fill();
      });

      /* orbit ellipses */
      for (var ri = 2; ri >= 0; ri--) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, dims[ri].rx, dims[ri].ry, 0, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.12 + (2-ri)*0.08) + ')';
        ctx.lineWidth = 0.7; ctx.setLineDash([4, 12]); ctx.stroke(); ctx.setLineDash([]);
      }

      /* update node positions */
      nodes.forEach(function(n) {
        n.angle += n.speed;
        n.wx    = cx + Math.cos(n.angle) * dims[n.ring].rx;
        n.wy    = cy + Math.sin(n.angle) * dims[n.ring].ry;
        n.depth = 0.5 + Math.sin(n.angle) * 0.5;   /* 0=back 1=front */
        n.glow  = Math.max(0, n.glow - 0.018);
      });

      /* integration beams: find closest adjacent-ring pair every 90 frames */
      beamTimer++;
      if (beamTimer % 90 === 0) {
        var byRing = [
          nodes.filter(function(n) { return n.ring === 0; }),
          nodes.filter(function(n) { return n.ring === 1; }),
          nodes.filter(function(n) { return n.ring === 2; }),
        ];
        [[0,1],[1,2]].forEach(function(pair) {
          var best = null, bestDiff = Math.PI;
          byRing[pair[0]].forEach(function(a) {
            byRing[pair[1]].forEach(function(b) {
              var diff = Math.abs(((a.angle - b.angle + Math.PI) % (Math.PI*2)) - Math.PI);
              if (diff < bestDiff) { bestDiff = diff; best = [a, b]; }
            });
          });
          if (best && bestDiff < 0.6) {
            beams.push({ x1: best[0].wx, y1: best[0].wy,
                         x2: best[1].wx, y2: best[1].wy, life: 1 });
            best[0].glow = 1; best[1].glow = 1;
          }
        });
      }

      /* subtle spokes from center */
      var sorted = nodes.slice().sort(function(a, b) { return a.depth - b.depth; });
      sorted.forEach(function(n) {
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(n.wx, n.wy);
        ctx.strokeStyle = 'rgba(255,255,255,' + (0.04 + n.depth * 0.12) + ')';
        ctx.lineWidth = 0.5; ctx.stroke();
      });

      /* integration beams */
      beams = beams.filter(function(b) {
        b.life -= 0.025;
        ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2);
        ctx.strokeStyle = 'rgba(255,26,34,' + b.life * 0.90 + ')';
        ctx.lineWidth = 1.2; ctx.stroke();
        return b.life > 0;
      });

      /* module capsules (back to front) */
      sorted.forEach(function(n) {
        var fSize = Math.round(7 + n.depth * 4);
        ctx.font = 'bold ' + fSize + 'px monospace';
        var tw = ctx.measureText(n.name).width;
        var pad = 5, bh = fSize + 8, bw = tw + pad * 2;
        var alpha = 0.35 + n.depth * 0.65;
        ctx.save(); ctx.translate(n.wx, n.wy);
        ctx.beginPath(); ctx.roundRect(-bw/2, -bh/2, bw, bh, 3);
        ctx.fillStyle = 'rgba(1, 65, 32,' + (0.65 + n.depth * 0.30) + ')'; ctx.fill();
        var bAlpha = n.glow > 0.05 ? 0.4 + n.glow * 0.6 : 0.18 + n.depth * 0.45;
        ctx.strokeStyle = n.glow > 0.05
          ? 'rgba(255,26,34,' + bAlpha + ')' : 'rgba(255,255,255,' + bAlpha + ')';
        ctx.lineWidth = 0.7 + n.depth * 0.5; ctx.stroke();
        if (n.glow > 0.05) { ctx.shadowColor = '#FF1A22'; ctx.shadowBlur = 16 * n.glow; }
        ctx.fillStyle = n.glow > 0.05
          ? 'rgba(255,120,120,' + alpha + ')' : 'rgba(200,255,220,' + alpha + ')';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(n.name, 0, 0); ctx.shadowBlur = 0; ctx.restore();
      });

      /* center logo — drawn last so it's always on top */
      omegaPulse += 0.038;
      var fCx = Math.min(W, H) * 0.078;
      var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, fCx * 1.6);
      grad.addColorStop(0, 'rgba(255,26,34,0.22)'); grad.addColorStop(1, 'rgba(255,26,34,0)');
      ctx.beginPath(); ctx.arc(cx, cy, fCx * 1.6, 0, Math.PI*2);
      ctx.fillStyle = grad; ctx.fill();
      var logoSize = fCx * 1.7;
      ctx.shadowColor = '#52c27a'; ctx.shadowBlur = 22 + Math.sin(omegaPulse) * 10;
      if (logoReady) {
        ctx.drawImage(logoImg, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
      } else {
        ctx.font = 'bold ' + fCx + 'px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FF1A22'; ctx.fillText('Ω', cx, cy);
      }
      ctx.shadowBlur = 0;

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ==============================
     09e. Circuit Flow — dich-vu.html
     PCB grid with animated data packets flowing along horizontal/vertical paths.
  ================================ */
  function initCircuitFlow(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W, H;
    var GRID = 48, packets = [], nodes = [];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      buildGrid();
    }
    window.addEventListener('resize', resize);
    resize();

    function buildGrid() {
      nodes = []; packets = [];
      var cols = Math.ceil(W / GRID) + 1;
      var rows = Math.ceil(H / GRID) + 1;
      for (var r = 0; r <= rows; r++) {
        for (var c = 0; c <= cols; c++) {
          if (Math.random() < 0.55) {
            nodes.push({ x: c*GRID, y: r*GRID });
          }
        }
      }
      /* spawn packets */
      for (var k = 0; k < Math.min(cols * 2, 28); k++) {
        spawnPacket();
      }
    }

    function spawnPacket() {
      var horiz = Math.random() < 0.5;
      var isRed = Math.random() < 0.12;
      if (horiz) {
        var row = Math.floor(Math.random() * Math.ceil(H/GRID)) * GRID;
        var dir = Math.random() < 0.5 ? 1 : -1;
        packets.push({ x: dir>0 ? -10 : W+10, y: row, vx: dir*(0.8+Math.random()*0.8), vy:0, isRed: isRed });
      } else {
        var col = Math.floor(Math.random() * Math.ceil(W/GRID)) * GRID;
        var dir = Math.random() < 0.5 ? 1 : -1;
        packets.push({ x: col, y: dir>0 ? -10 : H+10, vx:0, vy: dir*(0.8+Math.random()*0.8), isRed: isRed });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      /* grid lines */
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 0.8;
      var cols = Math.ceil(W/GRID)+1, rows = Math.ceil(H/GRID)+1;
      for (var c = 0; c <= cols; c++) { ctx.beginPath(); ctx.moveTo(c*GRID,0); ctx.lineTo(c*GRID,H); ctx.stroke(); }
      for (var r = 0; r <= rows; r++) { ctx.beginPath(); ctx.moveTo(0,r*GRID); ctx.lineTo(W,r*GRID); ctx.stroke(); }
      /* nodes */
      nodes.forEach(function(n) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.5, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.50)';
        ctx.fill();
      });
      /* packets */
      packets.forEach(function(p, idx) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
        ctx.fillStyle = p.isRed ? 'rgba(255,26,34,0.9)' : 'rgba(126,217,87,0.95)';
        ctx.shadowColor = p.isRed ? '#FF1A22' : '#7EE057';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        /* trail */
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx*14, p.y - p.vy*14);
        ctx.strokeStyle = p.isRed ? 'rgba(255,26,34,0.4)' : 'rgba(126,217,87,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20 || p.x > W+20 || p.y < -20 || p.y > H+20) {
          packets.splice(idx, 1); spawnPacket();
        }
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ==============================
     09f. Star Constellation Network — khach-hang.html
     Nodes = doanh nghiệp khách hàng, kết nối theo cụm. Ánh sáng chạy dọc
     đường kết nối; các node Omega-branded (Ω) phát hào quang đỏ.
  ================================ */
  function initStarNetwork(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W, H, nodes = [], pulses = [];
    var INDUSTRIES = ['Nhựa','Gỗ','F&B','FMCG','Thủy sản','Y tế','Thương mại','Dệt may','Xây dựng','Logistics'];
    /* logo SVG thay cho Ω */
    var logoImg = new Image(), logoReady = false;
    logoImg.onload = function() { logoReady = true; };
    logoImg.src = 'assets/images/omega-1A-white-buffer.svg';

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      buildNodes();
    }
    window.addEventListener('resize', resize);
    resize();

    function buildNodes() {
      nodes = []; pulses = [];
      var count = Math.floor(W * H / 9000);
      count = Math.max(20, Math.min(count, 50));
      /* Omega hub nodes */
      for (var h = 0; h < 3; h++) {
        nodes.push({
          x: W * (0.25 + h * 0.25), y: H * (0.3 + Math.random() * 0.4),
          vx: (Math.random()-0.5)*0.18, vy: (Math.random()-0.5)*0.18,
          r: 10, isHub: true,
          glow: 0, glowDir: 1,
          label: 'Ω'
        });
      }
      /* client nodes */
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random()*W, y: Math.random()*H,
          vx: (Math.random()-0.5)*0.25, vy: (Math.random()-0.5)*0.25,
          r: 1.3 + Math.random()*2, isHub: false,
          label: INDUSTRIES[i % INDUSTRIES.length],
          showLabel: Math.random() < 0.35
        });
      }
    }

    var LINK_DIST = 110, PULSE_INTERVAL = 90, tick = 0;

    function draw() {
      tick++;
      ctx.clearRect(0, 0, W, H);

      /* build edge list & spawn pulses */
      var edges = [];
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i+1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          var d  = Math.sqrt(dx*dx + dy*dy);
          if (d < LINK_DIST) {
            edges.push({a: nodes[i], b: nodes[j], d: d});
          }
        }
      }

      /* draw edges */
      edges.forEach(function(e) {
        var a = (1 - e.d / LINK_DIST) * (e.a.isHub || e.b.isHub ? 0.88 : 0.22);
        ctx.beginPath();
        ctx.strokeStyle = e.a.isHub || e.b.isHub
          ? 'rgba(82, 194, 122,'+a+')'
          : 'rgba(255,255,255,'+a*0.6+')';
        ctx.lineWidth = e.a.isHub || e.b.isHub ? 0.7 : 0.6;
        ctx.moveTo(e.a.x, e.a.y);
        ctx.lineTo(e.b.x, e.b.y);
        ctx.stroke();
      });

      /* spawn pulse packets along hub edges */
      if (tick % PULSE_INTERVAL === 0 && edges.length) {
        var hubEdges = edges.filter(function(e) { return e.a.isHub || e.b.isHub; });
        if (hubEdges.length) {
          var e = hubEdges[Math.floor(Math.random()*hubEdges.length)];
          pulses.push({ ax:e.a.x, ay:e.a.y, bx:e.b.x, by:e.b.y, t:0 });
        }
      }

      /* draw & advance pulses */
      for (var p = pulses.length-1; p >= 0; p--) {
        var pu = pulses[p];
        pu.t += 0.022;
        var px = pu.ax + (pu.bx-pu.ax)*pu.t;
        var py = pu.ay + (pu.by-pu.ay)*pu.t;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI*2);
        ctx.fillStyle = '#FF1A22';
        ctx.shadowColor = '#FF1A22'; ctx.shadowBlur = 16;
        ctx.fill(); ctx.shadowBlur = 0;
        if (pu.t >= 1) pulses.splice(p, 1);
      }

      /* draw nodes */
      nodes.forEach(function(n) {
        if (n.isHub) {
          /* pulsing glow ring */
          n.glow += 0.04 * n.glowDir;
          if (n.glow > 1 || n.glow < 0) n.glowDir *= -1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 8 + n.glow*6, 0, Math.PI*2);
          ctx.strokeStyle = 'rgba(82,194,122,'+(0.20+n.glow*0.35)+')';
          ctx.lineWidth = 1.5; ctx.stroke();
          /* core */
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
          ctx.fillStyle = '#52c27a';
          ctx.shadowColor = '#52c27a'; ctx.shadowBlur = 20;
          ctx.fill(); ctx.shadowBlur = 0;
          /* logo */
          if (logoReady) {
            ctx.drawImage(logoImg, n.x - 9, n.y - 9, 18, 18);
          } else {
            ctx.font = 'bold 12px serif'; ctx.fillStyle = '#fff';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('Ω', n.x, n.y);
          }
        } else {
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
          ctx.fillStyle = 'rgba(126,217,87,0.52)';
          ctx.shadowColor = '#7EE057'; ctx.shadowBlur = 3;
          ctx.fill(); ctx.shadowBlur = 0;
          if (n.showLabel) {
            ctx.font = '10px sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.80)';
            ctx.textAlign = 'center';
            ctx.fillText(n.label, n.x, n.y - n.r - 4);
          }
        }
        /* move */
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ==============================
     09g. Keyword Bubbles — tin-tuc.html
     Từ khoá ERP / chuyển đổi số nổi lên như bong bóng mịn màng.
     Va chạm nhẹ (soft physics). Màu đỏ/xanh theo mức độ quan trọng.
  ================================ */
  function initKeywordBubbles(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W, H, bubbles = [];

    var WORDS = [
      { t:'ERP',            w:3, hot:true  },
      { t:'OMEGA',          w:3, hot:true  },
      { t:'Chuyển đổi số',  w:3, hot:true  },
      { t:'Kế toán',        w:2, hot:true  },
      { t:'Quản trị',       w:2, hot:false },
      { t:'Nhân sự',        w:2, hot:false },
      { t:'Sản xuất',       w:2, hot:false },
      { t:'Kho WMS',        w:1, hot:false },
      { t:'Bán hàng',       w:1, hot:false },
      { t:'Mua hàng',       w:1, hot:false },
      { t:'Tài chính',      w:2, hot:false },
      { t:'Báo cáo',        w:1, hot:false },
      { t:'MES',            w:1, hot:true  },
      { t:'CRM',            w:2, hot:false },
      { t:'Mobile App',     w:1, hot:false },
      { t:'Big Data',       w:1, hot:false },
      { t:'AI',             w:2, hot:true  },
      { t:'Số hoá',         w:1, hot:false },
      { t:'Tối ưu hoá',     w:1, hot:false },
      { t:'Minh bạch',      w:1, hot:false },
      { t:'Thực chiến',     w:1, hot:false },
      { t:'Tự động hoá',    w:2, hot:false },
    ];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      buildBubbles();
    }
    window.addEventListener('resize', resize);
    resize();

    function buildBubbles() {
      bubbles = [];
      var scale = Math.min(W, H) / 650;
      WORDS.forEach(function(word) {
        var r = (12 + word.w * 10) * scale;
        bubbles.push({
          word: word.t, hot: word.hot,
          x: r + Math.random()*(W - 2*r),
          y: r + Math.random()*(H - 2*r),
          vx: (Math.random()-0.5)*(word.hot ? 0.45 : 0.3),
          vy: (Math.random()-0.5)*(word.hot ? 0.45 : 0.3),
          r: r,
          alpha: 0.55 + Math.random()*0.3,
          pulse: Math.random()*Math.PI*2,
          pulseSp: 0.02 + Math.random()*0.015
        });
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      /* soft collision response */
      for (var i = 0; i < bubbles.length; i++) {
        for (var j = i+1; j < bubbles.length; j++) {
          var bi = bubbles[i], bj = bubbles[j];
          var dx = bj.x - bi.x, dy = bj.y - bi.y;
          var dist = Math.sqrt(dx*dx + dy*dy) || 0.001;
          var minD = bi.r + bj.r + 4;
          if (dist < minD) {
            var force = (minD - dist) / minD * 0.08;
            var nx = dx/dist, ny = dy/dist;
            bi.vx -= nx*force; bi.vy -= ny*force;
            bj.vx += nx*force; bj.vy += ny*force;
          }
        }
      }

      /* draw bubbles */
      bubbles.forEach(function(b) {
        b.pulse += b.pulseSp;
        var glow = 0.5 + Math.sin(b.pulse) * 0.5;
        var baseColor = b.hot ? '237,28,36' : '100,210,140';
        var lightColor = b.hot ? '255,80,80' : '180,255,210';

        /* outer glow ring */
        var grad = ctx.createRadialGradient(b.x, b.y, b.r*0.6, b.x, b.y, b.r*1.3);
        grad.addColorStop(0, 'rgba('+baseColor+','+(b.alpha*0.25*glow)+')');
        grad.addColorStop(1, 'rgba('+baseColor+',0)');
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r*1.3, 0, Math.PI*2);
        ctx.fillStyle = grad; ctx.fill();

        /* bubble body */
        var bg = ctx.createRadialGradient(b.x - b.r*0.3, b.y - b.r*0.3, b.r*0.1, b.x, b.y, b.r);
        bg.addColorStop(0, 'rgba('+lightColor+','+(b.alpha*0.55)+')');
        bg.addColorStop(0.6, 'rgba('+baseColor+','+(b.alpha*0.4)+')');
        bg.addColorStop(1,   'rgba('+baseColor+','+(b.alpha*0.15)+')');
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
        ctx.fillStyle = bg; ctx.fill();
        /* rim */
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba('+lightColor+','+(0.35+glow*0.2)+')';
        ctx.lineWidth = b.hot ? 1.5 : 0.8; ctx.stroke();

        /* text */
        var fSize = Math.max(9, Math.round(b.r * 0.52));
        ctx.font = (b.hot ? 'bold ' : '') + fSize + 'px "Be Vietnam Pro", sans-serif';
        ctx.fillStyle = b.hot ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.92)';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(b.word, b.x, b.y);

        /* move */
        b.x += b.vx; b.y += b.vy;
        var pad = b.r;
        if (b.x < pad)   { b.x = pad;   b.vx =  Math.abs(b.vx); }
        if (b.x > W-pad) { b.x = W-pad; b.vx = -Math.abs(b.vx); }
        if (b.y < pad)   { b.y = pad;   b.vy =  Math.abs(b.vy); }
        if (b.y > H-pad) { b.y = H-pad; b.vy = -Math.abs(b.vy); }
        /* dampen to prevent over-acceleration */
        var speed = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
        if (speed > 1.2) { b.vx *= 0.97; b.vy *= 0.97; }
      });

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ==============================
     09h. Contact Radar — lien-he.html
     Vòng quét radar xanh lá. Blip bật sáng khi tia quét qua, gợi tín hiệu
     liên hệ từ các tỉnh/thành. Hot-blip (đỏ) = doanh nghiệp đang kết nối.
  ================================ */
  function initContactRadar(canvas) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W, H, blips = [], sweepAngle = -Math.PI / 2;
    var LABELS = ['TP.HCM','Hà Nội','Đà Nẵng','Cần Thơ','Bình Dương','Đồng Nai',
                  'Hải Phòng','Vũng Tàu','Long An','Tiền Giang','Bắc Ninh','Khánh Hòa'];
    var logoImg = new Image(), logoReady = false;
    logoImg.onload = function() { logoReady = true; };
    logoImg.src = 'assets/images/omega-1A-white-buffer.svg';

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      buildBlips();
    }
    window.addEventListener('resize', resize);
    resize();

    function buildBlips() {
      blips = [];
      var cx = W / 2, cy = H / 2, maxR = Math.min(W, H) * 0.44;
      for (var i = 0; i < 12; i++) {
        var a = Math.random() * Math.PI * 2;
        var d = (0.18 + Math.random() * 0.76) * maxR;
        blips.push({ x: cx + Math.cos(a)*d, y: cy + Math.sin(a)*d,
                     alpha: 0, hot: Math.random() < 0.28,
                     label: LABELS[i % LABELS.length] });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var cx = W / 2, cy = H / 2, maxR = Math.min(W, H) * 0.44;
      sweepAngle += 0.013;

      /* radar rings */
      for (var ri = 1; ri <= 4; ri++) {
        ctx.beginPath(); ctx.arc(cx, cy, maxR * ri / 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(82,194,122,' + (0.07 + (4 - ri) * 0.025) + ')';
        ctx.lineWidth = 0.6; ctx.stroke();
      }
      /* crosshair */
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy); ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR); ctx.lineTo(cx, cy + maxR);
      ctx.strokeStyle = 'rgba(82,194,122,0.07)';
      ctx.lineWidth = 0.5; ctx.stroke();

      /* sweep fan — conic gradient approximation via 32 thin arcs */
      var fanSpan = Math.PI * 0.55;
      for (var s = 0; s < 32; s++) {
        var a0 = sweepAngle - fanSpan * (s / 32);
        var a1 = sweepAngle - fanSpan * ((s + 1) / 32);
        ctx.beginPath(); ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, a1, a0); ctx.closePath();
        ctx.fillStyle = 'rgba(82,194,122,' + ((1 - s / 32) * 0.14) + ')';
        ctx.fill();
      }
      /* sweep leading edge */
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
      ctx.strokeStyle = 'rgba(82,194,122,0.70)'; ctx.lineWidth = 1.0; ctx.stroke();

      /* blips */
      blips.forEach(function(b) {
        var bA  = Math.atan2(b.y - cy, b.x - cx);
        var diff = ((sweepAngle - bA) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (diff < 0.12) b.alpha = 1.0;          /* ping! */
        b.alpha = Math.max(0, b.alpha - 0.0028);
        if (b.alpha <= 0) return;

        var r = b.hot ? 4 : 2.5;
        ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        if (b.hot) {
          ctx.fillStyle = 'rgba(255,26,34,' + b.alpha + ')';
          ctx.shadowColor = '#FF1A22'; ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = 'rgba(82,194,122,' + b.alpha + ')';
          ctx.shadowColor = '#52c27a'; ctx.shadowBlur = 6;
        }
        ctx.fill(); ctx.shadowBlur = 0;
        if (b.alpha > 0.28) {
          ctx.font = '9px "Be Vietnam Pro",sans-serif';
          ctx.fillStyle = b.hot
            ? 'rgba(255,140,140,' + b.alpha * 0.9 + ')'
            : 'rgba(180,255,210,' + b.alpha * 0.85 + ')';
          ctx.textAlign = 'left';
          ctx.fillText(b.label, b.x + r + 4, b.y + 3);
        }
      });

      /* center logo */
      var logoSize = Math.min(W, H) * 0.09;
      ctx.shadowColor = '#52c27a'; ctx.shadowBlur = 12;
      if (logoReady) {
        ctx.drawImage(logoImg, cx - logoSize / 2, cy - logoSize / 2, logoSize, logoSize);
      } else {
        ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#52c27a'; ctx.fill();
      }
      ctx.shadowBlur = 0;

      requestAnimationFrame(draw);
    }
    draw();
  }

  /* Page-header canvas — dispatch by data-canvas-type */
  document.querySelectorAll('.page-canvas').forEach(function (c) {
    var type = c.getAttribute('data-canvas-type');
    if      (type === 'greek-network')  initGreekNetwork(c);
    else if (type === 'omega-assembly') initOmegaAssembly(c);
    else if (type === 'module-orbit')   initModuleOrbit(c);
    else if (type === 'circuit-flow')   initCircuitFlow(c);
    else if (type === 'star-network')   initStarNetwork(c);
    else if (type === 'keyword-bubbles') initKeywordBubbles(c);
    else if (type === 'contact-radar')  initContactRadar(c);
    else                                initTechCanvas(c, 55);
  });

  /* ==============================
     10. Ticker duplicate
  ================================ */
  var $track = $('.ticker-track');
  if ($track.length) {
    var $clone = $track.html();
    $track.append($clone);
  }

  /* ==============================
     11. Contact Form Handler (Google App Script + Anti-spam)
  ================================ */
  initOmegaContactAntiSpam();

  /* ==============================
     12. Tab switching (Products page)
  ================================ */
  $(document).on('click', '.tab-btn', function () {
    var target = $(this).data('tab');
    $('.tab-btn').removeClass('active');
    $(this).addClass('active');
    $('.tab-content').removeClass('active').hide();
    $('#' + target).addClass('active').fadeIn(300);
  });

  /* ==============================
     13. Back to top
  ================================ */
  var $backTop = $('#back-to-top');
  if ($backTop.length) {
    $(window).on('scroll', function () {
      if ($(this).scrollTop() > 500) {
        $backTop.addClass('show');
      } else {
        $backTop.removeClass('show');
      }
    });
    $backTop.on('click', function () {
      $('html, body').animate({ scrollTop: 0 }, 500);
    });
  }

})(jQuery);


// ==============================
// CONTACT FORM — ANTI-SPAM + GAS
// ==============================
var OMEGA_GAS_URL = 'https://script.google.com/macros/s/AKfycbyutSlIibAzDa-dQ3OIoRbPArTir29YH-kiqWjjoGnFXL22l5qkdFUeDRXamTg2jAty/exec'; // << Dán URL GAS sau khi deploy
var OMEGA_SUBMIT_COOLDOWN = 60000; // 60 giây giữa các lần gửi

function initOmegaContactAntiSpam() {
  var form = document.getElementById('omega-contact-form');
  if (!form) return;

  // Khởi tạo hidden fields
  var startTime = Date.now();
  var token = btoa(Math.random() + Date.now() + navigator.userAgent).substring(0, 32);
  var stField = document.getElementById('start-time-omega');
  var tkField = document.getElementById('token-bot-omega');
  if (stField) stField.value = startTime;
  if (tkField) tkField.value = token;

  // Đếm số field được focus (local)
  var fieldsFocused = 0;
  form.querySelectorAll('input, textarea, select').forEach(function (field) {
    var n = field.name || '', id = field.id || '';
    if (!n.includes('bot') && !n.includes('time') && !n.includes('score') && !id.includes('website')) {
      field.addEventListener('focus', function () { fieldsFocused++; });
    }
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = document.getElementById('omega-submit-btn');
    var msgDiv = document.getElementById('form-message');
    var now = Date.now();

    // Validation thủ công (form có novalidate)
    var valName    = (form.querySelector('[name="name"]') || {}).value || '';
    var valPhone   = (form.querySelector('[name="phone"]') || {}).value || '';
    var valEmail   = (form.querySelector('[name="email"]') || {}).value || '';
    var valMessage = (form.querySelector('[name="message"]') || {}).value || '';

    if (!valName.trim() || !valPhone.trim() || !valEmail.trim()) {
      if (msgDiv) { msgDiv.className = 'form-message error'; msgDiv.textContent = 'Vui lòng điền đầy đủ: Họ và tên, Số điện thoại, Email.'; }
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valEmail.trim())) {
      if (msgDiv) { msgDiv.className = 'form-message error'; msgDiv.textContent = 'Địa chỉ email không hợp lệ.'; }
      return;
    }
    if (valMessage.trim().length < 3) {
      if (msgDiv) { msgDiv.className = 'form-message error'; msgDiv.textContent = 'Nội dung cần tư vấn phải có ít nhất 3 ký tự.'; }
      form.querySelector('[name="message"]').focus();
      return;
    }

    // Rate limiting
    var lastSubmit = localStorage.getItem('lastOmegaContactSubmitTime');
    if (lastSubmit && (now - parseInt(lastSubmit)) < OMEGA_SUBMIT_COOLDOWN) {
      var wait = Math.ceil((OMEGA_SUBMIT_COOLDOWN - (now - parseInt(lastSubmit))) / 1000);
      if (btn) { btn.innerHTML = 'Chờ ' + wait + 's rồi thử lại'; btn.disabled = true; }
      setTimeout(function () {
        if (btn) { btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Gửi yêu cầu tư vấn'; btn.disabled = false; }
      }, 2500);
      return;
    }

    // Tính human score
    var humanScore = 0;
    if (omegaMouseMoves >= 5) humanScore += 2;
    if (omegaKeysPressed >= 2) humanScore += 2;
    if (fieldsFocused >= 2)    humanScore += 3;
    if (omegaHasScrolled)      humanScore += 1;
    if (omegaIsTouched)        humanScore += 2;
    var hsField = document.getElementById('human-score-omega');
    if (hsField) hsField.value = humanScore;

    // Kiểm tra anti-spam
    var timeSpent = (now - startTime) / 1000;
    var tokenVal  = tkField ? tkField.value : '';
    var honeypot  = document.getElementById('website-omega');
    honeypot = honeypot ? honeypot.value.trim() : '';
    var isBot = honeypot !== '' || tokenVal === '' ||
                timeSpent < 3 || timeSpent > 600 || humanScore < 3;

    if (isBot) {
      if (msgDiv) { msgDiv.className = 'form-message error'; msgDiv.textContent = 'Có lỗi xảy ra, vui lòng thử lại sau ít phút.'; }
      if (btn) btn.disabled = true;
      setTimeout(function () { location.reload(); }, 2500);
      return;
    }

    if (btn) { btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi...'; btn.disabled = true; }
    if (msgDiv) { msgDiv.className = 'form-message'; msgDiv.textContent = ''; }

    var formData = {
      name:            (form.querySelector('[name="name"]') || {}).value || '',
      phone:           (form.querySelector('[name="phone"]') || {}).value || '',
      email:           (form.querySelector('[name="email"]') || {}).value || '',
      company:         (form.querySelector('[name="company"]') || {}).value || '',
      company_size:    (form.querySelector('[name="company_size"]') || {}).value || '',
      industry:        (form.querySelector('[name="industry"]') || {}).value || '',
      message:         (form.querySelector('[name="message"]') || {}).value || '',
      website_omega:   honeypot,
      token_bot:       tokenVal,
      form_start_time: startTime,
      human_score:     humanScore
    };

    if (!OMEGA_GAS_URL) {
      // Demo mode — GAS URL chưa cấu hình
      setTimeout(function () {
        if (msgDiv) { msgDiv.className = 'form-message success'; msgDiv.innerHTML = '<i class="fa-solid fa-circle-check"></i> Cảm ơn bạn! Yêu cầu tư vấn đã được gửi thành công. Chúng tôi sẽ liên hệ lại trong vòng 2 giờ làm việc.'; }
        form.reset();
        if (btn) { btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Gửi yêu cầu tư vấn'; btn.disabled = false; }
      }, 1000);
      return;
    }

    try {
      await fetch(OMEGA_GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      localStorage.setItem('lastOmegaContactSubmitTime', now.toString());
      form.reset();
      if (msgDiv) { msgDiv.className = 'form-message success'; msgDiv.innerHTML = '<i class="fa-solid fa-circle-check"></i> Cảm ơn bạn! Yêu cầu tư vấn đã được gửi thành công. Chúng tôi sẽ liên hệ lại trong vòng 2 giờ làm việc.'; }
      if (btn) { btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Gửi yêu cầu tư vấn'; btn.disabled = false; }
    } catch (err) {
      if (msgDiv) { msgDiv.className = 'form-message error'; msgDiv.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Đã xảy ra lỗi khi gửi. Vui lòng thử lại hoặc liên hệ trực tiếp qua <a href="tel:0908303609">0908 303 609</a>.'; }
      if (btn) { btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Gửi yêu cầu tư vấn'; btn.disabled = false; }
    }
  });
}

// GOOGLE TRANSLATION
function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: "vi",
      layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      includedLanguages:
        "en,zh-CN,hi,es,fr,ar,ru,pt,ja,ko,id,ms,th,my,km,lo,tl,de,it,fa,ur,pl,tr,uk,ro,nl,sv,cs,he,el,hu,da,fi",
      autoDisplay: false,
    },
    "google_translate_element"
  );
}
// // Ẩn Google Translate Banner Frame (top bar) bằng JS - ổn định hơn CSS
// function hideGoogleTranslateBanner() {
//   // Tìm banner frame
//   const bannerFrame = document.querySelector('.goog-te-banner-frame');
//   const skipTranslate = document.querySelector('.skiptranslate');

//   if (bannerFrame) {
//     bannerFrame.style.display = 'none';
//     bannerFrame.style.visibility = 'hidden';
//     bannerFrame.style.height = '0';
//   }

//   if (skipTranslate) {
//     skipTranslate.style.display = 'none';
//   }

//   // Reset top của body (Google thêm inline style top:40px !important)
//   document.body.style.top = '0px !important';
//   document.body.style.position = 'static !important'; // hoặc 'relative' nếu header fixed

//   // Nếu header của bạn fixed/sticky, điều chỉnh margin-top nếu cần
//   // Ví dụ: document.querySelector('.main-header').style.marginTop = '0';
// }

// // Chạy ngay lập tức
// hideGoogleTranslateBanner();

// // Chạy lại sau 1-2 giây (vì widget load async)
// setTimeout(hideGoogleTranslateBanner, 1000);
// setTimeout(hideGoogleTranslateBanner, 3000); // an toàn hơn

// // Theo dõi thay đổi DOM (MutationObserver) - tốt nhất cho dynamic insert
// const observer = new MutationObserver(() => {
//   hideGoogleTranslateBanner();
// });

// // Quan sát body hoặc document
// observer.observe(document.body, { childList: true, subtree: true });



// BONG BÓNG CHAT - FLOATING BUTTONS ================================================
document.addEventListener("DOMContentLoaded", function () {
  const mainBtn = document.querySelector(".lazinet-contact-main-btn");
  const contactButtons = document.querySelector(".lazinet-contact-buttons");
  const contactBtns = document.querySelectorAll(".lazinet-contact-btn");

  // Main button click - Ẩn nút chính, hiện 4 nút con
  if (mainBtn) {
    mainBtn.addEventListener("click", function () {
      // Ẩn nút chính
      this.classList.add("hidden");
      // Hiện 4 nút con
      contactButtons.classList.add("active");
    });
  }

  // Xử lý click cho từng nút con
  contactBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const type = this.classList[1]; // phone, zalo, messenger, ai-bot

      // Thực hiện chức năng tương ứng
      switch (type) {
        case "phone":
          window.open("tel:+84-908303609");
          break;
        case "zalo":
          window.open("http://zalo.me/0908303609", "_blank");
          break;
        case "messenger":
          window.open("https://m.me/112977021025347", "_blank");
          break;
        case "ai-bot":
          openAIChat();
          break;
      }

      // Sau khi click: Ẩn 4 nút con, hiện lại nút chính
      contactButtons.classList.remove("active");
      mainBtn.classList.remove("hidden");
    });
  });

function openAIChat() {
    // Thay đường dẫn dưới đây bằng link thật của file bizcard của bạn
    const bizcardUrl = "bizcards/ceo-nguyen-van-nhan.html?chat=true";
    window.open(bizcardUrl, "_blank");
}

  // Optional: Đóng menu khi click ra ngoài
  if (mainBtn && contactButtons) {
    document.addEventListener("click", function (e) {
      if (
        !e.target.closest(".lazinet-contact-floating") &&
        contactButtons.classList.contains("active")
      ) {
        contactButtons.classList.remove("active");
        mainBtn.classList.remove("hidden");
      }
    });
  }
});

// ========== Bong bóng chat - Floating buttons ===========

// ============================================================
// CLIENT-SIDE SEARCH
// ============================================================
(function () {
  // ----------------------------------------------------------
  // Search index – covers all pages & key sections
  // ----------------------------------------------------------
  var SEARCH_INDEX = [
    // Trang chủ
    { title: 'Trang chủ', desc: 'Giới thiệu tổng quan về Omega ERP', url: 'index.html', icon: 'fa-house', cat: 'Trang chủ', keywords: 'trang chủ omega erp giới thiệu' },

    // Về Omega
    { title: 'Về Omega', desc: 'Thông tin công ty, lịch sử hình thành', url: 've-omega.html', icon: 'fa-building', cat: 'Về Omega', keywords: 'về omega công ty lịch sử hình thành' },
    { title: 'Định vị & Năng lực', desc: 'Vị thế thương hiệu và năng lực cốt lõi', url: 've-omega.html#dinh-vi', icon: 'fa-bullseye', cat: 'Về Omega', keywords: 'định vị năng lực thương hiệu' },
    { title: 'Tầm nhìn & Sứ mệnh', desc: 'Chiến lược phát triển dài hạn của Omega', url: 've-omega.html#tam-nhin', icon: 'fa-eye', cat: 'Về Omega', keywords: 'tầm nhìn sứ mệnh chiến lược phát triển' },
    { title: 'Giá trị cốt lõi', desc: 'Những giá trị Omega cam kết mang lại', url: 've-omega.html#gia-tri', icon: 'fa-gem', cat: 'Về Omega', keywords: 'giá trị cốt lõi cam kết' },
    { title: 'Đội ngũ nhân sự', desc: 'Đội ngũ chuyên gia giàu kinh nghiệm', url: 've-omega.html#doi-ngu', icon: 'fa-users', cat: 'Về Omega', keywords: 'đội ngũ nhân sự chuyên gia kinh nghiệm' },

    // Giải pháp
    { title: 'Giải pháp ERP', desc: 'Giải pháp quản trị theo từng ngành nghề', url: 'giai-phap.html', icon: 'fa-lightbulb', cat: 'Giải pháp', keywords: 'giải pháp erp ngành nghề' },
    { title: 'Giải pháp ngành Nhựa', desc: 'ERP chuyên biệt cho doanh nghiệp sản xuất nhựa', url: 'giai-phap.html#nganh-nhua', icon: 'fa-industry', cat: 'Giải pháp', keywords: 'ngành nhựa sản xuất quản lý' },
    { title: 'Giải pháp ngành Gỗ – Nội thất', desc: 'ERP cho ngành chế biến gỗ và nội thất', url: 'giai-phap.html#nganh-go', icon: 'fa-tree', cat: 'Giải pháp', keywords: 'ngành gỗ nội thất chế biến' },
    { title: 'Giải pháp ngành F&B', desc: 'ERP cho nhà hàng, chuỗi thực phẩm & đồ uống', url: 'giai-phap.html#nganh-fb', icon: 'fa-utensils', cat: 'Giải pháp', keywords: 'ngành fb thực phẩm đồ uống nhà hàng' },
    { title: 'Giải pháp ngành FMCG', desc: 'ERP cho hàng tiêu dùng nhanh & phân phối', url: 'giai-phap.html#nganh-fmcg', icon: 'fa-box-open', cat: 'Giải pháp', keywords: 'fmcg hàng tiêu dùng phân phối' },
    { title: 'Giải pháp Thủy – Hải sản', desc: 'ERP cho chế biến và xuất khẩu thủy hải sản', url: 'giai-phap.html#nganh-thuy-san', icon: 'fa-fish', cat: 'Giải pháp', keywords: 'thủy sản hải sản chế biến xuất khẩu' },
    { title: 'Giải pháp Thiết bị Y tế', desc: 'ERP cho phân phối và quản lý thiết bị y tế', url: 'giai-phap.html#nganh-y-te', icon: 'fa-stethoscope', cat: 'Giải pháp', keywords: 'thiết bị y tế bệnh viện phân phối' },

    // Sản phẩm
    { title: 'Sản phẩm Omega', desc: 'Bộ phần mềm ERP và ứng dụng di động', url: 'san-pham.html', icon: 'fa-cubes', cat: 'Sản phẩm', keywords: 'sản phẩm phần mềm erp module' },
    { title: 'Phần mềm ERP', desc: 'Hệ thống quản trị tổng thể – kế toán, kho, bán hàng…', url: 'san-pham.html#phan-mem', icon: 'fa-desktop', cat: 'Sản phẩm', keywords: 'phần mềm erp kế toán kho bán hàng sản xuất' },
    { title: 'Mobile App', desc: 'Ứng dụng di động quản lý mọi lúc mọi nơi', url: 'san-pham.html#mobile-app', icon: 'fa-mobile-screen', cat: 'Sản phẩm', keywords: 'mobile app ứng dụng di động' },
    { title: 'Kế toán – Tài chính', desc: 'Module kế toán tổng hợp, công nợ, ngân hàng', url: 'san-pham.html#phan-mem', icon: 'fa-calculator', cat: 'Sản phẩm', keywords: 'kế toán tài chính công nợ ngân hàng' },
    { title: 'Quản lý Kho', desc: 'Module quản lý kho hàng, nhập xuất tồn', url: 'san-pham.html#phan-mem', icon: 'fa-warehouse', cat: 'Sản phẩm', keywords: 'kho hàng nhập xuất tồn quản lý kho' },
    { title: 'Quản lý Bán hàng (CRM)', desc: 'CRM, đơn hàng, báo giá, công nợ khách hàng', url: 'san-pham.html#phan-mem', icon: 'fa-handshake', cat: 'Sản phẩm', keywords: 'bán hàng crm đơn hàng báo giá khách hàng' },
    { title: 'Quản lý Sản xuất', desc: 'MRP, lệnh sản xuất, định mức nguyên liệu', url: 'san-pham.html#phan-mem', icon: 'fa-gears', cat: 'Sản phẩm', keywords: 'sản xuất mrp lệnh sản xuất định mức' },
    { title: 'Quản lý Nhân sự – HRM', desc: 'Tuyển dụng, lương thưởng, chấm công, đào tạo', url: 'san-pham.html#phan-mem', icon: 'fa-id-card', cat: 'Sản phẩm', keywords: 'nhân sự hrm tuyển dụng lương thưởng chấm công' },

    // Dịch vụ
    { title: 'Dịch vụ Omega', desc: 'Triển khai, đào tạo, tư vấn và hỗ trợ sau bán hàng', url: 'dich-vu.html', icon: 'fa-wrench', cat: 'Dịch vụ', keywords: 'dịch vụ triển khai đào tạo tư vấn hỗ trợ' },
    { title: 'Tư vấn & Triển khai', desc: 'Quy trình triển khai ERP chuyên nghiệp', url: 'dich-vu.html', icon: 'fa-comments', cat: 'Dịch vụ', keywords: 'tư vấn triển khai erp chuyên nghiệp' },
    { title: 'Đào tạo người dùng', desc: 'Khóa học vận hành phần mềm cho nhân viên', url: 'dich-vu.html', icon: 'fa-chalkboard-user', cat: 'Dịch vụ', keywords: 'đào tạo người dùng khóa học vận hành' },
    { title: 'Hỗ trợ kỹ thuật', desc: 'Hotline, remote support và bảo trì hệ thống', url: 'dich-vu.html', icon: 'fa-headset', cat: 'Dịch vụ', keywords: 'hỗ trợ kỹ thuật hotline bảo trì' },

    // Khách hàng
    { title: 'Khách hàng tiêu biểu', desc: '1000+ doanh nghiệp đang sử dụng Omega ERP', url: 'khach-hang.html', icon: 'fa-star', cat: 'Khách hàng', keywords: 'khách hàng tiêu biểu doanh nghiệp đối tác' },

    // Tin tức
    { title: 'Tin tức & Blog', desc: 'Cập nhật kiến thức ERP, chuyển đổi số', url: 'tin-tuc.html', icon: 'fa-newspaper', cat: 'Tin tức', keywords: 'tin tức blog kiến thức erp chuyển đổi số' },
    { title: 'Chuyển đổi số', desc: 'Xu hướng và kinh nghiệm chuyển đổi số doanh nghiệp', url: 'tin-tuc.html#chuyen-doi-so', icon: 'fa-rotate', cat: 'Tin tức', keywords: 'chuyển đổi số doanh nghiệp xu hướng' },
    { title: 'ERP – Quản trị', desc: 'Bài viết chuyên sâu về hệ thống ERP', url: 'tin-tuc.html#erp', icon: 'fa-chart-line', cat: 'Tin tức', keywords: 'erp quản trị bài viết chuyên sâu' },
    { title: 'Kế toán – Tài chính', desc: 'Kiến thức kế toán, thuế, tài chính doanh nghiệp', url: 'tin-tuc.html#ke-toan', icon: 'fa-file-invoice-dollar', cat: 'Tin tức', keywords: 'kế toán tài chính thuế kiến thức' },
    { title: 'Sự kiện Omega', desc: 'Hội thảo, webinar và sự kiện công nghệ', url: 'tin-tuc.html#su-kien', icon: 'fa-calendar-days', cat: 'Tin tức', keywords: 'sự kiện hội thảo webinar công nghệ' },
    { title: 'Tuyển dụng', desc: 'Cơ hội việc làm tại Omega', url: 'tin-tuc.html#tuyen-dung', icon: 'fa-briefcase', cat: 'Tin tức', keywords: 'tuyển dụng việc làm cơ hội' },

    // Liên hệ
    { title: 'Liên hệ & Tư vấn', desc: 'Đặt lịch tư vấn hoặc nhận báo giá miễn phí', url: 'lien-he.html', icon: 'fa-envelope', cat: 'Liên hệ', keywords: 'liên hệ tư vấn báo giá miễn phí' },
  ];

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function normalize(str) {
    return (str || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd');
  }

  function search(query) {
    var q = normalize(query);
    if (q.length < 2) return [];
    var terms = q.split(/\s+/).filter(Boolean);
    var results = [];
    for (var i = 0; i < SEARCH_INDEX.length; i++) {
      var item = SEARCH_INDEX[i];
      var haystack = normalize(item.title + ' ' + item.desc + ' ' + item.keywords + ' ' + item.cat);
      var score = 0;
      for (var t = 0; t < terms.length; t++) {
        if (haystack.indexOf(terms[t]) !== -1) {
          score += (normalize(item.title).indexOf(terms[t]) !== -1) ? 2 : 1;
        }
      }
      if (score > 0) results.push({ item: item, score: score });
    }
    results.sort(function (a, b) { return b.score - a.score; });
    return results.slice(0, 8).map(function (r) { return r.item; });
  }

  function renderResults(items, query) {
    var $results = $('#searchResults');
    if (!items.length) {
      $results.html('<div class="search-no-results">Không tìm thấy kết quả cho "<strong>' + $('<span>').text(query).html() + '</strong>"</div>');
      return;
    }
    var html = '';
    items.forEach(function (item) {
      html += '<a class="search-result-item" href="' + item.url + '">' +
        '<div class="search-result-icon"><i class="fa-solid ' + item.icon + '"></i></div>' +
        '<div class="search-result-body">' +
          '<div class="search-result-title">' + $('<span>').text(item.title).html() + '</div>' +
          '<div class="search-result-desc">' + $('<span>').text(item.desc).html() + '</div>' +
        '</div>' +
        '<span class="search-result-badge">' + $('<span>').text(item.cat).html() + '</span>' +
      '</a>';
    });
    $results.html(html);
    selectedIndex = -1;
  }

  // ----------------------------------------------------------
  // Open / close overlay
  // ----------------------------------------------------------
  var $overlay = $('#searchOverlay');
  var $input   = $('#searchInput');

  function openSearch() {
    $overlay.addClass('active');
    $('body').css('overflow', 'hidden');
    setTimeout(function () { $input.focus(); }, 50);
  }

  function closeSearch() {
    $overlay.removeClass('active');
    $('body').css('overflow', '');
    $input.val('');
    $('#searchResults').empty();
    selectedIndex = -1;
  }

  $('#searchToggle').on('click', openSearch);
  $('#searchClose').on('click', closeSearch);

  // Click on backdrop closes overlay
  $overlay.on('click', function (e) {
    if ($(e.target).is($overlay)) closeSearch();
  });

  // ----------------------------------------------------------
  // Search input (debounced)
  // ----------------------------------------------------------
  var debounceTimer;
  var selectedIndex = -1;

  $input.on('input', function () {
    clearTimeout(debounceTimer);
    var q = $(this).val().trim();
    if (q.length < 2) { $('#searchResults').empty(); selectedIndex = -1; return; }
    debounceTimer = setTimeout(function () {
      renderResults(search(q), q);
    }, 150);
  });

  // ----------------------------------------------------------
  // Keyboard navigation inside overlay
  // ----------------------------------------------------------
  $input.on('keydown', function (e) {
    var $items = $('#searchResults .search-result-item');
    if (!$items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, $items.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      window.location.href = $items.eq(selectedIndex).attr('href');
      return;
    } else {
      return;
    }

    $items.removeClass('selected');
    if (selectedIndex >= 0) $items.eq(selectedIndex).addClass('selected');
  });

  // ----------------------------------------------------------
  // Global keyboard shortcuts
  // ----------------------------------------------------------
  document.addEventListener('keydown', function (e) {
    // Ctrl+K or Cmd+K  → open search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      $overlay.hasClass('active') ? closeSearch() : openSearch();
      return;
    }
    // Escape → close
    if (e.key === 'Escape' && $overlay.hasClass('active')) {
      closeSearch();
      return;
    }
    // '/' key when NOT typing in an input → open search
    if (e.key === '/' && !$overlay.hasClass('active')) {
      var tag = document.activeElement.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        openSearch();
      }
    }
  });

})();
// ============================================================
// /CLIENT-SIDE SEARCH
// ============================================================