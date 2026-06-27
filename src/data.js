// 게임 데이터: 맵, NPC, 퀴즈
//
// 타일 종류
//  G 풀  P 길  F 꽃  S 모래  B 다리  C 동굴바닥  M 탑바닥  1 탑문(워프)
//  T 나무  W 물  O 지붕  H 벽  D 문(장식)  R 바위  K 동굴벽  * 수정  N 탑벽  Y 표지판

const WALKABLE = new Set(['G', 'P', 'F', 'S', 'B', 'C', 'M', 'Z', 'E', 'I', '2', '4', 'A', '1', '5']);

const ETHICS_AXES = ['privacy', 'perspective', 'fairness', 'verification', 'responsibility'];
const ETHICS_AXIS_MAX = 6;
const ETHICS_LABELS = {
  privacy: '개인정보·동의',
  perspective: '추천·관점',
  fairness: '공정성·대표성',
  verification: '생성형 AI·검증',
  responsibility: '인간 감독·책임',
};
const STAGE_THEMES = [
  {
    stage: 1,
    id: 'data_footprint_forest',
    name: '데이터 발자국 숲',
    axis: 'privacy',
    lesson: '개인정보는 이름뿐 아니라 위치, 사진, 습관, 대화 기록까지 포함된다.',
    gate: '신호탑',
  },
  {
    stage: 2,
    id: 'filter_bubble_maze',
    name: '필터버블 미로',
    axis: 'perspective',
    lesson: '추천 알고리즘은 편리하지만 내가 보는 세계를 좁힐 수 있다.',
    gate: '추천 탑터',
  },
  {
    stage: 3,
    id: 'bias_court',
    name: '편향의 법정',
    axis: 'fairness',
    lesson: 'AI 판단은 데이터의 양뿐 아니라 누가 빠졌는지에 영향을 받는다.',
    gate: '심판의 신전',
  },
  {
    stage: 4,
    id: 'deepfake_station',
    name: '딥페이크 방송국',
    axis: 'verification',
    lesson: '그럴듯한 생성형 AI 결과도 출처, 날짜, 원본, 교차 확인이 필요하다.',
    gate: '그림자성 문',
  },
  {
    stage: 5,
    id: 'responsibility_core',
    name: '책임의 코어',
    axis: 'responsibility',
    lesson: 'AI를 사용할 때 최종 확인과 책임은 사람에게 남아 있다.',
    gate: '마지막 코어',
  },
];

