/* DOMANI PIOVE — simulazione di partite AI vs AI in blocco e statistiche (nell'app e da riga di comando).
   N giocatori (2-4): il profilo A siede a rotazione in tutti i posti (posti alternati), gli altri posti hanno il profilo B.
   Con due profili uguali, A vince in media 1 partita su N.
   Profili: facile / media / difficile + strategie ESTREME (sbagliate di proposito: devono perdere, altrimenti la regola ha un buco). */
(function (root) {
  'use strict';
  const FF = (root.FF = root.FF || {});
  const Sim = (FF.Sim = {});

  // ───────────────────────── profili ─────────────────────────
  Sim.PROFILES = {
    easy: { label: 'Facile', level: 'easy' },
    medium: { label: 'Media', level: 'medium' },
    hard: { label: 'Difficile', level: 'hard' },
    random: { label: 'Casuale (estremo)', level: 'random', extreme: true },
    fedelta: { label: 'Solo fedeltà alla previsione (estremo)', level: 'hard', params: { coerW: 0, patW: 0 }, extreme: true },
    pattern: { label: 'Solo pattern geografici (estremo)', level: 'hard', params: { accW: 0 }, extreme: true },
    accumulatore: { label: 'Accumulatore: solo PM (estremo)', level: 'hard', special: 'pm', extreme: true },
    passivo: { label: 'Passivo: non fa mai niente (estremo)', level: 'hard', special: 'pass', extreme: true },
  };
  Sim.profileLabel = (k) => (Sim.PROFILES[k] ? Sim.PROFILES[k].label : k);
  Sim.makeAI = function (key, seed, extra) {
    const pr = Sim.PROFILES[key] || { level: key };
    if (pr.level === 'random') return FF.RandomBot(seed);
    const ai = FF.AI.create(pr.level, seed, Object.assign({}, pr.params || {}, extra || {}));
    if (pr.special === 'pm') return { level: 'pm', decide(game, dec) { if (dec.type === 'place') { const i = dec.options.findIndex((o) => o.space === 'pm'); return i >= 0 ? i : Math.max(0, dec.options.findIndex((o) => o.pass)); } return ai.decide(game, dec); } };
    if (pr.special === 'pass') return { level: 'pass', decide(game, dec) { if (dec.type === 'place') return Math.max(0, dec.options.findIndex((o) => o.pass)); return ai.decide(game, dec); } };
    return ai;
  };

  // ───────────────────────── statistica ─────────────────────────
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
  const sums = (arr) => { let s1 = 0, s2 = 0; arr.forEach((x) => { s1 += x; s2 += x * x; }); return meanCI(arr.length, s1, s2); };
  Sim.sumsCI = sums;
  const add = (o, x) => { o.n++; o.s1 += x; o.s2 += x * x; };
  const pct = (x) => (100 * x).toFixed(1) + '%';
  Sim.pct = pct;

  // ───────────────────────── una partita ─────────────────────────
  /* opts: { games, seed, players:2-4, rules, a, b (chiavi di profilo), aParams, bParams, swap:true, log:false, forced:null|{kind,...} } */
  Sim.playOne = function (i, opts) {
    const n = opts.players || 2, swap = opts.swap !== false, aSeat = swap ? i % n : 0, seed = opts.seed + '#' + i;
    const levels = []; for (let p = 0; p < n; p++) levels.push(p === aSeat ? opts.a : opts.b);
    const players = levels.map((lv, p) => ({ name: (p === aSeat ? 'A·' : 'B·') + (p + 1) + ' ' + Sim.profileLabel(lv).replace(/ \(estremo\)/, ''), kind: 'ai', level: (Sim.PROFILES[lv] || {}).level || lv }));
    let forced = opts.forced || null;
    if (forced && forced.kind === 'regione') forced = Object.assign({}, forced, { seat: aSeat });
    const g = new FF.Game({ seed, rules: opts.rules, log: !!opts.log, stats: true, players, forced });
    const ai = levels.map((lv, p) => Sim.makeAI(lv, seed + 'ai' + p, p === aSeat ? opts.aParams : opts.bParams));
    const traj = []; let lastRound = -1;
    const snap = () => g.s.players.map((p, q) => g.scoreOf(q).total);
    const res = FF.drive(g.run(), (d) => { if (g.s.round >= 1 && g.s.round !== lastRound) { lastRound = g.s.round; traj.push(snap()); } return ai[d.pid].decide(g, d); }, g);
    traj.push(res.scores.map((s) => s.total));
    return { g, res, aSeat, seed, levels, players, traj };
  };

  // ───────────────────────── aggregazione ─────────────────────────
  Sim.newAgg = function (opts) {
    const np = opts.players || 2, R = opts.rounds || 12;
    return { opts: Object.assign({}, opts), n: 0, players: np, aWins: 0, bWins: 0, draws: 0, seatWins: new Array(np).fill(0), firstWins: 0, firstN: 0,
      diff: { n: 0, s1: 0, s2: 0 }, scoreA: { n: 0, s1: 0, s2: 0 }, scoreB: { n: 0, s1: 0, s2: 0 }, acc: { A: { n: 0, s1: 0, s2: 0 }, B: { n: 0, s1: 0, s2: 0 } }, accPts: { A: {}, B: {} },
      coer: { A: 0, B: 0 }, border: { A: 0, B: 0 }, pattern: { A: 0, B: 0 }, patBy: { A: {}, B: {} }, stats: { A: {}, B: {}, g: {} }, nA: 0, nB: 0,
      placements: { n: 0, s1: 0, s2: 0, hist: {} }, scoreHist: { A: {}, B: {} }, marginHist: {}, traj: { A: [], B: [], n: [] }, ms: 0, games: [], per: [] };
  };
  Sim.addGame = function (agg, i, r) {
    const { g, res, aSeat, traj } = r, np = agg.players, opts = agg.opts;
    agg.n++;
    const w = res.winner;
    if (w == null) agg.draws++; else if (w === aSeat) agg.aWins++; else agg.bWins++;
    if (w != null) { agg.seatWins[w]++; agg.firstN++; if (w === res.startFirst) agg.firstWins++; }
    const bs = res.scores.map((sc, p) => p).filter((p) => p !== aSeat), sa = res.scores[aSeat].total, sbAvg = bs.reduce((a, p) => a + res.scores[p].total, 0) / bs.length;
    add(agg.diff, sa - sbAvg); add(agg.scoreA, sa); bs.forEach((p) => add(agg.scoreB, res.scores[p].total));
    const tag = (p) => (p === aSeat ? 'A' : 'B');
    res.scores.forEach((sc, p) => {
      const t = tag(p); add(agg.acc[t], sc.accRaw);
      agg.accPts[t][sc.accPts] = (agg.accPts[t][sc.accPts] || 0) + 1;
      agg.coer[t] += sc.coerenza; agg.border[t] += sc.border; agg.pattern[t] += sc.pattern;
      FF.SYMBOLS.forEach((x) => { agg.patBy[t][x] = (agg.patBy[t][x] || 0) + sc.patternBy[x]; });
      if (t === 'A') agg.nA++; else agg.nB++;
      for (const k in g.stats.p[p]) agg.stats[t][k] = (agg.stats[t][k] || 0) + g.stats.p[p][k];
      const hb = Math.floor(sc.total / 5) * 5; agg.scoreHist[t][hb] = (agg.scoreHist[t][hb] || 0) + 1;
    });
    for (const k in g.stats.g) agg.stats.g[k] = (agg.stats.g[k] || 0) + g.stats.g[k];
    // distacco tra 1° e 2°
    const tot = res.scores.map((s) => s.total).sort((a, b) => b - a), mg = tot[0] - tot[1]; agg.marginHist[mg] = (agg.marginHist[mg] || 0) + 1;
    // durata = piazzamenti di lavoratori a testa (un doppio conta 2)
    let pl = 0; for (let p = 0; p < np; p++) { const q = g.stats.p[p]; pl += (q.spazio_gioca || 0) + (q.spazio_compra || 0) + (q.spazio_simbolo || 0) + (q.spazio_pm || 0) + (q.spazio_sblocca || 0) + 2 * ((q.spazio_doppia || 0) + (q.spazio_ripetuta || 0)); }
    add(agg.placements, pl / np); const hk = Math.round(pl / np / 2) * 2; agg.placements.hist[hk] = (agg.placements.hist[hk] || 0) + 1;
    // andamento del punteggio nel tempo (inizio di ogni round + fine)
    traj.forEach((row, k) => {
      const a = row[aSeat], b = (row.reduce((x, y) => x + y, 0) - a) / Math.max(1, row.length - 1);
      agg.traj.A[k] = (agg.traj.A[k] || 0) + a; agg.traj.B[k] = (agg.traj.B[k] || 0) + b; agg.traj.n[k] = (agg.traj.n[k] || 0) + 1;
    });
    if (opts.collect) agg.per.push({ i, aSeat, totals: res.scores.map((s) => s.total), accRaw: res.scores.map((s) => s.accRaw), startFirst: res.startFirst, changes: g.stats.g.evento_cambia_bersaglio || 0, winner: w });
    if (opts.keepGames && agg.games.length < opts.keepGames) agg.games.push({ i, seed: opts.seed + '#' + i, aSeat, winner: w, scores: res.scores.map((s) => s.total), startFirst: res.startFirst, history: g.history.slice(), players: r.players });
  };
  Sim.finish = function (agg, t0) { agg.ms = Date.now() - t0; return agg; };

  // sincrona (Node, test)
  Sim.run = function (opts, onProgress) {
    const agg = Sim.newAgg(opts), t0 = Date.now();
    for (let i = 0; i < opts.games; i++) { Sim.addGame(agg, i, Sim.playOne(i, opts)); if (onProgress && (i % 10 === 9 || i === opts.games - 1)) onProgress(i + 1, opts.games); }
    return Sim.finish(agg, t0);
  };
  // asincrona (browser): cede il controllo ogni ~40 ms così l'interfaccia resta viva; cancel = { cancelled:false }
  Sim.runAsync = async function (opts, onProgress, cancel) {
    const agg = Sim.newAgg(opts), t0 = Date.now(); let last = Date.now();
    for (let i = 0; i < opts.games; i++) {
      if (cancel && cancel.cancelled) break;
      Sim.addGame(agg, i, Sim.playOne(i, opts));
      if (Date.now() - last > 40) { if (onProgress) onProgress(i + 1, opts.games); await new Promise((r) => setTimeout(r, 0)); last = Date.now(); }
    }
    if (onProgress) onProgress(agg.n, opts.games);
    return Sim.finish(agg, t0);
  };

  // ───────────────────────── esperimento su un parametro ─────────────────────────
  // key: nome del parametro delle regole (anche annidato "pattern.nebbia"); values: lista di valori
  Sim.withRule = function (rules, key, value) {
    const r = JSON.parse(JSON.stringify(rules || {}));
    if (key.indexOf('.') >= 0) { const [a, b] = key.split('.'); r[a] = Object.assign({}, FF.DEFAULT_RULES[a], r[a]); r[a][b] = value; } else r[key] = value;
    return r;
  };
  Sim.experiment = async function (opts, key, values, onProgress, cancel) {
    const rows = [];
    for (let k = 0; k < values.length; k++) {
      if (cancel && cancel.cancelled) break;
      const o = Object.assign({}, opts, { rules: Sim.withRule(opts.rules, key, values[k]), keepGames: 0 });
      const agg = await Sim.runAsync(o, (i, n) => { if (onProgress) onProgress(k * opts.games + i, values.length * opts.games, `${key} = ${JSON.stringify(values[k])}`); }, cancel);
      rows.push({ value: values[k], agg });
    }
    return { key, rows };
  };

  // ───────────────────────── prove estreme ─────────────────────────
  // il profilo "normale" (A) contro ogni strategia sbagliata di proposito (B): A DEVE vincere (> 1/N + margine)
  Sim.extremeSuite = async function (opts, onProgress, cancel) {
    const keys = Object.keys(Sim.PROFILES).filter((k) => Sim.PROFILES[k].extreme), rows = [];
    for (let k = 0; k < keys.length; k++) {
      if (cancel && cancel.cancelled) break;
      const o = Object.assign({}, opts, { a: opts.a || 'hard', b: keys[k], keepGames: 0 });
      const agg = await Sim.runAsync(o, (i, n) => { if (onProgress) onProgress(k * opts.games + i, keys.length * opts.games, Sim.profileLabel(keys[k])); }, cancel);
      const ci = wilson(agg.aWins, agg.n), expect = 1 / (opts.players || 2);
      // perde davvero se A vince in modo significativamente superiore al caso (+5 punti già nell'estremo basso dell'intervallo); con pochi campioni l'esito può restare incerto
      rows.push({ key: keys[k], label: Sim.profileLabel(keys[k]), agg, wins: agg.aWins / agg.n, ci, ok: ci[0] > expect + 0.05, small: agg.n < 60 });
    }
    return { rows };
  };

  // ───────────────────────── analisi "forzata" ─────────────────────────
  // Per ogni elemento (Evento, variante di Carta Regione, Carta Previsione) si giocano le STESSE partite (stessi seed) con e senza forzatura:
  // la differenza di punteggio misura quanto rende quella carta, anche se l'AI non la sceglie mai da sola.
  Sim.forcedItems = function (kind) {
    if (kind === 'evento') return FF.EVENT_IDS.map((id) => ({ key: id, label: `#${id} ${FF.EVENTS[id].titolo}`, kind: 'evento', sub: FF.EVENTS[id].categoria === 'fenomeno' ? 'Tipo ' + FF.EVENTS[id].tipo + ' · ' + FF.EVENTS[id].regione + ' → ' + FF.EVENTS[id].fusione : FF.EVENTS[id].categoria, force: { kind: 'evento', id } }));
    if (kind === 'regione') { const seen = {}, out = []; FF.REGION_CARDS.forEach((c) => { const k = c.regione + '|' + c.variante + '|' + JSON.stringify(c.bonus); if (seen[k]) return; seen[k] = 1; out.push({ key: c.id, label: c.regione + ' · ' + { neutra: 'neutra', confine: 'confine', compensativa: 'bonus rete/isole' }[c.variante] + (c.bonus && c.bonus.verso ? ' → ' + c.bonus.verso.join('/') : ''), kind: 'regione', sub: FF.AREA_NAMES[c.area] + ' · ' + c.price + ' PM', force: { kind: 'regione', id: c.id } }); }); return out; }
    return FF.PREVISIONI.map((p) => ({ key: p.id, label: `${p.id} ${FF.Sprites && FF.Sprites.titleCase ? FF.Sprites.titleCase(p.titolo) : p.titolo}`, kind: 'previsione', sub: FF.AREA_NAMES[p.area] + ' · ' + p.tipologia, area: p.area, force: { kind: 'previsione', id: p.id } }));
  };
  Sim.forcedAnalysis = async function (kind, opts, onProgress, cancel, only) {
    const items = Sim.forcedItems(kind).filter((it) => !only || only.indexOf(it.key) >= 0), base = Object.assign({}, opts, { collect: true, keepGames: 0, forced: null });
    const total = (items.length + 1) * opts.games; let done = 0;
    const baseAgg = await Sim.runAsync(base, (i) => { if (onProgress) onProgress(i, total, 'partite di confronto (senza forzatura)'); }, cancel);
    const rows = [];
    for (const it of items) {
      if (cancel && cancel.cancelled) break;
      const agg = await Sim.runAsync(Object.assign({}, base, { forced: it.force }), (i) => { if (onProgress) onProgress(opts.games + done * opts.games + i, total, it.label); }, cancel);
      done++;
      const n = Math.min(agg.per.length, baseAgg.per.length), dA = [], dO = [], dDr = [], dRaw = [], chg = [];
      for (let i = 0; i < n; i++) {
        const f = agg.per[i], b = baseAgg.per[i], np = f.totals.length;
        const mean = (arr, seat) => arr[seat];
        dA.push(f.totals[f.aSeat] - b.totals[b.aSeat]);
        dO.push((f.totals.reduce((x, y) => x + y, 0) - f.totals[f.aSeat]) / (np - 1) - (b.totals.reduce((x, y) => x + y, 0) - b.totals[b.aSeat]) / (np - 1));
        dDr.push(f.totals[f.startFirst] - b.totals[b.startFirst]);                       // chi pesca il primo Evento (segnalino iniziale)
        dRaw.push(f.accRaw.reduce((x, y) => x + y, 0) / np - b.accRaw.reduce((x, y) => x + y, 0) / np);
        chg.push(f.changes);
      }
      let area = null;
      if (kind === 'previsione') { // quanto si riesce a fare su QUELLA area, rispetto alla media delle altre Previsioni della stessa area
        const key = it.area; area = key;
      }
      rows.push({ item: it, n, dA: sums(dA), dOthers: sums(dO), dDrawer: sums(dDr), dRaw: sums(dRaw), changes: sums(chg), winA: agg.aWins / Math.max(1, agg.n), baseWinA: baseAgg.aWins / Math.max(1, baseAgg.n), agg, area });
    }
    return { kind, rows, base: baseAgg, games: opts.games };
  };

  // ───────────────────────── report ─────────────────────────
  const row = (a, b, c) => `| ${a} | ${b} | ${c} |`;
  Sim.report = function (agg) {
    const np = agg.players, o = agg.opts, ci = wilson(agg.aWins, agg.n), expect = 1 / np, avg = (s) => (s.n ? (s.s1 / s.n).toFixed(1) : '-');
    const L = [`# Simulazione: A=${Sim.profileLabel(o.a)} contro B=${Sim.profileLabel(o.b)} — ${agg.n} partite, ${np} giocatori, posti alternati (seed ${o.seed})`, ''];
    L.push(`- **A vince ${pct(agg.aWins / agg.n)}** [${pct(ci[0])} – ${pct(ci[1])}] (con profili uguali ci si aspetta ${pct(expect)}) · B ${agg.bWins} · pareggi ${agg.draws}`);
    const d = meanCI(agg.diff.n, agg.diff.s1, agg.diff.s2);
    L.push(`- Punteggio medio: A ${avg(agg.scoreA)} · B ${avg(agg.scoreB)} · differenza A−B ${d.m.toFixed(2)} [${d.lo.toFixed(2)} ; ${d.hi.toFixed(2)}]`);
    L.push(`- Vittorie per posto: ${agg.seatWins.map((w, p) => `posto ${p + 1} ${pct(w / agg.n)}`).join(' · ')} (attese ${pct(expect)} ciascuno)`);
    const fw = wilson(agg.firstWins, agg.firstN); L.push(`- Vantaggio di chi inizia la partita: vince ${pct(agg.firstWins / Math.max(1, agg.firstN))} [${pct(fw[0])} – ${pct(fw[1])}] (atteso ${pct(expect)})`);
    const dur = meanCI(agg.placements.n, agg.placements.s1, agg.placements.s2);
    L.push(`- Durata (piazzamenti di lavoratori a testa): media ${dur.m.toFixed(1)} [${dur.lo.toFixed(1)} ; ${dur.hi.toFixed(1)}]; distribuzione: ${Object.keys(agg.placements.hist).map(Number).sort((a, b) => a - b).map((k) => `${k}:${agg.placements.hist[k]}`).join(' ')}`);
    L.push(`- Distacco tra 1° e 2° (punti: partite): ${Object.keys(agg.marginHist).map(Number).sort((a, b) => a - b).map((k) => `${k}:${agg.marginHist[k]}`).join(' ')}`);
    L.push('', '| | A | B |', '|---|---|---|');
    const per = (t, k) => ((agg.stats[t][k] || 0) / Math.max(1, t === 'A' ? agg.nA : agg.nB)).toFixed(2);
    const tiers = (t) => FF.DEFAULT_RULES.accuracy.map((s) => `${(agg.accPts[t] && agg.accPts[t][s.pts]) || 0}`).join('/');
    L.push(row('Accuratezza grezza media (0-15)', avg(agg.acc.A), avg(agg.acc.B)));
    L.push(row(`Gradini ${FF.DEFAULT_RULES.accuracy.map((s) => s.pts).join('/')} (partite)`, tiers('A'), tiers('B')));
    L.push(row('Coerenza media (confine + pattern)', `${(agg.coer.A / Math.max(1, agg.nA)).toFixed(1)} (${(agg.border.A / Math.max(1, agg.nA)).toFixed(1)} + ${(agg.pattern.A / Math.max(1, agg.nA)).toFixed(1)})`, `${(agg.coer.B / Math.max(1, agg.nB)).toFixed(1)} (${(agg.border.B / Math.max(1, agg.nB)).toFixed(1)} + ${(agg.pattern.B / Math.max(1, agg.nB)).toFixed(1)})`));
    ['carte_giocate', 'simboli_raccolti', 'fusioni', 'pm_guadagnati', 'pm_spesi', 'acquisti_mercato', 'acquisti_alla_cieca', 'terzo_lavoratore', 'sostituzioni', 'lavoratori_inutilizzati', 'passa_scelto', 'passa_forzato', 'simbolo_perso'].forEach((k) => L.push(row(`${k.replace(/_/g, ' ')} (a partita)`, per('A', k), per('B', k))));
    const gper = (k) => ((agg.stats.g[k] || 0) / agg.n).toFixed(2);
    L.push('', `Eventi a partita: ${gper('eventi_pescati')} · il bersaglio cambia ${gper('evento_cambia_bersaglio')} volte · colpi a vuoto ${gper('evento_colpo_a_vuoto')} · regione fuori gioco ${gper('evento_regione_fuori_gioco')} · rimescolo mazzo regioni ${gper('rimescolo_regione')}`);
    L.push(`Spazi usati a partita (tutti i giocatori): ${FF.SPACES1.concat(FF.SPACES2).map((sp) => `${sp} ${gper('spazio_' + sp)}`).join(' · ')}`);
    L.push(`Simboli raccolti a partita (tutti): ${FF.SYMBOLS.map((x) => `${x} ${gper('simbolo_' + x)}`).join(' · ')}`);
    L.push(`Pattern medi a partita (A): ${FF.SYMBOLS.map((x) => `${x} ${((agg.patBy.A[x] || 0) / Math.max(1, agg.nA)).toFixed(2)}`).join(' · ')}`);
    L.push(`Tempo: ${(agg.ms / 1000).toFixed(1)} s (${(agg.ms / Math.max(1, agg.n)).toFixed(0)} ms a partita)`);
    return L.join('\n');
  };
  Sim.experimentReport = function (ex, opts) {
    const L = [`# Esperimento: ${ex.key} — A=${Sim.profileLabel(opts.a)} contro B=${Sim.profileLabel(opts.b)}, ${opts.games} partite per valore, ${opts.players || 2} giocatori`, '', `| ${ex.key} | A vince [95%] | Punteggio A | Punteggio B | Acc. grezza | Coerenza | Chi inizia vince | Durata (piazz.) | Bersaglio cambia |`, '|---|---|---|---|---|---|---|---|---|'];
    ex.rows.forEach((r) => {
      const a = r.agg, ci = wilson(a.aWins, a.n), fw = a.firstN ? a.firstWins / a.firstN : 0;
      L.push(`| ${JSON.stringify(r.value)} | ${pct(a.aWins / a.n)} [${pct(ci[0])}–${pct(ci[1])}] | ${(a.scoreA.s1 / Math.max(1, a.scoreA.n)).toFixed(1)} | ${(a.scoreB.s1 / Math.max(1, a.scoreB.n)).toFixed(1)} | ${(a.acc.A.s1 / Math.max(1, a.acc.A.n)).toFixed(1)} | ${(a.coer.A / Math.max(1, a.nA)).toFixed(1)} | ${pct(fw)} | ${(a.placements.s1 / Math.max(1, a.placements.n)).toFixed(1)} | ${((a.stats.g.evento_cambia_bersaglio || 0) / Math.max(1, a.n)).toFixed(2)} |`);
    });
    return L.join('\n');
  };
  Sim.extremeReport = function (ex, opts) {
    const L = [`# Prove estreme — A=${Sim.profileLabel(opts.a || 'hard')} contro strategie sbagliate di proposito, ${opts.games} partite ciascuna, ${opts.players || 2} giocatori`, '', 'Se una strategia sbagliata non perde, la regola ha un buco.', '', '| Strategia sbagliata (B) | A vince [95%] | Punteggio A | Punteggio B | Esito |', '|---|---|---|---|---|'];
    ex.rows.forEach((r) => L.push(`| ${r.label} | ${pct(r.wins)} [${pct(r.ci[0])}–${pct(r.ci[1])}] | ${(r.agg.scoreA.s1 / Math.max(1, r.agg.scoreA.n)).toFixed(1)} | ${(r.agg.scoreB.s1 / Math.max(1, r.agg.scoreB.n)).toFixed(1)} | ${r.ok ? '✔ perde' : r.small ? '? incerto: poche partite (almeno 60)' : '✘ NON perde abbastanza'} |`));
    return L.join('\n');
  };
  Sim.forcedReport = function (fa) {
    const rows = fa.rows.slice().sort((a, b) => b.dA.m - a.dA.m), f = (x) => (x >= 0 ? '+' : '') + x.toFixed(2);
    const L = [`# Analisi forzata: ${{ evento: 'Carte Evento', regione: 'Carte Regione (partenza con la carta in mano)', previsione: 'Carte Previsione' }[fa.kind]} — ${fa.games} coppie di partite ciascuna (stessi seed, con e senza forzatura)`, '',
      fa.kind === 'evento' ? '| Carta | Dettaglio | Δ punteggio di chi pesca [95%] | Δ degli altri | Δ Accuratezza grezza media | Bersaglio cambia (a partita) |' : fa.kind === 'regione' ? '| Carta | Dettaglio | Δ punteggio di A [95%] | Δ degli avversari | Δ Accuratezza grezza media | |' : '| Carta | Dettaglio | Δ punteggio di A [95%] | Δ degli avversari | Δ Accuratezza grezza media | |', '|---|---|---|---|---|---|'];
    rows.forEach((r) => {
      const d = fa.kind === 'evento' ? r.dDrawer : r.dA;
      L.push(`| ${r.item.label} | ${r.item.sub} | ${f(d.m)} [${f(d.lo)} ; ${f(d.hi)}] | ${f(r.dOthers.m)} | ${f(r.dRaw.m)} | ${fa.kind === 'evento' ? r.changes.m.toFixed(2) : ''} |`);
    });
    return L.join('\n');
  };

  // ───────────────────────── esportazioni ─────────────────────────
  const csvCell = (v) => { const s = String(v == null ? '' : v); return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  Sim.toCSV = function (agg) {
    const rows = [['metrica', 'A', 'B']], ci = wilson(agg.aWins, agg.n), avg = (s) => (s.n ? s.s1 / s.n : 0);
    rows.push(['partite', agg.n, agg.n], ['vittorie', agg.aWins, agg.bWins], ['vittorie A % [ci basso]', (100 * agg.aWins / agg.n).toFixed(2), (100 * ci[0]).toFixed(2)], ['vittorie A % [ci alto]', (100 * ci[1]).toFixed(2), ''], ['pareggi', agg.draws, ''],
      ['punteggio medio', avg(agg.scoreA).toFixed(2), avg(agg.scoreB).toFixed(2)], ['accuratezza grezza media', avg(agg.acc.A).toFixed(2), avg(agg.acc.B).toFixed(2)],
      ['coerenza media', (agg.coer.A / Math.max(1, agg.nA)).toFixed(2), (agg.coer.B / Math.max(1, agg.nB)).toFixed(2)], ['chi inizia vince %', (100 * agg.firstWins / Math.max(1, agg.firstN)).toFixed(2), ''],
      ['durata media (piazzamenti)', (agg.placements.s1 / Math.max(1, agg.placements.n)).toFixed(2), '']);
    Object.keys(agg.stats.A).sort().forEach((k) => rows.push([k + ' (a partita)', (agg.stats.A[k] / Math.max(1, agg.nA)).toFixed(3), ((agg.stats.B[k] || 0) / Math.max(1, agg.nB)).toFixed(3)]));
    Object.keys(agg.stats.g).sort().forEach((k) => rows.push([k + ' (a partita, tutti)', (agg.stats.g[k] / agg.n).toFixed(3), '']));
    rows.push([]); rows.push(['round', 'punteggio medio A', 'punteggio medio B']);
    agg.traj.A.forEach((v, k) => rows.push([k < agg.traj.A.length - 1 ? k + 1 : 'fine', (v / agg.traj.n[k]).toFixed(2), (agg.traj.B[k] / agg.traj.n[k]).toFixed(2)]));
    return rows.map((r) => r.map(csvCell).join(',')).join('\n');
  };
  Sim.toJSON = function (agg) { const o = Object.assign({}, agg); o.games = (agg.games || []).map((g) => ({ i: g.i, seed: g.seed, aSeat: g.aSeat, winner: g.winner, scores: g.scores, startFirst: g.startFirst })); delete o.per; return JSON.stringify(o, null, 1); };
  Sim.forcedCSV = function (fa) { const rows = [['carta', 'dettaglio', 'delta punteggio (A o chi pesca)', 'ci basso', 'ci alto', 'delta altri', 'delta accuratezza grezza', 'bersaglio cambia a partita']]; fa.rows.forEach((r) => { const d = fa.kind === 'evento' ? r.dDrawer : r.dA; rows.push([r.item.label, r.item.sub, d.m.toFixed(3), d.lo.toFixed(3), d.hi.toFixed(3), r.dOthers.m.toFixed(3), r.dRaw.m.toFixed(3), r.changes.m.toFixed(3)]); }); return rows.map((r) => r.map(csvCell).join(',')).join('\n'); };
})(typeof window !== 'undefined' ? window : globalThis);
