'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const FF = require('./_load.js');

const PL = (n) => Array.from({ length: n }, (_, i) => ({ name: 'P' + (i + 1) }));
const newGame = (o) => new FF.Game(Object.assign({ seed: 5, players: PL(2) }, o || {}));
const regId = (regione) => FF.REGION_CARDS.find((c) => c.regione === regione && c.variante === 'neutra').id;
const cell = (regione, sym) => { const [x, y] = FF.ITALY_MAP[regione]; const e = { id: regId(regione), x, y, sym: sym || [], fusion: null }; e.fusion = FF.fusionOf(e.sym); return e; };
const P = (table, o) => Object.assign({ table, hand: [], pm: 0, workers: 2, pendingWorker: false }, o || {});
const R = FF.DEFAULT_RULES;
const met = (id, p) => FF.objectiveMet(id, p, R);

test('obiettivi: 24 carte, 4 tipi (9/6/3/6), solo le fasce 3 · 5 · 8, id e titoli unici, probabilità AI per tutte', () => {
  assert.equal(FF.OBJECTIVES.length, 24);
  const by = {}; FF.OBJECTIVES.forEach((o) => { by[o.tipo] = (by[o.tipo] || 0) + 1; assert.ok([3, 5, 8].includes(o.pts), o.id); assert.ok(o.titolo && o.testo, o.id); });
  assert.deepEqual(by, { territorio: 9, simboli: 6, pattern: 3, risorse: 6 });
  FF.OBJECTIVE_IDS.forEach((id) => assert.ok(FF.OBJ_RATE[id] != null, 'manca la probabilità di ' + id + ': node tools/obiettivi.js 500 2 x --write'));
  assert.equal(new Set(FF.OBJECTIVES.map((o) => o.id)).size, 24); assert.equal(new Set(FF.OBJECTIVES.map((o) => o.titolo)).size, 24);
});
test('obiettivi: nessuno cita la previsione o il bersaglio', () => {
  FF.OBJECTIVES.forEach((o) => assert.ok(!/previsione|bersaglio/i.test(o.testo), o.id));
});
test('obiettivi di territorio: conta le regioni giuste', () => {
  assert.equal(met('T1', P([cell('Veneto'), cell('Lazio')])), false);
  assert.equal(met('T1', P([cell('Veneto'), cell('Lazio'), cell('Sicilia')])), true);
  assert.equal(met('T2', P([cell('Veneto'), cell('Lombardia'), cell('Piemonte')])), true);
  assert.equal(met('T2', P([cell('Veneto'), cell('Lombardia'), cell('Lazio')])), false);
  assert.equal(met('T3', P([cell('Lazio'), cell('Umbria')])), true);
  assert.equal(met('T4', P([cell('Sicilia'), cell('Sardegna'), cell('Puglia')])), true);
  assert.equal(met('T6', P([cell('Veneto')])), false); assert.equal(met('T6', P([cell('Veneto'), cell('Calabria')])), true);
  assert.equal(met('T7', P(['Liguria', 'Toscana', 'Sardegna'].map((r) => cell(r)))), true);
  assert.equal(met('T7', P(['Liguria', 'Toscana', 'Veneto'].map((r) => cell(r)))), false);
  assert.equal(met('T8', P(['Marche', 'Abruzzo', 'Veneto'].map((r) => cell(r)))), true);
  assert.equal(met('T8', P(['Marche', 'Abruzzo', 'Lazio'].map((r) => cell(r)))), false);
  assert.equal(met('T9', P(["Valle d'Aosta", 'Piemonte', 'Veneto'].map((r) => cell(r)))), true);
  assert.equal(met('T9', P(["Valle d'Aosta", 'Piemonte', 'Lazio'].map((r) => cell(r)))), false);
});
test('obiettivi di simboli: le carte fuse non contano come carte con il simbolo', () => {
  assert.equal(met('S4', P([cell('Veneto', ['neve']), cell('Lazio', ['neve'])])), true);
  assert.equal(met('S4', P([cell('Veneto', ['neve', 'neve']), cell('Lazio', ['neve'])])), false);     // la prima è Nevicata Estrema: fusa
  assert.equal(met('S3', P(['Veneto', 'Lazio', 'Puglia', 'Umbria'].map((r) => cell(r, ['sole'])))), true);
  assert.equal(met('S1', P([cell('Veneto', ['sole']), cell('Lazio', ['pioggia']), cell('Puglia', ['neve']), cell('Umbria', ['vento'])])), true);
  assert.equal(met('S1', P([cell('Veneto', ['sole']), cell('Lazio', ['pioggia']), cell('Puglia', ['neve']), cell('Umbria', ['neve'])])), false);
  assert.equal(met('S5', P(['sole', 'nuvolo', 'pioggia', 'vento', 'neve', 'nebbia'].map((x, k) => cell(['Veneto', 'Lazio', 'Puglia', 'Umbria', 'Sicilia', 'Toscana'][k], [x])))), true);
  assert.equal(met('S5', P(['sole', 'nuvolo', 'pioggia', 'vento', 'neve', 'neve'].map((x, k) => cell(['Veneto', 'Lazio', 'Puglia', 'Umbria', 'Sicilia', 'Toscana'][k], [x])))), false);
  assert.equal(met('S2', P([cell('Veneto', ['sole']), cell('Lazio', ['sole']), cell('Puglia', ['neve']), cell('Umbria', ['neve'])])), true);
  assert.equal(met('S2', P([cell('Veneto', ['sole']), cell('Lazio', ['sole']), cell('Puglia', ['neve'])])), false);
});
test('obiettivi di pattern: usano l\'adiacenza della mappa d\'Italia', () => {
  // Veneto-Lombardia si toccano, Veneto-Sicilia no
  assert.equal(met('P2', P(['Veneto', 'Lombardia'].map((r) => cell(r, ['temporale'])))), true);
  assert.equal(met('P2', P(['Veneto', 'Sicilia'].map((r) => cell(r, ['temporale'])))), false);
    assert.equal(met('P1', P(['Veneto', 'Sicilia', 'Sardegna', 'Lazio'].map((r) => cell(r, ['nebbia'])))), true);
  assert.equal(met('P1', P(['Veneto', 'Lombardia', 'Sicilia', 'Sardegna'].map((r) => cell(r, ['nebbia'])))), false);   // due Nebbia si toccano: ne restano 2 isolate
});
test('obiettivi di risorse: mano, PM, tavolo, lavoratore, simboli', () => {
  assert.equal(met('R1', P([], { hand: [] })), true); assert.equal(met('R1', P([], { hand: [1] })), false);
  assert.equal(met('R2', P([], { pm: 7 })), true); assert.equal(met('R2', P([], { pm: 6 })), false); assert.equal(met('R2', P([], { pm: 5, hand: [1] })), false);
  assert.equal(met('R3', P([], { pm: 9 })), true); assert.equal(met('R3', P([], { pm: 8 })), false);
  assert.equal(met('R4', P(['Veneto', 'Lazio', 'Puglia', 'Umbria', 'Sicilia', 'Toscana'].map((r) => cell(r)))), false);
  assert.equal(met('R4', P(['Veneto', 'Lazio', 'Puglia', 'Umbria', 'Sicilia', 'Toscana', 'Marche'].map((r) => cell(r)))), true);
  assert.equal(met('R5', P([], { workers: 3 })), true); assert.equal(met('R5', P([], { workers: 2 })), false);
  const six = ['Veneto', 'Lazio', 'Puglia', 'Umbria', 'Sicilia', 'Toscana'];
  assert.equal(met('R6', P(six.map((r) => cell(r, ['vento'])))), true);
  assert.equal(met('R6', P(six.map((r, i) => cell(r, i ? ['vento'] : [])))), false);      // una carta spoglia
  assert.equal(met('R6', P(six.slice(0, 5).map((r) => cell(r, ['vento'])))), false);      // solo 5 carte
  assert.equal(met('S6', P([cell('Veneto', ['pioggia']), cell('Lazio', ['neve'])])), true);
  assert.equal(met('S6', P([cell('Veneto', ['pioggia']), cell('Lazio', ['sole'])])), false);
  assert.equal(met('P3', P(['Toscana', 'Umbria', 'Lazio'].map((r) => cell(r, ['pioggia'])))), true);
  assert.equal(met('P3', P([cell('Toscana', ['pioggia']), cell('Umbria', ['sole']), cell('Lazio', ['pioggia'])])), false);
});

