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

const {
  MAPS, WALKABLE, SONGS, PLAYER_SPRITES, BASE_PAL, MAP_PROPS,
  getObjectiveTarget, ETHICS_AXES, ETHICS_LABELS, STAGE_THEMES, STAGE_PUZZLES,
  ETHICS_AXIS_MAX, computeEthicsScore, computeEnding, emptyPuzzles, setStagePuzzleChoice,
  isStagePuzzleComplete,
} = vm.runInContext(
  '({ MAPS, WALKABLE, SONGS, PLAYER_SPRITES, BASE_PAL, MAP_PROPS, getObjectiveTarget, ETHICS_AXES, ETHICS_LABELS, STAGE_THEMES, STAGE_PUZZLES, ETHICS_AXIS_MAX, computeEthicsScore, computeEnding, emptyPuzzles, setStagePuzzleChoice, isStagePuzzleComplete })',
  ctx,
);

let errors = 0;
const err = (msg) => { console.error('ERROR: ' + msg); errors++; };
const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const key = (mapId, x, y) => `${mapId}:${x},${y}`;

for (const [id, m] of Object.entries(MAPS)) {
  if (!isStr(m.name)) err(`${id}: name 누락`);
  if (!SONGS[m.song]) err(`${id}: song '${m.song}' 없음`);
  const w = m.tiles[0].length;
  m.tiles.forEach((row, y) => {
    if (row.length !== w) err(`${id} y=${y}: 길이 ${row.length} != ${w}`);
    for (const ch of row) {
      if (!'GPFSBCM1TWOHDRK*NYZJXEVILQ234A5'.includes(ch)) err(`${id} y=${y}: 알 수 없는 타일 '${ch}'`);
    }
  });
  if (!Array.isArray(m.warps)) err(`${id}: warps 배열 아님`);
  if (!Array.isArray(m.npcs)) err(`${id}: npcs 배열 아님`);
  if (!Array.isArray(m.signs)) err(`${id}: signs 배열 아님`);
}

if (!Array.isArray(ETHICS_AXES) || ETHICS_AXES.join(',') !== 'privacy,perspective,fairness,verification,responsibility') {
  err('윤리 축은 privacy,perspective,fairness,verification,responsibility 순서의 5개여야 함');
}
for (const axis of ETHICS_AXES) {
  if (!isStr(ETHICS_LABELS[axis])) err(`윤리 축 라벨 누락: ${axis}`);
}
if (ETHICS_AXIS_MAX <= 0 || computeEthicsScore(Object.fromEntries(ETHICS_AXES.map((axis) => [axis, ETHICS_AXIS_MAX]))) !== 100) {
  err('윤리 점수 만점 계산이 100이 아님');
}
if (!['home', 'dawn', 'farewell', 'blackbox', 'silent'].includes(computeEnding(Object.fromEntries(ETHICS_AXES.map((axis) => [axis, 0]))))) {
  err('엔딩 계산 결과가 알려진 엔딩 ID가 아님');
}

if (!Array.isArray(STAGE_THEMES) || STAGE_THEMES.length !== 5) {
  err('스테이지 테마는 5개여야 함');
} else {
  const seenStages = new Set();
  const seenAxes = new Set();
  for (const theme of STAGE_THEMES) {
    if (!Number.isInteger(theme.stage) || theme.stage < 1 || theme.stage > 5) err(`스테이지 테마 stage 잘못됨: ${theme.stage}`);
    if (!theme.id || !theme.name || !theme.axis || !theme.lesson || !theme.gate) err(`스테이지 테마 필드 누락: ${JSON.stringify(theme)}`);
    if (!STAGE_PUZZLES[theme.id]) err(`스테이지 테마 ${theme.id}: 연결된 퍼즐 없음`);
    if (!ETHICS_AXES.includes(theme.axis)) err(`스테이지 테마 axis 잘못됨: ${theme.axis}`);
    seenStages.add(theme.stage);
    seenAxes.add(theme.axis);
  }
  if (seenStages.size !== 5) err('스테이지 테마 stage가 1~5를 정확히 한 번씩 포함해야 함');
  if (seenAxes.size !== 5) err('스테이지 테마는 5개 윤리 축을 각각 한 번씩 다뤄야 함');
}

