const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scopedFiles = ['src/game.js', 'src/data.js', token(['in', token(['de', 'x']), '.html'])];

function collectFiles(dir, predicate) {
  const result = [];
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectFiles(relative, predicate));
    } else if (predicate(relative)) {
      result.push(relative);
    }
  }
  return result;
}

function token(parts) {
  return parts.join('');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const forbidden = [
  token(['MON', 'STERS']),
  token(['BO', 'SS_', 'ATT', 'ACKS']),
  token(['need', 'Bo', 'ss']),
  token(['need', 'AllDefeated']),
  token(['mon', 'ster', 'At']),
  token(['sta', 'rtBa', 'ttle']),
  token(['dra', 'wBa', 'ttle']),
  token(['dra', 'wDo', 'dge']),
  token(['mer', 'cy']),
];

const forbiddenKorean = [
  '\uBAAC\uC2A4\uD130',
  '\uBC30\uD2C0',
  '\uBCF4\uC2A4\uC804',
  '\uD68C\uD53C',
];

const structuralPatterns = [
  {
    label: token(['MAPS.', 'mon', 'sters-field']),
    regex: new RegExp('\\\\b' + token(['mon', 'sters']) + '\\\\s*:'),
  },
  {
    label: token(['MAPS.', 'mon', 'sters-access']),
    regex: new RegExp('\\\\.' + token(['mon', 'sters']) + '\\\\b'),
  },
];

const forbiddenEnglishPatterns = [
  token(['mon', 'ster']),
  token(['ba', 'ttle']),
  token(['bo', 'ss']),
  token(['do', 'dge']),
  token(['mer', 'cy']),
  token(['de', 'x']),
].map((value) => ({
  label: value,
  regex: new RegExp(`\\b${escapeRegExp(value)}\\b`, 'i'),
}));
const productReferencePatterns = [
  token(['\uC5B8', '\uB354', '\uD14C', '\uC77C']),
  token(['Under', 'tale']),
].map((value) => ({
  label: 'external product reference',
  regex: new RegExp(escapeRegExp(value), 'i'),
}));

const contentFiles = [
  ...scopedFiles,
  'README.md',
  ...collectFiles('tools', (file) => /\.(js|html)$/i.test(file) && file !== 'tools/puzzle-only-invariant.js'),
  ...collectFiles('docs', (file) => file.endsWith('.md')),
];
const screenshotNames = collectFiles('shots', (file) => /\.(png|jpe?g|webp)$/i.test(file));

const failures = [];
for (const file of contentFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  for (const value of forbidden.concat(forbiddenKorean)) {
    const regex = new RegExp(escapeRegExp(value));
    if (regex.test(source)) failures.push(`${file}: ${value}`);
  }
  for (const pattern of productReferencePatterns) {
    if (pattern.regex.test(source)) failures.push(`${file}: ${pattern.label}`);
  }
  for (const pattern of forbiddenEnglishPatterns) {
    if (pattern.regex.test(source)) failures.push(`${file}: ${pattern.label}`);
  }
  for (const pattern of structuralPatterns) {
    if (pattern.regex.test(source)) failures.push(`${file}: ${pattern.label}`);
  }
}

for (const file of screenshotNames) {
  for (const pattern of forbiddenEnglishPatterns) {
    if (pattern.regex.test(file)) failures.push(`${file}: ${pattern.label}`);
  }
  for (const value of forbiddenKorean) {
    if (file.includes(value)) failures.push(`${file}: ${value}`);
  }
}

if (failures.length) {
  console.error('Puzzle-only invariant failed. Legacy active-runtime tokens remain:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Puzzle-only invariant passed for ${contentFiles.length} content files and ${screenshotNames.length} screenshots`);
