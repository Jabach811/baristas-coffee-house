/*
  Order pad — shared by index.html and the style-mock menu pages.

  Nothing is sent anywhere and there is no account. The phone keeps the
  running order so the customer walks up already knowing what to say and
  what they owe, and can turn the screen around for the cart to read.

  A page opts in by marking each orderable thing with:
    data-order data-icon="elote" data-name-es="Elote" data-name-en="Elote"
  and having a <b class="price">$5</b> somewhere inside it. Everything else
  — the Agregar button, the bar, the panel, the flavor sheet, the hand-off
  screen — is built here.

  What is specific to this cart (icon art, flavors, extras, wording) lives
  in pad-content.js. What is specific to a page's palette lives in the
  --pad-* variables in order-pad.css.
*/
(function () {
  var rows = [].slice.call(document.querySelectorAll('[data-order]'));
  if (!rows.length) return;

  var C = window.orderPad || {};
  var ICONS = C.icons || {};
  var BASE = C.iconBase || 'assets/pad-icons/';
  var FLAVORED = C.flavored || [];
  var FLAVORS = C.flavors || [];
  var EXTRAS = C.extras || [];

  /* orders[i] is one person's list. Newest line first, so the bar can show
     what was just added without re-sorting. */
  var orders = [[]];
  var active = 0;
  var sheet = null;               // { row, flavor, extras }
  var flyTimer;

  function lang() { return document.documentElement.dataset.lang === 'en' ? 'en' : 'es'; }
  function T() { return (C.text && (C.text[lang()] || C.text.es)) || {}; }
  function nameOf(row) {
    var d = row.dataset;
    return (lang() === 'en' && d.nameEn) || d.nameEs;
  }
  /* Short label for the size buttons — "Chico", not "Raspado chico". */
  function sizeOf(row) {
    var d = row.dataset;
    return (lang() === 'en' && d.sizeEn) || d.sizeEs || nameOf(row);
  }
  /* Rows sharing a data-order-group are sizes of the same thing. A row
     with no group is its own only size. */
  function sizesFor(row) {
    var g = row.dataset.orderGroup;
    if (!g) return [row];
    return rows.filter(function (r) { return r.dataset.orderGroup === g; });
  }
  function priceOf(row) {
    var p = row.querySelector('.price');
    return p ? parseFloat(p.textContent.replace(/[^0-9.]/g, '')) || 0 : 0;
  }
  function money(n) { return (C.currency || '$') + (n % 1 ? n.toFixed(2) : n); }
  function buzz(ms) { if (navigator.vibrate) { try { navigator.vibrate(ms || 8); } catch (e) {} } }
  function isFlavored(row) { return FLAVORED.indexOf(row.dataset.icon) > -1; }

  /* data-icon names a coin in icons{}; the flavor sheet names its file
     directly. Either way we end up with a file name, or null. */
  function fileFor(key) {
    if (ICONS[key]) return ICONS[key];
    for (var i = 0; i < FLAVORS.length; i++) if (FLAVORS[i].icon === key) return key;
    return null;
  }

  /* An icons{} value that is not a plain file name (an emoji, say) is
     rendered as text instead of an image — the stand-in until real art
     lands in assets/pad-icons/. */
  function isEmoji(v) { return !/^[A-Za-z0-9_-]+$/.test(v); }

  /* A coin, or the item's first letter if the art is missing. */
  function coin(iconKey, cls) {
    var file = fileFor(iconKey);
    if (!file) return '<span class="' + cls + ' pad__coin--text">' + (iconKey || '?').charAt(0).toUpperCase() + '</span>';
    if (isEmoji(file)) return '<span class="' + cls + ' pad__coin--text pad__coin--emoji">' + file + '</span>';
    return '<img class="' + cls + '" src="' + BASE + file + '.png" alt="" aria-hidden="true">';
  }
  /* Which coin represents a line that asked the choose-one question: the
     option picked (default — the flavor is the point) or the item itself
     (lineCoin:'item' — when every item has its own art). */
  function lineIcon(line) {
    if (C.lineCoin === 'item') return line.row.dataset.icon;
    return line.flavor ? line.flavor.icon : line.row.dataset.icon;
  }
  function flavorName(f) { return f[lang()] || f.es; }

  var PAD =
    '<div class="pad" id="pad" hidden>' +
      '<div class="pad__tabs" hidden></div>' +
      '<div class="pad__panel" id="pad-panel" hidden>' +
        '<div class="pad__head"><b class="pad__title"></b>' +
          '<button class="pad__clear" type="button"></button></div>' +
        '<ul class="pad__list"></ul>' +
        '<p class="pad__sum"><span></span><b></b></p>' +
        '<button class="pad__show" type="button"></button>' +
      '</div>' +
      '<button class="pad__bar" type="button" aria-expanded="false" aria-controls="pad-panel">' +
        '<span class="pad__icons"></span><b class="pad__total"></b>' +
      '</button>' +
    '</div>' +
    '<div class="pad-sheet" id="pad-sheet" hidden>' +
      '<div class="pad-sheet__scrim" data-close-sheet></div>' +
      '<div class="pad-sheet__card">' +
        '<div class="pad-sheet__head"><b class="pad-sheet__q"></b><span class="pad-sheet__what"></span></div>' +
        '<p class="pad-sheet__label" data-label="flavor"></p>' +
        '<div class="pad-sheet__flavors"></div>' +
        '<p class="pad-sheet__label" data-label="size"></p>' +
        '<div class="pad-sheet__sizes"></div>' +
        '<p class="pad-sheet__label" data-label="extras"></p>' +
        '<div class="pad-sheet__extras"></div>' +
        '<button class="pad-sheet__go" type="button"></button>' +
      '</div>' +
    '</div>' +
    '<div class="pad-hand" id="pad-hand" hidden>' +
      '<div class="pad-hand__top"><span class="pad-hand__for"></span><b class="pad-hand__no"></b></div>' +
      '<div class="pad-hand__list"></div>' +
      '<div class="pad-hand__sum"><span></span><b></b></div>' +
      '<button class="pad-hand__back" type="button"></button>' +
    '</div>';

  document.body.insertAdjacentHTML('beforeend', PAD);

  var pad    = document.getElementById('pad');
  var panel  = document.getElementById('pad-panel');
  var bar    = pad.querySelector('.pad__bar');
  var tabs   = pad.querySelector('.pad__tabs');
  var list   = pad.querySelector('.pad__list');
  var strip  = pad.querySelector('.pad__icons');
  var sheetEl = document.getElementById('pad-sheet');
  var handEl  = document.getElementById('pad-hand');
  var onBar  = {};   // ids on the bar last render, so only new ones pop

  /* ── The control the script drops into every orderable row ──
     Nothing ordered yet: one wide "Agregar". After that it is a stepper.
     Rows inside a .sizes band stay compact — just the round +. */
  rows.forEach(function (row, i) {
    var inline = !!row.closest('.sizes');
    var qty = document.createElement('div');
    qty.className = 'qty qty--empty' + (inline ? ' qty--inline' : '');
    qty.innerHTML =
      '<button type="button" class="qty__add" data-add>' +
        (inline ? '+' : '<span class="qty__addtext"></span>') +
      '</button>' +
      '<span class="qty__step">' +
        '<button type="button" data-step="-1">&#8722;</button>' +
        '<span class="qty__n">0</span>' +
        '<button type="button" data-step="1">+</button>' +
      '</span>';
    row.appendChild(qty);

    qty.addEventListener('click', function (e) {
      var add = e.target.closest('[data-add], [data-step="1"]');
      var less = e.target.closest('[data-step="-1"]');
      if (add) {
        if (isFlavored(row)) openSheet(row);
        else addLine(row, null, [], add);
      } else if (less) {
        removeOne(row);
      }
    });
  });

  /* ── Flavor shortcuts ──────────────────────────────────────────
     A picture of a flavor is the fastest way in: tapping one opens the
     sheet already holding that flavor, leaving only size and extras. It
     starts on the first size in the group — the small one. */
  [].forEach.call(document.querySelectorAll('[data-order-flavor]'), function (el) {
    var group = el.dataset.orderGroup;
    var target = rows.filter(function (r) { return r.dataset.orderGroup === group; })[0];
    var flavor = FLAVORS.filter(function (f) { return f.icon === el.dataset.orderFlavor; })[0];
    if (!target || !flavor) return;
    el.addEventListener('click', function () { openSheet(target, flavor); });
  });

  /* ── Order maths ───────────────────────────────────────────── */
  function lines() { return orders[active]; }
  function idOf(row, flavor, extras) {
    return rows.indexOf(row) + '|' + (flavor ? flavor.icon : '') + '|' + extras.join(',');
  }
  function totalOf(order) {
    return order.reduce(function (s, l) { return s + l.qty * priceOf(l.row); }, 0);
  }
  function qtyOfRow(row) {
    return lines().reduce(function (s, l) { return s + (l.row === row ? l.qty : 0); }, 0);
  }

  function addLine(row, flavor, extras, fromEl) {
    extras = extras || [];
    var id = idOf(row, flavor, extras);
    var L = lines();
    var at = -1;
    L.forEach(function (l, k) { if (l.id === id) at = k; });
    var line = at > -1 ? L.splice(at, 1)[0] : { id: id, row: row, flavor: flavor, extras: extras, qty: 0 };
    line.qty = Math.min(30, line.qty + 1);
    L.unshift(line);
    buzz(10);
    if (fromEl) fly(fromEl, lineIcon(line));
    render();
  }

  /* "−" takes one off the most recent line for that row, so a kid who
     added two flavors gets the last one back first. */
  function removeOne(row) {
    var L = lines();
    for (var k = 0; k < L.length; k++) {
      if (L[k].row === row) {
        buzz(6);
        if (L[k].qty > 1) L[k].qty--; else L.splice(k, 1);
        break;
      }
    }
    render();
  }

  /* ── The coin that flies from the button down into the bar ── */
  function fly(fromEl, iconKey) {
    var file = fileFor(iconKey);
    if (!file || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var b = fromEl.getBoundingClientRect();
    var target = bar.getBoundingClientRect();
    var img;
    if (isEmoji(file)) {
      img = document.createElement('span');
      img.className = 'pad-fly pad-fly--emoji';
      img.textContent = file;
    } else {
      img = document.createElement('img');
      img.className = 'pad-fly';
      img.src = BASE + file + '.png';
      img.alt = '';
    }
    img.style.left = (b.left + b.width / 2 - 19) + 'px';
    img.style.top = (b.top + b.height / 2 - 19) + 'px';
    document.body.appendChild(img);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        img.style.transform =
          'translate(' + (target.left + 30 - (b.left + b.width / 2)) + 'px,' +
          (target.top + target.height / 2 - (b.top + b.height / 2)) + 'px) scale(.8)';
        img.style.opacity = '0';
      });
    });
    clearTimeout(flyTimer);
    flyTimer = setTimeout(function () { img.remove(); }, 560);
  }

  /* ── Flavor sheet ──────────────────────────────────────────── */
  function openSheet(row, flavor) {
    buzz();
    sheet = { row: row, flavor: flavor || FLAVORS[0], extras: [] };
    panel.hidden = true;
    bar.setAttribute('aria-expanded', 'false');
    renderSheet();
    sheetEl.hidden = false;
  }
  function closeSheet() { sheet = null; sheetEl.hidden = true; }

  function renderSheet() {
    if (!sheet) return;
    var L = T();
    sheetEl.querySelector('.pad-sheet__q').textContent = nameOf(sheet.row);
    sheetEl.querySelector('.pad-sheet__what').textContent = money(priceOf(sheet.row));
    sheetEl.querySelector('[data-label="flavor"]').textContent = L.flavor;
    sheetEl.querySelector('[data-label="size"]').textContent = L.size;
    sheetEl.querySelector('[data-label="extras"]').textContent = L.extras;
    sheetEl.querySelector('.pad-sheet__go').textContent = L.addToOrder;

    sheetEl.querySelector('.pad-sheet__flavors').innerHTML = FLAVORS.map(function (f, i) {
      return '<button type="button" class="pad-sheet__flavor' +
        (sheet.flavor === f ? ' is-on' : '') + '" data-flavor="' + i + '">' +
        coin(f.icon, 'pad-sheet__coin') +
        '<span>' + flavorName(f) + '</span></button>';
    }).join('');

    /* Only worth asking when there is more than one size to ask about. */
    var sizes = sizesFor(sheet.row);
    var many = sizes.length > 1;
    sheetEl.querySelector('[data-label="size"]').hidden = !many;
    sheetEl.querySelector('.pad-sheet__sizes').hidden = !many;
    sheetEl.querySelector('.pad-sheet__sizes').innerHTML = !many ? '' : sizes.map(function (r) {
      var on = r === sheet.row;
      return '<button type="button" class="pad-sheet__size' + (on ? ' is-on' : '') +
        '" data-size="' + rows.indexOf(r) + '" aria-pressed="' + on + '">' +
        sizeOf(r) + '<b>' + money(priceOf(r)) + '</b></button>';
    }).join('');

    sheetEl.querySelector('.pad-sheet__extras').innerHTML = EXTRAS.map(function (x, i) {
      var on = sheet.extras.indexOf(x) > -1;
      return '<button type="button" class="pad-sheet__extra' + (on ? ' is-on' : '') +
        '" data-extra="' + i + '" aria-pressed="' + on + '">' + (x[lang()] || x.es) + '</button>';
    }).join('');
  }

  sheetEl.addEventListener('click', function (e) {
    if (e.target.closest('[data-close-sheet]')) return closeSheet();
    var f = e.target.closest('[data-flavor]');
    if (f) { buzz(); sheet.flavor = FLAVORS[+f.dataset.flavor]; return renderSheet(); }
    var z = e.target.closest('[data-size]');
    if (z) { buzz(); sheet.row = rows[+z.dataset.size]; return renderSheet(); }
    var x = e.target.closest('[data-extra]');
    if (x) {
      buzz();
      var item = EXTRAS[+x.dataset.extra];
      var at = sheet.extras.indexOf(item);
      if (at > -1) sheet.extras.splice(at, 1); else sheet.extras.push(item);
      return renderSheet();
    }
    var go = e.target.closest('.pad-sheet__go');
    if (go) {
      var s = sheet;
      closeSheet();
      addLine(s.row, s.flavor, s.extras.map(function (i) { return i; }), go);
    }
  });

  /* ── Hand-off screen ───────────────────────────────────────── */
  function subOf(line) {
    var bits = [];
    if (line.flavor) bits.push(flavorName(line.flavor));
    if (line.extras.length) bits.push(line.extras.map(function (x) {
      return (x[lang()] || x.es).toLowerCase();
    }).join(', '));
    return bits.join(' · ');
  }

  function showHand() {
    var L = T();
    buzz(14);
    handEl.querySelector('.pad-hand__for').textContent = L.forCart;
    handEl.querySelector('.pad-hand__no').textContent = '#' + (14 + active);
    handEl.querySelector('.pad-hand__list').innerHTML = lines().map(function (l) {
      var sub = subOf(l);
      return '<div class="pad-hand__row"><b>' + l.qty + '</b><span>' +
        '<i>' + nameOf(l.row) + '</i>' + (sub ? '<em>' + sub + '</em>' : '') +
        '</span></div>';
    }).join('');
    handEl.querySelector('.pad-hand__sum span').textContent = L.total;
    handEl.querySelector('.pad-hand__sum b').textContent = money(totalOf(lines()));
    handEl.querySelector('.pad-hand__back').textContent = L.back;
    handEl.hidden = false;
    document.body.classList.add('pad-locked');
  }
  function hideHand() { handEl.hidden = true; document.body.classList.remove('pad-locked'); }
  handEl.querySelector('.pad-hand__back').addEventListener('click', hideHand);

  /* ── Render ────────────────────────────────────────────────── */
  function render() {
    var L = T(), order = lines(), total = totalOf(order), n = 0;

    rows.forEach(function (row) {
      var qty = row.querySelector('.qty');
      var c = qtyOfRow(row);
      n += c;
      qty.querySelector('.qty__n').textContent = c;
      qty.classList.toggle('qty--empty', c === 0);
      var addText = qty.querySelector('.qty__addtext');
      if (addText) addText.textContent = L.add;
      qty.querySelector('[data-add]').setAttribute('aria-label', L.add + ' ' + nameOf(row));
      qty.querySelector('[data-step="1"]').setAttribute('aria-label', L.add + ' ' + nameOf(row));
      qty.querySelector('[data-step="-1"]').setAttribute('aria-label', L.less + ' ' + nameOf(row));
    });

    /* The pad stays up while a second order is open, even if this one is
       empty — otherwise the tabs vanish under the kid mid-order. */
    var show = order.length > 0 || orders.length > 1;
    pad.hidden = !show;
    document.body.classList.toggle('has-pad', show);
    if (!order.length) {
      panel.hidden = true;
      bar.setAttribute('aria-expanded', 'false');
      if (!handEl.hidden) hideHand();
    }

    /* The strip rides with the pad. On the first order it is only the way
       to start a second one, spelled out; after that the orders themselves
       become the tabs and the button shrinks back to a plus. */
    var split = orders.length > 1;
    tabs.hidden = !show;
    tabs.innerHTML = (!split ? '' : orders.map(function (o, i) {
      return '<button type="button" class="pad__tab' + (i === active ? ' is-on' : '') +
        '" data-order-tab="' + i + '">' + L.order + ' ' + (i + 1) + ' · ' + money(totalOf(o)) + '</button>';
    }).join('')) +
      '<button type="button" class="pad__tab pad__tab--new" data-new-order aria-label="' + L.newOrder + '">' +
      (split ? '+' : '+ ' + L.newOrder) + '</button>';

    /* Newest first; the first coin gets a ring so you can see what landed. */
    strip.innerHTML = '';
    var seen = {};
    order.slice(0, 3).forEach(function (l, i) {
      var chip = document.createElement('span');
      chip.className = 'pad__chip' + (i === 0 ? ' pad__chip--new-item' : '') +
        (onBar[l.id] ? '' : ' pad__chip--new');
      chip.innerHTML = coin(lineIcon(l), 'pad__coin') + (l.qty > 1 ? '<b>' + l.qty + '</b>' : '');
      strip.appendChild(chip);
      seen[l.id] = true;
    });
    if (order.length > 3) {
      var more = document.createElement('span');
      more.className = 'pad__chip pad__chip--more';
      more.textContent = '+' + (order.length - 3);
      strip.appendChild(more);
    }
    onBar = seen;

    bar.setAttribute('aria-label',
      n + ' ' + (n === 1 ? L.one : L.many) + ' · ' + money(total) + ' — ' + L.open);
    pad.querySelector('.pad__total').textContent = money(total);

    /* Panel */
    pad.querySelector('.pad__title').textContent =
      orders.length > 1 ? L.order + ' ' + (active + 1) : L.myOrder;
    pad.querySelector('.pad__clear').textContent = L.clear;
    pad.querySelector('.pad__show').textContent = L.show;
    pad.querySelector('.pad__sum span').textContent = L.total;
    pad.querySelector('.pad__sum b').textContent = money(total);

    list.innerHTML = order.map(function (l, i) {
      var sub = subOf(l);
      return '<li>' + coin(lineIcon(l), 'pad__coin') +
        '<span class="pad__name">' + l.qty + '× ' + nameOf(l.row) +
          (sub ? '<em>' + sub + '</em>' : '') + '</span>' +
        '<b class="pad__line">' + money(l.qty * priceOf(l.row)) + '</b>' +
        '<button class="pad__drop" type="button" data-drop="' + i + '" ' +
          'aria-label="' + L.drop + ' ' + nameOf(l.row) + '">×</button></li>';
    }).join('');
  }

  /* ── Wiring ────────────────────────────────────────────────── */
  bar.addEventListener('click', function () {
    if (!lines().length) return;
    var open = panel.hidden;
    buzz();
    panel.hidden = !open;
    bar.setAttribute('aria-expanded', String(open));
  });

  /* A tap anywhere off the pad closes the open panel. */
  document.addEventListener('click', function (e) {
    if (panel.hidden || e.target.closest('#pad')) return;
    panel.hidden = true;
    bar.setAttribute('aria-expanded', 'false');
  });

  tabs.addEventListener('click', function (e) {
    var t = e.target.closest('[data-order-tab]');
    if (t) { buzz(); active = +t.dataset.orderTab; panel.hidden = true; return render(); }
    if (e.target.closest('[data-new-order]')) {
      buzz();
      orders.push([]);
      active = orders.length - 1;
      panel.hidden = true;
      render();
    }
  });

  list.addEventListener('click', function (e) {
    var b = e.target.closest('[data-drop]');
    if (!b) return;
    /* render() replaces this button before the document's close-on-
       outside-tap listener runs, so that listener would no longer see
       the tap as inside the pad and would close the panel. */
    e.stopPropagation();
    buzz(6);
    lines().splice(+b.dataset.drop, 1);
    render();
  });

  pad.querySelector('.pad__clear').addEventListener('click', function () {
    buzz(14);
    orders[active] = [];
    panel.hidden = true;
    render();
  });

  pad.querySelector('.pad__show').addEventListener('click', showHand);

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!sheetEl.hidden) closeSheet();
    else if (!handEl.hidden) hideHand();
    else if (!panel.hidden) { panel.hidden = true; bar.setAttribute('aria-expanded', 'false'); }
  });

  /* The pages swap language by setting data-lang on <html>; watching the
     attribute keeps this working whatever order the scripts load in. */
  new MutationObserver(function () { render(); renderSheet(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });
  addEventListener('resize', render);
  render();
})();
