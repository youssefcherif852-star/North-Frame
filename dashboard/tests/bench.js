// Test bench: serves the dashboard inside the artifact skeleton, routes the CDN
// scripts and Google Fonts to local copies, and injects the mock runtime.
const fs = require('fs');
const path = require('path');

const DASH = process.env.DASH || path.resolve(__dirname, '../index.html');
const FONTS = path.resolve(__dirname, '../../video/public/fonts') + '/';
const MOCK = fs.readFileSync(path.join(__dirname, 'mock-runtime.js'), 'utf8');
const SHOTS = path.join(__dirname, 'shots');
const MODULES = path.join(__dirname, 'node_modules');
fs.mkdirSync(SHOTS, { recursive: true });

const FONT_CSS = "@font-face{font-family:'Anton';font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/local/anton.woff2) format('woff2')}"
  + "@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:swap;src:url(https://fonts.gstatic.com/local/inter.woff2) format('woff2')}";

const wrapper = () => '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>html,body{margin:0;padding:0}</style></head><body>'
  + fs.readFileSync(DASH, 'utf8') + '</body></html>';

async function open(browser, opts) {
  const o = Object.assign({ cfg: {}, dev: true, width: 1440, height: 900, scheme: 'light', hash: '', wait: true }, opts || {});
  const context = await browser.newContext({ viewport: { width: o.width, height: o.height }, colorScheme: o.scheme, deviceScaleFactor: o.dpr || 1, hasTouch: !!o.touch, isMobile: !!o.mobile });
  const page = await context.newPage();
  const log = { console: [], errors: [], blocked: [] };
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') log.console.push(m.type() + ': ' + m.text().slice(0, 600)); });
  page.on('pageerror', (e) => log.errors.push(String((e && e.stack) || e).slice(0, 1200)));
  const lib = (f) => fs.readFileSync(path.join(MODULES, f));
  await context.route('**/*', async (route) => {
    const u = route.request().url();
    if (u.indexOf('http://nfhq.test/') === 0) return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: wrapper() });
    if (u === 'https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js') return route.fulfill({ contentType: 'application/javascript', body: lib(o.dev ? 'react/umd/react.development.js' : 'react/umd/react.production.min.js') });
    if (u === 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js') return route.fulfill({ contentType: 'application/javascript', body: lib(o.dev ? 'react-dom/umd/react-dom.development.js' : 'react-dom/umd/react-dom.production.min.js') });
    if (u === 'https://cdn.jsdelivr.net/npm/htm@3.1.1/dist/htm.umd.js') return route.fulfill({ contentType: 'application/javascript', body: lib('htm/dist/htm.umd.js') });
    if (u.indexOf('https://fonts.googleapis.com/css2?') === 0) return route.fulfill({ contentType: 'text/css', body: FONT_CSS });
    if (u.indexOf('https://fonts.gstatic.com/local/') === 0) return route.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(FONTS + path.basename(u)) });
    log.blocked.push(u);
    return route.abort();
  });
  await page.addInitScript((c) => { window.__MOCK_CFG = c; }, o.cfg);
  if (o.cfg.runtime !== false) await page.addInitScript(MOCK);
  await page.goto('http://nfhq.test/' + (o.hash ? '#' + o.hash : ''));
  if (o.wait) await ready(page);
  return { page, context, log };
}

async function ready(page, timeout) {
  await page.waitForFunction(() => document.querySelector('main#main') && !document.querySelector('[aria-busy="true"]') && document.querySelector('main#main .vh-h, main#main .empty'), null, { timeout: timeout || 15000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
}

async function shot(page, name, full) {
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: full !== false });
}

const docs = (page, col) => page.evaluate((c) => {
  const out = [];
  window.__mock.store.forEach((data, p) => { const a = p.split('/'); if (a.length === 2 && a[0] === c) out.push(Object.assign({ _id: a[1] }, data)); });
  return out;
}, col);

const overflow = (page) => page.evaluate(() => {
  const w = document.documentElement.clientWidth;
  const wide = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width && r.right > w + 1) {
      let p = el.parentElement, clipped = false;
      while (p && p !== document.body) { const s = getComputedStyle(p); if (/(auto|scroll|hidden)/.test(s.overflowX)) { clipped = true; break; } p = p.parentElement; }
      if (!clipped) wide.push((el.className && el.className.baseVal === undefined ? el.tagName + '.' + String(el.className).split(' ').join('.') : el.tagName) + ' right=' + Math.round(r.right));
    }
  });
  return { scrollWidth: document.documentElement.scrollWidth, clientWidth: w, wide: wide.slice(0, 8) };
});

// Every painted colour must be ink or ivory (or fully transparent).
const colours = (page) => page.evaluate(() => {
  const ok = new Set(['rgb(15, 15, 15)', 'rgb(250, 248, 245)', 'rgba(0, 0, 0, 0)', 'transparent']);
  const bad = new Map();
  const note = (val, el, prop) => {
    if (!val || val === 'none' || val.indexOf('url(') === 0) return;
    const found = val.match(/rgba?\([^)]*\)/g) || [];
    found.forEach((c) => { if (!ok.has(c) && !bad.has(c)) bad.set(c, prop + ' on ' + el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').join('.') : '')); });
  };
  document.querySelectorAll('body, body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height && el.tagName !== 'BODY') return;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none') return;
    if (parseFloat(s.opacity) < 1 && !bad.has('opacity ' + s.opacity)) bad.set('opacity ' + s.opacity, el.tagName.toLowerCase() + '.' + (typeof el.className === 'string' ? el.className.split(' ').join('.') : '') + (el.id ? '#' + el.id : ''));
    if (el instanceof SVGElement) {
      // Only shapes paint; an <svg> or <g> merely carries the inherited default fill.
      const tag = el.tagName.toLowerCase();
      if (['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'text', 'tspan', 'line'].indexOf(tag) < 0) return;
      const where = tag + ' in ' + ((el.closest('[class]') && el.closest('[class]').getAttribute('class')) || '?');
      if (tag !== 'line' && s.fill !== 'none') note(s.fill, { tagName: where }, 'fill');
      if (s.stroke !== 'none' && parseFloat(s.strokeWidth) > 0) note(s.stroke, { tagName: where }, 'stroke');
      return;
    }
    note(s.color, el, 'color');
    note(s.backgroundColor, el, 'background');
    note(s.backgroundImage, el, 'background-image');
    ['Top', 'Right', 'Bottom', 'Left'].forEach((side) => { if (parseFloat(s['border' + side + 'Width']) > 0 && s['border' + side + 'Style'] !== 'none') note(s['border' + side + 'Color'], el, 'border'); });
    if (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) note(s.outlineColor, el, 'outline');
  });
  return Array.from(bad.entries());
});

module.exports = { open, ready, shot, docs, overflow, colours, SHOTS };
