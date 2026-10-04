import {Config} from '@remotion/cli/config';
import {existsSync} from 'node:fs';

// Use a local headless Chromium when one is present; otherwise Remotion downloads its own.
const local = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (existsSync(local)) Config.setBrowserExecutable(local);

// ANGLE gives WebGL (Three.js) a working renderer in headless Chromium.
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(4);