for (const [puzzleId, puzzle] of Object.entries(STAGE_PUZZLES || {})) {
  if (!puzzle.map || !MAPS[puzzle.map]) { err(`퍼즐 ${puzzleId}: 맵 없음`); continue; }
  if (!ETHICS_AXES.includes(puzzle.axis)) err(`퍼즐 ${puzzleId}: axis 잘못됨`);
  if (!isStr(puzzle.title)) err(`퍼즐 ${puzzleId}: title 없음`);
  if (!isStr(puzzle.prompt)) err(`퍼즐 ${puzzleId}: prompt 없음`);
  if (!isStr(puzzle.completeText)) err(`퍼즐 ${puzzleId}: completeText 없음`);
  if (!isStr(puzzle.reflectionText) || !puzzle.reflectionText.includes('배움 조각')) err(`퍼즐 ${puzzleId}: 배움 조각 성찰 문구 없음`);
  if (!Array.isArray(puzzle.doors) || puzzle.doors.length < 2) err(`퍼즐 ${puzzleId}: 문 선택지 부족`);
  if (!Array.isArray(puzzle.clues) || puzzle.clues.length < 3) err(`퍼즐 ${puzzleId}: 단서 3개 이상 필요`);
  const doorIds = new Set();
  for (const door of puzzle.doors || []) {
    if (!isStr(door.id) || !isStr(door.label)) err(`퍼즐 ${puzzleId}: 문 id/label 누락`);
    if (doorIds.has(door.id)) err(`퍼즐 ${puzzleId}: 문 id 중복 ${door.id}`);
    doorIds.add(door.id);
  }
  if (puzzle.loopTo) {
    const loopMap = MAPS[puzzle.loopTo.map];
    const loopTile = loopMap && loopMap.tiles[puzzle.loopTo.y] && loopMap.tiles[puzzle.loopTo.y][puzzle.loopTo.x];
    if (!loopMap || !WALKABLE.has(loopTile)) err(`퍼즐 ${puzzleId}: loopTo 이동 불가`);
  }
  const m = MAPS[puzzle.map];
  let simulated = emptyPuzzles();
  for (const clue of puzzle.clues || []) {
    const tile = m.tiles[clue.y] && m.tiles[clue.y][clue.x];
    if (!tile) err(`퍼즐 ${puzzleId}/${clue.id}: 단서 좌표 맵 밖`);
    if (!isStr(clue.label) || !isStr(clue.text) || !isStr(clue.correctText) || !isStr(clue.wrongText)) err(`퍼즐 ${puzzleId}/${clue.id}: 문구 누락`);
    if (!doorIds.has(clue.correctDoor)) err(`퍼즐 ${puzzleId}/${clue.id}: 정답 문 없음`);
    if (!clue.stand) { err(`퍼즐 ${puzzleId}/${clue.id}: stand 없음`); continue; }
    const standTile = m.tiles[clue.stand.y] && m.tiles[clue.stand.y][clue.stand.x];
    if (!WALKABLE.has(standTile)) err(`퍼즐 ${puzzleId}/${clue.id}: stand 이동 불가`);
    simulated = setStagePuzzleChoice(simulated, puzzleId, clue.id, clue.correctDoor);
  }
  if (!isStagePuzzleComplete(simulated, puzzleId)) err(`퍼즐 ${puzzleId}: 정답 선택 후 완료되지 않음`);
}

for (const [id, m] of Object.entries(MAPS)) {
  for (const w of m.warps) {
    const src = m.tiles[w.y] && m.tiles[w.y][w.x];
    if (!src || !WALKABLE.has(src)) err(`${id} 워프 (${w.x},${w.y}) 출발 타일이 '${src}' (이동 불가)`);
    const tm = MAPS[w.to];
    if (!tm) { err(`${id} 워프 목적지 맵 '${w.to}' 없음`); continue; }
    if (w.needPuzzle && !STAGE_PUZZLES[w.needPuzzle]) err(`${id} 워프 (${w.x},${w.y}) needPuzzle '${w.needPuzzle}' 없음`);
    if (w.lockText && !w.needPuzzle) err(`${id} 워프 (${w.x},${w.y}) lockText가 있지만 needPuzzle 없음`);
    const dst = tm.tiles[w.ty] && tm.tiles[w.ty][w.tx];
    if (!dst || !WALKABLE.has(dst)) err(`${id}→${w.to} 도착 (${w.tx},${w.ty}) 타일이 '${dst}' (이동 불가)`);
    const landWarp = (tm.warps || []).find((w2) => w2.x === w.tx && w2.y === w.ty);
    if (landWarp) err(`${id}→${w.to} 도착 (${w.tx},${w.ty})가 또 다른 워프 칸 (즉시 재이동 위험)`);
  }
}

for (const [id, m] of Object.entries(MAPS)) {
  for (const n of m.npcs) {
    const t = m.tiles[n.y] && m.tiles[n.y][n.x];
    if (!WALKABLE.has(t)) err(`${id} NPC ${n.id} (${n.x},${n.y}) 타일 '${t}' 위에 있음`);
  }
  for (const s of m.signs) {
    const t = m.tiles[s.y] && m.tiles[s.y][s.x];
    if (t !== 'Y') err(`${id} 표지판 (${s.x},${s.y}) 타일이 '${t}' (Y 아님)`);
  }
}

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
    if (m.npcs.some((n) => n.x === nx && n.y === ny)) continue;
    const k = key(mapId, nx, ny);
    if (!visited.has(k)) { visited.add(k); queue.push([mapId, nx, ny]); }
  }
}
const adjacentReachable = (mapId, x, y) =>
  [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => visited.has(key(mapId, x + dx, y + dy)));
for (const [id, m] of Object.entries(MAPS)) {
  for (const n of m.npcs) if (!adjacentReachable(id, n.x, n.y)) err(`${id} NPC ${n.id} 도달 불가`);
  for (const s of m.signs) if (!adjacentReachable(id, s.x, s.y)) err(`${id} 표지판 (${s.x},${s.y}) 도달 불가`);
  for (const w of m.warps) if (!visited.has(key(id, w.x, w.y)) && !adjacentReachable(id, w.x, w.y)) err(`${id} 워프 (${w.x},${w.y}) 도달 불가`);
}

