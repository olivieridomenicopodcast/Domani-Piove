#!/usr/bin/env node
/* Simulazione da riga di comando.
   Torneo:      node tools/sim.js --games 300 --a hard --b medium [--players 2|3|4] [--seed x] [--rule chiave=valore ...] [--aparam k=v] [--bparam k=v]
   Esperimento: node tools/sim.js --games 200 --a hard --b hard --experiment poolPerSymbol=6,8,10   (anche chiavi annidate: pattern.nebbia=1,2,3)
   Prove estreme: node tools/sim.js --games 150 --a hard --extreme            (le strategie sbagliate di proposito DEVONO perdere)
   Analisi forzata: node tools/sim.js --forced evento|regione|previsione --games 40 --a medium --b medium [--only 14,29]
   Profili: easy medium hard random fedelta pattern accumulatore passivo
   Export: --out report.md  --csv dati.csv  --json dati.json */
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
const prog = (i, n, label) => { if (process.stderr.isTTY) process.stderr.write(`\r${i}/${n} ${label || ''}        `); };
const save = (rep, extra) => { if (get('out')) fs.writeFileSync(get('out'), rep + '\n'); if (get('csv') && extra && extra.csv) fs.writeFileSync(get('csv'), extra.csv); if (get('json') && extra && extra.json) fs.writeFileSync(get('json'), extra.json); };
(async () => {
  if (get('experiment')) {
    const spec = get('experiment'), i = spec.indexOf('='), key = spec.slice(0, i), values = spec.slice(i + 1).split(',').map(val);
    const ex = await FF.Sim.experiment(opts, key, values, prog); const rep = FF.Sim.experimentReport(ex, opts); console.log(rep);
    save(rep, { json: JSON.stringify(ex.rows.map((r) => ({ value: r.value, aWins: r.agg.aWins, n: r.agg.n, scoreA: r.agg.scoreA, scoreB: r.agg.scoreB }))) });
  } else if (args.includes('--extreme')) {
    const ex = await FF.Sim.extremeSuite(opts, prog); const rep = FF.Sim.extremeReport(ex, opts); console.log(rep); save(rep);
    if (ex.rows.some((r) => !r.ok)) process.exitCode = 2;
  } else if (get('forced')) {
    const only = get('only') ? get('only').split(',').map((x) => (isNaN(Number(x)) ? x : Number(x))) : null;
    const fa = await FF.Sim.forcedAnalysis(get('forced'), opts, prog, null, only); const rep = FF.Sim.forcedReport(fa); console.log(rep); save(rep, { csv: FF.Sim.forcedCSV(fa) });
  } else {
    const agg = await FF.Sim.runAsync(opts, prog); const rep = FF.Sim.report(agg); console.log(rep); save(rep, { csv: FF.Sim.toCSV(agg), json: FF.Sim.toJSON(agg) });
  }
})();
