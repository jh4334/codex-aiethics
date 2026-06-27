const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const AUDIT_DIR = path.join(ROOT, 'reports', 'audits');
const HOST = '127.0.0.1';
const mimes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.md', 'text/markdown; charset=utf-8'],
]);

function chromeCandidates() {
  return [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);
}

function findChrome() {
  return chromeCandidates().find((candidate) => fs.existsSync(candidate)) || '';
}

function createServer() {
  const server = http.createServer((req, res) => {
    try {
      const url = new URL(req.url || '/', `http://${HOST}`);
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
    server.listen(0, HOST, () => resolve(server));
  });
}

async function loadAuditors() {
  try {
    const lighthouseMod = await import('lighthouse');
    const chromeLauncher = await import('chrome-launcher');
    return { lighthouse: lighthouseMod.default, chromeLauncher };
  } catch (error) {
    console.error('Lighthouse Node API packages are required.');
    console.error('Install temporarily with: npm install --no-save lighthouse chrome-launcher');
    process.exit(1);
  }
}

function scoreLine(lhr) {
  const categories = lhr.categories || {};
  const score = (key) => Math.round((categories[key] && categories[key].score || 0) * 100);
  return `performance ${score('performance')} / accessibility ${score('accessibility')} / best-practices ${score('best-practices')} / SEO ${score('seo')}`;
}

async function runAudit(lighthouse, chrome, url, preset, output) {
  const flags = { port: chrome.port, output: 'json', logLevel: 'error' };
  if (preset) flags.preset = preset;
  const result = await lighthouse(url, flags);
  fs.writeFileSync(output, result.report);
  console.log(`${path.relative(ROOT, output)}: ${scoreLine(result.lhr)}`);
}

async function main() {
  const chromePath = findChrome();
  if (!chromePath) {
    console.error('Chrome executable not found. Install Google Chrome or set CHROME_PATH to a Chrome/Chromium executable.');
    process.exit(1);
  }

  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  const { lighthouse, chromeLauncher } = await loadAuditors();
  const server = await createServer();
  const port = server.address().port;
  const url = `http://${HOST}:${port}/`;
  let chrome;
  try {
    chrome = await chromeLauncher.launch({
      chromePath,
      chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
    });
    await runAudit(lighthouse, chrome, url, '', path.join(AUDIT_DIR, 'lighthouse-mobile.json'));
    await runAudit(lighthouse, chrome, url, 'desktop', path.join(AUDIT_DIR, 'lighthouse-desktop.json'));
  } finally {
    if (chrome) await chrome.kill();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
