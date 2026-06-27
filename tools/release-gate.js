const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUDIT_DIR = path.join(ROOT, 'reports', 'audits');
const REQUIRED = {
  actions: path.join(AUDIT_DIR, 'github-actions-run.txt'),
  deploy: path.join(AUDIT_DIR, 'deploy-url.txt'),
  device: path.join(AUDIT_DIR, 'device-qa.md'),
  screenReader: path.join(AUDIT_DIR, 'screen-reader-check.md'),
  mobileLighthouse: path.join(AUDIT_DIR, 'lighthouse-mobile.json'),
  desktopLighthouse: path.join(AUDIT_DIR, 'lighthouse-desktop.json'),
};
const MIN_SCORE = {
  performance: 0.8,
  accessibility: 0.9,
  'best-practices': 0.85,
};

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function exists(label, file, errors) {
  if (!fs.existsSync(file)) {
    errors.push(`${label}: 증거 파일 없음 (${path.relative(ROOT, file)})`);
    return false;
  }
  return true;
}

function checkText(label, file, pattern, hint, errors) {
  if (!exists(label, file, errors)) return;
  const text = read(file);
  if (!pattern.test(text)) errors.push(`${label}: ${hint}`);
}

function filledField(text, label) {
  const re = new RegExp(`^${label}:[ \\t]*(.*)$`, 'mi');
  const match = text.match(re);
  return match ? match[1].trim() : '';
}

function isPlaceholderUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch (err) {
    return true;
  }
  const host = url.hostname.toLowerCase();
  return host === 'example.com' || host === 'example.org' || host === 'example.net' || host.startsWith('example.');
}

function checkDeployUrl(label, file, errors) {
  if (!exists(label, file, errors)) return;
  const text = read(file);
  const urls = text.match(/https:\/\/\S+/gi) || [];
  if (!urls.length) {
    errors.push(`${label}: 실제 HTTPS 배포 URL 필요`);
    return;
  }
  if (urls.every(isPlaceholderUrl)) errors.push(`${label}: 예시 URL이 아닌 실제 배포 URL 필요`);
}

function checkManualQa(spec) {
  const { label, file, passPattern, passHint, fields, errors } = spec;
  if (!exists(label, file, errors)) return;
  const text = read(file);
  if (!passPattern.test(text)) errors.push(`${label}: ${passHint}`);
  for (const field of fields) {
    if (!filledField(text, field)) errors.push(`${label}: ${field} 필드 작성 필요`);
  }
}

function scoreFrom(lhr, key) {
  const category = lhr && lhr.categories && lhr.categories[key];
  return category && typeof category.score === 'number' ? category.score : null;
}

function checkLighthouse(label, file, errors) {
  if (!exists(label, file, errors)) return;
  let lhr;
  try {
    lhr = JSON.parse(read(file));
  } catch (err) {
    errors.push(`${label}: JSON 파싱 실패`);
    return;
  }
  for (const [key, min] of Object.entries(MIN_SCORE)) {
    const actual = scoreFrom(lhr, key);
    if (actual == null) {
      errors.push(`${label}: ${key} 점수 없음`);
    } else if (actual < min) {
      errors.push(`${label}: ${key} ${Math.round(actual * 100)}점, 기준 ${Math.round(min * 100)}점 미만`);
    }
  }
}

const errors = [];
checkText('GitHub Actions', REQUIRED.actions, /conclusion:\s*success|status:\s*success|성공|통과/i, '원격 워크플로 성공 기록 필요', errors);
checkDeployUrl('배포 URL', REQUIRED.deploy, errors);
checkManualQa({
  label: '학교 기기 QA',
  file: REQUIRED.device,
  passPattern: /태블릿:\s*통과[\s\S]*노트북:\s*통과|tablet:\s*pass[\s\S]*laptop:\s*pass/i,
  passHint: '태블릿과 노트북 수동 QA 통과 기록 필요',
  fields: ['날짜', '확인자', '기기/브라우저'],
  errors,
});
checkManualQa({
  label: '스크린리더 점검',
  file: REQUIRED.screenReader,
  passPattern: /결과:\s*통과|result:\s*pass/i,
  passHint: '최소 1개 스크린리더 통과 기록 필요',
  fields: ['도구', '날짜', '확인자'],
  errors,
});
checkLighthouse('Lighthouse 모바일', REQUIRED.mobileLighthouse, errors);
checkLighthouse('Lighthouse 데스크톱', REQUIRED.desktopLighthouse, errors);

if (errors.length) {
  console.error('출시 게이트 실패');
  for (const err of errors) console.error(' - ' + err);
  process.exit(1);
}

console.log('출시 게이트 통과');
