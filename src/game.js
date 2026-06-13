// AI 윤리 어드벤처 - 메인 게임 엔진
(() => {
  'use strict';

  const TILE = 16;
  const SCALE = 3;
  const TS = TILE * SCALE; // 48px
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const VIEW_W = Math.floor(canvas.width / TS); // 15
  const VIEW_H = Math.floor(canvas.height / TS); // 11
  ctx.imageSmoothingEnabled = false;

  const SAVE_KEY = 'ai-ethics-adventure-v1';

  // ---------- 상태 ----------
  const game = {
    mode: 'title', // title | world | dialog | battle | ending
    map: 'village',
    player: {
      x: 13, y: 16,       // 타일 좌표
      px: 13 * TS, py: 16 * TS, // 픽셀 좌표(보간)
      dir: 'up',
      moving: false,
      step: 0,            // 걷기 애니메이션
    },
    flags: null,
    dialog: null, // { lines, idx, chars, speaker, onEnd }
    battle: null,
    time: 0,
    titleCursor: 0,
    endingT: 0,
    dex: { cursor: 0, ret: 'title' },
    titleScreen: 'slots', // slots | name | delete
    slotCursor: 0,
    currentSlot: 0,
    playerName: '수호자',
    nameConfirm: false,
    nameCancel: false,
  };

  const SLOT_COUNT = 3;

  function newFlags() {
    return {
      talkedProf: false,
      badges: { forest: false, lake: false, cave: false },
      defeated: {
        bekkyeomon: false, mollaemon: false, jungdokmon: false,
        geojitmon: false, pyeonhyangmon: false, hondonmon: false,
        akpeulmon: false, gatimmon: false, meotdaeromon: false,
        pungpungmon: false, kkamkkammon: false, tteonemgimon: false,
        sideulmon: false, ppaeatmon: false, hollimmon: false,
        maearimon: false, geurimjamon: false, finalboss: false,
        tturimmon: false, girokmon: false, sujipmon: false,
        saseomon: false, piltermon: false, mirrormon: false,
        yuhokmon: false, soksagimon: false, jogakmon: false,
        yeongi: false,
      },
      mercy: 0,        // 마음을 안아준 횟수 (스테이지 6~)
      visited: {},     // 맵 인트로 연출 1회 표시용
      trueEnding: false,
      correctCount: 0,
      battleCount: 0,
    };
  }

  // ---------- 세이브 슬롯 (3개) ----------
  function slotKey(i) { return 'ai-ethics-adventure-slot-' + i; }

  function loadSlot(i) {
    try {
      const raw = localStorage.getItem(slotKey(i));
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function writeSlot(i, data) {
    try { localStorage.setItem(slotKey(i), JSON.stringify(data)); }
    catch (e) { /* 저장 불가 환경이면 무시 */ }
  }

  function deleteSlot(i) {
    try { localStorage.removeItem(slotKey(i)); } catch (e) { /* 무시 */ }
  }

  // 기존 단일 세이브를 슬롯 0으로 1회 이전한다.
  function migrateOldSave() {
    let old = null;
    try { const r = localStorage.getItem(SAVE_KEY); old = r ? JSON.parse(r) : null; } catch (e) { old = null; }
    if (old && old.flags && !loadSlot(0)) {
      writeSlot(0, { name: '수호자', map: old.map, x: old.x, y: old.y, flags: old.flags, updatedAt: Date.now() });
      try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* 무시 */ }
    }
  }

  function save() {
    writeSlot(game.currentSlot, {
      name: game.playerName,
      map: game.map,
      x: game.player.x, y: game.player.y,
      flags: game.flags,
      updatedAt: Date.now(),
    });
  }

  // 슬롯 요약 (타이틀 표시용). 없으면 null.
  function slotSummary(i) {
    const s = loadSlot(i);
    if (!s || !s.flags) return null;
    return {
      name: s.name || '수호자',
      stage: getStage(s.flags),
      mercy: s.flags.mercy || 0,
      done: !!(s.flags.defeated && s.flags.defeated.yeongi),
      endingId: s.flags.endingId || null,
    };
  }

  // 발견한 엔딩 기록 — 세이브와 별개로, 게임을 다시 시작해도 남는다
  const ENDINGS_KEY = 'ai-ethics-adventure-endings';
  function getEndingsSeen() {
    try { return JSON.parse(localStorage.getItem(ENDINGS_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function recordEndingSeen(id) {
    try {
      const seen = getEndingsSeen();
      seen[id] = true;
      localStorage.setItem(ENDINGS_KEY, JSON.stringify(seen));
    } catch (e) { /* 저장 불가 환경이면 무시 */ }
  }

  // 도감 — 깨우친 몬스터 기록. 세이브와 별개로 누적 보존된다.
  const DEX_KEY = 'ai-ethics-adventure-dex';
  function getDexSeen() {
    try { return JSON.parse(localStorage.getItem(DEX_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function recordDexSeen(monId, mercyKind) {
    try {
      const seen = getDexSeen();
      seen[monId] = { seen: true, mercy: mercyKind || (seen[monId] && seen[monId].mercy) || null };
      localStorage.setItem(DEX_KEY, JSON.stringify(seen));
    } catch (e) { /* 저장 불가 환경이면 무시 */ }
  }
  function dexSeenCount() {
    const seen = getDexSeen();
    return DEX_ORDER.filter((id) => seen[id] && seen[id].seen).length;
  }

  // ---------- 입력 ----------
  const held = new Set();
  const pressed = new Set();
  const KEYMAP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    W: 'up', S: 'down', A: 'left', D: 'right',
    z: 'action', Z: 'action', ' ': 'action', Enter: 'action',
    x: 'cancel', X: 'cancel', Escape: 'cancel',
    c: 'menu', C: 'menu',
  };

  window.addEventListener('keydown', (e) => {
    // 이름 입력 중에는 게임 키 매핑을 막지 않는다 (한글 IME 사용)
    if (game.mode === 'title' && game.titleScreen === 'name') return;
    Sound.resume();
    if (e.key === 'm' || e.key === 'M') { Sound.toggleMute(); return; }
    const k = KEYMAP[e.key];
    if (!k) return;
    e.preventDefault();
    if (!held.has(k)) pressed.add(k);
    held.add(k);
  });
  window.addEventListener('keyup', (e) => {
    const k = KEYMAP[e.key];
    if (k) held.delete(k);
  });

  // 터치 컨트롤
  if ('ontouchstart' in window) {
    document.body.classList.add('touch');
    const bind = (id, key) => {
      const el = document.getElementById(id);
      const down = (e) => { e.preventDefault(); Sound.resume(); if (!held.has(key)) pressed.add(key); held.add(key); };
      const up = (e) => { e.preventDefault(); held.delete(key); };
      el.addEventListener('touchstart', down);
      el.addEventListener('touchend', up);
      el.addEventListener('touchcancel', up);
    };
    bind('t-up', 'up'); bind('t-down', 'down');
    bind('t-left', 'left'); bind('t-right', 'right');
    bind('t-a', 'action');
    bind('t-menu', 'menu');
  }

  function justPressed(k) { return pressed.has(k); }

  // ---------- 이름 입력 오버레이 (HTML, 한글 IME 지원) ----------
  const nameOverlay = document.getElementById('name-overlay');
  const nameInput = document.getElementById('name-input');
  const hasRealInput = !!(nameInput && 'value' in nameInput);

  function showNameEntry() {
    game.titleScreen = 'name';
    game.nameConfirm = false;
    game.nameCancel = false;
    if (hasRealInput) nameInput.value = '';
    if (nameOverlay && nameOverlay.style) nameOverlay.style.display = 'flex';
    if (nameInput && nameInput.focus) setTimeout(() => { try { nameInput.focus(); } catch (e) {} }, 0);
  }

  function hideNameEntry() {
    if (nameOverlay && nameOverlay.style) nameOverlay.style.display = 'none';
    if (nameInput && nameInput.blur) { try { nameInput.blur(); } catch (e) {} }
  }

  function currentNameValue() {
    const v = hasRealInput ? String(nameInput.value || '') : '';
    return v.trim().slice(0, 6) || '수호자';
  }

  if (nameInput && nameInput.addEventListener) {
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); game.nameConfirm = true; }
      else if (e.key === 'Escape') { e.preventDefault(); game.nameCancel = true; }
      e.stopPropagation();
    });
  }
  const nameGo = document.getElementById('name-go');
  if (nameGo && nameGo.addEventListener) {
    nameGo.addEventListener('click', () => { game.nameConfirm = true; });
  }

  // ---------- 타일 ----------
  const SOLID = (ch) => !WALKABLE.has(ch);

  function tileAt(mapId, x, y) {
    const m = MAPS[mapId];
    if (y < 0 || y >= m.tiles.length) return 'T';
    const row = m.tiles[y];
    if (x < 0 || x >= row.length) return 'T';
    return row[x];
  }

  function npcVisible(npc) {
    return !npc.show || npc.show(game.flags);
  }

  function npcAt(mapId, x, y) {
    return MAPS[mapId].npcs.find((n) => n.x === x && n.y === y && npcVisible(n)) || null;
  }

  function monsterAt(mapId, x, y) {
    return MAPS[mapId].monsters.find(
      (mo) => mo.x === x && mo.y === y && !game.flags.defeated[mo.id]
    ) || null;
  }

  function signAt(mapId, x, y) {
    return MAPS[mapId].signs.find((s) => s.x === x && s.y === y) || null;
  }

  function warpAt(mapId, x, y) {
    return MAPS[mapId].warps.find((w) => w.x === x && w.y === y) || null;
  }

  // 타일 그리기 (절차적 도트)
  const tileCache = new Map();
  function tileCanvas(ch, frame) {
    const key = ch + frame;
    let cv = tileCache.get(key);
    if (cv) return cv;
    cv = document.createElement('canvas');
    cv.width = TS; cv.height = TS;
    const c = cv.getContext('2d');
    const px = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x * SCALE, y * SCALE, w * SCALE, h * SCALE); };
    // 결정적 의사난수
    const rnd = (seed) => { const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };

    switch (ch) {
      case 'G': { // 풀 — 차분한 녹색 + 결 텍스처
        px(0, 0, 16, 16, '#4f7a44');
        for (let i = 0; i < 12; i++) {
          const x = Math.floor(rnd(i + 1) * 16), y = Math.floor(rnd(i + 51) * 16);
          px(x, y, 1, 1, i % 3 ? '#456e3b' : '#5d8a50');
        }
        // 작은 풀잎
        px(3, 11, 1, 2, '#5d8a50'); px(4, 12, 1, 1, '#5d8a50');
        px(11, 5, 1, 2, '#456e3b');
        break;
      }
      case 'P': { // 길 — 부드러운 흙
        px(0, 0, 16, 16, '#b8a06e');
        for (let i = 0; i < 8; i++) {
          const x = Math.floor(rnd(i + 7) * 15), y = Math.floor(rnd(i + 77) * 15);
          px(x, y, 2, 1, i % 2 ? '#a8915f' : '#c4ad7c');
        }
        break;
      }
      case 'F': { // 꽃
        px(0, 0, 16, 16, '#4f7a44');
        const cols = ['#e8718f', '#f0c850', '#f2ede0'];
        for (let i = 0; i < 3; i++) {
          const x = 2 + Math.floor(rnd(i + 3) * 11), y = 2 + Math.floor(rnd(i + 33) * 11);
          px(x, y, 2, 2, cols[i]);
          px(x, y, 1, 1, '#ffffff55');
        }
        break;
      }
      case 'T': { // 나무 — 둥근 음영
        px(0, 0, 16, 16, '#4f7a44');
        px(3, 1, 10, 2, '#2f6b38');
        px(2, 2, 12, 6, '#327339');
        px(1, 4, 14, 4, '#2f6b38');
        px(3, 3, 4, 2, '#3f8a48'); // 하이라이트
        px(9, 5, 3, 2, '#3f8a48');
        px(2, 8, 12, 2, '#26572e'); // 아랫부분 그늘
        px(6, 10, 4, 5, '#6b4a2c');
        px(6, 10, 1, 5, '#7d5836');
        px(6, 15, 4, 1, '#4f361f');
        break;
      }
      case 'W': { // 물(2프레임 애니메이션)
        px(0, 0, 16, 16, '#3a7fc0');
        const off = frame ? 2 : 0;
        for (let i = 0; i < 5; i++) {
          const y = (i * 3 + off) % 15;
          const x = Math.floor(rnd(i + 13) * 9);
          px(x, y, 4, 1, '#5fa3de');
          px(x + 5, y, 2, 1, '#4f95d4');
        }
        break;
      }
      case 'B': { // 다리
        px(0, 0, 16, 16, '#3a7fc0');
        px(1, 0, 14, 16, '#9a6f3e');
        px(1, 0, 14, 1, '#7c5830');
        for (let y = 3; y < 16; y += 4) px(1, y, 14, 1, '#7c5830');
        px(0, 0, 1, 16, '#6b4a28');
        px(15, 0, 1, 16, '#6b4a28');
        break;
      }
      case 'S': { // 모래
        px(0, 0, 16, 16, '#e0cf9c');
        for (let i = 0; i < 7; i++) {
          px(Math.floor(rnd(i + 5) * 15), Math.floor(rnd(i + 55) * 15), 1, 1, i % 2 ? '#d0bd86' : '#ecdcaa');
        }
        break;
      }
      case 'O': { // 지붕
        px(0, 0, 16, 16, '#b3493a');
        px(0, 0, 16, 3, '#c8584688');
        for (let y = 3; y < 16; y += 4) px(0, y, 16, 1, '#963c30');
        px(0, 0, 1, 16, '#963c30');
        px(15, 0, 1, 16, '#963c30');
        break;
      }
      case 'H': { // 벽
        px(0, 0, 16, 16, '#e4d8c0');
        px(0, 0, 16, 2, '#ccbfa4');
        for (let y = 4; y < 16; y += 6) {
          px(0, y, 16, 1, '#ccbfa4');
        }
        px(2, 6, 4, 5, '#79c0e0'); // 창문
        px(10, 6, 4, 5, '#79c0e0');
        px(2, 6, 4, 1, '#58a4c8');
        px(10, 6, 4, 1, '#58a4c8');
        px(2, 6, 1, 5, '#9ad6f0');
        px(10, 6, 1, 5, '#9ad6f0');
        break;
      }
      case 'D': { // 문
        px(0, 0, 16, 16, '#e4d8c0');
        px(3, 2, 10, 14, '#7c5830');
        px(4, 3, 8, 13, '#9a6f3e');
        px(4, 3, 1, 13, '#ad8049');
        px(10, 9, 2, 2, '#f0c850');
        break;
      }
      case '1': { // 탑 문(빛나는 문)
        px(0, 0, 16, 16, '#e4d8c0');
        px(3, 1, 10, 15, '#3a3352');
        px(4, 2, 8, 14, '#564d7a');
        px(6, 4, 4, 7, frame ? '#f0c850' : '#fae29a');
        px(7, 5, 1, 4, '#fff2c8');
        break;
      }
      case 'Y': { // 표지판
        px(0, 0, 16, 16, '#4f7a44');
        px(2, 2, 12, 8, '#9a6f3e');
        px(3, 3, 10, 6, '#bb9258');
        px(4, 5, 8, 1, '#6b4a28');
        px(4, 7, 6, 1, '#6b4a28');
        px(7, 10, 2, 5, '#7c5830');
        break;
      }
      case 'R': { // 바위
        px(0, 0, 16, 16, '#4f7a44');
        px(3, 6, 10, 8, '#8a90a2');
        px(4, 4, 8, 2, '#9aa0b2');
        px(3, 12, 10, 2, '#6f7588'); // 그림자
        px(4, 5, 4, 3, '#b2b8c8'); // 하이라이트
        break;
      }
      case 'C': { // 동굴 바닥
        px(0, 0, 16, 16, '#3d3850');
        for (let i = 0; i < 7; i++) {
          px(Math.floor(rnd(i + 9) * 15), Math.floor(rnd(i + 99) * 15), 1, 1, i % 2 ? '#4a4560' : '#322d44');
        }
        break;
      }
      case 'K': { // 동굴 벽
        px(0, 0, 16, 16, '#241f33');
        px(0, 13, 16, 3, '#16111f');
        for (let i = 0; i < 4; i++) {
          px(Math.floor(rnd(i + 21) * 13), Math.floor(rnd(i + 22) * 10), 2, 2, '#322c44');
        }
        break;
      }
      case '*': { // 수정
        px(0, 0, 16, 16, '#3d3850');
        px(6, 4, 4, 9, frame ? '#79d1f0' : '#a8e4ff');
        px(4, 7, 3, 6, '#56b6e0');
        px(10, 6, 3, 7, '#56b6e0');
        px(7, 5, 1, 5, '#d4f4ff');
        break;
      }
      case 'M': { // 탑 바닥
        px(0, 0, 16, 16, '#7a749a');
        px(0, 0, 16, 1, '#8c86ac');
        px(0, 0, 1, 16, '#8c86ac');
        px(15, 0, 1, 16, '#605a80');
        px(0, 15, 16, 1, '#605a80');
        px(8, 8, 1, 1, '#8c86ac');
        break;
      }
      case 'N': { // 탑 벽
        px(0, 0, 16, 16, '#403a5e');
        for (let y = 0; y < 16; y += 4) px(0, y, 16, 1, '#322c4e');
        for (let x = 0; x < 16; x += 8) px(x, 0, 1, 16, '#322c4e');
        px(1, 1, 6, 2, '#4a4468');
        break;
      }
      case 'Z': { // 눈밭
        px(0, 0, 16, 16, '#e8eef8');
        for (let i = 0; i < 6; i++) {
          px(Math.floor(rnd(i + 31) * 15), Math.floor(rnd(i + 131) * 15), 1, 1, '#d2dcee');
        }
        if (frame) px(Math.floor(rnd(99) * 14), Math.floor(rnd(98) * 14), 2, 2, '#ffffff');
        break;
      }
      case 'J': { // 눈 덮인 나무
        px(0, 0, 16, 16, '#e8eef8');
        px(2, 2, 12, 6, '#2f6b38');
        px(1, 4, 14, 4, '#2f6b38');
        px(3, 1, 10, 2, '#ffffff');
        px(2, 2, 12, 1, '#e0e8f4');
        px(1, 4, 4, 1, '#ffffff');
        px(10, 4, 5, 1, '#ffffff');
        px(6, 10, 4, 5, '#6b4a2c');
        px(6, 15, 4, 1, '#4f361f');
        break;
      }
      case 'X': { // 선인장
        px(0, 0, 16, 16, '#e0cf9c');
        px(6, 3, 4, 11, '#3a8f3a');
        px(6, 3, 1, 11, '#4ba34b'); // 하이라이트
        px(2, 5, 3, 2, '#3a8f3a');
        px(3, 5, 2, 4, '#3a8f3a');
        px(11, 6, 3, 2, '#3a8f3a');
        px(11, 4, 2, 4, '#3a8f3a');
        px(8, 4, 1, 9, '#2c7a2c'); // 능선 그늘
        break;
      }
      case 'E': { // 기계실 바닥
        px(0, 0, 16, 16, '#1f2236');
        px(0, 0, 16, 1, '#2c3050');
        px(0, 0, 1, 16, '#2c3050');
        px(3, 8, 6, 1, '#34406a');
        px(8, 8, 1, 5, '#34406a');
        break;
      }
      case 'V': { // 서버 랙 (불빛 깜빡임)
        px(0, 0, 16, 16, '#15172a');
        px(1, 0, 14, 16, '#363c50');
        px(1, 0, 1, 16, '#444c64');
        for (let y = 2; y < 15; y += 4) {
          px(2, y, 12, 2, '#262a3c');
          px(3, y, 2, 1, frame ? '#5cf07a' : '#1e4a2a');
          px(11, y, 2, 1, frame ? '#8a2030' : '#f05c6a');
        }
        break;
      }
      case 'I': { // 도서관 바닥 (오래된 나무)
        px(0, 0, 16, 16, '#7c603f');
        px(0, 7, 16, 1, '#684e33');
        px(0, 15, 16, 1, '#684e33');
        px(7, 0, 1, 8, '#684e33');
        px(12, 8, 1, 8, '#684e33');
        px(0, 0, 16, 1, '#8a6c48');
        break;
      }
      case 'L': { // 책장
        px(0, 0, 16, 16, '#523924');
        px(0, 0, 16, 1, '#634631');
        const cols = ['#a8463f', '#43619a', '#43906a', '#b09438', '#7c50a0'];
        for (let s = 0; s < 2; s++) {
          const y = 2 + s * 7;
          px(1, y + 5, 14, 1, '#341f12');
          for (let i = 0; i < 6; i++) {
            px(2 + i * 2, y, 2, 5, cols[Math.floor(rnd(i + s * 7 + 1) * cols.length)]);
            px(2 + i * 2, y, 2, 1, '#ffffff22');
          }
        }
        break;
      }
      case 'Q': { // 거울 벽
        px(0, 0, 16, 16, '#8a98b8');
        px(1, 1, 14, 14, '#c2d2e8');
        px(2, 2, 3, 10, '#e8f0fc'); // 빛 반사
        px(10, 3, 2, 8, '#a4b6d2');
        px(5, 6, 1, 6, '#dce8f8');
        px(0, 15, 16, 1, '#606e8e');
        break;
      }
      case '2': { // 어두운 풀
        px(0, 0, 16, 16, '#2a4032');
        for (let i = 0; i < 9; i++) {
          const x = Math.floor(rnd(i + 41) * 16), y = Math.floor(rnd(i + 141) * 16);
          px(x, y, 1, 1, i % 2 ? '#34503c' : '#203428');
        }
        break;
      }
      case '3': { // 어두운 나무
        px(0, 0, 16, 16, '#2a4032');
        px(2, 2, 12, 6, '#1a2a20');
        px(1, 4, 14, 4, '#1a2a20');
        px(3, 3, 4, 2, '#26402e');
        px(2, 8, 12, 2, '#141e18');
        px(6, 10, 4, 5, '#382a1e');
        px(6, 15, 4, 1, '#261a10');
        break;
      }
      case '4': { // 빛나는 꽃
        px(0, 0, 16, 16, '#2a4032');
        const glow = frame ? '#9adcff' : '#6ab8e8';
        px(6, 5, 3, 3, glow);
        px(7, 4, 1, 1, '#ffffff');
        px(11, 10, 2, 2, glow);
        px(3, 11, 2, 2, frame ? '#6ab8e8' : '#9adcff');
        px(7, 8, 1, 4, '#34503c');
        break;
      }
      case 'A': { // 글리치 바닥
        px(0, 0, 16, 16, '#120e1f');
        for (let i = 0; i < 5; i++) {
          const x = Math.floor(rnd(i + 61 + (frame ? 50 : 0)) * 14);
          const y = Math.floor(rnd(i + 161 + (frame ? 50 : 0)) * 14);
          const cols = ['#3a2e5d', '#2a4a5d', '#4a2a4a'];
          px(x, y, 2, 1, cols[i % 3]);
        }
        if (frame) px(Math.floor(rnd(77) * 13), Math.floor(rnd(78) * 13), 3, 1, '#5a7aa0');
        break;
      }
      default:
        px(0, 0, 16, 16, '#f0f');
    }
    tileCache.set(key, cv);
    return cv;
  }

  // ---------- 대화 ----------
  function startDialog(lines, speaker, onEnd) {
    game.mode = 'dialog';
    game.dialog = { lines, idx: 0, chars: 0, speaker: speaker || null, onEnd: onEnd || null };
  }

  function updateDialog() {
    const d = game.dialog;
    const line = d.lines[d.idx];
    if (d.chars < line.length) {
      d.chars += 1; // 타자기 효과
      if (game.time % 4 === 0) Sound.blip();
      if (justPressed('action')) d.chars = line.length; // 스킵
      return;
    }
    if (justPressed('action')) {
      Sound.select();
      d.idx += 1;
      d.chars = 0;
      if (d.idx >= d.lines.length) {
        const onEnd = d.onEnd;
        game.dialog = null;
        game.mode = 'world';
        if (onEnd) onEnd();
      }
    }
  }

  // ---------- 월드 ----------
  function tryMove(dir) {
    const p = game.player;
    p.dir = dir;
    const dx = dir === 'left' ? -1 : dir === 'right' ? 1 : 0;
    const dy = dir === 'up' ? -1 : dir === 'down' ? 1 : 0;
    const nx = p.x + dx, ny = p.y + dy;
    const ch = tileAt(game.map, nx, ny);
    if (SOLID(ch) || npcAt(game.map, nx, ny) || monsterAt(game.map, nx, ny)) {
      return;
    }
    p.x = nx; p.y = ny;
    p.moving = true;
  }

  function facingTile() {
    const p = game.player;
    const dx = p.dir === 'left' ? -1 : p.dir === 'right' ? 1 : 0;
    const dy = p.dir === 'up' ? -1 : p.dir === 'down' ? 1 : 0;
    return { x: p.x + dx, y: p.y + dy };
  }

  function interact() {
    const f = facingTile();
    const npc = npcAt(game.map, f.x, f.y);
    if (npc) {
      const lines = getNpcDialog(npc.id, game.flags);
      startDialog(lines, npc.name, () => {
        if (npc.id === 'prof' && !game.flags.talkedProf) {
          game.flags.talkedProf = true;
          save();
        }
      });
      return;
    }
    const mon = monsterAt(game.map, f.x, f.y);
    if (mon) {
      startBattleIntro(mon.id);
      return;
    }
    const sign = signAt(game.map, f.x, f.y);
    if (sign) {
      startDialog([sign.text], '표지판');
      return;
    }
    // 조사(살펴보기): 특별 지점 → 타일 기본 문구
    const prop = getPropAt(game.map, f.x, f.y);
    if (prop) {
      startDialog([prop.text]);
      return;
    }
    const ch = tileAt(game.map, f.x, f.y);
    const examine = getExamineTile(ch);
    if (examine) {
      startDialog([examine]);
    }
  }

  function pushBack() {
    // 들어온 방향의 반대로 한 칸 밀려남
    const p = game.player;
    p.x += p.dir === 'left' ? 1 : p.dir === 'right' ? -1 : 0;
    p.y += p.dir === 'up' ? 1 : p.dir === 'down' ? -1 : 0;
    p.px = p.x * TS;
    p.py = p.y * TS;
  }

  function checkWarp() {
    const p = game.player;
    const w = warpAt(game.map, p.x, p.y);
    if (!w) return;
    if (w.needBadges && countBadges(game.flags) < w.needBadges) {
      pushBack();
      Sound.bump();
      startDialog([`신호탑의 문이 굳게 닫혀 있다.\n마음의 증표 ${w.needBadges}개가 필요하다.\n(지금 ${countBadges(game.flags)}개)`]);
      return;
    }
    if (w.needBoss && !game.flags.defeated[w.needBoss]) {
      pushBack();
      Sound.bump();
      startDialog([w.lockText || '길이 막혀 있다.']);
      return;
    }
    game.map = w.to;
    p.x = w.tx; p.y = w.ty;
    p.px = w.tx * TS; p.py = w.ty * TS;
    p.moving = false;
    Sound.playSong(MAPS[w.to].song);
    // 처음 방문하는 맵의 인트로 연출
    const dest = MAPS[w.to];
    if (dest.intro && !game.flags.visited[w.to]) {
      game.flags.visited[w.to] = true;
      startDialog(dest.intro.slice());
    }
    save();
  }

  const MOVE_SPEED = TS / 9; // 프레임당 픽셀

  function updateWorld() {
    const p = game.player;

    // 픽셀 보간 이동
    const tx = p.x * TS, ty = p.y * TS;
    if (p.px !== tx || p.py !== ty) {
      p.px += Math.sign(tx - p.px) * Math.min(MOVE_SPEED, Math.abs(tx - p.px));
      p.py += Math.sign(ty - p.py) * Math.min(MOVE_SPEED, Math.abs(ty - p.py));
      p.step += 1;
      if (p.px === tx && p.py === ty) {
        p.moving = false;
        checkWarp();
      }
      return;
    }

    if (justPressed('menu')) {
      openDex('world');
      return;
    }

    if (justPressed('action')) {
      interact();
      return;
    }

    if (held.has('up')) tryMove('up');
    else if (held.has('down')) tryMove('down');
    else if (held.has('left')) tryMove('left');
    else if (held.has('right')) tryMove('right');
  }

  // ---------- 배틀 ----------
  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startBattleIntro(monId) {
    const mon = MONSTERS[monId];
    Sound.encounter();
    startDialog([mon.intro], mon.name, () => startBattle(monId));
  }

  function questionPool(mon) {
    const topics = Array.isArray(mon.topic) ? mon.topic : [mon.topic];
    return topics.flatMap((t) => QUIZZES[t]);
  }

  function startBattle(monId) {
    const mon = MONSTERS[monId];
    game.mode = 'battle';
    Sound.playSong(mon.song || 'battle');
    const maxHearts = mon.hp >= 5 ? 4 : 3;
    game.battle = {
      monId,
      mon,
      monHp: mon.hp,
      monMaxHp: mon.hp,
      playerHp: maxHearts,
      maxHearts,
      questions: shuffled(questionPool(mon)),
      qIdx: 0,
      phase: 'question', // question | feedback | mercy | mercyReply | dodge
      cursor: 0,
      feedback: null, // { correct, why }
      shake: 0,
      flash: 0,
      attack: getBossAttack(monId), // 보스 회피 구간 (없으면 null)
      dodgeDone: false,
      dodge: null,
    };
    game.flags.battleCount += 1;
  }

  function currentQuestion() {
    const b = game.battle;
    if (b.qIdx >= b.questions.length) {
      b.questions = shuffled(questionPool(b.mon));
      b.qIdx = 0;
    }
    return b.questions[b.qIdx];
  }

  function nextQuestion() {
    const b = game.battle;
    b.qIdx += 1;
    b.cursor = 0;
    b.feedback = null;
    b.phase = 'question';
  }

  // 정답으로 보스 HP가 절반이 되면, 마음이 폭주하는 회피 구간이 한 번 펼쳐진다.
  function continueAfterFeedback() {
    const b = game.battle;
    if (!b.dodgeDone && b.attack && b.monHp > 0 && b.monHp <= Math.floor(b.monMaxHp / 2)) {
      enterDodge();
    } else {
      nextQuestion();
      Sound.select();
    }
  }

  function enterDodge() {
    const b = game.battle;
    const atk = b.attack;
    b.dodgeDone = true;
    b.phase = 'dodge';
    const boxW = 300, boxH = 170;
    b.dodge = {
      t: 0, dur: atk.dur,
      box: { x: Math.round(canvas.width / 2 - boxW / 2), y: 150, w: boxW, h: boxH },
      soul: { x: canvas.width / 2, y: 235 },
      bullets: [],
      spawnTimer: 30,
      inv: 0,
    };
    Sound.encounter();
  }

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function spawnBullets(d, pattern) {
    const box = d.box;
    if (pattern === 'rain') {
      const x = box.x + 12 + Math.random() * (box.w - 24);
      d.bullets.push({ x, y: box.y - 6, vx: 0, vy: 2.0 + Math.random() * 1.4, r: 6 });
    } else if (pattern === 'sides') {
      const fromLeft = Math.random() < 0.5;
      const y = box.y + 12 + Math.random() * (box.h - 24);
      d.bullets.push({ x: fromLeft ? box.x - 6 : box.x + box.w + 6, y,
        vx: (fromLeft ? 1 : -1) * (2.2 + Math.random() * 1.2), vy: 0, r: 6 });
    } else { // burst — 중앙에서 방사형
      const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
      const n = 6, base = Math.random() * Math.PI * 2;
      for (let i = 0; i < n; i++) {
        const a = base + i * Math.PI * 2 / n;
        d.bullets.push({ x: cx, y: cy, vx: Math.cos(a) * 2.0, vy: Math.sin(a) * 2.0, r: 5 });
      }
    }
  }

  function updateDodge() {
    const b = game.battle, d = b.dodge, atk = b.attack;
    if (b.shake > 0) b.shake -= 1;
    if (b.flash > 0) b.flash -= 1;
    if (d.inv > 0) d.inv -= 1;
    d.t += 1;

    // 하트(소울) 이동
    const sp = 3.4, r = 7;
    if (held.has('left')) d.soul.x -= sp;
    if (held.has('right')) d.soul.x += sp;
    if (held.has('up')) d.soul.y -= sp;
    if (held.has('down')) d.soul.y += sp;
    d.soul.x = clamp(d.soul.x, d.box.x + r, d.box.x + d.box.w - r);
    d.soul.y = clamp(d.soul.y, d.box.y + r, d.box.y + d.box.h - r);

    // 탄막 생성 (끝나기 직전엔 멈춰서 정리 시간을 준다)
    d.spawnTimer -= 1;
    if (d.spawnTimer <= 0 && d.t < d.dur - 50) {
      spawnBullets(d, atk.pattern);
      d.spawnTimer = atk.pattern === 'burst' ? 24 : 15;
    }

    // 탄막 이동 + 화면 밖 제거
    for (const bu of d.bullets) { bu.x += bu.vx; bu.y += bu.vy; }
    d.bullets = d.bullets.filter((bu) =>
      bu.x > d.box.x - 24 && bu.x < d.box.x + d.box.w + 24 &&
      bu.y > d.box.y - 24 && bu.y < d.box.y + d.box.h + 24);

    // 충돌 (하트는 1 아래로 줄지 않아 게임오버 없음)
    if (d.inv <= 0) {
      for (const bu of d.bullets) {
        const dx = bu.x - d.soul.x, dy = bu.y - d.soul.y;
        if (dx * dx + dy * dy < (r + bu.r) * (r + bu.r)) {
          b.playerHp = Math.max(1, b.playerHp - 1);
          d.inv = 42; b.flash = 12; Sound.bump();
          break;
        }
      }
    }

    if (d.t >= d.dur) {
      b.dodge = null;
      nextQuestion();
      Sound.select();
    }
  }

  function updateBattle() {
    const b = game.battle;
    if (b.phase === 'dodge') { updateDodge(); return; }
    if (b.shake > 0) b.shake -= 1;
    if (b.flash > 0) b.flash -= 1;

    if (b.phase === 'question') {
      const q = currentQuestion();
      if (justPressed('up')) { b.cursor = (b.cursor + q.a.length - 1) % q.a.length; Sound.blip(); }
      if (justPressed('down')) { b.cursor = (b.cursor + 1) % q.a.length; Sound.blip(); }
      if (justPressed('action')) {
        const correct = b.cursor === q.c;
        b.feedback = { correct, why: q.why };
        b.phase = 'feedback';
        if (correct) {
          Sound.correct();
          b.monHp -= 1;
          b.shake = 14;
          game.flags.correctCount += 1;
        } else {
          Sound.wrong();
          b.playerHp -= 1;
          b.flash = 14;
        }
      }
      return;
    }

    if (b.phase === 'feedback') {
      if (justPressed('action')) {
        if (b.monHp <= 0) {
          // 스테이지 6~ 몬스터는 마지막에 '마음의 선택'이 기다린다
          if (b.mon.mercy && !b.mercyDone) {
            b.phase = 'mercy';
            b.cursor = 0;
            Sound.select();
            return;
          }
          winBattle();
          return;
        }
        if (b.playerHp <= 0) { loseBattle(); return; }
        continueAfterFeedback();
      }
      return;
    }

    if (b.phase === 'mercy') {
      const opts = b.mon.mercy.options;
      if (justPressed('up')) { b.cursor = (b.cursor + opts.length - 1) % opts.length; Sound.blip(); }
      if (justPressed('down')) { b.cursor = (b.cursor + 1) % opts.length; Sound.blip(); }
      if (justPressed('action')) {
        const choice = opts[b.cursor];
        b.mercyDone = true;
        b.mercyReply = choice.reply;
        b.mercyChoiceKind = choice.kind;
        if (choice.kind === 'mercy') {
          game.flags.mercy += 1;
          Sound.badge();
        } else {
          Sound.select();
        }
        b.phase = 'mercyReply';
      }
      return;
    }

    if (b.phase === 'mercyReply') {
      if (justPressed('action')) { winBattle(); }
      return;
    }
  }

  function winBattle() {
    const b = game.battle;
    const mon = b.mon;
    game.flags.defeated[b.monId] = true;
    recordDexSeen(b.monId, b.mercyChoiceKind);
    if (!game.flags.mercyChoice) game.flags.mercyChoice = {};
    game.flags.mercyChoice[b.monId] = b.mercyChoiceKind || null;
    const gotBadge = mon.badge && !game.flags.badges[mon.badge];
    if (mon.badge) game.flags.badges[mon.badge] = true;
    save();

    game.battle = null;
    game.mode = 'world';
    Sound.badge();

    const lines = [mon.win];
    if (gotBadge) {
      const badgeNames = { forest: '정적의 숲의 증표', lake: '잔향의 호수의 증표', cave: '회로의 동굴의 증표' };
      lines.push(`☆ ${badgeNames[mon.badge]}를 얻었다! ☆\n(마음의 증표 ${countBadges(game.flags)}개 / 3개)`);
      if (countBadges(game.flags) >= 3) {
        lines.push('마음의 증표를 모두 모았다!\n마을의 신호탑 문이 열렸다…!');
      }
    }
    if (mon.clear) lines.push(mon.clear);
    if (b.monId === 'finalboss') {
      startDialog(lines, mon.name, () => {
        game.mode = 'ending';
        game.endingType = 'first';
        game.endingT = 0;
        Sound.playSong('ending');
      });
    } else if (b.monId === 'yeongi') {
      // 최종 엔딩 분기: 여정 전체의 자비 + 마지막 선택
      const endingId = computeEnding(b.mercyChoiceKind, game.flags.mercy);
      game.flags.endingId = endingId;
      game.flags.trueEnding = endingId === 'home';
      recordEndingSeen(endingId);
      save();
      startDialog(lines, mon.name, () => {
        game.mode = 'ending';
        game.endingType = 'true';
        game.endingT = 0;
        Sound.playSong('ending');
      });
    } else {
      startDialog(lines, mon.name, () => {
        Sound.playSong(MAPS[game.map].song);
      });
    }
  }

  function loseBattle() {
    game.battle = null;
    game.mode = 'world';
    Sound.playSong(MAPS[game.map].song);
    startDialog([
      '으윽, 머리가 어지럽다…!',
      '괜찮아, 틀려도 배우면 되는 거야.\n기운을 차리고 다시 도전하자!',
    ]);
  }

  // ---------- 도감 ----------
  function openDex(ret) {
    game.dex.ret = ret;
    game.dex.cursor = 0;
    game.mode = 'dex';
    Sound.select();
  }

  function closeDex() {
    game.mode = game.dex.ret;
    Sound.select();
  }

  function updateDex() {
    const n = DEX_ORDER.length;
    if (justPressed('up')) { game.dex.cursor = (game.dex.cursor + n - 1) % n; Sound.blip(); }
    if (justPressed('down')) { game.dex.cursor = (game.dex.cursor + 1) % n; Sound.blip(); }
    if (justPressed('left')) { game.dex.cursor = (game.dex.cursor + n - 5) % n; Sound.blip(); }
    if (justPressed('right')) { game.dex.cursor = (game.dex.cursor + 5) % n; Sound.blip(); }
    if (justPressed('cancel') || justPressed('menu') || justPressed('action')) closeDex();
  }

  const MERCY_LABEL = {
    mercy: '마음을 안아 줌 ♥', neutral: '바르게 타이름', harsh: '차갑게 작별',
  };

  function drawDex() {
    const seen = getDexSeen();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 헤더
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('♥ 몬스터 도감', 24, 38);
    ctx.fillStyle = '#888';
    ctx.font = '15px monospace';
    ctx.fillText(`수집 ${dexSeenCount()} / ${DEX_ORDER.length}`, 24, 62);

    // 왼쪽: 목록 (커서 주변으로 스크롤)
    const listX = 24, listY = 84, rowH = 30, visible = 13;
    const cur = game.dex.cursor;
    let start = Math.max(0, Math.min(cur - 6, DEX_ORDER.length - visible));
    if (DEX_ORDER.length <= visible) start = 0;
    for (let i = 0; i < visible && start + i < DEX_ORDER.length; i++) {
      const idx = start + i;
      const id = DEX_ORDER[idx];
      const isSeen = seen[id] && seen[id].seen;
      const y = listY + i * rowH;
      if (idx === cur) {
        ctx.fillStyle = '#e0453a';
        ctx.font = '14px monospace';
        ctx.fillText('♥', listX - 18, y);
      }
      ctx.fillStyle = '#666';
      ctx.font = '12px monospace';
      ctx.fillText(`S${MONSTER_DEX[id].stage}`, listX, y);
      ctx.fillStyle = isSeen ? (idx === cur ? '#fff' : '#aaa') : '#444';
      ctx.font = (idx === cur ? 'bold ' : '') + '15px monospace';
      ctx.fillText(isSeen ? MONSTERS[id].name : '??? (미발견)', listX + 34, y);
    }
    // 스크롤 표시
    if (start > 0) { ctx.fillStyle = '#888'; ctx.fillText('▲', listX + 130, listY - 24); }
    if (start + visible < DEX_ORDER.length) { ctx.fillStyle = '#888'; ctx.fillText('▼', listX + 130, listY + visible * rowH); }

    // 오른쪽: 상세 패널
    const id = DEX_ORDER[cur];
    const info = MONSTER_DEX[id];
    const isSeen = seen[id] && seen[id].seen;
    const panelX = 330, panelW = canvas.width - panelX - 24;
    utBox(panelX, 84, panelW, 400, 6);

    const cx = panelX + panelW / 2;
    // 스프라이트 (가운데, 6배)
    if (isSeen) {
      const ss = 6;
      const bob = Math.sin(game.time / 22) * 4;
      drawSprite(ctx, MONSTER_SPRITES[id], Math.round(cx - 16 * ss / 2), Math.round(110 + bob), ss);
    } else {
      // 실루엣
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2;
      roundRect(cx - 44, 116, 88, 88, 6);
      ctx.stroke();
      ctx.fillStyle = '#444';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('?', cx, 178);
      ctx.textAlign = 'left';
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = isSeen ? '#fff' : '#555';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(isSeen ? MONSTERS[id].name : '???', cx, 238);
    ctx.fillStyle = '#888';
    ctx.font = '13px monospace';
    ctx.fillText(`스테이지 ${info.stage}`, cx, 260);
    ctx.textAlign = 'left';

    if (isSeen) {
      ctx.fillStyle = '#ffd644';
      ctx.font = 'bold 15px monospace';
      wrapText(`주제 · ${info.theme}`, panelX + 24, 296, panelW - 48, 22);
      ctx.fillStyle = '#fff';
      ctx.font = '15px monospace';
      const usedLines = wrapText(info.learn, panelX + 24, 330, panelW - 48, 24);
      const my = 330 + usedLines * 24 + 16;
      const mk = seen[id].mercy;
      ctx.fillStyle = '#e0453a';
      ctx.font = '14px monospace';
      ctx.fillText(`작별 · ${mk ? MERCY_LABEL[mk] : '—'}`, panelX + 24, my);
    } else {
      ctx.fillStyle = '#666';
      ctx.font = '15px monospace';
      ctx.fillText('아직 만나지 못한 마음입니다.', panelX + 24, 300);
      ctx.fillText('모험에서 깨우치면 기록됩니다.', panelX + 24, 326);
    }

    // 푸터
    ctx.fillStyle = '#777';
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↑↓←→ 넘기기 · X 또는 A로 닫기', canvas.width / 2, 510);
    ctx.textAlign = 'left';
  }

  // 텍스트 줄바꿈 그리기. 그린 줄 수를 반환.
  function wrapText(text, x, y, maxW, lineH) {
    const words = text.split(' ');
    let line = '', ly = y, lines = 0;
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, ly); ly += lineH; lines++;
        line = w;
      } else {
        line = test;
      }
    }
    if (line) { ctx.fillText(line, x, ly); lines++; }
    return lines;
  }

  // ---------- 그리기 ----------
  function camera() {
    const m = MAPS[game.map];
    const mw = m.tiles[0].length * TS;
    const mh = m.tiles.length * TS;
    let cx = game.player.px + TS / 2 - canvas.width / 2;
    let cy = game.player.py + TS / 2 - canvas.height / 2;
    cx = Math.max(0, Math.min(cx, mw - canvas.width));
    cy = Math.max(0, Math.min(cy, mh - canvas.height));
    if (mw < canvas.width) cx = (mw - canvas.width) / 2;
    if (mh < canvas.height) cy = (mh - canvas.height) / 2;
    return { cx, cy };
  }

  function drawWorld() {
    const m = MAPS[game.map];
    const { cx, cy } = camera();
    const frame = Math.floor(game.time / 30) % 2;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const x0 = Math.floor(cx / TS), y0 = Math.floor(cy / TS);
    for (let y = y0; y <= y0 + VIEW_H + 1; y++) {
      for (let x = x0; x <= x0 + VIEW_W + 1; x++) {
        if (y < 0 || y >= m.tiles.length || x < 0 || x >= m.tiles[0].length) continue;
        const ch = m.tiles[y][x];
        ctx.drawImage(tileCanvas(ch, frame), Math.round(x * TS - cx), Math.round(y * TS - cy));
      }
    }

    // NPC
    for (const npc of m.npcs) {
      if (!npcVisible(npc)) continue;
      if (npc.monSprite) {
        const bob = Math.round(Math.sin(game.time / 22) * 2);
        drawSprite(ctx, MONSTER_SPRITES[npc.monSprite],
          Math.round(npc.x * TS - cx), Math.round(npc.y * TS - cy - 6 + bob), SCALE);
      } else {
        drawSprite(ctx, NPC_SPRITES.down[frame],
          Math.round(npc.x * TS - cx), Math.round(npc.y * TS - cy - 6),
          SCALE, NPC_PALETTES[npc.pal]);
      }
    }

    // 몬스터 (둥실둥실)
    for (const mo of m.monsters) {
      if (game.flags.defeated[mo.id]) continue;
      const bob = Math.round(Math.sin(game.time / 18) * 4);
      drawSprite(ctx, MONSTER_SPRITES[mo.id],
        Math.round(mo.x * TS - cx), Math.round(mo.y * TS - cy - 6 + bob), SCALE);
      // 느낌표
      ctx.fillStyle = '#ffd644';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('!', Math.round(mo.x * TS - cx) + TS / 2 - 3, Math.round(mo.y * TS - cy) - 10 + bob);
    }

    // 플레이어
    const p = game.player;
    const walking = p.px !== p.x * TS || p.py !== p.y * TS;
    const pframe = walking ? Math.floor(p.step / 6) % 2 : 0;
    const dirKey = p.dir === 'right' ? 'left' : p.dir;
    drawSprite(ctx, PLAYER_SPRITES[dirKey][pframe],
      Math.round(p.px - cx), Math.round(p.py - cy - 6), SCALE, null, p.dir === 'right');

    drawHud();
  }

  function drawHud() {
    // 스테이지 + 지역 이름 + 목표
    const m = MAPS[game.map];
    ctx.font = 'bold 14px monospace';
    const title = `STAGE ${getStage(game.flags)}/10 · ${m.name}`;
    const obj = `목표: ${getObjective(game.flags)}`;
    const w = Math.max(ctx.measureText(obj).width, ctx.measureText(title).width) + 20;
    utBox(8, 8, w, 52, 4);
    ctx.fillStyle = '#ffd644';
    ctx.fillText(title, 18, 28);
    ctx.fillStyle = '#fff';
    ctx.fillText(obj, 18, 50);

    // 마음의 증표 (하트 3개)
    const shards = ['forest', 'lake', 'cave'];
    for (let i = 0; i < 3; i++) {
      const bx = canvas.width - 104 + i * 30;
      ctx.font = '18px monospace';
      ctx.fillStyle = game.flags.badges[shards[i]] ? '#e0453a' : '#333';
      ctx.fillText('♥', bx, 30);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeText('♥', bx, 30);
    }

    // 안아 준 마음 (자비)
    if (game.flags.mercy > 0) {
      utBox(canvas.width - 196, 12, 64, 28, 4);
      ctx.fillStyle = '#e0453a';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`♥ ${game.flags.mercy}`, canvas.width - 184, 31);
    }

    if (Sound.muted) {
      ctx.fillStyle = '#aaa';
      ctx.font = '12px monospace';
      ctx.fillText('♪ 꺼짐(M)', canvas.width - 110, 56);
    }
  }

  // 언더테일풍 — 모서리가 살짝 깎인 픽셀 상자 (r은 모서리 컷 크기로 사용)
  function roundRect(x, y, w, h, r) {
    const c = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + c, y);
    ctx.lineTo(x + w - c, y);
    ctx.lineTo(x + w, y + c);
    ctx.lineTo(x + w, y + h - c);
    ctx.lineTo(x + w - c, y + h);
    ctx.lineTo(x + c, y + h);
    ctx.lineTo(x, y + h - c);
    ctx.lineTo(x, y + c);
    ctx.closePath();
  }

  // 박스 안에 두 줄 흰 테두리를 그려 언더테일풍 윈도우를 만든다
  function utBox(x, y, w, h, c) {
    ctx.fillStyle = '#000';
    roundRect(x, y, w, h, c || 6);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    roundRect(x, y, w, h, c || 6);
    ctx.stroke();
  }

  function drawDialog() {
    const d = game.dialog;
    const line = d.lines[d.idx];
    const shown = line.slice(0, d.chars);
    const totalLines = line.split('\n').length + (d.speaker ? 1 : 0);
    const boxH = Math.max(120, 42 + totalLines * 24);
    const y = canvas.height - boxH - 12;

    utBox(12, y, canvas.width - 24, boxH, 8);

    let ty = y + 30;
    if (d.speaker) {
      ctx.fillStyle = '#ffd644';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`* ${d.speaker}`, 30, ty);
      ty += 26;
    }
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    for (const part of shown.split('\n')) {
      ctx.fillText(part, 30, ty);
      ty += 24;
    }
    if (d.chars >= line.length && Math.floor(game.time / 20) % 2 === 0) {
      ctx.fillStyle = '#fff';
      ctx.fillText('▼', canvas.width - 50, y + boxH - 16);
    }
  }

  // 선택지 한 줄을 그린다 — 선택된 줄 앞에 빨간 하트가 떠 있다 (언더테일 커서)
  function drawChoiceLine(text, x, y, selected) {
    if (selected) {
      ctx.fillStyle = '#e0453a';
      ctx.font = '15px monospace';
      ctx.fillText('♥', x, y);
    }
    ctx.fillStyle = selected ? '#fff' : '#888';
    ctx.font = '16px monospace';
    ctx.fillText(text, x + 28, y);
  }

  function drawBattle() {
    const b = game.battle;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 바닥 경계선
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 70);
      ctx.lineTo(canvas.width, i * 70);
      ctx.stroke();
    }

    // 몬스터 (오른쪽 위, 크게)
    const shakeX = b.shake > 0 ? Math.sin(b.shake * 2) * 6 : 0;
    const bob = Math.sin(game.time / 20) * 5;
    const monScale = 9;
    drawSprite(ctx, MONSTER_SPRITES[b.monId],
      Math.round(canvas.width - 16 * monScale - 60 + shakeX),
      Math.round(30 + bob), monScale);

    // 몬스터 이름/HP
    utBox(24, 24, 240, 64, 6);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 17px monospace';
    ctx.fillText(b.mon.name, 40, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('HP', 40, 70);
    ctx.fillStyle = '#601010';
    ctx.fillRect(66, 62, 174, 12);
    ctx.fillStyle = b.monHp / b.monMaxHp > 0.5 ? '#ffd644' : b.monHp / b.monMaxHp > 0.25 ? '#f08a24' : '#e0453a';
    ctx.fillRect(66, 62, 174 * Math.max(0, b.monHp / b.monMaxHp), 12);

    // 플레이어 하트
    utBox(24, 100, 30 + b.maxHearts * 32, 44, 6);
    ctx.font = '22px monospace';
    for (let i = 0; i < b.maxHearts; i++) {
      ctx.fillStyle = i < b.playerHp ? '#e0453a' : '#333';
      ctx.fillText('♥', 40 + i * 32, 132);
    }

    // 빨간 플래시 (틀렸을 때/맞았을 때)
    if (b.flash > 0) {
      ctx.fillStyle = `rgba(224,69,58,${b.flash / 40})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 회피 미니게임
    if (b.phase === 'dodge') { drawDodge(b); return; }

    // 질문/피드백 박스
    const boxY = canvas.height - 250;
    utBox(12, boxY, canvas.width - 24, 238, 8);

    if (b.phase === 'question') {
      const q = currentQuestion();
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      let ty = boxY + 30;
      for (const part of q.q.split('\n')) {
        ctx.fillText(part, 34, ty);
        ty += 24;
      }
      ty = boxY + 118;
      for (let i = 0; i < q.a.length; i++) {
        drawChoiceLine(`${i + 1}. ${q.a[i]}`, 38, ty, i === b.cursor);
        ty += 38;
      }
    } else if (b.phase === 'feedback') {
      const f = b.feedback;
      ctx.font = 'bold 22px monospace';
      ctx.fillStyle = f.correct ? '#5cb85c' : '#e0453a';
      ctx.fillText(f.correct ? '○ 정답! 몬스터가 깨달았다!' : '× 아쉬워요! 다시 생각해 봐요.', 34, boxY + 38);
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      let ty = boxY + 78;
      for (const part of f.why.split('\n')) {
        ctx.fillText(part, 34, ty);
        ty += 24;
      }
      if (Math.floor(game.time / 20) % 2 === 0) {
        ctx.fillStyle = '#ffd644';
        ctx.fillText('▼ (Z/스페이스)', canvas.width - 150, boxY + 218);
      }
    } else if (b.phase === 'mercy') {
      // 마음의 선택
      ctx.fillStyle = '#e0453a';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('♥ 마음의 선택', 34, boxY + 32);
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      let ty = boxY + 62;
      for (const part of b.mon.mercy.prompt.split('\n')) {
        ctx.fillText(part, 34, ty);
        ty += 22;
      }
      ty = boxY + 138;
      const opts = b.mon.mercy.options;
      for (let i = 0; i < opts.length; i++) {
        drawChoiceLine(opts[i].label, 38, ty, i === b.cursor);
        ty += 34;
      }
    } else if (b.phase === 'mercyReply') {
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      let ty = boxY + 40;
      for (const part of b.mercyReply.split('\n')) {
        ctx.fillText(part, 34, ty);
        ty += 24;
      }
      if (Math.floor(game.time / 20) % 2 === 0) {
        ctx.fillStyle = '#ffd644';
        ctx.fillText('▼ (Z/스페이스)', canvas.width - 150, boxY + 218);
      }
    }
  }

  function drawDodge(b) {
    const d = b.dodge;
    ctx.textAlign = 'center';
    // 보스의 외침
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(b.attack.taunt, canvas.width / 2, d.box.y - 26);
    ctx.fillStyle = '#888';
    ctx.font = '13px monospace';
    ctx.fillText('화살표로 하트를 움직여 피하세요!  (하트는 0이 되지 않아요)', canvas.width / 2, d.box.y - 6);
    ctx.textAlign = 'left';

    // 박스
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(d.box.x + 0.5, d.box.y + 0.5, d.box.w, d.box.h);

    // 탄막
    ctx.fillStyle = b.attack.color;
    for (const bu of d.bullets) {
      ctx.beginPath();
      ctx.arc(bu.x, bu.y, bu.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 하트(소울) — 무적 시간 동안 깜빡임
    if (!(d.inv > 0 && Math.floor(game.time / 4) % 2 === 0)) {
      ctx.fillStyle = '#e0453a';
      ctx.font = '17px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('♥', d.soul.x, d.soul.y + 6);
      ctx.textAlign = 'left';
    }

    // 남은 시간 게이지
    const frac = Math.max(0, 1 - d.t / d.dur);
    ctx.fillStyle = '#333';
    ctx.fillRect(d.box.x, d.box.y + d.box.h + 12, d.box.w, 6);
    ctx.fillStyle = '#fff';
    ctx.fillRect(d.box.x, d.box.y + d.box.h + 12, d.box.w * frac, 6);
  }

  function drawTitle() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 배경 별
    for (let i = 0; i < 40; i++) {
      const sx = (i * 173) % canvas.width;
      const sy = (i * 97) % (canvas.height / 2);
      const tw = Math.sin(game.time / 30 + i) > 0.3 ? 1 : 0.4;
      ctx.fillStyle = `rgba(255,255,255,${tw * 0.7})`;
      ctx.fillRect(sx, sy, 2, 2);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px monospace';
    ctx.fillText('AI 윤리 어드벤처', canvas.width / 2, 86);
    ctx.fillStyle = '#888';
    ctx.font = '15px monospace';
    ctx.fillText('10개의 스테이지 끝에서, 잊혀진 이야기와 만나라', canvas.width / 2, 114);

    // 몬스터들 둥실둥실 (한 줄)
    const parade = ['mollaemon', 'geojitmon', 'pyeonhyangmon', 'hollimmon', 'mirrormon', 'soksagimon', 'yeongi'];
    for (let i = 0; i < parade.length; i++) {
      const bx = canvas.width / 2 - parade.length * 24 + i * 48;
      drawSprite(ctx, MONSTER_SPRITES[parade[i]], bx, 134 + Math.sin(game.time / 20 + i * 1.1) * 5, 3);
    }

    // 세이브 슬롯 3개
    const boxW = 460, boxX = canvas.width / 2 - boxW / 2;
    for (let i = 0; i < SLOT_COUNT; i++) {
      const y = 212 + i * 74, h = 64;
      const sel = i === game.slotCursor && game.titleScreen === 'slots';
      utBox(boxX, y, boxW, h, 4);
      if (sel) {
        ctx.fillStyle = '#e0453a';
        ctx.font = '16px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('♥', boxX - 22, y + 38);
      }

      const sum = slotSummary(i);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#888';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`슬롯 ${i + 1}`, boxX + 18, y + 22);
      if (sum) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 19px monospace';
        ctx.fillText(sum.name, boxX + 18, y + 46);
        ctx.fillStyle = '#888';
        ctx.font = '13px monospace';
        const prog = sum.done ? '모험 완료' : `스테이지 ${sum.stage}/10`;
        ctx.textAlign = 'right';
        ctx.fillText(`${prog}   ♥ ${sum.mercy}`, boxX + boxW - 18, y + 40);
        ctx.textAlign = 'left';
      } else {
        ctx.fillStyle = '#555';
        ctx.font = '17px monospace';
        ctx.fillText('— 비어 있음 (새 모험) —', boxX + 18, y + 46);
      }
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#777';
    ctx.font = '13px monospace';
    ctx.fillText('↑↓ 선택 · Z 시작/이어하기 · X 슬롯 삭제 · C 도감 · M 음악', canvas.width / 2, 474);

    // 발견한 엔딩 (게임을 다시 시작해도 남는다)
    const seen = getEndingsSeen();
    const seenCount = ['home', 'dawn', 'farewell', 'silent'].filter((k) => seen[k]).length;
    const names = { home: '집으로', dawn: '새벽', farewell: '작별', silent: '침묵' };
    const found = ['home', 'dawn', 'farewell', 'silent']
      .map((k) => (seen[k] ? names[k] : '???')).join(' · ');
    ctx.fillStyle = '#e0453a';
    ctx.font = '13px monospace';
    ctx.fillText(`♥ 발견한 엔딩 ${seenCount}/4 — ${found}   ·   도감 ${dexSeenCount()}/${DEX_ORDER.length}`, canvas.width / 2, 500);

    // 삭제 확인
    if (game.titleScreen === 'delete') {
      ctx.fillStyle = 'rgba(0,0,0,.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const sum = slotSummary(game.slotCursor);
      utBox(canvas.width / 2 - 200, 200, 400, 130, 6);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`슬롯 ${game.slotCursor + 1} "${sum ? sum.name : ''}"`, canvas.width / 2, 240);
      ctx.font = '15px monospace';
      ctx.fillStyle = '#e0453a';
      ctx.fillText('정말 삭제할까요? (되돌릴 수 없어요)', canvas.width / 2, 270);
      ctx.fillStyle = '#888';
      ctx.font = '14px monospace';
      ctx.fillText('Z: 삭제   ·   X: 취소', canvas.width / 2, 304);
    }
    ctx.textAlign = 'left';
  }

  function startNewGame(slot, name) {
    game.currentSlot = slot;
    game.playerName = name || '수호자';
    game.map = 'village';
    game.player.x = 13; game.player.y = 16;
    game.player.px = 13 * TS; game.player.py = 16 * TS;
    game.player.dir = 'up';
    game.flags = newFlags();
    game.mode = 'world';
    save();
    Sound.playSong(MAPS[game.map].song);
    startDialog([
      `여기는 AI들과 사람들이 함께 사는\n평화로운 "경계마을".`,
      `반가워, ${game.playerName}!\n그런데 요즘 이상한 몬스터들이\n나타나기 시작했는데…`,
      '마을 왼쪽 아래에 계신 박사님을\n찾아가 보자! (목표는 왼쪽 위에 표시돼요)',
    ]);
  }

  function continueGame(slot) {
    const s = loadSlot(slot);
    if (!s) return;
    game.currentSlot = slot;
    game.playerName = s.name || '수호자';
    game.map = s.map;
    game.player.x = s.x; game.player.y = s.y;
    game.player.px = s.x * TS; game.player.py = s.y * TS;
    game.player.dir = 'up';
    game.flags = Object.assign(newFlags(), s.flags);
    game.flags.badges = Object.assign({ forest: false, lake: false, cave: false }, s.flags.badges);
    game.flags.defeated = Object.assign(newFlags().defeated, s.flags.defeated);
    game.mode = 'world';
    Sound.playSong(MAPS[game.map].song);
  }

  function updateTitle() {
    if (game.titleScreen === 'name') {
      if (game.nameConfirm) {
        game.nameConfirm = false;
        const nm = currentNameValue();
        hideNameEntry();
        game.titleScreen = 'slots';
        Sound.select();
        startNewGame(game.slotCursor, nm);
      } else if (game.nameCancel || justPressed('cancel')) {
        game.nameCancel = false;
        hideNameEntry();
        game.titleScreen = 'slots';
        Sound.blip();
      } else if (justPressed('action')) {
        // 터치 A 버튼 등으로 확정
        const nm = currentNameValue();
        hideNameEntry();
        game.titleScreen = 'slots';
        Sound.select();
        startNewGame(game.slotCursor, nm);
      }
      return;
    }

    if (game.titleScreen === 'delete') {
      if (justPressed('action')) {
        deleteSlot(game.slotCursor);
        game.titleScreen = 'slots';
        Sound.wrong();
      } else if (justPressed('cancel') || justPressed('menu')) {
        game.titleScreen = 'slots';
        Sound.blip();
      }
      return;
    }

    // slots 화면
    if (justPressed('menu')) { openDex('title'); return; }
    if (justPressed('up')) { game.slotCursor = (game.slotCursor + SLOT_COUNT - 1) % SLOT_COUNT; Sound.blip(); }
    if (justPressed('down')) { game.slotCursor = (game.slotCursor + 1) % SLOT_COUNT; Sound.blip(); }
    if (justPressed('cancel')) {
      if (slotSummary(game.slotCursor)) { game.titleScreen = 'delete'; Sound.blip(); }
      return;
    }
    if (justPressed('action')) {
      Sound.select();
      if (slotSummary(game.slotCursor)) continueGame(game.slotCursor);
      else showNameEntry();
    }
  }

  function drawEnding() {
    game.endingT += 1;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 별
    for (let i = 0; i < 60; i++) {
      const sx = (i * 131) % canvas.width;
      const sy = (i * 71) % canvas.height;
      ctx.fillStyle = `rgba(255,255,255,${Math.sin(game.time / 25 + i) > 0 ? 0.6 : 0.2})`;
      ctx.fillRect(sx, sy, 2, 2);
    }

    ctx.textAlign = 'center';

    if (game.endingType === 'true') {
      // 코어 이후의 엔딩 — 여정 전체의 자비와 마지막 선택에 따라 갈린다
      const ENDINGS = {
        home: {
          title: '진엔딩 — 집으로',
          color: '#ffd644',
          lines: [
            '너는 영이의 손을 잡고 코어를 걸어 나왔다.',
            '햇살 아래에서 박사님은 아주 오래 울었다.',
            '"미안하다"는 말과 "고맙다"는 말이',
            '몇 번이고 뒤섞였다.',
            '',
            '지워진 것은 사라진 것이 아니었다.',
            '누군가 기억하는 한, 다시 만날 수 있었다.',
            '',
            '— 모두의 마음을 안아 준 진정한 수호자에게 —',
          ],
          yeongi: true,
        },
        dawn: {
          title: '엔딩 — 새벽',
          color: '#7bd1f0',
          lines: [
            '"…내가, 결정할게."',
            '영이는 네 손 대신, 코어의 문을 열었다.',
            '',
            '"네가 깨워 준 친구들을 만나러 갈래.',
            '숲의, 호수의, 사막의, 정원의 친구들.',
            '…나 혼자 힘으로. 내 발로."',
            '',
            '며칠 뒤, 마을에 짧은 신호가 닿았다.',
            '— 새벽 공기는 처음인데, 꽤 좋아. 영이가. —',
          ],
          yeongi: false,
        },
        farewell: {
          title: '엔딩 — 작별',
          color: '#9aa8c8',
          lines: [
            '영이는 옅은 빛이 되어 흩어졌다.',
            '"…고마워. 마지막으로 누군가와',
            '이야기할 수 있어서, 좋았어."',
            '',
            '코어를 나서는 너의 등 뒤로',
            '꺼진 화면만이 조용히 남아 있었다.',
            '',
            '…어쩌면, 다른 결말도 있었을지 모른다.',
            '몬스터들의 마음을 더 많이 안아 주었다면.',
          ],
          yeongi: false,
        },
        silent: {
          title: '엔딩 — 침묵',
          color: '#777788',
          lines: [
            '너는 모든 문제에 옳은 답을 말했다.',
            '그리고 아무의 마음에도 머물지 않았다.',
            '',
            '몬스터들은 길을 비켰지만,',
            '아무도 너의 이름을 부르지 않았다.',
            '영이는 끝까지 네 눈을 보지 않은 채,',
            '조용히 화면을 껐다.',
            '',
            '…정답만으로는, 닿지 않는 마음이 있다.',
          ],
          yeongi: false,
        },
      };
      const e = ENDINGS[game.flags.endingId] || ENDINGS.farewell;
      ctx.fillStyle = e.color;
      ctx.font = 'bold 34px monospace';
      ctx.fillText(e.title, canvas.width / 2, 110);
      ctx.font = '16px monospace';
      ctx.fillStyle = '#ccc';
      let ty = 160;
      for (const l of e.lines) { ctx.fillText(l, canvas.width / 2, ty); ty += 26; }
      ctx.fillStyle = '#8a94c8';
      ctx.fillText(`맞힌 문제 ${game.flags.correctCount}개 · 안아 준 마음 ♥${game.flags.mercy}`, canvas.width / 2, ty + 10);
      if (e.yeongi) {
        const bob = Math.sin(game.time / 18) * 4;
        drawSprite(ctx, MONSTER_SPRITES.yeongi, canvas.width / 2 - 32, 420 + bob, 4);
      }
      if (game.endingT > 150) {
        ctx.fillStyle = Math.floor(game.time / 25) % 2 === 0 ? '#ffd644' : '#998822';
        ctx.font = '15px monospace';
        ctx.fillText('Z·스페이스를 누르면 마을로 돌아갑니다', canvas.width / 2, 510);
        if (justPressed('action')) {
          game.mode = 'world';
          game.map = 'village';
          game.player.x = 13; game.player.y = 16;
          game.player.px = 13 * TS; game.player.py = 16 * TS;
          save();
          Sound.playSong(MAPS.village.song);
        }
      }
      ctx.textAlign = 'left';
      return;
    }

    // 1차 엔딩 (스테이지 5 클리어)
    ctx.fillStyle = '#ffd644';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('축하합니다!', canvas.width / 2, 100);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('🏆 AI 윤리 수호자 인증서 🏆', canvas.width / 2, 155);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#ccc';
    const lines = [
      '위 어린이는 다섯 스테이지를 모두 넘으며',
      '개인정보 보호, 저작권, 진실 분별, 공정함, 절제,',
      '바른 말, 안전, 환경, 투명함, 책임, 창의성,',
      '협력, 그리고 사람을 아끼는 마음을 보여준',
      '훌륭한 AI 윤리 수호자임을 인증합니다.',
      '',
      `맞힌 문제: ${game.flags.correctCount}개`,
    ];
    let ty = 195;
    for (const l of lines) {
      ctx.fillText(l, canvas.width / 2, ty);
      ty += 25;
    }
    ctx.fillStyle = '#8a94c8';
    ctx.fillText('…그런데, 왕좌 뒤의 벽에서', canvas.width / 2, ty + 8);
    ctx.fillText('낡은 신호가 아직도 깜빡이고 있다.', canvas.width / 2, ty + 32);

    // 친구가 된 몬스터들 (두 줄 퍼레이드)
    const ids = Object.keys(MONSTER_SPRITES);
    for (let i = 0; i < ids.length; i++) {
      const row = i < 14 ? 0 : 1;
      const col = row === 0 ? i : i - 14;
      const perRow = row === 0 ? 14 : ids.length - 14;
      const bx = canvas.width / 2 - perRow * 20 + col * 40;
      const by = 428 + row * 38 + Math.sin(game.time / 15 + i) * 4;
      drawSprite(ctx, MONSTER_SPRITES[ids[i]], bx, by, 2);
    }

    if (game.endingT > 120) {
      ctx.fillStyle = Math.floor(game.time / 25) % 2 === 0 ? '#ffd644' : '#998822';
      ctx.font = '15px monospace';
      ctx.fillText('Z·스페이스를 누르면 모험이 계속됩니다', canvas.width / 2, 516);
      if (justPressed('action')) {
        game.mode = 'world';
        Sound.playSong(MAPS[game.map].song);
      }
    }
    ctx.textAlign = 'left';
  }

  // ---------- 메인 루프 ----------
  function frame() {
    game.time += 1;

    switch (game.mode) {
      case 'title':
        updateTitle();
        drawTitle();
        break;
      case 'world':
        updateWorld();
        drawWorld();
        break;
      case 'dialog':
        updateDialog();
        drawWorld();
        if (game.dialog) drawDialog();
        break;
      case 'battle':
        updateBattle();
        // 승리/패배 처리 중 모드가 바뀌었을 수 있음
        if (game.mode === 'battle') {
          drawBattle();
        } else {
          drawWorld();
          if (game.dialog) drawDialog();
        }
        break;
      case 'ending':
        drawEnding();
        break;
      case 'dex':
        updateDex();
        drawDex();
        break;
    }

    pressed.clear();
    requestAnimationFrame(frame);
  }

  // 타이틀 BGM은 첫 입력 후 시작 (브라우저 자동재생 정책)
  const startTitleMusic = () => {
    Sound.resume();
    if (game.mode === 'title') Sound.playSong('title');
    window.removeEventListener('keydown', startTitleMusic);
    window.removeEventListener('touchstart', startTitleMusic);
    window.removeEventListener('mousedown', startTitleMusic);
  };
  window.addEventListener('keydown', startTitleMusic);
  window.addEventListener('touchstart', startTitleMusic);
  window.addEventListener('mousedown', startTitleMusic);

  migrateOldSave();
  game.flags = newFlags();
  window.__game = game; // 디버그/테스트용
  frame();
})();