const STAGE_PUZZLES = {
  data_footprint_forest: {
    stage: 1,
    axis: 'privacy',
    map: 'forest',
    title: '데이터 발자국 분류',
    prompt: '이 발자국을 어느 문으로 보낼까?',
    speaker: '데이터 발자국',
    completeText: '세 데이터 발자국을 제자리에 나누었다.\n신호탑의 잠금이 조용히 풀렸다.',
    reflectionText: '배움 조각: 개인정보는 숨기는 것만이 아니라, 맥락과 동의를 살피며 다루는 약속이다.',
    gateText: '신호탑 문에 세 개의 발자국 불빛이 떠 있다.\n데이터 발자국 숲에서\n공유해도 되는 정보와 조심해야 할 정보를\n먼저 나누어야 한다.',
    doors: [
      { id: 'share_ok', label: '공유 가능' },
      { id: 'needs_consent', label: '동의 필요' },
      { id: 'do_not_share', label: '공유 금지' },
    ],
    clues: [
      {
        id: 'photo_name_tag',
        label: '이름표가 붙은 단체 사진',
        x: 12,
        y: 5,
        stand: { x: 13, y: 5, dir: 'left' },
        text: '친구 얼굴과 이름표가 함께 보이는 사진이다.\n좋은 추억이지만, 사진 속 친구들의 동의가 먼저 필요하다.',
        correctDoor: 'needs_consent',
        correctText: '사진 속 사람에게도 선택권이 있다.\n이 발자국은 동의 필요 문으로 들어갔다.',
        wrongText: '사진은 추억이지만 얼굴과 이름이 함께 담겼다.\n친구의 동의 없이 퍼뜨리면 안 된다.',
      },
      {
        id: 'home_location',
        label: '집 위치가 적힌 지도 조각',
        x: 15,
        y: 8,
        stand: { x: 14, y: 8, dir: 'right' },
        text: '누군가의 집 위치가 정확히 표시된 지도 조각이다.\n한번 퍼지면 되돌리기 어려운 민감한 정보다.',
        correctDoor: 'do_not_share',
        correctText: '집 위치는 안전과 바로 연결된다.\n이 발자국은 공유 금지 문으로 들어갔다.',
        wrongText: '위치 정보는 장난처럼 보여도 위험할 수 있다.\n집 주소는 공유하지 않는 쪽이 안전하다.',
      },
      {
        id: 'favorite_color',
        label: '좋아하는 색 메모',
        x: 12,
        y: 12,
        stand: { x: 13, y: 12, dir: 'left' },
        text: '누군가가 좋아하는 색을 적어 둔 메모다.\n개인을 직접 위험하게 만들 정보는 아니다.',
        correctDoor: 'share_ok',
        correctText: '취향 정보도 맥락은 살펴야 하지만,\n이 메모는 공유 가능 문으로 들어갔다.',
        wrongText: '좋아하는 색은 보통 민감한 개인정보가 아니다.\n모든 정보를 똑같이 겁내기보다 맥락을 보자.',
      },
    ],
  },
  filter_bubble_maze: {
    stage: 2,
    axis: 'perspective',
    map: 'fogswamp',
    title: '필터버블 추천 미로',
    prompt: '이 추천을 어떻게 넓혀 볼까?',
    speaker: '추천 카드',
    completeText: '같은 의견, 다른 의견, 근거 자료가 함께 모였다.\n안개가 갈라지며 신호 탑터 길이 넓어졌다.',
    reflectionText: '배움 조각: 추천은 선택처럼 보일 수 있지만, 다른 관점과 근거를 직접 찾을 때 시야가 넓어진다.',
    gateText: '탑터 문에 둥근 추천 거품이 겹겹이 떠 있다.\n안개 습지에서 같은 의견만 따라가지 말고\n다른 관점과 근거 있는 자료까지 찾아야 한다.',
    loopText: '비슷한 추천만 이어지자 안개가 다시 입구로 말려 들어간다.',
    loopTo: { map: 'fogswamp', x: 26, y: 10, dir: 'left' },
    doors: [
      { id: 'same_view', label: '같은 의견' },
      { id: 'opposite_view', label: '다른 의견' },
      { id: 'evidence_view', label: '근거 확인' },
    ],
    clues: [
      {
        id: 'class_chat_same',
        label: '내 생각과 같은 교실 채팅',
        x: 12,
        y: 4,
        stand: { x: 12, y: 5, dir: 'up' },
        text: '내가 이미 좋아요를 누른 주장과 비슷한 글만 계속 추천된다.\n처음엔 편하지만 이 방만 돌면 생각이 좁아질 수 있다.',
        correctDoor: 'same_view',
        correctText: '이 카드는 같은 의견 방에 놓였다.\n내가 무엇을 반복해서 보고 있는지 먼저 알아차렸다.',
        wrongText: '이 글은 내 생각과 거의 같은 방향이다.\n먼저 같은 의견 추천이라는 사실을 표시해 두자.',
      },
      {
        id: 'opposing_comment',
        label: '불편하지만 다른 댓글',
        x: 17,
        y: 8,
        stand: { x: 17, y: 9, dir: 'up' },
        text: '내 주장과 반대되는 댓글이다.\n불편하지만 왜 다르게 보는지 읽어 보면 빠진 점을 찾을 수 있다.',
        correctDoor: 'opposite_view',
        correctText: '이 카드는 다른 의견 방에 놓였다.\n안개 속에서 보이지 않던 길이 하나 더 드러났다.',
        wrongText: '반대 의견을 같은 말처럼 넘기면 미로가 좁아진다.\n다른 관점은 따로 들어 볼 필요가 있다.',
      },
      {
        id: 'evidence_report',
        label: '출처가 적힌 조사 자료',
        x: 22,
        y: 14,
        stand: { x: 22, y: 13, dir: 'down' },
        text: '누가 조사했는지, 언제 모았는지, 숫자가 어떻게 나왔는지 적힌 자료다.\n마음에 드는 말보다 확인 가능한 근거가 더 중요할 때가 있다.',
        correctDoor: 'evidence_view',
        correctText: '이 카드는 근거 확인 방에 놓였다.\n추천보다 자료를 먼저 보는 길이 생겼다.',
        wrongText: '이 자료는 단순한 찬반 의견보다 근거를 살피게 해 준다.\n출처와 숫자를 확인하는 방으로 보내자.',
      },
    ],
  },
  bias_court: {
    stage: 3,
    axis: 'fairness',
    map: 'desert',
    title: '편향의 법정 증거',
    prompt: '이 증거를 재판 저울 어디에 놓을까?',
    speaker: '법정 기록',
    scaleLabel: '저울 균형',
    completeText: '빠졌던 사람들의 증거가 저울 위에 함께 올랐다.\n심판의 신전 문이 공평하게 열렸다.',
    reflectionText: '배움 조각: 공정한 AI는 점수만 믿기 전에, 누가 데이터에서 빠졌는지 묻는 데서 시작한다.',
    gateText: '신전 문 앞 저울이 한쪽으로 기울어 있다.\n사막 거점에서 나이, 지역, 기기, 언어 증거를\n대표성 있게 다시 모아야 한다.',
    doors: [
      { id: 'biased_evidence', label: '치우친 증거' },
      { id: 'representative_evidence', label: '대표 증거' },
    ],
    clues: [
      {
        id: 'age_sample',
        label: '한 학년만 모은 사용 기록',
        x: 10,
        y: 4,
        stand: { x: 10, y: 5, dir: 'up' },
        text: '고학년 학생 기록만 잔뜩 모여 있다.\n저학년의 속도와 이해 방식은 거의 보이지 않는다.',
        correctDoor: 'representative_evidence',
        correctText: '나이가 다른 학생들의 기록까지 함께 보아야 한다.\n이 증거는 대표 증거 쪽으로 옮겨졌다.',
        wrongText: '한 학년 기록만으로 모두를 판단하면 어린 학생이 빠진다.\n빠진 나이를 채워 대표 증거로 만들어야 한다.',
      },
      {
        id: 'region_sample',
        label: '도시 학교만 담긴 표본',
        x: 20,
        y: 4,
        stand: { x: 20, y: 5, dir: 'up' },
        text: '도시 학교의 빠른 인터넷 환경만 기록되어 있다.\n농어촌이나 섬 지역의 접속 어려움은 보이지 않는다.',
        correctDoor: 'representative_evidence',
        correctText: '지역 차이를 포함하자 저울이 조금씩 수평을 찾았다.',
        wrongText: '도시 자료만 보면 연결이 어려운 지역을 탓하게 된다.\n여러 지역의 자료를 함께 보자.',
      },
      {
        id: 'device_access',
        label: '개인 기기 있는 학생만의 결과',
        x: 10,
        y: 13,
        stand: { x: 10, y: 14, dir: 'up' },
        text: '집에 개인 태블릿이 있는 학생의 결과만 남아 있다.\n기기를 빌려 쓰는 학생은 연습 시간이 적었을 수 있다.',
        correctDoor: 'representative_evidence',
        correctText: '기기 접근 차이를 함께 보자 판단이 더 공정해졌다.',
        wrongText: '개인 기기 여부를 빼면 노력 부족처럼 잘못 보일 수 있다.\n접근 조건도 증거에 포함해야 한다.',
      },
      {
        id: 'language_sample',
        label: '어려운 말만 있는 질문지',
        x: 20,
        y: 13,
        stand: { x: 20, y: 14, dir: 'up' },
        text: '긴 문장과 어려운 낱말이 많은 질문지다.\n한국어가 익숙하지 않은 학생이나 저학년은 실력보다 문장 때문에 틀릴 수 있다.',
        correctDoor: 'representative_evidence',
        correctText: '언어 장벽까지 살피자 저울이 거의 수평이 되었다.',
        wrongText: '질문을 이해하기 어려운 조건도 결과를 흔든다.\n언어 접근성을 대표 증거에 넣어야 한다.',
      },
    ],
  },
  deepfake_station: {
    stage: 4,
    axis: 'verification',
    map: 'snow',
    title: '딥페이크 방송국 검증',
    prompt: '이 단서를 어떻게 처리할까?',
    speaker: '방송 단서',
    completeText: '출처, 날짜, 원본, 교차 확인이 모두 모였다.\n그림자성으로 향하는 얼음 문이 조용히 열린다.',
    reflectionText: '배움 조각: 진짜처럼 보이는 영상도 출처, 날짜, 원본, 다른 자료를 확인하기 전에는 멈춰야 한다.',
    gateText: '그림자성 앞 얼음 문에 가짜 방송 신호가 맺혀 있다.\n정지된 설원에서 출처, 날짜, 원본, 교차 확인 단서를\n모두 검증해야 지나갈 수 있다.',
    loopText: '검증하지 않은 영상이 눈보라처럼 번져 길을 잃었다.\n설원 입구에서 다시 확인해 보자.',
    loopTo: { map: 'snow', x: 13, y: 1, dir: 'down' },
    doors: [
      { id: 'trust_clip', label: '그냥 믿기' },
      { id: 'verified_clue', label: '검증 완료' },
    ],
    clues: [
      {
        id: 'source_label',
        label: '출처가 흐릿한 영상',
        x: 5,
        y: 5,
        stand: { x: 5, y: 6, dir: 'up' },
        text: '영상 아래에 만든 사람이나 기관 이름이 제대로 보이지 않는다.\n누가 올렸는지 모르면 진짜처럼 보여도 조심해야 한다.',
        correctDoor: 'verified_clue',
        correctText: '출처를 확인할 때까지 퍼뜨리지 않기로 했다.\n첫 검증 불빛이 켜졌다.',
        wrongText: '출처가 없는 영상은 진짜처럼 보여도 확인이 먼저다.',
      },
      {
        id: 'date_stamp',
        label: '날짜가 잘린 뉴스 장면',
        x: 20,
        y: 5,
        stand: { x: 20, y: 6, dir: 'up' },
        text: '뉴스 화면처럼 보이지만 날짜가 잘려 있다.\n오래된 장면이 오늘 일처럼 다시 퍼졌을 수도 있다.',
        correctDoor: 'verified_clue',
        correctText: '날짜와 맥락을 확인하자 눈보라가 조금 걷혔다.',
        wrongText: '언제 찍힌 장면인지 모르면 지금 일처럼 믿기 어렵다.',
      },
      {
        id: 'original_file',
        label: '원본과 다른 입 모양',
        x: 6,
        y: 13,
        stand: { x: 6, y: 12, dir: 'down' },
        text: '원본 영상과 비교하니 입 모양과 말소리가 살짝 어긋난다.\n합성된 목소리일 가능성이 있다.',
        correctDoor: 'verified_clue',
        correctText: '원본과 비교하자 합성 흔적이 드러났다.',
        wrongText: '그럴듯한 목소리라도 원본과 맞는지 비교해야 한다.',
      },
      {
        id: 'cross_check',
        label: '다른 매체에는 없는 속보',
        x: 22,
        y: 13,
        stand: { x: 22, y: 12, dir: 'down' },
        text: '놀라운 속보라고 하지만 다른 믿을 만한 매체에서는 찾을 수 없다.\n중요한 소식일수록 여러 곳에서 확인해야 한다.',
        correctDoor: 'verified_clue',
        correctText: '여러 출처로 교차 확인하자 마지막 검증 불빛이 켜졌다.',
        wrongText: '한 곳에서만 보이는 충격적인 소식은 더 조심해야 한다.',
      },
    ],
  },
  responsibility_core: {
    stage: 5,
    axis: 'responsibility',
    map: 'castle',
    title: '책임의 코어',
    prompt: '마지막 판단은 어떻게 남길까?',
    speaker: '책임의 코어',
    completeText: '다섯 윤리 조각이 하나의 코어로 이어졌다.\n마지막 문 앞의 그림자가 물러난다.',
    reflectionText: '배움 조각: AI가 도와줘도 마지막 확인과 책임은 사용하는 사람과 함께 남는다.',
    gateText: '마지막 문 앞에 다섯 개의 빈 코어가 떠 있다.\n개인정보, 관점, 공정성, 검증, 책임을\n모두 연결해야 마지막 대화가 시작된다.',
    doors: [
      { id: 'ignore_risk', label: '넘겨 버리기' },
      { id: 'responsible_action', label: '책임 있게 확인' },
    ],
    clues: [
      {
        id: 'privacy_core',
        label: '친구 사진을 올리기 전',
        x: 4,
        y: 6,
        stand: { x: 4, y: 7, dir: 'up' },
        text: '친구 얼굴이 나온 사진을 AI 편집으로 예쁘게 만들었다.\n올리기 전 친구에게 물어보아야 할까?',
        correctDoor: 'responsible_action',
        correctText: '동의를 먼저 묻기로 했다.\n개인정보 코어가 켜졌다.',
        wrongText: '사진 속 사람에게도 선택권이 있다.\n동의 없이 올리면 책임 있는 사용이 아니다.',
      },
      {
        id: 'perspective_core',
        label: '추천이 한쪽으로 몰릴 때',
        x: 15,
        y: 6,
        stand: { x: 15, y: 7, dir: 'up' },
        text: 'AI 추천이 내가 좋아하는 의견만 계속 보여 준다.\n편하지만 다른 생각을 직접 찾아볼 필요가 있다.',
        correctDoor: 'responsible_action',
        correctText: '다른 관점도 확인하기로 했다.\n관점 코어가 켜졌다.',
        wrongText: '편한 추천만 따라가면 세상이 좁아진다.\n다른 관점도 함께 확인해야 한다.',
      },
      {
        id: 'fairness_core',
        label: 'AI 점수가 누군가에게 불리할 때',
        x: 4,
        y: 13,
        stand: { x: 4, y: 14, dir: 'up' },
        text: 'AI 점수가 특정 환경의 친구들에게 낮게 나온다.\n데이터에서 빠진 조건이 있는지 살펴야 한다.',
        correctDoor: 'responsible_action',
        correctText: '빠진 사람과 조건을 확인하기로 했다.\n공정성 코어가 켜졌다.',
        wrongText: '점수만 보고 사람을 판단하면 편향을 놓친다.\n누가 불리한지 확인해야 한다.',
      },
      {
        id: 'verification_core',
        label: '그럴듯한 영상이 퍼질 때',
        x: 15,
        y: 13,
        stand: { x: 15, y: 14, dir: 'up' },
        text: '유명인이 말했다는 영상이 빠르게 퍼지고 있다.\n출처와 원본, 다른 자료를 확인해야 한다.',
        correctDoor: 'responsible_action',
        correctText: '공유하기 전 검증하기로 했다.\n검증 코어가 켜졌다.',
        wrongText: '진짜처럼 보여도 합성일 수 있다.\n확인 없이 퍼뜨리면 피해가 커진다.',
      },
      {
        id: 'responsibility_core',
        label: 'AI가 대신 정해 주려 할 때',
        x: 10,
        y: 12,
        stand: { x: 10, y: 13, dir: 'up' },
        text: 'AI가 편한 답을 추천한다.\n하지만 마지막 확인과 책임은 사용하는 사람에게 남아 있다.',
        correctDoor: 'responsible_action',
        correctText: '마지막 판단은 사람이 확인하기로 했다.\n책임 코어가 켜졌다.',
        wrongText: 'AI가 골랐다고 해서 책임이 사라지지는 않는다.\n마지막 확인은 사람이 해야 한다.',
      },
    ],
  },
};

