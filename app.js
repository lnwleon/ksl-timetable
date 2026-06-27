/* =============================================
   KSL Study Timetable — app.js
   Clean, safe, mobile-ready
   ============================================= */

'use strict';

/* ---- DATA ---- */

var COLORS = [
  { cls: 'c-civil', bg: '#B5D4F4', tc: '#042C53' },
  { cls: 'c-crim',  bg: '#FAC775', tc: '#412402' },
  { cls: 'c-comm',  bg: '#C0DD97', tc: '#173404' },
  { cls: 'c-conv',  bg: '#F4C0D1', tc: '#4B1528' },
  { cls: 'c-trial', bg: '#CECBF6', tc: '#26215C' },
  { cls: 'c-lpm',   bg: '#9FE1CB', tc: '#04342C' },
  { cls: 'c-lwd',   bg: '#F5C4B3', tc: '#4A1B0C' },
  { cls: 'c-pe',    bg: '#D3D1C7', tc: '#2C2C2A' },
  { cls: 'c-prob',  bg: '#f7b84e', tc: '#3a2000' },
  { cls: 'c-free',  bg: '#4a8c00', tc: '#ffffff' }
];

var COL_NAMES = [
  'Early Session (6:15–7am)',
  'Morning Class (9:15–10:15am)',
  'Afternoon (12:15–2:15pm)',
  'Evening Block (10pm–12am)',
  'Night Drafting'
];

var DEFAULT_TIMETABLE = [
  {
    day: 'Mon', di: 1,
    cols:   ['c-pe',   'c-civil', 'c-prob',  'c-lwd',   'c-civil'],
    labels: ['PE',     'Civil Litigation', 'Probate & Admin', 'LWD', 'Civil Litigation']
  },
  {
    day: 'Tue', di: 2,
    cols:   ['c-lwd',  'c-crim',  'c-trial', 'c-civil', 'c-civil'],
    labels: ['LWD',    'Criminal Litigation', 'Trial', 'Civil Litigation', 'Civil Litigation']
  },
  {
    day: 'Wed', di: 3,
    cols:   ['c-lpm',  'c-comm',  'c-pe',    'c-conv',  'c-conv'],
    labels: ['LPM',    'Commercial Trans.', 'PE', 'Conveyancing', 'Conveyancing']
  },
  {
    day: 'Thu', di: 4,
    cols:   ['c-lwd',  'c-prob',  'c-lwd',   'c-crim',  'c-lpm'],
    labels: ['LWD',    'Probate & Admin', 'LWD', 'Criminal Litigation', 'LPM']
  },
  {
    day: 'Fri', di: 5,
    cols:   ['c-lpm',  'c-pe',    'c-comm',  'c-lpm',   'c-lpm'],
    labels: ['LPM',    'PE', 'Commercial Trans.', 'LPM', 'LPM']
  },
  {
    day: 'Sat', di: 6,
    cols:   ['c-free', 'c-free',  'c-free',  'c-free',  'c-free'],
    labels: ['FREE',   'FREE DAY','FREE',    'FREE',    'REST']
  },
  {
    day: 'Sun', di: 0,
    cols:   ['c-empty','c-lpm',   'c-trial', 'c-comm',  'c-comm'],
    labels: ['—',      'LPM ★',   'Trial', 'Commercial Trans.', 'Commercial Trans.']
  }
];

var UNITS = [
  { name: 'Civil Litigation',    key: 'civil', bg: '#B5D4F4' },
  { name: 'Criminal Litigation', key: 'crim',  bg: '#FAC775' },
  { name: 'Commercial Trans.',   key: 'comm',  bg: '#C0DD97' },
  { name: 'Conveyancing',        key: 'conv',  bg: '#F4C0D1' },
  { name: 'Trial',               key: 'trial', bg: '#CECBF6' },
  { name: 'LPM',                 key: 'lpm',   bg: '#9FE1CB' },
  { name: 'LWD',                 key: 'lwd',   bg: '#F5C4B3' },
  { name: 'PE',                  key: 'pe',    bg: '#D3D1C7' },
  { name: 'Probate & Admin',     key: 'prob',  bg: '#f7b84e' }
];

