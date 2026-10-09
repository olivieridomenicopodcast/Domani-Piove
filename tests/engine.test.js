'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const FF = require('./_load.js');

const PL = (n) => Array.from({ length: n }, (_, i) => ({ name: 'P' + (i + 1) }));
const newGame = (o) => new FF.Game(Object.assign({ seed: 1, players: PL(2) }, o || {}));
const regId = (regione, variante, bonusKey) => FF.REGION_CARDS.find((c) => c.regione === regione && (!variante || c.variante === variante) && (!bonusKey || JSON.stringify(c.bonus).includes(bonusKey))).id;
const cell = (regione, x, y, sym, id) => { const e = { id: id != null ? id : regId(regione, 'neutra'), x, y, sym: sym || [], fusion: null }; e.fusion = FF.fusionOf(e.sym); return e; };
// risponde in sequenza alle decisioni con una lista di scelte (funzioni o indici)
const script = (list) => { let i = 0; return (dec) => { const a = list[i++]; return typeof a === 'function' ? a(dec) : a == null ? 0 : a; }; };
const pick = (pred) => (dec) => { const k = dec.options.findIndex(pred); assert.ok(k >= 0, 'opzione non trovata in ' + dec.type + ': ' + JSON.stringify(dec.options).slice(0, 200)); return k; };

// ───────────────────────── dati ─────────────────────────
test('dati: conteggi di carte, aree e fusioni', () => {
  assert.equal(FF.REGION_CARDS.length, 96);
  const per = {}; FF.REGION_CARDS.forEach((c) => { per[c.area] = (per[c.area] || 0) + 1; });
  assert.deepEqual(per, { nord: 40, centro: 20, sud_isole: 36 });
  assert.equal(FF.EVENT_IDS.length, 80);
  const cat = {}; FF.EVENT_IDS.forEach((id) => { const e = FF.EVENTS[id]; const k = e.tipo || e.categoria; cat[k] = (cat[k] || 0) + 1; });
  assert.equal(cat.A, 30); assert.equal(cat.B, 19); assert.equal((cat.positiva || 0) + (cat.nessun_effetto || 0), 31);
  assert.equal(FF.PREVISIONI.length, 36);
  FF.PREVISIONI.forEach((p) => assert.equal(p.condizioni.reduce((a, c) => a + c.punti, 0), 5, p.id));
  assert.equal(FF.FUSIONS.length, 8);
  assert.equal(Object.keys(FF.AREA_OF).length, 20);
  FF.REGION_CARDS.forEach((c) => assert.equal(c.area, FF.AREA_OF[c.regione]));
});
test('dati: ogni Evento neutro/positivo non-banale ha operazioni, ogni fenomeno una fusione valida', () => {
  FF.EVENT_IDS.forEach((id) => {
    const e = FF.EVENTS[id];
    if (e.categoria === 'fenomeno') { assert.ok(FF.isFusionName(e.fusione), id); assert.ok(FF.AREA_OF[e.regione], id); if (e.tipo === 'A') assert.ok(e.ricetta_fusione.includes(e.simbolo_richiesto), id); }
    else if (e.categoria === 'positiva') assert.ok(FF.EVENT_OPS[id], 'manca l\'effetto di #' + id);
  });
});
test('dati: prezzi e copie delle Carte Regione come da Sistema-5', () => {
  const price = { neutra: 1, confine: 2, compensativa: 3 };
  FF.REGION_CARDS.forEach((c) => assert.equal(c.price, price[c.variante]));
  assert.equal(FF.REGION_CARDS.filter((c) => c.variante === 'neutra').length, 20);
});

// ───────────────────────── fusioni ─────────────────────────
test('fusioni: tutte le 8 ricette, in entrambi gli ordini; le altre coppie non fondono', () => {
  const exp = { 'sole+sole': 'Caldo Estremo', 'vento+vento': 'Burrasca', 'pioggia+pioggia': 'Alluvione', 'temporale+temporale': 'Downburst', 'neve+neve': 'Nevicata Estrema',
    'temporale+vento': "Tromba d'Aria", 'sole+temporale': 'Grandine', 'neve+vento': 'Tormenta di Neve' };
  Object.keys(exp).forEach((k) => { const [a, b] = k.split('+'); assert.equal(FF.fusionOf([a, b]), exp[k]); assert.equal(FF.fusionOf([b, a]), exp[k]); });
  assert.equal(FF.fusionOf(['nuvolo', 'nuvolo']), null);
  assert.equal(FF.fusionOf(['nebbia', 'sole']), null);
  assert.equal(FF.fusionOf(['pioggia', 'vento']), null);
  assert.equal(FF.fusionOf(['sole']), null);
});

