// 게임 데이터 검증 스크립트 (Node.js)
// 사용법: node tools/validate.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = {
  window: undefined,
  document: { createElement: () => ({ getContext: () => null }) },
  console,
  Math, Set, Map, JSON, Object,
};
ctx.window = ctx;
vm.createContext(ctx);

for (const f of ['src/sprites.js', 'src/audio.js', 'src/data.js']) {
  const code = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
  vm.runInContext(code, ctx, { filename: f });
}

const { MAPS, MONSTERS, QUIZZES, WALKABLE, SONGS, MONSTER_SPRITES, PLAYER_SPRITES, BASE_PAL,
  MONSTER_DEX, DEX_ORDER, MAP_PROPS, BOSS_ATTACKS, getObjectiveTarget } =
  vm.runInContext('({ MAPS, MONSTERS, QUIZZES, WALKABLE, SONGS, MONSTER_SPRITES, PLAYER_SPRITES, BASE_PAL, MONSTER_DEX, DEX_ORDER, MAP_PROPS, BOSS_ATTACKS, getObjectiveTarget })', ctx);

let errors = 0;
const err = (msg) => { console.error('ERROR: ' + msg); errors++; };

// 1. 맵 행 너비
for (const [id, m] of Object.entries(MAPS)) {
  const w = m.tiles[0].length;
  m.tiles.forEach((row, y) => {
    if (row.length !== w) err(`${id} y=${y}: 길이 ${row.length} != ${w}`);
    for (const ch of row) {
      if (!'GPFSBCM1TWOHDRK*NYZJXEVILQ234A5'.includes(ch)) err(`${id} y=${y}: 알 수 없는 타일 '${ch}'`);
    }
  });
}

// 2. 워프 좌표 검사
for (const [id, m] of Object.entries(MAPS)) {
  for (const w of m.warps) {
    const src = m.tiles[w.y] && m.tiles[w.y][w.x];
    if (!src || !WALKABLE.has(src)) err(`${id} 워프 (${w.x},${w.y}) 출발 타일이 '${src}' (이동 불가)`);
    const tm = MAPS[w.to];
    if (!tm) { err(`${id} 워프 목적지 맵 '${w.to}' 없음`); continue; }
    const dst = tm.tiles[w.ty] && tm.tiles[w.ty][w.tx];
    if (!dst || !WALKABLE.has(dst)) err(`${id}→${w.to} 도착 (${w.tx},${w.ty}) 타일이 '${dst}' (이동 불가)`);
  }
}

// 3. NPC/몬스터/표지판 위치
for (const [id, m] of Object.entries(MAPS)) {
  for (const n of m.npcs) {
    const t = m.tiles[n.y][n.x];
    if (!WALKABLE.has(t)) err(`${id} NPC ${n.id} (${n.x},${n.y}) 타일 '${t}' 위에 있음`);
  }
  for (const mo of m.monsters) {
    const t = m.tiles[mo.y][mo.x];
    if (!WALKABLE.has(t)) err(`${id} 몬스터 ${mo.id} (${mo.x},${mo.y}) 타일 '${t}' 위에 있음`);
    if (!MONSTERS[mo.id]) err(`${id} 몬스터 ${mo.id} 정의 없음`);
    if (!MONSTER_SPRITES[mo.id]) err(`${id} 몬스터 ${mo.id} 스프라이트 없음`);
  }
  for (const s of m.signs) {
    const t = m.tiles[s.y][s.x];
    if (t !== 'Y') err(`${id} 표지판 (${s.x},${s.y}) 타일이 '${t}' (Y 아님)`);
  }
}

