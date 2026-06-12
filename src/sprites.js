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
  prof:     { h: '#cfcfcf', r: '#f5f5f5', b: '#54585f' }, // 흰 가운 박사님
  kid:      { h: '#222222', r: '#ffd644', b: '#3a8f3a' }, // 노란 옷 아이
  grandma:  { h: '#e8e8e8', r: '#b06ab3', b: '#6d4c8f' }, // 할머니
  guard:    { h: '#3a3a3a', r: '#4ea8de', b: '#2a4fa0' }, // 파란 옷 안내원
  traveler: { h: '#7a4a2a', r: '#3a8f3a', b: '#5a4a3a' }, // 초록 옷 여행자
  merchant: { h: '#3a3a3a', r: '#c08a2a', b: '#6a4a2a' }, // 사막 상인
  mittens:  { h: '#a05a2a', r: '#e078a0', b: '#7a5aa0' }, // 분홍 옷 소녀
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
  // ---- 스테이지 2 ----
  // 악플몬: 못된 말을 내뱉는 빨간 몬스터 (뾰족한 이빨)
  akpeulmon: [
    '................',
    '.....qqqqqq.....',
    '....qqqqqqqq....',
    '...qqqqqqqqqq...',
    '..qqkkqqqqkkqq..',
    '..qkwkqqqqkwkq..',
    '..qqqqqqqqqqqq..',
    '..qwkwkwkwkwqq..',
    '..qqwkwkwkwqqq..',
    '..qqqqqqqqqqqq..',
    '..qqqqqqqqqqqq..',
    '...qqqqqqqqqq...',
    '....qq.qq.qq....',
    '....qq.qq.qq....',
    '................',
    '................',
  ],
  // 갇힘몬: 비눗방울(필터버블)에 갇힌 하늘색 몬스터
  gatimmon: [
    '....wwwwwwww....',
    '...w........w...',
    '..w..........w..',
    '.w....vvvv....w.',
    '.w...vvvvvv...w.',
    '.w..vkvvvvkv..w.',
    '.w..vvvvvvvv..w.',
    '.w..vvkkkkvv..w.',
    '.w...vvvvvv...w.',
    '.w....vvvv....w.',
    '..w..........w..',
    '...w........w...',
    '....wwwwwwww....',
    '................',
    '................',
    '................',
  ],
  // 멋대로몬: 사람 확인 없이 멋대로 행동하는 주황 로봇 (스테이지 2 보스)
  meotdaeromon: [
    '.......kk.......',
    '......kyyk......',
    '....oooooooo....',
    '...oooooooooo...',
    '...okkoooookk...',
    '...okwoooookw...',
    '...oooooooooo...',
    '...ooxxxxxxoo...',
    '...ooxkkkkxoo...',
    '...ooxxxxxxoo...',
    '..oooooooooooo..',
    '..oo.oooooo.oo..',
    '.....oooooo.....',
    '.....oo..oo.....',
    '.....kk..kk.....',
    '................',
  ],
  // ---- 스테이지 3 ----
  // 펑펑몬: 전기와 물을 펑펑 쓰는 노란 몬스터 (번개무늬)
  pungpungmon: [
    '................',
    '.....yyyyyy.....',
    '....yyyyyyyy....',
    '...yyyyyyyyyy...',
    '..yykyyyyyykyy..',
    '..yykwyyyykwyy..',
    '..yyyyyyyyyyyy..',
    '..yyywwyyyyyyy..',
    '..yyyywwyyyyyy..',
    '..yyywwyywwyyy..',
    '..yyyyyyyywwyy..',
    '...yyyyyyywwy...',
    '....yy.yy.yy....',
    '....yy.yy.yy....',
    '................',
    '................',
  ],
  // 깜깜몬: 아무것도 설명해 주지 않는 깜깜한 몬스터 (물음표)
  kkamkkammon: [
    '................',
    '.....dddddd.....',
    '....dddddddd....',
    '...dddddddddd...',
    '..ddwdddddddwd..',
    '..dddddwwwdddd..',
    '..ddddwddwwddd..',
    '..dddddddwwddd..',
    '..ddddddwwdddd..',
    '..ddddddwddddd..',
    '..dddddddddddd..',
    '..ddddddwddddd..',
    '...dddddddddd...',
    '....dd.dd.dd....',
    '....dd.dd.dd....',
    '................',
  ],
  // 떠넘기몬: 책임을 남에게 떠넘기는 초록 몬스터 (옆을 가리키는 긴 팔, 스테이지 3 보스)
  tteonemgimon: [
    '................',
    '.....gggggg.....',
    '....gggggggg....',
    '...gggggggggg...',
    '..ggwkggggwkgg..',
    '..gggggggggggg..',
    '..ggggkkkggggg..',
    '..gggggggggggg..',
    '..ggggggggggggg.',
    '..gggggggggggggg',
    '..ggggggggggggg.',
    '...ggggggggggg..',
    '....gggggggg....',
    '....gg.gg.gg....',
    '...gg..gg..gg...',
    '................',
  ],
  // ---- 스테이지 4 ----
  // 시들몬: 자신감을 잃고 시들어 버린 꽃 몬스터
  sideulmon: [
    '................',
    '......nnnn......',
    '.....nnnnnn.....',
    '....nnyyyynn....',
    '....nyyyyyyn....',
    '....nykyykyn....',
    '....nyyyyyyn....',
    '.....nyyyyn.....',
    '......nnnn......',
    '.......gg.......',
    '......ggg.......',
    '.....gg.gg......',
    '....g....g......',
    '.......gg.......',
    '......gggg......',
    '................',
  ],
  // 빼앗몬: 사람의 일을 다 빼앗으려는 갈색 몬스터 (공구를 든 모습)
  ppaeatmon: [
    '................',
    '.....cccccc...x.',
    '....cccccccc..x.',
    '...cccccccccc.x.',
    '..cckwccccwkccx.',
    '..cccccccccccxx.',
    '..ccckkkkkcccx..',
    '..cccccccccccc..',
    '..cccccccccccc..',
    '..cccccccccccc..',
    '..cccccccccccc..',
    '...cccccccccc...',
    '....cc.cc.cc....',
    '....cc.cc.cc....',
    '................',
    '................',
  ],
  // 홀림몬: 사람의 마음을 홀리는 보라 몬스터 (최면 눈, 스테이지 4 보스)
  hollimmon: [
    '................',
    '.....pppppp.....',
    '....pppppppp....',
    '...pppppppppp...',
    '..ppkkkppkkkpp..',
    '..pkwwwkpkwwwk..',
    '..pkwkwkpkwkwk..',
    '..ppkkkppkkkpp..',
    '..pppppppppppp..',
    '..pppnnnnnnppp..',
    '..ppnpppppnppp..',
    '..pppppppppppp..',
    '...pppppppppp...',
    '....pp.pp.pp....',
    '...pp..pp..pp...',
    '................',
  ],
  // ---- 스테이지 5 ----
  // 메아리몬: 배운 것을 되묻는 하늘색 유령 (그림자성 문지기)
  maearimon: [
    '................',
    '.....vvvvvv.....',
    '....vvvvvvvv....',
    '...vvvvvvvvvv...',
    '..vvkvvvvvvkvv..',
    '..vvvvvvvvvvvv..',
    '..vvvvkkkkvvvv..',
    '..vvvvvvvvvvvv..',
    '..vvvvvvvvvvvv..',
    '..vvvvvvvvvvvv..',
    '...vv.vvv.vv....',
    '....v..vv..v....',
    '................',
    '................',
    '................',
    '................',
  ],
  // 그림자몬: 지혜를 시험하는 새까만 그림자 (그림자성 문지기)
  geurimjamon: [
    '................',
    '.....kkkkkk.....',
    '....kkkkkkkk....',
    '...kkkkkkkkkk...',
    '..kkwwkkkkwwkk..',
    '..kkwwkkkkwwkk..',
    '..kkkkkkkkkkkk..',
    '..kkkkkkkkkkkk..',
    '..kkkkkkkkkkkk..',
    '..kkkkkkkkkkkk..',
    '..kkkkkkkkkkkk..',
    '...kkkkkkkkkk...',
    '....kk.kk.kk....',
    '...kk..kk..kk...',
    '................',
    '................',
  ],
  // 어둠대왕몬: 모든 윤리 오류의 왕 (최종 보스, 왕관)
  finalboss: [
    '..y...y..y...y..',
    '..yy.yy..yy.yy..',
    '..yyyyyyyyyyyy..',
    '..dddddddddddd..',
    '.dddddddddddddd.',
    '.dqqddddddqqddd.',
    '.dqwqddddqwqddd.',
    '.dqqddddddqqddd.',
    '.dddddddddddddd.',
    '.ddwdwdwdwdwddd.',
    '.dddddddddddddd.',
    '.dddddddddddddd.',
    '..dddddddddddd..',
    '..dd.ddd.ddd....',
    '.ddd..dd..ddd...',
    '................',
  ],
  // ---- 스테이지 6: 잊혀진 서버실 ----
  // 뚫림몬: 잠긴 것은 모두 뚫어 버리는 회색 몬스터 (드릴)
  tturimmon: [
    '................',
    '.....xxxxxx.....',
    '....xxxxxxxx....',
    '...xxxxxxxxxx...',
    '..xxkwxxxxwkxx..',
    '..xxxxxxxxxxxx..',
    '..xxxxkkkkxxxx..',
    '..xxxxxxxxxxxx..',
    '..xxxxxxxxxxcc..',
    '..xxxxxxxxxccc..',
    '..xxxxxxxxccc...',
    '...xxxxxxxcc....',
    '....xx.xx.c.....',
    '....xx.xx.......',
    '................',
    '................',
  ],
  // 기록몬: 아무것도 지우지 못하는 낡은 기록 기계 (스테이지 6 보스)
  girokmon: [
    '................',
    '..xxxxxxxxxxxx..',
    '..xkkkkkkkkkkx..',
    '..xkvvvvvvvvkx..',
    '..xkvwvvvvwvkx..',
    '..xkvvvvvvvvkx..',
    '..xkvwwwwwvvkx..',
    '..xkkkkkkkkkkx..',
    '..xxxxxxxxxxxx..',
    '..xkxkxkxkxkxx..',
    '..xxxxxxxxxxxx..',
    '..xkkxxkkxxkkx..',
    '..xxxxxxxxxxxx..',
    '...xx......xx...',
    '...xx......xx...',
    '................',
  ],
  // ---- 스테이지 7: 기억의 도서관 ----
  // 수집몬: 허락 없이 모든 것을 담아 가는 몬스터 (자루)
  sujipmon: [
    '................',
    '.....oooooo.....',
    '....oooooooo....',
    '...oooooooooo...',
    '..ookwooookwoo..',
    '..oooooooooooo..',
    '..oookkkkkoooo..',
    '..oooooooooocc..',
    '..oooooooooccc..',
    '..ooooooooccccc.',
    '..oooooooccccc..',
    '...oooooocccc...',
    '....oo.oo.cc....',
    '....oo.oo.......',
    '................',
    '................',
  ],
  // 사서몬: 모두의 기억을 혼자 끌어안은 책 몬스터 (스테이지 7 보스)
  saseomon: [
    '................',
    '..qq........qq..',
    '..qwwq....qwwq..',
    '..qwwwq..qwwwq..',
    '..qwwwwqqwwwwq..',
    '..qwkwwqqwwkwq..',
    '..qwwwwqqwwwwq..',
    '..qwwwwqqwwwwq..',
    '..qwkkwqqwkkwq..',
    '..qwwwwqqwwwwq..',
    '..qwwwqqqqwwwq..',
    '..qwwqqqqqqwwq..',
    '..qqqqqqqqqqqq..',
    '....qq....qq....',
    '....qq....qq....',
    '................',
  ],
  // ---- 스테이지 8: 거울 회랑 ----
  // 필터몬: 반짝이는 가짜 얼굴 뒤에 숨은 몬스터 (반쪽 가면)
  piltermon: [
    '................',
    '.....nnnnnn.....',
    '....nnnnnnnn....',
    '...nnnnwwwww....',
    '..nnnnnwwwwww...',
    '..nknnnwwkwww...',
    '..nnnnnwwwwww...',
    '..nnnnnwwwwww...',
    '..nkknnwwkkww...',
    '..nnnnnwwwwww...',
    '..nnnnnwwwww....',
    '...nnnnnwwww....',
    '....nn.nn.ww....',
    '....nn.nn.ww....',
    '................',
    '................',
  ],
  // ---- 스테이지 9: 속삭임 정원 ----
  // 유혹몬: "한 번만 더"를 속삭이는 달콤한 몬스터 (반짝 버튼)
  yuhokmon: [
    '................',
    '.....nynyny.....',
    '....ynynynyn....',
    '...nynynynyny...',
    '..ynkwnynykwyn..',
    '..nynynynynyny..',
    '..ynynkkkynyny..',
    '..nynynynynyny..',
    '..ynywwwwwwyny..',
    '..nynwkkkkwnyn..',
    '..ynywwwwwwyny..',
    '...nynynynyny...',
    '....yn.ny.yn....',
    '....ny.yn.ny....',
    '................',
    '................',
  ],
  // 속삭임몬: 외로움이 모여 태어난 안개 몬스터 (스테이지 9 보스)
  soksagimon: [
    '................',
    '......dddd......',
    '....dddddddd....',
    '...dddddddddd...',
    '..ddwddddddwdd..',
    '..dddddddddddd..',
    '..ddddwwwwdddd..',
    '..dddwddddwddd..',
    '..dddddddddddd..',
    '..dddddddddddd..',
    '...ddd.dd.ddd...',
    '....dd.dd.dd....',
    '.....d..d..d....',
    '......d..d......',
    '................',
    '................',
  ],
  // ---- 스테이지 10: 코어 ----
  // 조각몬: 흩어진 데이터 조각이 모인 글리치 몬스터
  jogakmon: [
    '..v..........w..',
    '.....vv..ww.....',
    '...vvvvwwvvw....',
    '..vwvvvvvvvvw...',
    '..vvkwvvvvwkvv..',
    '...vvvvvvvvvv...',
    '..wvvvkkkkvvvw..',
    '...vvvvvvvvvv...',
    '..vvwvvvvvvwvv..',
    '...v..vvvv..w...',
    '..w...vvv....v..',
    '.....v..w.......',
    '..v.......v.....',
    '................',
    '................',
    '................',
  ],
  // 영이: 박사님이 처음 만들고, 처음 지운 0번째 AI
  yeongi: [
    '................',
    '................',
    '.....wwwwww.....',
    '....wwwwwwww...v',
    '...wwwwwwwwww...',
    '...wwkwwwwkww...',
    '...wwwwwwwwww...',
    'v..wwwwkkwwww...',
    '...wwwwwwwwww...',
    '....wwwwwwww....',
    '.....wwwwww...v.',
    '....ww.ww.ww....',
    '....w...w..w....',
    '..v.............',
    '................',
    '................',
  ],
};

// 미러몬: 플레이어를 그대로 비추는 그림자 (스테이지 8 보스)
MONSTER_SPRITES.mirrormon = PLAYER_DOWN_0.map((row) =>
  row.replace(/[hrb]/g, 'd').replace(/f/g, 'x').replace(/e/g, 'w')
);

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