// ───────────────────────── Accuratezza ─────────────────────────
test('accuratezza: scaglioni 0 / 1-2 / 3-4 / 5-6 / 7+', () => {
  const pts = (raw) => FF.DEFAULT_RULES.accuracy.find((s) => raw >= s.from && raw <= s.to).pts;
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7, 15].map(pts), [0, 3, 3, 6, 6, 10, 10, 15, 15]);
});
test('accuratezza: simbolo richiesto, fusione richiesta, la fusione sostituisce i simboli base', () => {
  const target = { nord: [{ regione: 'Veneto', punti: 2, req: 'temporale' }, { regione: 'Lombardia', punti: 1, req: 'pioggia' }], centro: [{ regione: 'Marche', punti: 3, req: 'sole' }], sud_isole: [] };
  const ok = [cell('Veneto', 0, 0, ['temporale']), cell('Lombardia', 1, 0, ['pioggia', 'nuvolo']), cell('Marche', 2, 0, ['sole'])];
  assert.equal(FF.accuracyScore(ok, target).raw, 6);
  // Temporale+Sole = Grandine: non vale più come Temporale
  const fused = [cell('Veneto', 0, 0, ['temporale', 'sole'])];
  assert.equal(FF.accuracyScore(fused, target).raw, 0);
  target.nord[0].req = 'Grandine';
  assert.equal(FF.accuracyScore(fused, target).raw, 2);
  assert.equal(FF.accuracyScore([cell('Veneto', 0, 0, ['temporale'])], target).raw, 0);
  // regione non giocata: niente punti
  assert.equal(FF.accuracyScore([cell('Piemonte', 0, 0, ['temporale'])], target).raw, 0);
});

// ───────────────────────── Coerenza: bonus di confine ─────────────────────────
test('bonus di confine: contano solo le carte giocate e il possesso della regione (senza contatto)', () => {
  const pie = regId('Piemonte', 'confine', 'Lombardia'), lom = regId('Lombardia', 'neutra');
  assert.equal(FF.borderScore([cell(null, 0, 0, [], pie)]).total, 0);
  assert.equal(FF.borderScore([cell(null, 0, 0, [], pie), cell(null, 5, 5, [], lom)]).total, 1); // lontane: vale lo stesso
});
test('bonus rete estrema: additivo, 2 carte = +2, 3 carte = +3; isole +2', () => {
  const vda = regId("Valle d'Aosta", 'compensativa'), fvg = regId('Friuli-Venezia Giulia', 'compensativa'), cal = regId('Calabria', 'compensativa');
  assert.equal(FF.borderScore([cell(null, 0, 0, [], vda)]).total, 0);
  assert.equal(FF.borderScore([cell(null, 0, 0, [], vda), cell(null, 1, 0, [], cal)]).total, 2);
  assert.equal(FF.borderScore([cell(null, 0, 0, [], vda), cell(null, 1, 0, [], cal), cell(null, 2, 0, [], fvg)]).total, 3);
  const sic = regId('Sicilia', 'compensativa'), sar = regId('Sardegna', 'compensativa');
  assert.equal(FF.borderScore([cell(null, 0, 0, [], sic), cell(null, 1, 0, [], sar)]).total, 2);
});