const checkSprite = (name, rows) => {
  if (rows.length !== 16) err(`스프라이트 ${name}: 행 수 ${rows.length} != 16`);
  rows.forEach((row, y) => {
    if (row.length !== 16) err(`스프라이트 ${name} y=${y}: 길이 ${row.length} != 16`);
    for (const ch of row) {
      if (ch !== '.' && !BASE_PAL[ch]) err(`스프라이트 ${name} y=${y}: 팔레트에 없는 문자 '${ch}'`);
    }
  });
};
for (const [dir, frames] of Object.entries(PLAYER_SPRITES)) {
  frames.forEach((f, i) => checkSprite(`player.${dir}[${i}]`, f));
}

for (const [name, song] of Object.entries(SONGS)) {
  const lens = song.tracks.map((t) => t.notes.reduce((s, [, d]) => s + d, 0));
  if (new Set(lens).size > 1) err(`곡 ${name}: 트랙 길이 불일치 ${lens.join(', ')}`);
}

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

if (typeof getObjectiveTarget === 'function') {
  const flags = { talkedProf: true, puzzles: emptyPuzzles() };
  for (const [puzzleId, puzzle] of Object.entries(STAGE_PUZZLES).sort((a, b) => a[1].stage - b[1].stage)) {
    const target = getObjectiveTarget(flags);
    if (!target || target.map !== puzzle.map) err(`목표 안내: ${puzzleId} 단계에서 ${puzzle.map}을 가리키지 않음`);
    if (target && !adjacentReachable(target.map, target.x, target.y)) err(`목표 안내: ${target.label} (${target.map}:${target.x},${target.y}) 도달 불가`);
    for (const clue of puzzle.clues) flags.puzzles = setStagePuzzleChoice(flags.puzzles, puzzleId, clue.id, clue.correctDoor);
  }
  const finalTarget = getObjectiveTarget(flags);
  if (!finalTarget || !MAPS[finalTarget.map]) err('목표 안내: 최종 리포트 목표 맵 없음');
}

if (process.argv.includes('--print')) {
  for (const [id, m] of Object.entries(MAPS)) {
    console.log(`\n=== ${id} (${m.tiles[0].length}x${m.tiles.length}) ===`);
    m.tiles.forEach((r) => console.log(r));
  }
}

(() => {
  const docPath = path.join(__dirname, '..', 'docs', '주제별-문제-목록.md');
  if (!fs.existsSync(docPath)) return;
  const totalQ = Object.values(STAGE_PUZZLES).reduce((sum, puzzle) => sum + puzzle.clues.length, 0);
  const txt = fs.readFileSync(docPath, 'utf8');
  const mt = txt.match(/전체 퍼즐 단서 수:\s*\*\*(\d+)개\*\*/);
  const mTopic = txt.match(/스테이지 퍼즐 수:\s*\*\*(\d+)개\*\*/);
  if (!mt || Number(mt[1]) !== totalQ) {
    err(`교사용 문서 단서 수 불일치(문서 ${mt ? mt[1] : '?'} vs 데이터 ${totalQ}). 'node tools/quizlist.js'로 다시 생성하세요`);
  }
  if (!mTopic || Number(mTopic[1]) !== Object.keys(STAGE_PUZZLES).length) {
    err(`교사용 문서 퍼즐 수 불일치. 'node tools/quizlist.js'로 다시 생성하세요`);
  }
})();

(() => {
  const gj = fs.readFileSync(path.join(__dirname, '..', 'src', 'game.js'), 'utf8');
  const ed = path.join(__dirname, 'editor.html');
  if (!fs.existsSync(ed)) return;
  const eh = fs.readFileSync(ed, 'utf8');
  const num = (re, src) => { const m = src.match(re); return m ? Number(m[1]) : null; };
  const game = {
    q: num(/Q_MAX\s*=\s*(\d+)/, gj), a: num(/A_MAX\s*=\s*(\d+)/, gj),
    why: num(/WHY_MAX\s*=\s*(\d+)/, gj), max: num(/CUSTOM_MAX\s*=\s*(\d+)/, gj),
  };
  const m = eh.match(/LIMITS\s*=\s*\{\s*q:\s*(\d+),\s*a:\s*(\d+),\s*why:\s*(\d+),\s*max:\s*(\d+)/);
  const edl = m ? { q: +m[1], a: +m[2], why: +m[3], max: +m[4] } : null;
  if (!edl) { err('editor.html에서 LIMITS를 찾지 못함'); return; }
  for (const k of ['q', 'a', 'why', 'max']) {
    if (game[k] !== edl[k]) err(`커스텀 퀴즈 한도 불일치(${k}): 게임 ${game[k]} vs 편집기 ${edl[k]}`);
  }
})();

if (errors === 0) console.log('✔ 모든 검사 통과');
else { console.error(`✘ 오류 ${errors}개`); process.exit(1); }
