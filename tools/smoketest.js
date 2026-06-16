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
    body: { classList: { add() {}, remove() {}, toggle() {} } },
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
const correctPosSeen = new Set();
function answerQuestion(correct) {
  if (g.mode !== 'battle') throw new Error('배틀 모드가 아님: ' + g.mode);
  step(1); // currentQuestion()이 풀을 다시 섞을 시간
  const b = g.battle;
  const q = b.questions[b.qIdx];
  correctPosSeen.add(b.correctPos);
  // 보기 순서가 섞이므로, 정답의 '표시 위치'(correctPos)를 기준으로 고른다
  const target = correct ? b.correctPos : (b.correctPos + 1) % q.a.length;
  while (b.cursor !== target) tap('ArrowDown');
  tap('z'); // 답 제출
  if (b.phase !== 'feedback') throw new Error('피드백 단계가 아님');
  if (b.feedback.correct !== correct) throw new Error('정답 판정 오류');
  tap('z'); // 피드백 닫기
}
// 보스 회피 구간이 뜨면 (입력 없이) 끝날 때까지 빠르게 넘긴다.
let dodgeSeen = false;
function skipDodgeIfAny() {
  if (g.mode === 'battle' && g.battle && g.battle.phase === 'dodge') {
    dodgeSeen = true;
    let guard = 0;
    while (g.battle && g.battle.phase === 'dodge' && guard++ < 4000) step(1);
    if (g.battle && g.battle.phase === 'dodge') throw new Error('회피 구간이 끝나지 않음');
  }
}
function fightAndWin(hp, wrongFirst = 0) {
  for (let i = 0; i < wrongFirst; i++) { answerQuestion(false); skipDodgeIfAny(); }
  for (let i = 0; i < hp && g.mode === 'battle'; i++) { answerQuestion(true); skipDodgeIfAny(); }
}
// 모든 몬스터: 퀴즈를 모두 맞히면 '마음의 선택'이 나온다
function fightWithMercy(hp, mercyIdx = 0, wrongFirst = 0) {
  fightAndWin(hp, wrongFirst);
  if (g.mode !== 'battle' || g.battle.phase !== 'mercy') {
    throw new Error('마음의 선택 단계가 아님: ' + g.mode + '/' + (g.battle && g.battle.phase));
  }
  while (g.battle.cursor !== mercyIdx) tap('ArrowDown');
  tap('z'); // 선택 → 응답
  if (g.battle.phase !== 'mercyReply') throw new Error('응답 단계가 아님');
  tap('z'); // 응답 닫기 → 승리 대화
}

let passed = 0;
function check(name, cond) {
  if (cond) { console.log('  ✔ ' + name); passed++; }
  else { console.error('  ✘ ' + name); process.exit(1); }
}

// ---------- 시나리오 ----------
console.log('[1] 타이틀 → 슬롯 선택 → 이름 입력 → 게임 시작');
step(5);
check('타이틀 화면', g.mode === 'title' && g.titleScreen === 'slots');
check('슬롯 3개 모두 비어 있음', !storage.get('ai-ethics-adventure-slot-0'));
tap('z'); // 빈 슬롯 0 선택 → 이름 입력
check('이름 입력 화면', g.mode === 'title' && g.titleScreen === 'name');
// 이름 입력 중에는 게임 키가 막힌다(IME). Enter/시작 버튼은 nameConfirm으로 확정.
g.nameConfirm = true; step(2);
check('인트로 대화 시작', g.mode === 'dialog');
advanceDialog();
check('월드 진입', g.mode === 'world' && g.map === 'village');
check('시작 위치 (13,16)', g.player.x === 13 && g.player.y === 16);
check('슬롯 0에 저장됨', !!storage.get('ai-ethics-adventure-slot-0'));
check('기본 이름 수호자', g.playerName === '수호자');

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
fightWithMercy(3, 0, 1);
check('승리 대화', g.mode === 'dialog');
advanceDialog();
check('베껴몬 깨우침', g.flags.defeated.bekkyeomon === true);
check('증표는 아직 0개 (부하 몬스터)', !g.flags.badges.forest);

console.log('[7] 수호자 몰래몬 → 숲의 증표');
setPos(13, 4, 'up'); // 몰래몬 (13,3) 아래
tap('z');
advanceDialog();
fightWithMercy(3, 0);
advanceDialog();
check('숲의 증표 획득', g.flags.badges.forest === true);

console.log('[8] 증표 부족 시 타워 입장 거부');
g.map = 'village';
setPos(18, 5, 'up');
hold('ArrowUp', 14);
check('입장 거부 대화', g.mode === 'dialog');
advanceDialog();
check('마을에 남아있음', g.map === 'village' && g.player.y === 5);