var QUOTES = [
  'The secret of getting ahead is getting started.',
  'Success is the sum of small efforts repeated day in and day out.',
  'Discipline is choosing what you want most over what you want now.',
  'Law is reason free from passion. — Aristotle',
  'Your future is created by what you do today, not tomorrow.',
  'Champions keep going when they have nothing left.',
  'Every expert was once a beginner. Keep going.',
  'Don\'t count the days — make the days count.',
  'The harder you work, the luckier you get.',
  'Kenya School of Law — you\'ve got this. Study hard, pass harder.',
  'Push yourself, because no one else is going to do it for you.',
  'It\'s not about being the best. It\'s about being better than yesterday.'
];

var MOTIVATIONS = [
  'You got this!', 'Stay focused!', 'Keep pushing!',
  'One day at a time.', 'Make it count!', 'Discipline = success.',
  'Eyes on the prize!', 'Believe and achieve!'
];

var DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var SESSION_NAMES = ['Early','Morning','Afternoon','Evening','Night'];

/* ---- SAFE STORAGE ---- */

function storageGet(key, fallback) {
  try {
    var val = localStorage.getItem(key);
    if (val === null) return fallback;
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

function storageRemove(key) {
  try { localStorage.removeItem(key); } catch (e) {}
}

/* ---- STATE ---- */

var timetable = storageGet('ksl_tt', null) || JSON.parse(JSON.stringify(DEFAULT_TIMETABLE));
var progress  = storageGet('ksl_prog', {});
var editMode  = false;
var editTarget = null;    /* { r, c } */
var selectedCls = null;
var toastTimer = null;

/* ---- HELPERS ---- */

function pad2(n) {
  return n < 10 ? '0' + n : '' + n;
}

function colorByCls(cls) {
  for (var i = 0; i < COLORS.length; i++) {
    if (COLORS[i].cls === cls) return COLORS[i];
  }
  return null;
}

function getEl(id) {
  return document.getElementById(id);
}

/* ---- COUNTDOWN TIMERS ---- */

function startCountdown(targetISO, timerId, barId, startISO) {
  var target = new Date(targetISO).getTime();
  var start  = new Date(startISO).getTime();
  var total  = target - start;
  var timerEl = getEl(timerId);
  var barEl   = getEl(barId);

  function tick() {
    var now  = Date.now();
    var diff = target - now;
    var pct  = total > 0 ? Math.min(100, Math.max(0, ((total - diff) / total) * 100)) : 100;

    if (barEl) barEl.style.width = pct.toFixed(1) + '%';

    if (!timerEl) return;

    if (diff <= 0) {
      timerEl.innerHTML = '<span style="font-size:14px;font-weight:700;color:#b03020">Exam Day!</span>';
      return;
    }

    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    var cls = timerId === 'oralTimer' ? 'oral' : 'main';

    timerEl.innerHTML =
      '<div class="cd-unit">' +
        '<span class="cd-num ' + cls + '">' + d + '</span>' +
        '<span class="cd-sub">days</span>' +
      '</div>' +
      '<span class="cd-sep">:</span>' +
      '<div class="cd-unit">' +
        '<span class="cd-num ' + cls + '">' + pad2(h) + '</span>' +
        '<span class="cd-sub">hrs</span>' +
      '</div>' +
      '<span class="cd-sep">:</span>' +
      '<div class="cd-unit">' +
        '<span class="cd-num ' + cls + '">' + pad2(m) + '</span>' +
        '<span class="cd-sub">min</span>' +
      '</div>' +
      '<span class="cd-sep">:</span>' +
      '<div class="cd-unit">' +
        '<span class="cd-num ' + cls + '">' + pad2(s) + '</span>' +
        '<span class="cd-sub">sec</span>' +
      '</div>';
  }

  tick();
  setInterval(tick, 1000);
}

/* ---- TODAY BAR ---- */

function buildTodayBar() {
  var di   = new Date().getDay();
  var nameEl = getEl('todayName');
  var motEl  = getEl('todayMot');
  var pillEl = getEl('todayPills');

  if (nameEl) nameEl.textContent = DAY_NAMES[di];
  if (motEl)  motEl.textContent  = MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length];
  if (!pillEl) return;

  var row = null;
  for (var i = 0; i < timetable.length; i++) {
    if (timetable[i].di === di) { row = timetable[i]; break; }
  }

  if (!row) {
    pillEl.innerHTML = '<span style="font-size:12px;color:#888">No schedule found.</span>';
    return;
  }

  var html = '';
  for (var c = 0; c < 5; c++) {
    var lbl = row.labels[c];
    if (!lbl || lbl === '—') continue;
    var col = colorByCls(row.cols[c]);
    var bg = col ? col.bg : '#eee';
    var tc = col ? col.tc : '#333';
    html += '<span class="s-pill" style="background:' + bg + ';color:' + tc + '">' +
              SESSION_NAMES[c] + ': ' + lbl +
            '</span>';
  }

  if (!html) {
    html = '<span style="font-size:12px;color:#4a8c00;font-weight:600">Free day — rest and recharge!</span>';
  }

  pillEl.innerHTML = html;
}

/* ---- TIMETABLE ---- */

function buildTable() {
  var tbody   = getEl('ttBody');
  var todayDi = new Date().getDay();
  if (!tbody) return;

  var html = '';

  for (var r = 0; r < timetable.length; r++) {
    var row     = timetable[r];
    var isToday = row.di === todayDi;

    html += '<tr' + (isToday ? ' class="today-row"' : '') + '>';
    html += '<td class="day-cell">' + row.day + '</td>';

    for (var c = 0; c < 5; c++) {
      var cls  = row.cols[c]   || 'c-empty';
      var lbl  = row.labels[c] || '—';
      var isEmpty = cls === 'c-empty';
      /* data attrs used by click handler */
      html += '<td class="' + cls + '" data-r="' + r + '" data-c="' + c + '">' +
                lbl +
                '<span class="edit-dot"></span>' +
              '</td>';
    }

    html += '</tr>';
  }

  tbody.innerHTML = html;

  /* Single delegated click listener — efficient, no rebinding */
  tbody.onclick = function(e) {
    if (!editMode) return;
    var td = e.target.closest('td');
    if (!td) return;
    var r = td.getAttribute('data-r');
    var c = td.getAttribute('data-c');
    if (r === null || c === null) return;
    if (td.classList.contains('day-cell') || td.classList.contains('c-empty')) return;
    openModal(parseInt(r, 10), parseInt(c, 10));
  };
}

/* ---- PROGRESS ---- */

function buildProgress() {
  var list = getEl('progList');
  if (!list) return;

  var html = '';
  for (var i = 0; i < UNITS.length; i++) {
    var u   = UNITS[i];
    var pct = progress[u.key] || 0;
    html +=
      '<div class="prog-row">' +
        '<div class="prog-name">' + u.name + '</div>' +
        '<div class="prog-bar-wrap" data-key="' + u.key + '" tabindex="0" ' +
             'role="button" aria-label="' + u.name + ' progress ' + pct + '%">' +
          '<div class="prog-bar" id="pb-' + u.key + '" ' +
               'style="width:' + pct + '%;background:' + u.bg + '"></div>' +
        '</div>' +
        '<div class="prog-pct" id="pp-' + u.key + '">' + pct + '%</div>' +
      '</div>';
  }

  list.innerHTML = html;

  list.onclick = function(e) {
    var wrap = e.target.closest('[data-key]');
    if (!wrap) return;
    cycleProgress(wrap.getAttribute('data-key'));
  };

  list.onkeydown = function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      var wrap = e.target.closest('[data-key]');
      if (wrap) { e.preventDefault(); cycleProgress(wrap.getAttribute('data-key')); }
    }
  };
}

