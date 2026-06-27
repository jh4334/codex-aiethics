// 도트 스프라이트 정의 (16x16 문자 맵)
// '.' = 투명, 나머지 문자는 팔레트에서 색을 찾음

const BASE_PAL = {
  h: '#5b3a1e', // 머리
  f: '#ffd9a0', // 피부
  e: '#222233', // 눈
  r: '#e0453a', // 옷
  b: '#2a4fa0', // 바지
  w: '#ffffff',
  k: '#0c0c0c',
  p: '#9b5de5', // 보라
  g: '#5cb85c', // 초록
  l: '#4ea8de', // 파랑
  o: '#f08a24', // 주황
  n: '#f48fb1', // 분홍
  d: '#3a2e4d', // 어두운 보라
  y: '#ffd644', // 노랑
  c: '#b07b3f', // 나무/연필
  x: '#9aa0b0', // 회색
  q: '#d62828', // 빨강
  v: '#7bd1f0', // 하늘
  i: '#3a64b4', // 줄무늬 강조 (파랑)
  u: '#39354f', // 바지·신발 (어두운 남보라)
};

// ---- 플레이어 (방향별 2프레임) ----
const PLAYER_DOWN_0 = [
  '................',
  '.....hhhhhh.....',
  '....hhhhhhhhh...',
  '...hhhhhhhhhhh..',
  '...hfffffffhh...',
  '...ffwefwefff...',
  '...fffeffefff...',
  '....ffffnfff....',
  '....rrrrrrrr....',
  '...rriiiiiirr...',
  '...rrrrrrrrrr...',
  '..ffriiiiirff...',
  '....rrrrrrrr....',
  '.....uuu.uuu....',
  '.....uu...uu....',
  '......kk.kk.....',
];
const PLAYER_DOWN_1 = [
  '................',
  '.....hhhhhh.....',
  '....hhhhhhhhh...',
  '...hhhhhhhhhhh..',
  '...hfffffffhh...',
  '...ffwefwefff...',
  '...fffeffefff...',
  '....ffffnfff....',
  '....rrrrrrrr....',
  '...rriiiiiirr...',
  '...rrrrrrrrrr...',
  '..ffriiiiirff...',
  '....rrrrrrrr....',
  '.....uu..uuu....',
  '....uu.....uu...',
  '.....kk...kk....',
];
const PLAYER_UP_0 = [
  '................',
  '.....hhhhhh.....',
  '....hhhhhhhhh...',
  '...hhhhhhhhhhh..',
  '...hhhhhhhhhhh..',
  '...hhhhhhhhhhh..',
  '....hhhhhhhhhh..',
  '....ffffffffff..',
  '....rrrrrrrr....',
  '...rriiiiiirr...',
  '...rrrrrrrrrr...',
  '..ffriiiiirff...',
  '....rrrrrrrr....',
  '.....uuu.uuu....',
  '.....uu...uu....',
  '......kk.kk.....',
];
const PLAYER_UP_1 = [
  '................',
  '.....hhhhhh.....',
  '....hhhhhhhhh...',
  '...hhhhhhhhhhh..',
  '...hhhhhhhhhhh..',
  '...hhhhhhhhhhh..',
  '....hhhhhhhhhh..',
  '....ffffffffff..',
  '....rrrrrrrr....',
  '...rriiiiiirr...',
  '...rrrrrrrrrr...',
  '..ffriiiiirff...',
  '....rrrrrrrr....',
  '.....uu..uuu....',
  '....uu.....uu...',
  '.....kk...kk....',
];
const PLAYER_LEFT_0 = [
  '................',
  '......hhhhhh....',
  '.....hhhhhhhhh..',
  '....hhhhhhhhhhh.',
  '....hfffffhhhh..',
  '....fwefffffhh..',
  '....ffefffffh...',
  '.....fffnffff...',
  '....rrrrrrrr....',
  '...rriiiiiirr...',
  '...rrrrrrrrrr...',
  '....riiiiirff...',
  '....rrrrrrrr....',
  '.....uuu.uuu....',
  '.....uu...uu....',
  '......kk.kk.....',
];
const PLAYER_LEFT_1 = [
  '................',
  '......hhhhhh....',
  '.....hhhhhhhhh..',
  '....hhhhhhhhhhh.',
  '....hfffffhhhh..',
  '....fwefffffhh..',
  '....ffefffffh...',
  '.....fffnffff...',
  '....rrrrrrrr....',
  '...rriiiiiirr...',
  '...rrrrrrrrrr...',
  '....riiiiirff...',
  '....rrrrrrrr....',
  '.....uu..uuu....',
  '....uu.....uu...',
  '.....kk...kk....',
];