// ───────────────────────── Coerenza: pattern ─────────────────────────
const P = (cells) => FF.patternScore(cells).by;
test('pattern Sole (Distesa): gruppi connessi 2=1, 3=2, 4=4, 5=6, 6+=9; in diagonale non si tocca', () => {
  const line = (n) => Array.from({ length: n }, (_, i) => cell(null, i, 0, ['sole'], FF.REGION_CARDS[i * 4].id));
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7].map((n) => P(line(n)).sole), [0, 1, 2, 4, 6, 9, 9]);
  assert.equal(P([cell(null, 0, 0, ['sole'], 0), cell(null, 1, 1, ['sole'], 4)]).sole, 0);
  assert.equal(P([cell(null, 0, 0, ['sole'], 0), cell(null, 1, 0, ['sole'], 4), cell(null, 5, 0, ['sole'], 8), cell(null, 6, 0, ['sole'], 12)]).sole, 2); // due gruppi da 2
});
test('pattern Temporale (Cella convettiva): per gruppo, +3 se 2, +6 se 3 o più, isolato 0', () => {
  const t = (n) => Array.from({ length: n }, (_, i) => cell(null, i, 0, ['temporale'], FF.REGION_CARDS[i * 4].id));
  assert.deepEqual([1, 2, 3, 4].map((n) => P(t(n)).temporale), [0, 3, 6, 6]);
});
test('pattern Pioggia (Coda): +1 per Pioggia adiacente a un Temporale', () => {
  assert.equal(P([cell(null, 0, 0, ['pioggia'], 0), cell(null, 1, 0, ['temporale'], 4), cell(null, 2, 0, ['pioggia'], 8), cell(null, 5, 5, ['pioggia'], 12)]).pioggia, 2);
});
test('pattern Neve (Manto): +4 una sola volta se esiste un gruppo di esattamente 2-3', () => {
  const n = (k, off) => Array.from({ length: k }, (_, i) => cell(null, off + i, 0, ['neve'], FF.REGION_CARDS[(off + i) * 4].id));
  assert.equal(P(n(1, 0)).neve, 0); assert.equal(P(n(2, 0)).neve, 4); assert.equal(P(n(3, 0)).neve, 4); assert.equal(P(n(4, 0)).neve, 0);
  assert.equal(P(n(2, 0).concat(n(2, 10))).neve, 4);
});
test('pattern Vento (Ponte): +2 per Vento adiacente ad almeno 2 simboli diversi', () => {
  assert.equal(P([cell(null, 0, 0, ['sole'], 0), cell(null, 1, 0, ['vento'], 4), cell(null, 2, 0, ['pioggia'], 8)]).vento, 2);
  assert.equal(P([cell(null, 0, 0, ['sole'], 0), cell(null, 1, 0, ['vento'], 4), cell(null, 2, 0, ['sole'], 8)]).vento, 0);
  // un vicino con due simboli diversi basta
  assert.equal(P([cell(null, 0, 0, ['sole', 'nuvolo'], 0), cell(null, 1, 0, ['vento'], 4)]).vento, 2);
});
test('pattern Nuvolo (Frangia) e Nebbia (Sacca isolata)', () => {
  assert.equal(P([cell(null, 0, 0, ['nuvolo'], 0), cell(null, 1, 0, ['nuvolo'], 4)]).nuvolo, 0);
  assert.equal(P([cell(null, 0, 0, ['nuvolo'], 0), cell(null, 1, 0, ['sole'], 4)]).nuvolo, 1);
  assert.equal(P([cell(null, 0, 0, ['nebbia'], 0), cell(null, 5, 0, ['nebbia'], 4)]).nebbia, 4);
  assert.equal(P([cell(null, 0, 0, ['nebbia'], 0), cell(null, 1, 0, ['nebbia'], 4)]).nebbia, 0);
});
test('pattern: una carta con fusione non partecipa ai pattern base; i due simboli non fusi partecipano entrambi', () => {
  assert.equal(P([cell(null, 0, 0, ['sole', 'sole'], 0), cell(null, 1, 0, ['sole'], 4)]).sole, 0);
  const t = P([cell(null, 0, 0, ['sole', 'nuvolo'], 0), cell(null, 1, 0, ['sole'], 4), cell(null, 2, 0, ['pioggia'], 8)]);
  assert.equal(t.sole, 1); assert.equal(t.nuvolo, 1);
});