console.log('[9] 호수/동굴 수호자 처치 (증표 3개)');
g.map = 'lake';
setPos(15, 6, 'up'); // 거짓몬 (15,5)
tap('z'); advanceDialog(); fightWithMercy(3, 0); advanceDialog();
check('호수의 증표', g.flags.badges.lake === true);
g.map = 'cave';
setPos(5, 4, 'left'); // 편향몬 (4,4)
tap('z'); advanceDialog(); fightWithMercy(3, 0); advanceDialog();
check('동굴의 증표', g.flags.badges.cave === true);

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
check('보스는 회피 공격을 가짐', !!g.battle.attack);
fightWithMercy(5, 0);
check('보스전에서 회피 구간이 발동됨', dodgeSeen === true);
check('회피 중에도 하트는 0이 되지 않음', g.flags.defeated.hondonmon === true);
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
fightWithMercy(3, 0); advanceDialog();
setPos(13, 17, 'up'); // 보스 멋대로몬 (13,16)
tap('z'); advanceDialog();
fightWithMercy(4, 0); advanceDialog();
check('멋대로몬 클리어', g.flags.defeated.meotdaeromon);
setPos(13, 18, 'down');
hold('ArrowDown', 14);
check('재깍사막 진입', g.map === 'desert');

console.log('[13] 스테이지 3: 재깍사막');
setPos(13, 16, 'up'); // 보스 떠넘기몬 (13,15)
tap('z'); advanceDialog();
check('떠넘기몬 배틀', g.battle.monId === 'tteonemgimon');
fightWithMercy(4, 0); advanceDialog();
check('떠넘기몬 클리어', g.flags.defeated.tteonemgimon);
setPos(13, 18, 'down');
hold('ArrowDown', 14);
check('정지된 설원 진입', g.map === 'snow');

console.log('[14] 스테이지 4: 정지된 설원');
setPos(13, 16, 'up'); // 보스 홀림몬 (13,15)
tap('z'); advanceDialog();
fightWithMercy(4, 0); advanceDialog();
check('홀림몬 클리어', g.flags.defeated.hollimmon);
setPos(13, 18, 'down');
hold('ArrowDown', 14);
check('그림자성 진입', g.map === 'castle');

console.log('[15] 스테이지 5: 그림자성 (문지기 2 + 최종 보스)');
setPos(10, 9, 'up'); // 메아리몬 (10,8)
tap('z'); advanceDialog();
check('메아리몬 배틀 (복습 풀)', g.battle.monId === 'maearimon' && g.battle.questions.length >= 25);
fightWithMercy(3, 0); advanceDialog();
setPos(9, 5, 'up'); // 그림자몬 (9,4)
tap('z'); advanceDialog();
fightWithMercy(3, 0); advanceDialog();
setPos(9, 3, 'up'); // 어둠대왕몬 (9,2)
tap('z'); advanceDialog();
check('최종 보스전', g.battle.monId === 'finalboss' && g.battle.monMaxHp === 6 && g.battle.maxHearts === 4);
fightWithMercy(6, 0);
advanceDialog();
check('엔딩 진입', g.mode === 'ending');
step(130);
tap('z');
check('엔딩 후 월드 복귀', g.mode === 'world');

console.log('[16] 스테이지 6: 잊혀진 서버실 (숨겨진 통로 + 자비 시스템)');
g.map = 'castle';
setPos(9, 2, 'up'); // 왕좌 자리 → (9,1) 숨겨진 워프
hold('ArrowUp', 14);
check('서버실 진입 + 인트로 연출', g.map === 'serverroom' && g.mode === 'dialog');
advanceDialog();
setPos(7, 9, 'up'); // 뚫림몬 (7,8)
tap('z'); advanceDialog();
fightWithMercy(3, 0);
advanceDialog();
check('뚫림몬 + 자비 누적', g.flags.defeated.tturimmon && g.flags.mercy === 13);
setPos(13, 3, 'up'); // 기록몬 (13,2)
tap('z'); advanceDialog();
fightWithMercy(4, 0);
advanceDialog();
check('기록몬 클리어', g.flags.defeated.girokmon && g.flags.mercy === 14);

console.log('[17] 스테이지 7: 기억의 도서관');
setPos(13, 1, 'up');
hold('ArrowUp', 14);
check('도서관 진입', g.map === 'library');
advanceDialog();
setPos(20, 8, 'up'); // 수집몬 (20,7)
tap('z'); advanceDialog(); fightWithMercy(3, 0); advanceDialog();
setPos(13, 3, 'up'); // 사서몬 (13,2)
tap('z'); advanceDialog(); fightWithMercy(4, 0); advanceDialog();
check('사서몬 클리어', g.flags.defeated.saseomon && g.flags.mercy === 16);

