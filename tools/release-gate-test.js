const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

function minimalLighthouse(score) {
  return JSON.stringify({
    categories: {
      performance: { score },
      accessibility: { score },
      'best-practices': { score },
    },
  });
}

function runGateWithEvidence(evidence) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'release-gate-'));
  const toolsDir = path.join(tmp, 'tools');
  const auditDir = path.join(tmp, 'reports', 'audits');
  fs.mkdirSync(toolsDir, { recursive: true });
  fs.mkdirSync(auditDir, { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'tools', 'release-gate.js'), path.join(toolsDir, 'release-gate.js'));
  for (const [name, text] of Object.entries(evidence)) write(path.join(auditDir, name), text);
  return spawnSync(process.execPath, [path.join(toolsDir, 'release-gate.js')], { encoding: 'utf8' });
}

function check(name, cond, details) {
  if (cond) {
    console.log('  ✔ ' + name);
    return;
  }
  console.error('  ✘ ' + name);
  if (details) console.error(details);
  process.exit(1);
}

const validLighthouse = minimalLighthouse(1);
const placeholderRun = runGateWithEvidence({
  'github-actions-run.txt': 'status: success\n',
  'deploy-url.txt': 'https://example.github.io/codex-aiethics/\n',
  'device-qa.md': '# 학교 기기 QA\n\n태블릿: 통과\n노트북: 통과\n날짜: 2026-06-27\n확인자:\n기기/브라우저:\n확인 항목: 시작, 이동, 지도 퍼즐, 리포트, 오프라인 재접속\n이슈:\n',
  'screen-reader-check.md': '# 스크린리더 점검\n\n도구: VoiceOver 또는 NVDA\n결과: 통과\n날짜: 2026-06-27\n확인자:\n확인 항목: 시작 버튼, 메뉴 버튼, 터치 컨트롤, 리포트 내보내기, 큰 글씨/읽어주기 설정\n이슈:\n',
  'lighthouse-mobile.json': validLighthouse,
  'lighthouse-desktop.json': validLighthouse,
});

check(
  '출시 게이트가 예시 URL과 빈 수동 QA 템플릿을 거부',
  placeholderRun.status !== 0 &&
    /배포 URL/.test(placeholderRun.stderr) &&
    /학교 기기 QA/.test(placeholderRun.stderr) &&
    /스크린리더 점검/.test(placeholderRun.stderr),
  placeholderRun.stdout + placeholderRun.stderr
);

console.log('\n✔ release-gate regression tests passed');
