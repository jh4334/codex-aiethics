// 도트 스프라이트 정의 (16x16 문자 맵)
// '.' = 투명, 나머지 문자는 팔레트에서 색을 찾음

const BASE_PAL = {
  h: '#5b3a1e', // 머리
  f: '#ffd9a0', // 피부
  e: '#222233', // 눈
  r: '#e0453a', // 옷
  b: '#2a4fa0', // 바지
  w: '#ffffff',
  k: '#1a1a24',
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
};

// ---- 플레이어 (방향별 2프레임) ----
const PLAYER_DOWN_0 = [
  '................',
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hhffffffffhh..',
  '..hffeffffeffh..',
  '...ffffffffff...',
  '....ffffffff....',
  '....rrrrrrrr....',
  '...rrrrrrrrrr...',
  '..ffrrrrrrrrff..',
  '...rrrrrrrrrr...',
  '....bbbbbbbb....',
  '....bbb..bbb....',
  '....ff....ff....',
  '................',
];
const PLAYER_DOWN_1 = [
  '................',
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hhffffffffhh..',
  '..hffeffffeffh..',
  '...ffffffffff...',
  '....ffffffff....',
  '....rrrrrrrr....',
  '...rrrrrrrrrr...',
  '..ffrrrrrrrrff..',
  '...rrrrrrrrrr...',
  '....bbbbbbbb....',
  '....bb....bbb...',
  '....ff.....ff...',
  '................',
];
const PLAYER_UP_0 = [
  '................',
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hhhhhhhhhhhh..',
  '..hhhhhhhhhhhh..',
  '...hhhhhhhhhh...',
  '....ffffffff....',
  '....rrrrrrrr....',
  '...rrrrrrrrrr...',
  '..ffrrrrrrrrff..',
  '...rrrrrrrrrr...',
  '....bbbbbbbb....',
  '....bbb..bbb....',
  '....ff....ff....',
  '................',
];
const PLAYER_UP_1 = [
  '................',
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hhhhhhhhhhhh..',
  '..hhhhhhhhhhhh..',
  '...hhhhhhhhhh...',
  '....ffffffff....',
  '....rrrrrrrr....',
  '...rrrrrrrrrr...',
  '..ffrrrrrrrrff..',
  '...rrrrrrrrrr...',
  '....bbbbbbbb....',
  '...bbb....bb....',
  '...ff.....ff....',
  '................',
];
const PLAYER_LEFT_0 = [
  '................',
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hffffffhhhhh..',
  '..hfeffffhhhhh..',
  '...ffffffhhhh...',
  '....ffffffff....',
  '....rrrrrrrr....',
  '...rrrrrrrrrr...',
  '...ffrrrrrrrr...',
  '...rrrrrrrrrr...',
  '....bbbbbbbb....',
  '....bbb..bbb....',
  '....ff....ff....',
  '................',
];
const PLAYER_LEFT_1 = [
  '................',
  '....hhhhhhhh....',
  '...hhhhhhhhhh...',
  '..hhhhhhhhhhhh..',
  '..hffffffhhhhh..',
  '..hfeffffhhhhh..',
  '...ffffffhhhh...',
  '....ffffffff....',
  '....rrrrrrrr....',
  '...rrrrrrrrrr...',
  '...ffrrrrrrrr...',
  '...rrrrrrrrrr...',
  '....bbbbbbbb....',
  '...bbb...bbb....',
  '...ff.....ff....',
  '................',
];

const PLAYER_SPRITES = {
  down: [PLAYER_DOWN_0, PLAYER_DOWN_1],
  up: [PLAYER_UP_0, PLAYER_UP_1],
  left: [PLAYER_LEFT_0, PLAYER_LEFT_1],
  // right는 left를 좌우 반전해서 그림
};

// ---- NPC (플레이어 스프라이트 + 팔레트 교체) ----
const NPC_PALETTES = {
  prof:    { h: '#cfcfcf', r: '#f5f5f5', b: '#54585f' }, // 흰 가운 박사님
  kid:     { h: '#222222', r: '#ffd644', b: '#3a8f3a' }, // 노란 옷 아이
  grandma: { h: '#e8e8e8', r: '#b06ab3', b: '#6d4c8f' }, // 할머니
  guard:   { h: '#3a3a3a', r: '#4ea8de', b: '#2a4fa0' }, // 파란 옷 안내원
};