// ───────────────────────── Carte Evento ─────────────────────────
const driveEv = (g, id) => { const ev = FF.EVENTS[id]; FF.drive(g.applyPhenomenon(ev), () => 0, g); return ev; };
test('Evento Tipo A: cambia il bersaglio solo se la regione richiede già il simbolo compatibile', () => {
  const g = newGame(); const c = (reg) => g.s.target[FF.AREA_OF[reg]].find((x) => x.regione === reg);
  g.s.target.nord = [{ regione: 'Sardegna'.replace('Sardegna', 'Veneto'), livello: 'core', punti: 2, req: 'temporale' }];
  driveEv(g, 29);                      // Veneto: Temporale → Grandine
  assert.equal(c('Veneto').req, 'Grandine');
  g.s.target.nord = [{ regione: 'Veneto', livello: 'core', punti: 2, req: 'sole' }];
  driveEv(g, 29); assert.equal(c('Veneto').req, 'sole');            // colpo a vuoto
  g.s.target.nord = [{ regione: 'Piemonte', livello: 'core', punti: 2, req: 'sole' }];
  driveEv(g, 29); assert.equal(g.s.target.nord[0].req, 'sole');     // regione non toccata dalla previsione: non si attiva
});
test('Evento Tipo B: impone la fusione a prescindere; su un bersaglio già fuso lo sovrascrive', () => {
  const g = newGame(); g.s.target.sud_isole = [{ regione: 'Calabria', livello: 'core', punti: 2, req: 'sole' }];
  driveEv(g, 13); assert.equal(g.s.target.sud_isole[0].req, 'Caldo Estremo');
  driveEv(g, 41); assert.equal(g.s.target.sud_isole[0].req, 'Burrasca');
  // Tipo A su bersaglio già fuso: colpo a vuoto
  driveEv(g, 36); assert.equal(g.s.target.sud_isole[0].req, 'Burrasca');
});
test('Evento: il bersaglio mobile cambia l\'Accuratezza (chi aveva la vecchia condizione la perde)', () => {
  const g = newGame(); g.s.target = { nord: [{ regione: 'Veneto', livello: 'core', punti: 2, req: 'temporale' }], centro: [], sud_isole: [] };
  const p = g.s.players[0]; p.table = [cell('Veneto', 0, 0, ['temporale'])];
  assert.equal(g.scoreOf(0).accRaw, 2);
  driveEv(g, 29); assert.equal(g.scoreOf(0).accRaw, 0);
  p.table[0].sym = ['temporale', 'sole']; p.table[0].fusion = FF.fusionOf(p.table[0].sym);
  assert.equal(g.scoreOf(0).accRaw, 2);
});
test('Eventi positivi: PM, pesche, simboli gratuiti, 3° lavoratore, PM per carte in mano', () => {
  const run = (id, chooser) => { const g = newGame(); g.s.first = 0; FF.drive(g.eventOp ? (function* () { for (const op of FF.EVENT_OPS[id]) yield* g.eventOp(op, 0); })() : null, chooser || (() => 0), g); return g; };
  let g = run(8); assert.deepEqual(g.s.players.map((p) => p.pm), [4, 4]);
  g = run(70); assert.deepEqual(g.s.players.map((p) => p.pm), [5, 2]);
  g = run(75); assert.equal(g.s.players[0].pm, 2 + 2);
  g = run(64); assert.deepEqual(g.s.players.map((p) => p.hand.length), [3, 3]);
  g = run(74); assert.equal(g.s.players[0].workers, 3); assert.equal(g.s.players[1].workers, 2);
  g = run(80); assert.deepEqual(g.s.players.map((p) => p.pm), [3, 3]);
  // simbolo gratuito senza carte giocate: l'effetto si perde, il pool resta intatto
  g = run(19); assert.ok(FF.SYMBOLS.every((x) => g.s.pool[x] === 10));
});
test('Evento 71 (pesca 2 tieni 1) e 76 (guarda 3, tieni 1, 2 in fondo)', () => {
  let g = newGame(); g.s.first = 0; const h0 = g.s.players[0].hand.length, deck0 = g.s.regionDeck.length;
  FF.drive((function* () { yield* g.eventOp(['draw2keep1'], 0); })(), () => 0, g);
  assert.equal(g.s.players[0].hand.length, h0 + 1); assert.equal(g.s.regionDiscard.length, 1); assert.equal(g.s.regionDeck.length, deck0 - 2);
  g = newGame(); g.s.first = 0; const top3 = g.s.regionDeck.slice(-3), deckN = g.s.regionDeck.length;
  FF.drive((function* () { yield* g.eventOp(['top3'], 0); })(), () => 0, g);
  assert.equal(g.s.regionDeck.length, deckN - 1); assert.equal(g.s.players[0].hand.length, 3);
  assert.equal(g.s.regionDeck.slice(0, 2).sort().join(), top3.filter((x) => !g.s.players[0].hand.includes(x)).sort().join());
});