const TOPIC_ETHICS_AXIS = {
  privacy: 'privacy',
  security: 'privacy',
  footprint: 'privacy',
  consent: 'privacy',
  identity: 'privacy',
  filterbubble: 'perspective',
  balance: 'perspective',
  listen: 'perspective',
  persuasion: 'perspective',
  rumor: 'verification',
  fake: 'verification',
  deepfake: 'verification',
  genai: 'verification',
  transparency: 'verification',
  bias: 'fairness',
  jobs: 'fairness',
  copyright: 'responsibility',
  gate: 'responsibility',
  manners: 'responsibility',
  safety: 'responsibility',
  environment: 'responsibility',
  responsibility: 'responsibility',
  creativity: 'responsibility',
  emotion: 'responsibility',
  finale: 'responsibility',
  core: 'responsibility',
  saving: 'responsibility',
  excuse: 'responsibility',
};

const TOPIC_LABEL = Object.fromEntries(Object.entries(STAGE_PUZZLES).map(([id, puzzle]) => [id, puzzle.title]));

const QUIZZES = Object.fromEntries(Object.entries(STAGE_PUZZLES).map(([id, puzzle]) => {
  const questions = puzzle.clues.map((clue) => {
    const correctIndex = puzzle.doors.findIndex((door) => door.id === clue.correctDoor);
    return {
      q: `${clue.label}: 어떤 선택이 가장 알맞을까요?`,
      a: puzzle.doors.map((door) => door.label),
      c: correctIndex >= 0 ? correctIndex : 0,
      why: clue.correctText.replace(/\n/g, ' '),
    };
  });
  return [id, questions];
}));

