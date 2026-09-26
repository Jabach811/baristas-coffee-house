// Live open/closed status and today's hours row (Pacific time).
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
    timeZone: 'America/Los_Angeles', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, time: (Number(get('hour')) % 24) + Number(get('minute')) / 60 };
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
  const { day, time } = localNow();
  const today = HOURS[day];
  const isOpen = !!today && time >= today.open && time < today.close;
  let label;
  if (isOpen) label = `Open now · until ${clock(today.close)}`;
  else if (today && time < today.open) label = `Closed · opens at ${clock(today.open)}`;
  else {
    const next = nextOpening(day);
    label = `Closed · opens ${next.tomorrow ? 'tomorrow' : DAYS[next.day]} at ${clock(next.open)}`;
  }
  nodes.forEach((node) => {
    node.classList.toggle('is-open', isOpen);
    node.classList.toggle('is-closed', !isOpen);
    const text = node.querySelector('[data-status-text]');
    if (text) text.textContent = label;
  });
  document.querySelectorAll('[data-hours-table] [data-day]').forEach((row) => {
    row.classList.toggle('today', Number(row.dataset.day) === day);
  });
}

// Menu page: category filter chips.
function initFilter() {
  const chips = document.querySelectorAll('.chip');
  if (!chips.length) return;
  const sections = [...document.querySelectorAll('.menu-band')];
  const showAll = document.querySelector('.show-all');
  const hero = document.querySelector('.menu-hero');

  const apply = (filter) => {
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === filter)));
    const visible = sections.filter((s) => filter === 'all' || s.dataset.cat === filter);
    sections.forEach((s) => { s.hidden = !visible.includes(s); });
    visible.forEach((s, i) => s.classList.toggle('dark', i % 2 === 0));
    if (showAll) showAll.hidden = filter === 'all';
    if (hero) window.scrollTo({ top: hero.offsetTop + hero.offsetHeight - 90, behavior: 'smooth' });
  };

  chips.forEach((chip) => chip.addEventListener('click', () => {
    const on = chip.getAttribute('aria-pressed') === 'true';
    apply(on && chip.dataset.filter !== 'all' ? 'all' : chip.dataset.filter);
  }));
  if (showAll) showAll.querySelector('button').addEventListener('click', () => apply('all'));
}

renderStatus();
setInterval(renderStatus, 60000);
initFilter();
