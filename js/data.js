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
    startPMBonus: [0, 1, 1, 1], // [chiarito] compensazione dell'ordine di turno: chi NON inizia parte con 1 PM in più (3 invece di 2); [] = nessuna
    workers: 2,
    thirdWorkerCost: 5,         // [chiarito] 5 PM
    thirdWorkerNextRound: true, // [interpretazione] il 3° lavoratore è disponibile dal round dopo lo sblocco
    marketSize: 5,
    blindPrice: 2,
    poolPerSymbol: 10,
    maxSymbolsPerCard: 2,       // una carta porta 1 simbolo; il 2° si può mettere solo se forma una fusione (2 simboli = fusione)
    secondSymbolOnlyFusion: true, // [chiarito con Niky] niente 2 simboli diversi sulla stessa carta: il 2° c'è solo per fare una fusione (false = variante vecchia, solo per esperimenti)
    sez2OccupiesSez1: false,    // [DA MISURARE] la Sezione 2 occupa anche gli spazi della Sezione 1 corrispondenti?
    nebbiaNeedsNeighbor: true,  // [chiarito con Niky] la Nebbia punta solo se ha almeno una carta vicina (una «sacca» in mezzo ad altre carte); false = variante vecchia
    objectives: true,           // [chiarito] Obiettivi Segreti: pesca 2, tieni 1, 3 fasce (3/5/8), 0 se non raggiunto (false = senza, solo per esperimenti)
    pmGain: 1,                  // [variante da misurare] PM guadagnati dall'azione «Guadagna PM»
    incomePM: 0,                // [variante da misurare] PM gratis a ogni giocatore a inizio round (azione senza lavoratore)
    priceShift: 0,              // [variante da misurare] si somma al prezzo delle Carte Regione (minimo 0)
    playGivesSymbol: false,     // [variante da misurare] giocare una carta dà anche 1 simbolo gratis
    mapMode: 'italia',              // [chiarito] ogni regione ha il suo posto fisso sulla forma dell'Italia (variante 'libera' = griglia libera, solo per esperimenti)
    requireAdjacentPlacement: true, // [chiarito] ogni nuova carta si gioca a contatto ortogonale con una già giocata
    firstPlayer: -1,            // [interpretazione] -1 = a sorte (da seed); poi ruota di uno a ogni round
    rotateFirst: true,
    coerCap: null,              // [variante da misurare] tetto ai punti di Coerenza Geografica (null = nessun tetto)
    borderPoints: 2,            // [chiarito con Niky] +2 per bonus di confine attivo (era 1: con 1 simbolo per carta i pattern pesavano poco)
    accuracy: C.costanti.accuratezza.scaglioni.map((s) => ({ from: s.da, to: s.a, label: s.esito, pts: s.punti })),
    pattern: {                  // numeri provvisori da tarare (Concept §6)
      soleScale: { 2: 1, 3: 2, 4: 4, 5: 6, 6: 9 },   // 6 = "6 o più"
      temporale2: 3, temporale3: 6,
      pioggia: 1, neve: 4, vento: 2, nuvolo: 1, nebbia: 2,
    },
    eventDrawer: 'rotate',      // [chiarito] segnalino «Protezione Civile»: parte dal primo giocatore e passa a sinistra a ogni Evento ('first' = il primo giocatore del round, solo per esperimenti)
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

  // Cartogramma d'Italia: ogni regione ha una casella fissa (x,y). Due regioni sono adiacenti se le caselle si toccano a croce. [interpretazione]
  // Generato con tools/italia-map.js e poi ritoccato a mano (Sicilia sotto la Calabria); 22 dei 31 confini veri si toccano; unico contatto «falso» voluto: Calabria–Sicilia (lo Stretto).
  FF.ITALY_MAP = {
    'Trentino-Alto Adige': [2, 0],
    'Lombardia': [1, 1], 'Veneto': [2, 1], 'Friuli-Venezia Giulia': [3, 1],
    "Valle d'Aosta": [0, 2], 'Piemonte': [1, 2], 'Emilia-Romagna': [2, 2],
    'Liguria': [1, 3], 'Toscana': [2, 3], 'Marche': [3, 3], 'Abruzzo': [4, 3],
    'Umbria': [2, 4], 'Lazio': [3, 4], 'Molise': [4, 4], 'Puglia': [5, 4],
    'Sardegna': [1, 5], 'Campania': [4, 5], 'Basilicata': [5, 5],
    'Calabria': [5, 6], 'Sicilia': [5, 7]
  };
  FF.REGION_ABBR = { "Valle d'Aosta": 'VdA', Piemonte: 'Pie', Liguria: 'Lig', Lombardia: 'Lom', 'Trentino-Alto Adige': 'TAA', Veneto: 'Ven', 'Friuli-Venezia Giulia': 'FVG', 'Emilia-Romagna': 'ER', Toscana: 'Tos', Umbria: 'Umb', Marche: 'Mar', Lazio: 'Laz', Abruzzo: 'Abr', Molise: 'Mol', Campania: 'Cam', Puglia: 'Pug', Basilicata: 'Bas', Calabria: 'Cal', Sicilia: 'Sic', Sardegna: 'Sar' };
  FF.ITALY_W = 6; FF.ITALY_H = 8;

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
    for (const e of table) if (effSym(e).indexOf('nebbia') >= 0 && !FF.neighborsOf(table, e).some((n) => effSym(n).indexOf('nebbia') >= 0) && (!(rules || FF.DEFAULT_RULES).nebbiaNeedsNeighbor || FF.neighborsOf(table, e).length)) by.nebbia += P.nebbia;   // nebbiaNeedsNeighbor: variante da misurare (la sacca deve stare in mezzo ad altre carte)
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

  // ───────────────────────── Obiettivi Segreti ─────────────────────────
  // Ogni obiettivo ha un valore attuale `val(p, R)` e una soglia `need`: è raggiunto se val ≥ need. Si controlla solo a fine partita,
  // sul tavolo / mano / PM del proprietario. Mai legati alla previsione. `prog` (facoltativo) = progresso 0..1 per l'AI.
  const regsOf = (p) => new Set(p.table.map(FF.regionOf));
  const countRegs = (list) => (p) => { const r = regsOf(p); return list.filter((x) => r.has(x)).length; };
  const countArea = (area) => (p) => { const r = regsOf(p); let n = 0; r.forEach((x) => { if (FF.REGION_AREA[x] === area) n++; }); return n; };
  const symEntries = (p) => p.table.filter((e) => !e.fusion);     // «carta con il simbolo X» = non fusa (come per i pattern)
  const cardsWith = (sym) => (p) => symEntries(p).filter((e) => e.sym.indexOf(sym) >= 0).length;
  const typesOnTable = (p) => { const t = new Set(); p.table.forEach((e) => e.sym.forEach((x) => t.add(x))); return t.size; };
  const maxGroup = (sym) => (p) => groupsOf(p.table, sym).reduce((m, g) => Math.max(m, g.length), 0);
  FF.REGION_AREA = {}; FF.REGION_CARDS.forEach((c) => { FF.REGION_AREA[c.regione] = c.area; });
  const OBJ = [
    ['T1', 'territorio', 'Tutto lo Stivale', 'Almeno 1 regione in ognuna delle 3 aree (Nord, Centro, Sud e Isole).', 3, (p) => FF.AREAS.filter((a) => countArea(a)(p) > 0).length, 3],
    ['T2', 'territorio', 'Pianura Padana', 'Almeno 3 regioni del Nord.', 5, countArea('nord'), 3],
    ['T3', 'territorio', 'Dorsale appenninica', 'Almeno 2 regioni del Centro.', 5, countArea('centro'), 2],
    ['T4', 'territorio', 'Mediterraneo', 'Almeno 3 regioni di Sud e Isole.', 5, countArea('sud_isole'), 3],
    ['T5', 'territorio', 'Rete fitta', 'Almeno 3 bonus di confine attivi.', 5, (p, R) => FF.borderScore(p.table, R).items.length, 3],
    ['T6', 'territorio', 'Estremo Sud e Isole', 'Almeno una tra Calabria, Sicilia e Sardegna.', 3, countRegs(['Calabria', 'Sicilia', 'Sardegna']), 1],
    ['T7', 'territorio', 'Costa tirrenica', 'Almeno 3 tra Liguria, Toscana, Lazio, Campania, Calabria, Sicilia e Sardegna.', 5, countRegs(['Liguria', 'Toscana', 'Lazio', 'Campania', 'Calabria', 'Sicilia', 'Sardegna']), 3],
    ['T8', 'territorio', 'Costa adriatica', 'Almeno 3 tra Friuli-Venezia Giulia, Veneto, Emilia-Romagna, Marche, Abruzzo, Molise e Puglia.', 5, countRegs(['Friuli-Venezia Giulia', 'Veneto', 'Emilia-Romagna', 'Marche', 'Abruzzo', 'Molise', 'Puglia']), 3],
    ['T9', 'territorio', 'Arco alpino', "Almeno 3 tra Valle d'Aosta, Piemonte, Liguria, Lombardia, Trentino-Alto Adige, Veneto e Friuli-Venezia Giulia.", 5, countRegs(["Valle d'Aosta", 'Piemonte', 'Liguria', 'Lombardia', 'Trentino-Alto Adige', 'Veneto', 'Friuli-Venezia Giulia']), 3],
    ['S1', 'simboli', 'Quattro fenomeni', '4 tipi di simbolo diversi sul tuo tavolo.', 3, typesOnTable, 4],
    ['S2', 'simboli', 'Tempo a coppie', 'Due tipi di simbolo, ognuno su almeno 2 carte.', 3, (p) => FF.SYMBOLS.filter((x) => cardsWith(x)(p) >= 2).length, 2],
    ['S3', 'simboli', 'Tempo stabile', '3 carte con lo stesso simbolo.', 3, (p) => FF.SYMBOLS.reduce((m, x) => Math.max(m, cardsWith(x)(p)), 0), 3],
    ['S4', 'simboli', 'Neve a bassa quota', '2 carte con Neve.', 8, cardsWith('neve'), 2],
    ['S5', 'simboli', 'Sei fenomeni', '6 tipi di simbolo diversi sul tuo tavolo.', 8, typesOnTable, 6],
    ['S6', 'simboli', 'Precipitazioni sparse', '2 carte con Pioggia, Temporale o Neve (anche miste).', 3, (p) => symEntries(p).filter((e) => e.sym.some((x) => x === 'pioggia' || x === 'temporale' || x === 'neve')).length, 2],
    ['P1', 'pattern', 'Nebbia a banchi', '2 carte con Nebbia, ognuna accanto a qualche carta ma nessuna accanto a un’altra Nebbia.', 3, (p) => { const t = symEntries(p).filter((e) => e.sym.indexOf('nebbia') >= 0); return t.filter((e) => !FF.neighborsOf(t, e).length && FF.neighborsOf(p.table, e).length).length; }, 2],
    ['P2', 'pattern', 'Cella temporalesca', '2 carte con Temporale vicine tra loro.', 5, maxGroup('temporale'), 2],
    ['P3', 'pattern', 'Massa d\u2019aria uniforme', '3 carte vicine con lo stesso simbolo.', 8, (p) => FF.SYMBOLS.reduce((m, x) => Math.max(m, maxGroup(x)(p)), 0), 3],
    ['R1', 'risorse', 'Mano vuota', 'Nessuna Carta Regione in mano a fine partita.', 3, (p) => (p.hand.length ? 0 : 1), 1, (p) => 1 / (1 + p.hand.length)],
    ['R2', 'risorse', 'Economia di guerra', '7 o più PM e nessuna Carta Regione in mano.', 5, (p) => (p.pm >= 7 && !p.hand.length ? 1 : 0), 1, (p) => Math.min(1, p.pm / 7) / (1 + p.hand.length)],
    ['R3', 'risorse', 'Cassaforte', '9 o più PM a fine partita.', 5, (p) => p.pm, 9],
    ['R4', 'risorse', 'Tavolo grande', '7 o più carte sul tuo tavolo.', 5, (p) => p.table.length, 7],
    ['R5', 'risorse', 'Squadra al completo', 'Hai il 3° lavoratore.', 8, (p) => (p.workers >= 3 || p.pendingWorker ? 1 : 0), 1],
    ['R6', 'risorse', 'Tavolo attrezzato', 'Almeno 6 carte sul tavolo, tutte con un simbolo.', 5, (p) => (p.table.length && p.table.every((e) => e.sym.length) ? p.table.length : 0), 6, (p) => p.table.filter((e) => e.sym.length).length / Math.max(6, p.table.length)]
  ];

  FF.OBJECTIVE_TYPES = { territorio: 'Territorio', simboli: 'Simboli', pattern: 'Pattern', risorse: 'Risorse e azioni' };
  FF.OBJECTIVES = OBJ.map((o) => ({ id: o[0], tipo: o[1], titolo: o[2], testo: o[3], pts: o[4], val: o[5], need: o[6], prog: o[7] || null }));
  FF.OBJ_RATE = {"T1":0.77,"T2":0.45,"T3":0.49,"T4":0.39,"T5":0.47,"T6":0.36,"T7":0.35,"T8":0.41,"T9":0.42,"S1":0.83,"S2":0.7,"S3":0.31,"S4":0.83,"S5":0.45,"S6":0.73,"P1":0.29,"P2":0.27,"P3":0.3,"R1":1,"R2":0.59,"R3":0.66,"R4":0.08,"R5":0.19,"R6":0.52};   // probabilità stimate (misurate con tools/obiettivi.js) che l'AI usa per scegliere/cambiare obiettivo
  FF.OBJECTIVE_IDS = FF.OBJECTIVES.map((o) => o.id);
  FF.OBJ = {}; FF.OBJECTIVES.forEach((o) => { FF.OBJ[o.id] = o; });
  FF.objectiveMet = (id, p, R) => { const o = FF.OBJ[id]; return !!o && o.val(p, R || FF.DEFAULT_RULES) >= o.need; };
  FF.objectiveProgress = (id, p, R) => { const o = FF.OBJ[id]; if (!o) return 0; if (o.prog) return Math.min(1, o.prog(p)); return Math.min(1, Math.max(0, o.val(p, R || FF.DEFAULT_RULES) / o.need)); };
})(typeof window !== 'undefined' ? window : globalThis);