function cycleProgress(key) {
  var steps = [0, 25, 50, 75, 100];
  var cur   = progress[key] || 0;
  var idx   = steps.indexOf(cur);
  var next  = steps[(idx + 1) % steps.length];

  progress[key] = next;
  storageSet('ksl_prog', progress);

  var bar = getEl('pb-' + key);
  var pct = getEl('pp-' + key);
  if (bar) bar.style.width = next + '%';
  if (pct) pct.textContent = next + '%';

  showToast(next === 100 ? '🎉 Unit complete!' : 'Progress: ' + next + '%');
}

/* ---- EDIT MODE ---- */

function toggleEdit() {
  editMode = !editMode;
  var btn   = getEl('editBtn');
  var save  = getEl('saveBtn');
  var reset = getEl('resetBtn');
  var hint  = getEl('editHint');

  if (btn)   { btn.textContent = editMode ? '✏️ Editing' : '✏️ Edit'; btn.className = 'btn-nav' + (editMode ? ' active' : ''); }
  if (save)  save.hidden  = !editMode;
  if (reset) reset.hidden = !editMode;
  if (hint)  hint.hidden  = !editMode;

  document.body.classList.toggle('edit-mode', editMode);

  if (!editMode) closeModal();
  buildTable();
}

function saveAll() {
  var ok = storageSet('ksl_tt', timetable);
  showToast(ok ? '✅ Timetable saved!' : '⚠️ Could not save — storage may be full');
  toggleEdit();
  buildTodayBar();
}