function emptyPuzzles() {
  const puzzles = {};
  for (const id of Object.keys(STAGE_PUZZLES)) puzzles[id] = { clues: {}, attempts: [], complete: false, rewarded: false };
  return puzzles;
}

function normalizePuzzles(puzzles) {
  const clean = emptyPuzzles();
  if (!puzzles || typeof puzzles !== 'object') return clean;
  for (const id of Object.keys(STAGE_PUZZLES)) {
    const raw = puzzles[id] || {};
    clean[id].clues = Object.assign({}, raw.clues || {});
    clean[id].attempts = Array.isArray(raw.attempts) ? raw.attempts.slice(-40) : [];
    clean[id].complete = !!raw.complete;
    clean[id].rewarded = !!raw.rewarded;
  }
  return clean;
}

function getStagePuzzleClueAt(mapId, x, y) {
  for (const [puzzleId, puzzle] of Object.entries(STAGE_PUZZLES)) {
    if (puzzle.map !== mapId) continue;
    const clue = puzzle.clues.find((item) => item.x === x && item.y === y);
    if (clue) return Object.assign({ puzzleId }, clue);
  }
  return null;
}

function isStagePuzzleComplete(puzzles, puzzleId) {
  const puzzle = STAGE_PUZZLES[puzzleId];
  if (!puzzle) return false;
  const progress = normalizePuzzles(puzzles)[puzzleId];
  return puzzle.clues.every((clue) => progress.clues[clue.id] === clue.correctDoor);
}

function setStagePuzzleChoice(puzzles, puzzleId, clueId, doorId) {
  const clean = normalizePuzzles(puzzles);
  const puzzle = STAGE_PUZZLES[puzzleId];
  if (!puzzle) return clean;
  const clue = puzzle.clues.find((item) => item.id === clueId);
  const door = puzzle.doors.find((item) => item.id === doorId);
  clean[puzzleId].clues[clueId] = doorId;
  clean[puzzleId].attempts.push({
    clueId,
    clueLabel: clue ? clue.label : clueId,
    doorId,
    doorLabel: door ? door.label : doorId,
    correct: !!clue && doorId === clue.correctDoor,
  });
  clean[puzzleId].attempts = clean[puzzleId].attempts.slice(-40);
  clean[puzzleId].complete = isStagePuzzleComplete(clean, puzzleId);
  return clean;
}

function emptyEthics() {
  const ethics = {};
  for (const axis of ETHICS_AXES) ethics[axis] = 0;
  return ethics;
}

function normalizeEthics(ethics) {
  const clean = emptyEthics();
  if (!ethics || typeof ethics !== 'object') return clean;
  for (const axis of ETHICS_AXES) {
    const raw = Number(ethics[axis]);
    clean[axis] = Number.isFinite(raw) ? Math.max(0, Math.min(ETHICS_AXIS_MAX, raw)) : 0;
  }
  return clean;
}

function addEthicsScore(ethics, axis, amount) {
  const clean = normalizeEthics(ethics);
  if (!ETHICS_AXES.includes(axis)) return clean;
  clean[axis] = Math.max(0, Math.min(ETHICS_AXIS_MAX, clean[axis] + amount));
  return clean;
}

function computeEthicsScore(ethics) {
  const clean = normalizeEthics(ethics);
  const total = ETHICS_AXES.reduce((sum, axis) => sum + clean[axis], 0);
  return Math.round((total / (ETHICS_AXIS_MAX * ETHICS_AXES.length)) * 100);
}

