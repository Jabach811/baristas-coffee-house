// Hero intro video: play once per session, then reveal logo + buttons on the final frame.
(() => {
  const vid = document.getElementById('vh-vid');
  const stage = document.getElementById('vh-stage');
  if (!stage || !vid) return;

  const reveal = () => {
    stage.classList.add('vh-revealed');
    sessionStorage.setItem('heroSeen', '1');
  };
  const showLastFrame = () => {
    vid.pause();
    if (vid.readyState >= 1) vid.currentTime = vid.duration;
    else vid.addEventListener('loadedmetadata', () => { vid.currentTime = vid.duration; }, { once: true });
  };

  const skipIntro = sessionStorage.getItem('heroSeen') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (skipIntro) {
    stage.classList.add('vh-instant');
    showLastFrame();
    reveal();
    return;
  }
  const failsafe = setTimeout(reveal, 8000);
  vid.addEventListener('ended', () => { clearTimeout(failsafe); setTimeout(reveal, 300); });
  vid.addEventListener('error', reveal);
  vid.play().catch(reveal);
  stage.addEventListener('pointerdown', () => {
    if (stage.classList.contains('vh-revealed')) return;
    clearTimeout(failsafe);
    showLastFrame();
    reveal();
  });
})();

// Nav: mobile overlay + hide on scroll down, show on scroll up.
(() => {
  const burger = document.querySelector('.burger');
  const overlay = document.getElementById('overlay');
  if (burger && overlay) {
    const set = (open) => {
      overlay.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => set(true));
    overlay.querySelector('.ov-close').addEventListener('click', () => set(false));
    overlay.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  const nav = document.querySelector('.nav');
  if (!nav) return;
  let last = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('hide', y > 200 && y > last);
    last = y;
  }, { passive: true });
})();

// Menu page: drink artwork opens larger in a dialog.
(() => {
  const dialog = document.querySelector('.lightbox');
  if (!dialog) return;
  const img = dialog.querySelector('img');
  const title = dialog.querySelector('h2');
  const meta = dialog.querySelector('p');
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => {
    const r = dialog.getBoundingClientRect();
    if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
  document.querySelectorAll('.coin-zoom').forEach((btn) => {
    btn.addEventListener('click', () => {
      const src = btn.querySelector('img').getAttribute('src');
      img.src = src;
      img.alt = `${btn.dataset.name} illustration`;
      title.textContent = btn.dataset.name;
      meta.textContent = btn.dataset.meta || '';
      document.body.style.overflow = 'hidden';
      dialog.showModal();
    });
  });
})();
