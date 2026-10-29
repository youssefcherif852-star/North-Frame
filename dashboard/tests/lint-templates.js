// Finds html`` templates that produce more than one top-level node (an unkeyed array in React).
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const walk = require('acorn-walk');
const src = fs.readFileSync(process.argv[2] || path.resolve(__dirname, '../index.html'), 'utf8');
const js = src.match(/<script>\n([\s\S]*?)<\/script>/)[1];
global.self = global;
eval(fs.readFileSync(path.join(__dirname, 'node_modules/htm/dist/htm.umd.js'), 'utf8'));
const htm = global.htm || module.exports;
const h = (type, props, ...children) => ({ type, props, children });
const tag = htm.bind(h);
const ast = acorn.parse(js, { ecmaVersion: 2022, locations: true });
let n = 0, bad = 0;
walk.full(ast, (node) => {
  if (node.type !== 'TaggedTemplateExpression' || node.tag.type !== 'Identifier' || node.tag.name !== 'html') return;
  n += 1;
  const strings = node.quasi.quasis.map((q) => q.value.cooked);
  strings.raw = node.quasi.quasis.map((q) => q.value.raw);
  const vals = node.quasi.expressions.map((e, i) => ({ __slot: i }));
  let out;
  try { out = tag(strings, ...vals); } catch (e) { console.log('PARSE FAIL line', node.loc.start.line, e.message); bad += 1; return; }
  if (Array.isArray(out)) { bad += 1; console.log('MULTI-ROOT line', node.loc.start.line + ':', js.slice(node.start, Math.min(node.end, node.start + 150)).replace(/\s+/g, ' ')); }
});
console.log(n, 'templates checked,', bad, 'problems');