// ---- 몬스터 ----
const MONSTER_SPRITES = {
  // 몰래몬: 개인정보를 훔쳐보는 보라색 유령 (도둑 가면)
  mollaemon: [
    '................',
    '.....pppppp.....',
    '....pppppppp....',
    '...pppppppppp...',
    '..pppppppppppp..',
    '..kkkkkkkkkkkk..',
    '..kwekkkkkwekk..',
    '..kkkkkkkkkkkk..',
    '..pppppppppppp..',
    '..ppppkkkkpppp..',
    '..pppppppppppp..',
    '..pppppppppppp..',
    '..pppppppppppp..',
    '...pp.ppp.ppp...',
    '....p..pp..p....',
    '................',
  ],
  // 베껴몬: 남의 것을 베끼는 초록 몬스터 (연필 들고 있음)
  bekkyeomon: [
    '................',
    '.....gggggg...y.',
    '....gggggggg..c.',
    '...gggggggggg.c.',
    '..gggggggggggcc.',
    '..ggweggggweggc.',
    '..ggeeggggeegg..',
    '..gggggggggggg..',
    '..ggggkkkkgggg..',
    '..gggkggggkggg..',
    '..gggggggggggg..',
    '..gggggggggggg..',
    '...gggggggggg...',
    '....gg.gg.gg....',
    '....gg.gg.gg....',
    '................',
  ],
  // 거짓몬: 가짜뉴스를 퍼뜨리는 파란 몬스터 (피노키오처럼 긴 코)
  geojitmon: [
    '................',
    '.....llllll.....',
    '....llllllll....',
    '...llllllllll...',
    '..llllllllllll..',
    '..llwellllwell..',
    '..lleelllleell..',
    '..llllllllllll..',
    '..lllccccccccc..',
    '..llllllllllll..',
    '..lllkkkkkklll..',
    '..llllllllllll..',
    '...llllllllll...',
    '....ll.ll.ll....',
    '....ll.ll.ll....',
    '................',
  ],
  // 편향몬: 한쪽으로 기울어진 주황 몬스터 (눈 크기가 다름)
  pyeonhyangmon: [
    '................',
    '......oooooo....',
    '....oooooooo....',
    '...ooooooooooo..',
    '..oooooooooooo..',
    '..owweoooooeoo..',
    '..oweeooooooo...',
    '..owweooooooo...',
    '..ooooooooooo...',
    '..ookkkkkooooo..',
    '..oooooooooooo..',
    '..ooooooooooo...',
    '...oooooooooo...',
    '....oo.oo.oo....',
    '...oo..oo..oo...',
    '................',
  ],
  // 중독몬: 스마트폰만 보는 분홍 몬스터 (빙글빙글 눈)
  jungdokmon: [
    '................',
    '.....nnnnnn.....',
    '....nnnnnnnn....',
    '...nnnnnnnnnn...',
    '..nnkknnnnkknn..',
    '..nkwknnnnkwkn..',
    '..nnkknnnnkknn..',
    '..nnnnnnnnnnnn..',
    '..nnnkkkkkknnn..',
    '..nnnkvvvvknnn..',
    '..nnnkvvvvknnn..',
    '..nnnkkkkkknnn..',
    '..nnnnnnnnnnnn..',
    '...nn.nnn.nn....',
    '...nn..nn..nn...',
    '................',
  ],
  // 혼돈몬: 모든 윤리 문제가 뒤섞인 최종 보스 (어둠 + 빨간 눈 + 뿔)
  hondonmon: [
    '..q..........q..',
    '..qq........qq..',
    '..dqd......dqd..',
    '..dddddddddddd..',
    '.dddddddddddddd.',
    '.ddqqdddddqqddd.',
    '.ddqwdddddqwddd.',
    '.dddddddddddddd.',
    '.dddddddddddddd.',
    '.ddwdwdwdwdwddd.',
    '.dddddddddddddd.',
    '.dddddddddddddd.',
    '..dddddddddddd..',
    '..dd.ddd.ddd....',
    '.ddd..dd..ddd...',
    '................',
  ],
};

// 스프라이트 렌더 캐시
const _spriteCache = new Map();

function drawSprite(ctx, rows, x, y, scale, palOverride, flip) {
  const key = rows.join('') + JSON.stringify(palOverride || {}) + scale + (flip ? 'F' : '');
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
