#!/usr/bin/env node
/* Misura gli Obiettivi Segreti. Per ogni obiettivo: quanto spesso lo raggiunge a caso un giocatore (Difficile) che NON mira a obiettivi
   (objW=0), e quanto spesso lo raggiunge chi lo ha scelto e ci mira (objW normale). Le due colonne servono a tarare le fasce di punti.
   Uso: node tools/obiettivi.js [partite=300] [giocatori=2] [seed]  [--json out.json] */
'use strict';
require('../js/cards.js'); require('../js/data.js'); require('../js/engine.js'); require('../js/ai.js'); require('../js/sim.js');
const FF = globalThis.FF, args = process.argv.slice(2);
const games = Number(args[0] || 300), NP = Number(args[1] || 2), seed = args[2] || 'obj';
const ji = args.indexOf('--json'), jf = ji >= 0 ? args[ji + 1] : null;
const run = (objW) => {
  const base = {}, got = {}, held = {}, hit = {}, tot = { held: 0, hit: 0, pts: 0 };
  FF.OBJECTIVE_IDS.forEach((id) => { base[id] = 0; got[id] = 0; held[id] = 0; hit[id] = 0; });
  let N = 0;
  for (let i = 0; i < games; i++) {
    const r = FF.Sim.playOne(i, { seed: seed + objW, players: NP, a: 'hard', b: 'hard', swap: true, aParams: { objW }, bParams: { objW } });
    r.g.s.players.forEach((p, q) => {
      N++;
      FF.OBJECTIVE_IDS.forEach((id) => { if (FF.objectiveMet(id, p, r.g.rules)) base[id]++; });
      const sc = r.res.scores[q]; held[sc.objective]++; tot.held++; if (sc.objMet) { hit[sc.objective]++; tot.hit++; tot.pts += sc.objectives; }
    });
  }
  return { N, base, held, hit, tot };
};
const casual = run(0), aim = run(1);
const rows = FF.OBJECTIVES.map((o) => ({ id: o.id, titolo: o.titolo, pts: o.pts, perCaso: casual.base[o.id] / casual.N, tenuto: aim.held[o.id], mira: aim.held[o.id] ? aim.hit[o.id] / aim.held[o.id] : null, mirando: aim.base[o.id] / aim.N }));
const pc = (x) => (x == null ? '   —  ' : (100 * x).toFixed(1).padStart(5) + '%');
console.log('id  titolo                      pts  per caso  tenuto  raggiunto(chi lo tiene, mirando)  [chiunque, mirando]');
rows.forEach((r) => console.log(`${r.id}  ${r.titolo.padEnd(26)} ${String(r.pts).padStart(2)}   ${pc(r.perCaso)}   ${String(r.tenuto).padStart(5)}   ${pc(r.mira)}   ${pc(r.mirando)}`));
console.log(`\nGiocatori-partita: ${casual.N} (a caso) / ${aim.N} (mirando). Media punti obiettivo per giocatore: ${(aim.tot.pts / aim.N).toFixed(2)} · raggiunto ${(100 * aim.tot.hit / aim.tot.held).toFixed(1)}%`);
if (args.includes('--write')) {   // aggiorna le probabilità usate dall'AI per scegliere gli obiettivi: raggiunto da chi lo tiene (se ≥ 12 casi), altrimenti «per caso»
  const rate = {}; rows.forEach((r) => { rate[r.id] = Math.round(100 * (r.tenuto >= 12 ? r.mira : r.perCaso)) / 100; });
  const f = require('path').join(__dirname, '..', 'js', 'data.js'); let t = require('fs').readFileSync(f, 'utf8');
  t = t.replace(/FF\.OBJ_RATE = \{[^}]*\};/, 'FF.OBJ_RATE = ' + JSON.stringify(rate) + ';'); require('fs').writeFileSync(f, t); console.log('OBJ_RATE aggiornato in js/data.js');
}
if (jf) require('fs').writeFileSync(jf, JSON.stringify({ rows, aim: aim.tot, N: aim.N }, null, 1));