// 4. 도달 가능성 (BFS, 배지 게이트 무시)
{
  // 몬스터는 쓰러뜨리면 사라지므로 도달 가능성 검사에서는 통과 가능으로 취급
  const solidEntity = (mapId, x, y) => {
    const m = MAPS[mapId];
    return m.npcs.some((n) => n.x === x && n.y === y);
  };
  const key = (mapId, x, y) => `${mapId}:${x},${y}`;
  const visited = new Set();
  const queue = [['village', 13, 16]];
  visited.add(key('village', 13, 16));
  while (queue.length) {
    const [mapId, x, y] = queue.shift();
    const m = MAPS[mapId];
    const warp = m.warps.find((w) => w.x === x && w.y === y);
    if (warp) {
      const k = key(warp.to, warp.tx, warp.ty);
      if (!visited.has(k)) { visited.add(k); queue.push([warp.to, warp.tx, warp.ty]); }
    }
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nx = x + dx, ny = y + dy;
      if (ny < 0 || ny >= m.tiles.length || nx < 0 || nx >= m.tiles[0].length) continue;
      if (!WALKABLE.has(m.tiles[ny][nx])) continue;
      if (solidEntity(mapId, nx, ny)) continue;
      const k = key(mapId, nx, ny);
      if (!visited.has(k)) { visited.add(k); queue.push([mapId, nx, ny]); }
    }
  }
  const adjacentReachable = (mapId, x, y) =>
    [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => visited.has(key(mapId, x + dx, y + dy)));
  for (const [id, m] of Object.entries(MAPS)) {
    for (const n of m.npcs) if (!adjacentReachable(id, n.x, n.y)) err(`${id} NPC ${n.id} 도달 불가`);
    for (const mo of m.monsters) if (!adjacentReachable(id, mo.x, mo.y)) err(`${id} 몬스터 ${mo.id} 도달 불가`);
    for (const s of m.signs) if (!adjacentReachable(id, s.x, s.y)) err(`${id} 표지판 (${s.x},${s.y}) 도달 불가`);
    for (const w of m.warps) if (!visited.has(key(id, w.x, w.y)) && !adjacentReachable(id, w.x, w.y)) err(`${id} 워프 (${w.x},${w.y}) 도달 불가`);
  }
}

// 5. 스프라이트 크기/팔레트
const checkSprite = (name, rows) => {
  if (rows.length !== 16) err(`스프라이트 ${name}: 행 수 ${rows.length} != 16`);
  rows.forEach((row, y) => {
    if (row.length !== 16) err(`스프라이트 ${name} y=${y}: 길이 ${row.length} != 16`);
    for (const ch of row) {
      if (ch !== '.' && !BASE_PAL[ch]) err(`스프라이트 ${name} y=${y}: 팔레트에 없는 문자 '${ch}'`);
    }
  });
};
for (const [id, rows] of Object.entries(MONSTER_SPRITES)) checkSprite(id, rows);
for (const [dir, frames] of Object.entries(PLAYER_SPRITES)) {
  frames.forEach((f, i) => checkSprite(`player.${dir}[${i}]`, f));
}

// 6. 곡 트랙 길이 일치
for (const [name, song] of Object.entries(SONGS)) {
  const lens = song.tracks.map((t) => t.notes.reduce((s, [, d]) => s + d, 0));
  if (new Set(lens).size > 1) err(`곡 ${name}: 트랙 길이 불일치 ${lens.join(', ')}`);
}

