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

  /* ================= 0. WHERE THE HOMEPAGE STARTS =================
     A refresh should open at the top. Two things used to drop people
     mid-page instead: the browser restoring the old scroll position, and a
     leftover #tracks in the address (the Tracks menu link and Find Your
     Track add it, and Safari hides it in the address bar) that the browser
     jumps back to on every reload. Links that bring someone here on purpose,
     like a track page's "Student Interest" link to #interest, still land on
     their section, but only once the intro has let go of the scroll lock,
     because while it's held the browser's own jump can't happen. */
  const homepage = !!document.querySelector('.intro');
  const navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  const navType = navEntry ? navEntry.type
    : (performance.navigation && performance.navigation.type === 1 ? 'reload' : 'navigate');
  let pendingHash = '';
  if (homepage) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (navType === 'reload' || navType === 'back_forward') {
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    } else if (location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)))) {
      pendingHash = location.hash;
    }
    window.scrollTo(0, 0);
  }
  function settleScroll() {
    if (!homepage) return;
    const el = pendingHash && document.getElementById(decodeURIComponent(pendingHash.slice(1)));
    if (el) {
      const nav = document.querySelector('.navbar');
      const offset = nav ? nav.offsetHeight : 0;
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - offset);
    } else {
      window.scrollTo(0, 0);
    }
    pendingHash = '';
  }
  // without the intro holding the scroll (reduced motion), settle on load
  if (homepage && !document.documentElement.classList.contains('intro-armed')) {
    addEventListener('load', settleScroll);
  }

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
      /* Centre the reveal on the badge. It sits above the middle of the
         screen because the words and title stack under it, so the opening
         and the ring can't use a fixed percentage. */
      const badge = intro.querySelector('.intro-badge');
      if (badge) {
        const r = badge.getBoundingClientRect();
        const cx = (r.left + r.width / 2) + 'px';
        const cy = (r.top + r.height / 2) + 'px';
        intro.querySelectorAll('.intro-iris, .intro-ring').forEach(function (el) {
          el.style.left = cx;
          el.style.top = cy;
        });
      }
      intro.classList.add('out');
      /* Release the scroll lock as the zoom starts so the page is live
         underneath — but NOT intro-armed, which is what keeps the overlay
         displayed. Dropping that here hid the whole outro instantly. */
      document.documentElement.classList.remove('intro-lock');
      settleScroll();
      // deal the headline in as the ring opens the site, not while the badge
      // is still filling the middle of the screen
      setTimeout(function () {
        document.dispatchEvent(new Event('mim:intro-done'));
      }, 1450);
      setTimeout(function () {
        document.documentElement.classList.remove('intro-armed');
        intro.remove();
      }, 2050);
    }
    const skip = intro.querySelector('.intro-skip');
    if (skip) skip.addEventListener('click', endIntro);
    // belt and braces: if this page was armed anyway, don't hold the scroll
    setTimeout(endIntro, still ? 0 : 3900);
    // never trap the page behind the intro if something above throws
    setTimeout(function () {
      document.documentElement.classList.remove('intro-lock', 'intro-armed');
    }, 8000);
  }

  /* ================= 3. COUNTDOWN =================
     Split-flap digits. Every card is always drawn with the same two static
     halves, and gets two flaps only while it changes, so no digit can sit
     on a different line from its neighbours. */
  const cd = document.querySelector('.countdown[data-target]');
  if (cd) {
    const target = new Date(cd.dataset.target).getTime();
    const grid = cd.querySelector('.cd-grid');
    const cells = [].slice.call(cd.querySelectorAll('.cd-cell'));
    const FLIP_MS = 620; // matches the two .3s flaps in mim-style.css

    function layer(cls, ch) {
      return '<span class="' + cls + '"><b>' + ch + '</b></span>';
    }

    function draw(cell, ch) {
      cell.innerHTML = layer('cd-half cd-top', ch) + layer('cd-half cd-bottom', ch);
    }

    function flip(cell, from, to) {
      // the new top waits behind the falling leaf; the old bottom stays put
      // until the new lower leaf lands over it
      cell.innerHTML =
        layer('cd-half cd-top', to) +
        layer('cd-half cd-bottom', from) +
        layer('cd-flap cd-flap-top', from) +
        layer('cd-flap cd-flap-bottom', to);
      clearTimeout(cell._settle);
      cell._settle = setTimeout(function () { draw(cell, to); }, FLIP_MS);
    }

    function setCell(cell, ch) {
      const prev = cell.dataset.v;
      if (prev === ch) return;
      cell.dataset.v = ch;
      // first paint, reduced motion, or a background tab: no flip, just draw
      if (prev === undefined || still || document.hidden) draw(cell, ch);
      else flip(cell, prev, ch);
    }

    function tick() {
      const left = target - Date.now();
      if (left <= 0) {
        grid.innerHTML = '<div class="cd-done">IT\u2019S HAPPENING</div>';
        clearInterval(timer);
        return;
      }
      const s = Math.floor(left / 1000);
      const d = Math.floor(s / 86400);
      const h = Math.floor(s / 3600) % 24;
      const m = Math.floor(s / 60) % 60;
      const sec = s % 60;
      const digits = String(d).padStart(3, '0') + String(h).padStart(2, '0')
                   + String(m).padStart(2, '0') + String(sec).padStart(2, '0');
      digits.split('').forEach(function (ch, i) {
        if (cells[i]) setCell(cells[i], ch);
      });
      grid.setAttribute('aria-label',
        d + ' days, ' + h + ' hours and ' + m + ' minutes until MAKE IT MOVE 2026');
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
