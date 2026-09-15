/* MAKE IT MOVE — motion layer.
   Interactions that need JS to set up; everything they trigger is animated
   in mim-style.css so prefers-reduced-motion can switch it all off in one
   place. Each block is independent and no-ops if its markup isn't present,
   so the same file can load on the home page and the track pages. */

(function motion() {

  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- scroll progress, pinned to the top of the viewport ---- */
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  let ticking = false;
  function drawProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    ticking = false;
  }
  addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(drawProgress); }
  }, { passive: true });
  drawProgress();

  /* ---- kinetic headline ----
     Only the plain text is split into letters. MOVE keeps its gradient as a
     single element, because background-clip:text clips to the element's own
     box — per-letter spans would each restart the colour ramp. */
  const h1 = document.querySelector('.hero h1');
  if (h1 && !still) {
    const pieces = [];
    [].slice.call(h1.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split('').forEach(function (ch) {
          const span = document.createElement('span');
          span.className = 'kin';
          // a plain space collapses once it's inline-block
          span.textContent = ch === ' ' ? ' ' : ch;
          frag.appendChild(span);
          pieces.push(span);
        });
        h1.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        node.classList.add('kin');
        pieces.push(node);
      }
    });
    function dealIn() {
      pieces.forEach(function (el, i) {
        el.style.animation = 'none';
        void el.offsetWidth;           // force a reflow so the restart takes
        el.style.animation = '';
        el.style.animationDelay = (i * 45) + 'ms';
      });
    }
    dealIn();
    h1.classList.add('kinetic');

    /* Behind the intro the headline would finish unseen, so run it again as
       the logo dissolves — the letters land with the reveal. */
    document.addEventListener('mim:intro-done', dealIn);
  }

  /* ---- track cards: light follows the cursor, card tilts toward it ---- */
  const cards = document.querySelectorAll('.track-card');
  if (!still && matchMedia('(hover: hover)').matches) {
    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
        card.style.setProperty('--rx', ((0.5 - py) * 6) + 'deg');
        card.style.setProperty('--ry', ((px - 0.5) * 6) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---- grids that deal themselves in, one tile at a time ---- */
  document.querySelectorAll('.expect-grid, .stagger').forEach(function (grid) {
    grid.classList.add('stagger');
    [].slice.call(grid.children).forEach(function (child, i) {
      child.style.setProperty('--i', i);
    });
  });
})();
