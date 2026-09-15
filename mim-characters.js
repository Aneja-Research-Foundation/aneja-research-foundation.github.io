/* MAKE IT MOVE — animated track characters.
   One source of truth: the four figures are defined here as SVG strings and
   injected into any [data-character] element, so the track cards on the home
   page and the hero on each track page stay in sync.

   Every figure is stroke-only line art on a per-track gradient, matching the
   poster's brush-stroke palette. All motion lives in mim-style.css so it can
   be switched off in one place under prefers-reduced-motion. */

const MIM_CHARACTERS = {

  /* PERFORM — a girl mid-dance: hair and skirt swinging, one arm thrown up,
     back leg kicking out. */
  perform: `
<svg class="ch ch-perform" viewBox="0 0 200 260" fill="none"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <defs>
    <linearGradient id="ch-perform-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="var(--magenta)"/>
      <stop offset="100%" stop-color="var(--orange)"/>
    </linearGradient>
  </defs>
  <g stroke="url(#ch-perform-g)" stroke-width="5">
    <ellipse class="ch-shadow" cx="100" cy="234" rx="44" ry="7" stroke-width="3"/>

    <g class="ch-hair">
      <path d="M88 48c-10-4-18 6-20 18-2 12 2 22 8 26"/>
      <path d="M86 54c-8 4-12 14-11 24"/>
    </g>

    <circle cx="105" cy="56" r="17"/>
    <path d="M105 73c-3 18-5 32-7 48"/>

    <path class="ch-arm-a" d="M102 90c10-6 20-14 26-24 3-5 5-10 6-15"/>
    <path class="ch-arm-b" d="M100 96c-9 5-18 9-27 10-5 1-9 0-13-2"/>

    <path class="ch-skirt" d="M98 121 70 170h56z"/>

    <path d="M88 170c-2 18-5 32-8 46"/>
    <path class="ch-leg" d="M112 170c6 14 13 24 22 30 4 3 8 5 12 6"/>
  </g>
  <g stroke="url(#ch-perform-g)" stroke-width="4" class="ch-sparks">
    <path d="M152 70v12M146 76h12"/>
    <path d="M40 120v9M35.5 124.5h9"/>
    <path d="M160 152v9M155.5 156.5h9"/>
  </g>
</svg>`,

  /* THINK — a boy with his hand up, the idea landing a beat before the
     arm goes up. */
  think: `
<svg class="ch ch-think" viewBox="0 0 200 260" fill="none"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <defs>
    <linearGradient id="ch-think-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="var(--cyan)"/>
      <stop offset="100%" stop-color="var(--violet)"/>
    </linearGradient>
  </defs>
  <g stroke="url(#ch-think-g)" stroke-width="5">
    <ellipse class="ch-shadow" cx="98" cy="234" rx="42" ry="7" stroke-width="3"/>

    <path d="M80 50c4-10 14-15 24-13 9 2 15 8 17 16"/>
    <circle cx="96" cy="62" r="17"/>
    <path d="M96 79v62"/>

    <g class="ch-arm-raise">
      <path d="M94 98c9-8 16-17 20-27"/>
      <path d="M114 71c1-6 1-12 0-18"/>
      <path d="M108 56c2-5 5-8 8-9"/>
    </g>

    <path d="M94 100c-8 9-15 18-20 27-2 4-3 9-3 13"/>

    <path d="M96 141c-7 20-14 38-22 54"/>
    <path d="M96 141c7 20 13 38 19 54"/>
    <path d="M68 197h16M110 197h16"/>
  </g>
  <g stroke="url(#ch-think-g)" stroke-width="4" class="ch-idea">
    <path d="M136 30v14M129 37h14"/>
    <path d="M150 54v10M145 59h10"/>
  </g>
</svg>`,

  /* BUILD — a boy at a laptop, fingers tapping, code filling the screen
     line by line with a blinking cursor. */
  build: `
<svg class="ch ch-build" viewBox="0 0 200 260" fill="none"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <defs>
    <linearGradient id="ch-build-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="var(--green)"/>
      <stop offset="100%" stop-color="var(--cyan)"/>
    </linearGradient>
  </defs>
  <g stroke="url(#ch-build-g)" stroke-width="5">
    <ellipse class="ch-shadow" cx="104" cy="234" rx="50" ry="7" stroke-width="3"/>

    <path d="M42 64c2-12 12-20 24-17"/>
    <circle cx="58" cy="70" r="16"/>
    <path class="ch-lean" d="M58 86c5 16 8 32 10 48"/>

    <path class="ch-arm-type-a" d="M62 104c12 8 23 17 34 26"/>
    <path class="ch-arm-type-b" d="M64 116c13 7 25 16 36 26"/>

    <path d="M68 134h34"/>
    <path d="M102 136c3 16 4 30 4 42"/>
    <path d="M96 180h20"/>

    <path d="M60 138v40M96 140v34" stroke-width="4"/>

    <path d="M118 150h56l-8-52h-40z"/>
    <path d="M110 152h76l6 12h-76z"/>
  </g>
  <g stroke="url(#ch-build-g)" stroke-width="4" class="ch-code">
    <path d="M128 112h26"/>
    <path d="M131 124h30"/>
    <path d="M134 136h22"/>
  </g>
  <g stroke="url(#ch-build-g)" stroke-width="4" class="ch-caret">
    <path d="M162 131v11"/>
  </g>
</svg>`,

  /* SOLVE — a girl reading a building, the sight-line travelling out from
     her finger and the windows waking up floor by floor. */
  solve: `
<svg class="ch ch-solve" viewBox="0 0 220 260" fill="none"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <defs>
    <linearGradient id="ch-solve-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="var(--amber)"/>
      <stop offset="100%" stop-color="var(--orange-deep)"/>
    </linearGradient>
  </defs>
  <g stroke="url(#ch-solve-g)" stroke-width="5">
    <ellipse class="ch-shadow" cx="52" cy="234" rx="38" ry="7" stroke-width="3"/>

    <g class="ch-hair">
      <path d="M34 66c-6-14 2-28 16-30 13-2 24 7 25 20"/>
      <path d="M32 68c-4 10-3 20 2 27"/>
    </g>
    <circle cx="52" cy="64" r="16"/>
    <path d="M52 80v60"/>

    <path class="ch-arm-point" d="M50 98c14-3 27-5 40-5"/>
    <path d="M50 100c-8 10-13 20-15 31"/>

    <path d="M52 140c-6 20-11 38-16 54"/>
    <path d="M52 140c6 20 10 38 14 54"/>

    <path d="M132 226V66l54-18v178z"/>
    <path d="M124 226h72"/>
    <path d="M150 226v-26h18v26"/>
  </g>

  <g class="ch-sight" stroke="url(#ch-solve-g)" stroke-width="3"
     stroke-dasharray="6 8">
    <path d="M96 92h34"/>
  </g>

  <g class="ch-windows" fill="url(#ch-solve-g)" stroke="none">
    <rect x="142" y="82"  width="12" height="14" rx="2"/>
    <rect x="162" y="76"  width="12" height="14" rx="2"/>
    <rect x="142" y="112" width="12" height="14" rx="2"/>
    <rect x="162" y="106" width="12" height="14" rx="2"/>
    <rect x="142" y="142" width="12" height="14" rx="2"/>
    <rect x="162" y="136" width="12" height="14" rx="2"/>
    <rect x="142" y="172" width="12" height="14" rx="2"/>
    <rect x="162" y="166" width="12" height="14" rx="2"/>
  </g>
</svg>`
};

(function hydrateCharacters() {
  document.querySelectorAll('[data-character]').forEach(function (slot) {
    const svg = MIM_CHARACTERS[slot.dataset.character];
    if (svg) slot.innerHTML = svg;
  });

  /* Cards only start dancing once they're actually on screen — four figures
     animating off-screen is wasted work on a phone. */
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.ch-slot').forEach(function (s) { s.classList.add('ch-live'); });
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('ch-live');
        io.unobserve(entry.target);
      }
    });
    /* A hero figure is anchored to the bottom of a tall section and can hang
       well below the fold, so any sliver on screen counts as visible. */
  }, { threshold: 0.01 });
  document.querySelectorAll('.ch-slot').forEach(function (s) { io.observe(s); });
})();