// 7. 퀴즈 검사
for (const [topic, list] of Object.entries(QUIZZES)) {
  list.forEach((q, i) => {
    if (q.a.length !== 3) err(`퀴즈 ${topic}[${i}]: 보기 ${q.a.length}개 (3개 필요)`);
    if (q.c < 0 || q.c >= q.a.length) err(`퀴즈 ${topic}[${i}]: 정답 번호 ${q.c} 범위 밖`);
    if (!q.why) err(`퀴즈 ${topic}[${i}]: 해설 없음`);
  });
}
for (const [id, mon] of Object.entries(MONSTERS)) {
  const topics = Array.isArray(mon.topic) ? mon.topic : [mon.topic];
  let pool = 0;
  for (const t of topics) {
    if (!QUIZZES[t]) err(`몬스터 ${id}: 퀴즈 주제 '${t}' 없음`);
    else pool += QUIZZES[t].length;
  }
  if (pool < mon.hp) err(`몬스터 ${id}: 퀴즈 수(${pool}) < HP(${mon.hp})`);

  // 통일성: 본편 몬스터는 '마음의 선택'을 가진다 (보너스 몬스터는 자유 연습용이라 없음)
  if (!mon.mercy) {
    if (mon.bonus) continue;
    err(`몬스터 ${id}: mercy(마음의 선택) 없음`); continue;
  }
  if (!mon.mercy.prompt) err(`몬스터 ${id}: mercy.prompt 없음`);
  if (!mon.mercy.options || mon.mercy.options.length !== 3) {
    err(`몬스터 ${id}: mercy 선택지는 3개여야 함`);
  } else {
    let mercyCount = 0;
    for (const o of mon.mercy.options) {
      if (!o.label || !o.reply) err(`몬스터 ${id}: mercy 선택지에 label/reply 없음`);
      if (!['mercy', 'neutral', 'harsh'].includes(o.kind)) err(`몬스터 ${id}: mercy kind '${o.kind}' 잘못됨`);
      if (o.kind === 'mercy') mercyCount++;
    }
    if (mercyCount !== 1) err(`몬스터 ${id}: 'mercy' 선택지는 정확히 1개여야 함 (현재 ${mercyCount})`);
  }
}

// 8. 도감: 모든 몬스터가 도감 정보를 가지며, DEX_ORDER가 정확히 일치
for (const id of Object.keys(MONSTERS)) {
  if (!MONSTER_DEX[id]) err(`도감: 몬스터 ${id} 정보 없음`);
  else {
    if (!MONSTER_DEX[id].theme) err(`도감 ${id}: theme 없음`);
    if (!MONSTER_DEX[id].learn) err(`도감 ${id}: learn 없음`);
  }
  if (!DEX_ORDER.includes(id)) err(`도감 순서(DEX_ORDER)에 ${id} 빠짐`);
}
for (const id of DEX_ORDER) {
  if (!MONSTERS[id]) err(`DEX_ORDER의 ${id}는 존재하지 않는 몬스터`);
}
if (DEX_ORDER.length !== new Set(DEX_ORDER).size) err('DEX_ORDER에 중복 있음');

// 9. 보스 공격: 패턴/지속시간이 올바른지
for (const [id, atk] of Object.entries(BOSS_ATTACKS)) {
  if (!MONSTERS[id]) err(`보스 공격: ${id}는 존재하지 않는 몬스터`);
  if (!['rain', 'sides', 'burst', 'spiral', 'wall', 'zigzag'].includes(atk.pattern)) err(`보스 공격 ${id}: 패턴 '${atk.pattern}' 잘못됨`);
  if (!(atk.dur > 0)) err(`보스 공격 ${id}: dur 잘못됨`);
}

// 10. 조사 지점: 맵 범위 안 + 인접 칸이 이동 가능(살펴볼 수 있어야 함)
for (const [mapId, props] of Object.entries(MAP_PROPS)) {
  const m = MAPS[mapId];
  if (!m) { err(`조사: 맵 '${mapId}' 없음`); continue; }
  for (const p of props) {
    if (p.y < 0 || p.y >= m.tiles.length || p.x < 0 || p.x >= m.tiles[0].length) {
      err(`조사 ${mapId} (${p.x},${p.y}): 맵 범위 밖`); continue;
    }
    if (!p.text) err(`조사 ${mapId} (${p.x},${p.y}): 텍스트 없음`);
    const faceable = [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => {
      const nx = p.x + dx, ny = p.y + dy;
      if (ny < 0 || ny >= m.tiles.length || nx < 0 || nx >= m.tiles[0].length) return false;
      return WALKABLE.has(m.tiles[ny][nx]);
    });
    if (!faceable) err(`조사 ${mapId} (${p.x},${p.y}): 마주 볼 수 있는 칸이 없음`);
  }
}

