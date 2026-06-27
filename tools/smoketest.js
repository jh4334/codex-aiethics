const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeCtx() {
  return new Proxy({}, {
    get(t, p) {
      if (p === 'measureText') return (text) => ({ width: String(text || '').length * 8 });
      if (p in t) return t[p];
      return () => {};
    },
    set(t, p, v) { t[p] = v; return true; },
  });
}
function makeCanvas(w, h) {
  return { width: w || 0, height: h || 0, style: {}, getContext: () => makeCtx(), addEventListener() {}, focus() {} };
}

const listeners = {};
let rafCb = null;
const storage = new Map();
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
const TR = windowObj.__test;
const {
  ETHICS_AXES, ETHICS_AXIS_MAX, MAPS, STAGE_PUZZLES, computeEthicsScore,
  computeEnding, WALKABLE,
} = vm.runInContext(
  '({ ETHICS_AXES, ETHICS_AXIS_MAX, MAPS, STAGE_PUZZLES, computeEthicsScore, computeEnding, WALKABLE })',
  sandbox,
);

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
function setPos(x, y, dir) {
  g.player.x = x;
  g.player.y = y;
  g.player.px = x * 48;
  g.player.py = y * 48;
  if (dir) g.player.dir = dir;
}
function advanceDialog(max = 100) {
  for (let i = 0; i < max && g.mode === 'dialog'; i++) tap('z');
  if (g.mode === 'dialog') throw new Error('dialog did not close');
}
function slot(i) {
  const raw = storage.get('ai-ethics-adventure-slot-' + i);
  return raw ? JSON.parse(raw) : null;
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

function classifyStagePuzzle(puzzleId, clueId, choiceId) {
  const puzzle = STAGE_PUZZLES[puzzleId];
  const clue = puzzle.clues.find((item) => item.id === clueId);
  g.map = puzzle.map;
  setPos(clue.stand.x, clue.stand.y, clue.stand.dir);
  tap('z');
  check(`${puzzle.title} 단서 집기: ${clue.label}`, g.mode === 'dialog' && g.puzzle && g.puzzle.carrying);
  advanceDialog();
  check(`${puzzle.title} 단서 설명 후 월드 복귀`, g.mode === 'world');
  const pad = TR.puzzleDoorPads(puzzleId, clueId).find((item) => item.door.id === choiceId);
  if (!pad) throw new Error(`puzzle pad missing: ${puzzleId}/${choiceId}`);
  setPos(pad.x, pad.y, clue.stand.dir);
  tap('z');
  check(`${puzzle.title} 선택 결과 대화`, g.mode === 'dialog');
  const resultText = g.dialog && Array.isArray(g.dialog.lines) ? g.dialog.lines.join('\n') : '';
  advanceDialog();
  return resultText;
}

function completePuzzle(puzzleId) {
  const puzzle = STAGE_PUZZLES[puzzleId];
  for (const clue of puzzle.clues) classifyStagePuzzle(puzzleId, clue.id, clue.correctDoor);
  check(`${puzzle.title} 완료 플래그`, g.flags.puzzles[puzzleId].complete === true);
  check(`${puzzle.title} 보상 처리`, g.flags.puzzles[puzzleId].rewarded === true);
  check(`${puzzle.title} 윤리 축 증가`, g.flags.ethics[puzzle.axis] >= 3);
}

console.log('[1] title -> new slot -> world');
step(5);
check('title slot screen', g.mode === 'title' && g.titleScreen === 'slots');
tap('z');
check('name screen', g.mode === 'title' && g.titleScreen === 'name');
g.nameConfirm = true;
step(2);
check('intro dialog', g.mode === 'dialog');
advanceDialog();
check('world loaded', g.mode === 'world' && g.map === 'village');
check('slot saved with puzzle flags', !!slot(0).flags.puzzles);
check('five ethics axes present', ETHICS_AXES.every((axis) => Object.prototype.hasOwnProperty.call(slot(0).flags.ethics, axis)));

console.log('[2] professor starts puzzle route');
setPos(5, 12, 'left');
tap('z');
check('professor dialog', g.mode === 'dialog');
advanceDialog();
check('main route flag saved', g.flags.talkedProf === true && slot(0).flags.talkedProf === true);
check('initial objective names first puzzle', TR.nextPuzzleGoal(g.flags).includes('데이터 발자국'));

console.log('[3] map puzzle choices and recovery prompts');
g.map = 'forest';
const wrongText = classifyStagePuzzle('data_footprint_forest', 'photo_name_tag', 'share_ok');
check('unsafe choice gives reflection', wrongText.includes('생각 질문') && wrongText.includes('개인정보'));
check('wrong choice remains incomplete', g.flags.puzzles.data_footprint_forest.complete === false);
classifyStagePuzzle('data_footprint_forest', 'photo_name_tag', 'needs_consent');
classifyStagePuzzle('data_footprint_forest', 'home_location', 'do_not_share');
const finishText = classifyStagePuzzle('data_footprint_forest', 'favorite_color', 'share_ok');
check('completion dialog includes learning piece', finishText.includes('배움 조각') && finishText.includes('동의'));
check('first puzzle complete', g.flags.puzzles.data_footprint_forest.complete === true);
check('next objective advances', TR.nextPuzzleGoal(g.flags).includes('필터버블'));

console.log('[4] all five puzzle stages');
completePuzzle('filter_bubble_maze');
completePuzzle('bias_court');
completePuzzle('deepfake_station');
completePuzzle('responsibility_core');
check('all puzzle pieces counted', TR.completedStagePuzzleCount(g.flags) === Object.keys(STAGE_PUZZLES).length);
check('ethics score reflects puzzle route', computeEthicsScore(g.flags.ethics) >= 50);
check('ending uses ethics only', computeEnding(Object.fromEntries(ETHICS_AXES.map((axis) => [axis, ETHICS_AXIS_MAX]))) === 'home');
check('final puzzle records ending id', !!g.flags.endingId && g.flags.endingId === computeEnding(g.flags.ethics));
check('ending is stored globally', JSON.parse(storage.get('ai-ethics-adventure-endings') || '{}')[g.flags.endingId] === true);

console.log('[5] saved report surfaces');
const saved = slot(0);
check('save keeps puzzle state', saved.flags.puzzles.responsibility_core.complete === true);
check('save omits old counters', !Object.prototype.hasOwnProperty.call(saved.flags, 'badges') && !Object.prototype.hasOwnProperty.call(saved.flags, 'defeated'));
const report = TR.buildReportText(0);
check('report title', /학습 리포트/.test(report));
check('report includes puzzle review', /스테이지 퍼즐 회고/.test(report) && /데이터 발자국 분류/.test(report) && /책임의 코어/.test(report));
check('report includes choice ledger', /퍼즐 선택 기록/.test(report) && /위험 선택/.test(report) && /안전 선택/.test(report));
check('report includes ethics axes', /윤리 이해 축/.test(report) && /개인정보·동의/.test(report) && /인간 감독·책임/.test(report));
g.mode = 'report';
g.report = { ret: 'world', slot: 0, toast: 0 };
step(2);
check('report screen renders', g.mode === 'report');

console.log('[6] class tools and safe spawn');
const f3 = TR.setupStageFlags(3);
check('stage jump completes previous puzzles', f3.puzzles.data_footprint_forest.complete && f3.puzzles.filter_bubble_maze.complete);
check('stage jump leaves target puzzle open', f3.puzzles.bias_court.complete === false);
const spawn = TR.stageSpawn(f3, 3);
const landed = MAPS[spawn.map].tiles[spawn.y][spawn.x];
check('stage spawn lands on walkable tile', WALKABLE.has(landed));
const classCsv = TR.buildClassCsv();
check('class CSV uses ethics axes', classCsv.includes('개인정보·동의') && classCsv.includes('연속 출석(일)'));
const missingWarpGates = Object.entries(MAPS).flatMap(([mapId, map]) =>
  (map.warps || []).filter((warp) => warp.lockText && !warp.needPuzzle).map((warp) => `${mapId}:${warp.x},${warp.y}`));
check('all locked routes are puzzle-gated', missingWarpGates.length === 0);

console.log(`\n✔ puzzle-only smoke passed (${passed} checks)`);