console.log('[18] 스테이지 8: 거울 회랑');
setPos(13, 1, 'up');
hold('ArrowUp', 14);
check('거울 회랑 진입', g.map === 'mirrors');
advanceDialog();
setPos(7, 7, 'up'); // 필터몬 (7,6)
tap('z'); advanceDialog(); fightWithMercy(3, 0); advanceDialog();
setPos(13, 3, 'up'); // 미러몬 (13,2)
tap('z'); advanceDialog(); fightWithMercy(4, 0); advanceDialog();
check('미러몬 클리어', g.flags.defeated.mirrormon && g.flags.mercy === 18);

console.log('[19] 스테이지 9: 속삭임 정원');
setPos(13, 1, 'up');
hold('ArrowUp', 14);
check('정원 진입', g.map === 'garden');
advanceDialog();
setPos(7, 7, 'up'); // 유혹몬 (7,6)
tap('z'); advanceDialog(); fightWithMercy(3, 0); advanceDialog();
setPos(13, 16, 'up'); // 속삭임몬 (13,15)
tap('z'); advanceDialog(); fightWithMercy(4, 0); advanceDialog();
check('속삭임몬 클리어', g.flags.defeated.soksagimon && g.flags.mercy === 20);

console.log('[20] 스테이지 10: 코어 — 영이와 진엔딩');
setPos(13, 18, 'down');
hold('ArrowDown', 14);
check('코어 진입', g.map === 'core');
advanceDialog();
setPos(9, 6, 'up'); // 조각몬 (9,5)
tap('z'); advanceDialog(); fightWithMercy(4, 0); advanceDialog();
check('조각몬 클리어', g.flags.defeated.jogakmon && g.flags.mercy === 21);
setPos(9, 3, 'up'); // 영이 (9,2)
tap('z'); advanceDialog();
check('영이 배틀 (코어 BGM)', g.mode === 'battle' && g.battle.monId === 'yeongi');
fightWithMercy(5, 0); // "함께 돌아가자"
advanceDialog();
check('진엔딩 진입', g.mode === 'ending' && g.endingType === 'true');
check('진엔딩 조건 충족', g.flags.trueEnding === true && g.flags.mercy === 22 && g.flags.endingId === 'home');
step(160);
tap('z');
check('마을로 귀환', g.mode === 'world' && g.map === 'village');

console.log('[21] 진엔딩 후 마을의 영이');
setPos(6, 12, 'left'); // 영이 NPC (5,12)
tap('z');
check('영이와 대화', g.mode === 'dialog');
advanceDialog();

console.log('[22] 저장 데이터 무결성');
const save = JSON.parse(storage.get('ai-ethics-adventure-slot-0'));
check('저장된 증표 3개', save.flags.badges.forest && save.flags.badges.lake && save.flags.badges.cave);
check('모든 보스 처치 저장', save.flags.defeated.hondonmon && save.flags.defeated.meotdaeromon &&
  save.flags.defeated.tteonemgimon && save.flags.defeated.hollimmon && save.flags.defeated.finalboss);
check('심층부 진행 저장', save.flags.defeated.yeongi && save.flags.trueEnding === true &&
  save.flags.mercy === 22);

console.log('[23] 엔딩 분기 로직 (4종)');
const { computeEnding } = vm.runInContext('({ computeEnding })', sandbox);
check('진엔딩: 손 + 자비 20↑', computeEnding('mercy', 22) === 'home');
check('새벽: 맡김 + 자비 14↑', computeEnding('neutral', 16) === 'dawn');
check('작별: 손을 내밀어도 자비 부족이면', computeEnding('mercy', 15) === 'farewell');
check('작별: 차가운 마지막 선택', computeEnding('harsh', 28) === 'farewell');
check('침묵: 자비 6 이하', computeEnding('mercy', 3) === 'silent');
const endingsSeen = JSON.parse(storage.get('ai-ethics-adventure-endings'));
check('엔딩 수집 기록(타이틀 표시용)', endingsSeen.home === true);

console.log('[24] 도감 — 수집 기록 + 열고 닫기');
const dexSeen = JSON.parse(storage.get('ai-ethics-adventure-dex'));
const { DEX_ORDER, MONSTER_DEX } = vm.runInContext('({ DEX_ORDER, MONSTER_DEX })', sandbox);
// 깨운 몬스터는 빠짐없이 도감에 기록되어 있어야 한다
const defeatedIds = Object.keys(g.flags.defeated).filter((id) => g.flags.defeated[id]);
check('깨운 몬스터 전부 도감에 기록', defeatedIds.every((id) => dexSeen[id] && dexSeen[id].seen));
check('미발견 몬스터는 도감에 없음', DEX_ORDER.some((id) => !dexSeen[id]));
check('작별 선택도 기록(영이=mercy)', dexSeen.yeongi.mercy === 'mercy');
check('모든 몬스터 도감 정보 존재', DEX_ORDER.every((id) => MONSTER_DEX[id] && MONSTER_DEX[id].learn));
// 월드에서 C로 도감 열기
check('월드 상태', g.mode === 'world');
tap('c');
check('도감 열림', g.mode === 'dex');
tap('ArrowDown'); tap('ArrowRight');
check('도감에서 커서 이동', g.dex.cursor > 0);
tap('x');
check('도감 닫고 월드 복귀', g.mode === 'world');

