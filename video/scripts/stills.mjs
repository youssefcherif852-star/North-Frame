// Renders review stills: node scripts/stills.mjs 40 250 ...
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browser = await openBrowser('chrome', {browserExecutable, chromiumOptions: {gl: 'angle'}});
const composition = await selectComposition({serveUrl, id: 'NorthFrame', puppeteerInstance: browser});
for (const frame of frames) {
  await renderStill({composition, serveUrl, frame, output: `out/st/${String(frame).padStart(4, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 70, scale: 0.5, puppeteerInstance: browser});
  process.stdout.write(`${frame} `);
}
await browser.close({silent: true});
