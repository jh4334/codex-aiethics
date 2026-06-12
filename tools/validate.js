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

const { MAPS, MONSTERS, QUIZZES, WALKABLE, SONGS, MONSTER_SPRITES, PLAYER_SPRITES, BASE_PAL } =
  vm.runInContext('({ MAPS, MONSTERS, QUIZZES, WALKABLE, SONGS, MONSTER_SPRITES, PLAYER_SPRITES, BASE_PAL })', ctx);

let errors = 0;
const err = (msg) => { console.error('ERROR: ' + msg); errors++; };

// 1. 맵 행 너비
for (const [id, m] of Object.entries(MAPS)) {
  const w = m.tiles[0].length;
  m.tiles.forEach((row, y) => {
    if (row.length !== w) err(`${id} y=${y}: 길이 ${row.length} != ${w}`);
    for (const ch of row) {
      if (!'GPFSBCM1TWOHDRK*NYZJXEVILQ234A'.includes(ch)) err(`${id} y=${y}: 알 수 없는 타일 '${ch}'`);
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

  // 통일성: 모든 몬스터는 '마음의 선택'을 가진다
  if (!mon.mercy) { err(`몬스터 ${id}: mercy(마음의 선택) 없음`); continue; }
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

// 맵 출력 (눈으로 확인용)
if (process.argv.includes('--print')) {
  for (const [id, m] of Object.entries(MAPS)) {
    console.log(`\n=== ${id} (${m.tiles[0].length}x${m.tiles.length}) ===`);
    m.tiles.forEach((r) => console.log(r));
  }
}

if (errors === 0) console.log('✔ 모든 검사 통과');
else { console.error(`✘ 오류 ${errors}개`); process.exit(1); }