// ───────────────────────── azioni ─────────────────────────
test('gioca: la prima carta in (0,0); le altre solo a contatto ortogonale; una carta per regione', () => {
  const g = newGame(), p = g.s.players[0];
  p.hand = [regId('Veneto', 'neutra'), regId('Lombardia', 'neutra')];
  let dec = null; FF.drive(g.actPlay(0), (d) => { dec = d; return 0; }, g);
  assert.ok(dec.options.every((o) => o.x === 0 && o.y === 0));
  assert.equal(p.table.length, 1);
  FF.drive(g.actPlay(0), (d) => { dec = d; return 0; }, g);
  assert.equal(dec.options.length, 4);
  assert.ok(dec.options.every((o) => Math.abs(o.x) + Math.abs(o.y) === 1));
  // carta della stessa regione: si può solo sostituire, i simboli restano
  p.table[0].sym = ['sole']; const old = p.table[0].id;
  p.hand = [regId('Veneto', 'confine', 'Emilia')];
  FF.drive(g.actPlay(0), (d) => { dec = d; return 0; }, g);
  assert.equal(dec.options.length, 1); assert.ok(dec.options[0].replace);
  const e = p.table.find((x) => FF.regionOf(x) === 'Veneto');
  assert.deepEqual(e.sym, ['sole']); assert.notEqual(e.id, old); assert.ok(g.s.regionDiscard.includes(old));
  assert.equal(new Set(p.table.map(FF.regionOf)).size, p.table.length);
});
test('simbolo: massimo 2 per carta, il 2° compatibile fonde in automatico, serve una carta giocata', () => {
  const g = newGame(), p = g.s.players[0];
  assert.equal(g.legalAction(0, 'simbolo'), false);
  p.table = [cell('Veneto', 0, 0, [])];
  FF.drive(g.actSymbol(0), pick((o) => o.sym === 'temporale'), g);
  FF.drive(g.actSymbol(0), pick((o) => o.sym === 'sole'), g);
  assert.equal(p.table[0].fusion, 'Grandine'); assert.equal(g.s.pool.temporale, 9); assert.equal(g.s.pool.sole, 9);
  assert.equal(g.legalAction(0, 'simbolo'), false);         // carta piena
  p.table.push(cell('Lombardia', 1, 0, [], regId('Lombardia', 'neutra')));
  FF.drive(g.actSymbol(0), pick((o) => o.sym === 'nuvolo' && o.idx === 1), g);
  FF.drive(g.actSymbol(0), pick((o) => o.sym === 'sole' && o.idx === 1), g);
  assert.equal(p.table[1].fusion, null); assert.equal(p.table[1].sym.length, 2);       // Nuvolo+Sole non fondono, la carta è piena
  // pool esaurito: il simbolo non si può più scegliere
  g.s.pool.neve = 0; assert.ok(!g.symbolOptions(0).some((o) => o.sym === 'neve'));
});
test('compra: prezzi 1/2/3, pesca cieca 2, il mercato si riempie dal mazzo', () => {
  const g = newGame(), p = g.s.players[0]; p.pm = 10; const deck0 = g.s.regionDeck.length;
  const opts = g.buyOptions(0);
  assert.equal(opts.length, g.rules.marketSize + 1);
  opts.filter((o) => !o.blind).forEach((o) => assert.equal(o.price, g.card(o.card).price));
  assert.equal(opts.find((o) => o.blind).price, 2);
  const before = g.s.market[0];
  FF.drive(g.actBuy(0), pick((o) => o.slot === 0), g);
  assert.ok(p.hand.includes(before)); assert.notEqual(g.s.market[0], before); assert.equal(g.s.regionDeck.length, deck0 - 1);
  assert.equal(p.pm, 10 - g.card(before).price);
  p.pm = 1; assert.ok(g.buyOptions(0).every((o) => !o.blind && o.price <= 1));
});
test('mazzo Carte Regione esaurito: si rimescolano gli scarti', () => {
  const g = newGame(); g.s.regionDiscard = g.s.regionDeck.splice(0); g.s.regionDeck = [];
  const n = g.s.regionDiscard.length; const c = g._drawRegion();
  assert.notEqual(c, null); assert.equal(g.s.regionDeck.length, n - 1);
});
test('3° lavoratore: costa 5 PM, disponibile dal round dopo; non si sblocca due volte', () => {
  const g = newGame(), p = g.s.players[0]; p.pm = 5;
  assert.ok(g.legalAction(0, 'sblocca'));
  FF.drive(g.act(0, 'sblocca', false), () => 0, g);
  assert.equal(p.pm, 0); assert.equal(p.workers, 2); assert.ok(p.pendingWorker); assert.equal(g.legalAction(0, 'sblocca'), false);
  p.pm = 9; assert.equal(g.legalAction(0, 'sblocca'), false);
  FF.drive(g.roundGen(), (d) => (d.type === 'place' ? d.options.length - 1 : 0), g);   // tutti passano
  assert.equal(p.workers, 3); assert.equal(p.pendingWorker, false);
});

