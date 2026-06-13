// 스크린샷 생성기 — node-canvas로 실제 게임 화면을 렌더해 PNG로 저장한다.
// 사용법: node tools/shots.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createCanvas } = require('canvas');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'shots');
fs.mkdirSync(OUT, { recursive: true });

// ---- DOM/환경 스텁 (node-canvas 백엔드) ----
const mainCanvas = createCanvas(720, 528);
function stubEl() {
  return { style: {}, value: '', addEventListener() {}, removeEventListener() {},
    focus() {}, blur() {}, classList: { add() {}, remove() {} } };
}
const listeners = {};
let rafCb = null;
const storage = new Map();

// 타이틀/도감을 보기 좋게 채워 둔다 (스크립트 로드 전에 심어야 함)
const seedFlags = {
  talkedProf: true,
  badges: { forest: true, lake: true, cave: true },
  defeated: { hondonmon: true, meotdaeromon: true, tteonemgimon: true,
    bekkyeomon: true, mollaemon: true, jungdokmon: true, geojitmon: true, pyeonhyangmon: true,
    akpeulmon: true, gatimmon: true, pungpungmon: true, kkamkkammon: true },
  mercy: 14, visited: {}, trueEnding: false, correctCount: 52, battleCount: 16,
  endingId: null,
};
storage.set('ai-ethics-adventure-slot-0', JSON.stringify({
  name: '도도', map: 'desert', x: 13, y: 8, flags: seedFlags, updatedAt: Date.now(),
}));
storage.set('ai-ethics-adventure-slot-1', JSON.stringify({
  name: '하늘', map: 'village', x: 13, y: 16,
  flags: { badges: {}, defeated: {}, mercy: 2, visited: {} }, updatedAt: Date.now(),
}));
storage.set('ai-ethics-adventure-endings', JSON.stringify({ farewell: true, silent: true }));
// 도감 22/28 수집 상태 (로드 전에 심어야 타이틀에도 반영)
const DEX_SEED_ORDER = ['bekkyeomon', 'mollaemon', 'jungdokmon', 'geojitmon', 'pyeonhyangmon', 'hondonmon',
  'akpeulmon', 'gatimmon', 'meotdaeromon', 'pungpungmon', 'kkamkkammon', 'tteonemgimon',
  'sideulmon', 'ppaeatmon', 'hollimmon', 'maearimon', 'geurimjamon', 'finalboss',
  'tturimmon', 'girokmon', 'sujipmon', 'saseomon'];
const dexStore = {};
DEX_SEED_ORDER.forEach((id, i) => { dexStore[id] = { seen: true, mercy: ['mercy', 'neutral', 'harsh'][i % 3] }; });
storage.set('ai-ethics-adventure-dex', JSON.stringify(dexStore));

