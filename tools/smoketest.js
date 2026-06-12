// 게임 로직 스모크 테스트 (Node.js)
// DOM/Canvas를 스텁으로 대체하고 실제 플레이 경로를 시뮬레이션한다.
// 사용법: node tools/smoketest.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// ---------- DOM 스텁 ----------
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
  return { width: w || 0, height: h || 0, getContext: () => makeCtx(), addEventListener() {} };
}

const listeners = {};
let rafCb = null;
const storage = new Map();

const windowObj = {
  addEventListener: (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); },
  removeEventListener: (ev, fn) => {
    const a = listeners[ev];
    if (a) { const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); }
  },
  requestAnimationFrame: (cb) => { rafCb = cb; },
};

const sandbox = {
  window: windowObj,
  document: {
    getElementById: (id) => (id === 'game' ? makeCanvas(720, 528) : makeCanvas()),
    createElement: () => makeCanvas(),
    body: { classList: { add() {} } },
  },
  localStorage: {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
  },
  requestAnimationFrame: windowObj.requestAnimationFrame,
  console, Math, Set, Map, JSON, Object, setTimeout, clearTimeout,
};
vm.createContext(sandbox);

for (const f of ['src/sprites.js', 'src/audio.js', 'src/data.js', 'src/game.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), sandbox, { filename: f });
}

const g = windowObj.__game;
const { MAPS } = vm.runInContext('({ MAPS })', sandbox);

// ---------- 시뮬레이션 도우미 ----------
function step(n = 1) {
  for (let i = 0; i < n; i++) {
    const cb = rafCb; rafCb = null;
    if (!cb) throw new Error('requestAnimationFrame 콜백 없음');
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
function hold(key, frames) {
  dispatch('keydown', { key });
  step(frames);
  dispatch('keyup', { key });
  step(2);
}
function setPos(x, y, dir) {
  g.player.x = x; g.player.y = y;
  g.player.px = x * 48; g.player.py = y * 48;
  if (dir) g.player.dir = dir;
}
function advanceDialog(max = 100) {
  for (let i = 0; i < max && g.mode === 'dialog'; i++) tap('z');
  if (g.mode === 'dialog') throw new Error('대화가 끝나지 않음');
}
function answerQuestion(correct) {
  if (g.mode !== 'battle') throw new Error('배틀 모드가 아님: ' + g.mode);
  step(1); // currentQuestion()이 풀을 다시 섞을 시간
  const b = g.battle;
  const q = b.questions[b.qIdx];
  const target = correct ? q.c : (q.c + 1) % q.a.length;
  while (b.cursor !== target) tap('ArrowDown');
  tap('z'); // 답 제출
  if (b.phase !== 'feedback') throw new Error('피드백 단계가 아님');
  if (b.feedback.correct !== correct) throw new Error('정답 판정 오류');
  tap('z'); // 피드백 닫기
}
function fightAndWin(hp, wrongFirst = 0) {
  for (let i = 0; i < wrongFirst; i++) answerQuestion(false);
  for (let i = 0; i < hp && g.mode === 'battle'; i++) answerQuestion(true);
}

let passed = 0;
function check(name, cond) {
  if (cond) { console.log('  ✔ ' + name); passed++; }
  else { console.error('  ✘ ' + name); process.exit(1); }
}

// ---------- 시나리오 ----------
console.log('[1] 타이틀 → 게임 시작');
step(5);
check('타이틀 화면', g.mode === 'title');
tap('z');
check('인트로 대화 시작', g.mode === 'dialog');
advanceDialog();
check('월드 진입', g.mode === 'world' && g.map === 'village');
check('시작 위치 (13,16)', g.player.x === 13 && g.player.y === 16);

console.log('[2] 박사님과 대화 (메인 퀘스트 시작)');
setPos(5, 12, 'left'); // 박사님 (4,12) 옆
tap('z');
check('박사님 대화 시작', g.mode === 'dialog');
advanceDialog();
check('퀘스트 플래그 설정', g.flags.talkedProf === true);
check('자동 저장됨', storage.size > 0);

console.log('[3] 이동/충돌');
setPos(2, 6, 'down'); // 아래 (2,7)? village y7 x2 = G
hold('ArrowLeft', 12); // (1,6) G로 이동
check('걷기 이동', g.player.x === 1 && g.player.y === 6);
hold('ArrowLeft', 12); // (0,6)은 T(나무) → 막힘
check('나무에 막힘', g.player.x === 1);

console.log('[4] 마을 → 숲 워프');
setPos(13, 1, 'up');
hold('ArrowUp', 14);
// 워프 후에도 키를 누르고 있으면 계속 걸어갈 수 있으므로 맵과 x만 확인
check('숲으로 워프', g.map === 'forest' && g.player.x === 13 && g.player.y >= 16);

console.log('[5] 배틀 패배 흐름 (베껴몬에게 3번 틀리기)');
setPos(7, 9, 'down'); // 베껴몬 (7,10) 위
tap('z');
advanceDialog(); // 등장 대사 → 배틀
check('배틀 시작', g.mode === 'battle' && g.battle.monId === 'bekkyeomon');
answerQuestion(false);
answerQuestion(false);
answerQuestion(false);
check('패배 → 월드 복귀 대화', g.mode === 'dialog');
advanceDialog();
check('베껴몬 아직 남아있음', g.flags.defeated.bekkyeomon === false);

console.log('[6] 배틀 승리 흐름 (베껴몬, 1번 틀리고 승리)');
tap('z'); // 같은 자리에서 재도전
advanceDialog();
check('재배틀 시작', g.mode === 'battle');
fightAndWin(3, 1);
check('승리 대화', g.mode === 'dialog');
advanceDialog();
check('베껴몬 깨우침', g.flags.defeated.bekkyeomon === true);
check('배지는 아직 0개 (부하 몬스터)', !g.flags.badges.forest);

console.log('[7] 수호자 몰래몬 → 숲의 배지');
setPos(13, 4, 'up'); // 몰래몬 (13,3) 아래
tap('z');
advanceDialog();
fightAndWin(3);
advanceDialog();
check('숲의 배지 획득', g.flags.badges.forest === true);

console.log('[8] 배지 부족 시 타워 입장 거부');
g.map = 'village';
setPos(18, 5, 'up');
hold('ArrowUp', 14);
check('입장 거부 대화', g.mode === 'dialog');
advanceDialog();
check('마을에 남아있음', g.map === 'village' && g.player.y === 5);

console.log('[9] 호수/동굴 수호자 처치 (배지 3개)');
g.map = 'lake';
setPos(15, 6, 'up'); // 거짓몬 (15,5)
tap('z'); advanceDialog(); fightAndWin(3); advanceDialog();
check('호수의 배지', g.flags.badges.lake === true);
g.map = 'cave';
setPos(5, 4, 'left'); // 편향몬 (4,4)
tap('z'); advanceDialog(); fightAndWin(3); advanceDialog();
check('동굴의 배지', g.flags.badges.cave === true);

console.log('[10] 스테이지 1 보스 (혼돈몬) 전, 남쪽 길 잠김 확인');
g.map = 'village';
setPos(13, 18, 'down');
hold('ArrowDown', 14);
check('남쪽 길 잠김 대화', g.mode === 'dialog');
advanceDialog();
check('마을에 남아있음', g.map === 'village');

console.log('[11] 타워 입장 → 혼돈몬 → 스테이지 2 개방');
setPos(18, 5, 'up');
hold('ArrowUp', 14);
check('타워 입장', g.map === 'tower' && g.player.x === 8 && g.player.y >= 10);
setPos(8, 4, 'up'); // 혼돈몬 (8,3)
tap('z');
advanceDialog();
check('보스전 시작', g.mode === 'battle' && g.battle.monId === 'hondonmon' && g.battle.monMaxHp === 5);
check('보스전은 하트 4개', g.battle.maxHearts === 4);
fightAndWin(5);
advanceDialog();
check('스테이지 1 클리어 (엔딩 아님)', g.mode === 'world' && g.flags.defeated.hondonmon);

console.log('[12] 스테이지 2: 햇살초원');
g.map = 'village';
setPos(13, 18, 'down');
hold('ArrowDown', 14);
check('햇살초원 진입', g.map === 'meadow');
setPos(13, 18, 'down'); // 보스 전 남쪽 길 잠김
hold('ArrowDown', 14);
check('사막 길 잠김', g.mode === 'dialog');
advanceDialog();
setPos(7, 5, 'down'); // 악플몬 (7,6)
tap('z'); advanceDialog();
check('악플몬 배틀', g.battle.monId === 'akpeulmon');
fightAndWin(3); advanceDialog();
setPos(13, 17, 'up'); // 보스 멋대로몬 (13,16)
tap('z'); advanceDialog();
fightAndWin(4); advanceDialog();
check('멋대로몬 클리어', g.flags.defeated.meotdaeromon);
setPos(13, 18, 'down');
hold('ArrowDown', 14);
check('재깍사막 진입', g.map === 'desert');

console.log('[13] 스테이지 3: 재깍사막');
setPos(13, 16, 'up'); // 보스 떠넘기몬 (13,15)
tap('z'); advanceDialog();
check('떠넘기몬 배틀', g.battle.monId === 'tteonemgimon');
fightAndWin(4); advanceDialog();
check('떠넘기몬 클리어', g.flags.defeated.tteonemgimon);
setPos(13, 18, 'down');
hold('ArrowDown', 14);
check('눈송이마을 진입', g.map === 'snow');

console.log('[14] 스테이지 4: 눈송이마을');
setPos(13, 16, 'up'); // 보스 홀림몬 (13,15)
tap('z'); advanceDialog();
fightAndWin(4); advanceDialog();
check('홀림몬 클리어', g.flags.defeated.hollimmon);
setPos(13, 18, 'down');
hold('ArrowDown', 14);
check('그림자성 진입', g.map === 'castle');

console.log('[15] 스테이지 5: 그림자성 (문지기 2 + 최종 보스)');
setPos(10, 9, 'up'); // 메아리몬 (10,8)
tap('z'); advanceDialog();
check('메아리몬 배틀 (복습 풀)', g.battle.monId === 'maearimon' && g.battle.questions.length >= 25);
fightAndWin(3); advanceDialog();
setPos(9, 5, 'up'); // 그림자몬 (9,4)
tap('z'); advanceDialog();
fightAndWin(3); advanceDialog();
setPos(9, 3, 'up'); // 어둠대왕몬 (9,2)
tap('z'); advanceDialog();
check('최종 보스전', g.battle.monId === 'finalboss' && g.battle.monMaxHp === 6 && g.battle.maxHearts === 4);
fightAndWin(6);
advanceDialog();
check('엔딩 진입', g.mode === 'ending');
step(130);
tap('z');
check('엔딩 후 월드 복귀', g.mode === 'world');

console.log('[16] 저장 데이터 무결성');
const save = JSON.parse(storage.get('ai-ethics-adventure-v1'));
check('저장된 배지 3개', save.flags.badges.forest && save.flags.badges.lake && save.flags.badges.cave);
check('모든 보스 처치 저장', save.flags.defeated.hondonmon && save.flags.defeated.meotdaeromon &&
  save.flags.defeated.tteonemgimon && save.flags.defeated.hollimmon && save.flags.defeated.finalboss);

console.log(`\n✔ 스모크 테스트 통과 (${passed}개 검사)`);
