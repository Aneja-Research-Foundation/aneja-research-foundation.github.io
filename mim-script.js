// MAKE IT MOVE 2026 — interactions

document.addEventListener('DOMContentLoaded', () => {

  /* ---- mobile menu ---- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  /* ---- reveal on scroll ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---- PERFORM/THINK/BUILD/SOLVE statement cycle ---- */
  const stackSpans = document.querySelectorAll('#statementStack span');
  if (stackSpans.length) {
    let idx = 0;
    stackSpans[0].classList.add('active');
    setInterval(() => {
      stackSpans[idx].classList.remove('active');
      idx = (idx + 1) % stackSpans.length;
      stackSpans[idx].classList.add('active');
    }, 1400);
  }

  /* ---- find your track quiz ---- */
  const quizOptions = document.querySelectorAll('.quiz-opt');
  const quizResult = document.getElementById('quizResult');
  const quizTrackName = document.getElementById('quizTrackName');
  quizOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      quizOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const track = opt.getAttribute('data-track');
      if (quizTrackName) quizTrackName.textContent = track;
      if (quizResult) quizResult.classList.add('show');
    });
  });

  /* ---- FAQ accordion ---- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---- registration switch ----
     Off until registration is actually confirmed. When it opens, flip
     REGISTRATION_OPEN to true: the header COMING SOON buttons become
     REGISTER NOW and go to the Command Center's /register form, and the
     "registrations open on..." copy is replaced to match. There is
     deliberately no date trigger — the timeline may still move.
     Elements opt in with data-reg-text (replacement HTML) and
     data-reg-link (retarget). Add ?reg=open to any page URL to preview. */
  const REGISTRATION_OPEN = false;
  const REG_URL = 'https://arf-command-center.vercel.app/register';
  const regOpen = REGISTRATION_OPEN
    || new URLSearchParams(location.search).get('reg') === 'open';
  if (regOpen) {
    document.querySelectorAll('[data-reg-text]').forEach((el) => {
      el.innerHTML = el.dataset.regText;
    });
    // on a track page, open the form with that track already chosen
    const page = location.pathname.split('/').pop().replace('.html', '');
    const onTrack = ['perform', 'think', 'build', 'solve'].indexOf(page) !== -1;
    document.querySelectorAll('a[data-reg-link]').forEach((a) => {
      const track = a.dataset.regTrack || (onTrack ? page : '');
      a.href = track ? REG_URL + '?track=' + track.toUpperCase() : REG_URL;
    });
    document.documentElement.classList.add('reg-open');
  }

  /* ---- interest form ----
     Submits to the ARF Command Center's public API at
     https://arf-command-center.vercel.app, which stores it in the
     `interest_submissions` table — visible to staff under Responses.
     The Command Center only accepts this from origins in its
     CORS_ALLOW_ORIGINS setting; if a submission can't get through, it
     falls back to local-only storage (catch block below). */
  const ARF_CC_API_BASE = 'https://arf-command-center.vercel.app';

  const form = document.getElementById('interestForm');
  const formSuccess = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '.6'; }

      try {
        const res = await fetch(`${ARF_CC_API_BASE}/api/interest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`Command Center rejected submission: ${res.status}`);
      } catch (err) {
        // Backend unreachable (not deployed yet, offline, etc.) — keep a
        // local backup so the data isn't lost outright, and say so loudly
        // in the console for whoever's debugging, but don't scare the
        // student filling the form: still show the success state below.
        console.warn('[MAKE IT MOVE] Could not reach ARF Command Center, saving locally only:', err);
        try {
          const existing = JSON.parse(localStorage.getItem('mim_interest_submissions') || '[]');
          existing.push({ ...data, submittedAt: new Date().toISOString() });
          localStorage.setItem('mim_interest_submissions', JSON.stringify(existing));
        } catch (storageErr) { /* localStorage unavailable too — nothing more we can do client-side */ }
      }

      form.style.display = 'none';
      formSuccess.classList.add('show');
    });
  }

});

/* ---- share buttons on track pages ----
   Phones get the system share sheet (WhatsApp, Instagram, anything);
   elsewhere the button copies the link. The WhatsApp button next to it is
   a plain link and needs no script. */
document.querySelectorAll('[data-share]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const data = { title: document.title, text: btn.dataset.share, url: btn.dataset.url };
    if (navigator.share) {
      try { await navigator.share(data); } catch (e) { /* closed the sheet */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(data.url);
      const label = btn.textContent;
      btn.textContent = 'LINK COPIED ✓';
      setTimeout(() => { btn.textContent = label; }, 1800);
    } catch (e) {
      window.prompt('Copy this link:', data.url);
    }
  });
});
