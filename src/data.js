// 게임 데이터: 맵, NPC, 몬스터, 퀴즈
//
// 타일 종류
//  G 풀  P 길  F 꽃  S 모래  B 다리  C 동굴바닥  M 탑바닥  1 탑문(워프)
//  T 나무  W 물  O 지붕  H 벽  D 문(장식)  R 바위  K 동굴벽  * 수정  N 탑벽  Y 표지판

const WALKABLE = new Set(['G', 'P', 'F', 'S', 'B', 'C', 'M', 'Z', '1']);

const MAPS = {
  village: {
    name: '하늘마을',
    song: 'village',
    tiles: [
      'TTTTTTTTTTTTTPPTTTTTTTTTTTTT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGGOOOOOGGGGGPPGOOOOOOGGGGGT',
      'TGGOOOOOGGGGGPPGOOOOOOGGGGGT',
      'TGGHHDHHGGGGGPPGHH1HHHGGGGGT',
      'TGGGGPGGGGGGGPPGGGPGGGGGGGGT',
      'TGFGGPGGGGFGGPPGGGPGGFGGGFGT',
      'TGGGGPPPPPPPPPPPPPPGGGGGGGGT',
      'TGOOOOOOGGGGGPPGGGGGGGGGGGGT',
      'TGOOOOOOGGGGGPPGGGGGGGGGGGGT',
      'TGHHDHHHGGGGGPPGGGGGGGGGGGGT',
      'PPPPPPPPPPPPPPPPPPPPPPPPPPPP',
      'TGGFGGGGGGGGGPPGGGGGGOOOOOGT',
      'TGGGWWWWWGGGGPPGGGGGGOOOOOGT',
      'TGGGWWWWWGGGGPPGGGGGGHHDHHGT',
      'TGGGWWWWWGGGGPPGGGGGGGGPGGGT',
      'TGGGGGGGGGGGGPPYGGGGGGGPGGGT',
      'TGGGGGGGGGGGGPPPPPPPPPPGGGGT',
      'TGFGGGGFGGGGGPPGGGGFGGGGGFGT',
      'TTTTTTTTTTTTTPPTTTTTTTTTTTTT',
    ],
    warps: [
      { x: 13, y: 0, to: 'forest', tx: 13, ty: 18 },
      { x: 14, y: 0, to: 'forest', tx: 14, ty: 18 },
      { x: 0, y: 11, to: 'cave', tx: 25, ty: 11 },
      { x: 27, y: 11, to: 'lake', tx: 2, ty: 11 },
      { x: 18, y: 4, to: 'tower', tx: 8, ty: 12, needBadges: 3 },
      { x: 13, y: 19, to: 'meadow', tx: 13, ty: 1, needBoss: 'hondonmon',
        lockText: '남쪽 길이 어둠의 안개로 막혀 있다.\nAI 타워의 혼돈몬을 깨우치면\n안개가 걷힐 것 같다.' },
      { x: 14, y: 19, to: 'meadow', tx: 14, ty: 1, needBoss: 'hondonmon',
        lockText: '남쪽 길이 어둠의 안개로 막혀 있다.\nAI 타워의 혼돈몬을 깨우치면\n안개가 걷힐 것 같다.' },
    ],
    npcs: [
      { id: 'prof', x: 4, y: 12, pal: 'prof', name: '박사님' },
      { id: 'kid', x: 16, y: 7, pal: 'kid', name: '아이 도도' },
      { id: 'grandma', x: 20, y: 12, pal: 'grandma', name: '할머니' },
      { id: 'guard', x: 17, y: 6, pal: 'guard', name: '탑 안내원' },
    ],
    signs: [
      { x: 15, y: 16, text: '≪하늘마을≫\nAI 윤리 수호대의 고향입니다.' },
    ],
    monsters: [],
  },

  forest: {
    name: '초록숲',
    song: 'field',
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTGGGGTTTTTTTTTTTT',
      'TTTGGGTTTTTGGGGGGTTTTTGGGTTT',
      'TTGGGGGTTTGGGGGGGGTTTGGGGGTT',
      'TTGFGGGTTGGGGGGGGGGTTGGGFGTT',
      'TTGGGGGTTGGGGPPGGGGGTTGGGGTT',
      'TTTGGGGTTTGGGPPGGGTTTGGGGTTT',
      'TTTTGGGGGTTGGPPGGTTGGGGGTTTT',
      'TTTTTGGGGGGGGPPGGGGGGGGTTTTT',
      'TTTGGGGGGGGGGPPGGGGGGGGGGTTT',
      'TTGGGGGGGGGGGPPGGGGGGGGGGGTT',
      'TTGFGGGGTTTGGPPGGTTTGGGGFGTT',
      'TTGGGGGTTTTTGPPGTTTTTGGGGGTT',
      'TTTGGGGTTTTTGPPGTTTTTGGGGTTT',
      'TTTTTTTTTTTTGPPGTTTTTTTTTTTT',
      'TTTTTTTTTTTTGPPGTTTTTTTTTTTT',
      'TTTTTTTTTTTTGPPGTTTTTTTTTTTT',
      'TTTTTTTTTTTTYPPGTTTTTTTTTTTT',
      'TTTTTTTTTTTTGPPGTTTTTTTTTTTT',
      'TTTTTTTTTTTTTPPTTTTTTTTTTTTT',
    ],
    warps: [
      { x: 13, y: 19, to: 'village', tx: 13, ty: 1 },
      { x: 14, y: 19, to: 'village', tx: 14, ty: 1 },
    ],
    npcs: [],
    signs: [
      { x: 12, y: 17, text: '≪초록숲≫\n요즘 몬스터들이 나타나\n숲이 어수선합니다. 조심!' },
    ],
    monsters: [
      { id: 'bekkyeomon', x: 7, y: 10 },
      { id: 'mollaemon', x: 13, y: 3 },
    ],
  },

  lake: {
    name: '반짝호수',
    song: 'field',
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TGGGGGGGGGWWWWWWWWWWWWWWWWWT',
      'TGGGGGGGWWWWWWWWWWWWWWWWWWWT',
      'TGGGGGGWWWWWWWWWWWWWWWWWWWWT',
      'TGGGGGWWWWWWWGGGGGWWWWWWWWWT',
      'TGGGGGWWWWWWWGGGGGWWWWWWWWWT',
      'TGGGGGWWWWWWWGGGGGWWWWWWWWWT',
      'TGGGGGWWWWWWWWBWWWWWWWWWWWWT',
      'TGGGGGWWWWWWWWBWWWWWWWWWWWWT',
      'TGGGGGGWWWWWWWBWWWWWWWWWWWWT',
      'TGGGGGGGGWWWWWBWWWWWWWWWWWWT',
      'PPPPPPPPPPPPPPPGWWWWWWWWWWWT',
      'TGGGGGGGGGGGGGGGWWWWWWWWWWWT',
      'TGGFGGGGGGGFGGGGGWWWWWWWWWWT',
      'TGGGGGGGGGGGGGGGGGWWWWWWWWWT',
      'TGGGGGGGGGGGGGGGGGGWWWWWWWWT',
      'TGYGGGGGGGGGGGGGGGGGWWWWWWWT',
      'TGGGGGGGGGGGGGGGGGGGGWWWWWWT',
      'TGGGGFGGGGGGGGFGGGGGGGWWWWWT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    warps: [
      { x: 0, y: 11, to: 'village', tx: 26, ty: 11 },
    ],
    npcs: [],
    signs: [
      { x: 2, y: 16, text: '≪반짝호수≫\n호수 가운데 섬에서\n이상한 소문이 들려옵니다…' },
    ],
    monsters: [
      { id: 'jungdokmon', x: 8, y: 14 },
      { id: 'geojitmon', x: 15, y: 5 },
    ],
  },

  cave: {
    name: '데이터 동굴',
    song: 'cave',
    tiles: [
      'KKKKKKKKKKKKKKKKKKKKKKKKKKKK',
      'KCCCCCCCCCKKKKKKKKCCCCCCCCCK',
      'KCCCCCCCCCCKKKKKKCCCCCCCCCCK',
      'KCC*CCCCCCCCKKKKCCCCCCC*CCCK',
      'KCCCCCCCCCCCCCCCCCCCCCCCCCCK',
      'KCCCCCCCCCCCCCCCCCCCCCCCCCCK',
      'KKKKKCCCCCKKKKKKKKKCCCCCKKKK',
      'KKKKKCCCCCKKKKKKKKKCCCCCKKKK',
      'KKKCCCCCCCCKKKKKKKCCCCCCCKKK',
      'KKCCCCCCCCCCKKKKKCCCCCCCCCKK',
      'KKCCCCCCCCCCCCCCCCCCCCCCCCKK',
      'KKCCCCCCCCCCCCCCCCCCCCCCCCCP',
      'KKCCCCCCCCCCCCCCCCCCCCCCCCKK',
      'KKKCC*CCCCCCCCCCCCCC*CCCKKKK',
      'KKKKCCCCCCCCCCCCCCCCCCKKKKKK',
      'KKKKKKCCCCCCCCCCCCCCKKKKKKKK',
      'KKKKKKKKCCCCCCCCCCKKKKKKKKKK',
      'KKKKKKKKKKCCCCCCKKKKKKKKKKKK',
      'KKKKKKKKKKKKKKKKKKKKKKKKKKKK',
      'KKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    ],
    warps: [
      { x: 27, y: 11, to: 'village', tx: 1, ty: 11 },
    ],
    npcs: [
      { id: 'explorer', x: 20, y: 10, pal: 'guard', name: '탐험가' },
    ],
    signs: [],
    monsters: [
      { id: 'pyeonhyangmon', x: 4, y: 4 },
    ],
  },

  tower: {
    name: 'AI 타워',
    song: 'cave',
    tiles: [
      'NNNNNNNNNNNNNNNNNN',
      'NMMMMMMMMMMMMMMMMN',
      'NMMMMMMMMMMMMMMMMN',
      'NMMMMMMMMMMMMMMMMN',
      'NMMNMMMMMMMMMMNMMN',
      'NMMNMMMMMMMMMMNMMN',
      'NMMMMMMMMMMMMMMMMN',
      'NMMMMMMMMMMMMMMMMN',
      'NMMNMMMMMMMMMMNMMN',
      'NMMNMMMMMMMMMMNMMN',
      'NMMMMMMMMMMMMMMMMN',
      'NMMMMMMMMMMMMMMMMN',
      'NMMMMMMMMMMMMMMMMN',
      'NNNNNNNNMMNNNNNNNN',
    ],
    warps: [
      { x: 8, y: 13, to: 'village', tx: 18, ty: 5 },
      { x: 9, y: 13, to: 'village', tx: 18, ty: 5 },
    ],
    npcs: [],
    signs: [],
    monsters: [
      { id: 'hondonmon', x: 8, y: 3 },
    ],
  },

  // ---- 스테이지 2 ----
  meadow: {
    name: '햇살초원 (스테이지 2)',
    song: 'field',
    tiles: [
      'TTTTTTTTTTTTTPPTTTTTTTTTTTTT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGFGGGGFGGGGGPPGGGGFGGGGFGGT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGGTTGGGGGGGGPPGGGGGGGGTTGGT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGFGGGGGGGGGGPPGGGGGGGGFGGGT',
      'TGGGGGGWWWGGGPPGGGWWWGGGGGGT',
      'TGGGGGGWWWGGGPPGGGWWWGGGGGGT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGGGGGGGGGGGGPPYGGGGGGGGGGGT',
      'TGFGGGGGGGGGGPPGGGGGGGGGGFGT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGGTTGGGGGGGGPPGGGGGGGGTTGGT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGFGGGGGGGGGGPPGGGGGGGGGFGGT',
      'TTTTTTTTTTTTTPPTTTTTTTTTTTTT',
    ],
    warps: [
      { x: 13, y: 0, to: 'village', tx: 13, ty: 18 },
      { x: 14, y: 0, to: 'village', tx: 14, ty: 18 },
      { x: 13, y: 19, to: 'desert', tx: 13, ty: 1, needBoss: 'meotdaeromon',
        lockText: '남쪽 길을 멋대로몬의 부하들이\n막고 있다. 이 초원의 보스\n멋대로몬을 깨우쳐야 한다!' },
      { x: 14, y: 19, to: 'desert', tx: 14, ty: 1, needBoss: 'meotdaeromon',
        lockText: '남쪽 길을 멋대로몬의 부하들이\n막고 있다. 이 초원의 보스\n멋대로몬을 깨우쳐야 한다!' },
    ],
    npcs: [
      { id: 'traveler', x: 17, y: 5, pal: 'traveler', name: '여행자' },
    ],
    signs: [
      { x: 15, y: 11, text: '≪햇살초원≫ 스테이지 2\n남쪽으로 가려면 이곳의 보스\n멋대로몬을 깨우쳐야 합니다.' },
    ],
    monsters: [
      { id: 'akpeulmon', x: 7, y: 6 },
      { id: 'gatimmon', x: 20, y: 12 },
      { id: 'meotdaeromon', x: 13, y: 16 },
    ],
  },

  // ---- 스테이지 3 ----
  desert: {
    name: '재깍사막 (스테이지 3)',
    song: 'desert',
    tiles: [
      'RRRRRRRRRRRRRSSRRRRRRRRRRRRR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSXSSSSSSSSSSSSSSSSSSXSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSRRSSSSSSSSSSSSSRRSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSXSSSSSSSSSSSSSSSSSSSSXSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSSSRRRSSSSSSSRRRSSSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSYSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSXSSSSSSSSSSSSSSSSXSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSRRSSSSSSSSSSSSSRRSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RRRRRRRRRRRRRSSRRRRRRRRRRRRR',
    ],
    warps: [
      { x: 13, y: 0, to: 'meadow', tx: 13, ty: 18 },
      { x: 14, y: 0, to: 'meadow', tx: 14, ty: 18 },
      { x: 13, y: 19, to: 'snow', tx: 13, ty: 1, needBoss: 'tteonemgimon',
        lockText: '모래폭풍이 길을 막고 있다.\n이 사막의 보스 떠넘기몬을\n깨우치면 가라앉을 것이다!' },
      { x: 14, y: 19, to: 'snow', tx: 14, ty: 1, needBoss: 'tteonemgimon',
        lockText: '모래폭풍이 길을 막고 있다.\n이 사막의 보스 떠넘기몬을\n깨우치면 가라앉을 것이다!' },
    ],
    npcs: [
      { id: 'merchant', x: 18, y: 12, pal: 'merchant', name: '사막 상인' },
    ],
    signs: [
      { x: 2, y: 11, text: '≪재깍사막≫ 스테이지 3\n데이터센터의 열기로 뜨거워진 사막.\n전기를 펑펑 쓰는 몬스터가 산다…' },
    ],
    monsters: [
      { id: 'pungpungmon', x: 6, y: 5 },
      { id: 'kkamkkammon', x: 21, y: 8 },
      { id: 'tteonemgimon', x: 13, y: 15 },
    ],
  },

  // ---- 스테이지 4 ----
  snow: {
    name: '눈송이마을 (스테이지 4)',
    song: 'snow',
    tiles: [
      'JJJJJJJJJJJJJZZJJJJJJJJJJJJJ',
      'JZZZZZZZZZZZZZZZZZZZZZZZZZZJ',
      'JZZOOOOZZZZZZZZZZZZOOOOZZZZJ',
      'JZZOOOOZZZZZZZZZZZZOOOOZZZZJ',
      'JZZHDHHZZZZZZZZZZZZHHDHZZZZJ',
      'JZZZZZZZZZZZZZZZZZZZZZZZZZZJ',
      'JZZZZZZZZZZZZZZZZZZZZZZZZZZJ',
      'JZZJJZZZZZZZZZZZZZZZZZJJZZZJ',
      'JZZZZZZZZZZZZZZZZZZZZZZZZZZJ',
      'JZZZZZZZZZWWWWWWWZZZZZZZZZZJ',
      'JZZZZZZZZZWWWWWWWZZZZZZZZZZJ',
      'JZZZZZZZZZZZZZZZZZZZZZZZZZZJ',
      'JZYZZZZZZZZZZZZZZZZZZZZZZZZJ',
      'JZZZZZZZZZZZZZZZZZZZZZZZZZZJ',
      'JZZJJZZZZZZZZZZZZZZZZZJJZZZJ',
      'JZZZZZZZZZZZZZZZZZZZZZZZZZZJ',
      'JZZZZZZZZZZZZZZZZZZZZZZZZZZJ',
      'JZZZZZZZZZZZZZZZZZZZZZZZZZZJ',
      'JZZZZZZZZZZZZZZZZZZZZZZZZZZJ',
      'JJJJJJJJJJJJJZZJJJJJJJJJJJJJ',
    ],
    warps: [
      { x: 13, y: 0, to: 'desert', tx: 13, ty: 18 },
      { x: 14, y: 0, to: 'desert', tx: 14, ty: 18 },
      { x: 13, y: 19, to: 'castle', tx: 9, ty: 15, needBoss: 'hollimmon',
        lockText: '그림자성의 문이 얼음으로\n덮여 있다. 이 마을의 보스\n홀림몬을 깨우쳐야 녹을 것이다!' },
      { x: 14, y: 19, to: 'castle', tx: 10, ty: 15, needBoss: 'hollimmon',
        lockText: '그림자성의 문이 얼음으로\n덮여 있다. 이 마을의 보스\n홀림몬을 깨우쳐야 녹을 것이다!' },
    ],
    npcs: [
      { id: 'mittens', x: 16, y: 13, pal: 'mittens', name: '털장갑 소녀' },
    ],
    signs: [
      { x: 2, y: 12, text: '≪눈송이마을≫ 스테이지 4\n남쪽 그림자성에서 어둠의 기운이…\n마음을 단단히 먹으세요!' },
    ],
    monsters: [
      { id: 'sideulmon', x: 7, y: 6 },
      { id: 'ppaeatmon', x: 20, y: 11 },
      { id: 'hollimmon', x: 13, y: 15 },
    ],
  },

  // ---- 스테이지 5 ----
  castle: {
    name: '그림자성 (스테이지 5)',
    song: 'cave',
    tiles: [
      'NNNNNNNNNNNNNNNNNNNN',
      'NMMMMMMMMMMMMMMMMMMN',
      'NMMMMMMMMMMMMMMMMMMN',
      'NMMMMMMMMMMMMMMMMMMN',
      'NNNNNNNNNMNNNNNNNNNN',
      'NMMMMMMMMMMMMMMMMMMN',
      'NMMMMMMMMMMMMMMMMMMN',
      'NMMMMMMMMMMMMMMMMMMN',
      'NNNNNNNNNNMNNNNNNNNN',
      'NMMMMMMMMMMMMMMMMMMN',
      'NMMMMMMMMMMMMMMMMMMN',
      'NMMNMMNMMMMMMNMMNMMN',
      'NMMMMMMMMMMMMMMMMMMN',
      'NMMMMMMMMMMMMMMMMMMN',
      'NMMMMMMMMMMMMMMMMMMN',
      'NMMMMMMMMMMMMMMMMMMN',
      'NMMMMMMMMMMMMMMMMMMN',
      'NNNNNNNNNMMNNNNNNNNN',
    ],
    warps: [
      { x: 9, y: 17, to: 'snow', tx: 13, ty: 18 },
      { x: 10, y: 17, to: 'snow', tx: 14, ty: 18 },
    ],
    npcs: [],
    signs: [],
    monsters: [
      { id: 'maearimon', x: 10, y: 8 },
      { id: 'geurimjamon', x: 9, y: 4 },
      { id: 'finalboss', x: 9, y: 2 },
    ],
  },
};

