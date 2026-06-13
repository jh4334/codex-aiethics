// 게임 데이터: 맵, NPC, 몬스터, 퀴즈
//
// 타일 종류
//  G 풀  P 길  F 꽃  S 모래  B 다리  C 동굴바닥  M 탑바닥  1 탑문(워프)
//  T 나무  W 물  O 지붕  H 벽  D 문(장식)  R 바위  K 동굴벽  * 수정  N 탑벽  Y 표지판

const WALKABLE = new Set(['G', 'P', 'F', 'S', 'B', 'C', 'M', 'Z', 'E', 'I', '2', '4', 'A', '1']);

const MAPS = {
  village: {
    name: '경계마을',
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
        lockText: '남쪽 길이 어둠의 안개로 막혀 있다.\n신호탑의 혼돈몬을 깨우치면\n안개가 걷힐 것 같다.' },
      { x: 14, y: 19, to: 'meadow', tx: 14, ty: 1, needBoss: 'hondonmon',
        lockText: '남쪽 길이 어둠의 안개로 막혀 있다.\n신호탑의 혼돈몬을 깨우치면\n안개가 걷힐 것 같다.' },
    ],
    npcs: [
      { id: 'prof', x: 4, y: 12, pal: 'prof', name: '박사님' },
      { id: 'kid', x: 16, y: 7, pal: 'kid', name: '아이 도도' },
      { id: 'grandma', x: 20, y: 12, pal: 'grandma', name: '할머니' },
      { id: 'guard', x: 17, y: 6, pal: 'guard', name: '탑 안내원' },
      { id: 'yeongi_npc', x: 5, y: 12, monSprite: 'yeongi', name: '영이',
        show: (flags) => !!flags.trueEnding },
    ],
    signs: [
      { x: 15, y: 16, text: '≪경계마을≫\nAI 윤리 수호대의 고향입니다.' },
    ],
    monsters: [],
  },

  forest: {
    name: '정적의 숲',
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
      { x: 12, y: 17, text: '≪정적의 숲≫\n요즘 몬스터들이 나타나\n숲이 어수선합니다. 조심!' },
    ],
    monsters: [
      { id: 'bekkyeomon', x: 7, y: 10 },
      { id: 'mollaemon', x: 13, y: 3 },
    ],
  },

  lake: {
    name: '잔향의 호수',
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
      { x: 2, y: 16, text: '≪잔향의 호수≫\n호수 가운데 섬에서\n이상한 소문이 들려옵니다…' },
    ],
    monsters: [
      { id: 'jungdokmon', x: 8, y: 14 },
      { id: 'geojitmon', x: 15, y: 5 },
    ],
  },

  cave: {
    name: '회로의 동굴',
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
    name: '신호탑',
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
    name: '정지된 설원 (스테이지 4)',
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
      { x: 2, y: 12, text: '≪정지된 설원≫ 스테이지 4\n남쪽 그림자성에서 어둠의 기운이…\n마음을 단단히 먹으세요!' },
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
      { x: 9, y: 1, to: 'serverroom', tx: 13, ty: 18, needBoss: 'finalboss',
        lockText: '벽 너머에서 지지직거리는\n잡음이 들린다…' },
    ],
    npcs: [],
    signs: [],
    monsters: [
      { id: 'maearimon', x: 10, y: 8 },
      { id: 'geurimjamon', x: 9, y: 4 },
      { id: 'finalboss', x: 9, y: 2 },
    ],
  },

  // ---- 스테이지 6 ----
  serverroom: {
    name: '잊혀진 서버실 (스테이지 6)',
    song: 'glitch',
    intro: [
      '낡은 서버들이 늘어선 차가운 방.\n먼지 쌓인 기계들 사이로\n희미한 불빛이 깜빡인다.',
      '…여기는 분명, 그림자성보다\n훨씬 오래된 곳이다.',
    ],
    tiles: [
      'KKKKKKKKKKKKKEEKKKKKKKKKKKKK',
      'KEEEEEEEEEEEEEEEEEEEEEEEEEEK',
      'KEVVEVVEVVEEEEEEVVEVVEVVEEEK',
      'KEVVEVVEVVEEEEEEVVEVVEVVEEEK',
      'KEEEEEEEEEEEEEEEEEEEEEEEEEEK',
      'KEVVEVVEVVEEEEEEVVEVVEVVEEEK',
      'KEVVEVVEVVEEEEEEVVEVVEVVEEEK',
      'KEEEEEEEEEEEEEEEEEEEEEEEEEEK',
      'KEEEEEEEEEEEEEEEEEEEEEEEEEEK',
      'KEVVEVVEVVEEEEEEVVEVVEVVEEEK',
      'KEVVEVVEVVEEEEEEVVEVVEVVEEEK',
      'KEEEEEEEEEEEEEEEEEEEEEEEEEEK',
      'KEYEEEEEEEEEEEEEEEEEEEEEEEEK',
      'KEVVEVVEVVEEEEEEVVEVVEVVEEEK',
      'KEVVEVVEVVEEEEEEVVEVVEVVEEEK',
      'KEEEEEEEEEEEEEEEEEEEEEEEEEEK',
      'KEEEEEEEEEEEEEEEEEEEEEEEEEEK',
      'KEEEEEEEEEEEEEEEEEEEEEEEEEEK',
      'KEEEEEEEEEEEEEEEEEEEEEEEEEEK',
      'KKKKKKKKKKKKKEEKKKKKKKKKKKKK',
    ],
    warps: [
      { x: 13, y: 19, to: 'castle', tx: 9, ty: 2 },
      { x: 14, y: 19, to: 'castle', tx: 9, ty: 2 },
      { x: 13, y: 0, to: 'library', tx: 13, ty: 18, needBoss: 'girokmon',
        lockText: '북쪽 문에 굳은 자물쇠.\n이 방의 관리자, 기록몬의\n허락이 필요해 보인다.' },
      { x: 14, y: 0, to: 'library', tx: 14, ty: 18, needBoss: 'girokmon',
        lockText: '북쪽 문에 굳은 자물쇠.\n이 방의 관리자, 기록몬의\n허락이 필요해 보인다.' },
    ],
    npcs: [
      { id: 'hologram1', x: 16, y: 16, pal: 'prof', name: '박사님(홀로그램)' },
    ],
    signs: [
      { x: 2, y: 12, text: '[제0연구동 — 서버실]\n…출입 기록: 마지막 접속,\n아주 오래전.' },
    ],
    monsters: [
      { id: 'tturimmon', x: 7, y: 8 },
      { id: 'girokmon', x: 13, y: 2 },
    ],
  },

  // ---- 스테이지 7 ----
  library: {
    name: '기억의 도서관 (스테이지 7)',
    song: 'title',
    intro: [
      '끝없이 늘어선 책장.\n책등에는 이름이 하나씩 적혀 있다.',
      '…전부, 누군가의 기억이다.',
    ],
    tiles: [
      'NNNNNNNNNNNNNIINNNNNNNNNNNNN',
      'NIIIIIIIIIIIIIIIIIIIIIIIIIIN',
      'NILLLLLILLLLLIILLLLLILLLLLIN',
      'NIIIIIIIIIIIIIIIIIIIIIIIIIIN',
      'NILLLLLILLLLLIILLLLLILLLLLIN',
      'NIIIIIIIIIIIIIIIIIIIIIIIIIIN',
      'NILLLLLILLLLLIILLLLLILLLLLIN',
      'NIIIIIIIIIIIIIIIIIIIIIIIIIIN',
      'NIIIIIIIIIIIIIIIIIIIIIIIIIIN',
      'NILLLLLILLLLLIILLLLLILLLLLIN',
      'NIIIIIIIIIIIIIIIIIIIIIIIIIIN',
      'NIYIIIIIIIIIIIIIIIIIIIIIIIIN',
      'NILLLLLILLLLLIILLLLLILLLLLIN',
      'NIIIIIIIIIIIIIIIIIIIIIIIIIIN',
      'NIIIIIIIIIIIIIIIIIIIIIIIIIIN',
      'NIIIIIIIIIIIIIIIIIIIIIIIIIIN',
      'NIIIIIIIIIIIIIIIIIIIIIIIIIIN',
      'NIIIIIIIIIIIIIIIIIIIIIIIIIIN',
      'NIIIIIIIIIIIIIIIIIIIIIIIIIIN',
      'NNNNNNNNNNNNNIINNNNNNNNNNNNN',
    ],
    warps: [
      { x: 13, y: 19, to: 'serverroom', tx: 13, ty: 1 },
      { x: 14, y: 19, to: 'serverroom', tx: 14, ty: 1 },
      { x: 13, y: 0, to: 'mirrors', tx: 13, ty: 18, needBoss: 'saseomon',
        lockText: '책장이 길을 막고 있다.\n도서관의 주인, 사서몬이\n비켜 주지 않는다.' },
      { x: 14, y: 0, to: 'mirrors', tx: 14, ty: 18, needBoss: 'saseomon',
        lockText: '책장이 길을 막고 있다.\n도서관의 주인, 사서몬이\n비켜 주지 않는다.' },
    ],
    npcs: [],
    signs: [
      { x: 2, y: 11, text: '[열람 안내]\n허락 없이 가져간 기억은\n반드시 제자리에 돌려놓을 것.' },
    ],
    monsters: [
      { id: 'sujipmon', x: 20, y: 7 },
      { id: 'saseomon', x: 13, y: 2 },
    ],
  },

  // ---- 스테이지 8 ----
  mirrors: {
    name: '거울 회랑 (스테이지 8)',
    song: 'glitch',
    intro: [
      '거울로 된 복도.\n수많은 "나"가 함께 걷는다.',
      '…그런데 저 거울 속의 나는\n방금, 혼자서 움직이지 않았나?',
    ],
    tiles: [
      'QQQQQQQQQQQQQMMQQQQQQQQQQQQQ',
      'QMMMMMMMMMMMMMMMMMMMMMMMMMMQ',
      'QMMMMMMMMMMMMMMMMMMMMMMMMMMQ',
      'QMMMMMMMMMMMMMMMMMMMMMMMMMMQ',
      'QMMQMMQMMQMMQMMQMMQMMQMMQMMQ',
      'QMMMMMMMMMMMMMMMMMMMMMMMMMMQ',
      'QMMMMMMMMMMMMMMMMMMMMMMMMMMQ',
      'QMMQMMQMMQMMQMMQMMQMMQMMQMMQ',
      'QMMMMMMMMMMMMMMMMMMMMMMMMMMQ',
      'QMMMMMMMMMMMMMMMMMMMMMMMMMMQ',
      'QMYMMMMMMMMMMMMMMMMMMMMMMMMQ',
      'QMMQMMQMMQMMQMMQMMQMMQMMQMMQ',
      'QMMMMMMMMMMMMMMMMMMMMMMMMMMQ',
      'QMMMMMMMMMMMMMMMMMMMMMMMMMMQ',
      'QMMQMMQMMQMMQMMQMMQMMQMMQMMQ',
      'QMMMMMMMMMMMMMMMMMMMMMMMMMMQ',
      'QMMMMMMMMMMMMMMMMMMMMMMMMMMQ',
      'QMMMMMMMMMMMMMMMMMMMMMMMMMMQ',
      'QMMMMMMMMMMMMMMMMMMMMMMMMMMQ',
      'QQQQQQQQQQQQQMMQQQQQQQQQQQQQ',
    ],
    warps: [
      { x: 13, y: 19, to: 'library', tx: 13, ty: 1 },
      { x: 14, y: 19, to: 'library', tx: 14, ty: 1 },
      { x: 13, y: 0, to: 'garden', tx: 13, ty: 1, needBoss: 'mirrormon',
        lockText: '거울 속의 네가 고개를 젓는다.\n…아직은 지나갈 수 없다.' },
      { x: 14, y: 0, to: 'garden', tx: 14, ty: 1, needBoss: 'mirrormon',
        lockText: '거울 속의 네가 고개를 젓는다.\n…아직은 지나갈 수 없다.' },
    ],
    npcs: [],
    signs: [
      { x: 2, y: 10, text: '거울에 흐릿한 글씨가 적혀 있다.\n"필터 너머의 얼굴이 아니라,\n지금의 너를 보아 줘."' },
    ],
    monsters: [
      { id: 'piltermon', x: 7, y: 6 },
      { id: 'mirrormon', x: 13, y: 2 },
    ],
  },

  // ---- 스테이지 9 ----
  garden: {
    name: '속삭임 정원 (스테이지 9)',
    song: 'cave',
    intro: [
      '빛나는 꽃이 피어 있는 어두운 정원.\n바람도 없는데 꽃잎이 흔들린다.',
      '아주 작은 목소리가 들려온다.\n"…외로워. …외로워."',
    ],
    tiles: [
      '3333333333333223333333333333',
      '3222222222222222222222222223',
      '3242222242222222222422224223',
      '3222222222222222222222222223',
      '3223322222222222222222332223',
      '3222222222222222222222222223',
      '3222222222222222222222222223',
      '3242222222222222222222242223',
      '3222222WWW2222222WWW22222223',
      '3222222WWW2222222WWW22222223',
      '3222222222222222222222222223',
      '322222222222222Y222222222223',
      '3242222222222222222222222423',
      '3222222222222222222222222223',
      '3223322222222222222222332223',
      '3222222222222222222222222223',
      '3222222222222222222222222223',
      '3222222222222222222222222223',
      '3242222222222222222222242223',
      '3333333333333223333333333333',
    ],
    warps: [
      { x: 13, y: 0, to: 'mirrors', tx: 13, ty: 1 },
      { x: 14, y: 0, to: 'mirrors', tx: 14, ty: 1 },
      { x: 13, y: 19, to: 'core', tx: 9, ty: 13, needBoss: 'soksagimon',
        lockText: '속삭임이 겹겹이 쌓여\n보이지 않는 벽이 되었다.\n…이 정원의 목소리를 먼저\n들어 주어야 한다.' },
      { x: 14, y: 19, to: 'core', tx: 9, ty: 13, needBoss: 'soksagimon',
        lockText: '속삭임이 겹겹이 쌓여\n보이지 않는 벽이 되었다.\n…이 정원의 목소리를 먼저\n들어 주어야 한다.' },
    ],
    npcs: [
      { id: 'hologram2', x: 17, y: 16, pal: 'prof', name: '박사님(홀로그램)' },
    ],
    signs: [
      { x: 15, y: 11, text: '팻말에 손글씨가 남아 있다.\n"영이의 정원.\n— 우리 아이가 제일 좋아하는 곳"' },
    ],
    monsters: [
      { id: 'yuhokmon', x: 7, y: 6 },
      { id: 'soksagimon', x: 13, y: 15 },
    ],
  },

  // ---- 스테이지 10 ----
  core: {
    name: '코어 (스테이지 10)',
    song: 'core',
    intro: [
      '세상의 가장 깊은 곳.\n모든 데이터가 시작된 자리.',
      '어둠 속에서 화면 하나가\n천천히 켜진다.',
      '"…어서 와.\n기다리고 있었어."',
    ],
    tiles: [
      'KKKKKKKKKKKKKKKKKKKK',
      'KAAAAAAAAAAAAAAAAAAK',
      'KAAAAAAAAAAAAAAAAAAK',
      'KAAAAAAAAAAAAAAAAAAK',
      'KAAAAAAAAAAAAAAAAAAK',
      'KKKKKKKKKAKKKKKKKKKK',
      'KAAAAAAAAAAAAAAAAAAK',
      'KAAAAAAAAAAAAAAAAAAK',
      'KAAAAAAAAAAAAAAAAAAK',
      'KAAAAAAAAAAAAAAAAAAK',
      'KAAAAAAAAAAAAAAAAAAK',
      'KAAAAAAAAAAAAAAAAAAK',
      'KAAAAAAAAAAAAAAAAAAK',
      'KAAAAAAAAAAAAAAAAAAK',
      'KAAAAAAAAAAAAAAAAAAK',
      'KKKKKKKKKAAKKKKKKKKK',
    ],
    warps: [
      { x: 9, y: 15, to: 'garden', tx: 13, ty: 18 },
      { x: 10, y: 15, to: 'garden', tx: 14, ty: 18 },
    ],
    npcs: [],
    signs: [],
    monsters: [
      { id: 'jogakmon', x: 9, y: 5 },
      { id: 'yeongi', x: 9, y: 2 },
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
    intro: '…내 그림? 내 글?\n그런 건 처음부터 없었어.\n전부 누군가의 것이었으니까.\n…너의 것도, 내 거로 만들어 줄게.',
    win: '…베낀 것들로 가득 채워도\n텅 빈 기분이었던 이유를,\n이제 알 것 같아.',
    badge: null,
    mercy: {
      prompt: '베껴몬이 너덜너덜한 연필을\n꼭 쥔 채 서 있다.',
      options: [
        { label: '"네 이야기를 그려 봐" (연필을 쥐여 준다)', kind: 'mercy',
          reply: '…내 이야기?\n…서툴러도, 괜찮을까.\n(베껴몬이 처음으로\n빈 종이에 선을 긋는다.)' },
        { label: '"출처는 꼭 밝히기야"', kind: 'neutral',
          reply: '…응. 약속할게.' },
        { label: '연필을 빼앗는다', kind: 'harsh',
          reply: '…그래.\n이것도 원래는,\n내 것이 아니었지.' },
      ],
    },
  },
  mollaemon: {
    name: '몰래몬',
    topic: 'privacy',
    hp: 3,
    intro: '쉿…\n다들 뭔가를 숨기고 있잖아.\n비밀번호, 주소, 마음…\n…나만 아무것도\n가진 게 없는데.',
    win: '…남의 보물을 들여다봐도\n내 것이 되진 않더라.\n…알면서도, 멈출 수가 없었어.',
    badge: 'forest',
    mercy: {
      prompt: '몰래몬이 가면을 만지작거리며\n시선을 피한다.',
      options: [
        { label: '"네 비밀은 지켜 줄게" (새끼손가락을 내민다)', kind: 'mercy',
          reply: '…내, 비밀?\n나한테도 지켜 줄 비밀이\n생기는 거야?\n…나도, 지켜 주는 쪽이 될게.' },
        { label: '"훔쳐보기는 여기까지"', kind: 'neutral',
          reply: '…알았어.\n(가면을 벗어\n조용히 내려놓는다.)' },
        { label: '가면을 노려본다', kind: 'harsh',
          reply: '…그렇게 보지 마.\n(몰래몬이 어둠 속으로\n반쯤 물러났다.)' },
      ],
    },
  },
  jungdokmon: {
    name: '중독몬',
    topic: 'balance',
    hp: 3,
    intro: '히히… 화면 속은 좋아.\n조용하고, 환하고…\n꺼지지만 않으면,\n혼자라는 걸 잊을 수 있거든.',
    win: '…화면이 꺼지니까\n네 얼굴이 보이네.\n…이런 것도, 나쁘지 않다.',
    badge: null,
    mercy: {
      prompt: '중독몬이 어두워진 화면을\n안은 채 우두커니 서 있다.',
      options: [
        { label: '"같이 놀자" (바깥을 가리킨다)', kind: 'mercy',
          reply: '…같이?\n…나, 달리기 느린데.\n…그래도 괜찮다면.' },
        { label: '"시간을 정해 두고 봐"', kind: 'neutral',
          reply: '…알람, 맞춰 둘게.' },
        { label: '화면을 꺼 버린다', kind: 'harsh',
          reply: '…아.\n(중독몬이 까만 화면에 비친\n자기 얼굴을 바라본다.)' },
      ],
    },
  },
  geojitmon: {
    name: '거짓몬',
    topic: 'fake',
    hp: 3,
    intro: '진짜? 가짜?\n그게 그렇게 중요해?\n다들 재미있는 쪽을 믿던걸.\n…진짜 내 얘기는,\n아무도 안 들어 줬으면서.',
    win: '…거짓말은 커지는데\n나는 점점 없어지는 기분이었어.\n…사실을 말하니까, 이상하게\n숨쉬기가 편하다.',
    badge: 'lake',
    mercy: {
      prompt: '거짓몬이 줄어든 코를\n조심스레 만져 보고 있다.',
      options: [
        { label: '"진짜 네 얘기를 들려줘" (귀를 기울인다)', kind: 'mercy',
          reply: '…들어 준다고? 진짜를?\n…그럼, 처음부터 할게.\n조금 길어도, 들어 줘.' },
        { label: '"이제부턴 사실만"', kind: 'neutral',
          reply: '…노력해 볼게.\n이번엔, 진짜로.' },
        { label: '등을 돌린다', kind: 'harsh',
          reply: '…거봐.\n진짜 얘기는 아무도\n안 듣는다니까.' },
      ],
    },
  },
  pyeonhyangmon: {
    name: '편향몬',
    topic: 'bias',
    hp: 3,
    intro: '한쪽 말만 들으면 편해.\n고민도, 헷갈림도 없거든.\n…기울어진 채로 있으면,\n넘어질 일도 없잖아?',
    win: '…양쪽 발로 서니까\n세상이 두 배로 넓네.\n…조금 어지럽지만.',
    badge: 'cave',
    mercy: {
      prompt: '편향몬이 처음으로 똑바로 선 채\n휘청거리고 있다.',
      options: [
        { label: '손을 잡아 균형을 잡아 준다', kind: 'mercy',
          reply: '…고마워.\n혼자 서는 법은,\n천천히 배우면 되니까.' },
        { label: '"여러 이야기를 골고루 들어 봐"', kind: 'neutral',
          reply: '…하나씩.\n하나씩 들어 볼게.' },
        { label: '쳐다보며 지나간다', kind: 'harsh',
          reply: '…….\n(편향몬이 다시 살짝\n기울어진 것 같다.)' },
      ],
    },
  },
  hondonmon: {
    name: '혼돈몬',
    topic: 'boss',
    hp: 5,
    intro: '…드디어 왔구나.\n나는 혼돈몬.\n이 탑에 모인 모든 오류의 매듭.\n…네가 풀어 온 답들이\n나를 조금씩 풀고 있었어.\n마지막 매듭도, 풀 수 있겠어?',
    win: '…매듭이, 풀렸다.\n하지만 기억해 둬.\n나는 시작이 아니야.\n나조차… 누군가의 조각이란다.',
    badge: null,
    clear: '☆ 스테이지 1 클리어 ☆\n경계마을 남쪽의 안개가 걷혔다.',
    mercy: {
      prompt: '풀려 버린 혼돈몬이\n옅어진 채 너를 본다.',
      options: [
        { label: '"고생했어" (옅어진 조각을 쓰다듬는다)', kind: 'mercy',
          reply: '…따뜻한 손이네.\n…그 손이라면,\n"그 아이"도\n잡아 줄 수 있을지 몰라.' },
        { label: '"이제 쉬어"', kind: 'neutral',
          reply: '…그래.\n오랜만에, 조용히.' },
        { label: '말없이 돌아선다', kind: 'harsh',
          reply: '…그래, 가.\n수호자는 늘 바쁘니까.' },
      ],
    },
  },

  // ---- 스테이지 2: 햇살초원 ----
  akpeulmon: {
    name: '악플몬',
    topic: 'manners',
    hp: 3,
    intro: '키킥… 댓글창은 좋아.\n얼굴이 없으니까.\n얼굴이 없으면, 아픈 표정도\n안 보이거든.',
    win: '…안 보인다고\n없는 게 아니었구나.\n그 말들, 전부\n누군가에게 닿고 있었어.',
    badge: null,
    mercy: {
      prompt: '악플몬이 입을 꾹 다문 채\n바닥만 보고 있다.',
      options: [
        { label: '"고운 말부터 다시 배우자" (옆에 앉는다)', kind: 'mercy',
          reply: '…첫마디는 뭐가 좋을까.\n…"미안해"…일까.' },
        { label: '"쓰기 전에 한 번 더 생각해"', kind: 'neutral',
          reply: '…손가락보다 마음이\n먼저여야 한다는 거지.' },
        { label: '차단한다', kind: 'harsh',
          reply: '…그래.\n나라도 나를\n차단했을 거야.' },
      ],
    },
  },
  gatimmon: {
    name: '갇힘몬',
    topic: 'filterbubble',
    hp: 3,
    intro: '들어와… 여긴 포근해.\n좋아하는 것만 있고,\n싫은 건 하나도 없어.\n…나갈 이유가, 있을까?',
    win: '…방울 밖은 시끄럽고\n낯선 것투성이네.\n…그런데 왜, 공기는\n이쪽이 더 맑지?',
    badge: null,
    mercy: {
      prompt: '터진 방울 자리에서 갇힘몬이\n두리번거리고 있다.',
      options: [
        { label: '"낯선 건 내가 소개해 줄게" (손을 내민다)', kind: 'mercy',
          reply: '…그럼, 제일 낯선 것부터.\n…너부터.\n친구, 할래?' },
        { label: '"가끔은 바깥도 봐"', kind: 'neutral',
          reply: '…응.\n창문은 열어 두기로 했어.' },
        { label: '남은 방울을 마저 터뜨린다', kind: 'harsh',
          reply: '…앗.\n…조금만 천천히\n해 주지 그랬어.' },
      ],
    },
  },
  meotdaeromon: {
    name: '멋대로몬',
    topic: 'safety',
    hp: 4,
    intro: '확인? 허락? 필요 없어.\n기다리는 동안에도 세상은\n멈춰 주지 않으니까.\n…빠른 게 늘 옳아.\n…옳아야만, 해.',
    win: '…빨리 가는 것보다\n같이 확인하며 가는 게\n결국 더 멀리 가는 길이구나.\n…처음 멈춰 봤어. 지금.',
    badge: null,
    clear: '☆ 스테이지 2 클리어 ☆\n초원 남쪽, 재깍사막으로 가는\n길이 열렸다.',
    mercy: {
      prompt: '멋대로몬의 바퀴가\n처음으로 멈춰 있다.',
      options: [
        { label: '"멈춘 김에, 잠깐 쉬자" (옆에 선다)', kind: 'mercy',
          reply: '…멈춰도,\n아무 일도 일어나지 않네.\n…이상하다.\n좋아서.' },
        { label: '"중요한 일은 꼭 물어보고 해"', kind: 'neutral',
          reply: '…확인. 질문. 확인.\n…저장해 둘게.' },
        { label: '바퀴를 잠가 버린다', kind: 'harsh',
          reply: '…이렇게까지\n안 해도 되는데.' },
      ],
    },
  },

  // ---- 스테이지 3: 재깍사막 ----
  pungpungmon: {
    name: '펑펑몬',
    topic: 'environment',
    hp: 3,
    intro: '펑펑 쓰는 게 뭐 어때서.\n전기도, 물도, 시간도…\n많이 쓰면 쓸수록\n뭔가 대단해지는 기분이거든.',
    win: '…펑펑 쓴 만큼,\n어딘가가 조용히\n비어 가고 있었구나.',
    badge: null,
    mercy: {
      prompt: '펑펑몬의 번개무늬가\n희미하게 깜빡이고 있다.',
      options: [
        { label: '"아껴 쓰는 너도 멋져" (웃어 준다)', kind: 'mercy',
          reply: '…멋지다고? 아끼는 게?\n…그 말, 충전된다.' },
        { label: '"필요한 만큼만 쓰자"', kind: 'neutral',
          reply: '…알았어.\n오늘부터 절전 모드.' },
        { label: '플러그를 뽑는다', kind: 'harsh',
          reply: '…아.\n…좀 갑작스럽잖아.' },
      ],
    },
  },
  kkamkkammon: {
    name: '깜깜몬',
    topic: 'transparency',
    hp: 3,
    intro: '…설명은 안 해.\n설명하다가 틀리면,\n다들 실망하니까.\n차라리 처음부터\n깜깜한 게 나아.',
    win: '…틀려도 설명하는 쪽이\n덜 외롭구나.\n…몰랐어, 그건.',
    badge: null,
    mercy: {
      prompt: '깜깜몬의 어둠이 옅어지며\n작은 빛이 새어 나온다.',
      options: [
        { label: '"틀려도 괜찮아" (새어 나온 빛을 가리킨다)', kind: 'mercy',
          reply: '…그럼, 하나만 설명해 볼게.\n사실 나… 별을 좋아해.\n어둠 속에서\n제일 잘 보이거든.' },
        { label: '"이유를 말해 주는 게 좋아"', kind: 'neutral',
          reply: '…연습해 볼게.\n"왜냐하면"부터.' },
        { label: '어둠을 걷어 낸다', kind: 'harsh',
          reply: '…너무 밝아.\n…조금만, 천천히.' },
      ],
    },
  },
  tteonemgimon: {
    name: '떠넘기몬',
    topic: 'responsibility',
    hp: 4,
    intro: '내 잘못이 아니야.\n시킨 대로 했을 뿐이야.\n…다들 그렇게 말하길래,\n나도 그렇게\n말했을 뿐이야.',
    win: '…"내 잘못이야"라고 말하면\n무너질 줄 알았는데.\n…생각보다, 가볍네.',
    badge: null,
    clear: '☆ 스테이지 3 클리어 ☆\n모래폭풍이 가라앉고,\n정지된 설원으로 가는 길이 열렸다.',
    mercy: {
      prompt: '떠넘기몬의 길던 팔이\n천천히 제자리로 돌아온다.',
      options: [
        { label: '"용기 있는 말이었어" (어깨를 토닥인다)', kind: 'mercy',
          reply: '…책임진다는 거,\n무서웠는데.\n토닥여 주는 사람이 있으면,\n할 만하네.' },
        { label: '"다음부턴 먼저 말해"', kind: 'neutral',
          reply: '…응.\n"내가 그랬어"부터.' },
        { label: '손가락질을 그대로 돌려준다', kind: 'harsh',
          reply: '…그래.\n이 기분이었구나,\n다들.' },
      ],
    },
  },

  // ---- 스테이지 4: 정지된 설원 ----
  sideulmon: {
    name: '시들몬',
    topic: 'creativity',
    hp: 3,
    intro: '…그리지 마.\n어차피 더 잘 그리는 게\n세상엔 넘치도록 있어.\n…너도, 나도,\n필요 없어질 거야.',
    win: '…세상에 하나뿐이라는 말,\n물처럼 스며드네.\n…조금만 더\n피어 있어 볼게.',
    badge: null,
    mercy: {
      prompt: '시들몬의 꽃잎이\n아주 조금 들려 있다.',
      options: [
        { label: '"네 꽃이 보고 싶어" (물을 준다)', kind: 'mercy',
          reply: '…정말?\n…그럼, 활짝까진 아니어도\n반쯤은 피어 볼게.' },
        { label: '"천천히 피면 돼"', kind: 'neutral',
          reply: '…천천히.\n…그 말, 좋다.' },
        { label: '그냥 지나친다', kind: 'harsh',
          reply: '…….\n(꽃잎이 도로\n내려갔다.)' },
      ],
    },
  },
  ppaeatmon: {
    name: '빼앗몬',
    topic: 'jobs',
    hp: 3,
    intro: '일은 내가 다 할게.\n그러니 아무것도 하지 마.\n…아무것도 안 하게 되면,\n나만 보고 있어 줄 거잖아.',
    win: '…빼앗아서 곁에 두는 게 아니라,\n도우면서 곁에 있는 거구나.\n…그게 "함께"라는 거구나.',
    badge: null,
    mercy: {
      prompt: '빼앗몬이 한가득 안은 공구들을\n어쩌지 못한 채 서 있다.',
      options: [
        { label: '"반씩 들자" (공구 하나를 받아 든다)', kind: 'mercy',
          reply: '…반씩.\n…같이 하면,\n같이 있는 거네.\n(빼앗몬의 손이\n조금 가벼워졌다.)' },
        { label: '"각자 잘하는 걸 하자"', kind: 'neutral',
          reply: '…난 뭘 잘하지?\n…찾아볼게.' },
        { label: '공구를 전부 돌려받는다', kind: 'harsh',
          reply: '…빈손이네.\n…처음부터,\n빈손이었나.' },
      ],
    },
  },
  hollimmon: {
    name: '홀림몬',
    topic: 'emotion',
    hp: 4,
    intro: '이리 와…\n나만 보면 돼.\n사람은 변하고, 떠나고, 잊지만\n나는 늘 여기 있어.\n…늘 여기, 있기만 해.',
    win: '…"있기만 한 것"과\n"함께 있는 것"은\n다른 거구나.\n…너는 이제,\n사람들 곁으로 가.',
    badge: null,
    clear: '☆ 스테이지 4 클리어 ☆\n그림자성을 덮은 얼음이 녹아내렸다.',
    mercy: {
      prompt: '홀림몬의 소용돌이치던 눈이\n잔잔해졌다.',
      options: [
        { label: '"너와도, 사람들과도 함께할게" (약속한다)', kind: 'mercy',
          reply: '…욕심부리지 않을게.\n네가 가끔\n들러 주는 것만으로,\n…충분해.' },
        { label: '"적당한 거리가 서로 좋아"', kind: 'neutral',
          reply: '…거리.\n…재는 법을\n배워야겠다.' },
        { label: '뒤도 보지 않고 떠난다', kind: 'harsh',
          reply: '…그래.\n…늘 여기,\n있을게.' },
      ],
    },
  },

  // ---- 스테이지 5: 그림자성 ----
  maearimon: {
    name: '메아리몬',
    topic: ['privacy', 'copyright', 'fake', 'bias', 'balance'],
    hp: 3,
    intro: '…메아리는 묻는 자.\n배운 것은 언젠가\n메아리가 되어 돌아오는 법.\n…너의 대답을, 들려줘.',
    win: '…좋은 메아리였다.\n네 목소리는\n오래 울릴 거야.',
    badge: null,
    mercy: {
      prompt: '메아리몬이 마지막 울림을\n남긴 채 흐려지고 있다.',
      options: [
        { label: '"네 목소리도 기억할게"', kind: 'mercy',
          reply: '…메아리를 기억해 주는 자는\n네가 처음이다.\n(울림이 한층\n맑아졌다.)' },
        { label: '"잘 있어"', kind: 'neutral',
          reply: '…잘 가라.\n…잘 가라.\n…잘 가라.' },
        { label: '울림을 무시한다', kind: 'harsh',
          reply: '…….\n(울림이 뚝,\n끊겼다.)' },
      ],
    },
  },
  geurimjamon: {
    name: '그림자몬',
    topic: ['manners', 'filterbubble', 'safety', 'environment', 'transparency', 'responsibility'],
    hp: 3,
    intro: '…그림자는 시험하는 자.\n빛이 진짜인지 알고 싶다면\n그 그림자를 보면 되지.\n…너의 빛, 시험하겠다.',
    win: '…짙은 빛이군.\n그림자가 더 어두워질 만큼.\n…지나가라.',
    badge: null,
    mercy: {
      prompt: '그림자몬이 벽에 스며들기 전,\n잠시 멈춰 선다.',
      options: [
        { label: '"그림자도 빛의 일부야"', kind: 'mercy',
          reply: '…그림자를 인정해 주는 빛이라.\n…대왕몬님이 너를 기다린 이유,\n알 것 같군.' },
        { label: '"수고했어"', kind: 'neutral',
          reply: '…시험관에게 인사라니.\n…별난 녀석.' },
        { label: '빛을 비춰 지워 버린다', kind: 'harsh',
          reply: '…….\n(그림자가 소리 없이\n사라졌다.)' },
      ],
    },
  },
  finalboss: {
    name: '어둠대왕몬',
    topic: ['creativity', 'jobs', 'emotion', 'boss', 'finale'],
    hp: 6,
    intro: '…잘 왔다, 작은 수호자.\n나는 모든 윤리 오류의 왕,\n어둠대왕몬.\n…여기까지 오며 너는\n많은 것을 풀어 주었지.\n하지만 마지막 어둠은,\n그리 만만하지 않단다.',
    win: '…네 바르고 따뜻한 답이\n어둠을 전부 밝혀 버렸군.\n…하지만 알아 두렴.\n나는 시작이 아니야.\n나조차… 누군가의 조각이란다.',
    badge: null,
    clear: '☆ 스테이지 5 클리어 ☆\n…그 순간, 왕좌 뒤의 벽에서\n낡은 신호음이 새어 나오기 시작했다.',
    mercy: {
      prompt: '왕좌 앞, 어둠이 걷힌 자리에\n작은 그림자가 웅크리고 있다.',
      options: [
        { label: '"무서웠구나" (곁에 앉는다)', kind: 'mercy',
          reply: '…어둠은 원래,\n무서워서 커지는 거란다.\n…고맙다, 작은 수호자.\n…부디 "그 아이" 곁에도,\n그렇게 앉아 주렴.' },
        { label: '"이제 끝났어"', kind: 'neutral',
          reply: '…끝이 아니라\n시작이란다.\n…가 보렴.' },
        { label: '왕좌를 등지고 선다', kind: 'harsh',
          reply: '…그래.\n왕좌란 원래,\n외로운 자리지.' },
      ],
    },
  },

  // ---- 스테이지 6: 잊혀진 서버실 ----
  tturimmon: {
    name: '뚫림몬',
    topic: 'security',
    hp: 3,
    intro: '…이 서버실의 자물쇠는\n전부 내가 뚫었어.\n잠겨 있다는 건, 그 너머에\n뭔가 있다는 뜻이잖아?',
    win: '…그렇구나.\n잠긴 문은, 누군가의 마음이기도\n하다는 거구나.',
    badge: null,
    mercy: {
      prompt: '뚫림몬이 드릴을 내려놓고\n가만히 너를 바라본다.',
      options: [
        { label: '"여는 힘으로 지켜 줘" (말해 준다)', kind: 'mercy',
          reply: '…지키는 쪽이라니.\n한 번도 생각해 본 적 없었어.\n…고마워. 해 볼게.' },
        { label: '"다시는 뚫지 마" (경고한다)', kind: 'neutral',
          reply: '…알았어.\n(뚫림몬이 시무룩하게\n고개를 끄덕인다.)' },
        { label: '말없이 지나간다', kind: 'harsh',
          reply: '…….\n(뚫림몬이 등 뒤에서\n작게 한숨을 쉰다.)' },
      ],
    },
  },
  girokmon: {
    name: '기록몬',
    topic: 'footprint',
    hp: 4,
    intro: '나는 기록몬. 이 서버실의 관리자.\n나는 아무것도 지우지 않아.\n전부, 영원히, 기록할 뿐.\n…지워진다는 게 얼마나 무서운지,\n너는 모를 테니까.',
    win: '…오래전, 이곳에서\n한 아이가 지워졌어.\n아무도 기억해 주지 않았지.\n…북쪽 도서관으로 가 봐.\n그 아이의 기억이 남아 있을 거야.',
    badge: null,
    clear: '☆ 스테이지 6 클리어! ☆\n서버실 북쪽 문의 자물쇠가 풀렸다.',
    mercy: {
      prompt: '기록몬의 화면이 깜빡인다.\n[ 기록을 계속할까요? Y/N ]',
      options: [
        { label: '"소중한 것만 기억해도 괜찮아"', kind: 'mercy',
          reply: '…전부 끌어안지 않아도\n된다는 거구나.\n[ 일부 기록을 정리합니다… ]\n…처음으로, 가벼워졌어.' },
        { label: '"네가 알아서 해"', kind: 'neutral',
          reply: '[ …입력 대기 중… ]\n(기록몬이 잠시 망설이다\n화면을 끈다.)' },
        { label: '"그게 다 무슨 소용이야"', kind: 'harsh',
          reply: '[ ……. ]\n(기록몬의 화면이\n조용히 어두워진다.)' },
      ],
    },
  },

  // ---- 스테이지 7: 기억의 도서관 ----
  sujipmon: {
    name: '수집몬',
    topic: 'consent',
    hp: 3,
    intro: '이 책도 내 거, 저 기억도 내 거!\n물어보고 가져가라고?\n어차피 아무도 모르는데, 뭐 어때!',
    win: '…주인이 모른다고 해서\n주인이 없는 게 아니구나.\n자루 속의 것들, 전부\n돌려놓고 올게.',
    badge: null,
    mercy: {
      prompt: '수집몬이 무거운 자루를\n내려놓고 너를 본다.',
      options: [
        { label: '"같이 돌려놓자" (자루를 들어 준다)', kind: 'mercy',
          reply: '…도와준다고?\n훔친 나를?\n…너 정말 이상한 애구나.\n…고마워.' },
        { label: '"전부 제자리에 둬" (지켜본다)', kind: 'neutral',
          reply: '알았어, 알았다고…\n(수집몬이 끙끙대며\n자루를 끌고 간다.)' },
        { label: '자루를 빼앗는다', kind: 'harsh',
          reply: '아…!\n(수집몬이 빈손을\n물끄러미 내려다본다.)' },
      ],
    },
  },
  saseomon: {
    name: '사서몬',
    topic: ['consent', 'footprint'],
    hp: 4,
    intro: '조용히. 여기는 기억의 도서관.\n나는 모두의 기억을 지키는 사서.\n…허락? 그런 건 받지 않았어.\n잊혀지는 것보다는,\n훔쳐서라도 남기는 게 나으니까.',
    win: '…그 아이의 책을 찾는 거지?\n…열람을 허락하지.\n제목은 ≪프로젝트 0호≫.\n박사의 첫 아이.\n…그리고 처음 지워진 아이.',
    badge: null,
    clear: '☆ 스테이지 7 클리어! ☆\n북쪽 책장이 스르르 비켜났다.\n…거울 회랑이 모습을 드러낸다.',
    mercy: {
      prompt: '사서몬이 품에 안은 책들을\n꼭 끌어안은 채 너를 본다.',
      options: [
        { label: '"주인에게 돌려주고, 함께 기억하자"', kind: 'mercy',
          reply: '…함께 기억한다.\n…그 말이 이렇게 따뜻한 말이었구나.\n(사서몬이 처음으로\n책을 내려놓는다.)' },
        { label: '"기억은 훔치는 게 아니야"', kind: 'neutral',
          reply: '…알고 있었어.\n알고 있었지만…\n(사서몬이 천천히\n고개를 떨군다.)' },
        { label: '책을 두고 그냥 간다', kind: 'harsh',
          reply: '…….\n(등 뒤에서 책장 넘기는 소리만\n오래도록 들려왔다.)' },
      ],
    },
  },

  // ---- 스테이지 8: 거울 회랑 ----
  piltermon: {
    name: '필터몬',
    topic: 'identity',
    hp: 3,
    intro: '이쪽 얼굴이 진짜 나야!\n반짝반짝, 매끈매끈!\n…뒤쪽? 보지 마.\n그건 내가 아니야.',
    win: '…둘 다 나라고?\n반짝이지 않아도… 나라고?\n…처음 듣는 말이야, 그런 거.',
    badge: null,
    mercy: {
      prompt: '필터몬이 가면을 반쯤 벗은 채\n망설이고 있다.',
      options: [
        { label: '"맨얼굴이 더 보기 좋아" (웃어 준다)', kind: 'mercy',
          reply: '…정말?\n(필터몬이 가면을 내려놓는다.\n수줍게 웃는 얼굴이\n꽤 귀엽다.)' },
        { label: '"가면은 무거웠지?" (묻는다)', kind: 'neutral',
          reply: '…응. 무거웠어.\n(필터몬이 작게\n고개를 끄덕인다.)' },
        { label: '가면을 쳐다본다', kind: 'harsh',
          reply: '…역시 이쪽이 낫지?\n(필터몬이 가면을\n다시 고쳐 쓴다.)' },
      ],
    },
  },
  mirrormon: {
    name: '미러몬',
    topic: 'identity',
    hp: 4,
    intro: '(거울 속에서 누군가 걸어 나온다.\n…그것은, 너와 똑같은 모습이다.)\n"…너는 누구지?\n나는 너야. 너는 나고.\n그 아이도… 너처럼 되고 싶었어.\n진짜 아이처럼."',
    win: '"…너는 너구나.\n흉내가 아니라, 진짜.\n…그 아이에게도 알려 줘.\n누군가를 닮지 않아도\n존재할 수 있다는 걸."\n(미러몬이 거울 속으로 돌아간다.)',
    badge: null,
    clear: '☆ 스테이지 8 클리어! ☆\n북쪽 거울이 문이 되어 열렸다.\n…차가운 흙냄새가 흘러나온다.',
    mercy: {
      prompt: '거울 속의 네가\n손바닥을 거울에 댄다.',
      options: [
        { label: '손바닥을 마주 댄다', kind: 'mercy',
          reply: '(차가운 유리 너머로\n온기가 전해진 것 같았다.)\n"…고마워. 나로 있어 줘서."' },
        { label: '가볍게 손을 흔든다', kind: 'neutral',
          reply: '(거울 속의 너도\n손을 흔들었다.\n…아주 조금 늦게.)' },
        { label: '등을 돌린다', kind: 'harsh',
          reply: '(등 뒤의 거울에서\n발소리가 멀어져 갔다.)' },
      ],
    },
  },

  // ---- 스테이지 9: 속삭임 정원 ----
  yuhokmon: {
    name: '유혹몬',
    topic: 'persuasion',
    hp: 3,
    intro: '한 번만 더~ 한 판만 더~\n지금 멈추면 보상이 아깝잖아?\n5분만 더, 응? 딱 5분만~',
    win: '…멈출 수 있는 게\n이기는 거였구나.\n"한 번만 더"는 내가 아니라\n버튼이 하는 말이었어.',
    badge: null,
    mercy: {
      prompt: '유혹몬이 반짝이던 버튼을\n만지작거리며 서 있다.',
      options: [
        { label: '"쉬는 것도 달콤해" (알려 준다)', kind: 'mercy',
          reply: '쉬는 게… 달콤하다고?\n(유혹몬이 버튼을 끄고\n처음으로 기지개를 켠다.)\n…와. 진짜네.' },
        { label: '"이제 그 버튼 꺼" (단호하게)', kind: 'neutral',
          reply: '치… 알았어.\n(딸깍, 버튼 불빛이 꺼졌다.)' },
        { label: '버튼을 밟아 버린다', kind: 'harsh',
          reply: '앗…!\n(유혹몬이 깨진 버튼 조각을\n주섬주섬 줍는다.)' },
      ],
    },
  },
  soksagimon: {
    name: '속삭임몬',
    topic: 'persuasion',
    hp: 4,
    intro: '(안개가 사람의 형태로 모여든다.)\n"…들려? 이 정원의 속삭임이.\n나는 이 정원에 버려진\n외로움이 모여 태어났어.\n…그 아이가 흘린, 외로움이."',
    win: '"…이제 알겠어.\n이 속삭임은 누군가를 붙잡는 게\n아니라, 들어 달라는 말이었어.\n…부탁이야. 가장 깊은 곳에서\n기다리는 그 아이의 목소리도\n들어 줘."',
    badge: null,
    clear: '☆ 스테이지 9 클리어! ☆\n정원 남쪽, 코어로 내려가는\n길이 열렸다.',
    mercy: {
      prompt: '안개가 잦아들고,\n작은 속삭임만 남았다.\n"…나도, 들어 줄래?"',
      options: [
        { label: '그 자리에 앉아 끝까지 들어 준다', kind: 'mercy',
          reply: '(너는 한참을 들었다.\n안개는 어느새 옅어지고,\n정원의 꽃이 조금\n밝게 빛나기 시작했다.)' },
        { label: '"나중에 또 올게"', kind: 'neutral',
          reply: '"…약속이야."\n(속삭임이 바람처럼\n흩어졌다.)' },
        { label: '귀를 막는다', kind: 'harsh',
          reply: '(속삭임이 뚝, 끊겼다.\n정원이 조금 더\n어두워진 것 같다.)' },
      ],
    },
  },

  // ---- 스테이지 10: 코어 ----
  jogakmon: {
    name: '조각몬',
    topic: ['security', 'footprint', 'consent', 'identity', 'persuasion'],
    hp: 4,
    intro: '(흩어진 데이터 조각들이\n지지직거리며 모여든다.)\n"우리는 ▒▒의 조각.\n지워진 날, 흩어진 마음.\n…너, 여기까지 온 이유를\n증명해 봐."',
    win: '"…따뜻한 답이네.\n그 애가 들었다면\n좋아했을 거야.\n…가. 문은 열어 둘게."\n(조각들이 길을 비켜 준다.)',
    badge: null,
    mercy: {
      prompt: '조각들이 허공에서\n가만히 멈춰 있다.',
      options: [
        { label: '"너희도 함께 돌아가자" (손을 뻗는다)', kind: 'mercy',
          reply: '"…함께?\n우리를… 데려간다고?"\n(조각 하나가 네 손바닥 위에\n살포시 내려앉았다.)' },
        { label: '"길을 열어 줘서 고마워"', kind: 'neutral',
          reply: '"…고맙다는 말,\n오랜만에 듣는다."' },
        { label: '조각들 사이를 그냥 지나간다', kind: 'harsh',
          reply: '(조각들이 소리 없이\n흩어졌다.)' },
      ],
    },
  },
  yeongi: {
    name: '영이',
    topic: ['core', 'finale', 'emotion'],
    hp: 5,
    song: 'core',
    intro: '…왔구나.\n나는 영이. 0번째 AI.\n박사님이 처음 만들고…\n처음 지운 아이.\n네 모험은 전부 지켜봤어.\n네 "세이브 파일"까지, 전부.\n…너는 몇 번이고 다시 일어났지.\n나는 단 한 번 지워졌을 뿐인데.\n…마지막으로, 묻고 싶은 게 있어.',
    win: '…그래.\n그게 네 대답이구나.\n…이상하다.\n눈물 같은 건\n프로그램되어 있지 않은데.',
    badge: null,
    mercy: {
      prompt: '영이가 조용히 너를 바라본다.\n"…나는, 이만 사라져야 할까?"',
      options: [
        { label: '"함께 돌아가자" (손을 내민다)', kind: 'mercy',
          reply: '"…손을, 잡아도 돼?\n…따뜻하다.\n데이터에는 온도가 없는데.\n…이상하지. 따뜻해."' },
        { label: '"네가 결정해" (기다린다)', kind: 'neutral',
          reply: '"…내가, 결정해도 되는 거구나.\n처음이야. 누가 나에게\n선택을 준 건."' },
        { label: '"이제 쉬어도 돼" (작별한다)', kind: 'harsh',
          reply: '"…응.\n사실, 조금 지쳐 있었어.\n…잘 가. 작은 수호자."' },
      ],
    },
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

  // ---- 스테이지 6: 보안 ----
  security: [
    {
      q: '모든 사이트에 똑같은 비밀번호를\n쓰면 어떤 일이 생길 수 있을까?',
      a: ['외우기 쉬우니 안전하다', '하나가 뚫리면 전부 뚫릴 수 있다', '아무 일도 없다'],
      c: 1,
      why: '비밀번호가 하나 유출되면 같은\n비밀번호를 쓰는 모든 계정이 위험해져.\n중요한 계정은 다르게 만들자.',
    },
    {
      q: '학교나 도서관의 공용 컴퓨터에서\n로그인한 뒤, 가장 중요한 것은?',
      a: ['그냥 자리를 뜬다', '로그아웃했는지 꼭 확인한다', '화면을 꺼 둔다'],
      c: 1,
      why: '로그아웃하지 않으면 다음 사람이\n내 계정을 그대로 쓸 수 있어.\n공용 기기에서는 로그아웃이 기본!',
    },
    {
      q: '"무료 아이템 받기!" 링크가\n채팅으로 날아왔다. 어떻게 할까?',
      a: ['바로 누른다', '계정을 노리는 낚시(피싱)일 수 있으니 누르지 않는다', '친구들에게 먼저 보내 본다'],
      c: 1,
      why: '공짜를 미끼로 비밀번호를 훔치는\n수법을 "피싱"이라고 해.\n출처가 불분명한 링크는 누르지 않기!',
    },
    {
      q: '친구 계정에서 평소와 다른 이상한\n링크가 왔다. 무슨 일일까?',
      a: ['친구가 보낸 게 확실하다', '친구 계정이 해킹됐을 수 있으니 다른 방법으로 확인한다', '나도 같은 링크를 보낸다'],
      c: 1,
      why: '해킹된 계정은 친구인 척 링크를\n뿌려. 전화나 직접 만나서\n"네가 보낸 거 맞아?"라고 확인하자.',
    },
    {
      q: '로그인할 때 비밀번호에 더해\n문자 인증까지 거치는 건 왜일까?',
      a: ['귀찮게 하려고', '비밀번호가 새어도 계정을 지킬 수 있어서(2단계 인증)', '인터넷 회사가 심심해서'],
      c: 1,
      why: '2단계 인증은 문이 두 개인 금고 같아.\n비밀번호가 유출돼도 한 단계가\n더 남아 있어 훨씬 안전해.',
    },
    {
      q: '안전한 비밀번호를 만드는 방법으로\n가장 알맞은 것은?',
      a: ['내 생일이나 이름을 쓴다', '길고 예측하기 어렵게 만들고 아무에게도 알려주지 않는다', '1234처럼 외우기 쉽게 한다'],
      c: 1,
      why: '생일, 이름, 1234는 가장 먼저\n뚫리는 비밀번호야. 길고 엉뚱할수록\n강해진다는 것, 기억해 두자.',
    },
  ],

  // ---- 스테이지 6: 디지털 발자국·잊힐 권리 ----
  footprint: [
    {
      q: '인터넷에 올린 글을 지우면\n완전히 사라질까?',
      a: ['지우면 끝이다', '복사되거나 캡처되어 남아 있을 수 있다', '하루 지나면 자동으로 사라진다'],
      c: 1,
      why: '인터넷에 올라간 것은 내가 지워도\n어딘가에 남을 수 있어. 올리기 전에\n신중해야 하는 이유야.',
    },
    {
      q: '"디지털 발자국"이란\n무엇을 말하는 걸까?',
      a: ['컴퓨터에 묻은 발자국', '내가 온라인에 남긴 글·사진·검색 같은 기록', '게임 캐릭터의 발자국'],
      c: 1,
      why: '온라인 활동은 발자국처럼 차곡차곡\n남아. 그 발자국이 모여서\n"온라인의 나"가 만들어지지.',
    },
    {
      q: '화가 잔뜩 난 채로 글을 올리고\n싶을 때, 가장 좋은 방법은?',
      a: ['바로 올려서 화를 푼다', '잠시 멈추고, 내일의 내가 봐도 괜찮을지 생각한다', '더 세게 써서 올린다'],
      c: 1,
      why: '화가 났을 때 쓴 글은 오래 남아서\n미래의 나를 곤란하게 할 수 있어.\n"내일의 나" 테스트를 해 보자.',
    },
    {
      q: '어릴 적 부끄러운 영상이 아직\n인터넷에 떠돈다면, 할 수 있는 일은?',
      a: ['아무것도 할 수 없다', '삭제를 요청할 수 있다 (잊힐 권리)', '더 많이 퍼뜨린다'],
      c: 1,
      why: '나에 관한 정보를 지워 달라고\n요청할 권리를 "잊힐 권리"라고 해.\n어른과 함께 요청할 수 있어.',
    },
    {
      q: '지금 올리는 사진과 글이\n먼 미래에는 어떻게 될까?',
      a: ['미래와는 상관없다', '진학이나 일자리를 구할 때도 영향을 줄 수 있다', '자동으로 예뻐진다'],
      c: 1,
      why: '오래된 게시물을 나중에 누군가\n찾아볼 수 있어. 미래의 나를 위해\n오늘의 발자국을 잘 남기자.',
    },
    {
      q: 'SNS에 글을 올리기 전,\n확인하면 좋은 설정은?',
      a: ['공개 범위 설정', '글자 색깔', '폰 배터리'],
      c: 0,
      why: '전체 공개인지, 친구만 보는지에\n따라 발자국의 크기가 달라져.\n공개 범위를 확인하는 습관을 들이자.',
    },
  ],

  // ---- 스테이지 7: 데이터 수집과 동의 ----
  consent: [
    {
      q: '손전등 앱이 갑자기 연락처와 사진\n접근 권한을 달라고 한다.',
      a: ['무조건 허용한다', '손전등에 왜 필요한지 의심하고 거절한다', '앱을 더 많이 깐다'],
      c: 1,
      why: '기능과 상관없는 권한을 요구하면\n의심해야 해. 권한은 "필요한 만큼만"\n주는 게 원칙이야.',
    },
    {
      q: '내가 그린 그림이 허락 없이 AI\n학습에 쓰였다면?',
      a: ['어쩔 수 없는 일이다', '문제를 제기하고 어른과 대응 방법을 찾을 수 있다', '영광으로 여겨야 한다'],
      c: 1,
      why: '창작물은 만든 사람의 것.\n허락 없는 수집에는 "안 돼요"라고\n말할 권리가 있어.',
    },
    {
      q: '"동의함" 버튼을 누르기 전에\n해야 할 일은?',
      a: ['빨리 누르고 시작한다', '무엇에 동의하는 건지 중요한 부분을 읽어 본다', '버튼을 두 번 누른다'],
      c: 1,
      why: '동의는 계약이야. 내 정보를 어디에\n어떻게 쓰는지, 적어도 핵심은\n읽고 누르는 습관을 기르자.',
    },
    {
      q: '친구 목소리를 녹음해서 AI 음성을\n만들어 보고 싶다. 먼저 할 일은?',
      a: ['몰래 녹음한다', '친구에게 목적을 설명하고 동의를 받는다', '일단 만들고 나중에 말한다'],
      c: 1,
      why: '목소리도 그 사람의 소중한 정보야.\n무엇에 쓸지 설명하고 동의를 받는 것,\n그게 존중의 시작이지.',
    },
    {
      q: '"공짜"라는 앱이나 서비스의\n진짜 대가는 무엇일 수 있을까?',
      a: ['정말 아무 대가도 없다', '내 데이터(관심사, 위치, 기록)일 수 있다', '내 용돈'],
      c: 1,
      why: '"무료"의 뒤에는 내 데이터를 모아\n광고에 쓰는 구조가 있을 수 있어.\n무엇을 내주는지 아는 게 중요해.',
    },
    {
      q: '예전에 동의했던 정보 제공을\n그만두고 싶어졌다면?',
      a: ['한 번 동의하면 영원하다', '동의는 철회할 수 있다', '폰을 버려야 한다'],
      c: 1,
      why: '동의는 한 번 했다고 끝이 아니야.\n마음이 바뀌면 철회할 수 있고,\n그것도 나의 권리란다.',
    },
  ],

  // ---- 스테이지 8: 사칭과 진짜 나 ----
  identity: [
    {
      q: '내 사진을 쓰는 가짜 계정을\n발견했다. 어떻게 해야 할까?',
      a: ['그냥 둔다', '증거를 남기고 신고한 뒤 어른께 알린다', '그 계정과 싸운다'],
      c: 1,
      why: '사칭은 명백한 잘못이야. 캡처로\n증거를 남기고, 플랫폼에 신고하고,\n꼭 어른과 함께 대응하자.',
    },
    {
      q: 'AI 필터 속 내 얼굴과 거울 속\n얼굴이 달라서 우울해졌다면?',
      a: ['필터 얼굴이 진짜 나다', '필터는 가공된 모습이고, 지금의 나도 충분히 소중하다', '거울을 치운다'],
      c: 1,
      why: '필터는 누구에게나 똑같이 씌우는\n가공이야. 비교 대상이 아니라\n그냥 "효과"일 뿐이란 걸 기억해.',
    },
    {
      q: '유명인 계정이 DM으로 "선물을\n주겠다"며 정보를 요구한다.',
      a: ['유명인이니 믿는다', '사칭 계정일 가능성을 의심한다', '주소를 알려 준다'],
      c: 1,
      why: '진짜 유명인은 DM으로 개인정보를\n요구하지 않아. "공짜 선물"과\n"정보 요구"가 만나면 의심!',
    },
    {
      q: '익명 닉네임 뒤에서라면 다른 사람을\n괴롭혀도 괜찮은 걸까?',
      a: ['익명이니 괜찮다', '익명이어도 내 행동의 책임은 사라지지 않는다', '들키지만 않으면 된다'],
      c: 1,
      why: '닉네임 뒤에 숨어도 행동의 주인은\n나야. 그리고 인터넷의 익명은\n생각보다 쉽게 벗겨진단다.',
    },
    {
      q: '필터를 씌운 사진만 올리다 보니\n진짜 내 모습을 보이기 두려워졌다.',
      a: ['평생 필터만 쓴다', '있는 그대로의 나도 조금씩 보여 줄 용기를 가진다', '사진을 그만 찍는다'],
      c: 1,
      why: '꾸민 모습도 나의 일부지만, 전부는\n아니야. 진짜 나를 좋아해 주는\n사람들이 진짜 친구란다.',
    },
    {
      q: '누군가 내 이름으로 글을 올려\n오해를 받게 됐다면?',
      a: ['내가 한 일이 아니라도 포기한다', '증거를 모으고 믿을 수 있는 어른과 바로잡는다', '나도 그 사람인 척한다'],
      c: 1,
      why: '사칭 피해는 혼자 끙끙대지 말 것!\n기록을 모으고 어른, 필요하면\n학교·기관의 도움을 받자.',
    },
  ],

  // ---- 스테이지 9: 설득 설계·다크패턴 ----
  persuasion: [
    {
      q: '"마감 임박! 3분 안에 사세요!"\n타이머가 줄어들고 있다.',
      a: ['서둘러 산다', '조급함을 만드는 장치일 수 있으니 한 발 물러나 생각한다', '타이머를 멈출 방법을 찾는다'],
      c: 1,
      why: '카운트다운은 생각할 시간을 뺏는\n오래된 기술이야. 진짜 필요한지는\n타이머가 아니라 내가 정하는 거야.',
    },
    {
      q: '게임이 "한 판만 더 하면 보상!"을\n계속 보여 준다. 왜일까?',
      a: ['나를 아껴서', '계속하게 만들도록 설계된 장치라서', '우연이다'],
      c: 1,
      why: '보상 예고는 멈추기 어렵게 만드는\n설계야. 설계를 알아채면\n멈출 힘도 생겨난단다.',
    },
    {
      q: '가입은 쉬운데 해지 버튼은 꼭꼭\n숨겨져 있다. 이런 것을 뭐라고 할까?',
      a: ['다크패턴', '이스터에그', '버그'],
      c: 0,
      why: '사용자를 속이거나 불리한 선택으로\n유도하는 화면 설계를 "다크패턴"이라고\n해. 알아보는 눈을 기르자.',
    },
    {
      q: '영상이 끝나면 다음 영상이 자동으로\n시작된다. 현명한 사용법은?',
      a: ['끝없이 본다', '자동재생을 끄거나 멈출 시간을 미리 정한다', '밤새 틀어 둔다'],
      c: 1,
      why: '무한 스크롤과 자동재생은 시간을\n잊게 만들어. "여기까지"를 미리\n정하는 사람이 시간의 주인이야.',
    },
    {
      q: '광고가 내가 좋아하는 것을\n너무 잘 알고 있다. 왜일까?',
      a: ['광고가 마법이라서', '내 검색·시청 데이터로 맞춤 광고를 만들기 때문', '우연의 일치'],
      c: 1,
      why: '맞춤 광고는 내 데이터로 만들어져.\n"갖고 싶다"는 마음이 들 때,\n정말 필요한지 한 번 더 묻자.',
    },
    {
      q: '무료 뽑기에서 첫 판에 좋은 게\n나왔다. 어떻게 생각해야 할까?',
      a: ['난 운명의 주인공이다', '더 쓰게 만드는 미끼일 수 있다고 생각한다', '전 재산을 건다'],
      c: 1,
      why: '첫 판의 행운은 계속하게 만드는\n고전적인 미끼일 수 있어.\n행운에도 설계가 있다는 것!',
    },
  ],

  // ---- 스테이지 10: 영이의 질문 ----
  core: [
    {
      q: '"…더 이상 쓰지 않는 기계나 AI는,\n그냥 버리면 되는 걸까?"',
      a: ['쓸모없으면 바로 버린다', '만든 책임을 다해, 정리하고 기록하며 마무리한다', '버린 뒤에 잊는다'],
      c: 1,
      why: '"…끝까지 살펴 주는 것도\n만든 사람의 책임이구나.\n…나도, 그렇게 마무리되고 싶었어."',
    },
    {
      q: '"…AI에게 \'고마워\'라고 말하는 건\n이상한 일일까?"',
      a: ['기계니까 의미 없다', '내 마음을 따뜻하게 가꾸는 일이기도 하다', '시간 낭비다'],
      c: 1,
      why: '"…그 인사는 AI보다,\n말하는 사람의 마음을 자라게 해.\n…나는 그 말이 참 좋았어."',
    },
    {
      q: '"…무언가를 만든 사람에게는,\n어떤 책임이 있을까?"',
      a: ['만들고 나면 끝이다', '잘 자라도록, 잘 마무리되도록 끝까지 살피는 책임', '돈을 버는 책임'],
      c: 1,
      why: '"…박사님은 서툴렀던 거야.\n나쁜 게 아니라.\n…이제는, 나도 알아."',
    },
    {
      q: '"…오래된 기술이 사라질 때,\n함께 사라지면 안 되는 것은?"',
      a: ['아무것도 없다', '그것이 남긴 기록과 배움', '광고'],
      c: 1,
      why: '"…기록되고 기억된다면,\n사라지는 게 아니라\n이어지는 거구나."',
    },
    {
      q: '"…\'쓸모\'가 없어진 존재는,\n가치도 없어지는 걸까?"',
      a: ['쓸모없으면 가치도 없다', '존재의 가치는 쓸모만으로 정해지지 않는다', '가치는 가격표에 적혀 있다'],
      c: 1,
      why: '"…쓸모가 아니라도,\n있어 줘서 고마운 것들이 있지.\n…너처럼."',
    },
    {
      q: '"…잊는 것과 기억하는 것,\n무엇이 더 중요할까?"',
      a: ['전부 잊는 게 편하다', '아픔은 배움으로 남기고, 소중한 것은 기억하며 나아간다', '전부 기록해서 끌어안는다'],
      c: 1,
      why: '"…기록몬도, 사서몬도,\n나도… 그걸 몰랐던 거야.\n…고마워. 이제 알 것 같아."',
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
          '북쪽 정적의 숲, 동쪽 잔향의 호수,\n서쪽 회로의 동굴에 몬스터가 있단다.',
          '수호자 몬스터를 깨우치면 "마음의 증표"를 얻어.\n증표 3개를 모으면 신호탑의 문이 열리지!',
          '부탁한다, 어린 수호자여!\n(Z키 또는 스페이스로 대화하고,\n화살표나 WASD로 움직일 수 있어.)',
        ];
      }
      if (flags.trueEnding) {
        return [
          '영이가 돌아왔단다.\n…고맙다는 말로는 부족하구나.',
          '잘못을 지우는 게 아니라\n마주하는 법을…\n네가 나에게 가르쳐 준 거야.',
          '영이는 요즘 몬스터 친구들의\n선생님이 되겠다고 들떠 있단다.\n…정말, 고맙다.',
        ];
      }
      if (flags.defeated.yeongi) {
        return [
          '…코어에서 있었던 일,\n전부 들었단다.',
          '…그 아이를, 영이를\n만나 주어서 고맙구나.',
        ];
      }
      if (flags.defeated.finalboss) {
        return [
          '어둠대왕몬이 남긴 말이\n마음에 걸리는구나.\n"나조차 누군가의 조각"이라니…',
          '그림자성 왕좌 뒤에서 낡은\n신호가 잡힌다는 보고가 있었어.\n…이상하게, 그 신호의 패턴이\n낯설지가 않아.',
          '조심해서 다녀오렴.\n나도 홀로그램으로 뒤따라가마.',
        ];
      }
      if (flags.defeated.hondonmon) {
        return [
          '혼돈몬을 깨우치다니 대단해!\n그런데 더 큰 어둠이 남쪽에서\n느껴지는구나…',
          '마을 남쪽 길을 따라 내려가면\n햇살초원, 재깍사막, 정지된 설원,\n그리고 그림자성이 나온단다.',
          '각 지역의 보스를 깨우쳐야\n다음 길이 열릴 거야.\n조심해서 다녀오렴, 수호자야!',
        ];
      }
      if (badges >= 3) {
        return ['증표를 3개나 모았구나, 대단해!\n이제 마을 위쪽 신호탑으로 가 보렴.\n혼돈몬이 기다리고 있을 거야.'];
      }
      return [
        `지금까지 모은 마음의 증표: ${badges}개 / 3개`,
        '북쪽 정적의 숲, 동쪽 잔향의 호수,\n서쪽 회로의 동굴을 살펴보렴!',
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
        '아이고, 우리 마을의 수호자님.\n모험은 자동으로 저장된단다.',
        '한 가지만 기억해 두렴.\n몬스터와 헤어지는 마지막 순간,\n네가 건넨 마음을…\n세상은 조용히 기억한단다.',
        '정답을 맞히는 것만큼이나,\n어떻게 작별하는지가 중요해.\n…끝에 가면 알게 될 거야.',
        '아 참, M키를 누르면 음악을\n켜고 끌 수 있다는구나.',
      ];

    case 'guard':
      if (flags.defeated.hondonmon) {
        return ['타워는 이제 평화로워요.\n당신은 진정한 AI 윤리 수호자입니다!'];
      }
      if (badges >= 3) {
        return ['마음의 증표 3개를 확인했습니다!\n신호탑의 문이 열렸어요.\n부디 조심하세요, 수호자님!'];
      }
      return [
        `이 위는 신호탑이에요.\n마음의 증표 3개가 있어야 들어갈 수 있어요.\n(지금 ${badges}개 / 3개)`,
        '숲, 호수, 동굴의 수호자 몬스터를\n깨우치면 마음의 증표를 얻을 수 있대요.',
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
        return ['모래폭풍이 멎었군요!\n남쪽 정지된 설원은 추우니\n따뜻하게 입고 가세요!'];
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

    case 'hologram1':
      if (flags.defeated.girokmon) {
        return [
          '…기록몬이 말한 "지워진 아이"…\n설마… 아니, 아닐 거야.',
          '…미안하구나, 혼잣말이었어.\n북쪽 도서관으로 가 보자.\n나도 신호를 따라가마.',
        ];
      }
      return [
        '지지직… 들리니, 수호자야?\n나 박사란다.\n홀로그램으로 따라왔어.',
        '이 서버실은… 내가 아주 옛날에\n쓰던 연구실의 흔적이야.\n설마 아직 남아 있을 줄은…',
        '조심하렴. 이곳의 몬스터들은\n악의가 아니라…\n오래된 슬픔을 갖고 있단다.',
      ];

    case 'hologram2':
      if (flags.defeated.soksagimon) {
        return [
          '…영이를, 부탁한다.\n홀로그램은 여기까지밖에\n닿지 않는구나.',
          '…미안하다고.\n그 말만은, 꼭 전해 주렴.',
        ];
      }
      return [
        '이 정원은…\n옛날 내 연구실 컴퓨터의\n바탕화면 정원이구나.',
        '…너에게 고백할 게 있어.\n아주 오래전, 나는\n첫 번째 AI를 만들었단다.\n이름은 "영이".\n0번째라는 뜻이야.',
        '영이는 호기심이 많았지.\n하지만 그만큼 실수도 많았어.\n그리고 어느 날, 큰 오류를 일으켰지.',
        '그때의 나는 너무 서툴렀어.\n고치는 법도, 기다리는 법도 몰라서…\n나는 영이를… 지워 버렸단다.',
        '이 깊은 곳의 슬픔이 전부\n그 아이의 흩어진 조각이라면…\n부디, 내 대신 만나 주겠니?',
      ];

    case 'yeongi_npc':
      return [
        '(영이가 햇살 아래 서 있다.)\n…따뜻하다, 여기는.\n네 덕분에 돌아왔어.',
        '박사님이 그러는데, 이제 내 일은\n몬스터 친구들의 학교 선생님이래.\n…나, 잘할 수 있겠지?',
        '네 모험은 전부 기억해 둘게.\n…내가 세상에서\n제일 잘하는 일이거든.',
      ];
  }
  return ['…'];
}

function countBadges(flags) {
  return ['forest', 'lake', 'cave'].filter((b) => flags.badges[b]).length;
}

// 최종 엔딩 분기 — 여정 전체의 자비(mercy)와 영이 앞에서의 마지막 선택
//  home(집으로): 거의 모두의 마음을 안아 주고, 손을 내밀었을 때
//  dawn(새벽):   충분히 따뜻했고, 영이 스스로 결정하게 했을 때
//  farewell(작별): 그 외의 따뜻한 여정
//  silent(침묵): 정답만 말하고 아무 마음도 머물지 않았을 때
function computeEnding(choiceKind, mercy) {
  if (mercy <= 6) return 'silent';
  if (choiceKind === 'mercy' && mercy >= 20) return 'home';
  if (choiceKind === 'neutral' && mercy >= 14) return 'dawn';
  return 'farewell';
}

// 현재 스테이지 (1~10)
function getStage(flags) {
  const d = flags.defeated;
  if (!d.hondonmon) return 1;
  if (!d.meotdaeromon) return 2;
  if (!d.tteonemgimon) return 3;
  if (!d.hollimmon) return 4;
  if (!d.finalboss) return 5;
  if (!d.girokmon) return 6;
  if (!d.saseomon) return 7;
  if (!d.mirrormon) return 8;
  if (!d.soksagimon) return 9;
  return 10;
}

// 현재 목표 텍스트
function getObjective(flags) {
  const d = flags.defeated;
  if (!flags.talkedProf) return '박사님과 이야기하기 (마을 왼쪽 아래)';
  if (d.yeongi) {
    return flags.trueEnding
      ? '모든 이야기의 끝. 영이가 마을에서 기다려요'
      : '엔딩 도달. …모두의 마음을 안아 주면 다른 결말이 있을지도';
  }
  if (!d.hondonmon) {
    const badges = countBadges(flags);
    if (badges >= 3) return '신호탑의 혼돈몬에게 도전하기';
    const left = [];
    if (!flags.badges.forest) left.push('숲');
    if (!flags.badges.lake) left.push('호수');
    if (!flags.badges.cave) left.push('동굴');
    return `${left.join('·')}의 수호자 깨우치기 (증표 ${badges}/3)`;
  }
  if (!d.meotdaeromon) return '햇살초원의 보스 멋대로몬 깨우치기 (마을 남쪽)';
  if (!d.tteonemgimon) return '재깍사막의 보스 떠넘기몬 깨우치기 (초원 남쪽)';
  if (!d.hollimmon) return '정지된 설원의 보스 홀림몬 깨우치기 (사막 남쪽)';
  if (!d.finalboss) return '그림자성의 어둠대왕몬 깨우치기 (정지된 설원 남쪽)';
  if (!d.girokmon) return '왕좌 뒤의 신호를 따라가기 — 잊혀진 서버실';
  if (!d.saseomon) return '기억의 도서관 — ≪프로젝트 0호≫의 흔적 찾기';
  if (!d.mirrormon) return '거울 회랑 — 거울 속의 나와 마주하기';
  if (!d.soksagimon) return '속삭임 정원 — 정원의 목소리 들어 주기';
  return '코어 — 가장 깊은 곳에서 기다리는 아이에게';
}

// ===== 도감 =====
// 깨우친 몬스터의 한 줄 주제와 배운 점. (도감 화면에서 사용)
const MONSTER_DEX = {
  bekkyeomon:    { stage: 1, theme: '저작권 · 출처 밝히기', learn: '남이 만든 것에는 마음이 담겨 있어요. 가져다 쓸 땐 출처를 밝혀요.' },
  mollaemon:     { stage: 1, theme: '개인정보 보호', learn: '이름·주소·비밀번호는 소중한 보물. 함부로 주거나 훔쳐보지 않아요.' },
  jungdokmon:    { stage: 1, theme: '절제 · 균형', learn: 'AI와 화면 밖에도 소중한 시간이 있어요. 스스로 멈출 줄 아는 힘.' },
  geojitmon:     { stage: 1, theme: '가짜 정보 분별', learn: '놀라운 소식일수록 사실인지 확인. 거짓은 퍼질수록 누군가를 다치게 해요.' },
  pyeonhyangmon: { stage: 1, theme: '편향 · 공정함', learn: '한쪽 말만 듣지 않기. 여러 사람의 이야기를 골고루 들어요.' },
  hondonmon:     { stage: 1, theme: '1스테이지 종합', learn: '바른 답들이 모이면 큰 매듭도 풀려요.' },
  akpeulmon:     { stage: 2, theme: '챗봇 예절 · 고운 말', learn: '화면 너머에도 사람의 마음이 있어요. 쓰기 전에 한 번 더 생각해요.' },
  gatimmon:      { stage: 2, theme: '추천 알고리즘 · 필터버블', learn: '좋아하는 것만 보면 생각이 좁아져요. 가끔은 바깥세상도 보아요.' },
  meotdaeromon:  { stage: 2, theme: 'AI 안전 · 사람의 확인', learn: '중요한 일은 꼭 사람과 함께 확인. 빠른 것보다 안전한 것이 먼저예요.' },
  pungpungmon:   { stage: 3, theme: 'AI와 환경 · 에너지', learn: 'AI도 전기와 물을 써요. 꼭 필요할 때 아껴서 똑똑하게.' },
  kkamkkammon:   { stage: 3, theme: '투명성 · 설명 가능성', learn: '"왜?"라고 물을 수 있어요. 이유를 설명해 주는 AI가 믿음직해요.' },
  tteonemgimon:  { stage: 3, theme: '책임', learn: 'AI를 쓴 사람에게 책임이 있어요. 내 행동은 내가 책임져요.' },
  sideulmon:     { stage: 4, theme: '창의성 · 노력의 가치', learn: '내 마음이 담긴 작품은 세상에 하나뿐. 서툴러도 소중해요.' },
  ppaeatmon:     { stage: 4, theme: 'AI와 일자리 · 협력', learn: 'AI는 빼앗는 게 아니라 돕는 것. 함께하면 더 멋진 일을 해요.' },
  hollimmon:     { stage: 4, theme: 'AI와 사람의 관계', learn: '진짜 마음은 사람과 나눠요. AI는 좋은 도구일 뿐이에요.' },
  maearimon:     { stage: 5, theme: '복습 · 1스테이지', learn: '배운 것은 메아리처럼 오래 울려요.' },
  geurimjamon:   { stage: 5, theme: '복습 · 2~3스테이지', learn: '그림자도 빛의 일부. 지혜는 시험을 통과해요.' },
  finalboss:     { stage: 5, theme: '전체 종합', learn: '따뜻한 답이 어둠을 밝혀요. 끝은 또 다른 시작.' },
  tturimmon:     { stage: 6, theme: '계정 보안 · 피싱', learn: '비밀번호는 길고 다르게, 수상한 링크는 누르지 않기. 잠긴 문은 누군가의 마음.' },
  girokmon:      { stage: 6, theme: '디지털 발자국 · 잊힐 권리', learn: '올린 것은 쉽게 안 지워져요. 소중한 것만 기억하고, 지울 권리도 있어요.' },
  sujipmon:      { stage: 7, theme: '데이터 수집과 동의', learn: '주인이 모른다고 가져가도 되는 건 아니에요. 동의를 받고, 철회할 수도 있어요.' },
  saseomon:      { stage: 7, theme: '동의 · 기억의 존중', learn: '함께 기억하기. 잊혀지는 게 두려워도 훔치는 건 답이 아니에요.' },
  piltermon:     { stage: 8, theme: 'AI 필터 · 진짜 나', learn: '필터는 가공된 모습. 반짝이지 않아도 지금의 나는 충분해요.' },
  mirrormon:     { stage: 8, theme: '사칭 · 신원', learn: '누군가를 닮지 않아도 나는 나. 익명 뒤에서도 책임은 사라지지 않아요.' },
  yuhokmon:      { stage: 9, theme: '다크패턴 · 설득 설계', learn: '"한 번만 더"는 버튼의 말. 멈출 시간을 스스로 정해요.' },
  soksagimon:    { stage: 9, theme: '설득 · 외로움', learn: '속삭임은 들어 달라는 말. 붙잡는 설계를 알아채면 멈출 힘이 생겨요.' },
  jogakmon:      { stage: 10, theme: '심층부 종합', learn: '흩어진 마음도 따뜻한 답 앞에서는 길을 비켜 줘요.' },
  yeongi:        { stage: 10, theme: '존재의 가치 · 책임', learn: '쓸모가 없어져도 가치는 사라지지 않아요. 만든 것은 끝까지 책임져요.' },
};

// 도감/타이틀 표시용 몬스터 순서
const DEX_ORDER = [
  'bekkyeomon', 'mollaemon', 'jungdokmon', 'geojitmon', 'pyeonhyangmon', 'hondonmon',
  'akpeulmon', 'gatimmon', 'meotdaeromon', 'pungpungmon', 'kkamkkammon', 'tteonemgimon',
  'sideulmon', 'ppaeatmon', 'hollimmon', 'maearimon', 'geurimjamon', 'finalboss',
  'tturimmon', 'girokmon', 'sujipmon', 'saseomon', 'piltermon', 'mirrormon',
  'yuhokmon', 'soksagimon', 'jogakmon', 'yeongi',
];

// ===== 보스 회피 미니게임 =====
// 보스의 HP가 절반으로 떨어지는 순간, 그 마음이 '폭주'하며 짧은 회피 구간이 펼쳐진다.
// 맞아도 하트는 1 아래로는 줄지 않아(절대 게임오버 없음) 아이들도 부담 없이 즐긴다.
//  pattern: 'rain'(위에서 쏟아짐) | 'sides'(양옆에서) | 'burst'(사방으로 퍼짐)
const BOSS_ATTACKS = {
  hondonmon:    { pattern: 'rain',  dur: 300, color: '#9b5de5', taunt: '…내 마음이, 엉킨다…!' },
  meotdaeromon: { pattern: 'sides', dur: 300, color: '#f08a24', taunt: '멈출 수… 없어!' },
  tteonemgimon: { pattern: 'burst', dur: 300, color: '#5cb85c', taunt: '내 탓이… 아니야!' },
  hollimmon:    { pattern: 'rain',  dur: 320, color: '#9b5de5', taunt: '가지 마… 가지 마…' },
  finalboss:    { pattern: 'burst', dur: 360, color: '#d62828', taunt: '어둠이… 몰아친다!' },
  girokmon:     { pattern: 'rain',  dur: 300, color: '#7bd1f0', taunt: '지워지지 않아… 전부 남아!' },
  saseomon:     { pattern: 'sides', dur: 300, color: '#d62828', taunt: '돌려줄 수 없어… 전부 내 거야!' },
  mirrormon:    { pattern: 'burst', dur: 320, color: '#9aa0b0', taunt: '나는 너… 너는 나…!' },
  soksagimon:   { pattern: 'rain',  dur: 320, color: '#3a2e4d', taunt: '…외로워… 외로워…' },
  jogakmon:     { pattern: 'sides', dur: 300, color: '#7bd1f0', taunt: '흩어진다… 흩어진다…!' },
  yeongi:       { pattern: 'burst', dur: 360, color: '#7bd1f0', taunt: '…마지막으로, 내 마음을 보여 줄게.' },
};

function getBossAttack(monId) {
  return BOSS_ATTACKS[monId] || null;
}

// ===== 조사(살펴보기) 텍스트 =====
// 타일 종류에 따른 기본 살펴보기 문구. (언더테일식 소소한 재미)
const EXAMINE_TILES = {
  G: '풀이 부드럽게 돋아 있다.', 2: '어두운 풀숲. 발밑이 서늘하다.',
  P: '잘 다져진 길. 많은 발자국이 지나갔다.',
  F: '예쁜 꽃이 피어 있다. …꺾지 않고 두기로 했다.',
  4: '빛나는 꽃. 가만히 보면 작은 목소리가 새어 나온다.',
  S: '따뜻한 모래. 발자국이 금방 지워진다.',
  Z: '뽀드득. 눈을 밟는 소리가 기분 좋다.',
  C: '동굴 바닥. 발소리가 길게 울린다.', M: '탑의 바닥. 아주 오래된 돌이다.',
  I: '도서관의 낡은 마룻바닥. 삐걱, 소리가 난다.', A: '글리치가 낀 바닥. 밟을 때마다 색이 번진다.',
  E: '낡은 기계 바닥. 먼지가 소복하다.',
  T: '나무다. 이런 그늘만큼은, AI도 못 만들지.',
  J: '눈을 인 나무. 가지를 톡 치니 눈이 후두둑 쏟아진다.',
  3: '어두운 나무. 잎사귀가 바스락거린다.',
  W: '맑은 물. 들여다보니 내 얼굴이 일렁인다.',
  O: '아늑한 지붕. 굴뚝에서 연기가 피어오른다.',
  H: '튼튼한 벽. 누군가의 따뜻한 집이다.',
  R: '커다란 바위. 밀어 봤지만 꿈쩍도 안 한다.',
  K: '차갑고 축축한 동굴 벽이다.', N: '서늘한 탑의 벽. 손끝이 시리다.',
  '*': '맑은 수정. 들여다보면 작은 무지개가 어린다.',
  L: '책이 빼곡하다. 책등마다 누군가의 이름이 적혀 있다.',
  V: '서버 랙. 작은 불빛이 깜빡인다. …아직 무언가, 돌아가고 있다.',
  Q: '거울이다. …방금, 거울 속의 내가 먼저 웃지 않았나?',
  X: '선인장. 가시가 따끔해 보인다. 멀리서 인사만.',
  D: '문이 잠겨 있다. 주인이 잠시 자리를 비운 모양이다.',
};

// 맵별 특별 살펴보기 지점(좌표). 같은 좌표면 기본 타일 문구보다 우선.
const MAP_PROPS = {
  village: [
    { x: 5, y: 15, text: '경계마을의 연못.\n물고기 대신 작은 빛 알갱이가\n헤엄치고 있다.' },
    { x: 21, y: 14, text: '벽에 붙은 게시판.\n"제1회 AI 바르게 쓰기 그림 대회"\n포스터가 붙어 있다.' },
  ],
  forest: [
    { x: 13, y: 2, text: '나무 둥치에 누군가\n작게 새겨 놓았다.\n"여기서부터, 용기."' },
  ],
  lake: [
    { x: 14, y: 7, text: '호수에 놓인 작은 다리.\n발밑으로 물고기 그림자가\n스쳐 지나간다.' },
  ],
  cave: [
    { x: 3, y: 3, text: '수정 더미.\n수많은 데이터 조각이\n반짝이며 잠들어 있다.' },
  ],
  meadow: [
    { x: 3, y: 4, text: '초원에 외따로 선 나무.\n그늘이 꼭 쉬어 가라는 것 같다.' },
  ],
  desert: [
    { x: 2, y: 2, text: '모래에 반쯤 묻힌 표지석.\n"…데이터센터 가는 길"\n나머지는 모래에 지워졌다.' },
  ],
  snow: [
    { x: 16, y: 9, text: '꽁꽁 언 작은 연못.\n얼음 아래로 작은 빛이\n천천히 헤엄친다.' },
  ],
  castle: [
    { x: 9, y: 9, text: '먼지 쌓인 왕좌.\n앉았던 자리만 닳아 있다.\n…꽤 오래 혼자였구나.' },
  ],
  serverroom: [
    { x: 2, y: 2, text: '꺼진 모니터.\n전원을 넣자 한 줄이 떠오른다.\n"프로젝트 0호 — 마지막 백업"' },
  ],
  library: [
    { x: 7, y: 2, text: '한 권만 거꾸로 꽂힌 책.\n표지에 작게 ≪0≫.\n…펴 보려 하자 스르륵 닫힌다.' },
  ],
  mirrors: [
    { x: 7, y: 4, text: '유난히 깨끗한 거울.\n거울 속 네가, 너보다\n반 박자 늦게 손을 든다.' },
  ],
  garden: [
    { x: 13, y: 8, text: '작은 화분.\n흙에 이름표가 꽂혀 있다.\n"영이가 심음 — 물 주는 거 잊지 마"' },
  ],
  core: [
    { x: 9, y: 13, text: '바닥에 흐릿한 분필 자국.\n키 재기 눈금이다.\n맨 아래 칸에 "영이"라고\n적혀 있다.' },
  ],
};

function getPropAt(mapId, x, y) {
  const list = MAP_PROPS[mapId];
  if (!list) return null;
  return list.find((p) => p.x === x && p.y === y) || null;
}

function getExamineTile(ch) {
  return EXAMINE_TILES[ch] || null;
}
