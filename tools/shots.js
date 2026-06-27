const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'shots');
const localBrowserPath = path.join(ROOT, '.pw-browsers');
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync(localBrowserPath)) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = localBrowserPath;
}

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (error) {
  console.error('Playwright is required for screenshots.');
  console.error('Install it with: npm install');
  process.exit(1);
}

const mimes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.md', 'text/markdown; charset=utf-8'],
]);

function createServer() {
  const server = http.createServer((req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      const rel = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
      const file = path.normalize(path.join(ROOT, rel));
      if (!file.startsWith(ROOT)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      fs.readFile(file, (error, data) => {
        if (error) {
          res.writeHead(404).end('Not found');
          return;
        }
        res.writeHead(200, { 'content-type': mimes.get(path.extname(file)) || 'application/octet-stream' });
        res.end(data);
      });
    } catch (error) {
      res.writeHead(500).end(String(error && error.message ? error.message : error));
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function setState(page, recipe) {
  await page.evaluate((next) => {
    const g = window.__game;
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const axes = ETHICS_AXES;
    const max = ETHICS_AXIS_MAX;
    function emptyFlags() {
      const ethics = Object.fromEntries(axes.map((axis) => [axis, 0]));
      const puzzles = {};
      for (const id of Object.keys(STAGE_PUZZLES)) {
        puzzles[id] = { clues: {}, attempts: [], complete: false, rewarded: false };
      }
      return { talkedProf: true, ethics, puzzles, visited: {}, trueEnding: false, correctCount: 0 };
    }
    function complete(flags, puzzleId) {
      const puzzle = STAGE_PUZZLES[puzzleId];
      const progress = flags.puzzles[puzzleId];
      for (const clue of puzzle.clues) {
        const door = puzzle.doors.find((item) => item.id === clue.correctDoor);
        progress.clues[clue.id] = clue.correctDoor;
        progress.attempts.push({
          clueId: clue.id,
          clueLabel: clue.label,
          doorId: clue.correctDoor,
          doorLabel: door ? door.label : clue.correctDoor,
          correct: true,
        });
      }
      progress.complete = true;
      progress.rewarded = true;
      flags.ethics[puzzle.axis] = Math.min(max, flags.ethics[puzzle.axis] + 3);
    }
    function addRisk(flags, puzzleId, clueId, doorId) {
      const puzzle = STAGE_PUZZLES[puzzleId];
      const clue = puzzle.clues.find((item) => item.id === clueId);
      const door = puzzle.doors.find((item) => item.id === doorId);
      flags.puzzles[puzzleId].attempts.push({
        clueId,
        clueLabel: clue ? clue.label : clueId,
        doorId,
        doorLabel: door ? door.label : doorId,
        correct: false,
      });
    }
    const fullFlags = emptyFlags();
    for (const id of Object.keys(STAGE_PUZZLES)) complete(fullFlags, id);
    fullFlags.trueEnding = true;
    fullFlags.endingId = 'home';
    fullFlags.correctCount = 19;
    const partialFlags = emptyFlags();
    complete(partialFlags, 'data_footprint_forest');
    addRisk(partialFlags, 'filter_bubble_maze', 'opposing_comment', 'same_view');
    partialFlags.puzzles.filter_bubble_maze.clues.class_chat_same = 'same_view';
    const flags = next.flags === 'full' ? clone(fullFlags) : clone(partialFlags);
    g.flags = flags;
    g.currentSlot = 0;
    g.playerName = '도도';
    localStorage.setItem('ai-ethics-adventure-slot-0', JSON.stringify({
      v: 2,
      name: '도도',
      map: next.map || 'forest',
      x: next.x || 13,
      y: next.y || 5,
      flags,
      updatedAt: Date.now(),
    }));
    localStorage.setItem('ai-ethics-adventure-slot-1', JSON.stringify({
      v: 2,
      name: '하늘',
      map: 'fogswamp',
      x: 17,
      y: 9,
      flags: partialFlags,
      updatedAt: Date.now(),
    }));
    localStorage.setItem('ai-ethics-adventure-endings', JSON.stringify({ home: true, dawn: true }));
    localStorage.setItem('ai-ethics-adventure-stats-0', JSON.stringify({
      data_footprint_forest: { correct: 3, total: 3 },
      filter_bubble_maze: { correct: 2, total: 3 },
      bias_court: { correct: 3, total: 4 },
      deepfake_station: { correct: 4, total: 4 },
      responsibility_core: { correct: 4, total: 5 },
    }));
    localStorage.setItem('ai-ethics-adventure-meta-0', JSON.stringify({
      challengeRuns: 3,
      challengeBest: 9,
      challengeBestTotal: 10,
      streak: 5,
      bestStreak: 7,
    }));
    g.mode = next.mode;
    g.map = next.map || g.map;
    g.time = next.time || 24;
    g.player.x = next.x || g.player.x;
    g.player.y = next.y || g.player.y;
    g.player.px = g.player.x * 48;
    g.player.py = g.player.y * 48;
    g.player.dir = next.dir || g.player.dir || 'down';
    g.puzzle = next.puzzle || null;
    g.dialog = next.dialog || null;
    g.journal = next.journal || g.journal;
    g.report = next.report || g.report;
    g.dashboard = next.dashboard || g.dashboard;
    g.classmode = next.classmode || g.classmode;
    if (next.challenge) {
      const q = Object.assign({}, QUIZZES.data_footprint_forest[0], {
        _topic: 'data_footprint_forest',
        _qid: 'data_footprint_forest#shot',
      });
      if (!next.challenge.questions || next.challenge.questions.length === 0) {
        next.challenge.questions = Array.from({ length: 10 }, () => q);
      }
      if (!next.challenge.topics || next.challenge.topics.length === 0) {
        next.challenge.topics = Object.keys(QUIZZES).map((key) => ({
          key,
          label: STAGE_PUZZLES[key].title,
          n: QUIZZES[key].length,
        }));
      }
      if (!next.challenge.choiceOrder) next.challenge.choiceOrder = q.a.map((_, i) => i);
    }
    g.challenge = next.challenge || g.challenge;
    g.review = next.review || g.review;
    g.cards = next.cards || g.cards;
    g.awards = next.awards || g.awards;
    g.helpRet = next.helpRet || g.helpRet;
    g.cosmetics = next.cosmetics || g.cosmetics;
    g.backup = next.backup || g.backup;
    g.quizedit = next.quizedit || g.quizedit;
    g.cert = next.cert || g.cert;
    g.hof = next.hof || g.hof;
    g.endingType = next.endingType || g.endingType;
    g.endingT = next.endingT || g.endingT;
    g.titleScreen = next.titleScreen || g.titleScreen;
    g.slotCursor = next.slotCursor || g.slotCursor;
  }, recipe);
  await page.waitForTimeout(80);
}

function challengeState(phase) {
  return {
    ret: 'title',
    slot: 0,
    phase,
    topics: [],
    sel: 0,
    questions: [],
    idx: phase === 'result' ? 10 : 2,
    cursor: 1,
    choiceOrder: [0, 1, 2],
    score: phase === 'result' ? 7 : 2,
    feedback: phase === 'feedback'
      ? {
        correct: false,
        why: '친구 얼굴과 이름표가 함께 있으면 먼저 동의를 확인해야 해요.',
        reflectionPrompt: '생각 질문: 다음에는 어떤 단서를 먼저 볼까?',
        combo: 0,
      }
      : null,
    combo: 0,
    bestCombo: 3,
  };
}

async function capture(page, name) {
  const errors = await page.evaluate(() => window.__shotErrors || []);
  if (errors.length) throw new Error(`Runtime error before ${name}: ${errors.join('\n')}`);
  await page.locator('#game').screenshot({ path: path.join(OUT, name) });
  console.log('  saved shots/' + name);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const file of fs.readdirSync(OUT)) {
    if (file.endsWith('.png')) fs.unlinkSync(path.join(OUT, file));
  }

  const server = await createServer();
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}/`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 720, height: 528 }, deviceScaleFactor: 1 });
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        page.evaluate((text) => {
          window.__shotErrors = window.__shotErrors || [];
          window.__shotErrors.push(text);
        }, msg.text()).catch(() => {});
      }
    });
    page.on('pageerror', (error) => {
      page.evaluate((text) => {
        window.__shotErrors = window.__shotErrors || [];
        window.__shotErrors.push(text);
      }, error.message).catch(() => {});
    });
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.__game && !!window.__test);
    console.log('스크린샷 생성:');

    await setState(page, { mode: 'title', titleScreen: 'slots', flags: 'partial', time: 40 });
    await capture(page, '01-title.png');

    await setState(page, { mode: 'world', map: 'village', x: 13, y: 16, dir: 'up', flags: 'partial' });
    await capture(page, '02-village-map.png');

    await setState(page, {
      mode: 'dialog',
      map: 'village',
      x: 5,
      y: 12,
      dir: 'left',
      flags: 'partial',
      dialog: {
        lines: ['AI 윤리 지도는 살펴보는 곳이야.', '단서를 들고 알맞은 윤리 발판으로 가 보자.'],
        idx: 0,
        chars: 999,
        speaker: '안내자',
        onEnd: null,
      },
    });
    await capture(page, '03-guide-dialog.png');

    await setState(page, { mode: 'world', map: 'forest', x: 14, y: 8, dir: 'right', flags: 'partial' });
    await capture(page, '04-puzzle-clue-map.png');

    await setState(page, {
      mode: 'puzzle',
      map: 'forest',
      x: 14,
      y: 8,
      dir: 'right',
      flags: 'partial',
      puzzle: { puzzleId: 'data_footprint_forest', clueId: 'home_location', carrying: true, ret: 'world' },
    });
    await capture(page, '05-puzzle-choice-pads.png');

    await setState(page, {
      mode: 'dialog',
      map: 'forest',
      flags: 'partial',
      dialog: {
        lines: ['집 위치는 안전과 바로 연결된다.', '생각 질문: 이 정보가 퍼지면 누가 위험해질까?'],
        idx: 0,
        chars: 999,
        speaker: '데이터 발자국',
        onEnd: null,
      },
    });
    await capture(page, '06-puzzle-feedback.png');

    await setState(page, { mode: 'world', map: 'forest', x: 14, y: 8, dir: 'right', flags: 'full' });
    await capture(page, '07-privacy-map-effect.png');

    await setState(page, {
      mode: 'world',
      map: 'fogswamp',
      x: 17,
      y: 9,
      dir: 'up',
      flags: 'partial',
      puzzle: { puzzleId: 'filter_bubble_maze', clueId: 'evidence_report', carrying: true, ret: 'world' },
      time: 42,
    });
    await capture(page, '08-perspective-map-effect.png');

    const worldShots = [
      ['09-fairness-court.png', 'desert', 14, 8],
      ['10-verification-station.png', 'snow', 13, 8],
      ['11-responsibility-core.png', 'castle', 10, 12],
    ];
    for (const [name, map, x, y] of worldShots) {
      await setState(page, { mode: 'world', map, x, y, dir: 'up', flags: 'full' });
      await capture(page, name);
    }

    await setState(page, { mode: 'journal', flags: 'full', journal: { ret: 'world', slot: 0, scroll: 0, toast: 0 } });
    await capture(page, '12-journal.png');

    await setState(page, { mode: 'report', flags: 'full', report: { ret: 'title', slot: 0, toast: 0 } });
    await capture(page, '13-student-report.png');

    await setState(page, { mode: 'dashboard', flags: 'full', dashboard: { ret: 'title', cursor: 0, toast: 0 } });
    await capture(page, '14-teacher-dashboard.png');

    await setState(page, { mode: 'classmode', flags: 'full', classmode: { ret: 'world', sel: 3, confirm: false, toast: 0 } });
    await capture(page, '15-classmode.png');

    await setState(page, { mode: 'challenge', flags: 'full', challenge: challengeState('quiz') });
    await capture(page, '16-free-quiz.png');

    await setState(page, { mode: 'challenge', flags: 'full', challenge: challengeState('feedback') });
    await capture(page, '17-quiz-reflection.png');

    await setState(page, { mode: 'challenge', flags: 'full', challenge: challengeState('result') });
    await capture(page, '18-quiz-next-step.png');

    await setState(page, { mode: 'review', flags: 'full', review: { cursor: 0, ret: 'world', slot: 0, phase: 'list', ids: [], qCursor: 0, choiceOrder: null, feedback: null } });
    await capture(page, '19-review-note.png');

    const modeShots = [
      ['20-learning-cards.png', 'cards', { ret: 'title', slot: 0, scroll: 0 }],
      ['21-awards.png', 'awards', { ret: 'world', slot: 0, scroll: 0 }],
      ['22-help.png', 'help', null],
      ['23-cosmetics.png', 'cosmetics', { ret: 'world', slot: 0, col: 1, rowTitle: 1, rowTheme: 2, toast: 0 }],
      ['24-backup.png', 'backup', { ret: 'world', cursor: 1, toast: 0 }],
      ['25-quiz-editor.png', 'quizedit', { ret: 'title', cursor: 0, toast: 0 }],
      ['26-certificate.png', 'cert', { ret: 'title', slot: 0, toast: 0 }],
      ['27-hall-of-fame.png', 'hof', { ret: 'title', cat: 0 }],
    ];
    for (const [name, mode, state] of modeShots) {
      await setState(page, { mode, flags: 'full', [mode]: state });
      await capture(page, name);
    }

    await setState(page, {
      mode: 'dialog',
      map: 'castle',
      flags: 'full',
      dialog: {
        lines: [
          '[마지막 회고]',
          '다섯 윤리 조각이 하나의 코어로 이어졌다.',
          'AI가 도와줘도 마지막 확인과 책임은 사람에게 남아 있다.',
          '오늘의 선택은 수업 리포트에서 다시 이야기할 수 있다.',
        ],
        idx: 0,
        chars: 999,
        speaker: '책임의 코어',
        onEnd: null,
      },
    });
    await capture(page, '28-ending-reflection.png');

    await setState(page, { mode: 'report', flags: 'partial', report: { ret: 'title', slot: 0, toast: 0 } });
    await capture(page, '29-choice-ledger-report.png');

    await setState(page, {
      mode: 'puzzle',
      map: 'castle',
      x: 10,
      y: 13,
      dir: 'up',
      flags: 'full',
      puzzle: { puzzleId: 'responsibility_core', clueId: 'responsibility_core', carrying: true, ret: 'world' },
    });
    await capture(page, '30-final-puzzle-map.png');

    console.log('완료. shots/ 폴더에 30장 생성.');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