const windowObj = {
  addEventListener: (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); },
  removeEventListener: () => {},
  requestAnimationFrame: (cb) => { rafCb = cb; },
};
const sandbox = {
  window: windowObj,
  document: {
    getElementById: (id) => (id === 'game' ? mainCanvas : stubEl()),
    createElement: () => createCanvas(16, 16),
    body: { classList: { add() {} } },
  },
  localStorage: {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
  },
  requestAnimationFrame: windowObj.requestAnimationFrame,
  console, Math, Set, Map, JSON, Object, setTimeout, clearTimeout, Date,
};
vm.createContext(sandbox);
for (const f of ['src/sprites.js', 'src/audio.js', 'src/data.js', 'src/game.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
}
const g = windowObj.__game;
const { QUIZZES, MONSTERS, BOSS_ATTACKS, DEX_ORDER } =
  vm.runInContext('({QUIZZES,MONSTERS,BOSS_ATTACKS,DEX_ORDER})', sandbox);

function step(n = 1) { for (let i = 0; i < n; i++) { const cb = rafCb; rafCb = null; cb(); } }
function shot(name) {
  step(1);
  fs.writeFileSync(path.join(OUT, name), mainCanvas.toBuffer('image/png'));
  console.log('  saved shots/' + name);
}
function setPlayer(x, y, dir) {
  g.player.x = x; g.player.y = y; g.player.px = x * 48; g.player.py = y * 48; g.player.dir = dir || 'down';
}
function makeBattle(monId, phase) {
  const mon = MONSTERS[monId];
  const topics = Array.isArray(mon.topic) ? mon.topic : [mon.topic];
  const questions = topics.flatMap((t) => QUIZZES[t]);
  const maxHearts = mon.hp >= 5 ? 4 : 3;
  return {
    monId, mon, monHp: Math.max(1, Math.ceil(mon.hp / 2)), monMaxHp: mon.hp,
    playerHp: maxHearts - 1, maxHearts, questions, qIdx: 0, phase,
    cursor: 1, feedback: null, shake: 0, flash: 0,
    attack: BOSS_ATTACKS[monId] || null, dodgeDone: false, dodge: null,
  };
}

console.log('스크린샷 생성:');

// 1) 타이틀 (슬롯/수집 채워진 상태)
g.time = 40;
shot('01-title.png');

// 2) 마을 탐험 (HUD: 스테이지/배지/♥)
g.mode = 'world'; g.map = 'village';
g.flags.talkedProf = true;
g.flags.badges = { forest: true, lake: true, cave: true };
g.flags.mercy = 14;
g.flags.defeated = Object.assign(g.flags.defeated, { hondonmon: true });
setPlayer(9, 12, 'down');
g.time = 30;
shot('02-world.png');

// 3) NPC 대화
g.mode = 'dialog'; g.map = 'village'; setPlayer(5, 12, 'left');
g.dialog = { lines: ['오, 드디어 왔구나!\n나는 AI 연구소의 박사란다.\n큰일이야… AI 세상에 "윤리 오류"가\n퍼지고 있어!'], idx: 0, chars: 999, speaker: '박사님', onEnd: null };
shot('03-dialog.png');

// 4) 퀴즈 배틀 (질문 화면)
g.mode = 'battle'; g.battle = makeBattle('mollaemon', 'question'); g.battle.cursor = 1;
g.time = 24;
shot('04-battle.png');

// 5) 마음의 선택 (자비 시스템)
g.mode = 'battle'; g.battle = makeBattle('hollimmon', 'mercy'); g.battle.monHp = 0; g.battle.cursor = 0;
shot('05-mercy.png');

// 6) 회피 미니게임 (보스전)
g.mode = 'battle'; g.battle = makeBattle('hondonmon', 'dodge');
g.battle.dodge = {
  t: 70, dur: 300,
  box: { x: 210, y: 150, w: 300, h: 170 },
  soul: { x: 360, y: 250 },
  bullets: [
    { x: 250, y: 170, vx: 0, vy: 2.4, r: 6 }, { x: 320, y: 160, vx: 0, vy: 2.6, r: 6 },
    { x: 400, y: 185, vx: 0, vy: 2.2, r: 6 }, { x: 470, y: 175, vx: 0, vy: 2.5, r: 6 },
    { x: 290, y: 210, vx: 0, vy: 2.3, r: 6 }, { x: 360, y: 200, vx: 0, vy: 2.1, r: 6 },
    { x: 430, y: 220, vx: 0, vy: 2.4, r: 6 }, { x: 250, y: 250, vx: 0, vy: 2.6, r: 6 },
    { x: 470, y: 260, vx: 0, vy: 2.2, r: 6 }, { x: 320, y: 290, vx: 0, vy: 2.3, r: 6 },
  ],
  spawnTimer: 30, inv: 0,
};
g.time = 12;
shot('06-dodge.png');

// 7) 몬스터 도감 (22/28 수집 상태는 위에서 시드)
g.mode = 'dex'; g.dex = { cursor: 1, ret: 'title' }; // mollaemon (수집됨)
g.time = 20;
shot('07-dex.png');

// 8) 진엔딩 — 집으로
g.mode = 'ending'; g.endingType = 'true';
g.flags.endingId = 'home'; g.flags.trueEnding = true;
g.flags.correctCount = 84; g.flags.mercy = 24;
g.endingT = 220; g.time = 60;
shot('08-ending.png');

console.log('완료. shots/ 폴더에 8장 생성.');
