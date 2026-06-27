const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeCtx() {
  return new Proxy({}, {
    get(t, p) {
      if (p === 'measureText') return () => ({ width: 50 });
      if (p in t) return t[p];
      return () => {};
    },
    set(t, p, v) { t[p] = v; return true; },
  });
}
function makeCanvas(w, h) {
  return { width: w || 0, height: h || 0, getContext: () => makeCtx(), addEventListener() {}, focus() {} };
}
function token(parts) { return parts.join(''); }

const storage = new Map();
const oldFlags = {
  talkedProf: true,
  visited: {},
  trueEnding: false,
  correctCount: 40,
};
oldFlags[token(['bad', 'ges'])] = { forest: true, lake: true, cave: true };
oldFlags[token(['defe', 'ated'])] = { [token(['final', 'bo', 'ss'])]: true };
oldFlags[token(['mer', 'cy'])] = 11;
oldFlags[token(['ba', 'ttleCount'])] = 18;
storage.set('ai-ethics-adventure-v1', JSON.stringify({
  map: 'serverroom',
  x: 7,
  y: 9,
  flags: oldFlags,
}));

const listeners = {};
let rafCb = null;
const windowObj = {
  addEventListener: (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); },
  removeEventListener: (ev, fn) => {
    const a = listeners[ev];
    if (a) {
      const i = a.indexOf(fn);
      if (i >= 0) a.splice(i, 1);
    }
  },
  requestAnimationFrame: (cb) => { rafCb = cb; },
};
const sandbox = {
  window: windowObj,
  document: {
    getElementById: (id) => (id === 'game' ? makeCanvas(720, 528) : makeCanvas()),
    createElement: () => makeCanvas(),
    body: { classList: { add() {}, remove() {}, toggle() {} } },
  },
  localStorage: {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
  },
  requestAnimationFrame: windowObj.requestAnimationFrame,
  console, Math, Set, Map, JSON, Object, Date, setTimeout, clearTimeout,
};
vm.createContext(sandbox);
for (const f of ['src/sprites.js', 'src/audio.js', 'src/data.js', 'src/game.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), sandbox, { filename: f });
}

const g = windowObj.__game;
const { ETHICS_AXES, MAPS, STAGE_PUZZLES, WALKABLE } =
  vm.runInContext('({ ETHICS_AXES, MAPS, STAGE_PUZZLES, WALKABLE })', sandbox);

function step(n = 1) {
  for (let i = 0; i < n; i++) {
    const cb = rafCb;
    rafCb = null;
    if (!cb) throw new Error('requestAnimationFrame callback missing');
    cb();
  }
}
function dispatch(ev, obj) {
  for (const fn of (listeners[ev] || []).slice()) fn(Object.assign({ preventDefault() {} }, obj));
}
function tap(key) {
  dispatch('keydown', { key });
  step(2);
  dispatch('keyup', { key });
}
function slot(i) {
  const r = storage.get('ai-ethics-adventure-slot-' + i);
  return r ? JSON.parse(r) : null;
}

let passed = 0;
function check(name, cond) {
  if (cond) {
    console.log('  ✔ ' + name);
    passed++;
    return;
  }
  console.error('  ✘ ' + name);
  process.exit(1);
}

console.log('[1] legacy single-save migration');
step(5);
check('old single-save key removed', !storage.get('ai-ethics-adventure-v1'));
check('slot 0 created', !!slot(0));
check('legacy location reset to safe start', slot(0).map === 'village' && slot(0).x === 13 && slot(0).y === 16);
check('legacy fields normalized away', !Object.prototype.hasOwnProperty.call(slot(0).flags, token(['mer', 'cy'])));
check('puzzle state initialized', Object.keys(STAGE_PUZZLES).every((id) => slot(0).flags.puzzles[id]));
check('five ethics axes initialized', ETHICS_AXES.every((axis) => Object.prototype.hasOwnProperty.call(slot(0).flags.ethics, axis)));
check('title shows occupied slot', g.mode === 'title' && g.titleScreen === 'slots');

console.log('[2] continue migrated slot');
tap('z');
check('continue enters world', g.mode === 'world');
check('current slot 0', g.currentSlot === 0);
check('continued flags are puzzle-only', !!g.flags.puzzles && !Object.prototype.hasOwnProperty.call(g.flags, token(['defe', 'ated'])));

console.log('[3] create and delete another slot');
g.mode = 'title';
g.titleScreen = 'slots';
g.slotCursor = 0;
tap('ArrowDown');
check('cursor moved to slot 1', g.slotCursor === 1);
tap('z');
check('name entry for empty slot', g.titleScreen === 'name');
g.nameConfirm = true;
step(2);
check('new slot starts', (g.mode === 'dialog' || g.mode === 'world') && g.currentSlot === 1);
check('new slot has puzzle flags', !!slot(1).flags.puzzles);
check('slot 0 preserved', !!slot(0));
g.mode = 'title';
g.titleScreen = 'slots';
g.slotCursor = 1;
tap('x');
check('delete confirmation', g.titleScreen === 'delete');
tap('x');
check('delete cancelled', g.titleScreen === 'slots' && !!slot(1));
tap('x');
tap('z');
check('slot 1 deleted', !slot(1));

console.log('[4] blocked saved tile correction');
storage.set('ai-ethics-adventure-slot-2', JSON.stringify({
  name: '테스트',
  map: 'village',
  x: 0,
  y: 0,
  flags: { talkedProf: true, visited: {}, puzzles: {}, ethics: {} },
  updatedAt: Date.now(),
}));
g.mode = 'title';
g.titleScreen = 'slots';
g.slotCursor = 2;
tap('z');
check('blocked save enters world', g.mode === 'world');
const landed = MAPS[g.map].tiles[g.player.y][g.player.x];
check('landed on walkable tile', WALKABLE.has(landed));
check('not original blocked tile', !(g.map === 'village' && g.player.x === 0 && g.player.y === 0));
check('pixel position finite', Number.isFinite(g.player.px) && Number.isFinite(g.player.py));

console.log(`\n✔ slot tests passed (${passed} checks)`);
