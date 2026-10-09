/* DOMANI PIOVE — intelligenza artificiale.
   Tre livelli:
   - easy   : spesso a caso; quando ragiona, guarda solo il guadagno immediato e con molto rumore
   - medium : valuta ogni mossa simulandola sul motore (clone) e confrontando il valore stimato dello stato; poco rumore
   - hard   : come medium, ma tiene conto degli avversari (nega gli spazi e le carte del mercato che servono a loro),
              pianifica meglio il budget di azioni che restano e quasi non sbaglia
   Informazione nascosta: l'AI NON legge le mani degli altri né l'ordine dei mazzi (Carte Regione, Carte Evento).
   Per decidere costruisce con `determinize` un clone del gioco in cui le carte ignote sono ricampionate a caso tra
   quelle davvero ignote: il motore stesso fa da modello in avanti. Un test verifica che la decisione non cambi se si
   rimescola ciò che l'AI non può sapere.
   Come valuta uno stato (evalPlayer): punti già fatti + "potenziale" = quante condizioni della previsione riesce ancora
   a completare con il budget di azioni che le restano (knapsack: prima quelle che rendono di più per azione),
   + Coerenza Geografica (confine e pattern, contando anche i simboli già pianificati) + piccoli valori per PM e carte in mano. */
(function (root) {
  'use strict';
  const FF = (root.FF = root.FF || {});
  const AI = (FF.AI = {});
  FF.AI_LEVELS = { easy: 'Facile', medium: 'Media', hard: 'Difficile' };

  // parametri dei livelli (si possono sovrascrivere per fare esperimenti: AI.create(level, seed, {eff: 0.6}))
  AI.PARAMS = {
    easy:   { random: 0.55, noise: 1.2, eff: 0.5, potW: 1, rho: 0.78, patW: 0.4, pmW: 0.06, oppW: 0, denial: 0, handW: 0.1, buyPrice: 1.5, noMarketCost: 3.5, passEps: 0.05 },
    medium: { random: 0.06, noise: 0.35, eff: 0.65, potW: 1, rho: 0.84, patW: 0.7, pmW: 0.07, oppW: 0.15, denial: 0, handW: 0.1, buyPrice: 1.5, noMarketCost: 3.5, passEps: 0.05 },
    hard:   { random: 0, noise: 0.03, eff: 0.7, potW: 1, rho: 0.86, patW: 0.8, pmW: 0.07, oppW: 0.35, denial: 0.6, handW: 0.1, buyPrice: 1.5, noMarketCost: 3.5, passEps: 0.05 },
  };

  // ───────────────────────── informazione: cosa può sapere un giocatore ─────────────────────────
  // Ricostruisce un clone del gioco dal punto di vista di `pid`: le carte che non può conoscere sono ricampionate.
  AI.determinize = function (game, pid, rng) {
    const g = game.clone(), s = g.s;
    const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    // Carte Regione: note = mia mano + tutti i tavoli + mercato + scarti + carte in transito
    const known = new Set();
    s.players[pid].hand.forEach((c) => known.add(c));
    s.players.forEach((p) => p.table.forEach((e) => known.add(e.id)));
    s.market.forEach((c) => { if (c != null) known.add(c); });
    s.regionDiscard.forEach((c) => known.add(c));
    s.transit.forEach((c) => known.add(c));
    const unknown = shuffle(FF.REGION_CARDS.map((c) => c.id).filter((id) => !known.has(id)));   // ordine canonico → poi rimescolato
    s.players.forEach((p, q) => { if (q !== pid) p.hand = unknown.splice(0, game.s.players[q].hand.length); });
    s.regionDeck = unknown;
    // Carte Evento: note = scartate (e la prossima, se l'ho guardata); il resto è in ordine ignoto
    const peek = s.players[pid].peek, eknown = new Set(s.eventDiscard);
    if (peek != null) eknown.add(peek);
    const eunk = shuffle(FF.EVENT_IDS.filter((id) => !eknown.has(id)));
    if (peek != null && s.eventDeck.length) eunk.push(peek);   // la cima è la carta che ho visto
    s.eventDeck = eunk;
    s.players.forEach((p, q) => { if (q !== pid) p.peek = null; });
    s.rng = Math.floor(rng() * 2147483647) | 0;   // i dadi del motore veri non si conoscono
    return g;
  };

  // ───────────────────────── valutazione di uno stato ─────────────────────────
  // Accuratezza "morbida": interpola tra i centri degli scaglioni (0 | 1-6 | 7-10 | 11-13 | 14-15) per poter pianificare
  const smoothCache = new WeakMap();
  function smoothPts(R) {   // punti (centro dello scaglione → punti dello scaglione) ricavati dalla scala delle regole in uso
    let pts = smoothCache.get(R.accuracy);
    if (!pts) { pts = R.accuracy.map((t) => [(t.from + Math.min(t.to, 15)) / 2, t.pts]); if (pts[0][0] > 0) pts.unshift([0, 0]); pts.push([15, pts[pts.length - 1][1]]); smoothCache.set(R.accuracy, pts); }
    return pts;
  }
  function smooth(raw, R) {
    const SM = smoothPts(R);
    if (raw <= 0) return 0;
    for (let i = 1; i < SM.length; i++) if (raw <= SM[i][0]) { const a = SM[i - 1], b = SM[i]; return b[0] === a[0] ? b[1] : a[1] + (b[1] - a[1]) * (raw - a[0]) / (b[0] - a[0]); }
    return SM[SM.length - 1][1];
  }
  // quanti simboli mancano su una carta per soddisfare req (−1 = impossibile: simboli sbagliati o carta piena/fusa)
  function symbolsNeeded(sym, fusion, req, M) {
    if (fusion) return -1;
    if (FF.isFusionName(req)) {
      const rem = FF.FUSIONS.find((f) => f.name === req).recipe.slice();
      for (const x of sym) { const i = rem.indexOf(x); if (i < 0) return -1; rem.splice(i, 1); }
      return sym.length + rem.length > M ? -1 : rem.length;
    }
    if (sym.indexOf(req) >= 0) return 0;
    if (sym.length >= M) return -1;
    if (sym.length === 1 && FF.fusionOf([sym[0], req])) return -1;
    return 1;
  }
  // azioni che restano al giocatore p (stima): i lavoratori di questo round + i round futuri, scontati per la concorrenza sugli spazi
  function actionsLeft(g, p, P) {
    const s = g.s, after = Math.max(0, g.rules.rounds - s.round);
    return (p.passed ? 0 : p.left * 0.9) + after * (p.workers + (p.pendingWorker ? 1 : 0)) * P.eff;
  }
  const regionName = (id) => FF.REGION_CARDS[id].regione;

  // analisi del bersaglio per un giocatore (p può essere un oggetto "ipotetico" con table/hand/pm/left/workers)
  function analyze(g, p, P) {
    const s = g.s, M = g.rules.maxSymbolsPerCard, table = p.table, items = []; let raw = 0;
    const virt = table.map((e) => ({ id: e.id, x: e.x, y: e.y, sym: e.sym.slice(), fusion: e.fusion }));
    const inMarket = new Set(s.market.filter((c) => c != null).map(regionName));
    for (const a of FF.AREAS) for (const c of s.target[a]) {
      if (FF.condMet(table, c)) { raw += c.punti; continue; }
      const idx = table.findIndex((e) => FF.regionOf(e) === c.regione), e = idx >= 0 ? table[idx] : null;
      let need, buy = false;
      if (e) { const n = symbolsNeeded(e.sym, e.fusion, c.req, M); if (n < 0) continue; need = n; }
      else {
        const n = symbolsNeeded([], null, c.req, M); if (n < 0) continue;
        const inHand = p.hand.some((id) => regionName(id) === c.regione);
        need = n + 1 + (inHand ? 0 : 1); buy = !inHand;
        if (buy && !inMarket.has(c.regione)) need += P.noMarketCost - 1;   // non c'è in mercato: serve fortuna (pesca alla cieca)
      }
      items.push({ c, need: Math.max(0.3, need), buy, idx, base: !FF.isFusionName(c.req) });
    }
    items.sort((x, y) => y.c.punti / y.need - x.c.punti / x.need);
    let budget = actionsLeft(g, p, P), pm = p.pm, pot = 0;
    for (const it of items) {
      if (budget <= 0) break;
      const costPm = it.buy ? Math.max(0, P.buyPrice - pm) : 0, cost = it.need + costPm, frac = Math.min(1, budget / cost);
      pot += frac * it.c.punti * Math.pow(P.rho, it.need); budget -= frac * cost;   // ogni azione che ancora manca abbassa la probabilità di riuscirci
      if (it.buy) pm = Math.max(0, pm - P.buyPrice * frac);
      if (frac > 0.99 && it.idx >= 0 && it.base && virt[it.idx].sym.length < M) virt[it.idx].sym.push(it.c.req);   // simbolo "pianificato" per i pattern
    }
    return { raw, pot, virt };
  }
  // valore di un giocatore (più alto = meglio)
  function evalPlayer(g, p, P) {
    const R = g.rules, A = analyze(g, p, P), rawNow = A.raw;
    const accNow = FF.accuracyScore(p.table, g.s.target, R).pts;
    // finché c'è tempo per fare progressi vale la stima morbida (così ogni condizione completata non fa mai perdere valore);
    // quando il potenziale si esaurisce conta sempre di più il gradino vero della scala
    const w = Math.min(1, A.pot / 1.2), acc = (1 - w) * accNow + w * smooth(Math.min(15, rawNow + P.potW * A.pot), R);
    const border = FF.borderScore(p.table, R).total, pat = FF.patternScore(A.virt, R).total, patNow = FF.patternScore(p.table, R).total;
    const cap = (x) => (R.coerCap == null ? x : Math.min(R.coerCap, x)), coerNow = cap(border + patNow), coerPlan = cap(border + pat);
    let v = (P.accW == null ? 1 : P.accW) * acc + (P.coerW == null ? 1 : P.coerW) * (coerNow + P.patW * Math.max(0, coerPlan - coerNow));   // accW/coerW: pesi per le strategie estreme dei test
    // carte in mano con un bonus di confine già soddisfatto: valgono +1 appena giocate
    const owned = new Set(p.table.map(FF.regionOf)); p.hand.forEach((id) => owned.add(regionName(id)));
    let hb = 0;
    for (const id of p.hand) {
      const b = FF.REGION_CARDS[id].bonus; if (!b) continue;
      if ((b.tipo === 'confine' ? b.verso : b.se_giocata_una_di).some((r) => owned.has(r) && r !== regionName(id))) hb += 1;
    }
    const left = Math.min(1, actionsLeft(g, p, P) / 8);
    v += P.handW * p.hand.length * left + 0.7 * hb * left;
    v += p.pm * P.pmW * left;
    return v;
  }
  AI.evalPlayer = (g, pid, P) => evalPlayer(g, g.s.players[pid], P || AI.PARAMS.hard);

  // ───────────────────────── scelta ─────────────────────────
  AI.create = function (level, seed, params) {
    const P = Object.assign({}, AI.PARAMS[level] || AI.PARAMS.medium, params || {});
    const rng = FF.makeRng(seed == null ? 1 : seed);

    // guadagno di uno stato rispetto a quello di partenza: io − oppW × media degli avversari
    function stateValue(g, pid) {
      const s = g.s; let v = evalPlayer(g, s.players[pid], P);
      if (P.oppW) { let o = 0, n = 0; s.players.forEach((q, i) => { if (i !== pid) { o += evalPlayer(g, q, P); n++; } }); v -= P.oppW * o / Math.max(1, n); }
      return v;
    }
    // simula un'azione/piazzamento sul clone, con le scelte annidate fatte dalla stessa AI (voraci)
    function simulate(g, pid, fn, depth) {
      const g2 = g.clone();
      FF.drive(fn(g2), (dec) => choose(g2, dec, depth + 1), g2);
      return g2;
    }
    // valori dell'utilità di una carta Regione in mano: variazione del valore del giocatore se la tiene
    function handDelta(g, pid, addIds, removeIds) {
      const p = g.s.players[pid], base = evalPlayer(g, p, P);
      const hand = p.hand.filter((id) => !(removeIds || []).includes(id)).concat(addIds || []);
      return evalPlayer(g, Object.assign({}, p, { hand }), P) - base;
    }

    // Valore di ogni opzione di una decisione (più alto = meglio). depth > 0: scelta annidata dentro una simulazione.
    function scoreOptions(g, dec, depth) {
      const s = g.s, pid = dec.pid, p = s.players[pid], base = evalPlayer(g, p, P), out = [];
      switch (dec.type) {
        case 'play':
          return dec.options.map((o) => {
            const hand = p.hand.filter((id) => id !== o.card);
            let table;
            if (o.replace) { table = p.table.map((e) => ({ id: FF.regionOf(e) === regionName(o.card) ? o.card : e.id, x: e.x, y: e.y, sym: e.sym, fusion: e.fusion })); }
            else table = p.table.concat([{ id: o.card, x: o.x, y: o.y, sym: [], fusion: null }]);
            return evalPlayer(g, Object.assign({}, p, { table, hand, left: p.left }), P) - base;
          });
        case 'symbol':
          return dec.options.map((o) => {
            const table = p.table.map((e, i) => { if (i !== o.idx) return e; const sym = e.sym.concat([o.sym]); return { id: e.id, x: e.x, y: e.y, sym, fusion: FF.fusionOf(sym) }; });
            return evalPlayer(g, Object.assign({}, p, { table }), P) - base;
          });
        case 'buy': {
          const sample = s.regionDeck.slice(-14);
          let blindAvg = null;
          return dec.options.map((o) => {
            let gain;
            if (o.blind) { if (blindAvg == null) blindAvg = sample.length ? sample.reduce((a, id) => a + handDelta(g, pid, [id]), 0) / sample.length : 0; gain = blindAvg; }
            else gain = handDelta(g, pid, [o.card]);
            return gain - o.price * P.pmW * Math.min(1, actionsLeft(g, p, P) / 8);
          });
        }
        case 'doppia1': case 'doppia2': case 'ripetuta':
          return dec.options.map((o) => {
            const g2 = simulate(g, pid, (x) => x.act(pid, o.act, false), depth);
            let v = evalPlayer(g2, g2.s.players[pid], P);
            if (dec.type === 'ripetuta' && g2.legalAction(pid, o.act)) { const g3 = simulate(g2, pid, (x) => x.act(pid, o.act, false), depth); v = evalPlayer(g3, g3.s.players[pid], P); }
            return v - base;
          });
        case 'keep': return dec.options.map((o) => handDelta(g, pid, [o.card]));
        case 'order': return dec.options.map((o, i) => -i);
        case 'swap': return dec.options.map((o) => (o.skip ? 0.05 : handDelta(g, pid, [o.card], [o.hand])));
        case 'revise': {
          const sample = s.regionDeck.slice(-8), avg = sample.length ? sample.reduce((a, id) => a + handDelta(g, pid, [id]), 0) / sample.length : 0;
          return dec.options.map((o) => (o.skip ? 0.02 : handDelta(g, pid, [], [o.discard]) + avg));
        }
        case 'place': {
          const v0 = stateValue(g, pid);
          const passed = g.clone(); passed.s.players[pid].passed = true;   // passare ha un costo: i lavoratori che restano si perdono
          const vPass = stateValue(passed, pid) - v0;
          const vals = dec.options.map((o) => (o.pass ? vPass : stateValue(simulate(g, pid, (x) => x.doPlace(pid, o.space), depth), pid) - v0));
          // negazione: quanto guadagnerebbe un avversario che deve ancora giocare se prendesse questo stesso spazio
          if (P.denial > 0 && depth === 0) {
            const order = vals.map((v, i) => i).filter((i) => !dec.options[i].pass).sort((a, b) => vals[b] - vals[a]).slice(0, 3);
            for (const i of order) {
              const sp = dec.options[i].space; let worst = 0;
              for (const q of s.players) {
                if (q.id === pid || q.passed || q.left < 1 || !g.placeOptions(q.id).some((o) => o.space === sp)) continue;
                const before = evalPlayer(g, q, P), g3 = simulate(g, q.id, (x) => x.doPlace(q.id, sp), 1);
                worst = Math.max(worst, evalPlayer(g3, g3.s.players[q.id], P) - before);
              }
              vals[i] += P.denial * 0.5 * worst;
            }
          }
          return vals;
        }
        default: return dec.options.map(() => 0);
      }
    }

    function choose(g, dec, depth) {
      const n = dec.options.length;
      if (n === 1) return 0;
      if (depth > 0 && level === 'easy' && rng() < P.random) return Math.floor(rng() * n);
      if (depth === 0 && P.random && rng() < P.random) {
        // scelta a caso, ma "umana": mai passare se esistono altre mosse
        const cand = dec.options.map((o, i) => i).filter((i) => !dec.options[i].pass);
        const pool = cand.length ? cand : dec.options.map((o, i) => i);
        return pool[Math.floor(rng() * pool.length)];
      }
      const vals = scoreOptions(g, dec, depth);
      let best = -1, bv = -Infinity;
      vals.forEach((v, i) => {
        let x = v + (P.noise ? (rng() - 0.5) * 2 * P.noise : 0);
        if (x > bv) { bv = x; best = i; }
      });
      return best;
    }

    return {
      level, params: P,
      decide(game, dec) {
        const g = AI.determinize(game, dec.pid, rng);   // vede solo ciò che può sapere
        return choose(g, dec, 0);
      },
      // per il suggerimento in app: valori stimati di ogni opzione (senza rumore né casualità)
      rank(game, dec) {
        const g = AI.determinize(game, dec.pid, rng);
        return scoreOptions(g, dec, 0);
      },
    };
  };
  AI.suggest = function (game, dec) {
    const ai = AI.create('hard', 'suggest-' + game.s.round + '-' + dec.pid, { random: 0, noise: 0 });
    const vals = ai.rank(game, dec); let best = -1, bv = -Infinity;
    vals.forEach((v, i) => { if (v > bv) { bv = v; best = i; } });
    return { index: best, value: bv, values: vals };
  };
  FF.RandomBot = function (seed) {
    const rng = FF.makeRng(seed);
    return { level: 'random', decide(game, dec) { return Math.floor(rng() * dec.options.length); } };
  };
})(typeof window !== 'undefined' ? window : globalThis);
