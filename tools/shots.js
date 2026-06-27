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
// game.js가 캔버스에 이벤트 리스너·포커스를 거는데, node-canvas엔 없으므로 스텁을 단다.
mainCanvas.addEventListener = () => {};
mainCanvas.removeEventListener = () => {};
mainCanvas.focus = () => {};
mainCanvas.blur = () => {};
mainCanvas.setAttribute = () => {};
mainCanvas.style = mainCanvas.style || {};
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
  ethics: { privacy: 6, perspective: 4, fairness: 2, verification: 5, responsibility: 3 },
  puzzles: {
    data_footprint_forest: { clues: { photo_name_tag: 'needs_consent', home_location: 'do_not_share', favorite_color: 'share_ok' }, complete: true, rewarded: true },
    filter_bubble_maze: { clues: { class_chat_same: 'same_view', opposing_comment: 'opposite_view', evidence_report: 'evidence_view' }, complete: true, rewarded: true },
    bias_court: { clues: { age_sample: 'representative_evidence', region_sample: 'representative_evidence', device_access: 'representative_evidence', language_sample: 'representative_evidence' }, complete: true, rewarded: true },
    deepfake_station: { clues: {}, complete: false, rewarded: false },
    responsibility_core: { clues: {}, complete: false, rewarded: false },
  },
  mercy: 14, visited: {}, trueEnding: false, correctCount: 52, battleCount: 16,
  endingId: null,
};
storage.set('ai-ethics-adventure-slot-0', JSON.stringify({
  name: '도도', map: 'desert', x: 13, y: 8, flags: seedFlags, updatedAt: Date.now(),
}));
storage.set('ai-ethics-adventure-slot-1', JSON.stringify({
  name: '하늘', map: 'village', x: 13, y: 16,
  flags: {
    badges: {}, defeated: {}, mercy: 2, visited: {},
    ethics: { privacy: 2, perspective: 3, fairness: 1, verification: 4, responsibility: 1 },
  }, updatedAt: Date.now(),
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
    body: { classList: { add() {}, remove() {}, toggle() {} } },
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
const TR = windowObj.__test;
const { QUIZZES, MONSTERS, BOSS_ATTACKS, DEX_ORDER, STAGE_PUZZLES } =
  vm.runInContext('({QUIZZES,MONSTERS,BOSS_ATTACKS,DEX_ORDER,STAGE_PUZZLES})', sandbox);

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

// 2) 마을 탐험 (HUD: 스테이지/증표/♥)
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

// 9) 어두운 지역 — 회로의 동굴 (탐험가 NPC + 편향몬 + 수정)
g.mode = 'world'; g.map = 'cave';
g.flags.defeated = {}; // 편향몬이 보이도록
setPlayer(8, 4, 'right');
g.time = 18;
shot('09-cave.png');

// 10) 수호자 일지 (주제별 정답률 — 슬롯 0 통계 시드)
g.currentSlot = 0; g.playerName = '수호자';
storage.set('ai-ethics-adventure-stats-0', JSON.stringify({
  privacy: { correct: 6, total: 6 },
  copyright: { correct: 5, total: 6 },
  fake: { correct: 4, total: 5 },
  bias: { correct: 2, total: 5 },
  balance: { correct: 3, total: 4 },
  manners: { correct: 5, total: 5 },
  safety: { correct: 1, total: 3 },
  transparency: { correct: 4, total: 6 },
}));
storage.set('ai-ethics-adventure-meta-0', JSON.stringify({ challengeRuns: 3, challengeBest: 10, challengeBestTotal: 10 }));
g.mode = 'journal'; g.journal = { ret: 'world', slot: 0, scroll: 0, toast: 0 };
g.time = 20;
shot('10-journal.png');

// 11) 자유 퀴즈 챌린지 (진행 중 화면)
g.mode = 'challenge';
{
  const topics = Object.keys(QUIZZES).filter((t) => QUIZZES[t] && QUIZZES[t].length)
    .map((t) => ({ key: t, label: t, n: QUIZZES[t].length }));
  const q = Object.assign({}, QUIZZES.privacy[0], { _topic: 'privacy', _qid: 'privacy#0' });
  g.challenge = {
    ret: 'title', slot: 0, phase: 'quiz', topics, sel: 0,
    questions: new Array(10).fill(q), idx: 3, cursor: 1,
    choiceOrder: q.a.map((_, i) => i), score: 3, feedback: null,
  };
}
g.time = 16;
shot('11-challenge.png');

// 12) 도전과제 (업적) — 일부 달성 상태
g.flags.defeated = Object.assign(g.flags.defeated, { bekkyeomon: true, mollaemon: true, hondonmon: true });
g.flags.mercy = 11;
storage.set('ai-ethics-adventure-endings', JSON.stringify({ home: true }));
g.mode = 'awards'; g.awards = { ret: 'world', slot: 0, scroll: 0 };
g.time = 20;
shot('12-awards.png');

// 13) 도움말
g.mode = 'help'; g.helpRet = 'title';
g.time = 20;
shot('13-help.png');

// 14) 꾸미기 (칭호 · 테마)
storage.set('ai-ethics-adventure-cosmetic-0', JSON.stringify({ title: 'kind', theme: 'ocean' }));
g.mode = 'cosmetics';
g.cosmetics = { ret: 'world', slot: 0, col: 1, rowTitle: 1, rowTheme: 2, toast: 0 };
g.time = 20;
shot('14-cosmetics.png');

// 15) 데이터 백업 · 복원
g.mode = 'backup';
g.backup = { ret: 'world', cursor: 1, toast: 0 };
g.time = 20;
shot('15-backup.png');

// 16) 보너스 지역 — AI 미래연구소 (새 몬스터 3종)
g.mode = 'world'; g.map = 'lab';
g.flags.defeated.hwangakmon = false;
g.flags.defeated.hapseongmon = false;
g.flags.defeated.miraemon = false;
setPlayer(9, 8, 'up');
g.time = 18;
shot('16-lab.png');

// 17) 교사용 대시보드 (학생 둘은 데이터, 하나는 비어 있음)
storage.set('ai-ethics-adventure-stats-1', JSON.stringify({
  privacy: { correct: 3, total: 4 }, copyright: { correct: 2, total: 5 },
  fake: { correct: 4, total: 4 }, bias: { correct: 1, total: 4 },
}));
storage.set('ai-ethics-adventure-meta-1', JSON.stringify({ streak: 2, bestStreak: 3 }));
storage.set('ai-ethics-adventure-meta-0', JSON.stringify({
  challengeRuns: 3, challengeBest: 10, challengeBestTotal: 10, streak: 5, bestStreak: 7,
}));
g.mode = 'dashboard';
g.dashboard = { ret: 'title', cursor: 0 };
g.currentSlot = 2;
g.time = 20;
shot('17-dashboard.png');

// 18) 커스텀 퀴즈 (선생님 문제)
storage.set('ai-ethics-adventure-customquiz', JSON.stringify([
  { q: '우리 반 규칙: AI에게 물어봐도 되는 것은?', a: ['친구 비밀', '숙제 푸는 방법 설명', '내 주소'], c: 1, why: '예시 문제입니다.' },
  { q: '두 번째 커스텀 문제', a: ['1', '2', '3'], c: 0, why: '해설' },
]));
g.mode = 'quizedit';
g.quizedit = { ret: 'title', cursor: 0, toast: 0 };
g.time = 20;
shot('18-quizedit.png');

// 19) 배움 카드 컬렉션 (슬롯 0의 정답 통계로 일부 해금)
g.currentSlot = 0;
g.mode = 'cards';
g.cards = { ret: 'title', slot: 0, scroll: 0 };
g.time = 20;
shot('19-cards.png');

// 20) 수료증 · 진도 인증서
g.mode = 'cert';
g.cert = { ret: 'title', slot: 0, toast: 0 };
g.time = 20;
shot('20-cert.png');

// 21) 명예의 전당 (슬롯들의 최고 기록)
g.mode = 'hof';
g.hof = { ret: 'title', cat: 0 };
g.time = 20;
shot('21-hof.png');

// 22) 수업 모드 (스테이지 바로 시작)
g.mode = 'classmode';
g.classmode = { ret: 'world', sel: 3, confirm: false, toast: 0 };
g.time = 20;
shot('22-classmode.png');

// 23) 교사용 학생 진단 리포트
g.currentSlot = 0;
g.mode = 'report';
g.report = { ret: 'title', slot: 0, toast: 0 };
g.time = 20;
shot('23-report.png');

g.mode = 'world';
g.map = 'forest';
g.flags.defeated.hondonmon = false;
g.flags.puzzles = g.flags.puzzles || {};
g.flags.puzzles.data_footprint_forest = {
  clues: { photo_name_tag: 'needs_consent' },
  complete: false,
  rewarded: false,
};
g.puzzle = { puzzleId: 'data_footprint_forest', clueId: 'home_location', carrying: true, ret: 'world' };
setPlayer(STAGE_PUZZLES.data_footprint_forest.clues[1].stand.x, STAGE_PUZZLES.data_footprint_forest.clues[1].stand.y, 'up');
g.time = 22;
shot('24-puzzle-progress.png');

g.mode = 'battle';
g.battle = makeBattle('mollaemon', 'feedback');
g.battle.feedback = {
  correct: false,
  why: '사진과 이름표는 친구의 개인정보를 드러낼 수 있어요.',
  reflectionPrompt: '생각 질문: 개인정보 보호에서 무엇을 먼저 확인했어야 할까?',
};
g.time = 24;
shot('25-feedback-reflection.png');

g.mode = 'dialog';
g.dialog = {
  lines: [
    '[마지막 회고]',
    '마지막 선택: 손을 내밀기 · 이어질 결말: 집으로',
    '윤리 이해도 88점 · 안아 준 마음 20/20',
    '다섯 윤리 축이 고르게 연결되었어요.',
  ],
  idx: 1,
  chars: 999,
  speaker: '영이',
  onEnd: null,
};
g.time = 20;
shot('26-ending-reflection.png');

g.mode = 'report';
g.report = { ret: 'title', slot: 3, toast: 0 };
g.time = 20;
shot('27-class-report-heatmap.png');

g.mode = 'battle';
g.battle = makeBattle('mollaemon', 'feedback');
g.battle.combo = 3;
g.battle.bestCombo = 3;
g.battle.feedback = {
  correct: true,
  why: '개인정보는 먼저 동의와 맥락을 확인해야 해요.',
  reflectionPrompt: '',
  combo: 3,
};
g.time = 24;
shot('28-battle-combo.png');

const challengeQuestion = Object.assign({}, QUIZZES.privacy[0], { _topic: 'privacy', _qid: 'privacy#shot' });
g.mode = 'challenge';
g.challenge = {
  ret: 'title', slot: 0, phase: 'feedback', topics: [], sel: 0,
  questions: [challengeQuestion], idx: 0, cursor: 1, choiceOrder: [0, 1, 2],
  score: 0, feedback: {
    correct: false,
    why: '친구의 얼굴과 이름표가 함께 있으면 먼저 동의를 확인해야 해요.',
    reflectionPrompt: '생각 질문: 개인정보 문제를 다음에 만나면 어떤 단서를 먼저 볼까?',
    combo: 0,
  },
  combo: 0, bestCombo: 2,
};
g.time = 24;
shot('29-challenge-reflection.png');

g.mode = 'challenge';
g.challenge = {
  ret: 'title', slot: 0, phase: 'result', topics: [], sel: 0,
  questions: Array.from({ length: 10 }, () => challengeQuestion), idx: 10, cursor: 0,
  choiceOrder: [0, 1, 2], score: 6, feedback: null, combo: 0, bestCombo: 4,
};
g.time = 24;
shot('30-challenge-next-step.png');

g.mode = 'journal';
g.journal = { ret: 'title', slot: 0, scroll: 0, toast: 0 };
g.time = 24;
shot('31-journal-ethics-summary.png');

g.mode = 'classmode';
g.classmode = { ret: 'title', sel: 4, confirm: false, toast: 0 };
g.time = 24;
shot('32-classmode-stage-theme.png');

g.mode = 'title';
g.titleScreen = 'slots';
g.slotCursor = 0;
g.time = 48;
shot('33-title-puzzle-pieces.png');

g.mode = 'world';
g.map = 'fogswamp';
g.flags = TR.setupStageFlags(2);
g.flags.defeated.somunmon = true;
g.flags.defeated.musimon = true;
g.flags.puzzles.filter_bubble_maze = {
  clues: {
    class_chat_same: 'same_view',
    opposing_comment: 'same_view',
  },
  attempts: [
    { clueId: 'class_chat_same', clueLabel: '내 생각과 같은 교실 채팅', doorId: 'same_view', doorLabel: '같은 의견', correct: true },
    { clueId: 'opposing_comment', clueLabel: '불편하지만 다른 댓글', doorId: 'same_view', doorLabel: '같은 의견', correct: false },
  ],
  complete: false,
  rewarded: false,
};
g.puzzle = { puzzleId: 'filter_bubble_maze', clueId: 'evidence_report', carrying: true, ret: 'world' };
setPlayer(17, 9, 'up');
g.time = 42;
shot('34-puzzle-map-effect.png');

g.puzzle = null;
storage.set('ai-ethics-adventure-slot-0', JSON.stringify({
  name: '도도',
  map: 'fogswamp',
  x: 17,
  y: 9,
  flags: g.flags,
  updatedAt: Date.now(),
}));
storage.delete('ai-ethics-adventure-stats-0');
storage.delete('ai-ethics-adventure-mistakes-0');
g.currentSlot = 0;
g.mode = 'report';
g.report = { ret: 'title', slot: 0, toast: 0 };
g.time = 24;
shot('35-puzzle-choice-report.png');

console.log('완료. shots/ 폴더에 35장 생성.');