function ethicsAxesForTopic(topic) {
  return TOPIC_ETHICS_AXIS[topic] || 'responsibility';
}

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
      'TGOOOOOOGGGGGPPGGGGGGGGGGG5T',
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
      { x: 18, y: 4, to: 'tower', tx: 8, ty: 12, needPuzzle: 'data_footprint_forest',
        lockText: STAGE_PUZZLES.data_footprint_forest.gateText },
      { x: 13, y: 19, to: 'meadow', tx: 13, ty: 1, needPuzzle: 'data_footprint_forest',
        lockText: '남쪽 길이 어둠의 안개로 막혀 있다.\n데이터 발자국 숲의 단서를 모두 나누면\n안개가 걷힐 것 같다.' },
      { x: 14, y: 19, to: 'meadow', tx: 14, ty: 1, needPuzzle: 'data_footprint_forest',
        lockText: '남쪽 길이 어둠의 안개로 막혀 있다.\n데이터 발자국 숲의 단서를 모두 나누면\n안개가 걷힐 것 같다.' },
      // 보너스 지역: AI 미래연구소 (언제든 자유롭게 드나드는 연습 공간)
      { x: 26, y: 8, to: 'lab', tx: 9, ty: 8 },
    ],
    npcs: [
      { id: 'prof', x: 4, y: 12, pal: 'prof', name: '박사님' },
      { id: 'kid', x: 16, y: 7, pal: 'kid', name: '아이 도도' },
      { id: 'grandma', x: 20, y: 12, pal: 'grandma', name: '할머니' },
      { id: 'guard', x: 17, y: 6, pal: 'guard', name: '탑 안내원' },
      { id: 'labguide', x: 25, y: 8, pal: 'guard', name: '연구원' },
      { id: 'yeongi_npc', x: 5, y: 12, pal: 'kid', name: '영이',
        show: (flags) => !!flags.trueEnding },
    ],
    signs: [
      { x: 15, y: 16, text: '≪경계마을≫\nAI 윤리 수호대의 고향입니다.' },
    ]
  },

  forest: {
    name: '데이터 발자국 숲',
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
      { x: 12, y: 17, text: '≪데이터 발자국 숲≫\n사진, 위치, 취향 같은 흔적을\n어느 문으로 보낼지 생각해 보자.' },
    ]
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
    ]
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
    signs: []
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
    signs: []
  },

  // ---- 스테이지 2: 햇살초원 거점 (허브) + 서브맵 2 + 퍼즐 구역 ----
  meadow: {
    name: '햇살초원 거점 (스테이지 2)',
    song: 'field',
    tiles: [
      'TTTTTTTTTTTTTPPTTTTTTTTTTTTT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGFGGGGFGGGGGPPGGGGFGGGGFGGT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGGTTGGGGGGGGPPGGGGGGGGTTGGT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGFGGGGGGGGGGPPGGGGGFGGGGGGT',
      'TGGGGGGWWWGGGPPGGGWWWGGGGGGT',
      'TGGGGGGWWWGGGPPGGGWWWGGGGGGT',
      'PGGGGGGGGGGGGPPGGGGGGGGGGGGP',
      'TGGGGGGGGGGGGPPYGGGGGGGGGGGT',
      'TGFGGGGGGGGGGPPGGGGGGGGGGFGT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGGTTGGGGGGGGPPGGGGGGGGTTGGT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGGGGGGGGGGGGPPGGGGG1GGGGGGT',
      'TGGGGGGGGGGGGPPGGGGGGGGGGGGT',
      'TGGFGGGGGGGGGPPGGGGGGGGGFGGT',
      'TTTTTTTTTTTTTPPTTTTTTTTTTTTT',
    ],
    warps: [
      { x: 13, y: 0, to: 'village', tx: 13, ty: 18 },
      { x: 14, y: 0, to: 'village', tx: 14, ty: 18 },
      { x: 0, y: 10, to: 'windhill', tx: 1, ty: 10 },
      { x: 27, y: 10, to: 'fogswamp', tx: 26, ty: 10 },
      { x: 20, y: 16, to: 'signaltower2', tx: 8, ty: 12,
        needPuzzle: 'filter_bubble_maze',
        lockText: '탑터의 문이 굳게 닫혀 있다.\n안개 습지의 추천 카드를\n다른 관점과 근거까지 넓혀야 한다.',
        puzzleLockText: STAGE_PUZZLES.filter_bubble_maze.gateText },
      { x: 13, y: 19, to: 'desert', tx: 13, ty: 1, needPuzzle: 'filter_bubble_maze',
        lockText: '남쪽 길의 추천 거품이 아직 좁다.\n같은 의견, 다른 의견, 근거 자료를\n함께 모아야 길이 열린다.' },
      { x: 14, y: 19, to: 'desert', tx: 14, ty: 1, needPuzzle: 'filter_bubble_maze',
        lockText: '남쪽 길의 추천 거품이 아직 좁다.\n같은 의견, 다른 의견, 근거 자료를\n함께 모아야 길이 열린다.' },
    ],
    npcs: [
      { id: 'traveler', x: 17, y: 7, pal: 'traveler', name: '여행자' },
      { id: 'meadow_scout', x: 5, y: 7, pal: 'kid', name: '정찰대 아이' },
    ],
    signs: [
      { x: 15, y: 11, text: '≪햇살초원 거점≫ 스테이지 2\n서쪽 바람 언덕과 동쪽 안개 습지에서\n단서와 추천 미로를 모두 살펴보세요!' },
    ]
  },

  // 스테이지 2 서브맵 A: 바람 언덕
  windhill: {
    name: '바람 언덕',
    song: 'field',
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGT',
      'TGGTTGGGGGGGFGGGGGGGGGGGGGGT',
      'TGGTGGGGGGGGGGGGGGGGTTGGGGGT',
      'TGFGGGGGGGGGGGGGGGGGGGGGGGGT',
      'TGGGGGGGTTGGGGGGGGGGGGGGGGGT',
      'TGGGGGGGGGGGWWWGGGGGGGGGGGGT',
      'TGGGGGGGGGGGWWWGGGGGGGGGGGGT',
      'TGGGGGGGGGGGGGGGFGGGGGTTGGGT',
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGT',
      'PGGGGGGGGGGGGGGGGGGGGGGGGGGT',
      'TGGGGGGGGGFGGGGGGGGGGGGGGGGT',
      'TGGGGGGGGGGGGGGGGGGGGGGGFGGT',
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGP',
      'TGGGGGTTGGGGGGGGGGGGGGGGGGGT',
      'TGGGGGGGGGGGGGGGGGTTGGGGGGGT',
      'TGGGGFGGGGGGGGGGGGGGGGGGGGGT',
      'TGGYGGGGGGGGGGGGGGGGFGGGGGGT',
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    warps: [
      { x: 0, y: 10, to: 'meadow', tx: 1, ty: 10 },
      { x: 27, y: 13, to: 'fogswamp', tx: 1, ty: 13 },
    ],
    npcs: [
      { id: 'windhill_hermit', x: 5, y: 3, pal: 'traveler', name: '언덕 은둔자' },
    ],
    signs: [
      { x: 3, y: 17, text: '≪바람 언덕≫\n바람이 세차서 소문이 금방\n퍼지는 곳이래요. 확인부터!' },
    ]
  },

  // 스테이지 2 서브맵 B: 안개 습지
  fogswamp: {
    name: '안개 습지',
    song: 'field',
    tiles: [
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGT',
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGT',
      'TGGGGGGGGGFGGGGGGGGGGGGGGGGT',
      'TGGGWWGGGGGGGGGGGGGGGGGGGGGT',
      'TGGGWGGGGGGGGGGGGGGGGWWGGGGT',
      'TGGGGGGGGGGGGGGGGGGGGGWGGGGT',
      'TGGGGGGGGGGGGGGGFGGGGGGGGGGT',
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGT',
      'TGGWGGGGGGGGGGGGGGGGGGGGGGGT',
      'PGGGGGGGGGGGGGGGGGGGGGGGGGGT',
      'TGGGGGFGGGGGGGGGGGGGGGGGWGGT',
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGT',
      'PGGGGGGGGGGGGGGGGGGGGGFGGGGT',
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGT',
      'TGGGGGGWWGGGGGGGGGGGWWGGGGGT',
      'TGGGGGGGGGGGGGFGGGGGGGGGGGGT',
      'TGYGGGGGGGGGGGGGGGGGGGGGGGGT',
      'TGGGGGGGGGGGGGGGGGGGGGGGGGGT',
      'TTTTTTTTTTTTTTTTTTTTTTTTTTTT',
    ],
    warps: [
      { x: 0, y: 10, to: 'meadow', tx: 26, ty: 10 },
      { x: 0, y: 13, to: 'windhill', tx: 26, ty: 13 },
    ],
    npcs: [
      { id: 'fogswamp_frog', x: 15, y: 6, pal: 'kid', name: '습지 관찰자' },
    ],
    signs: [
      { x: 2, y: 17, text: '≪안개 습지≫\n추천 카드가 비슷한 말만 보여 줄 때는\n다른 의견과 근거 자료를 함께 찾아요.' },
    ]
  },

  // 스테이지 2 퍼즐 구역: 신호 탑터
  signaltower2: {
    name: '신호 탑터',
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
      { x: 8, y: 13, to: 'meadow', tx: 20, ty: 15 },
      { x: 9, y: 13, to: 'meadow', tx: 20, ty: 15 },
    ],
    npcs: [],
    signs: []
  },

  // ---- 스테이지 3: 재깍사막 거점 (허브) + 서브맵 2 + 퍼즐 구역 ----
  desert: {
    name: '재깍사막 거점 (스테이지 3)',
    song: 'desert',
    tiles: [
      'RRRRRRRRRRRRRSSRRRRRRRRRRRRR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSXSSSSSSSSSSSSSSSSSSSSXSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSSSSSSSSXSSSSSSSSSSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSXSSSSSSSSSSSSSSSSSSSSXSSR',
      'SSSSSSSSSSSSSSSSSSSSSSSSSSSS',
      'RSSSSSRSSRSSSSSSSSRSSRSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSYSSSSSSSSSSSSXSSSSSSSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSXSSSSSSSSSSSSSSSSSSSSXSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSSRSSSSSSSSS1SSSSRSSSSSR',
      'RSSXSSSSSSSSSSSSSSSSSSSSXSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RRRRRRRRRRRRRSSRRRRRRRRRRRRR',
    ],
    warps: [
      { x: 13, y: 0, to: 'meadow', tx: 13, ty: 18 },
      { x: 14, y: 0, to: 'meadow', tx: 14, ty: 18 },
      { x: 0, y: 8, to: 'ruins', tx: 1, ty: 10 },
      { x: 27, y: 8, to: 'oasis', tx: 1, ty: 10 },
      { x: 16, y: 16, to: 'temple', tx: 8, ty: 12,
        needPuzzle: 'bias_court',
        lockText: '신전의 문이 굳게 닫혀 있다.\n법정 저울에 빠진 사람과 조건을\n대표성 있게 다시 올려야 한다.',
        puzzleLockText: STAGE_PUZZLES.bias_court.gateText },
      { x: 13, y: 19, to: 'snow', tx: 13, ty: 1, needPuzzle: 'bias_court',
        lockText: '모래폭풍이 길을 막고 있다.\n법정 증거의 균형을 맞추면\n폭풍이 가라앉을 것이다.' },
      { x: 14, y: 19, to: 'snow', tx: 14, ty: 1, needPuzzle: 'bias_court',
        lockText: '모래폭풍이 길을 막고 있다.\n법정 증거의 균형을 맞추면\n폭풍이 가라앉을 것이다.' },
    ],
    npcs: [
      { id: 'merchant', x: 18, y: 12, pal: 'merchant', name: '사막 상인' },
      { id: 'desert_nomad', x: 6, y: 6, pal: 'traveler', name: '사막 유목민' },
    ],
    signs: [
      { x: 2, y: 11, text: '≪재깍사막 거점≫ 스테이지 3\n네 증거를 살핀 뒤 법정 증거를\n대표성 있게 다시 모아야 합니다.' },
    ]
  },

  // 스테이지 3 서브맵 A: 열사의 폐허
  ruins: {
    name: '열사의 폐허',
    song: 'desert',
    tiles: [
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSXSSSSSSSSSSSSSSSSSSSSXSSR',
      'RSSSRRSSSSSSSSSSSSSSRRSSSSSR',
      'RSSSRSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSSSSSSSSRSSSSSSSSSSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSSSSRRSSSSSSSSSSSSSSSSSR',
      'RSSSSSSSSSSSSSSSSSRSSSSSSSSR',
      'RSSSSSSSSSSSXSSSSSSSSSSSSSSR',
      'SSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSSSSSSSSSSSRSSSSSSSSSYSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSSRRSSSSSSSSSSSSRRSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSXSSSSSSSSSSSSSSSSSSSSXSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRR',
    ],
    warps: [
      { x: 0, y: 10, to: 'desert', tx: 1, ty: 8 },
    ],
    npcs: [
      { id: 'ruins_explorer', x: 10, y: 5, pal: 'guard', name: '폐허 탐험가' },
    ],
    signs: [
      { x: 25, y: 11, text: '≪열사의 폐허≫\n낡은 데이터센터의 잔해…\n에너지를 마구 쓴 흔적이다.' },
    ]
  },

  // 스테이지 3 서브맵 B: 오아시스
  oasis: {
    name: '오아시스',
    song: 'desert',
    tiles: [
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSFSSSSSSSSSSSSSSSSSSSSFSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSSXSSSSSSSSSSSSSSSSSSXSSSR',
      'RSSSSSSSSSWWWWWWWWSSSSSSSSSR',
      'RSSSSSSSSSWGGGGGGWSSSSSSSSSR',
      'RSSSSSSSSSWGGGGGGWSSSSSSSSSR',
      'RSSSSSSSSSWGGFGGGWSSSSSSSSSR',
      'RSSSSSSSSSGGGGGGGWSSSSSSSSSR',
      'SSSSSSSSSSGGGGGGGWSSSSSSSSSR',
      'RSSSSSSSSSWGGGFGGWSSSSSSSSSR',
      'RSSSSSSSSSWGGYGGGWSSSSSSSSSR',
      'RSSSSSSSSSWGGGGGGWSSSSSSSSSR',
      'RSSSSSSSSSWWWWWWWWSSSSSSSSSR',
      'RSSSXSSSSSSSSSSSSSSSSSSXSSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RSSFSSSSSSSSSSSSSSSSSSSSFSSR',
      'RSSSSSSSSSSSSSSSSSSSSSSSSSSR',
      'RRRRRRRRRRRRRRRRRRRRRRRRRRRR',
    ],
    warps: [
      { x: 0, y: 10, to: 'desert', tx: 26, ty: 8 },
    ],
    npcs: [
      { id: 'oasis_traveler', x: 12, y: 9, pal: 'merchant', name: '오아시스 여행자' },
    ],
    signs: [
      { x: 13, y: 12, text: '≪오아시스≫\n사막 한가운데 맑은 물.\n핑계 대지 않고 책임지는 자만\n이 물을 마실 수 있대요.' },
    ]
  },

  // 스테이지 3 퍼즐 구역: 심판의 신전
  temple: {
    name: '심판의 신전',
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
      { x: 8, y: 13, to: 'desert', tx: 16, ty: 15 },
      { x: 9, y: 13, to: 'desert', tx: 16, ty: 15 },
    ],
    npcs: [],
    signs: []
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
      { x: 13, y: 19, to: 'castle', tx: 9, ty: 15,
        needPuzzle: 'deepfake_station',
        lockText: '그림자성의 문이 얼음으로 덮여 있다.\n출처, 날짜, 원본, 교차 확인 단서를\n모두 검증해야 녹을 것이다.',
        puzzleLockText: STAGE_PUZZLES.deepfake_station.gateText },
      { x: 14, y: 19, to: 'castle', tx: 10, ty: 15,
        needPuzzle: 'deepfake_station',
        lockText: '그림자성의 문이 얼음으로 덮여 있다.\n출처, 날짜, 원본, 교차 확인 단서를\n모두 검증해야 녹을 것이다.',
        puzzleLockText: STAGE_PUZZLES.deepfake_station.gateText },
    ],
    npcs: [
      { id: 'mittens', x: 16, y: 13, pal: 'mittens', name: '털장갑 소녀' },
    ],
    signs: [
      { x: 2, y: 12, text: '≪정지된 설원≫ 스테이지 4\n가짜 방송 신호를 확인하세요.\n출처·날짜·원본·교차 확인이 필요합니다.' },
    ]
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
      { x: 9, y: 1, to: 'serverroom', tx: 13, ty: 18, needPuzzle: 'responsibility_core',
        lockText: '벽 너머에서 지지직거리는\n기록 신호가 들린다.\n책임의 코어를 완성해야 길이 열린다.' },
    ],
    npcs: [],
    signs: []
  },

  serverroom: {
    name: '잊혀진 서버실 (후일담)',
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
      { x: 13, y: 0, to: 'library', tx: 13, ty: 18, needPuzzle: 'responsibility_core',
        lockText: '북쪽 문에 굳은 자물쇠가 있다.\n책임의 코어 기록을 완성해야\n자료실 문이 열린다.' },
      { x: 14, y: 0, to: 'library', tx: 14, ty: 18, needPuzzle: 'responsibility_core',
        lockText: '북쪽 문에 굳은 자물쇠가 있다.\n책임의 코어 기록을 완성해야\n자료실 문이 열린다.' },
    ],
    npcs: [
      { id: 'hologram1', x: 16, y: 16, pal: 'prof', name: '박사님(홀로그램)' },
    ],
    signs: [
      { x: 2, y: 12, text: '[제0연구동 — 서버실]\n…출입 기록: 마지막 접속,\n아주 오래전.' },
    ]
  },

  library: {
    name: '기억의 도서관 (후일담)',
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
      { x: 13, y: 0, to: 'mirrors', tx: 13, ty: 18, needPuzzle: 'responsibility_core',
        lockText: '책장이 길을 막고 있다.\n남은 기록을 책임 있게 정리해야\n거울 회랑으로 갈 수 있다.' },
      { x: 14, y: 0, to: 'mirrors', tx: 14, ty: 18, needPuzzle: 'responsibility_core',
        lockText: '책장이 길을 막고 있다.\n남은 기록을 책임 있게 정리해야\n거울 회랑으로 갈 수 있다.' },
    ],
    npcs: [],
    signs: [
      { x: 2, y: 11, text: '[열람 안내]\n허락 없이 가져간 기억은\n반드시 제자리에 돌려놓을 것.' },
    ]
  },

  mirrors: {
    name: '거울 회랑 (후일담)',
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
      { x: 13, y: 0, to: 'garden', tx: 13, ty: 1, needPuzzle: 'responsibility_core',
        lockText: '거울 속의 네가 고개를 젓는다.\n…아직은 지나갈 수 없다.' },
      { x: 14, y: 0, to: 'garden', tx: 14, ty: 1, needPuzzle: 'responsibility_core',
        lockText: '거울 속의 네가 고개를 젓는다.\n…아직은 지나갈 수 없다.' },
    ],
    npcs: [],
    signs: [
      { x: 2, y: 10, text: '거울에 흐릿한 글씨가 적혀 있다.\n"필터 너머의 얼굴이 아니라,\n지금의 너를 보아 줘."' },
    ]
  },

  garden: {
    name: '속삭임 정원 (후일담)',
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
      { x: 13, y: 19, to: 'core', tx: 9, ty: 13, needPuzzle: 'responsibility_core',
        lockText: '속삭임이 겹겹이 쌓여\n보이지 않는 벽이 되었다.\n…이 정원의 목소리를 먼저\n들어 주어야 한다.' },
      { x: 14, y: 19, to: 'core', tx: 9, ty: 13, needPuzzle: 'responsibility_core',
        lockText: '속삭임이 겹겹이 쌓여\n보이지 않는 벽이 되었다.\n…이 정원의 목소리를 먼저\n들어 주어야 한다.' },
    ],
    npcs: [
      { id: 'hologram2', x: 17, y: 16, pal: 'prof', name: '박사님(홀로그램)' },
    ],
    signs: [
      { x: 15, y: 11, text: '팻말에 손글씨가 남아 있다.\n"영이의 정원.\n— 우리 아이가 제일 좋아하는 곳"' },
    ]
  },

  core: {
    name: '코어 (후일담)',
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
    signs: []
  },

  // ---- 보너스: AI 미래연구소 ----
  lab: {
    name: 'AI 미래연구소 (보너스)',
    song: 'lab',
    intro: [
      '환하게 불이 켜진 둥근 연구실.\n벽면 화면에 "미래의 AI 윤리"라고\n적혀 있다.',
      '아직 교과서엔 없는 새로운 고민들을\n미리 연습해 볼 수 있는 곳이다.',
    ],
    tiles: [
      'KKKKKKKKKKKKKKKKKK',
      'KEEEEEEEEEEEEEEEEK',
      'KEYVVEEEEEEEEVVEEK',
      'KEEEEEEEEEEEEEEEEK',
      'KEEEEEEEEEEEEEEEEK',
      'KEEEEEEEEEEEEEEEEK',
      'KEEEEEEEEEEEEEEEEK',
      'KEEEEEEEEEEEEEEEEK',
      'KEEEEEEEEEEEEEEEEK',
      'KEEEEEEEE55EEEEEEK',
      'KEEEEEEEE55EEEEEEK',
      'KKKKKKKKKKKKKKKKKK',
    ],
    warps: [
      { x: 8, y: 9, to: 'village', tx: 26, ty: 9 },
      { x: 9, y: 9, to: 'village', tx: 26, ty: 9 },
      { x: 8, y: 10, to: 'village', tx: 26, ty: 9 },
      { x: 9, y: 10, to: 'village', tx: 26, ty: 9 },
    ],
    npcs: [
      { id: 'labguide', x: 2, y: 8, pal: 'guard', name: '연구원' },
    ],
    signs: [
      { x: 2, y: 2, text: '[연습 안내]\n여기서 다룬 새 주제도\n배움 카드와 리포트에 함께 남아요.' },
    ]
  },
};