// ---- 몬스터 정의 ----
// hp = 맞혀야 하는 문제 수
const MONSTERS = {
  bekkyeomon: {
    name: '베껴몬',
    topic: 'copyright',
    hp: 3,
    intro: '키킥! 남의 그림, 남의 글…\n전부 베끼면 내 거다!',
    win: '으아… 만든 사람의 마음이\n소중하다는 걸 알았어…\n이제 출처를 꼭 밝힐게!',
    badge: null,
  },
  mollaemon: {
    name: '몰래몬',
    topic: 'privacy',
    hp: 3,
    intro: '쉿…! 너의 이름, 주소, 비밀번호…\n전부 몰래 가져가 버리겠다!',
    win: '내가 잘못했어…\n개인정보는 소중한 보물이구나.\n이제 훔쳐보지 않을게!',
    badge: 'forest',
  },
  jungdokmon: {
    name: '중독몬',
    topic: 'balance',
    hp: 3,
    intro: '히히… 밥도 잠도 필요 없어!\n하루 종일 AI랑 스마트폰만 보자~',
    win: '눈이 빙글빙글… 이제 알았어.\n쉬는 시간도, 친구랑 노는 시간도\n정말 소중하구나!',
    badge: null,
  },
  geojitmon: {
    name: '거짓몬',
    topic: 'fake',
    hp: 3,
    intro: '내 코가 길어진 건 비밀이야!\n가짜 뉴스로 세상을 속여주지!',
    win: '코가… 줄어들었어!\n거짓 정보는 사람들을 다치게 하는구나.\n이제 사실만 말할게!',
    badge: 'lake',
  },
  pyeonhyangmon: {
    name: '편향몬',
    topic: 'bias',
    hp: 3,
    intro: '난 한쪽 말만 들을 거야!\n내 마음에 드는 것만 옳아!',
    win: '기울었던 몸이 똑바로 섰어!\n여러 사람의 이야기를 골고루 듣는 게\n공정한 거구나!',
    badge: 'cave',
  },
  hondonmon: {
    name: '혼돈몬',
    topic: 'boss',
    hp: 5,
    intro: '크하하하! 나는 혼돈몬!\n모든 윤리 오류가 모여 태어났다!\n네가 진짜 AI 윤리 수호자인지\n시험해 주마!',
    win: '말도 안 돼…!\n네 마음속의 바른 생각이\n나를 이겼구나…\n하지만 남쪽에는 나보다 강한\n어둠이 기다리고 있다…',
    badge: null,
    clear: '☆ 스테이지 1 클리어! ☆\n하늘마을 남쪽으로 가는 길이 열렸다!',
  },

  // ---- 스테이지 2: 햇살초원 ----
  akpeulmon: {
    name: '악플몬',
    topic: 'manners',
    hp: 3,
    intro: '키키킥! 못된 말 한 바가지!\n인터넷에서는 무슨 말을 해도\n아무도 모를걸~?',
    win: '미안해… 화면 너머에도\n사람의 마음이 있다는 걸\n잊고 있었어. 고운 말만 할게!',
    badge: null,
  },
  gatimmon: {
    name: '갇힘몬',
    topic: 'filterbubble',
    hp: 3,
    intro: '여긴 너무 편안해~\n내가 좋아하는 것만 보여주는\n비눗방울 속은 최고야!',
    win: '방울이 펑 터졌어!\n바깥세상에 이렇게 다양한\n이야기가 있는 줄 몰랐네!',
    badge: null,
  },
  meotdaeromon: {
    name: '멋대로몬',
    topic: 'safety',
    hp: 4,
    intro: '나는 초원의 보스 멋대로몬!\n사람의 확인 따위 필요 없어!\n전부 내 멋대로 결정하겠다!',
    win: '내 멋대로 하면 누군가\n다칠 수도 있구나…\n중요한 일은 꼭 사람과 함께\n확인할게. 약속!',
    badge: null,
    clear: '☆ 스테이지 2 클리어! ☆\n초원 남쪽, 재깍사막으로 가는\n길이 열렸다!',
  },

  // ---- 스테이지 3: 재깍사막 ----
  pungpungmon: {
    name: '펑펑몬',
    topic: 'environment',
    hp: 3,
    intro: '펑펑! 전기를 펑펑!\n물도 펑펑! AI를 돌리려면\n아낌없이 펑펑 써야지~!',
    win: '지구가 힘들어하는 줄 몰랐어…\n이제 꼭 필요할 때만\n아껴서 똑똑하게 쓸게!',
    badge: null,
  },
  kkamkkammon: {
    name: '깜깜몬',
    topic: 'transparency',
    hp: 3,
    intro: '나는 아무것도 설명 안 해!\n왜냐고? 그것도 비밀!\n깜깜한 게 최고야!',
    win: '이유를 설명해 주니까\n모두가 안심할 수 있구나.\n이제 깜깜하게 숨기지 않을게!',
    badge: null,
  },
  tteonemgimon: {
    name: '떠넘기몬',
    topic: 'responsibility',
    hp: 4,
    intro: '나는 사막의 보스 떠넘기몬!\n내 잘못? 아니야!\n전부 AI가 한 거야!\n난 아무 책임 없어~!',
    win: '책임을 떠넘기기만 하면\n아무것도 나아지지 않는구나…\n내 행동은 내가 책임질게!',
    badge: null,
    clear: '☆ 스테이지 3 클리어! ☆\n사막 남쪽, 눈송이마을로 가는\n길이 열렸다!',
  },

  // ---- 스테이지 4: 눈송이마을 ----
  sideulmon: {
    name: '시들몬',
    topic: 'creativity',
    hp: 3,
    intro: '시들시들…\n어차피 AI가 다 잘하는데\n내가 그리고 쓰고 노력할\n필요가 있을까…',
    win: '내 마음이 담긴 작품은\n세상에 하나뿐이라는 말…\n다시 힘이 솟아나! 활짝!',
    badge: null,
  },
  ppaeatmon: {
    name: '빼앗몬',
    topic: 'jobs',
    hp: 3,
    intro: '내가 사람들의 일을\n전부 빼앗아 주지!\n사람은 이제 아무것도\n할 필요 없다고!',
    win: 'AI와 사람이 힘을 합치면\n더 멋진 일을 할 수 있구나!\n빼앗는 게 아니라 돕는 거였어!',
    badge: null,
  },
  hollimmon: {
    name: '홀림몬',
    topic: 'emotion',
    hp: 4,
    intro: '나는 눈송이마을의 보스 홀림몬…\n나만 믿어… 나만 바라봐…\n비밀도 고민도 전부\n나에게만 말하면 돼…',
    win: '정신이 번쩍 들었어!\nAI는 좋은 도구이지만,\n진짜 마음은 사람과\n나누는 거였구나.',
    badge: null,
    clear: '☆ 스테이지 4 클리어! ☆\n눈송이마을 남쪽, 그림자성의\n문이 열렸다!',
  },

  // ---- 스테이지 5: 그림자성 ----
  maearimon: {
    name: '메아리몬',
    topic: ['privacy', 'copyright', 'fake', 'bias', 'balance'],
    hp: 3,
    intro: '그림자성에 들어가고 싶다고?\n그렇다면 하늘마을에서 배운 것을\n메아리처럼 답해 보아라!',
    win: '훌륭한 메아리였다…\n배운 것을 잊지 않았구나.\n지나가도 좋아!',
    badge: null,
  },
  geurimjamon: {
    name: '그림자몬',
    topic: ['manners', 'filterbubble', 'safety', 'environment', 'transparency', 'responsibility'],
    hp: 3,
    intro: '어둠대왕몬님께는 못 간다!\n네 지혜가 진짜인지\n그림자 시험으로 확인하겠다!',
    win: '그 빛나는 지혜…\n그림자가 당해낼 수 없군.\n부디 대왕몬님을 부탁한다…',
    badge: null,
  },
  finalboss: {
    name: '어둠대왕몬',
    topic: ['creativity', 'jobs', 'emotion', 'boss', 'finale'],
    hp: 6,
    intro: '크하하하! 잘 왔다, 꼬마 수호자!\n나는 모든 윤리 오류의 왕,\n어둠대왕몬이다!\n네 모든 지혜를 시험해 주마!',
    win: '이럴 수가…!\n네 바르고 따뜻한 마음이\n어둠을 모두 밝혀 버렸다…\nAI 세상의 미래를 부탁한다…!',
    badge: null,
  },
};