console.log('[25] 보기 순서 섞기 (정답이 한 자리에 고정되지 않음)');
check('정답 위치가 여러 곳에 분포', correctPosSeen.size >= 2);

console.log('[26] 오답 복습 노트 (슬롯별)');
// 학습 데이터는 슬롯별 키로 저장된다 (슬롯 0 = 진행 중인 슬롯)
const mistakesBefore = JSON.parse(storage.get('ai-ethics-adventure-mistakes-0') || '{}');
check('틀린 문제가 슬롯 0에 기록됨', Object.keys(mistakesBefore).length > 0);
check('이전 전역 키는 쓰지 않음', !storage.get('ai-ethics-adventure-mistakes'));
check('월드 상태', g.mode === 'world');
tap('v');
check('복습 노트 열림', g.mode === 'review' && g.review.phase === 'list');
check('복습 노트가 슬롯 0 사용', g.review.slot === 0);
check('복습 목록에 항목 있음', g.review.ids.length > 0);
tap('z'); // 첫 문제 풀기
check('복습 문제 화면', g.review.phase === 'question');
{
  const m = JSON.parse(storage.get('ai-ethics-adventure-mistakes-0'))[g.review.ids[g.review.cursor]];
  const target = g.review.choiceOrder.indexOf(m.c);
  while (g.review.qCursor !== target) tap('ArrowDown');
}
tap('z'); // 제출
check('복습 정답 처리', g.review.phase === 'feedback' && g.review.feedback.correct === true);
const reviewIdsBefore = g.review.ids.length;
tap('z'); // 목록으로
check('맞춘 문제는 목록에서 제거', g.review.ids.length === reviewIdsBefore - 1);
tap('x');
check('복습 노트 닫힘', g.mode === 'world');

console.log('[27] 설정·일시정지 메뉴');
check('월드 상태', g.mode === 'world');
tap('x');
check('설정 메뉴 열림', g.mode === 'pause');
check('초기 커서 0 (수호자 일지)', g.pauseCursor === 0);
const PAUSE_ORDER = ['journal', 'cards', 'halloffame', 'dashboard', 'awards', 'cosmetics', 'cert',
  'challenge', 'review', 'dex', 'quizedit', 'backup', 'difficulty', 'textspeed', 'tts',
  'largetext', 'colorblind', 'mute', 'help', 'close'];
const pauseIdx = (name) => PAUSE_ORDER.indexOf(name);
while (g.pauseCursor !== pauseIdx('dex')) tap('ArrowDown');
tap('z');
check('설정에서 도감 열림', g.mode === 'dex' && g.dex.ret === 'pause');
tap('x');
check('도감 닫고 설정으로 복귀', g.mode === 'pause');
while (g.pauseCursor !== pauseIdx('textspeed')) tap('ArrowDown');
const speedBefore = g.textSpeed;
tap('z');
check('자막 속도 변경', g.textSpeed !== speedBefore);
while (g.pauseCursor !== pauseIdx('largetext')) tap('ArrowDown');
const largeBefore = g.largeText;
tap('z');
check('큰 글씨 토글', g.largeText !== largeBefore);
tap('z'); // 원래대로 되돌림
check('큰 글씨 복원', g.largeText === largeBefore);
while (g.pauseCursor !== pauseIdx('mute')) tap('ArrowDown');
const { Sound } = vm.runInContext('({ Sound })', sandbox);
const mutedBefore = Sound.muted;
tap('z');
check('음소거 토글', Sound.muted !== mutedBefore);
tap('z'); // 원래대로 되돌림
check('음소거 복원', Sound.muted === mutedBefore);
tap('x'); // X로 설정 닫기
check('설정 메뉴 닫힘', g.mode === 'world');