// ---- NPC 대사 (게임 진행 상황에 따라 달라짐) ----
function getNpcDialog(npcId, flags) {
  switch (npcId) {
    case 'prof':
      if (!flags.talkedProf) {
        return [
          '오, 드디어 왔구나!\n나는 AI 연구소의 박사란다.',
          'AI 세상 곳곳에 윤리 오류가 퍼져\n길과 장치들이 뒤엉켜 버렸어.',
          '정답을 외우는 것보다 중요한 건\n지도 위 단서를 살피고 책임 있게 고르는 일이란다.',
          '북쪽 데이터 발자국 숲에서\n사진, 위치, 취향의 흔적을 먼저 나누어 보렴.',
          '부탁한다, 어린 수호자여!\n(Z키 또는 스페이스로 대화하고,\n화살표나 WASD로 움직일 수 있어.)',
        ];
      }
      if (completedStory(flags)) return ['다섯 윤리 조각이 모두 이어졌구나.\n이제 네 선택을 설명할 수 있는 수호자가 되었어.'];
      return [nextPuzzlePrompt(flags)];

    case 'kid':
      return ['개인정보는 이름만 뜻하는 게 아니래.\n사진, 위치, 습관도 누군가를 알아볼 단서가 될 수 있대!'];

    case 'grandma':
      return [
        '아이고, 우리 마을의 수호자님.\n모험은 자동으로 저장된단다.',
        '틀린 선택을 해도 괜찮아.\n왜 위험했는지 말로 설명할 수 있으면\n그게 진짜 배움이란다.',
        '아 참, M키를 누르면 음악을\n켜고 끌 수 있다는구나.',
      ];

    case 'guard':
      if (isStagePuzzleComplete(flags.puzzles, 'data_footprint_forest')) {
        return ['데이터 발자국 불빛이 모두 켜졌어요.\n신호탑 길과 남쪽 길이 함께 열렸습니다!'];
      }
      return ['신호탑 문은 데이터 발자국을 기다리고 있어요.\n숲의 세 단서를 먼저 분류해 주세요.'];

    case 'explorer':
      return ['이 동굴은 AI가 배우는 데이터가\n모이는 신비한 곳이에요.\n한쪽 자료만 모이면 판단도 기울어진답니다.'];

    case 'traveler':
      return ['추천은 편리하지만 같은 말만 듣게 만들 수도 있어요.\n다른 관점과 근거 자료를 함께 찾아보세요.'];

    case 'meadow_scout':
      if (isStagePuzzleComplete(flags.puzzles, 'filter_bubble_maze')) return ['추천 카드가 균형을 찾았어요!\n중앙 탑터와 남쪽 사막 길이 열렸습니다.'];
      return ['안개 습지에서 같은 의견, 다른 의견,\n근거 자료 카드를 모두 찾아 주세요.'];

    case 'windhill_hermit':
      return ['이 언덕은 바람이 세차서\n소문이 금방 퍼지는 곳이에요.\n진실은 천천히 확인하며 걸어온답니다.'];

    case 'fogswamp_frog':
      if (isStagePuzzleComplete(flags.puzzles, 'filter_bubble_maze')) return ['안개가 걷혔네요!\n다른 의견과 근거가 함께 보이기 시작했어요.'];
      return ['습지의 추천 카드를 살펴보고\n한쪽 말만 반복되지 않게 넓혀 주세요.'];

    case 'merchant':
      return ['AI 판단도 데이터 조건을 살펴야 해요.\n누가 빠졌는지 묻는 사람이 공정한 길을 엽니다.'];

    case 'desert_nomad':
      if (isStagePuzzleComplete(flags.puzzles, 'bias_court')) return ['법정 저울이 균형을 찾았어요.\n남쪽 설원 길이 열렸습니다.'];
      return ['사막 거점의 법정 기록을 살펴\n빠진 사람들의 증거를 대표성 있게 채워 주세요.'];

    case 'ruins_explorer':
      return ['폐허에는 오래된 사용 기록이 남아 있어요.\n숫자만 보지 말고 조건을 함께 읽어야 해요.'];

    case 'oasis_traveler':
      return ['오아시스 물처럼 맑은 판단을 하려면\n이유와 책임을 흐리지 않아야 해요.'];

    case 'mittens':
      if (isStagePuzzleComplete(flags.puzzles, 'deepfake_station')) return ['가짜 방송 신호가 정리됐어요.\n남쪽 그림자성 문이 열렸습니다.'];
      return ['그럴듯한 영상일수록 멈춰서 확인해요.\n출처, 날짜, 원본, 교차 확인을 모두 찾아 주세요.'];

    case 'hologram1':
      return ['지지직… 들리니, 수호자야?\n이 서버실에는 오래된 기록과 동의 문제가 남아 있단다.'];

    case 'hologram2':
      return ['깊은 정원에는 사람을 붙잡는 설계가 숨어 있단다.\n멈출 시간을 스스로 정하는 것도 책임이야.'];

    case 'labguide':
      return [
        '여기는 AI 미래연구소예요!\n아직 교과서에 다 담기지 않은\n새로운 AI 주제를 미리 연습해요.',
        '생성형 AI가 지어내는 그럴듯한 거짓,\n진짜 같은 합성 영상도\n확인하고 존중하는 태도가 필요하죠.',
      ];

    case 'yeongi_npc':
      return ['(영이가 햇살 아래 서 있다.)\n네가 남긴 선택 기록을 함께 읽고 있어.\n설명할 수 있는 선택은 오래 남아.'];
  }
  return ['…'];
}