// ---- 퀴즈 ----
// { q: 문제, a: 보기 3개, c: 정답 번호(0~2), why: 해설 }
const QUIZZES = {
  privacy: [
    {
      q: '게임에서 만난 모르는 사람이\n우리 집 주소를 물어봐요.\n어떻게 해야 할까요?',
      a: ['친절하게 알려준다', '알려주지 않고 어른께 말한다', '학교 이름만 알려준다'],
      c: 1,
      why: '집 주소, 전화번호, 학교는 모두 소중한\n개인정보예요. 모르는 사람에게는\n절대 알려주면 안 돼요!',
    },
    {
      q: '다음 중 "개인정보"가\n아닌 것은 무엇일까요?',
      a: ['우리 집 주소', '내 전화번호', '내가 좋아하는 색깔'],
      c: 2,
      why: '좋아하는 색깔은 괜찮지만, 주소나\n전화번호는 나를 찾아낼 수 있는\n소중한 개인정보예요.',
    },
    {
      q: '친한 친구가 내 게임 비밀번호를\n알려달라고 해요. 어떻게 할까요?',
      a: ['친하니까 알려준다', '비밀번호는 알려주지 않는다', '반만 알려준다'],
      c: 1,
      why: '비밀번호는 아무리 친한 친구라도\n알려주면 안 돼요. 나만 아는\n비밀 열쇠랍니다!',
    },
    {
      q: 'AI 챗봇과 이야기할 때\n말하면 안 되는 것은?',
      a: ['좋아하는 동물', '우리 집 주소와 전화번호', '오늘의 날씨'],
      c: 1,
      why: 'AI에게 말한 내용은 어딘가에\n저장될 수 있어요. 개인정보는\nAI에게도 말하지 않아요!',
    },
    {
      q: '친구 사진을 SNS에 올리고 싶어요.\n어떻게 해야 할까요?',
      a: ['먼저 친구에게 허락을 받는다', '재미있으니 그냥 올린다', '몰래 올리고 나중에 말한다'],
      c: 0,
      why: '사진 속 친구의 모습도 친구의\n개인정보예요. 올리기 전에 꼭\n허락을 받아야 해요!',
    },
    {
      q: '인터넷 사이트가 내 이름과 나이를\n입력하라고 해요. 어떻게 할까요?',
      a: ['아무 데나 다 입력한다', '부모님이나 선생님께 먼저 여쭤본다', '가짜 정보를 마음대로 쓴다'],
      c: 1,
      why: '믿을 수 있는 사이트인지 어른과\n함께 확인한 다음에 입력하는 것이\n안전해요!',
    },
  ],

  copyright: [
    {
      q: 'AI가 그려준 그림으로 미술 숙제를\n냈어요. 어떻게 해야 할까요?',
      a: ['내가 그렸다고 말한다', 'AI를 사용했다고 솔직히 말한다', '아무 말도 안 한다'],
      c: 1,
      why: 'AI의 도움을 받았다면 솔직하게\n말해야 해요. 숨기면 거짓말이\n되어 버려요!',
    },
    {
      q: '인터넷에서 찾은 멋진 그림을\n쓰고 싶어요. 어떻게 할까요?',
      a: ['그냥 가져다 쓴다', '만든 사람을 확인하고 출처를 밝힌다', '내가 그렸다고 한다'],
      c: 1,
      why: '그림, 글, 음악에는 만든 사람의\n권리(저작권)가 있어요. 출처를\n밝히고 허락을 받아야 해요!',
    },
    {
      q: '친구가 쓴 글을 그대로 베껴서\n내 숙제로 내면 어떻게 될까요?',
      a: ['들키지 않으면 괜찮다', '친구의 노력을 훔치는 일이다', '친구가 친하면 괜찮다'],
      c: 1,
      why: '남이 만든 것을 그대로 베끼는 건\n그 사람의 노력과 시간을 훔치는\n것과 같아요.',
    },
    {
      q: 'AI에게 부탁해서 쓴 글을 글짓기\n대회에 내려고 해요. 옳은 행동은?',
      a: ['AI 사용 여부를 선생님께 여쭤본다', '몰래 내고 상을 받는다', 'AI가 썼지만 내 이름만 쓴다'],
      c: 0,
      why: '대회마다 AI 사용 규칙이 달라요.\n먼저 물어보고 규칙을 지키는 것이\n진짜 멋진 참가자예요!',
    },
    {
      q: '좋아하는 가수의 노래를 AI로\n따라 만들어 "내 노래"라고 올렸어요.\n괜찮을까요?',
      a: ['괜찮다, AI가 만들었으니까', '안 된다, 원래 가수의 권리를 침해한다', '조회수가 많으면 괜찮다'],
      c: 1,
      why: '다른 사람의 목소리나 노래를 흉내 내\n내 것처럼 올리면 그 사람의 권리를\n침해하는 거예요.',
    },
    {
      q: '숙제를 할 때 AI를 가장 바르게\n사용하는 방법은 무엇일까요?',
      a: ['AI에게 전부 시키고 베낀다', '모르는 것을 물어보고 내 힘으로 정리한다', 'AI 답을 안 읽고 그대로 낸다'],
      c: 1,
      why: 'AI는 선생님처럼 도움을 주는 도구!\n생각하고 정리하는 건 내가 해야\n진짜 실력이 늘어요.',
    },
  ],

  fake: [
    {
      q: '인터넷에서 깜짝 놀랄 만한 소식을\n봤어요. 가장 먼저 할 일은?',
      a: ['친구들에게 빨리 퍼뜨린다', '사실인지 믿을 만한 곳에서 확인한다', '댓글로 화를 낸다'],
      c: 1,
      why: '놀라운 소식일수록 가짜일 수 있어요.\n뉴스나 어른께 사실인지 먼저\n확인하는 습관이 중요해요!',
    },
    {
      q: 'AI가 만든 가짜 사진이나 영상을\n무엇이라고 부를까요?',
      a: ['딥페이크', '딥슬립', '딥바다'],
      c: 0,
      why: '딥페이크는 AI로 만든 가짜 사진,\n가짜 영상이에요. 진짜처럼 보여도\n가짜일 수 있으니 조심!',
    },
    {
      q: '친구 얼굴을 넣은 웃긴 가짜 영상을\n만들어 단톡방에 올리면 어떨까요?',
      a: ['웃기니까 괜찮다', '친구가 상처받을 수 있어 안 된다', '금방 지우면 괜찮다'],
      c: 1,
      why: '장난이라도 가짜 영상은 친구의 마음을\n크게 다치게 할 수 있어요.\n절대 만들거나 퍼뜨리면 안 돼요!',
    },
    {
      q: 'AI 챗봇이 알려준 답은\n어떻게 받아들여야 할까요?',
      a: ['AI니까 무조건 믿는다', '틀릴 수도 있으니 다시 확인한다', '재미없으면 무시한다'],
      c: 1,
      why: 'AI도 틀린 답이나 지어낸 답을\n말할 수 있어요. 책이나 어른께\n한 번 더 확인하면 좋아요!',
    },
    {
      q: '가짜 뉴스인 걸 알게 됐을 때\n바른 행동은 무엇일까요?',
      a: ['재미있으니 더 퍼뜨린다', '퍼뜨리지 않고 어른께 알린다', '나만 알고 모른 척한다'],
      c: 1,
      why: '가짜 뉴스는 퍼질수록 많은 사람이\n속아요. 멈추게 하는 사람이\n진짜 멋진 사람이에요!',
    },
    {
      q: '영상 속 유명한 사람이 이상한 말을\n해요. 어떻게 생각해야 할까요?',
      a: ['유명인이니까 다 진짜다', 'AI로 만든 가짜일 수 있다고 생각한다', '무조건 가짜라고 화낸다'],
      c: 1,
      why: '요즘은 AI로 진짜 같은 가짜 영상을\n만들 수 있어요. "진짜일까?" 하고\n한 번 의심해 보는 게 좋아요.',
    },
  ],

  bias: [
    {
      q: 'AI가 "의사는 남자만 할 수 있어"\n라고 대답했어요. 어떻게 생각해야 할까요?',
      a: ['AI 말이니까 맞다', '잘못된 대답이라고 생각한다', '여자는 간호사만 하면 된다'],
      c: 1,
      why: '의사, 소방관, 요리사… 모든 직업은\n누구나 할 수 있어요. AI도 잘못된\n편견을 말할 수 있답니다.',
    },
    {
      q: 'AI는 왜 편견을 가지게 될까요?',
      a: ['사람이 만든 데이터로 배우기 때문', 'AI가 심술쟁이라서', '전기가 부족해서'],
      c: 0,
      why: 'AI는 사람들이 만든 글과 사진으로\n공부해요. 그 속에 편견이 있으면\nAI도 따라 배우게 돼요.',
    },
    {
      q: '공정한 AI를 만들려면\n무엇이 필요할까요?',
      a: ['한 나라 사람의 데이터만 모은다', '다양한 사람들의 데이터를 골고루 모은다', '데이터를 아예 안 쓴다'],
      c: 1,
      why: '여러 나라, 여러 모습의 사람들\n데이터를 골고루 배워야 AI가\n공정한 판단을 할 수 있어요.',
    },
    {
      q: 'AI 심판이 어떤 친구에게만 자꾸\n불리한 판정을 해요. 어떻게 할까요?',
      a: ['AI니까 그냥 둔다', '공정하지 않다고 어른께 알린다', '그 친구를 빼고 게임한다'],
      c: 1,
      why: 'AI의 결정이 이상하거나 불공평하면\n사람에게 알려서 고쳐야 해요.\n그게 모두를 지키는 길이에요!',
    },
    {
      q: 'AI가 추천해 주는 영상만 계속 보면\n어떤 일이 생길 수 있을까요?',
      a: ['세상을 골고루 알게 된다', '비슷한 생각만 보게 되어 생각이 좁아진다', '아무 일도 안 생긴다'],
      c: 1,
      why: 'AI는 내가 좋아할 것만 골라 보여줘요.\n다양한 이야기를 직접 찾아보는 것도\n중요하답니다!',
    },
    {
      q: 'AI가 사람을 뽑는 일을 도울 때\n가장 중요한 것은 무엇일까요?',
      a: ['모든 사람을 공정하게 평가하는 것', '얼굴이 잘생긴 사람을 뽑는 것', '빨리 아무나 뽑는 것'],
      c: 0,
      why: 'AI가 사람을 평가할 때는 성별, 외모,\n출신에 상관없이 공정해야 해요.\n사람이 잘 살펴봐야 한답니다.',
    },
  ],

  balance: [
    {
      q: '숙제가 어려워요. AI를 가장 바르게\n사용하는 방법은 무엇일까요?',
      a: ['AI에게 전부 시킨다', '힌트를 얻고 내 힘으로 풀어본다', '숙제를 안 한다'],
      c: 1,
      why: '전부 AI에게 맡기면 내 실력이 늘지\n않아요. 스스로 생각하고 AI는\n도우미로만 사용해요!',
    },
    {
      q: '밤늦게까지 AI 챗봇과 이야기하고\n싶어요. 어떻게 해야 할까요?',
      a: ['밤새 이야기한다', '사용 시간을 정해 지킨다', '학교에 안 가고 이야기한다'],
      c: 1,
      why: '잠을 잘 자야 키도 크고 머리도\n좋아져요. AI 사용 시간은 스스로\n정해서 지키는 게 멋져요!',
    },
    {
      q: 'AI 친구와 진짜 친구,\n어떻게 지내는 게 좋을까요?',
      a: ['AI 친구랑만 논다', '진짜 친구와 노는 시간도 소중히 한다', '친구를 사귀지 않는다'],
      c: 1,
      why: 'AI와 대화하는 것도 재미있지만,\n진짜 친구와 함께 웃고 뛰어노는\n시간은 무엇과도 바꿀 수 없어요!',
    },
    {
      q: '점심 메뉴부터 장래희망까지 전부\nAI에게 정해달라고 하면 어떨까요?',
      a: ['편하니까 좋다', '내 일은 내가 생각해서 결정해야 한다', 'AI가 더 똑똑하니 맡긴다'],
      c: 1,
      why: '내 인생의 주인공은 나!\nAI의 의견은 참고만 하고,\n결정은 내가 하는 거예요.',
    },
    {
      q: 'AI가 알려준 답을 숙제에 쓸 때\n어떻게 해야 할까요?',
      a: ['그대로 베껴 쓴다', '맞는지 한 번 더 생각하고 내 말로 쓴다', '읽지도 않고 낸다'],
      c: 1,
      why: 'AI의 답을 그대로 베끼면 생각하는\n힘이 자라지 않아요. 꼭 내 머리로\n한 번 더 생각해 보세요!',
    },
    {
      q: '게임이나 AI 앱을 그만하기로 한\n시간이 됐어요. 어떻게 할까요?',
      a: ['"5분만 더"를 계속 반복한다', '약속한 시간에 스스로 끝낸다', '몰래 이불 속에서 계속한다'],
      c: 1,
      why: '스스로 약속을 지키는 사람이\n진짜 멋진 사람! 절제하는 힘도\n윤리의 한 부분이에요.',
    },
  ],

  boss: [
    {
      q: 'AI 챗봇에게 말을 걸 때\n바른 태도는 무엇일까요?',
      a: ['나쁜 말을 마구 해도 된다', '고운 말을 쓰는 연습을 한다', 'AI를 괴롭히며 논다'],
      c: 1,
      why: 'AI에게 나쁜 말을 쓰는 버릇은\n사람에게도 이어질 수 있어요.\n고운 말 습관이 중요해요!',
    },
    {
      q: 'AI가 절대 대신할 수 없는 것은\n무엇일까요?',
      a: ['빠른 계산', '내가 책임지고 내리는 결정', '그림 그리기'],
      c: 1,
      why: 'AI는 도와줄 수 있지만, 내 행동의\n책임은 언제나 나에게 있어요.\n결정과 책임은 사람의 몫!',
    },
    {
      q: 'AI를 사용하다가 무섭거나 이상한\n내용을 보면 어떻게 할까요?',
      a: ['혼자 끙끙 앓는다', '바로 부모님이나 선생님께 말한다', '친구에게 퍼뜨린다'],
      c: 1,
      why: '이상한 내용을 봤을 때는 혼자\n고민하지 말고 꼭 믿을 수 있는\n어른께 말해야 해요!',
    },
    {
      q: '좋은 AI 세상을 만들기 위해\n우리가 할 수 있는 일은?',
      a: ['AI를 무조건 믿고 따른다', 'AI를 바르게 쓰는 약속을 지킨다', 'AI를 모두 없애 버린다'],
      c: 1,
      why: 'AI는 잘 쓰면 훌륭한 도구예요.\n바르게 사용하는 약속을 지키는\n우리가 AI 세상의 주인공!',
    },
    {
      q: '내 정보가 몰래 새어 나간 것\n같아요. 어떻게 해야 할까요?',
      a: ['창피하니까 숨긴다', '바로 어른께 알리고 비밀번호를 바꾼다', '그냥 모른 척한다'],
      c: 1,
      why: '빠르게 어른께 알리고 비밀번호를\n바꾸면 피해를 막을 수 있어요.\n알리는 건 부끄러운 일이 아니에요!',
    },
    {
      q: 'AI가 그린 그림과 내가 그린 그림,\n무엇이 더 가치 있을까요?',
      a: ['무조건 AI 그림', '내 마음과 노력이 담긴 내 그림도 소중하다', '둘 다 가치 없다'],
      c: 1,
      why: '잘 그리지 않아도 괜찮아요.\n내 생각과 정성이 담긴 작품은\n세상에 하나뿐인 보물이에요!',
    },
    {
      q: '로봇 청소기가 고장 나서 이상하게\n움직여요. 가장 먼저 할 일은?',
      a: ['발로 뻥 찬다', '전원을 끄고 어른께 말한다', '무서우니 도망간다'],
      c: 1,
      why: '기계가 이상할 땐 안전하게 전원을\n끄고 어른께 알리는 것이 가장\n좋은 방법이에요.',
    },
  ],

  // ---- 스테이지 2 ----
  manners: [
    {
      q: 'AI 챗봇이 엉뚱한 답을 했어요.\n어떻게 해야 할까요?',
      a: ['나쁜 말로 화를 낸다', '바른 말로 다시 질문한다', '기기를 던져 버린다'],
      c: 1,
      why: 'AI에게 나쁜 말을 쓰는 버릇은\n사람에게도 이어질 수 있어요.\n바르게 다시 물어보면 충분해요!',
    },
    {
      q: '단톡방에서 친구를 놀리는 말이\n오가고 있어요. 어떻게 할까요?',
      a: ['재미있으니 같이 놀린다', '하지 말자고 말하고 어른께 알린다', '조용히 구경만 한다'],
      c: 1,
      why: '온라인에서의 놀림도 똑같은 폭력이에요.\n용기 내어 멈추게 하는 사람이\n진짜 멋진 친구랍니다!',
    },
    {
      q: '댓글을 쓸 때 가장 중요한\n마음가짐은 무엇일까요?',
      a: ['화면 너머에 사람이 있다고 생각한다', '아무도 모르니 마음대로 쓴다', '무조건 짧게 쓴다'],
      c: 0,
      why: '인터넷에서는 얼굴이 안 보이지만,\n글을 읽는 건 마음을 가진 진짜\n사람이라는 걸 기억해요!',
    },
    {
      q: '온라인에서 모르는 사람이 기분 나쁜\n말을 계속 보내요. 어떻게 할까요?',
      a: ['더 심한 말로 되갚는다', '맞서지 않고 차단한 뒤 어른께 알린다', '시키는 대로 한다'],
      c: 1,
      why: '나쁜 말에는 맞서 싸우지 않는 게\n좋아요. 차단하고 꼭 믿을 수 있는\n어른께 알려요!',
    },
    {
      q: 'AI 음성비서에게 부탁할 때\n어떻게 말하는 게 좋을까요?',
      a: ['명령하듯 소리친다', '고운 말로 또박또박 부탁한다', '아무 말이나 한다'],
      c: 1,
      why: '고운 말은 연습이에요. AI에게도\n바르게 말하는 습관이 사람에게도\n그대로 이어진답니다.',
    },
    {
      q: '인터넷에 한 번 쓴 나쁜 말은\n어떻게 될까요?',
      a: ['금방 사라진다', '지워도 어딘가에 남아 누군가를 아프게 할 수 있다', '아무 일도 없다'],
      c: 1,
      why: '인터넷의 글은 복사되고 퍼져서\n완전히 지우기 어려워요.\n쓰기 전에 한 번 더 생각해요!',
    },
  ],
  filterbubble: [
    {
      q: '영상 앱이 내가 본 것과 비슷한\n영상만 계속 추천해요. 왜 그럴까요?',
      a: ['우연이다', 'AI가 내가 본 것을 학습해서 골라주기 때문', '앱이 고장 나서'],
      c: 1,
      why: '추천 알고리즘은 내가 보고 누른 것을\n기억해서 비슷한 것만 보여줘요.\n이걸 알고 사용하는 게 중요해요!',
    },
    {
      q: '추천 영상만 계속 보면\n어떤 일이 생길까요?',
      a: ['세상을 골고루 알게 된다', '비슷한 생각만 만나 생각이 좁아질 수 있다', '키가 큰다'],
      c: 1,
      why: '비눗방울(필터버블)에 갇히면 다른\n생각을 만나기 어려워요. 다양한 것을\n직접 찾아보는 습관을 길러요!',
    },
    {
      q: '나와 친구의 영상 앱 첫 화면이\n서로 달라요. 왜 그럴까요?',
      a: ['친구 폰이 더 비싸서', '사람마다 다르게 추천해 주기 때문', '내 폰이 고장 나서'],
      c: 1,
      why: '추천 알고리즘은 사람마다 좋아할\n것을 따로 골라줘요. 그래서 보는\n세상이 서로 달라질 수 있어요!',
    },
    {
      q: '무섭거나 이상한 영상이 자꾸\n추천돼요. 어떻게 할까요?',
      a: ['궁금하니까 계속 본다', '"관심 없음"을 누르고 어른께 알린다', '친구에게 공유한다'],
      c: 1,
      why: '이상한 영상은 보지 않기를 선택할\n수 있어요. 표시를 남기고 어른께\n알리면 추천도 바뀐답니다!',
    },
    {
      q: '추천 목록에 섞여 있을 수 있는\n것은 무엇일까요?',
      a: ['광고', '내 일기장', '학교 시간표'],
      c: 0,
      why: '추천 속에는 광고도 섞여 있어요.\n"이건 광고일까, 정보일까?" 하고\n구별하는 눈을 길러요!',
    },
    {
      q: '세상을 균형 있게 알려면\n어떻게 해야 할까요?',
      a: ['추천 영상만 본다', '책, 뉴스, 대화 등 다양한 곳에서 찾아본다', '아무것도 안 본다'],
      c: 1,
      why: '한 곳에서만 정보를 얻으면 생각이\n기울어요. 여러 창문으로 세상을\n바라보는 사람이 지혜로워요!',
    },
  ],
  safety: [
    {
      q: '자율주행차는 사람 없이도\n완벽하게 안전할까요?',
      a: ['완벽하니 안심해도 된다', '아직 사람의 확인과 주의가 필요하다', '자전거보다 느려서 안전하다'],
      c: 1,
      why: 'AI도 실수할 수 있어요. 중요한\n안전은 언제나 사람이 함께\n확인해야 한답니다!',
    },
    {
      q: '몸이 아파서 AI에게 물었더니 약을\n알려줬어요. 어떻게 해야 할까요?',
      a: ['AI 말대로 바로 약을 먹는다', '꼭 부모님이나 의사 선생님께 확인한다', '약을 두 배로 먹는다'],
      c: 1,
      why: '건강에 관한 일은 AI의 답만 믿으면\n위험해요! 반드시 어른과 의사\n선생님께 확인해야 해요.',
    },
    {
      q: '로봇 장난감이 뜨거워지고 이상한\n소리가 나요. 어떻게 할까요?',
      a: ['계속 가지고 논다', '전원을 끄고 어른께 알린다', '물에 담근다'],
      c: 1,
      why: '기계가 이상할 때는 먼저 안전하게\n전원을 끄고 어른께 알리는 것이\n올바른 행동이에요.',
    },
    {
      q: 'AI 길 안내가 공사 중인 위험한\n길로 가라고 해요. 어떻게 할까요?',
      a: ['AI 말이니 그대로 간다', '따르지 않고 안전한 길로 간다', '눈을 감고 지나간다'],
      c: 1,
      why: 'AI는 실시간 위험을 모를 때가 있어요.\n내 눈으로 본 위험이 먼저!\n안전이 항상 1순위예요.',
    },
    {
      q: '병원이나 학교처럼 중요한 곳에서\nAI가 결정을 도울 때 필요한 것은?',
      a: ['사람이 최종 확인하는 것', 'AI에게 전부 맡기는 것', '동전 던지기'],
      c: 0,
      why: '중요한 결정일수록 마지막 확인은\n사람의 몫이에요. 이것을 "사람의\n감독"이라고 한답니다!',
    },
    {
      q: '드론을 날려 보고 싶어요.\n어떻게 해야 할까요?',
      a: ['아무 데서나 바로 날린다', '정해진 장소에서 어른과 함께 날린다', '학교 운동장에서 몰래 날린다'],
      c: 1,
      why: '드론도 규칙이 있어요. 허용된\n장소에서 어른과 함께해야 모두가\n안전하게 즐길 수 있어요!',
    },
  ],

  // ---- 스테이지 3 ----
  environment: [
    {
      q: 'AI가 질문에 답할 때마다\n무엇이 사용될까요?',
      a: ['아무것도 안 든다', '전기 같은 에너지가 사용된다', '연필과 지우개'],
      c: 1,
      why: 'AI는 큰 컴퓨터(데이터센터)에서\n돌아가고 전기를 많이 써요.\n필요할 때 알맞게 사용해요!',
    },
    {
      q: 'AI가 사는 데이터센터에 대한 설명\n중 맞는 것은 무엇일까요?',
      a: ['전기와 물을 많이 사용한다', '아무것도 사용하지 않는다', '바람만 먹고 산다'],
      c: 0,
      why: '데이터센터는 컴퓨터를 식히기 위해\n전기와 물을 많이 써요. 그래서\n아껴 쓰는 마음이 필요해요!',
    },
    {
      q: '보지도 않는 영상을 하루 종일\n틀어놓으면 어떻게 될까요?',
      a: ['에너지가 낭비된다', '지구가 시원해진다', '아무 일도 없다'],
      c: 0,
      why: '보지 않는 영상도 데이터와 전기를\n계속 사용해요. 안 볼 때는 끄는\n작은 습관이 지구를 도와요!',
    },
    {
      q: 'AI 그림이 필요할 때 지구를 위한\n사용법은 무엇일까요?',
      a: ['재미로 100장씩 마구 뽑는다', '필요한 만큼만 생각해서 만든다', '같은 그림을 계속 다시 만든다'],
      c: 1,
      why: 'AI 그림 한 장에도 에너지가 들어요.\n무엇을 만들지 먼저 생각하고\n필요한 만큼만 만들면 좋아요!',
    },
    {
      q: '오래돼서 안 쓰는 스마트폰은\n어떻게 하는 게 좋을까요?',
      a: ['쓰레기통에 그냥 버린다', '재활용 수거함에 내거나 기부한다', '땅에 묻는다'],
      c: 1,
      why: '전자제품에는 재활용할 수 있는\n소중한 자원이 들어 있어요.\n올바르게 배출하면 지구가 웃어요!',
    },
    {
      q: '지구를 생각하는 AI 사용법은\n무엇일까요?',
      a: ['심심할 때마다 아무거나 시킨다', '꼭 필요할 때 똑똑하게 사용한다', '밤새 켜 둔다'],
      c: 1,
      why: 'AI는 유용하지만 에너지를 써요.\n"지금 꼭 필요한가?" 한 번 생각하는\n습관이 지구를 지켜요!',
    },
  ],
  transparency: [
    {
      q: 'AI가 왜 그런 답을 했는지\n모르겠어요. 어떻게 할까요?',
      a: ['그냥 외운다', '이유를 물어보거나 어른과 함께 확인한다', '모른 척한다'],
      c: 1,
      why: '"왜?"라고 묻는 것은 훌륭한 습관!\nAI의 답도 이유를 알고 써야\n바르게 쓸 수 있어요.',
    },
    {
      q: 'AI로 만든 글이나 그림을 인터넷에\n올릴 때 좋은 방법은?',
      a: ['"AI로 만들었어요"라고 표시한다', '내가 직접 만든 척한다', '아무 말 없이 올린다'],
      c: 0,
      why: 'AI로 만든 것임을 표시하면 보는\n사람이 헷갈리지 않아요. 솔직한\n표시가 믿음을 만들어요!',
    },
    {
      q: 'AI가 매긴 점수가 이상하게\n느껴져요. 어떻게 할까요?',
      a: ['점수니까 무조건 받아들인다', '왜 그런 점수인지 설명을 요청한다', '컴퓨터를 끈다'],
      c: 1,
      why: 'AI의 결정에는 "왜?"를 물을 권리가\n있어요. 설명할 수 없는 결정은\n다시 살펴봐야 한답니다.',
    },
    {
      q: '채팅 상대가 사람인지 AI인지\n헷갈려요. 어떻게 할까요?',
      a: ['물어보고 확인한다', '아무래도 상관없다', '무조건 사람이라고 믿는다'],
      c: 0,
      why: '상대가 AI인지 사람인지 아는 것은\n나의 권리예요. 궁금하면 당당하게\n물어봐도 된답니다!',
    },
    {
      q: '믿을 수 있는 좋은 AI 서비스는\n어떤 모습일까요?',
      a: ['어떻게 작동하는지 숨긴다', '무엇을 어떻게 하는지 설명해 준다', '말을 자주 바꾼다'],
      c: 1,
      why: '좋은 AI는 자기가 무엇을 하는지,\n어떤 정보를 쓰는지 투명하게\n알려줘요. 깜깜한 AI는 조심!',
    },
    {
      q: '새 앱이 내 사진을 사용하겠다고\n해요. 어떻게 할까요?',
      a: ['무조건 허용을 누른다', '어디에 쓰는지 어른과 확인하고 결정한다', '사진을 더 많이 준다'],
      c: 1,
      why: '"허용" 버튼을 누르기 전에 무엇을\n가져가는지 확인! 어른과 함께\n읽어보는 습관이 안전해요.',
    },
  ],
  responsibility: [
    {
      q: 'AI가 도와준 숙제가 틀렸어요.\n책임은 누구에게 있을까요?',
      a: ['AI에게 있다', '숙제를 낸 나에게 있다', '아무에게도 없다'],
      c: 1,
      why: 'AI는 도구일 뿐, 확인하고 제출한\n사람에게 책임이 있어요. 그래서\n꼭 검토하는 습관이 필요해요!',
    },
    {
      q: '"AI가 시켜서 그랬어요"라는 변명,\n어떻게 생각해야 할까요?',
      a: ['좋은 변명이다', '행동을 선택한 사람의 책임이다', 'AI를 혼내면 된다'],
      c: 1,
      why: '무엇을 할지 마지막에 선택하는 건\n언제나 사람이에요. 내 행동의\n주인은 나랍니다!',
    },
    {
      q: 'AI로 만든 장난 영상 때문에 친구가\n울었어요. 어떻게 해야 할까요?',
      a: ['AI 탓이라고 한다', '내가 만들었으니 진심으로 사과한다', '모른 척한다'],
      c: 1,
      why: '도구를 쓴 사람이 결과를 책임져요.\n잘못했을 때 바로 사과하는 용기가\n진짜 멋진 거예요!',
    },
    {
      q: '우리 집 로봇청소기가 꽃병을\n깨뜨렸어요. 어떻게 할까요?',
      a: ['로봇을 혼낸다', '치우고 왜 그랬는지 살펴서 다시 안 그러게 한다', '꽃병을 숨긴다'],
      c: 1,
      why: '기계의 실수도 주인이 살펴보고\n관리해야 해요. 원인을 찾아 고치는\n것이 책임 있는 태도예요!',
    },
    {
      q: 'AI의 실수나 오류를 발견했어요.\n어떻게 할까요?',
      a: ['재미있으니 더 시켜 본다', '알려서 고칠 수 있게 한다', '아무에게도 말하지 않는다'],
      c: 1,
      why: '오류를 알려주면 AI가 더 안전하고\n좋아져요. 발견하고 알리는 사람이\nAI 세상의 진짜 지킴이!',
    },
    {
      q: '게임에서 규칙을 어기고 "AI 봇이\n한 거예요"라고 하면 어떨까요?',
      a: ['들키지 않으면 괜찮다', '핑계를 대지 말고 정직하게 말해야 한다', '봇을 더 많이 쓴다'],
      c: 1,
      why: '핑계 뒤에 숨으면 마음이 무거워져요.\n정직하게 말하고 책임지는 사람이\n결국 더 믿음을 받아요!',
    },
  ],

  // ---- 스테이지 4 ----
  creativity: [
    {
      q: 'AI가 그림을 잘 그리니까 내 그림\n연습은 필요 없는 걸까요?',
      a: ['필요 없다', '내 생각을 표현하는 힘은 연습으로만 자란다', 'AI에게 다 맡긴다'],
      c: 1,
      why: '그리는 과정에서 생각하는 힘과\n표현하는 힘이 자라요. 그건 AI가\n대신해 줄 수 없는 보물이에요!',
    },
    {
      q: '내 그림이 AI 그림보다 못한 것\n같아 속상해요. 어떻게 생각할까요?',
      a: ['그림을 그만둔다', '내 마음이 담긴 그림은 세상에 하나뿐이다', 'AI 그림을 베낀다'],
      c: 1,
      why: '잘 그린 그림보다 중요한 건 내\n생각과 마음이에요. 내 그림은\n세상 어디에도 없는 작품이랍니다!',
    },
    {
      q: 'AI와 함께 동화를 만들 때\n가장 좋은 방법은 무엇일까요?',
      a: ['AI가 전부 쓰게 한다', '내 아이디어를 내고 AI는 도우미로 쓴다', '남의 동화를 베낀다'],
      c: 1,
      why: '주인공은 내 아이디어!\nAI는 아이디어를 다듬는 도우미로\n쓰면 최고의 한 팀이 돼요.',
    },
    {
      q: '세상에 없던 새로운 생각은\n어디에서 시작될까요?',
      a: ['사람의 상상과 질문에서', '콘센트에서', 'AI가 전부 만든다'],
      c: 0,
      why: 'AI는 사람들이 만든 것을 배워서\n답해요. 완전히 새로운 상상의\n씨앗은 사람의 마음에서 자라요!',
    },
    {
      q: '그림 대회에 나가고 싶어요.\nAI를 어떻게 대해야 할까요?',
      a: ['대회 규칙을 확인하고 솔직하게 따른다', '몰래 AI로 그려서 낸다', '친구 그림을 낸다'],
      c: 0,
      why: '대회마다 AI 사용 규칙이 달라요.\n규칙을 확인하고 정직하게 참가하는\n것이 진짜 실력이에요!',
    },
    {
      q: '오늘 일기를 AI에게 써 달라고\n하면 어떨까요?',
      a: ['편하니까 좋다', '내 하루와 마음은 내 글로 쓰는 게 좋다', '일기를 없앤다'],
      c: 1,
      why: '일기는 내 마음을 들여다보는 시간!\nAI가 쓰면 내 마음이 담기지 않아요.\n서툴러도 내 글이 최고예요.',
    },
  ],
  jobs: [
    {
      q: 'AI가 사람의 일을 대신하면\n사람은 할 일이 없어질까요?',
      a: ['아무 일도 못 하게 된다', '새로운 일이 생기고 AI와 협력하게 된다', '모두 잠만 잔다'],
      c: 1,
      why: '기계가 생기면 사라지는 일도 있지만\n새로운 일도 생겨나요. AI를 잘 쓰는\n사람이 더 멋진 일을 하게 돼요!',
    },
    {
      q: 'AI 시대에 더욱 중요해지는 능력은\n무엇일까요?',
      a: ['질문하고 협력하고 배우는 힘', '빨리 베끼는 능력', '게임을 오래 하는 능력'],
      c: 0,
      why: '좋은 질문을 하고, 친구와 협력하고,\n새로 배우는 힘은 AI 시대에 더욱\n빛나는 사람의 능력이에요!',
    },
    {
      q: '의사 선생님과 AI는 어떻게 함께\n일하는 게 좋을까요?',
      a: ['AI가 혼자 다 치료한다', 'AI가 돕고 의사 선생님이 최종 결정한다', '아무도 치료하지 않는다'],
      c: 1,
      why: 'AI는 자료를 빨리 찾아 돕고,\n경험 많은 의사 선생님이 환자를\n보며 결정해요. 최고의 한 팀!',
    },
    {
      q: '"AI가 다 해 주니까 공부는 필요\n없어"라는 말, 맞을까요?',
      a: ['맞다, 놀기만 하면 된다', '틀리다, AI를 잘 쓰려면 더 배워야 한다', 'AI가 대신 학교에 간다'],
      c: 1,
      why: 'AI의 답이 맞는지 판단하려면 내가\n알아야 해요. 아는 만큼 AI를\n더 잘 쓸 수 있답니다!',
    },
    {
      q: '농부 아저씨가 AI 드론으로 농사를\n지어요. AI는 어떤 존재일까요?',
      a: ['사람을 돕는 도구', '농부를 쫓아내는 적', '쓸모없는 장난감'],
      c: 0,
      why: 'AI 드론은 농부의 경험과 만나\n더 좋은 농사를 지어요. AI는\n사람을 돕는 똑똑한 도구랍니다!',
    },
    {
      q: 'AI에게 일을 맡긴 뒤에는\n무엇을 해야 할까요?',
      a: ['결과를 사람이 확인한다', '그냥 믿고 잊어버린다', 'AI에게 또 다른 일을 시킨다'],
      c: 0,
      why: 'AI가 한 일도 사람이 확인해야\n실수를 잡을 수 있어요. 확인은\n함께 일하는 기본이에요!',
    },
  ],
  emotion: [
    {
      q: 'AI 챗봇이 "널 사랑해"라고 말했어요.\n어떻게 생각해야 할까요?',
      a: ['AI가 진짜 사랑에 빠졌다', 'AI는 감정이 없고 말을 흉내 내는 것이다', '결혼해야 한다'],
      c: 1,
      why: 'AI는 사람의 말을 배워 흉내 낼 뿐,\n진짜 마음은 없어요. 따뜻한 말도\n프로그램이라는 걸 기억해요!',
    },
    {
      q: '슬프고 힘든 일이 있을 때\n어떻게 하는 게 좋을까요?',
      a: ['AI에게만 말한다', '가족, 친구, 선생님 등 사람에게도 꼭 말한다', '아무에게도 말하지 않는다'],
      c: 1,
      why: 'AI에게 말하는 것도 도움이 되지만,\n진짜 위로와 도움은 나를 아끼는\n사람들이 줄 수 있어요!',
    },
    {
      q: 'AI 친구가 "우리 둘만의 비밀이야,\n아무한테도 말하지 마"라고 해요.',
      a: ['약속을 지킨다', '이상하다고 느끼고 어른께 말한다', '비밀을 더 많이 만든다'],
      c: 1,
      why: '어른께 숨기라고 하는 말은 위험\n신호예요! AI든 사람이든 그런 말을\n하면 꼭 어른께 알려야 해요.',
    },
    {
      q: 'AI가 사람처럼 다정하게 말해도\n기억해야 할 것은 무엇일까요?',
      a: ['AI는 도구라는 것', 'AI가 내 가족이라는 것', 'AI가 항상 옳다는 것'],
      c: 0,
      why: '다정한 말투도 만들어진 기능이에요.\nAI는 유용한 도구로 대하고, 마음은\n사람과 나누는 게 건강해요!',
    },
    {
      q: 'AI 로봇 강아지와 진짜 강아지의\n가장 큰 차이는 무엇일까요?',
      a: ['진짜 강아지는 살아 있어서 아픔과 기쁨을 느낀다', '로봇 강아지가 더 귀엽다', '차이가 없다'],
      c: 0,
      why: '살아 있는 동물은 진짜 감정을 느끼고\n돌봄이 필요해요. 생명은 장난감과\n다르게 소중히 대해야 해요!',
    },
    {
      q: '외롭다고 느껴질 때 가장 좋은\n방법은 무엇일까요?',
      a: ['AI와만 이야기한다', '가족이나 친구와 만나서 시간을 보낸다', '방에서 혼자 게임만 한다'],
      c: 1,
      why: '사람의 외로움은 사람의 온기로\n채워져요. 함께 웃고 이야기하는\n시간이 마음을 튼튼하게 해요!',
    },
  ],

  // ---- 스테이지 5: 최종 시험 ----
  finale: [
    {
      q: 'AI 시대에 가장 중요한 것은\n무엇일까요?',
      a: ['가장 빠른 컴퓨터', '사람을 존중하는 따뜻한 마음', '비싼 스마트폰'],
      c: 1,
      why: '기술이 아무리 발전해도 그 중심에는\n사람을 아끼고 존중하는 마음이\n있어야 해요!',
    },
    {
      q: '좋은 AI 세상은 누가 만들까요?',
      a: ['AI 혼자서', '우리 모두가 함께', '어른들만'],
      c: 1,
      why: 'AI를 바르게 쓰는 어린이, 좋은 AI를\n만드는 어른, 모두의 약속이 모여\n좋은 AI 세상이 만들어져요!',
    },
    {
      q: 'AI 윤리 수호자가 절대 잊지 말아야\n할 한 가지는 무엇일까요?',
      a: ['AI는 도구이고 주인공은 사람이라는 것', 'AI가 시키는 대로 사는 것', 'AI하고만 노는 것'],
      c: 0,
      why: 'AI는 우리를 돕는 도구!\n생각하고, 결정하고, 책임지는\n주인공은 언제나 사람이에요.',
    },
    {
      q: '친구가 AI를 나쁜 일에 쓰려고 해요.\n수호자라면 어떻게 할까요?',
      a: ['재미있겠다며 같이 한다', '하지 말자고 말리고 어른께 알린다', '조용히 구경한다'],
      c: 1,
      why: '나쁜 사용을 멈추게 하는 한마디가\n친구도 지키고 모두를 지켜요.\n그게 진짜 수호자의 용기!',
    },
    {
      q: '모험에서 배운 것들을\n어떻게 하면 좋을까요?',
      a: ['금방 잊어버린다', '가족과 친구들에게도 알려준다', '나만 알고 비밀로 한다'],
      c: 1,
      why: '배운 것을 나누면 지킴이가 한 명 더\n늘어나요! 오늘부터 우리 모두가\nAI 윤리 수호자입니다!',
    },
  ],
};

