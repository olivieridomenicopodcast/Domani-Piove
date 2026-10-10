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
  const C = (...r) => P(r.map((x) => cell(x)));
  assert.equal(met('T1', C('Veneto', 'Lombardia', 'Lazio', 'Umbria', 'Sicilia', 'Calabria')), true);
  assert.equal(met('T1', C('Veneto', 'Lombardia', 'Lazio', 'Umbria', 'Sicilia')), false);              // una sola nel Sud
  assert.equal(met('T2', C('Veneto', 'Lombardia', 'Piemonte', 'Liguria')), true);
  assert.equal(met('T2', C('Veneto', 'Lombardia', 'Piemonte', 'Lazio')), false);
  assert.equal(met('T3', C('Lazio', 'Umbria', 'Marche')), true); assert.equal(met('T3', C('Lazio', 'Umbria')), false);
  assert.equal(met('T4', C('Sicilia', 'Sardegna', 'Puglia', 'Campania')), true); assert.equal(met('T4', C('Sicilia', 'Sardegna', 'Puglia')), false);
  assert.equal(met('T6', C('Veneto')), false); assert.equal(met('T6', C('Veneto', 'Calabria')), true);
  assert.equal(met('T7', C('Liguria', 'Toscana', 'Sardegna', 'Calabria')), true); assert.equal(met('T7', C('Liguria', 'Toscana', 'Sardegna', 'Veneto')), false);
  assert.equal(met('T8', C('Marche', 'Abruzzo', 'Veneto', 'Puglia')), true); assert.equal(met('T8', C('Marche', 'Abruzzo', 'Veneto', 'Lazio')), false);
  assert.equal(met('T9', C("Valle d'Aosta", 'Piemonte', 'Veneto', 'Liguria')), true); assert.equal(met('T9', C("Valle d'Aosta", 'Piemonte', 'Veneto', 'Lazio')), false);
});
test('obiettivi di simboli: le carte fuse non contano come carte con il simbolo', () => {
  const R6 = ['Veneto', 'Lazio', 'Puglia', 'Umbria', 'Sicilia', 'Toscana', 'Marche'];
  const T = (syms) => P(syms.map((x, k) => cell(R6[k], Array.isArray(x) ? x : [x])));
  assert.equal(met('S4', T(['neve', 'neve', 'neve', 'neve'].map((x) => [x]))), true);
  assert.equal(met('S4', T([['neve', 'neve'], ['neve'], ['neve'], ['neve']])), false);        // la prima è Nevicata Estrema: fusa, restano 3 carte con Neve
  assert.equal(met('S3', T(['sole', 'sole', 'sole', 'sole', 'sole'])), true); assert.equal(met('S3', T(['sole', 'sole', 'sole', 'sole', 'neve'])), false);
  assert.equal(met('S1', T(['sole', 'pioggia', 'neve', 'vento', 'nebbia'])), true); assert.equal(met('S1', T(['sole', 'pioggia', 'neve', 'vento', 'vento'])), false);
  assert.equal(met('S5', T(['sole', 'nuvolo', 'pioggia', 'vento', 'neve', 'nebbia', 'temporale'])), true);
  assert.equal(met('S5', T(['sole', 'nuvolo', 'pioggia', 'vento', 'neve', 'nebbia', 'nebbia'])), false);
  assert.equal(met('S2', T(['sole', 'sole', 'neve', 'neve', 'vento', 'vento'])), true); assert.equal(met('S2', T(['sole', 'sole', 'neve', 'neve', 'vento'])), false);
  assert.equal(met('S6', T(['pioggia', 'neve', 'temporale', 'pioggia'])), true); assert.equal(met('S6', T(['pioggia', 'neve', 'temporale', 'sole'])), false);
});
test('obiettivi di pattern: usano l\'adiacenza della mappa d\'Italia', () => {
  // Veneto-Lombardia-Trentino si toccano, Sicilia no
  assert.equal(met('P2', P(['Veneto', 'Lombardia', 'Trentino-Alto Adige'].map((r) => cell(r, ['temporale'])))), true);
  assert.equal(met('P2', P(['Veneto', 'Lombardia', 'Sicilia'].map((r) => cell(r, ['temporale'])))), false);
  assert.equal(met('P3', P(['Veneto', 'Lombardia', 'Trentino-Alto Adige', 'Friuli-Venezia Giulia'].map((r) => cell(r, ['pioggia'])))), true);
  assert.equal(met('P3', P([cell('Veneto', ['pioggia']), cell('Lombardia', ['sole']), cell('Trentino-Alto Adige', ['pioggia']), cell('Friuli-Venezia Giulia', ['pioggia'])])), false);
  // Nebbia: 3 carte, ognuna accanto a una carta senza Nebbia; sole o a contatto tra loro non vale
  assert.equal(met('P1', P([cell('Veneto', ['nebbia']), cell('Lombardia', ['sole']), cell('Lazio', ['nebbia']), cell('Umbria', ['sole']), cell('Calabria', ['nebbia']), cell('Sicilia', ['sole'])])), true);
  assert.equal(met('P1', P(['Veneto', 'Sicilia', 'Sardegna'].map((r) => cell(r, ['nebbia'])))), false);                  // senza vicini
  assert.equal(met('P1', P([cell('Veneto', ['nebbia']), cell('Lombardia', ['nebbia']), cell('Lazio', ['nebbia']), cell('Toscana', ['sole'])])), false);   // due Nebbia si toccano
});
test('obiettivi di risorse: mano, PM, tavolo, lavoratore', () => {
  assert.equal(met('R1', P([], { hand: [] })), true); assert.equal(met('R1', P([], { hand: [1] })), false);
  assert.equal(met('R2', P([], { pm: 7 })), true); assert.equal(met('R2', P([], { pm: 6 })), false); assert.equal(met('R2', P([], { pm: 9, hand: [1] })), false);
  assert.equal(met('R3', P([], { pm: 9 })), true); assert.equal(met('R3', P([], { pm: 8 })), false);
  const nine = ['Veneto', 'Lazio', 'Puglia', 'Umbria', 'Sicilia', 'Toscana', 'Marche', 'Campania', 'Liguria'];
  assert.equal(met('R4', P(nine.map((r) => cell(r)))), true); assert.equal(met('R4', P(nine.slice(0, 8).map((r) => cell(r)))), false);
  assert.equal(met('R5', P([], { workers: 3 })), true); assert.equal(met('R5', P([], { workers: 2 })), false);
  assert.equal(met('R6', P(nine.map((r) => cell(r, ['vento'])))), true);
  assert.equal(met('R6', P(nine.map((r, i) => cell(r, i ? ['vento'] : [])))), false);      // una carta spoglia
  assert.equal(met('R6', P(nine.slice(0, 8).map((r) => cell(r, ['vento'])))), false);      // solo 8 carte
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
  p.objective = 'T6'; p.table = [cell('Sicilia'), cell('Sardegna')]; let sc = g.scoreOf(0); assert.equal(sc.objectives, 3); assert.equal(sc.objMet, true); assert.equal(sc.total, sc.accPts + sc.coerenza + 3);
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
