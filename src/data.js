// 게임 데이터: 맵, NPC, 몬스터, 퀴즈
//
// 타일 종류
//  G 풀  P 길  F 꽃  S 모래  B 다리  C 동굴바닥  M 탑바닥  1 탑문(워프)
//  T 나무  W 물  O 지붕  H 벽  D 문(장식)  R 바위  K 동굴벽  * 수정  N 탑벽  Y 표지판

const WALKABLE = new Set(['G', 'P', 'F', 'S', 'B', 'C', 'M', '1']);

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
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    warps: [
      { x: 13, y: 0, to: 'forest', tx: 13, ty: 18 },
      { x: 14, y: 0, to: 'forest', tx: 14, ty: 18 },
      { x: 0, y: 11, to: 'cave', tx: 25, ty: 11 },
      { x: 27, y: 11, to: 'lake', tx: 2, ty: 11 },
      { x: 18, y: 4, to: 'tower', tx: 8, ty: 12, needBadges: 3 },
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
    win: '말도 안 돼…!\n네 마음속의 바른 생각이\n나를 이겼구나…\n이제 AI 세상은 평화로워질 거야.',
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
      if (flags.defeated.hondonmon) {
        return ['정말 고맙다, 수호자야!\n네 덕분에 AI 세상이 평화로워졌어!'];
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
  }
  return ['…'];
}

function countBadges(flags) {
  return ['forest', 'lake', 'cave'].filter((b) => flags.badges[b]).length;
}

// 현재 목표 텍스트
function getObjective(flags) {
  if (!flags.talkedProf) return '박사님과 이야기하기 (마을 왼쪽 아래)';
  if (flags.defeated.hondonmon) return '클리어! 자유롭게 돌아다녀 보세요';
  const badges = countBadges(flags);
  if (badges >= 3) return 'AI 타워의 혼돈몬에게 도전하기';
  const left = [];
  if (!flags.badges.forest) left.push('숲');
  if (!flags.badges.lake) left.push('호수');
  if (!flags.badges.cave) left.push('동굴');
  return `${left.join('·')}의 수호자 깨우치기 (배지 ${badges}/3)`;
}