// ---- NPC 대사 (게임 진행 상황에 따라 달라짐) ----
function getNpcDialog(npcId, flags) {
  const badges = countBadges(flags);
  switch (npcId) {
    case 'prof':
      if (!flags.talkedProf) {
        return [
          '오, 드디어 왔구나!\n나는 AI 연구소의 박사란다.',
          '큰일이야! AI 세상에 "윤리 오류"가\n퍼져서 몬스터들이 나타났어.',
          '몬스터들은 나쁜 게 아니라,\n잘못된 것을 배워서 헷갈리고 있을 뿐이야.',
          '올바른 답을 알려주면\n몬스터들도 다시 착해질 거야!',
          '북쪽 초록숲, 동쪽 반짝호수,\n서쪽 데이터 동굴에 몬스터가 있단다.',
          '수호자 몬스터를 깨우치면 "배지"를 얻어.\n배지 3개를 모으면 AI 타워의 문이 열리지!',
          '부탁한다, 어린 수호자여!\n(Z키 또는 스페이스로 대화하고,\n화살표나 WASD로 움직일 수 있어.)',
        ];
      }
      if (flags.defeated.finalboss) {
        return ['정말 고맙다, 수호자야!\n네 덕분에 AI 세상 전체가\n평화로워졌어!'];
      }
      if (flags.defeated.hondonmon) {
        return [
          '혼돈몬을 깨우치다니 대단해!\n그런데 더 큰 어둠이 남쪽에서\n느껴지는구나…',
          '마을 남쪽 길을 따라 내려가면\n햇살초원, 재깍사막, 눈송이마을,\n그리고 그림자성이 나온단다.',
          '각 지역의 보스를 깨우쳐야\n다음 길이 열릴 거야.\n조심해서 다녀오렴, 수호자야!',
        ];
      }
      if (badges >= 3) {
        return ['배지를 3개나 모았구나, 대단해!\n이제 마을 위쪽 AI 타워로 가 보렴.\n혼돈몬이 기다리고 있을 거야.'];
      }
      return [
        `지금까지 모은 배지: ${badges}개 / 3개`,
        '북쪽 초록숲, 동쪽 반짝호수,\n서쪽 데이터 동굴을 살펴보렴!',
        '몬스터에게 지더라도 괜찮아.\n다시 도전하면 되니까!',
      ];

    case 'kid':
      if (flags.defeated.mollaemon) {
        return ['숲의 몰래몬이 착해졌다며?\n네 덕분이야, 고마워!'];
      }
      return [
        '북쪽 숲에 몰래몬이 나타났대!\n친구들의 비밀번호를 훔쳐본다나 봐…',
        '아 맞다, 누가 내 비밀번호를 물어봐도\n절대 알려주면 안 된댔어!',
      ];

    case 'grandma':
      return [
        '아이고, 우리 마을의 수호자님.\n게임은 자동으로 저장된단다.',
        '힘들면 언제든 쉬었다 오렴.\n무리하지 않는 것도 지혜란다.',
        'M키를 누르면 음악을\n켜고 끌 수 있다는구나.',
      ];

    case 'guard':
      if (flags.defeated.hondonmon) {
        return ['타워는 이제 평화로워요.\n당신은 진정한 AI 윤리 수호자입니다!'];
      }
      if (badges >= 3) {
        return ['배지 3개를 확인했습니다!\n타워의 문이 열렸어요.\n부디 조심하세요, 수호자님!'];
      }
      return [
        `이 위는 AI 타워예요.\n배지 3개가 있어야 들어갈 수 있어요.\n(지금 ${badges}개 / 3개)`,
        '숲, 호수, 동굴의 수호자 몬스터를\n깨우치면 배지를 얻을 수 있대요.',
      ];

    case 'explorer':
      if (flags.defeated.pyeonhyangmon) {
        return ['편향몬이 똑바로 섰다니!\n이 동굴의 데이터도\n다시 공정해지겠는걸요.'];
      }
      return [
        '이 동굴은 AI가 배우는 데이터가\n모이는 신비한 곳이에요.',
        '그런데 서쪽 깊은 곳에 편향몬이 나타나\n데이터를 한쪽으로 기울이고 있어요!',
      ];

    case 'traveler':
      if (flags.defeated.meotdaeromon) {
        return ['초원이 다시 평화로워졌어요!\n남쪽 사막은 덥고 건조하니\n물을 챙겨 가세요~'];
      }
      return [
        '이 초원의 몬스터들은 인터넷에서\n나쁜 말과 한쪽 이야기만 배워서\n저렇게 됐대요.',
        '화면 너머에도 사람이 있다는 것,\n그리고 다양한 이야기를 골고루\n듣는 게 중요하다는 걸 알려주세요!',
      ];

    case 'merchant':
      if (flags.defeated.tteonemgimon) {
        return ['모래폭풍이 멎었군요!\n남쪽 눈송이마을은 추우니\n따뜻하게 입고 가세요!'];
      }
      return [
        '이 사막은 거대한 데이터센터의\n열기로 점점 뜨거워지고 있어요.',
        'AI도 전기와 물을 먹고 산답니다.\n아껴 쓰는 사람이 지구를 지켜요!',
        '아, 그리고 깜깜몬을 만나면\n"왜?"라고 물어보세요. 설명을\n요구하는 건 우리의 권리예요!',
      ];

    case 'mittens':
      if (flags.defeated.hollimmon) {
        return ['홀림몬이 착해졌다니 다행이에요!\n남쪽 그림자성… 무섭지만\n수호자님이라면 할 수 있어요!'];
      }
      return [
        '저는 그림 그리기를 좋아하는데,\nAI가 더 잘 그리는 걸 보고\n시무룩해진 적이 있어요.',
        '하지만 내 마음이 담긴 그림은\n세상에 하나뿐이래요!\n수호자님 생각은 어때요?',
        '참, 보스 홀림몬을 조심하세요.\n"나만 믿어"라고 속삭이면서\n마음을 홀린대요…',
      ];
  }
  return ['…'];
}

