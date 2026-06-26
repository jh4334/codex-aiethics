const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'ai-ethics-adventure-offline.zip');
const inputs = [
  'index.html',
  'sw.js',
  'manifest.webmanifest',
  '.nojekyll',
  'src',
  'icons',
  'docs',
  'README.md',
];

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[i] = c >>> 0;
}

function crc32(buffer) {
  let c = 0xffffffff;
  for (const b of buffer) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosDate, dosTime };
}

function collect(input, files) {
  const absolute = path.join(root, input);
  if (!fs.existsSync(absolute)) return;
  const stat = fs.statSync(absolute);
  if (stat.isDirectory()) {
    for (const child of fs.readdirSync(absolute).sort()) {
      if (child.startsWith('.')) continue;
      collect(path.join(input, child), files);
    }
    return;
  }
  if (!stat.isFile()) return;
  files.push({
    absolute,
    relative: input.split(path.sep).join('/'),
    stat,
  });
}

function writeLocalHeader(name, entry) {
  const nameBuffer = Buffer.from(name, 'utf8');
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0800, 6);
  header.writeUInt16LE(8, 8);
  header.writeUInt16LE(entry.dosTime, 10);
  header.writeUInt16LE(entry.dosDate, 12);
  header.writeUInt32LE(entry.crc, 14);
  header.writeUInt32LE(entry.compressed.length, 18);
  header.writeUInt32LE(entry.raw.length, 22);
  header.writeUInt16LE(nameBuffer.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, nameBuffer]);
}

function writeCentralHeader(name, entry) {
  const nameBuffer = Buffer.from(name, 'utf8');
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x0800, 8);
  header.writeUInt16LE(8, 10);
  header.writeUInt16LE(entry.dosTime, 12);
  header.writeUInt16LE(entry.dosDate, 14);
  header.writeUInt32LE(entry.crc, 16);
  header.writeUInt32LE(entry.compressed.length, 20);
  header.writeUInt32LE(entry.raw.length, 24);
  header.writeUInt16LE(nameBuffer.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(entry.offset, 42);
  return Buffer.concat([header, nameBuffer]);
}

function writeEndRecord(fileCount, centralSize, centralOffset) {
  const header = Buffer.alloc(22);
  header.writeUInt32LE(0x06054b50, 0);
  header.writeUInt16LE(0, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(fileCount, 8);
  header.writeUInt16LE(fileCount, 10);
  header.writeUInt32LE(centralSize, 12);
  header.writeUInt32LE(centralOffset, 16);
  header.writeUInt16LE(0, 20);
  return header;
}

const files = [];
for (const input of inputs) collect(input, files);
files.sort((a, b) => a.relative.localeCompare(b.relative));

const chunks = [];
const entries = [];
let offset = 0;
for (const file of files) {
  const raw = fs.readFileSync(file.absolute);
  const compressed = zlib.deflateRawSync(raw, { level: 9 });
  const { dosDate, dosTime } = dosDateTime(file.stat.mtime);
  const entry = {
    raw,
    compressed,
    crc: crc32(raw),
    dosDate,
    dosTime,
    offset,
  };
  const local = writeLocalHeader(file.relative, entry);
  chunks.push(local, compressed);
  offset += local.length + compressed.length;
  entries.push({ name: file.relative, entry });
}

const centralOffset = offset;
const centralChunks = entries.map(({ name, entry }) => writeCentralHeader(name, entry));
const centralSize = centralChunks.reduce((sum, chunk) => sum + chunk.length, 0);
const endRecord = writeEndRecord(entries.length, centralSize, centralOffset);

fs.writeFileSync(output, Buffer.concat([...chunks, ...centralChunks, endRecord]));
console.log(`✔ ai-ethics-adventure-offline.zip 생성 (${entries.length} files)`);
