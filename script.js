const HOURS = [
  null,
  { open: 7, close: 16 },
  { open: 7, close: 16 },
  { open: 7, close: 16 },
  { open: 7, close: 16 },
  { open: 7, close: 16 },
  { open: 7, close: 15 }
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function localNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, time: Number(get('hour')) % 24 + Number(get('minute')) / 60 };
}

function clock(h) {
  const hour = Math.floor(h);
  const min = Math.round((h - hour) * 60);
  const suffix = hour >= 12 ? 'pm' : 'am';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return min ? `${display}:${String(min).padStart(2, '0')}${suffix}` : `${display}${suffix}`;
}

function nextOpening(day) {
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (HOURS[d]) return { day: d, open: HOURS[d].open, tomorrow: i === 1 };
  }
  return null;
}

function renderStatus() {
  const nodes = document.querySelectorAll('[data-status]');
  if (!nodes.length) return;

  const { day, time } = localNow();
  const today = HOURS[day];
  const isOpen = !!today && time >= today.open && time < today.close;

  let label;
  if (isOpen) {
    label = `Open now · until ${clock(today.close)}`;
  } else if (today && time < today.open) {
    label = `Closed · opens at ${clock(today.open)}`;
  } else {
    const next = nextOpening(day);
    const when = next.tomorrow ? 'tomorrow' : DAYS[next.day];
    label = `Closed · opens ${when} at ${clock(next.open)}`;
  }

  nodes.forEach((node) => {
    node.classList.toggle('is-open', isOpen);
    node.classList.toggle('is-closed', !isOpen);
    node.querySelector('[data-status-text]').textContent = label;
  });

  const table = document.querySelector('[data-hours-table]');
  if (table) {
    table.querySelectorAll('.row').forEach((row) => {
      row.classList.toggle('today', Number(row.dataset.day) === day);
    });
  }
}

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  links.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function initFilter() {
  const chips = document.querySelectorAll('.chip');
  if (!chips.length) return;
  const sections = document.querySelectorAll('.menu-band');

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      sections.forEach((s) => {
        s.hidden = filter !== 'all' && s.dataset.cat !== filter;
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

renderStatus();
setInterval(renderStatus, 60000);
initNav();
initFilter();