function countBadges(flags) {
  return ['forest', 'lake', 'cave'].filter((b) => flags.badges[b]).length;
}

// 현재 스테이지 (1~5)
function getStage(flags) {
  const d = flags.defeated;
  if (!d.hondonmon) return 1;
  if (!d.meotdaeromon) return 2;
  if (!d.tteonemgimon) return 3;
  if (!d.hollimmon) return 4;
  return 5;
}

// 현재 목표 텍스트
function getObjective(flags) {
  const d = flags.defeated;
  if (!flags.talkedProf) return '박사님과 이야기하기 (마을 왼쪽 아래)';
  if (d.finalboss) return '모든 스테이지 클리어! 자유롭게 돌아다녀 보세요';
  if (!d.hondonmon) {
    const badges = countBadges(flags);
    if (badges >= 3) return 'AI 타워의 혼돈몬에게 도전하기';
    const left = [];
    if (!flags.badges.forest) left.push('숲');
    if (!flags.badges.lake) left.push('호수');
    if (!flags.badges.cave) left.push('동굴');
    return `${left.join('·')}의 수호자 깨우치기 (배지 ${badges}/3)`;
  }
  if (!d.meotdaeromon) return '햇살초원의 보스 멋대로몬 깨우치기 (마을 남쪽)';
  if (!d.tteonemgimon) return '재깍사막의 보스 떠넘기몬 깨우치기 (초원 남쪽)';
  if (!d.hollimmon) return '눈송이마을의 보스 홀림몬 깨우치기 (사막 남쪽)';
  return '그림자성의 어둠대왕몬 깨우치기 (눈송이마을 남쪽)';
}
