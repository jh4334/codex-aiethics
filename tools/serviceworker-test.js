const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
const failures = [];

function check(label, ok) {
  if (ok) {
    console.log(`  ✔ ${label}`);
  } else {
    failures.push(label);
    console.error(`  ✘ ${label}`);
  }
}

const fetchStart = source.indexOf("self.addEventListener('fetch'");
const fetchBody = fetchStart >= 0 ? source.slice(fetchStart) : '';
const firstFetch = fetchBody.indexOf('fetch(e.request)');
const firstCacheMatch = fetchBody.indexOf('caches.match(e.request)');

check('cache version is bumped for stale browser caches', /ai-ethics-adventure-v22/.test(source));
check('has network-preferred request classifier', /function shouldPreferNetwork/.test(source));
check('navigation requests prefer network', /request\.mode === 'navigate'/.test(source));
check('source scripts prefer network', source.includes('/src/') && source.includes('.js'));
check('fetch handler tries network before cache fallback', firstFetch >= 0 && firstCacheMatch >= 0 && firstFetch < firstCacheMatch);
check('client reload is limited to stale app caches', /staleCaches\.length > 0/.test(source) && /startsWith\(CACHE_PREFIX\)/.test(source));
check('stale app caches are deleted during install', /self\.addEventListener\('install'/.test(source) && /caches\.delete/.test(source));

if (failures.length) {
  console.error(`\nservice worker tests failed (${failures.length})`);
  process.exit(1);
}

console.log('\n✔ service worker cache tests passed');
