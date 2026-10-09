'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const FF = require('./_load.js');
require('../js/sim.js');

const PL = (n, lv) => Array.from({ length: n }, (_, i) => ({ name: 'P' + (i + 1), kind: 'ai', level: lv || 'medium' }));

test('AI: tutti i livelli scelgono sempre un indice valido (2-4 giocatori) e finiscono la partita', () => {
  for (const level of ['easy', 'medium', 'hard']) for (const n of [2, 3, 4]) {
    const g = new FF.Game({ seed: 'v' + level + n, players: PL(n, level), log: false });
    const ai = g.s.players.map((p) => FF.AI.create(level, 'x' + p.id));
    const res = FF.drive(g.run(), (d) => { const a = ai[d.pid].decide(g, d); assert.ok(Number.isInteger(a) && a >= 0 && a < d.options.length, level + ' ' + d.type); return a; }, g);
    assert.equal(res.rounds, 12);
  }
});

test('AI: determinismo — stesso seed, stessa partita', () => {
  const a = FF.Sim.playOne(3, { a: 'hard', b: 'medium', seed: 'det', players: 2 }), b = FF.Sim.playOne(3, { a: 'hard', b: 'medium', seed: 'det', players: 2 });
  assert.deepEqual(a.g.history, b.g.history); assert.deepEqual(a.res.scores, b.res.scores);
});

// Informazione nascosta: rimescolando ciò che l'AI non può sapere (mani altrui, ordine dei mazzi) la decisione NON deve cambiare.
function scramble(game, pid, rng) {
  const g = game.clone(), s = g.s, shuf = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pool = s.regionDeck.slice(); s.players.forEach((p, q) => { if (q !== pid) pool.push(...p.hand); });
  shuf(pool); s.players.forEach((p, q) => { if (q !== pid) p.hand = pool.splice(0, p.hand.length); }); s.regionDeck = pool;
  const peek = s.players[pid].peek;
  const ev = s.eventDeck.slice(); const top = peek != null ? ev.pop() : null; shuf(ev); if (top != null) ev.push(top); s.eventDeck = ev;
  return g;
}
test('AI: non sbircia — la decisione non cambia se si rimescolano mani altrui, mazzo Regioni e mazzo Eventi', () => {
  let checked = 0;
  for (const level of ['easy', 'medium', 'hard']) {
    const g = new FF.Game({ seed: 'hid-' + level, players: PL(3, level), log: false });
    const rnd = FF.randomChooser(5), types = {};
    FF.drive(g.run(), (d) => {
      if (checked < 400 && g.s.round >= 1) {
        const g2 = scramble(g, d.pid, FF.makeRng('s' + checked));
        const a1 = FF.AI.create(level, 'same').decide(g, d), a2 = FF.AI.create(level, 'same').decide(g2, d);
        assert.equal(a1, a2, `decisione diversa (${level}, ${d.type}, round ${g.s.round}): l'AI usa informazione nascosta`); checked++; types[d.type] = 1;
      }
      return rnd(d);
    }, g);
    assert.ok(types.place && types.symbol, 'il test deve toccare piazzamenti e simboli');
  }
  assert.ok(checked > 200);
});
test('AI: determinize — nessuna carta si perde o si duplica e le mani hanno la stessa taglia', () => {
  const g = new FF.Game({ seed: 'dz2', players: PL(3), log: false }); const rnd = FF.randomChooser(2); let done = false;
  const it = g.run(); let r = it.next();
  while (!r.done && !done) {
    if (g.s.round >= 5 && r.value.type === 'place') {
      const g2 = FF.AI.determinize(g, 1, FF.makeRng('d'));
      const all = [].concat(g2.s.regionDeck, g2.s.regionDiscard, g2.s.transit, g2.s.market.filter((x) => x != null), ...g2.s.players.map((p) => p.hand), ...g2.s.players.map((p) => p.table.map((e) => e.id)));
      assert.equal(all.length, 96); assert.equal(new Set(all).size, 96);
      g.s.players.forEach((p, q) => assert.equal(g2.s.players[q].hand.length, p.hand.length));
      assert.deepEqual(g2.s.players[1].hand, g.s.players[1].hand);          // la mia mano resta quella vera
      assert.deepEqual(g2.s.market, g.s.market);                            // il mercato è pubblico
      assert.equal(g2.s.eventDeck.length + g2.s.eventDiscard.length, 80);
      done = true;
    }
    r = it.next(rnd(r.value));
  }
  assert.ok(done);
});

test('AI: i livelli sono ordinati (facile < media < difficile) — 120 partite per confronto, posti alternati', () => {
  const wins = (a, b) => FF.Sim.run({ games: 120, seed: 'ord-' + a + b, a, b, players: 2 }).aWins;
  const me = wins('medium', 'easy'), hm = wins('hard', 'medium');
  assert.ok(me / 120 > 0.7, 'la media deve battere la facile molto spesso: ' + me);
  assert.ok(hm / 120 > 0.5, 'la difficile deve battere la media: ' + hm);
});
test('AI: pesa gli scaglioni dell\'Accuratezza e non regala punti — evalPlayer cresce con le condizioni soddisfatte', () => {
  const g = new FF.Game({ seed: 'ev', players: PL(2), log: false }), P = FF.AI.PARAMS.hard;
  const base = FF.AI.evalPlayer(g, 0, P), p = g.s.players[0];
  const c = g.s.target.nord[0]; const id = FF.REGION_CARDS.find((x) => x.regione === c.regione && x.variante === 'neutra').id;
  p.table = [{ id, x: 0, y: 0, sym: [], fusion: null }]; const withCard = FF.AI.evalPlayer(g, 0, P);
  p.table[0].sym = [c.req]; const withSym = FF.AI.evalPlayer(g, 0, P);
  assert.ok(withSym > withCard && withCard > base - 0.5, `${base} ${withCard} ${withSym}`);
});
test('simulatore: Wilson e media con intervallo di confidenza', () => {
  const w = FF.Sim.wilson(50, 100); assert.ok(w[0] < 0.5 && w[1] > 0.5 && w[0] > 0.39 && w[1] < 0.61);
  const m = FF.Sim.meanCI(4, 10, 30); assert.equal(m.m, 2.5);
  const r = FF.Sim.run({ games: 6, seed: 'rep', a: 'easy', b: 'easy', players: 3 }); assert.equal(r.n, 6); assert.ok(/Simulazione/.test(FF.Sim.report(r)));
});
