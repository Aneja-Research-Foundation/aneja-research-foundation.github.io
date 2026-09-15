/* MAKE IT MOVE — the four set pieces.
   1. scroll-driven track takeover
   2. cinematic intro (once per session)
   3. live countdown with flipping digits
   4. page-transition curtain

   Each block no-ops when its markup isn't on the page, and the whole file
   sits behind one reduced-motion check. Styling lives in mim-style.css. */

(function showpiece() {

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The sticky stage has to clear the sticky navbar, whose height differs
     between breakpoints — measure it rather than hard-coding 74px. */
  function syncNavHeight() {
    const nav = document.querySelector('.navbar');
    if (nav) {
      document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
    }
  }
  syncNavHeight();
  addEventListener('resize', syncNavHeight);

  /* ================= 1. TRACK TAKEOVER ================= */
  const stage = document.querySelector('.takeover');
  if (stage && !still) {
    const chapters = [].slice.call(stage.querySelectorAll('.tk-chapter'));
    const rail = [].slice.call(stage.querySelectorAll('.tk-rail i'));
    const n = chapters.length;
    let queued = false;

    function paint() {
      queued = false;
      const travel = stage.offsetHeight - window.innerHeight;
      const scrolled = -stage.getBoundingClientRect().top;
      const p = travel > 0 ? Math.min(1, Math.max(0, scrolled / travel)) : 0;

      // Which chapter, and how far through it are we?
      let lead = 0;
      chapters.forEach(function (ch, i) {
        const lp = p * n - i;

        // fade each chapter in and out over the first/last 20% of its run
        let o = 0;
        if (lp > -0.2 && lp < 1.2) {
          o = lp < 0 ? (lp + 0.2) / 0.2
            : lp > 1 ? (1.2 - lp) / 0.2
              : 1;
        }
        // the last chapter holds instead of fading out at the very end
        if (i === n - 1 && lp >= 1) o = 1;

        ch.style.opacity = o;
        ch.style.setProperty('--p', Math.min(1.2, Math.max(-0.2, lp)));
        ch.classList.toggle('on', o > 0.5);
        if (o > 0.5) lead = i;
      });

      rail.forEach(function (bar, i) { bar.classList.toggle('lit', i <= lead); });
    }

    addEventListener('scroll', function () {
      if (!queued) { queued = true; requestAnimationFrame(paint); }
    }, { passive: true });
    addEventListener('resize', paint);
    paint();
  }

  /* ================= 2. CINEMATIC INTRO ================= */
  const intro = document.querySelector('.intro');
  if (intro && document.documentElement.classList.contains('intro-armed')) {
    let finished = false;
    function endIntro() {
      if (finished) return;
      finished = true;
      /* Open the iris from the logo's actual centre, so the site comes out
         of the badge rather than from a spot near it. The logo sits above
         centre because the words and title stack under it. */
      const logo = intro.querySelector('.intro-logo');
      const iris = intro.querySelector('.intro-iris');
      if (logo && iris) {
        const r = logo.getBoundingClientRect();
        iris.style.left = (r.left + r.width / 2) + 'px';
        iris.style.top = (r.top + r.height / 2) + 'px';
      }
      intro.classList.add('out');
      // release the scroll lock as the zoom starts, not when it ends, so the
      // page is already live underneath by the time the logo dissolves
      document.documentElement.classList.remove('intro-armed');
      document.dispatchEvent(new Event('mim:intro-done'));
      setTimeout(function () { intro.remove(); }, 1060);
    }
    const skip = intro.querySelector('.intro-skip');
    if (skip) skip.addEventListener('click', endIntro);
    // belt and braces: if this page was armed anyway, don't hold the scroll
    setTimeout(endIntro, still ? 0 : 1800);
    // never trap the page behind the intro if something above throws
    setTimeout(function () {
      document.documentElement.classList.remove('intro-armed');
    }, 6000);
  }

  /* ================= 3. COUNTDOWN ================= */
  const cd = document.querySelector('.countdown[data-target]');
  if (cd) {
    const target = new Date(cd.dataset.target).getTime();
    const grid = cd.querySelector('.cd-grid');
    const units = [].slice.call(cd.querySelectorAll('.cd-unit'));

    function cells(unit) { return [].slice.call(unit.querySelectorAll('.cd-cell')); }

    /* Only rebuild a cell whose digit actually changed, so the flip fires
       on the seconds every second but on the days about once a day. */
    function setCell(cell, ch) {
      if (cell.dataset.v === ch) return;
      const prev = cell.dataset.v;
      cell.dataset.v = ch;
      if (prev === undefined || still) { cell.textContent = ch; return; }
      cell.innerHTML = '<span class="old">' + prev + '</span>'
                     + '<span class="new">' + ch + '</span>';
    }

    function tick() {
      const left = target - Date.now();
      if (left <= 0) {
        grid.innerHTML = '<div class="cd-done">IT’S HAPPENING</div>';
        clearInterval(timer);
        return;
      }
      const s = Math.floor(left / 1000);
      const vals = [
        String(Math.floor(s / 86400)).padStart(3, '0'),
        String(Math.floor(s / 3600) % 24).padStart(2, '0'),
        String(Math.floor(s / 60) % 60).padStart(2, '0'),
        String(s % 60).padStart(2, '0')
      ];
      units.forEach(function (unit, i) {
        const cs = cells(unit);
        vals[i].split('').forEach(function (ch, j) {
          if (cs[j]) setCell(cs[j], ch);
        });
      });
    }
    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ================= 4. PAGE CURTAIN ================= */
  if (!still) {
    const curtain = document.createElement('div');
    curtain.className = 'curtain';
    document.body.appendChild(curtain);

    // reveal on arrival, unless the intro is already doing that job
    if (!document.documentElement.classList.contains('intro-armed')) {
      curtain.classList.add('out');
      setTimeout(function () { curtain.classList.remove('out'); }, 640);
    }

    // a curtain left down after a back/forward restore would hide the page
    addEventListener('pageshow', function (e) {
      if (e.persisted) curtain.className = 'curtain';
    });

    const TRACKS = { 'perform.html': 1, 'think.html': 1, 'build.html': 1, 'solve.html': 1 };

    document.addEventListener('click', function (e) {
      const a = e.target.closest && e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href
        || href.charAt(0) === '#'
        || a.target === '_blank'
        || a.hasAttribute('download')
        || a.origin !== location.origin
        || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      // same page, different anchor — let the browser scroll
      if (a.pathname === location.pathname && a.hash) return;

      e.preventDefault();
      const file = a.pathname.split('/').pop();
      if (TRACKS[file]) {
        curtain.style.background = 'var(--grad-' + file.replace('.html', '') + ')';
      }
      curtain.classList.add('in');
      setTimeout(function () { location.href = a.href; }, 460);
    });
  }
})();
