// Menu artwork opens in a native modal, with keyboard focus kept inside it.
(() => {
  if (!document.body.classList.contains('menu-page')) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'icon-lightbox';
  dialog.setAttribute('aria-labelledby', 'icon-lightbox-title');
  dialog.innerHTML = '<button class="icon-lightbox-close" type="button" aria-label="Close artwork">×</button><img alt=""><h2 id="icon-lightbox-title"></h2>';
  document.body.append(dialog);
  const large = dialog.querySelector('img');
  const title = dialog.querySelector('h2');
  let opener;
  let previousOverflow = '';
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    opener?.focus({ preventScroll: true });
  });
  document.querySelectorAll('.coin > img, .menu-art > img, .milk-list img').forEach((img) => {
    const heading = img.closest('.coin')?.querySelector('h3')?.cloneNode(true);
    heading?.querySelector('.price')?.remove();
    const name = (heading?.textContent || img.closest('.menu-band')?.querySelector('h2')?.textContent || img.parentElement.textContent || 'Menu artwork').trim();
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-zoom';
    button.setAttribute('aria-label', `View ${name} artwork`);
    button.setAttribute('aria-haspopup', 'dialog');
    img.replaceWith(button);
    button.append(img);
    button.addEventListener('click', () => {
      opener = button;
      title.textContent = name;
      large.alt = `${name} illustration`;
      large.onerror = () => { large.onerror = null; large.src = img.src; };
      large.src = img.dataset.fullSrc || img.src;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
    });
  });
})();

(() => {
  const vid = document.getElementById("vh-vid");
  const stage = document.getElementById("vh-stage");
  if (!stage) return;
  const hero = stage.closest(".video-hero");

  const reveal = () => {
    stage.classList.add("vh-revealed");
    hero.classList.add("vh-done");
    sessionStorage.setItem("heroSeen", "1");
  };
  const showLastFrame = () => {
    vid.pause();
    if (vid.readyState >= 1) vid.currentTime = vid.duration;
    else vid.addEventListener("loadedmetadata", () => { vid.currentTime = vid.duration; }, { once: true });
  };

  const skipIntro = sessionStorage.getItem("heroSeen")
    || matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (skipIntro) {
    stage.classList.add("vh-instant");
    showLastFrame();
    reveal();
  } else {
    vid.addEventListener("ended", () => setTimeout(reveal, 300));
    vid.addEventListener("error", reveal);
    vid.play().catch(reveal);
    const failsafe = setTimeout(reveal, 8000);
    vid.addEventListener("ended", () => clearTimeout(failsafe));
    stage.addEventListener("pointerdown", () => {
      if (stage.classList.contains("vh-revealed")) return;
      clearTimeout(failsafe);
      showLastFrame();
      reveal();
    });
  }
})();

(() => {
  const burger = document.querySelector(".burger");
  const overlay = document.getElementById("overlay");
  const closeBtn = overlay.querySelector(".ov-close");
  const set = (open) => {
    overlay.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    closeBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => set(!overlay.classList.contains("open")));
  closeBtn.addEventListener("click", () => set(false));
  overlay.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });

  const pill = document.querySelector(".nav-pill");
  let last = 0;
  addEventListener("scroll", () => {
    const y = scrollY;
    pill.classList.toggle("hide", y > 200 && y > last);
    last = y;
  }, { passive: true });
})();

(() => {
  const items = document.querySelectorAll(".rv");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((el) => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
  items.forEach((el) => io.observe(el));

  document.querySelectorAll("[data-stagger]").forEach((group) => {
    [...group.children].forEach((child, i) => child.style.setProperty("--i", i % 12));
  });
})();
