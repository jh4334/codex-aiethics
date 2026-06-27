const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = {
  window: undefined,
  document: { createElement: () => ({ getContext: () => null }) },
  console, Math, Set, Map, JSON, Object,
};
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['src/sprites.js', 'src/audio.js', 'src/data.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
}
const { STAGE_PUZZLES, ETHICS_LABELS } = vm.runInContext('({ STAGE_PUZZLES, ETHICS_LABELS })', ctx);

function oneLine(s) { return String(s).replace(/\s+/g, ' ').trim(); }

const entries = Object.entries(STAGE_PUZZLES).sort((a, b) => a[1].stage - b[1].stage);
const totalClues = entries.reduce((sum, [, puzzle]) => sum + puzzle.clues.length, 0);
const out = [];
out.push('# 주제별 문제 목록');
out.push('');
out.push('> 이 문서는 `node tools/quizlist.js`로 **자동 생성**됩니다. 직접 고치지 말고,');
out.push('> 퍼즐 단서나 선택지를 바꾸려면 `src/data.js`의 `STAGE_PUZZLES`를 수정한 뒤 다시 생성해 주세요.');
out.push('');
out.push(`- 스테이지 퍼즐 수: **${entries.length}개**`);
out.push(`- 전체 퍼즐 단서 수: **${totalClues}개**`);
out.push('');
out.push('---');
out.push('');

for (const [id, puzzle] of entries) {
  out.push(`## ${puzzle.stage}. ${puzzle.title}  \`${id}\``);
  out.push('');
  out.push(`- 윤리 축: **${ETHICS_LABELS[puzzle.axis] || puzzle.axis}**`);
  out.push(`- 선택지: ${puzzle.doors.map((door) => door.label).join(' · ')}`);
  out.push('');
  puzzle.clues.forEach((clue, i) => {
    const answer = puzzle.doors.find((door) => door.id === clue.correctDoor);
    out.push(`**${i + 1}. ${oneLine(clue.label)}**`);
    out.push('');
    out.push(`- 단서: ${oneLine(clue.text)}`);
    out.push(`- 바른 선택: ${answer ? answer.label : clue.correctDoor}`);
    out.push(`- 피드백: ${oneLine(clue.correctText)}`);
    out.push('');
  });
  out.push('---');
  out.push('');
}

const dir = path.join(__dirname, '..', 'docs');
fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, '주제별-문제-목록.md');
fs.writeFileSync(file, out.join('\n'), 'utf8');
console.log(`✔ 생성됨: docs/주제별-문제-목록.md  (${entries.length}개 퍼즐, ${totalClues}개 단서)`);
