const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

const pkg = JSON.parse(read('package.json'));
const docs = read('docs/release-verification-gate.md');
const readme = read('README.md');

assert(
  pkg.scripts && pkg.scripts['audit:lighthouse'] === 'node tools/lighthouse-audit.js',
  'package.json must expose npm run audit:lighthouse'
);
assert(
  fs.existsSync(path.join(ROOT, 'tools', 'lighthouse-audit.js')),
  'tools/lighthouse-audit.js must exist'
);
assert(
  docs.includes('npm run audit:lighthouse'),
  'release verification docs must instruct npm run audit:lighthouse'
);
assert(
  !/^\s*npx\s+lighthouse\b/m.test(docs),
  'release verification docs must not use the Lighthouse CLI path'
);
assert(
  readme.includes('npm run audit:lighthouse'),
  'README developer checks must mention npm run audit:lighthouse'
);

console.log('✔ release docs audit command checks passed');
