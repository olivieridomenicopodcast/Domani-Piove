#!/usr/bin/env node
/* Simulazione da riga di comando.
   Uso: node tools/sim.js --games 200 --a hard --b medium [--players 2|3|4] [--seed x] [--rule key=value ...] [--aparam key=value] [--bparam key=value] [--out report.md] [--json out.json] */
'use strict';
require('../js/cards.js'); require('../js/data.js'); require('../js/engine.js'); require('../js/ai.js'); require('../js/sim.js');
const fs = require('fs');
const FF = globalThis.FF, args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const all = (k) => args.flatMap((a, i) => (a === '--' + k ? [args[i + 1]] : []));
const val = (v) => { if (v === 'true') return true; if (v === 'false') return false; if (v === 'null') return null; if (/^[\[{]/.test(v)) return JSON.parse(v); return isNaN(Number(v)) ? v : Number(v); };
const kv = (list) => { const o = {}; list.forEach((s) => { const i = s.indexOf('='), k = s.slice(0, i), v = s.slice(i + 1); if (k.includes('.')) { const [a, b] = k.split('.'); o[a] = Object.assign({}, o[a] || FF.DEFAULT_RULES[a], { [b]: val(v) }); } else o[k] = val(v); }); return o; };
const opts = { games: Number(get('games', 100)), seed: get('seed', 'sim'), players: Number(get('players', 2)), a: get('a', 'hard'), b: get('b', 'medium'), rules: kv(all('rule')), aParams: kv(all('aparam')), bParams: kv(all('bparam')) };
if (!Object.keys(opts.rules).length) delete opts.rules;
const agg = FF.Sim.run(opts, (i, n) => { if (process.stderr.isTTY && i % 50 === 0) process.stderr.write(`\r${i}/${n}`); });
const rep = FF.Sim.report(agg);
console.log(rep);
if (get('out')) fs.writeFileSync(get('out'), rep + '\n');
if (get('json')) fs.writeFileSync(get('json'), JSON.stringify(agg, null, 1));