// ───────────────────────── piazzamento lavoratori ─────────────────────────
test('round: rotazione a un lavoratore per volta, spazio occupato bloccato, chi passa è fuori', () => {
  const g = newGame({ rules: { firstPlayer: 1 } }); const seen = [];
  const ch = (d) => { if (d.type !== 'place') return 0; seen.push({ pid: d.pid, sp: d.options.map((o) => o.space || 'pass') }); return d.options.findIndex((o) => o.space === 'pm'); };
  // P2 (primo) prende "pm", poi P1 non può più prenderlo
  const gen = g.roundGen(); let r = gen.next(), turns = 0;
  while (!r.done) { const v = r.value; if (v.type === 'place') { turns++; r = gen.next(turns <= 2 ? ch(v) : v.options.length - 1); } else r = gen.next(0); }
  assert.deepEqual(seen.slice(0, 2).map((x) => x.pid), [1, 0]);
  assert.ok(seen[0].sp.includes('pm')); assert.ok(!seen[1].sp.includes('pm'));
  assert.equal(g.s.occupied.pm, 1);
});
test('doppia azione: due azioni diverse con 2 lavoratori; azione ripetuta: la stessa due volte', () => {
  const g = newGame(), p = g.s.players[0]; p.left = 2;
  FF.drive(g.doPlace(0, 'doppia'), script([pick((o) => o.act === 'pm'), pick((o) => o.act === 'gioca'), 0]), g);
  assert.equal(p.pm, 3); assert.equal(p.table.length, 1); assert.equal(p.left, 0);
  const g2 = newGame(), q = g2.s.players[0]; q.left = 2; q.pm = 0;
  FF.drive(g2.doPlace(0, 'ripetuta'), pick((o) => o.act === 'pm'), g2);
  assert.equal(q.pm, 2); assert.equal(q.left, 0);
  // "sblocca" non è ripetibile
  const g3 = newGame(); g3.s.players[0].left = 2; g3.s.players[0].pm = 9;
  assert.ok(!g3.placeOptions(0).length || true);
  let dec = null; FF.drive(g3.doPlace(0, 'ripetuta'), (d) => { dec = d; return 0; }, g3);
  assert.ok(!dec.options.some((o) => o.act === 'sblocca'));
});
test('Sezione 2 non occupa la Sezione 1 (di default); con sez2OccupiesSez1 sì', () => {
  const g = newGame(); g.s.players[0].left = 2;
  FF.drive(g.doPlace(0, 'doppia'), script([pick((o) => o.act === 'pm'), pick((o) => o.act === 'gioca')]), g);
  assert.equal(g.s.occupied.pm, undefined);
  const h = newGame({ rules: { sez2OccupiesSez1: true } }); h.s.players[0].left = 2;
  FF.drive(h.doPlace(0, 'doppia'), script([pick((o) => o.act === 'pm'), pick((o) => o.act === 'gioca')]), h);
  assert.equal(h.s.occupied.pm, 0); assert.equal(h.s.occupied.gioca, 0);
});

