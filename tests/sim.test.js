'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const FF = require('./_load.js');
require('../js/sim.js');
const Sim = FF.Sim;

test('profili: ogni profilo (anche gli estremi) gioca una partita completa a 2, 3 e 4 giocatori', () => {
  for (const key of Object.keys(Sim.PROFILES)) for (const n of [2, 3, 4]) {
    const r = Sim.playOne(0, { a: key, b: key === 'hard' ? 'medium' : 'hard', seed: 'p-' + key, players: n });
    assert.equal(r.res.rounds, 12, key + ' ' + n); assert.equal(r.res.scores.length, n);
  }
});
test('prove estreme: le strategie sbagliate di proposito PERDONO contro la AI normale (A vince ben oltre 1/N)', () => {
  for (const key of ['random', 'accumulatore', 'passivo', 'fedelta', 'pattern']) {
    const a = Sim.run({ games: 40, seed: 'ext-' + key, a: 'hard', b: key, players: 2 }), ci = Sim.wilson(a.aWins, a.n);
    assert.ok(ci[0] > 0.6, `${key}: A deve vincere nettamente, invece ${a.aWins}/${a.n}`);
  }
});
test('prove estreme: la suite restituisce una riga per profilo estremo con esito', async () => {
  const ex = await Sim.extremeSuite({ games: 20, seed: 'suite', a: 'hard', players: 2 });
  assert.equal(ex.rows.length, Object.keys(Sim.PROFILES).filter((k) => Sim.PROFILES[k].extreme).length);
  assert.ok(ex.rows.every((r) => typeof r.ok === 'boolean' && r.ci.length === 2));
  assert.ok(/Prove estreme/.test(Sim.extremeReport(ex, { a: 'hard', games: 20, players: 2 })));
});
test('simulazione: andamento nel tempo, istogrammi e statistiche coerenti', () => {
  const agg = Sim.run({ games: 20, seed: 'agg', a: 'hard', b: 'medium', players: 3, keepGames: 5 });
  assert.equal(agg.n, 20); assert.equal(agg.aWins + agg.bWins + agg.draws, 20);
  assert.equal(agg.traj.A.length, 13); assert.ok(agg.traj.n.every((x) => x === 20));            // 12 inizi di round + fine
  assert.ok(agg.traj.A[12] / 20 >= agg.traj.A[0] / 20);                                          // il punteggio cresce
  assert.equal(Object.values(agg.placements.hist).reduce((a, b) => a + b, 0), 20);
  assert.equal(Object.values(agg.marginHist).reduce((a, b) => a + b, 0), 20);
  assert.equal(agg.games.length, 5); assert.ok(agg.games[0].history.length > 50);
  assert.equal(agg.seatWins.reduce((a, b) => a + b, 0) + agg.draws, 20);
  assert.equal(agg.nA, 20); assert.equal(agg.nB, 40);
});
test('"Rivedi": la cronologia salvata rigioca esattamente la stessa partita', () => {
  const agg = Sim.run({ games: 3, seed: 'rv', a: 'hard', b: 'medium', players: 2, keepGames: 3 }), g0 = agg.games[0];
  const g = new FF.Game({ seed: g0.seed, players: g0.players, replay: g0.history.slice() });
  const res = FF.drive(g.run(), () => { throw new Error('non deve chiedere'); }, g);
  assert.deepEqual(res.scores.map((s) => s.total), g0.scores);
});
test('asincrona == sincrona (stessi seed, stessi risultati)', async () => {
  const o = { games: 10, seed: 'as', a: 'medium', b: 'easy', players: 2 };
  const a = Sim.run(o), b = await Sim.runAsync(o);
  assert.equal(a.aWins, b.aWins); assert.equal(a.scoreA.s1, b.scoreA.s1); assert.equal(a.placements.s1, b.placements.s1);
  const c = { cancelled: false }; let k = 0; const r = await Sim.runAsync({ games: 500, seed: 'x', a: 'easy', b: 'easy' }, () => { if (++k > 1) c.cancelled = true; }, c);
  assert.ok(r.n < 500, 'si può annullare');
});
test('forzature: Evento come primo, Carta Regione in mano, Previsione scelta', () => {
  const mk = (forced, seed) => new FF.Game({ seed: seed || 'fz', players: [{ name: 'A' }, { name: 'B' }], forced, log: true });
  const g = mk({ kind: 'evento', id: 74 }); assert.equal(g.s.eventDeck[g.s.eventDeck.length - 1], 74); assert.equal(g.s.eventDeck.length, 80); assert.equal(new Set(g.s.eventDeck).size, 80);
  const id = FF.REGION_CARDS.find((c) => c.regione === 'Sicilia' && c.variante === 'compensativa').id;
  for (const seed of ['fz', 'fz2', 'fz3', 'fz4']) {
    const g2 = mk({ kind: 'regione', id, seat: 1 }, seed); assert.ok(g2.s.players[1].hand.includes(id));
    const all = [].concat(g2.s.regionDeck, g2.s.market, ...g2.s.players.map((p) => p.hand)); assert.equal(all.length, 96); assert.equal(new Set(all).size, 96);   // nessuna carta persa o duplicata
  }
  const p = FF.PREVISIONI.find((x) => x.id === 'C3a'); const g3 = mk({ kind: 'previsione', id: 'C3a' });
  assert.equal(g3.s.prev.centro, 'C3a'); assert.deepEqual(g3.s.target.centro.map((c) => c.regione + ':' + c.req), p.condizioni.map((c) => c.regione + ':' + c.simbolo));
  // l'Evento forzato è davvero il primo a uscire
  const r = FF.playGame({ seed: 'fz9', players: [{ name: 'A' }, { name: 'B' }], forced: { kind: 'evento', id: 70 } });
  assert.ok(/CARTA EVENTO #70/.test(r.game.events.find((e) => e.k === 'event').text));
});
test('analisi forzata: coppie di partite appaiate, una riga per carta, report e CSV', async () => {
  const fa = await Sim.forcedAnalysis('evento', { games: 8, seed: 'fa', a: 'medium', b: 'medium', players: 2 }, null, null, [8, 74, 7]);
  assert.equal(fa.rows.length, 3); assert.ok(fa.rows.every((r) => r.n === 8 && Number.isFinite(r.dA.m) && Number.isFinite(r.dDrawer.m)));
  assert.ok(/Analisi forzata/.test(Sim.forcedReport(fa))); assert.equal(Sim.forcedCSV(fa).split('\n').length, 4);
  const fr = await Sim.forcedAnalysis('regione', { games: 6, seed: 'fr', a: 'medium', b: 'medium', players: 2 }, null, null, [FF.REGION_CARDS[0].id]);
  assert.equal(fr.rows.length, 1);
  assert.equal(Sim.forcedItems('evento').length, 80); assert.equal(Sim.forcedItems('previsione').length, 36); assert.equal(Sim.forcedItems('regione').length, 58);
});
test('esperimento: un parametro (anche annidato) varia davvero le regole', async () => {
  assert.equal(Sim.withRule({}, 'pattern.nebbia', 7).pattern.nebbia, 7); assert.equal(Sim.withRule({}, 'pattern.nebbia', 7).pattern.sole, undefined);
  const ex = await Sim.experiment({ games: 12, seed: 'ex', a: 'medium', b: 'medium', players: 2 }, 'poolPerSymbol', [1, 10]);
  assert.equal(ex.rows.length, 2);
  assert.ok(ex.rows[0].agg.stats.A.simboli_raccolti < ex.rows[1].agg.stats.A.simboli_raccolti, 'con 1 gettone per simbolo se ne raccolgono meno');
  assert.ok(/Esperimento: poolPerSymbol/.test(Sim.experimentReport(ex, { a: 'medium', b: 'medium', games: 12 })));
});
test('esportazioni: Markdown, CSV e JSON leggibili e coerenti', () => {
  const agg = Sim.run({ games: 10, seed: 'exp', a: 'hard', b: 'medium', players: 2, keepGames: 2 });
  const md = Sim.report(agg), csv = Sim.toCSV(agg), json = JSON.parse(Sim.toJSON(agg));
  assert.ok(/A vince/.test(md) && /Vantaggio di chi inizia/.test(md) && /Durata/.test(md));
  assert.equal(csv.split('\n')[0], 'metrica,A,B'); assert.ok(csv.split('\n').every((r) => r.split(',').length >= 1));
  assert.equal(json.n, 10); assert.equal(json.games.length, 2); assert.equal(json.games[0].history, undefined);
});
