/* DOMANI PIOVE — dati, parametri delle regole e punteggio (funzioni pure, senza stato di partita).
   Le carte vengono da js/cards.js (generato dai JSON in data/). Le interpretazioni delle regole
   ambigue sono elencate in docs/REGOLAMENTO.md e qui sotto in DEFAULT_RULES. */
(function (root) {
  'use strict';
  const FF = (root.FF = root.FF || {});
  const C = FF.CARDS;

  FF.SYMBOLS = ['sole', 'nuvolo', 'pioggia', 'vento', 'temporale', 'neve', 'nebbia'];
  FF.SYMBOL_INFO = {
    sole: { n: 'Sole', i: '☀️' }, nuvolo: { n: 'Nuvolo', i: '☁️' }, pioggia: { n: 'Pioggia', i: '🌧️' }, vento: { n: 'Vento', i: '💨' },
    temporale: { n: 'Temporale', i: '⛈️' }, neve: { n: 'Neve', i: '❄️' }, nebbia: { n: 'Nebbia', i: '🌫️' },
  };
  FF.AREAS = ['nord', 'centro', 'sud_isole'];
  FF.AREA_NAMES = { nord: 'Nord', centro: 'Centro', sud_isole: 'Sud e Isole' };
  FF.FUSIONS = C.costanti.fusioni.map((f) => ({ name: f.nome, recipe: f.ricetta.slice() }));
  FF.FUSION_NAMES = FF.FUSIONS.map((f) => f.name);
  FF.SPACES1 = ['gioca', 'compra', 'simbolo', 'pm', 'sblocca'];
  FF.SPACES2 = ['doppia', 'ripetuta'];
  FF.SPACE_NAMES = {
    gioca: 'Gioca una carta', compra: 'Compra una carta', simbolo: 'Raccogli un simbolo', pm: 'Guadagna 1 PM', sblocca: 'Sblocca lavoratore',
    doppia: 'Doppia azione', ripetuta: 'Azione ripetuta',
  };
  FF.AREA_OF = {};
  Object.keys(C.costanti.regioni_per_area).forEach((a) => C.costanti.regioni_per_area[a].forEach((r) => { FF.AREA_OF[r] = a; }));

  // ───────────────────────── parametri delle regole (modificabili dall'interfaccia per fare esperimenti) ─────────────────────────
  FF.DEFAULT_RULES = {
    rounds: 12,                 // [chiarito] un round = un'ora, dalle 8:00 alle 20:00
    eventRounds: [4, 7, 10],    // [chiarito] Carta Evento alle 11:00, 14:00, 17:00 (= inizio del round 4, 7, 10 → [interpretazione])
    startPM: 2,                 // [chiarito] valori di partenza della Milestone
    startCards: 2,
    workers: 2,
    thirdWorkerCost: 5,         // [chiarito] 5 PM
    thirdWorkerNextRound: true, // [interpretazione] il 3° lavoratore è disponibile dal round dopo lo sblocco
    marketSize: 5,
    blindPrice: 2,
    poolPerSymbol: 10,
    maxSymbolsPerCard: 2,       // [chiarito con Niky] una carta porta al massimo 2 simboli (una fusione = 2 simboli)
    sez2OccupiesSez1: false,    // [DA MISURARE] la Sezione 2 occupa anche gli spazi della Sezione 1 corrispondenti?
    requireAdjacentPlacement: true, // [chiarito] ogni nuova carta si gioca a contatto ortogonale con una già giocata
    firstPlayer: -1,            // [interpretazione] -1 = a sorte (da seed); poi ruota di uno a ogni round
    rotateFirst: true,
    borderPoints: 1,            // [chiarito] +1 per bonus attivo
    accuracy: C.costanti.accuratezza.scaglioni.map((s) => ({ from: s.da, to: s.a, label: s.esito, pts: s.punti })),
    pattern: {                  // numeri provvisori da tarare (Concept §6)
      soleScale: { 2: 1, 3: 2, 4: 4, 5: 6, 6: 9 },   // 6 = "6 o più"
      temporale2: 3, temporale3: 6,
      pioggia: 1, neve: 4, vento: 2, nuvolo: 1, nebbia: 2,
    },
    tieBreak: ['accPts', 'accRaw', 'coerenza', 'pm'], // [interpretazione]
  };

  // ───────────────────────── carte ─────────────────────────
  // Carte Regione: 96 carte fisiche, ognuna con un id (0..95). Le varianti a 0 copie restano nel file ma non entrano nel mazzo.
  FF.REGION_CARDS = [];
  C.regione.forEach((v) => {
    for (let k = 0; k < v.copie; k++) {
      FF.REGION_CARDS.push({ id: FF.REGION_CARDS.length, regione: v.regione, area: v.area, variante: v.variante, bonus: v.bonus, price: v.prezzo_pm });
    }
  });
  FF.PREVISIONI = C.previsione;
  FF.PREVISIONI_BY_AREA = {};
  FF.AREAS.forEach((a) => { FF.PREVISIONI_BY_AREA[a] = C.previsione.filter((p) => p.area === a); });
  FF.EVENTS = {};
  C.evento.forEach((e) => { FF.EVENTS[e.id] = e; });
  FF.EVENT_IDS = C.evento.map((e) => e.id);

  // Effetti delle Carte Evento neutre/positive, come operazioni (interpretate dal motore). "chi pesca" = il primo giocatore del round.
  FF.EVENT_OPS = {
    8: [['pmAll', 2]], 63: [['pmAll', 2]],
    16: [['drawAll', 1]], 64: [['drawAll', 1]],
    19: [['symAll', 1]], 65: [['symAll', 1]],
    66: [['peek']],
    67: [['objReroll']],
    68: [['pmAll', 1], ['symAll', 1]],
    69: [['pmAll', 1]],
    70: [['pmDrawer', 3]],
    71: [['draw2keep1']],
    72: [['symAll', 2]],
    73: [['drawAll', 1], ['pmAll', 1]],
    74: [['freeWorker']],
    75: [['pmPerHand']],
    76: [['top3']],
    77: [['symDrawer', 1]],
    78: [['swapMarket']],
    79: [['pmAll', 1], ['reviseAll']],
    80: [['symAll', 1], ['pmAll', 1]],
  };

  // ───────────────────────── fusioni ─────────────────────────
  // sym = lista di simboli sulla carta. Se sono 2 e compatibili → nome della fusione, altrimenti null.
  FF.fusionOf = function (sym) {
    if (!sym || sym.length !== 2) return null;
    const a = sym.slice().sort().join('+');
    for (const f of FF.FUSIONS) if (f.recipe.slice().sort().join('+') === a) return f.name;
    return null;
  };
  FF.isFusionName = (n) => FF.FUSION_NAMES.indexOf(n) >= 0;

  // ───────────────────────── punteggio ─────────────────────────
  // table = lista di carte giocate: { id, x, y, sym:[...], fusion:null|string }. Adiacenza = contatto ortogonale tra celle.
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  FF.cellKey = (x, y) => x + ',' + y;
  FF.neighborsOf = function (table, e) {
    const out = [];
    for (const d of DIRS) { const n = table.find((o) => o.x === e.x + d[0] && o.y === e.y + d[1]); if (n) out.push(n); }
    return out;
  };
  FF.regionOf = (e) => FF.REGION_CARDS[e.id].regione;
  // simboli che partecipano ai pattern: una carta con fenomeno fuso non partecipa più ai pattern dei simboli base
  const effSym = (e) => (e.fusion ? [] : e.sym);

  // gruppi connessi (adiacenza ortogonale) di carte che portano il simbolo s
  function groupsOf(table, s) {
    const cells = table.filter((e) => effSym(e).indexOf(s) >= 0), seen = new Set(), groups = [];
    for (const c of cells) {
      if (seen.has(c)) continue;
      const g = [], stack = [c]; seen.add(c);
      while (stack.length) {
        const cur = stack.pop(); g.push(cur);
        for (const n of FF.neighborsOf(cells, cur)) if (!seen.has(n)) { seen.add(n); stack.push(n); }
      }
      groups.push(g);
    }
    return groups;
  }
  FF.patternScore = function (table, rules) {
    const P = (rules || FF.DEFAULT_RULES).pattern, by = {};
    // Sole — Distesa: punti scalari sulla dimensione di ogni gruppo connesso
    by.sole = 0;
    for (const g of groupsOf(table, 'sole')) { const n = Math.min(g.length, 6); by.sole += P.soleScale[n] || 0; }
    // Temporale — Cella convettiva: per gruppo, +3 se ≥2 carte, +6 se ≥3 [chiarito: per gruppo, non per carta]
    by.temporale = 0;
    for (const g of groupsOf(table, 'temporale')) by.temporale += g.length >= 3 ? P.temporale3 : g.length === 2 ? P.temporale2 : 0;
    // Pioggia — Coda di pioggia: +1 per ogni carta Pioggia adiacente ad almeno un Temporale
    by.pioggia = 0;
    for (const e of table) if (effSym(e).indexOf('pioggia') >= 0 && FF.neighborsOf(table, e).some((n) => effSym(n).indexOf('temporale') >= 0)) by.pioggia += P.pioggia;
    // Neve — Manto di quota: bonus fisso (una volta sola) se esiste un gruppo di esattamente 2-3 carte con Neve
    by.neve = groupsOf(table, 'neve').some((g) => g.length === 2 || g.length === 3) ? P.neve : 0;
    // Vento — Ponte: +2 per ogni carta Vento adiacente ad almeno 2 simboli diversi tra loro
    by.vento = 0;
    for (const e of table) {
      if (effSym(e).indexOf('vento') < 0) continue;
      const seen = new Set(); FF.neighborsOf(table, e).forEach((n) => effSym(n).forEach((s) => seen.add(s)));
      if (seen.size >= 2) by.vento += P.vento;
    }
    // Nuvolo — Frangia: +1 per ogni carta Nuvolo adiacente ad almeno un simbolo diverso da Nuvolo
    by.nuvolo = 0;
    for (const e of table) if (effSym(e).indexOf('nuvolo') >= 0 && FF.neighborsOf(table, e).some((n) => effSym(n).some((s) => s !== 'nuvolo'))) by.nuvolo += P.nuvolo;
    // Nebbia — Sacca isolata: +2 per ogni carta Nebbia senza altra Nebbia adiacente
    by.nebbia = 0;
    for (const e of table) if (effSym(e).indexOf('nebbia') >= 0 && !FF.neighborsOf(table, e).some((n) => effSym(n).indexOf('nebbia') >= 0)) by.nebbia += P.nebbia;
    let total = 0; FF.SYMBOLS.forEach((s) => { total += by[s]; });
    return { total, by };
  };

  // bonus di confine / compensativi (+1 ciascuno, additivi): contano solo carte giocate
  FF.borderScore = function (table, rules) {
    const R = rules || FF.DEFAULT_RULES, played = new Set(table.map(FF.regionOf)); let n = 0; const items = [];
    for (const e of table) {
      const b = FF.REGION_CARDS[e.id].bonus; if (!b) continue;
      let ok = false;
      if (b.tipo === 'confine') ok = b.verso.some((r) => played.has(r));
      else ok = b.se_giocata_una_di.some((r) => played.has(r));   // rete_estrema, isole
      if (ok) { n += b.punti * R.borderPoints; items.push(FF.regionOf(e)); }
    }
    return { total: n, items };
  };

  // Accuratezza: totale grezzo sulle 3 aree contro il bersaglio attuale. target = { area: [ {regione, livello, punti, req} ] }
  // Una condizione è soddisfatta se la carta di quella regione è giocata e porta il simbolo richiesto (non fuso)
  // oppure, se il bersaglio è una fusione, porta proprio quella fusione. [chiarito: la fusione sostituisce i simboli base]
  FF.condMet = function (table, c) {
    const e = table.find((o) => FF.regionOf(o) === c.regione);
    if (!e) return false;
    if (FF.isFusionName(c.req)) return e.fusion === c.req;
    return !e.fusion && e.sym.indexOf(c.req) >= 0;
  };
  FF.accuracyScore = function (table, target, rules) {
    const R = rules || FF.DEFAULT_RULES; let raw = 0; const hits = [];
    FF.AREAS.forEach((a) => (target[a] || []).forEach((c) => { const ok = FF.condMet(table, c); if (ok) raw += c.punti; hits.push({ area: a, regione: c.regione, req: c.req, punti: c.punti, ok }); }));
    const sc = R.accuracy.find((s) => raw >= s.from && raw <= s.to) || R.accuracy[R.accuracy.length - 1];
    return { raw, pts: sc.pts, label: sc.label, hits };
  };
})(typeof window !== 'undefined' ? window : globalThis);