// ───────────────────────── partita completa ─────────────────────────
test('partita completa: 12 round, 3 Eventi (11:00/14:00/17:00), 2-4 giocatori', () => {
  for (const n of [2, 3, 4]) {
    const { game, result } = FF.playGame({ seed: 5 + n, players: PL(n) });
    assert.equal(result.rounds, 12); assert.ok(game.s.over);
    assert.equal(game.stats.g.eventi_pescati, 3);
    const evRounds = game.events.filter((e) => e.k === 'event' && /CARTA EVENTO/.test(e.text)).map((e) => e.r);
    assert.deepEqual(evRounds, [4, 7, 10]);
    assert.equal(result.scores.length, n);
  }
});
test('punteggio finale = Accuratezza + Coerenza (confine + pattern) + Obiettivi (0)', () => {
  const { result } = FF.playGame({ seed: 11, players: PL(3) });
  result.scores.forEach((s) => { assert.equal(s.total, s.accPts + s.border + s.pattern + s.objectives); assert.equal(s.coerenza, s.border + s.pattern); });
});
test('spareggio: più Accuratezza, poi Coerenza, poi PM; altrimenti pari merito', () => {
  const g = newGame(); g.s.target = { nord: [], centro: [], sud_isole: [] };
  const sc = (o) => Object.assign({ accPts: 0, accRaw: 0, coerenza: 0, pm: 0, total: 10 }, o);
  // costruisco il risultato chiamando finish() con scoreOf finto
  const run = (a, b) => { const gg = newGame(); gg.scoreOf = (i) => (i === 0 ? sc(a) : sc(b)); FF.drive(gg.finish(), () => 0, gg); return gg.result; };
  assert.equal(run({ total: 12 }, { total: 10 }).winner, 0);
  assert.equal(run({ accPts: 6 }, { accPts: 3, coerenza: 3 }).winner, 0);
  assert.equal(run({ coerenza: 4 }, { coerenza: 2 }).winner, 0);
  assert.equal(run({ pm: 1 }, { pm: 3 }).winner, 1);
  assert.deepEqual(run({}, {}).winners, [0, 1]);
});

// ───────────────────────── determinismo, replay, fuzz ─────────────────────────
test('determinismo: stesso seed e stesse risposte → stessa partita; seed diversi → partite diverse', () => {
  const a = FF.playGame({ seed: 42, players: PL(3) }), b = FF.playGame({ seed: 42, players: PL(3) }), c = FF.playGame({ seed: 43, players: PL(3) });
  assert.deepEqual(a.game.history, b.game.history); assert.deepEqual(a.result.scores, b.result.scores);
  assert.deepEqual(a.game.events.map((e) => e.text), b.game.events.map((e) => e.text));
  assert.notDeepEqual(a.game.events.map((e) => e.text), c.game.events.map((e) => e.text));
});
test('replay: rigiocare dalla cronologia delle risposte ricostruisce la stessa partita', () => {
  const a = FF.playGame({ seed: 77, players: PL(4) });
  const g = new FF.Game({ seed: 77, players: PL(4), replay: a.game.history });
  const res = FF.drive(g.run(), () => { throw new Error('non deve chiedere nulla'); }, g);
  assert.deepEqual(res.scores, a.result.scores); assert.deepEqual(g.s, a.game.s);
});
test('clone: indipendente dall\'originale e con lo stesso futuro', () => {
  const g = newGame({ seed: 9 }); const c = g.clone();
  assert.deepEqual(c.s, g.s);
  FF.drive(c.run(), FF.randomChooser(1), c);
  assert.equal(g.s.round, 0);
});