console.log('[28] 50:50 힌트');
check('월드 상태', g.mode === 'world');
const { MONSTERS, QUIZZES } = vm.runInContext('({ MONSTERS, QUIZZES })', sandbox);
const hintQ = Object.assign({}, QUIZZES.privacy[0], { _topic: 'privacy', _qid: 'privacy#0' });
g.mode = 'battle';
g.battle = {
  monId: 'bekkyeomon', mon: MONSTERS.bekkyeomon,
  monHp: 3, monMaxHp: 3, playerHp: 3, maxHearts: 3,
  questions: [hintQ], qIdx: 0, phase: 'question', cursor: 0,
  choiceOrder: [0, 1, 2], correctPos: hintQ.c, hintUsed: false, hiddenPos: -1,
  feedback: null, shake: 0, flash: 0, attack: null, dodgeDone: true, dodge: null,
};
tap('h');
check('힌트 사용됨', g.battle.hintUsed === true);
check('정답은 가려지지 않음', g.battle.hiddenPos !== g.battle.correctPos && g.battle.hiddenPos !== -1);
let hitHidden = false;
for (let i = 0; i < 6; i++) { tap('ArrowDown'); if (g.battle.cursor === g.battle.hiddenPos) hitHidden = true; }
check('커서가 가려진 보기를 건너뜀', !hitHidden);
const hiddenBefore = g.battle.hiddenPos;
tap('h');
check('힌트는 한 번만 사용 가능', g.battle.hiddenPos === hiddenBefore);
g.mode = 'world';
g.battle = null;

console.log('[29] 학습 진척도·수호자 일지 (E, 슬롯별)');
// 앞선 배틀/복습에서 주제별 통계가 슬롯 0에 쌓였는지
const stats = JSON.parse(storage.get('ai-ethics-adventure-stats-0') || '{}');
check('주제별 통계가 슬롯 0에 기록됨', Object.keys(stats).length > 0);
check('이전 전역 통계 키는 쓰지 않음', !storage.get('ai-ethics-adventure-stats'));
check('통계에 정답/시도 수가 있음',
  Object.values(stats).every((e) => typeof e.correct === 'number' && typeof e.total === 'number' && e.total >= e.correct));
check('월드 상태', g.mode === 'world');
tap('j');
check('수호자 일지 열림', g.mode === 'journal' && g.journal.slot === 0);
tap('ArrowDown'); // 스크롤(목록이 짧으면 변화 없을 수 있음)
tap('x');
check('일지 닫고 월드 복귀', g.mode === 'world');

console.log('[30] 교실용 학습 리포트 (F)');
const { buildReportText } = vm.runInContext('({ buildReportText: window.__test.buildReportText })', sandbox);
const report = buildReportText(0);
check('리포트에 제목 포함', /학습 리포트/.test(report));
check('리포트에 정답률 포함', /푼 문제/.test(report) && /정답/.test(report));
check('리포트에 주제별 정답률 포함', /주제별 정답률/.test(report));

console.log('[31] 자유 퀴즈 챌린지 (G)');
check('월드 상태', g.mode === 'world');
tap('q');
check('챌린지 주제 선택 열림', g.mode === 'challenge' && g.challenge.phase === 'topic');
check('챌린지가 슬롯 0 사용', g.challenge.slot === 0);
check('주제 목록 존재', g.challenge.topics.length > 0);
// 0=오늘의 도전, 1=맞춤 학습, 2=전체 랜덤 — 전체 랜덤으로 이동해 시작
tap('ArrowDown'); tap('ArrowDown');
check('전체 랜덤 선택', g.challenge.sel === 2);
tap('z'); // 전체 랜덤 시작
check('퀴즈 시작', g.challenge.phase === 'quiz');
check('문항 10개 이하로 출제', g.challenge.questions.length > 0 && g.challenge.questions.length <= 10);
// 10문제를 모두 정답으로 풀어 결과 화면까지
let guard = 0;
while (g.mode === 'challenge' && g.challenge.phase !== 'result' && guard++ < 60) {
  if (g.challenge.phase === 'quiz') {
    const q = g.challenge.questions[g.challenge.idx];
    const target = g.challenge.choiceOrder.indexOf(q.c);
    while (g.challenge.cursor !== target) tap('ArrowDown');
    tap('z'); // 제출 → feedback
  } else if (g.challenge.phase === 'feedback') {
    tap('z'); // 다음
  }
}
check('결과 화면 도달', g.challenge && g.challenge.phase === 'result');
check('전부 맞히면 만점', g.challenge.score === g.challenge.questions.length);
const meta0 = JSON.parse(storage.get('ai-ethics-adventure-meta-0') || '{}');
check('챌린지 결과가 메타에 기록', meta0.challengeRuns >= 1 && meta0.challengeBest === g.challenge.questions.length);
tap('z'); // 닫기 → world (ret)
check('챌린지 닫고 복귀', g.mode === 'world');

console.log('[32] 도전과제 (업적)');
const { countAchievements } = vm.runInContext('({ countAchievements: window.__test.countAchievements })', sandbox);
check('진엔딩까지 깬 슬롯은 도전과제 다수 달성', countAchievements(0) >= 6);
check('월드 상태', g.mode === 'world');
tap('b');
check('도전과제 화면 열림', g.mode === 'awards' && g.awards.slot === 0);
tap('x');
check('도전과제 닫고 월드 복귀', g.mode === 'world');

