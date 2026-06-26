const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const zipPath = path.join(root, 'ai-ethics-adventure-offline.zip');
const required = [
  'index.html',
  'sw.js',
  'manifest.webmanifest',
  'src/game.js',
  'src/data.js',
  'src/audio.js',
  'src/sprites.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'docs/교사용-안내서.md',
  'README.md',
];
const forbiddenPrefixes = ['.git/', 'node_modules/', 'tools/'];

function fail(message) {
  console.error('✘ ' + message);
  process.exit(1);
}

function zipEntries(buffer) {
  const min = Math.max(0, buffer.length - 0xffff - 22);
  let eocd = -1;
  for (let i = buffer.length - 22; i >= min; i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) fail('ZIP end record not found');
  const count = buffer.readUInt16LE(eocd + 10);
  const centralOffset = buffer.readUInt32LE(eocd + 16);
  const names = [];
  let ptr = centralOffset;
  for (let i = 0; i < count; i++) {
    if (buffer.readUInt32LE(ptr) !== 0x02014b50) fail('ZIP central directory is corrupt');
    const flags = buffer.readUInt16LE(ptr + 8);
    const nameLength = buffer.readUInt16LE(ptr + 28);
    const extraLength = buffer.readUInt16LE(ptr + 30);
    const commentLength = buffer.readUInt16LE(ptr + 32);
    if ((flags & 0x0800) === 0) fail('ZIP entry is missing UTF-8 name flag');
    const name = buffer.subarray(ptr + 46, ptr + 46 + nameLength).toString('utf8');
    names.push(name);
    ptr += 46 + nameLength + extraLength + commentLength;
  }
  return names;
}

function serviceWorkerAssets() {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const assets = [];
  const re = /['"]\.\/([^'"]*)['"]/g;
  let match;
  while ((match = re.exec(sw))) {
    if (!match[1]) continue;
    assets.push(match[1]);
  }
  return assets;
}

if (!fs.existsSync(zipPath)) fail('ai-ethics-adventure-offline.zip does not exist');

const names = zipEntries(fs.readFileSync(zipPath));
const set = new Set(names);

for (const file of required) {
  if (!set.has(file)) fail(`required file missing from ZIP: ${file}`);
}

for (const asset of serviceWorkerAssets()) {
  if (!set.has(asset)) fail(`service worker asset missing from ZIP: ${asset}`);
}

for (const name of names) {
  if (forbiddenPrefixes.some((prefix) => name.startsWith(prefix))) {
    fail(`development-only path included in ZIP: ${name}`);
  }
}

console.log(`✔ ZIP 내용 검사 통과 (${names.length} files)`);