// 11. 목표 안내 일관성: 진행 순서대로 defeated 플래그를 채워 가며,
//     getObjectiveTarget가 가리키는 맵에 그 라벨의 몬스터가 실제로 있는지 검사한다.
//     (스테이지 재구성 후 안내 화살표가 빈 타일을 가리키는 회귀를 막는다.)
if (typeof getObjectiveTarget === 'function') {
  const nameToId = {};
  for (const [id, mon] of Object.entries(MONSTERS)) nameToId[mon.name] = id;
  // getObjective가 검사하는 자연스러운 처치 순서
  const order = ['bekkyeomon', 'mollaemon', 'jungdokmon', 'geojitmon', 'pyeonhyangmon', 'hondonmon',
    'somunmon', 'musimon', 'meotdaeromon', 'nangbimon', 'pinggyemon', 'tteonemgimon',
    'sideulmon', 'ppaeatmon', 'hollimmon', 'maearimon', 'geurimjamon', 'finalboss',
    'tturimmon', 'girokmon', 'sujipmon', 'saseomon', 'piltermon', 'mirrormon',
    'yuhokmon', 'soksagimon', 'jogakmon', 'yeongi'];
  const flags = { talkedProf: true, badges: { forest: true, lake: true, cave: true }, defeated: {}, mercy: 0, trueEnding: false };
  const checkTarget = () => {
    const t = getObjectiveTarget(flags);
    if (!t || !t.label) return;
    const monId = nameToId[t.label];
    if (!monId) return; // 박사님/영이/??? 등 몬스터 아님
    const m = MAPS[t.map];
    if (!m) { err(`목표 안내: 맵 '${t.map}' 없음`); return; }
    if (!m.monsters.some((mo) => mo.id === monId)) {
      err(`목표 안내: '${t.label}'를 ${t.map}로 안내하지만 그 맵에 해당 몬스터가 없음`);
    }
  };
  checkTarget();
  for (const id of order) { flags.defeated[id] = true; checkTarget(); }
}

// 맵 출력 (눈으로 확인용)
if (process.argv.includes('--print')) {
  for (const [id, m] of Object.entries(MAPS)) {
    console.log(`\n=== ${id} (${m.tiles[0].length}x${m.tiles.length}) ===`);
    m.tiles.forEach((r) => console.log(r));
  }
}

// 생성된 교사용 문서가 퀴즈 데이터와 어긋나지 않았는지 점검
// (퀴즈를 바꾸고 `node tools/quizlist.js`를 다시 돌리지 않은 경우를 잡는다)
(() => {
  const docPath = path.join(__dirname, '..', 'docs', '주제별-문제-목록.md');
  if (!fs.existsSync(docPath)) return; // 문서가 아직 없으면 통과(선택 사항)
  let totalQ = 0;
  for (const t of Object.keys(QUIZZES)) totalQ += QUIZZES[t].length;
  const txt = fs.readFileSync(docPath, 'utf8');
  const mt = txt.match(/전체 문항 수:\s*\*\*(\d+)문항\*\*/);
  const mTopic = txt.match(/주제 수:\s*\*\*(\d+)개\*\*/);
  if (!mt || Number(mt[1]) !== totalQ) {
    err(`교사용 문서 문항 수 불일치(문서 ${mt ? mt[1] : '?'} vs 데이터 ${totalQ}). 'node tools/quizlist.js'로 다시 생성하세요`);
  }
  if (!mTopic || Number(mTopic[1]) !== Object.keys(QUIZZES).length) {
    err(`교사용 문서 주제 수 불일치. 'node tools/quizlist.js'로 다시 생성하세요`);
  }
})();

if (errors === 0) console.log('✔ 모든 검사 통과');
else { console.error(`✘ 오류 ${errors}개`); process.exit(1); }
