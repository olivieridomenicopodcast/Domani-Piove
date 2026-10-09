/* DOMANI PIOVE — simulazione di partite AI vs AI in blocco e statistiche.
   N giocatori (2-4): il profilo A siede a rotazione in tutti i posti (posti alternati), gli altri posti hanno il profilo B.
   Con due profili uguali, A vince in media 1 partita su N. */
(function (root) {
  'use strict';
  const FF = (root.FF = root.FF || {});
  const Sim = (FF.Sim = {});

  function wilson(k, n) { // intervallo di confidenza 95% di una proporzione
    if (!n) return [0, 0];
    const z = 1.96, p = k / n, d = 1 + z * z / n;
    const c = (p + z * z / (2 * n)) / d, h = (z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))) / d;
    return [Math.max(0, c - h), Math.min(1, c + h)];
  }
  Sim.wilson = wilson;
  function meanCI(n, s1, s2) { // media ± intervallo di confidenza 95% da somme (n, Σx, Σx²)
    if (!n) return { m: 0, lo: 0, hi: 0 };
    const m = s1 / n, v = n > 1 ? Math.max(0, (s2 - s1 * s1 / n) / (n - 1)) : 0, h = 1.96 * Math.sqrt(v / n);
    return { m, lo: m - h, hi: m + h };
  }
  Sim.meanCI = meanCI;

  /* opts: { games, seed, players:2-4, rules, a:'hard', b:'medium', aParams, bParams, swap:true, log:false } */
  Sim.playOne = function (i, opts) {
    const n = opts.players || 2, swap = opts.swap !== false, aSeat = swap ? i % n : 0, seed = opts.seed + '#' + i;
    const levels = []; for (let p = 0; p < n; p++) levels.push(p === aSeat ? opts.a : opts.b);
    const players = levels.map((lv, p) => ({ name: (p === aSeat ? 'A·' : 'B·') + (p + 1) + ' ' + lv, kind: 'ai', level: lv }));
    const g = new FF.Game({ seed, rules: opts.rules, log: !!opts.log, stats: true, players });
    const ai = levels.map((lv, p) => FF.AI.create(lv, seed + 'ai' + p, p === aSeat ? opts.aParams : opts.bParams));
    const res = FF.drive(g.run(), (d) => ai[d.pid].decide(g, d), g);
    return { g, res, aSeat, seed, levels };
  };

  // aggrega N partite
  Sim.run = function (opts, onProgress) {
    const n = opts.games, np = opts.players || 2;
    const agg = { opts: Object.assign({}, opts), n: 0, players: np, aWins: 0, bWins: 0, draws: 0, seatWins: new Array(np).fill(0), seatN: new Array(np).fill(0), firstWins: 0, firstN: 0,
      diff: { n: 0, s1: 0, s2: 0 }, scoreA: { n: 0, s1: 0, s2: 0 }, scoreB: { n: 0, s1: 0, s2: 0 }, acc: { A: { n: 0, s1: 0, s2: 0 }, B: { n: 0, s1: 0, s2: 0 } }, accPts: { A: [0, 0, 0, 0, 0], B: [0, 0, 0, 0, 0] },
      coer: { A: 0, B: 0 }, border: { A: 0, B: 0 }, pattern: { A: 0, B: 0 }, stats: { A: {}, B: {}, g: {} }, nA: 0, nB: 0, placements: { n: 0, s1: 0, s2: 0, hist: {} }, ms: 0, games: [] };
    const add = (o, x) => { o.n++; o.s1 += x; o.s2 += x * x; };
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const { g, res, aSeat } = Sim.playOne(i, opts);
      agg.n++;
      const w = res.winner;
      if (w == null) agg.draws++; else if (w === aSeat) agg.aWins++; else agg.bWins++;
      if (w != null) agg.seatWins[w]++;
      for (let p = 0; p < np; p++) agg.seatN[p]++;
      if (w != null) { agg.firstN++; if (w === res.startFirst) agg.firstWins++; }
      const bs = res.scores.map((sc, p) => p).filter((p) => p !== aSeat), sa = res.scores[aSeat].total, sbAvg = bs.reduce((a, p) => a + res.scores[p].total, 0) / bs.length;
      add(agg.diff, sa - sbAvg); add(agg.scoreA, sa); bs.forEach((p) => add(agg.scoreB, res.scores[p].total));
      const tag = (p) => (p === aSeat ? 'A' : 'B');
      res.scores.forEach((sc, p) => {
        const t = tag(p); add(agg.acc[t], sc.accRaw);
        const k = sc.accPts === 0 ? 0 : sc.accPts === 3 ? 1 : sc.accPts === 6 ? 2 : sc.accPts === 10 ? 3 : 4; agg.accPts[t][k]++;
        agg.coer[t] += sc.coerenza; agg.border[t] += sc.border; agg.pattern[t] += sc.pattern;
        if (t === 'A') agg.nA++; else agg.nB++;
        for (const k2 in g.stats.p[p]) agg.stats[t][k2] = (agg.stats[t][k2] || 0) + g.stats.p[p][k2];
      });
      for (const k2 in g.stats.g) agg.stats.g[k2] = (agg.stats.g[k2] || 0) + g.stats.g[k2];
      let pl = 0; for (let p = 0; p < np; p++) pl += (g.stats.p[p].spazio_gioca || 0) + (g.stats.p[p].spazio_compra || 0) + (g.stats.p[p].spazio_simbolo || 0) + (g.stats.p[p].spazio_pm || 0) + (g.stats.p[p].spazio_sblocca || 0) + 2 * ((g.stats.p[p].spazio_doppia || 0) + (g.stats.p[p].spazio_ripetuta || 0));
      add(agg.placements, pl / np); const hk = Math.round(pl / np / 2) * 2; agg.placements.hist[hk] = (agg.placements.hist[hk] || 0) + 1;
      if (opts.keepGames && agg.games.length < opts.keepGames) agg.games.push({ seed: opts.seed + '#' + i, aSeat, winner: w, scores: res.scores.map((sc) => sc.total) });
      if (onProgress && (i % 10 === 9 || i === n - 1)) onProgress(i + 1, n);
    }
    agg.ms = Date.now() - t0;
    return agg;
  };

  const pct = (x) => (100 * x).toFixed(1) + '%';
  Sim.report = function (agg) {
    const np = agg.players, o = agg.opts, ci = wilson(agg.aWins, agg.n), expect = 1 / np, avg = (s, k) => (s.n ? (s.s1 / s.n).toFixed(1) : '-');
    const L = [`# Simulazione: A=${o.a} contro B=${o.b} — ${agg.n} partite, ${np} giocatori, posti alternati (seed ${o.seed})`, ''];
    L.push(`- **A vince ${pct(agg.aWins / agg.n)}** [${pct(ci[0])} – ${pct(ci[1])}] (con profili uguali ci si aspetta ${pct(expect)}) · B ${agg.bWins} · pareggi ${agg.draws}`);
    const d = meanCI(agg.diff.n, agg.diff.s1, agg.diff.s2);
    L.push(`- Punteggio medio: A ${avg(agg.scoreA)} · B ${avg(agg.scoreB)} · differenza A−B ${d.m.toFixed(2)} [${d.lo.toFixed(2)} ; ${d.hi.toFixed(2)}]`);
    L.push(`- Vittorie per posto: ${agg.seatWins.map((w, p) => `posto ${p + 1} ${pct(w / agg.n)}`).join(' · ')} (attese ${pct(expect)} ciascuno)`);
    const fw = wilson(agg.firstWins, agg.firstN); L.push(`- Vantaggio di chi inizia la partita: vince ${pct(agg.firstWins / Math.max(1, agg.firstN))} [${pct(fw[0])} – ${pct(fw[1])}] (atteso ${pct(expect)})`);
    const dur = meanCI(agg.placements.n, agg.placements.s1, agg.placements.s2);
    L.push(`- Durata (piazzamenti di lavoratori a testa): media ${dur.m.toFixed(1)} [${dur.lo.toFixed(1)} ; ${dur.hi.toFixed(1)}]; distribuzione: ${Object.keys(agg.placements.hist).map(Number).sort((a, b) => a - b).map((k) => `${k}:${agg.placements.hist[k]}`).join(' ')}`);
    L.push('', '| | A | B |', '|---|---|---|');
    const per = (t, k) => ((agg.stats[t][k] || 0) / Math.max(1, t === 'A' ? agg.nA : agg.nB)).toFixed(2);
    L.push(`| Accuratezza grezza media (0-15) | ${avg(agg.acc.A)} | ${avg(agg.acc.B)} |`);
    L.push(`| Scaglioni 0/3/6/10/15 (partite) | ${agg.accPts.A.join('/')} | ${agg.accPts.B.join('/')} |`);
    L.push(`| Coerenza media (confine + pattern) | ${(agg.coer.A / Math.max(1, agg.nA)).toFixed(1)} (${(agg.border.A / Math.max(1, agg.nA)).toFixed(1)} + ${(agg.pattern.A / Math.max(1, agg.nA)).toFixed(1)}) | ${(agg.coer.B / Math.max(1, agg.nB)).toFixed(1)} (${(agg.border.B / Math.max(1, agg.nB)).toFixed(1)} + ${(agg.pattern.B / Math.max(1, agg.nB)).toFixed(1)}) |`);
    ['carte_giocate', 'simboli_raccolti', 'fusioni', 'pm_guadagnati', 'pm_spesi', 'acquisti_mercato', 'acquisti_alla_cieca', 'terzo_lavoratore', 'sostituzioni', 'lavoratori_inutilizzati', 'passa_scelto', 'passa_forzato', 'simbolo_perso'].forEach((k) => L.push(`| ${k.replace(/_/g, ' ')} (a partita) | ${per('A', k)} | ${per('B', k)} |`));
    const gper = (k) => ((agg.stats.g[k] || 0) / agg.n).toFixed(2);
    L.push('', `Eventi a partita: ${gper('eventi_pescati')} · il bersaglio cambia ${gper('evento_cambia_bersaglio')} volte · colpi a vuoto ${gper('evento_colpo_a_vuoto')} · regione fuori gioco ${gper('evento_regione_fuori_gioco')} · rimescolo mazzo regioni ${gper('rimescolo_regione')}`);
    L.push(`Spazi usati a partita (tutti i giocatori): ${FF.SPACES1.concat(FF.SPACES2).map((sp) => `${sp} ${gper('spazio_' + sp)}`).join(' · ')}`);
    L.push(`Simboli raccolti: ${FF.SYMBOLS.map((x) => `${x} ${gper('simbolo_' + x)}`).join(' · ')} · fusioni ${gper('fusioni') === '0.00' ? 0 : ((agg.stats.A.fusioni || 0) + (agg.stats.B.fusioni || 0)) / agg.n}`);
    L.push(`Tempo: ${(agg.ms / 1000).toFixed(1)} s (${(agg.ms / agg.n).toFixed(0)} ms a partita)`);
    return L.join('\n');
  };
})(typeof window !== 'undefined' ? window : globalThis);