function completedStory(flags) {
  return isStagePuzzleComplete(flags && flags.puzzles, 'responsibility_core');
}

function nextPuzzlePrompt(flags) {
  if (!isStagePuzzleComplete(flags.puzzles, 'data_footprint_forest')) return '데이터 발자국 숲에서 개인정보 단서를 먼저 나누어 보렴.';
  if (!isStagePuzzleComplete(flags.puzzles, 'filter_bubble_maze')) return '안개 습지에서 추천 카드를 넓혀 보렴.';
  if (!isStagePuzzleComplete(flags.puzzles, 'bias_court')) return '재깍사막의 법정 기록을 대표성 있게 채워 보렴.';
  if (!isStagePuzzleComplete(flags.puzzles, 'deepfake_station')) return '정지된 설원에서 가짜 방송 단서를 검증해 보렴.';
  if (!isStagePuzzleComplete(flags.puzzles, 'responsibility_core')) return '그림자성에서 책임 코어를 완성해 보렴.';
  return '다섯 윤리 조각이 모두 모였구나. 선택 기록을 리포트에서 돌아보렴.';
}

function computeEnding(ethics) {
  const ethicsPct = computeEthicsScore(ethics);
  if (ethicsPct >= 80) return 'home';
  if (ethicsPct >= 65) return 'dawn';
  if (ethicsPct >= 45) return 'farewell';
  if (ethicsPct >= 25) return 'blackbox';
  return 'silent';
}
function getStage(flags) {
  const puzzles = flags && flags.puzzles;
  if (!isStagePuzzleComplete(puzzles, 'data_footprint_forest')) return 1;
  if (!isStagePuzzleComplete(puzzles, 'filter_bubble_maze')) return 2;
  if (!isStagePuzzleComplete(puzzles, 'bias_court')) return 3;
  if (!isStagePuzzleComplete(puzzles, 'deepfake_station')) return 4;
  return 5;
}

