(function () {
  'use strict';

  /* ---- Toast ---- */
  var toastEl = null;
  var toastTimer = null;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    clearTimeout(toastTimer);
    toastEl.style.transition = 'transform .38s cubic-bezier(.16,1,.3,1)';
    toastEl.classList.add('show');
    toastTimer = setTimeout(function () {
      toastEl.style.transition = 'transform .3s cubic-bezier(.4,0,1,1)';
      toastEl.classList.remove('show');
    }, 2200);
  }

  /* ---- Share button ---- */

   
  var shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var url = 'https://kenicken.com';
      if (navigator.share) {
        navigator.share({ title: 'kenicken.com', url: url }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          showToast('링크가 복사되었어요!');
        }).catch(function () { showToast(url); });
      } else {
        showToast(url);
      }
    });
  }

  /* ---- Text scramble effect ---- */
  function TextScramble(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  TextScramble.prototype.setText = function (newText) {
    var self = this;
    var oldText = this.el.innerText;
    var length = Math.max(oldText.length, newText.length);
    var promise = new Promise(function (resolve) { self.resolve = resolve; });
    this.queue = [];
    for (var i = 0; i < length; i++) {
      var from = oldText[i] || '';
      var to = newText[i] || '';
      var start = Math.floor(Math.random() * 40);
      var end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from: from, to: to, start: start, end: end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  };
  TextScramble.prototype.update = function () {
    var output = '';
    var complete = 0;
    for (var i = 0, n = this.queue.length; i < n; i++) {
      var q = this.queue[i];
      if (this.frame >= q.end) { complete++; output += q.to; }
      else if (this.frame >= q.start) {
        if (!q.char || Math.random() < 0.28) { q.char = this.randomChar(); }
        output += '<span style="opacity:0.5;color:#009DFF;">' + q.char + '</span>';
      } else { output += q.from; }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) { this.resolve(); }
    else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; }
  };
  TextScramble.prototype.randomChar = function () {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  };

  /* ---- Organic 3D network background ---- */
  function NetworkBG(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    this.mouse = { x: 0, y: 0 };
    this.rotation = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    var self = this;
    window.addEventListener('resize', function () { self.resize(); });
    window.addEventListener('mousemove', function (e) {
      self.mouse.x = (e.clientX / self.width) * 2 - 1;
      self.mouse.y = (e.clientY / self.height) * 2 - 1;
    });
    this.resize();
    this.animate = this.animate.bind(this);
    this.animate();
  }
  NetworkBG.prototype.resize = function () {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.createParticles();
  };
  NetworkBG.prototype.createParticles = function () {
    this.particles = [];
    var count = Math.min(220, Math.floor((this.width * this.height) / 18000));
    for (var i = 0; i < count; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: (Math.random() - 0.5) * 2000,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1
      });
    }
  };
  NetworkBG.prototype.project = function (p) {
    var fov = 800;
    var scale = fov / (fov + p.z);
    return { x: p.x * scale + this.width / 2, y: p.y * scale + this.height / 2, scale: scale };
  };
  NetworkBG.prototype.rotate = function (p, ax, ay) {
    var x = p.x * Math.cos(ay) - p.z * Math.sin(ay);
    var z = p.x * Math.sin(ay) + p.z * Math.cos(ay);
    var y2 = p.y * Math.cos(ax) - z * Math.sin(ax);
    var z2 = p.y * Math.sin(ax) + z * Math.cos(ax);
    return { x: x, y: y2, z: z2 };
  };
  NetworkBG.prototype.animate = function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.target.y = this.mouse.x * 0.5;
    this.target.x = -this.mouse.y * 0.5;
    this.rotation.x += (this.target.x - this.rotation.x) * 0.05;
    this.rotation.y += (this.target.y - this.rotation.y) * 0.05;
    var proj = [];
    var time = Date.now() * 0.001;
    var self = this;
    this.particles.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.z += p.vz;
      var lim = 1000;
      if (p.x > lim) p.x = -lim; if (p.x < -lim) p.x = lim;
      if (p.y > lim) p.y = -lim; if (p.y < -lim) p.y = lim;
      if (p.z > lim) p.z = -lim; if (p.z < -lim) p.z = lim;
      var r = self.rotate(p, self.rotation.x, self.rotation.y);
      r.z += Math.sin(time * 0.5) * 100;
      var pr = self.project(r);
      if (r.z > -700) {
        proj.push({ x: pr.x, y: pr.y, scale: pr.scale, z: r.z, orig: p });
        var alpha = Math.max(0, (1 - Math.abs(r.z) / 1000) * 0.4);
        self.ctx.beginPath();
        self.ctx.arc(pr.x, pr.y, p.size * pr.scale, 0, Math.PI * 2);
        self.ctx.fillStyle = 'rgba(0,0,0,' + alpha + ')';
        self.ctx.fill();
      }
    });
    for (var i = 0; i < proj.length; i++) {
      var p1 = proj[i];
      var c = 0;
      for (var j = i + 1; j < proj.length; j++) {
        var p2 = proj[j];
        var dx = p1.x - p2.x, dy = p1.y - p2.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          var mx = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 20;
          var my = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 20;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.quadraticCurveTo(mx, my, p2.x, p2.y);
          var a = Math.min(p1.orig.size, p2.orig.size) * 0.08 * (1 - dist / 150);
          this.ctx.strokeStyle = 'rgba(0,0,0,' + a + ')';
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
          c++; if (c > 3) break;
        }
      }
    }
    requestAnimationFrame(this.animate);
  };

  /* ---- Perspective tilt on title ---- */
  function Tilt(el) {
    this.el = el;
    this.mouse = { x: 0, y: 0 };
    var self = this;
    document.addEventListener('mousemove', function (e) {
      self.mouse.x = e.clientX - window.innerWidth / 2;
      self.mouse.y = e.clientY - window.innerHeight / 2;
    });
    this.update = this.update.bind(this);
    this.update();
  }
  Tilt.prototype.update = function () {
    var ry = (this.mouse.x / (window.innerWidth / 2)) * 5;
    var rx = -(this.mouse.y / (window.innerHeight / 2)) * 5;
    this.el.style.transform = 'perspective(1000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) scale3d(1.02,1.02,1.02)';
    this.el.style.textShadow = (-ry * 1.5) + 'px ' + (rx * 1.5) + 'px 24px rgba(0,0,0,0.10)';
    requestAnimationFrame(this.update.bind(this));
  };

  /* ---- Variable font weight wave animation ---- */
  function initVarAnim(el) {
    var text = el.textContent || 'kenicken.com';
    el.textContent = '';
    text.split('').forEach(function (ch) {
      var s = document.createElement('span');
      s.textContent = ch;
      s.style.fontWeight = '450';
      el.appendChild(s);
    });

    function animateWord() {
      var letters = el.children;
      for (var i = 0; i < letters.length; i++) {
        (function (letter, delay) {
          setTimeout(function () { letter.style.fontWeight = '900'; }, delay);
          setTimeout(function () { letter.style.fontWeight = '100'; }, delay + 1000);
        })(letters[i], i * 100);
      }
    }

    animateWord();
    setInterval(animateWord, 1700);
  }

  /* ---- Init ---- */
  var bgEl = document.getElementById('bgCanvas');
  if (bgEl) { new NetworkBG(bgEl); }

  var titleEl = document.getElementById('heroTitle');
  if (titleEl) {
    initVarAnim(titleEl);
    new Tilt(titleEl);
  }

  var roleEl = document.getElementById('role');
  if (roleEl) {
    var rfx = new TextScramble(roleEl);
    var roles = ['UI-UX Design', 'Front-end Junior', 'Video Editing', 'Graphic Design'];
    var idx = 0;
    var next = function () {
      idx = (idx + 1) % roles.length;
      rfx.setText(roles[idx]).then(function () { setTimeout(next, 3500); });
    };
    setTimeout(next, 2600);
  }

  /* ---- Page transition swipe to color pages ---- */
  (function () {
    function rndNum() { return Math.floor(Math.random() * 256); }
    function rndRGB() {
      var r, g, b, luma;
      do {
        r = rndNum(); g = rndNum(); b = rndNum();
        luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      } while (luma < 70 || luma > 230);
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    var colorTargets = ['fortune', 'project', 'about'];
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.gnb-links .nav-link'));
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      var isColor = colorTargets.some(function (t) { return href.indexOf('/' + t) !== -1; });
      if (!isColor) return;

      link.addEventListener('click', function (e) {
        e.preventDefault();
        var color = rndRGB();
        sessionStorage.setItem('pt_color', color);

        var isMobile = window.innerWidth <= 768;
        var overlay = document.createElement('div');
        overlay.id = 'pt-src-overlay';
        Object.assign(overlay.style, {
          position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
          zIndex: '9999', backgroundColor: color, pointerEvents: 'none',
          transform: isMobile ? 'translateY(100%)' : 'translateX(100%)'
        });
        document.body.appendChild(overlay);
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            overlay.style.transition = 'transform .55s cubic-bezier(.76,0,.24,1)';
            overlay.style.transform = 'translate(0,0)';
          });
        });

        setTimeout(function () { window.location.href = href; }, 650);
      });
    });

    function cleanSrcOverlay() {
      var o = document.getElementById('pt-src-overlay');
      if (o) o.remove();
    }
    window.addEventListener('pagehide', cleanSrcOverlay);
    window.addEventListener('pageshow', function () {
      cleanSrcOverlay();
      sessionStorage.removeItem('pt_color');
    });
  }());

  /* ---- Scroll reveal ---- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  function reveal() {
    var vh = window.innerHeight;
    reveals.forEach(function (el) {
      if (el.dataset.shown) return;
      if (el.getBoundingClientRect().top < vh * 0.88) {
        el.classList.add('shown');
        el.dataset.shown = '1';
      }
    });
  }
  reveal();
  window.addEventListener('scroll', reveal, { passive: true });
  window.addEventListener('resize', reveal);
})();
