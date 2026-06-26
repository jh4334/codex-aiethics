const fs = require('fs');
const http = require('http');
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (error) {
  console.error('Playwright is required for browser smoke tests.');
  console.error('Install it with: npm install --no-save playwright && npx playwright install chromium');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const mimes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.md', 'text/markdown; charset=utf-8'],
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createServer() {
  const server = http.createServer((req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      const rel = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
      const file = path.normalize(path.join(root, rel));
      if (!file.startsWith(root)) {
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

async function expectMode(page, mode) {
  await page.waitForFunction((expected) => window.__game && window.__game.mode === expected, mode);
}

async function tapKey(page, key) {
  await page.keyboard.down(key);
  await page.waitForTimeout(45);
  await page.keyboard.up(key);
  await page.waitForTimeout(90);
}

async function startAdventure(page) {
  await tapKey(page, 'KeyZ');
  await page.waitForFunction(() => getComputedStyle(document.getElementById('name-overlay')).display === 'flex');
  await page.click('#name-go');
  for (let i = 0; i < 80; i++) {
    await tapKey(page, 'KeyZ');
    if (await page.evaluate(() => window.__game && window.__game.mode === 'world')) return;
  }
  throw new Error('New adventure did not reach world mode');
}

async function canvasHasPaint(page) {
  return page.evaluate(() => {
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let nonBlack = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] || data[i + 1] || data[i + 2]) nonBlack += 1;
    }
    return nonBlack / (data.length / 4);
  });
}

async function runDesktopFlow(browser, baseUrl, errors) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push('console: ' + msg.text());
  });
  page.on('pageerror', (error) => errors.push('pageerror: ' + error.message));

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__game);
  await expectMode(page, 'title');
  assert(await page.$eval('#boot-error', (el) => getComputedStyle(el).display) === 'none', 'boot error overlay is visible');
  assert((await canvasHasPaint(page)) > 0.05, 'title canvas appears blank');
  await page.waitForFunction(() => document.getElementById('a11y-status').textContent.includes('타이틀 화면'));

  await startAdventure(page);
  await expectMode(page, 'world');
  await page.waitForFunction(() => document.getElementById('a11y-status').textContent.includes('탐험 화면'));

  await tapKey(page, 'KeyX');
  await expectMode(page, 'pause');
  await page.waitForFunction(() => document.getElementById('a11y-status').textContent.includes('메뉴 화면'));

  await tapKey(page, 'KeyX');
  await expectMode(page, 'world');
  await tapKey(page, 'KeyP');
  await expectMode(page, 'dashboard');
  await page.waitForFunction(() => document.getElementById('a11y-status').textContent.includes('교사용 대시보드'));

  await tapKey(page, 'KeyP');
  await expectMode(page, 'world');
  await tapKey(page, 'KeyX');
  await expectMode(page, 'pause');
  for (let i = 0; i < 4; i++) await tapKey(page, 'ArrowDown');
  await tapKey(page, 'KeyZ');
  await expectMode(page, 'report');
  await page.waitForFunction(() => document.getElementById('a11y-status').textContent.includes('학생 진단 리포트'));

  await context.close();
}

async function runMobileChecks(browser, baseUrl, errors) {
  const portrait = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const portraitPage = await portrait.newPage();
  portraitPage.on('pageerror', (error) => errors.push('mobile portrait pageerror: ' + error.message));
  await portraitPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await portraitPage.waitForFunction(() => !!window.__game);
  assert(await portraitPage.$eval('#rotate-hint', (el) => getComputedStyle(el).display) === 'flex', 'portrait rotate hint is hidden');
  assert(await portraitPage.$eval('#touch-ui', (el) => getComputedStyle(el).display) === 'block', 'portrait touch UI is hidden');
  await portrait.close();

  const landscape = await browser.newContext({
    viewport: { width: 844, height: 390 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  });
  const landscapePage = await landscape.newPage();
  landscapePage.on('pageerror', (error) => errors.push('mobile landscape pageerror: ' + error.message));
  await landscapePage.goto(baseUrl, { waitUntil: 'networkidle' });
  await landscapePage.waitForFunction(() => !!window.__game);
  assert(await landscapePage.$eval('#rotate-hint', (el) => getComputedStyle(el).display) === 'none', 'landscape rotate hint is visible');
  assert(await landscapePage.$eval('#touch-ui', (el) => getComputedStyle(el).display) === 'block', 'landscape touch UI is hidden');
  const touchButtons = await landscapePage.$$eval('.tbtn', (els) => els.map((el) => ({
    tag: el.tagName,
    type: el.getAttribute('type'),
    label: el.getAttribute('aria-label'),
    tabIndex: el.tabIndex,
  })));
  assert(touchButtons.length === 4, 'expected four touch buttons');
  assert(touchButtons.every((btn) => btn.tag === 'BUTTON' && btn.type === 'button'), 'touch controls must be native buttons');
  assert(touchButtons.every((btn) => btn.label && btn.tabIndex >= 0), 'touch buttons need labels and keyboard focus');
  await landscapePage.focus('#t-menu');
  await landscapePage.keyboard.down('Space');
  await landscapePage.waitForTimeout(45);
  await landscapePage.keyboard.up('Space');
  await expectMode(landscapePage, 'dex');
  assert(await landscapePage.$eval('#name-overlay', (el) => getComputedStyle(el).display) === 'none', 'touch menu key activation leaked to title action');
  await tapKey(landscapePage, 'KeyX');
  await expectMode(landscapePage, 'title');
  await landscapePage.focus('#t-a');
  await landscapePage.keyboard.down('Space');
  await landscapePage.waitForTimeout(45);
  await landscapePage.keyboard.up('Space');
  await landscapePage.waitForFunction(() => getComputedStyle(document.getElementById('name-overlay')).display === 'flex');
  await landscape.close();
}

async function runStorageFailureCheck(browser, baseUrl, errors) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  await context.addInitScript(() => {
    Storage.prototype.setItem = function setItem() {
      throw new DOMException('Storage writes are blocked', 'QuotaExceededError');
    };
  });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push('storage console: ' + msg.text());
  });
  page.on('pageerror', (error) => errors.push('storage pageerror: ' + error.message));

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__game);
  await expectMode(page, 'title');
  assert(await page.$eval('#boot-error', (el) => getComputedStyle(el).display) === 'none', 'storage failure shows boot error');
  assert((await canvasHasPaint(page)) > 0.05, 'storage failure title canvas appears blank');
  assert(await page.evaluate(() => window.__test.getStorageOk() === false), 'storage failure was not detected');
  await page.waitForFunction(() => document.getElementById('a11y-status').textContent.includes('저장이 되지 않는 환경'));
  await startAdventure(page);
  await expectMode(page, 'world');
  assert(await page.evaluate(() => window.__test.getStorageOk() === false), 'storage failure state was lost after starting');
  await page.waitForFunction(() => {
    const text = document.getElementById('a11y-status').textContent;
    return text.includes('저장이 되지 않는 환경') && text.includes('탐험 화면');
  });
  await context.close();
}

(async () => {
  const server = await createServer();
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}/`;
  const errors = [];
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    await runDesktopFlow(browser, baseUrl, errors);
    await runMobileChecks(browser, baseUrl, errors);
    await runStorageFailureCheck(browser, baseUrl, errors);
    assert(errors.length === 0, errors.join('\n'));
    console.log('✔ browser smoke test passed');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