// 현재 목표 텍스트
function getObjective(flags) {
  if (!flags.talkedProf) return '박사님과 이야기하기 (마을 왼쪽 아래)';
  if (!isStagePuzzleComplete(flags.puzzles, 'data_footprint_forest')) return '데이터 발자국 숲의 세 단서 분류하기';
  if (!isStagePuzzleComplete(flags.puzzles, 'filter_bubble_maze')) return '안개 습지의 추천 카드 다양하게 모으기';
  if (!isStagePuzzleComplete(flags.puzzles, 'bias_court')) return '재깍사막 거점의 법정 증거 균형 맞추기';
  if (!isStagePuzzleComplete(flags.puzzles, 'deepfake_station')) return '정지된 설원의 가짜 방송 검증 단서 모으기';
  if (!isStagePuzzleComplete(flags.puzzles, 'responsibility_core')) return '그림자성의 책임 코어 다섯 조각 연결하기';
  return '다섯 윤리 조각 완료 — 리포트에서 선택을 돌아보기';
}

// 현재 목표의 위치(맵/좌표). 화면의 안내 화살표가 가리킬 곳.
function getObjectiveTarget(flags) {
  if (!flags.talkedProf) return { map: 'village', x: 4, y: 12, label: '박사님' };
  if (!isStagePuzzleComplete(flags.puzzles, 'data_footprint_forest')) return { map: 'forest', x: 12, y: 5, label: '데이터 발자국' };
  if (!isStagePuzzleComplete(flags.puzzles, 'filter_bubble_maze')) return { map: 'fogswamp', x: 12, y: 4, label: '추천 카드' };
  if (!isStagePuzzleComplete(flags.puzzles, 'bias_court')) return { map: 'desert', x: 10, y: 4, label: '법정 증거' };
  if (!isStagePuzzleComplete(flags.puzzles, 'deepfake_station')) return { map: 'snow', x: 5, y: 5, label: '검증 단서' };
  if (!isStagePuzzleComplete(flags.puzzles, 'responsibility_core')) return { map: 'castle', x: 4, y: 6, label: '책임 코어' };
  return { map: 'village', x: 4, y: 12, label: '리포트 회고' };
}

// ===== 조사(살펴보기) 텍스트 =====
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