console.log('[33] 접근성 — 색약 모드 토글');
const cbBefore = g.colorBlind;
tap('x'); // 메뉴 열기
check('메뉴 열림', g.mode === 'pause');
while (g.pauseCursor !== pauseIdx('colorblind')) tap('ArrowDown');
tap('z');
check('색약 모드 토글', g.colorBlind !== cbBefore);
const savedSettings = JSON.parse(storage.get('ai-ethics-adventure-settings') || '{}');
check('색약 설정이 저장됨', savedSettings.colorBlind === g.colorBlind);
tap('z'); // 복원
check('색약 모드 복원', g.colorBlind === cbBefore);
tap('x'); // 닫기
check('메뉴 닫힘', g.mode === 'world');

console.log('[34] 도움말 화면');
tap('i');
check('도움말 열림', g.mode === 'help');
tap('z');
check('도움말 닫고 월드 복귀', g.mode === 'world');

console.log('[35] 슬롯별 학습 데이터 분리');
// 슬롯 1에 기록해도 슬롯 0의 학습 기록과 섞이지 않아야 한다
const { recordTopicResult } = vm.runInContext('({ recordTopicResult: window.__test.recordTopicResult })', sandbox);
recordTopicResult(1, 'privacy', false); // 슬롯 1에 두 문제 기록
recordTopicResult(1, 'privacy', true);
const s0 = JSON.parse(storage.get('ai-ethics-adventure-stats-0') || '{}');
const s1 = JSON.parse(storage.get('ai-ethics-adventure-stats-1') || '{}');
check('슬롯 1 통계가 따로 쌓임', s1.privacy && s1.privacy.total === 2);
check('슬롯 0과 슬롯 1 통계가 분리됨', JSON.stringify(s0) !== JSON.stringify(s1));
// 슬롯 1 삭제 시 학습 데이터도 함께 지워지는지
deleteSlotViaGame(1);
check('슬롯 1 삭제 시 통계도 삭제', !storage.get('ai-ethics-adventure-stats-1'));
function deleteSlotViaGame(slot) {
  g.mode = 'title'; g.titleScreen = 'delete'; g.slotCursor = slot;
  tap('z'); // 삭제 확정
}
g.mode = 'world';

console.log('[36] 데이터 백업·복원 (내보내기·가져오기)');
const T = vm.runInContext('window.__test', sandbox);
const backupText = T.buildBackupText();
const backupObj = JSON.parse(backupText);
check('백업에 앱 식별자 포함', backupObj.app === 'ai-ethics-adventure');
check('백업에 슬롯 0 세이브 포함', !!backupObj.data['ai-ethics-adventure-slot-0']);
check('백업에 슬롯 0 통계 포함', !!backupObj.data['ai-ethics-adventure-stats-0']);
// 데이터를 망가뜨린 뒤 복원
const goodStats = storage.get('ai-ethics-adventure-stats-0');
storage.set('ai-ethics-adventure-stats-0', '{}');
const res = T.applyBackup(backupText);
check('복원 성공', res.ok === true && res.count >= 2);
check('통계가 복원됨', storage.get('ai-ethics-adventure-stats-0') === goodStats);
check('잘못된 데이터는 거부', T.applyBackup('{"app":"other"}').ok === false);
check('깨진 JSON은 거부', T.applyBackup('not json').ok === false);

console.log('[37] 적응형(맞춤) 학습 — 약점 집중 출제');
const adaptive = T.buildAdaptivePool(0, 8);
check('맞춤 풀 생성', adaptive.length > 0 && adaptive.length <= 8);
check('맞춤 풀 항목 형식', adaptive.every((q) => q.q && q.a && typeof q.c === 'number' && q._topic && q._qid));
check('맞춤 풀 중복 문제 없음', new Set(adaptive.map((q) => q._qid)).size === adaptive.length);

console.log('[38] 오늘의 도전 + 연속 출석(스트릭)');
const d1 = T.buildDailyPool(0, '2026-06-15', 10).map((q) => q._qid).join(',');
const d2 = T.buildDailyPool(0, '2026-06-15', 10).map((q) => q._qid).join(',');
const d3 = T.buildDailyPool(0, '2026-06-16', 10).map((q) => q._qid).join(',');
check('같은 날짜는 같은 문제(결정적)', d1 === d2);
check('다른 날짜는 다른 문제 구성', d1 !== d3);
T.recordPlayDay(0, '2026-06-10');
check('출석 첫날 스트릭 1', T.getMeta(0).streak === 1);
T.recordPlayDay(0, '2026-06-11');
check('이어서 오면 스트릭 2', T.getMeta(0).streak === 2);
T.recordPlayDay(0, '2026-06-11'); // 같은 날 중복 → 변화 없음
check('같은 날 중복은 그대로', T.getMeta(0).streak === 2);
T.recordPlayDay(0, '2026-06-14'); // 건너뜀 → 리셋
check('건너뛰면 스트릭 리셋', T.getMeta(0).streak === 1);
check('최고 스트릭 보존', T.getMeta(0).bestStreak >= 2);
T.recordDailyDone(0, 8, 10, '2026-06-14');
check('오늘의 도전 완료 기록', T.getMeta(0).lastDailyDay === '2026-06-14' && T.getMeta(0).dailyBest === 8);