test('obiettivi: ogni giocatore ne riceve 2 diversi e ne tiene 1 (decisione a inizio partita, a partire dal primo giocatore)', () => {
  const g = newGame({ players: PL(3) }), s = g.s, seen = [];
  assert.equal(s.objDeck.length, 24 - 6);
  const all = s.players.flatMap((p) => p.objChoices); assert.equal(new Set(all).size, 6);
  const gen = g.run(); let r = gen.next(), chosen = [];
  while (!r.done && r.value.type !== 'place') {
    const d = r.value; if (d.type === 'beat') { r = gen.next(); continue; }
    assert.equal(d.type, 'objective'); assert.equal(d.options.length, 2); seen.push(d.pid);
    chosen.push(d.options[1].obj); r = gen.next(1);
  }
  assert.deepEqual(seen, [0, 1, 2].map((k) => (s.first + k) % 3));
  s.players.forEach((p) => { assert.equal(p.objective, chosen[seen.indexOf(p.id)]); assert.deepEqual(p.objChoices, []); });
  assert.equal(s.objDiscard.length, 3);
});
test('obiettivi: il punteggio finale somma i punti solo se raggiunto, altrimenti 0', () => {
  const g = newGame(), p = g.s.players[0];
  p.objective = 'T5'; p.table = [cell('Sicilia'), cell('Sardegna')];
  p.objective = 'T6'; let sc = g.scoreOf(0); assert.equal(sc.objectives, 3); assert.equal(sc.objMet, true); assert.equal(sc.total, sc.accPts + sc.coerenza + 3);
  p.table = [cell('Veneto')]; sc = g.scoreOf(0); assert.equal(sc.objectives, 0); assert.equal(sc.objMet, false); assert.equal(sc.total, sc.accPts + sc.coerenza);
});
test('obiettivi: la partita funziona anche senza (objectives:false) e la cronaca li rivela a fine partita', () => {
  const off = FF.playGame({ seed: 3, players: PL(2), rules: { objectives: false } });
  assert.ok(off.result.scores.every((s) => s.objectives === 0 && s.objective == null));
  const on = FF.playGame({ seed: 3, players: PL(3) });
  assert.equal(on.game.events.filter((e) => e.k === 'obj').length, 3);
  on.result.scores.forEach((s) => { assert.ok(FF.OBJ[s.objective]); assert.equal(s.objectives, s.objMet ? FF.OBJ[s.objective].pts : 0); });
});
test('Evento «Collaborazione internazionale»: si può tenere o cambiare l\'Obiettivo (pescando dal mazzo)', () => {
  const g = newGame(); g.s.players[0].objective = 'T1'; const old = g.s.objDeck.slice();
  let dec = null; FF.drive(g.eventOp(['objReroll'], 0), (d) => { dec = d; return 0; }, g);
  assert.equal(dec.type, 'objswap'); assert.equal(g.s.players[0].objective, 'T1');
  FF.drive(g.eventOp(['objReroll'], 0), () => 1, g);
  assert.equal(g.s.players[0].objective, old[old.length - 1]); assert.ok(g.s.objDiscard.includes('T1')); assert.equal(g.s.objDeck.length, old.length - 1);
});
test('obiettivi: l\'AI non conosce quelli degli avversari (determinize li cancella) e i punteggi provvisori non li mostrano', () => {
  const g = newGame(); g.s.players.forEach((p, i) => { p.objective = i ? 'T6' : 'T1'; });
  const d = FF.AI.determinize(g, 0, FF.makeRng(1));
  assert.equal(d.s.players[0].objective, 'T1'); assert.equal(d.s.players[1].objective, null);
});
test('obiettivi: l\'AI che mira ne raggiunge più di una che li ignora', () => {
  const run = (objW) => { let hit = 0, n = 0; for (let i = 0; i < 40; i++) { const r = FF.Sim.playOne(i, { seed: 'objai', players: 2, a: 'hard', b: 'hard', aParams: { objW }, bParams: { objW } }); r.res.scores.forEach((s) => { n++; if (s.objMet) hit++; }); } return hit / n; };
  const aim = run(1), ignore = run(0);
  assert.ok(aim > ignore, `mira ${aim} ≤ ignora ${ignore}`);
});
