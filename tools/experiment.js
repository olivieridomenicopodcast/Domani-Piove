#!/usr/bin/env node
/* Esperimento su una variante di regole: strategie estreme (solo fedeltà, solo pattern) contro la AI normale.
   Uso: node tools/experiment.js '<json delle regole>' [partite=120] [seed]    — stampa una riga JSON */
'use strict';
require('../js/cards.js'); require('../js/data.js'); require('../js/engine.js'); require('../js/ai.js'); require('../js/sim.js');
const FF = globalThis.FF, rules = JSON.parse(process.argv[2] || '{}'), games = Number(process.argv[3] || 120), seed = process.argv[4] || 'exp', NP = Number(process.argv[5] || 2);
const R = Object.assign({}, FF.DEFAULT_RULES, rules);
const run = (aP, bP) => FF.Sim.run({ games, seed, a: 'hard', b: 'hard', aParams: aP, bParams: bP, rules, players: NP });
const fid = { coerW: 0, patW: 0 }, pat = { accW: 0 };
const pc = (x) => Math.round(1000 * x) / 10, out = { rules };
const fp = run(fid, pat); out.fidVsPat = pc(fp.aWins / fp.n); out.fidVsPatCI = FF.Sim.wilson(fp.aWins, fp.n).map(pc);
const mp = run(undefined, pat); out.mixVsPat = pc(mp.aWins / mp.n);
const mf = run(undefined, fid); out.mixVsFid = pc(mf.aWins / mf.n);
const mm = run(); const t = (o) => Math.round(10 * o) / 10;
out.mix = { accRaw: t(mm.acc.A.s1 / mm.acc.A.n), accPts: t((mm.scoreA.s1 / mm.scoreA.n) - (mm.coer.A / mm.nA)), coer: t(mm.coer.A / mm.nA), tot: t(mm.scoreA.s1 / mm.scoreA.n), cards: t(mm.stats.A.carte_giocate / mm.nA), fus: t((mm.stats.A.fusioni || 0) / mm.nA) };
out.fidOnly = { accRaw: t(fp.acc.A.s1 / fp.acc.A.n), coer: t(fp.coer.A / fp.nA), tot: t(fp.scoreA.s1 / fp.scoreA.n) };
out.patOnly = { accRaw: t(fp.acc.B.s1 / fp.acc.B.n), coer: t(fp.coer.B / fp.nB), tot: t(fp.scoreB.s1 / fp.scoreB.n) };
console.log(JSON.stringify(out));