console.log('[39] 수집·꾸미기 보상 (칭호·테마)');
check('진엔딩까지 깬 슬롯은 보상 다수 해금', T.unlockedCount(0) >= 4);
g.mode = 'world';
tap('k');
check('꾸미기 화면 열림', g.mode === 'cosmetics' && g.cosmetics.slot === 0);
tap('z'); // col 0(칭호) row 0(새내기 수호자, 항상 해금) 적용
check('칭호 적용됨', T.getCosmetic(0).title === 'rookie');
tap('ArrowRight'); // 테마 칼럼으로
tap('z'); // 테마 row 0(클래식, 항상 해금) 적용
check('테마 적용됨', T.getCosmetic(0).theme === 'classic');
tap('x');
check('꾸미기 닫고 월드 복귀', g.mode === 'world');

console.log('[40] 보너스 지역: AI 미래연구소 (새 주제·새 몬스터)');
g.map = 'village';
setPos(26, 9, 'up');
hold('ArrowUp', 14); // 빛나는 문(26,8)으로 → 미래연구소 워프
check('미래연구소 진입', g.map === 'lab');
if (g.mode === 'dialog') advanceDialog(); // 첫 방문 인트로
setPos(4, 5, 'up'); // 환각몬 (4,4)
tap('z'); advanceDialog();
check('환각몬 배틀 (생성형 AI 주제)', g.mode === 'battle' && g.battle.monId === 'hwangakmon');
fightAndWin(3); // 보너스 몬스터는 마음의 선택이 없음
check('환각몬 깨우침(자비 증가 없음)', g.flags.defeated.hwangakmon === true);
if (g.mode === 'dialog') advanceDialog();
const dexSeen2 = JSON.parse(storage.get('ai-ethics-adventure-dex'));
check('보너스 몬스터도 도감에 기록', dexSeen2.hwangakmon && dexSeen2.hwangakmon.seen);

console.log('[41] 교사용 대시보드');
g.mode = 'world';
tap('p');
check('대시보드 열림', g.mode === 'dashboard');
tap('x');
check('대시보드 닫고 월드 복귀', g.mode === 'world');

console.log('[42] 커스텀 퀴즈 편집·가져오기');
const goodQuiz = JSON.stringify({ questions: [
  { q: '커스텀 문제?', a: ['보기1', '보기2', '보기3'], c: 0, why: '해설입니다' },
  { q: '형식이 틀린 문제', a: ['하나만'], c: 5 }, // 무효 → 걸러짐
] });
const cq = T.importCustomQuizzes(goodQuiz);
check('유효 문항만 등록', cq.ok === true && cq.count === 1);
check('커스텀 문제 저장됨', T.getCustomQuizzes().length === 1);
check('챌린지 주제에 커스텀 등장', T.challengeTopics().some((t) => t.key === 'custom'));
check('빈 목록 가져오기 거부', T.importCustomQuizzes('[]').ok === false);
check('깨진 JSON 거부', T.importCustomQuizzes('nope').ok === false);
check('양식 템플릿 생성', /questions/.test(T.customQuizTemplate()));
T.clearCustomQuizzes();
check('커스텀 문제 모두 삭제', T.getCustomQuizzes().length === 0);
check('삭제 후 챌린지에서 커스텀 사라짐', !T.challengeTopics().some((t) => t.key === 'custom'));

console.log('[43] 학년별 난이도 모드');
g.mode = 'world';
const diffBefore = g.difficulty;
tap('x');
while (g.pauseCursor !== pauseIdx('difficulty')) tap('ArrowDown');
tap('z');
check('난이도 변경됨', g.difficulty !== diffBefore);
check('난이도 설정 저장', JSON.parse(storage.get('ai-ethics-adventure-settings')).difficulty === g.difficulty);
tap('x');
// 고학년: 50:50 힌트 비활성 / 저학년: 힌트 재사용 가능
const mkHintBattle = () => {
  const hq = Object.assign({}, QUIZZES.privacy[0], { _topic: 'privacy', _qid: 'privacy#0' });
  g.mode = 'battle';
  g.battle = { monId: 'bekkyeomon', mon: MONSTERS.bekkyeomon, monHp: 3, monMaxHp: 3,
    playerHp: 3, maxHearts: 3, questions: [hq], qIdx: 0, phase: 'question', cursor: 0,
    choiceOrder: [0, 1, 2], correctPos: hq.c, hintUsed: false, hiddenPos: -1,
    feedback: null, shake: 0, flash: 0, attack: null, dodgeDone: true, dodge: null };
};
g.difficulty = 'hard'; mkHintBattle();
tap('h');
check('고학년은 힌트 비활성', g.battle.hintUsed === false && g.battle.hiddenPos === -1);
g.difficulty = 'easy'; mkHintBattle();
tap('h');
check('저학년도 힌트 동작', g.battle.hintUsed === true && g.battle.hiddenPos !== -1);
g.battle.hiddenPos = -1; // 다시 사용 가능한지 확인
tap('h');
check('저학년은 힌트 재사용 가능', g.battle.hiddenPos !== -1);
g.difficulty = 'normal'; g.mode = 'world'; g.battle = null;

