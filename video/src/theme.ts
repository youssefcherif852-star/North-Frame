import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const INK = '#0F0F0F';
export const IVORY = '#FAF8F5';

export const DISPLAY = 'Anton, Impact, sans-serif';
export const UI = 'Inter, system-ui, sans-serif';

loadFont({family: 'Anton', url: staticFile('fonts/anton.woff2'), weight: '400'});
loadFont({family: 'Inter', url: staticFile('fonts/inter.woff2'), weight: '100 900'});