function resetAll() {
  if (!confirm('Reset to the original timetable? All your edits will be lost.')) return;
  timetable = JSON.parse(JSON.stringify(DEFAULT_TIMETABLE));
  storageRemove('ksl_tt');
  buildTable();
  buildTodayBar();
  showToast('↩ Reset to original');
  if (editMode) toggleEdit();
}

/* ---- MODAL ---- */

function openModal(r, c) {
  var row = timetable[r];
  editTarget  = { r: r, c: c };
  selectedCls = row.cols[c];

  var ctx   = getEl('modalCtx');
  var input = getEl('modalInput');
  var overlay = getEl('modalOverlay');

  if (ctx)   ctx.textContent  = row.day + ' — ' + COL_NAMES[c];
  if (input) input.value      = row.labels[c] || '';

  buildColorGrid();

  if (overlay) overlay.hidden = false;

  /* Delay focus so keyboard animation doesn't fight the modal opening */
  if (input) setTimeout(function() { input.focus(); }, 150);
}

function closeModal() {
  var overlay = getEl('modalOverlay');
  if (overlay) overlay.hidden = true;
  editTarget = null;
}

function buildColorGrid() {
  var grid = getEl('colorGrid');
  if (!grid) return;

  var html = '';
  for (var i = 0; i < COLORS.length; i++) {
    var co = COLORS[i];
    html += '<div class="color-opt' + (co.cls === selectedCls ? ' sel' : '') + '" ' +
              'style="background:' + co.bg + '" ' +
              'data-cls="' + co.cls + '" ' +
              'title="' + co.cls.replace('c-', '') + '" ' +
              'tabindex="0" role="button"></div>';
  }

  grid.innerHTML = html;

  grid.onclick = function(e) {
    var opt = e.target.closest('[data-cls]');
    if (!opt) return;
    selectedCls = opt.getAttribute('data-cls');
    buildColorGrid();
  };
}

function applyEdit() {
  if (!editTarget) return;
  var input = getEl('modalInput');
  var lbl   = input ? input.value.trim() : '';

  if (!lbl) { showToast('Please enter a subject name'); return; }

  timetable[editTarget.r].labels[editTarget.c] = lbl;
  timetable[editTarget.r].cols[editTarget.c]   = selectedCls;

  buildTable();
  closeModal();
  showToast('Updated — tap 💾 Save to keep');
}

function clearCell() {
  if (!editTarget) return;
  timetable[editTarget.r].labels[editTarget.c] = '—';
  timetable[editTarget.r].cols[editTarget.c]   = 'c-empty';
  buildTable();
  closeModal();
  showToast('Cleared — tap 💾 Save to keep');
}

/* ---- TOAST ---- */

function showToast(msg) {
  var t = getEl('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { t.className = 'toast'; }, 2500);
}

/* ---- KEYBOARD & OVERLAY EVENTS ---- */

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter') {
    var overlay = getEl('modalOverlay');
    if (overlay && !overlay.hidden && editTarget) applyEdit();
  }
});

/* Close modal by tapping the dark backdrop */
document.addEventListener('click', function(e) {
  var overlay = getEl('modalOverlay');
  if (overlay && !overlay.hidden && e.target === overlay) closeModal();
});

/* Expose functions called by inline HTML onclick */
window.toggleEdit = toggleEdit;
window.saveAll    = saveAll;
window.resetAll   = resetAll;
window.closeModal = closeModal;
window.applyEdit  = applyEdit;
window.clearCell  = clearCell;

/* ---- INIT ---- */

(function init() {
  /* Countdowns — use EAT timezone offset (+03:00) */
  startCountdown(
    '2026-07-20T08:00:00+03:00',
    'oralTimer', 'oralBar',
    '2026-01-01T00:00:00+03:00'
  );
  startCountdown(
    '2026-11-01T08:00:00+03:00',
    'mainTimer', 'mainBar',
    '2026-01-01T00:00:00+03:00'
  );

  buildTodayBar();
  buildTable();
  buildProgress();

  /* Daily quote — changes by day */
  var q = getEl('dailyQuote');
  if (q) q.textContent = QUOTES[new Date().getDate() % QUOTES.length];
})();