console.log('[44] 읽어주기(TTS) 접근성 토글');
const ttsBefore = g.tts;
tap('x');
while (g.pauseCursor !== pauseIdx('tts')) tap('ArrowDown');
tap('z');
check('읽어주기 토글', g.tts !== ttsBefore);
check('읽어주기 설정 저장', JSON.parse(storage.get('ai-ethics-adventure-settings')).tts === g.tts);
tap('z'); // 복원
check('읽어주기 복원', g.tts === ttsBefore);
tap('x');
check('메뉴 닫힘', g.mode === 'world');

console.log('[45] 학습 카드 컬렉션');
check('카드 데이터 존재', Array.isArray(T.LEARN_CARDS) && T.LEARN_CARDS.length >= 20);
T.recordTopicResult(2, 'privacy', true);
check('주제 정답 시 카드 해금', T.cardUnlocked(2, 'privacy') === true);
check('안 푼 주제는 잠김', T.cardUnlocked(2, 'deepfake') === false);
check('해금 카드 수 집계', T.collectedCards(2) >= 1);
T.recordTopicResult(2, 'privacy', false); // 틀려도 이미 해금된 카드는 유지
check('이미 해금된 카드는 유지', T.cardUnlocked(2, 'privacy') === true);
g.mode = 'world';
tap('l');
check('배움 카드 화면 열림', g.mode === 'cards');
tap('ArrowDown'); tap('ArrowUp');
tap('x');
check('배움 카드 닫고 월드 복귀', g.mode === 'world');

console.log('[46] 수료증·진도 인증서');
const certText = T.buildCertText(0);
check('수료증 텍스트 생성', typeof certText === 'string' && certText.includes('수료증'));
check('수료증에 정답률·진행도 포함', certText.includes('정답률') && certText.includes('진행도'));
g.mode = 'world';
tap('n');
check('수료증 화면 열림', g.mode === 'cert');
tap('z'); // 클립보드 복사 시도(샌드박스에선 토스트만)
tap('x');
check('수료증 닫고 월드 복귀', g.mode === 'world');

console.log('[47] 명예의 전당 (로컬 기록)');
check('전당 부문 정의', Array.isArray(T.HOF_CATS) && T.HOF_CATS.length >= 4);
g.mode = 'world';
tap('f');
check('명예의 전당 열림', g.mode === 'hof');
tap('ArrowDown');
check('부문 이동', g.hof.cat === 1);
tap('x');
check('전당 닫고 월드 복귀', g.mode === 'world');

console.log('[48] 미니게임·보스 패턴 확장');
const { BOSS_ATTACKS } = vm.runInContext('({ BOSS_ATTACKS })', sandbox);
const patterns = Object.values(BOSS_ATTACKS).map((a) => a.pattern);
check('나선형 패턴 존재', patterns.includes('spiral'));
check('빈틈 벽 패턴 존재', patterns.includes('wall'));
check('지그재그 패턴 존재', patterns.includes('zigzag'));
check('보너스 몬스터도 회피 패턴 보유', BOSS_ATTACKS.miraemon && BOSS_ATTACKS.miraemon.pattern === 'spiral');

console.log('[49] 이름 입력 정제');
check('앞뒤 공백 제거', T.sanitizeName('  도도  ') === '도도');
check('공백만 입력은 기본값', T.sanitizeName('     ') === '수호자');
check('제로폭 문자만 입력은 기본값', T.sanitizeName('​‌﻿') === '수호자');
check('제어문자 제거', T.sanitizeName('도 도\n') === '도도');
check('최대 6글자', T.sanitizeName('일이삼사오육칠팔') === '일이삼사오육');
check('연속 공백 1칸으로', T.sanitizeName('가   나') === '가 나');
check('빈/널 입력은 기본값', T.sanitizeName('') === '수호자' && T.sanitizeName(null) === '수호자');

console.log('[50] 저장 가능 여부 프로브');
check('정상 환경은 저장 가능 판정', T.probeStorage() === true && T.getStorageOk() === true);

console.log(`\n✔ 스모크 테스트 통과 (${passed}개 검사)`);