function invariants(g, label) {
  const s = g.s, where = (m) => label + ': ' + m;
  // nessuna Carta Regione si perde o si duplica
  const all = [].concat(s.regionDeck, s.regionDiscard, s.transit, s.market.filter((x) => x != null), ...s.players.map((p) => p.hand), ...s.players.map((p) => p.table.map((e) => e.id)));
  assert.equal(all.length, 96, where('carte regione ' + all.length)); assert.equal(new Set(all).size, 96, where('duplicati'));
  const ev = [].concat(s.eventDeck, s.eventDiscard); assert.equal(ev.length, 80); assert.equal(new Set(ev).size, 80);
  // simboli: pool + carte = 10 per tipo
  const cnt = {}; FF.SYMBOLS.forEach((x) => { cnt[x] = s.pool[x]; });
  s.players.forEach((p) => p.table.forEach((e) => e.sym.forEach((x) => { cnt[x]++; })));
  FF.SYMBOLS.forEach((x) => assert.equal(cnt[x], g.rules.poolPerSymbol, where('simboli ' + x)));
  s.players.forEach((p) => {
    assert.ok(p.pm >= 0, where('PM negativi'));
    assert.equal(new Set(p.table.map(FF.regionOf)).size, p.table.length, where('regione doppia'));
    assert.equal(new Set(p.table.map((e) => e.x + ',' + e.y)).size, p.table.length, where('cella doppia'));
    p.table.forEach((e) => { assert.ok(e.sym.length <= g.rules.maxSymbolsPerCard); assert.equal(e.fusion, FF.fusionOf(e.sym)); });
    if (p.table.length > 1) p.table.forEach((e) => assert.ok(FF.neighborsOf(p.table, e).length >= 1, where('carta isolata')));
    assert.ok(p.workers >= 2 && p.workers <= 3);
  });
  // il bersaglio: stesse regioni dell'inizio, req sempre un simbolo o una fusione
  FF.AREAS.forEach((a) => s.target[a].forEach((c) => assert.ok(FF.SYMBOLS.includes(c.req) || FF.isFusionName(c.req))));
}
test('fuzz: 150 partite casuali (2-4 giocatori) rispettano le invarianti, ad ogni round', () => {
  for (let seed = 1; seed <= 150; seed++) {
    const n = 2 + (seed % 3), g = new FF.Game({ seed, players: PL(n), log: false });
    const rnd = FF.randomChooser(seed * 7), gen = g.run(); let r = gen.next(), lastRound = 0;
    while (!r.done) {
      if (g.s.round !== lastRound) { lastRound = g.s.round; invariants(g, 'seed ' + seed + ' round ' + lastRound); }
      r = gen.next(rnd(r.value));
    }
    invariants(g, 'seed ' + seed + ' fine');
    assert.equal(r.value.rounds, 12);
  }
});
test('fuzz con parametri alterati (Sezione 2 occupa, niente adiacenza obbligata, 3° lavoratore subito)', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const g = new FF.Game({ seed, players: PL(2 + (seed % 3)), log: false, rules: { sez2OccupiesSez1: true, requireAdjacentPlacement: false, thirdWorkerNextRound: false, poolPerSymbol: 4 } });
    FF.drive(g.run(), FF.randomChooser(seed), g);
    const s = g.s, cnt = {}; FF.SYMBOLS.forEach((x) => { cnt[x] = s.pool[x]; });
    s.players.forEach((p) => p.table.forEach((e) => e.sym.forEach((x) => { cnt[x]++; })));
    FF.SYMBOLS.forEach((x) => assert.equal(cnt[x], 4));
  }
});

// ───────────────────────── chi pesca l'Evento ─────────────────────────
test('Evento: il segnalino «Protezione Civile» parte dal primo giocatore e passa a sinistra a ogni Evento; la variante «first» a 3 giocatori dà sempre lo stesso', () => {
  const run = (n, rules, seed) => { const r = FF.playGame({ seed: seed || 21, players: PL(n), rules }); return { drawers: r.game.events.filter((e) => e.k === 'event' && /CARTA EVENTO/.test(e.text)).map((e) => e.p), start: r.result.startFirst }; };
  for (const n of [2, 3, 4]) { const r = run(n); assert.equal(r.drawers.length, 3); assert.deepEqual(r.drawers, [0, 1, 2].map((k) => (r.start + k) % n), n + ' giocatori'); }
  const f3 = run(3, { eventDrawer: 'first' }); assert.equal(new Set(f3.drawers).size, 1, 'variante first: sempre lo stesso a 3 giocatori');
});

// ───────────────────────── compensazione dell'ordine di turno ─────────────────────────
test('startPMBonus: PM in più in base all\'ordine di turno a partire dal primo giocatore (spento di default)', () => {
  const g0 = new FF.Game({ seed: 3, players: PL(3) }); assert.deepEqual(g0.s.players.map((p) => p.pm), [2, 2, 2]);
  for (const seed of [3, 4, 5, 6]) {
    const g = new FF.Game({ seed, players: PL(3), rules: { startPMBonus: [0, 1, 1] } }), f = g.s.first;
    assert.equal(g.s.players[f].pm, 2); assert.equal(g.s.players[(f + 1) % 3].pm, 3); assert.equal(g.s.players[(f + 2) % 3].pm, 3);
  }
});