const PLAYER_SPRITES = {
  down: [PLAYER_DOWN_0, PLAYER_DOWN_1],
  up: [PLAYER_UP_0, PLAYER_UP_1],
  left: [PLAYER_LEFT_0, PLAYER_LEFT_1],
  // right는 left를 좌우 반전해서 그림
};

// ---- NPC 공용 몸체 (팔레트 교체용) — 둥근 체형, 넓은 옷, 짧은 다리 ----
const NPC_DOWN_0 = [
  '................',
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hffffffffffff.',
  '..fwwefffwwefff.',
  '..fffeffffefffff',
  '...fffnnnnffff..',
  '...rrrrrrrrrr...',
  '..rrrrrrrrrrrr..',
  '..frrrrrrrrrrrf.',
  '..rrrrrrrrrrrr..',
  '...bbbbbbbbbb...',
  '...bbbb..bbbb...',
  '...kkk....kkk...',
  '................',
];
const NPC_DOWN_1 = [
  '................',
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hffffffffffff.',
  '..fwwefffwwefff.',
  '..fffeffffefffff',
  '...fffnnnnffff..',
  '...rrrrrrrrrr...',
  '..rrrrrrrrrrrr..',
  '..frrrrrrrrrrrf.',
  '..rrrrrrrrrrrr..',
  '...bbbbbbbbbb...',
  '...bbb...bbbb...',
  '..kkk......kkk..',
  '................',
];
const NPC_SPRITES = { down: [NPC_DOWN_0, NPC_DOWN_1] };

// ---- NPC (NPC 공용 몸체 + 팔레트 교체) ----
const NPC_PALETTES = {
  prof:     { h: '#cfcfcf', r: '#f5f5f5', b: '#54585f' }, // 흰 가운 박사님
  kid:      { h: '#222222', r: '#ffd644', b: '#3a8f3a' }, // 노란 옷 아이
  grandma:  { h: '#e8e8e8', r: '#b06ab3', b: '#6d4c8f' }, // 할머니
  guard:    { h: '#3a3a3a', r: '#4ea8de', b: '#2a4fa0' }, // 파란 옷 안내원
  traveler: { h: '#7a4a2a', r: '#3a8f3a', b: '#5a4a3a' }, // 초록 옷 여행자
  merchant: { h: '#3a3a3a', r: '#c08a2a', b: '#6a4a2a' }, // 사막 상인
  mittens:  { h: '#a05a2a', r: '#e078a0', b: '#7a5aa0' }, // 분홍 옷 소녀
};

// 스프라이트 렌더 캐시
const _spriteCache = new Map();
// 스프라이트 배열마다 짧은 고유 id를 붙여, 매 프레임 256자 join을 피한다.
// (저사양 교실 태블릿에서 프레임마다 일어나던 문자열 할당/GC 부담을 줄임)
let _spriteSeq = 0;
const _spriteIds = new WeakMap();
function _spriteId(rows) {
  let id = _spriteIds.get(rows);
  if (id === undefined) { id = ++_spriteSeq; _spriteIds.set(rows, id); }
  return id;
}

function drawSprite(ctx, rows, x, y, scale, palOverride, flip) {
  const key = _spriteId(rows) + '|' + (palOverride ? JSON.stringify(palOverride) : '') + '|' + scale + (flip ? 'F' : '');
  let cv = _spriteCache.get(key);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = 16 * scale;
    cv.height = 16 * scale;
    const c = cv.getContext('2d');
    const pal = Object.assign({}, BASE_PAL, palOverride || {});
    for (let ry = 0; ry < rows.length; ry++) {
      const row = rows[ry];
      for (let rx = 0; rx < row.length; rx++) {
        const ch = row[rx];
        if (ch === '.') continue;
        c.fillStyle = pal[ch] || '#f0f';
        const px = flip ? (15 - rx) : rx;
        c.fillRect(px * scale, ry * scale, scale, scale);
      }
    }
    _spriteCache.set(key, cv);
  }
  ctx.drawImage(cv, x, y);
}
