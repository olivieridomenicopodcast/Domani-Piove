/* DOMANI PIOVE — motore di gioco.
   - Nessuna UI: tutto lo stato è in `game.s` (JSON puro, clonabile).
   - La partita è un generatore: `game.run()` fa `yield` di "decisioni" ({type, pid, options:[...]}) e riceve
     come risposta l'INDICE dell'opzione scelta; con `cfg.beats` emette anche {type:'beat'} dopo ogni evento (per animare).
   - RNG con seed → partite riproducibili. Le risposte date sono registrate in `game.history` e si possono rigiocare con `cfg.replay`.
   - La cima dei mazzi è l'ULTIMO elemento dell'array (`pop`); il fondo è il primo.
   Le interpretazioni delle regole ambigue sono elencate in docs/REGOLAMENTO.md */
(function (root) {
  'use strict';
  const FF = (root.FF = root.FF || {});
  const { SYMBOL_INFO, SPACES1, SPACE_NAMES } = FF;

  FF.hashSeed = function (x) {
    if (typeof x === 'number') return x | 0;
    let h = 2166136261;
    const s = String(x);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h | 0;
  };
  // mulberry32 con stato esterno (usato dalle AI e dai test)
  FF.makeRng = function (seed) {
    let a = FF.hashSeed(seed);
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const hourOf = (round) => (7 + round) + ':00';
  const sn = (s) => SYMBOL_INFO[s].i + ' ' + SYMBOL_INFO[s].n;
  const clampN = (n) => Math.max(2, Math.min(4, n | 0));
  function newStats(n) { const p = []; for (let i = 0; i < n; i++) p.push({}); return { p, g: {} }; }

  class Game {
    /* cfg: { seed, rules, players:[{name,kind,level} ×2-4], beats, log, stats, replay } */
    constructor(cfg) {
      cfg = cfg || {};
      this.cfg = cfg;
      this.rules = Object.assign({}, FF.DEFAULT_RULES, cfg.rules || {});
      this.logOn = cfg.log !== false;
      this.statsOn = cfg.stats !== false;
      this.beats = !!cfg.beats;
      this.events = [];
      this.history = [];
      this.replay = (cfg.replay || []).slice();
      this.result = null;
      this.onEvent = null;
      this.n = clampN((cfg.players || []).length || 2);
      this.stats = newStats(this.n);
      this.s = this._setup(cfg);
    }

    clone() {
      const g = Object.create(Game.prototype);
      g.cfg = {}; g.rules = this.rules; g.logOn = false; g.statsOn = false; g.beats = false; g.n = this.n;
      g.events = []; g.history = []; g.replay = []; g.stats = newStats(this.n); g.result = null; g.onEvent = null;
      const t = this.s, T = t.target;
      g.s = Object.assign({}, t, {   // copia manuale (molto più veloce di JSON): serve alle AI, che clonano migliaia di volte
        regionDeck: t.regionDeck.slice(), regionDiscard: t.regionDiscard.slice(), eventDeck: t.eventDeck.slice(), eventDiscard: t.eventDiscard.slice(),
        pool: Object.assign({}, t.pool), market: t.market.slice(), occupied: Object.assign({}, t.occupied), transit: t.transit.slice(),
        target: { nord: T.nord.map((c) => Object.assign({}, c)), centro: T.centro.map((c) => Object.assign({}, c)), sud_isole: T.sud_isole.map((c) => Object.assign({}, c)) },
        players: t.players.map((p) => Object.assign({}, p, { hand: p.hand.slice(), table: p.table.map((e) => ({ id: e.id, x: e.x, y: e.y, sym: e.sym.slice(), fusion: e.fusion })) })),
      });
      return g;
    }

    // ───────────────────────── setup ─────────────────────────
    _setup(cfg) {
      const R = this.rules, n = this.n;
      const s = { rng: FF.hashSeed(cfg.seed == null ? Date.now() : cfg.seed) };
      this.s = s;
      s.regionDeck = this._shuffle(FF.REGION_CARDS.map((c) => c.id));
      s.regionDiscard = [];
      s.eventDeck = this._shuffle(FF.EVENT_IDS.slice());
      s.eventDiscard = [];
      s.pool = {}; FF.SYMBOLS.forEach((x) => { s.pool[x] = R.poolPerSymbol; });
      // previsione condivisa: una carta per area, trasferita sulla plancia come bersaglio (req modificabile dagli Eventi)
      s.prev = {}; s.target = {};
      FF.AREAS.forEach((a) => {
        const list = FF.PREVISIONI_BY_AREA[a], card = list[this.randInt(list.length)];
        s.prev[a] = card.id;
        s.target[a] = card.condizioni.map((c) => ({ regione: c.regione, livello: c.livello, punti: c.punti, req: c.simbolo, orig: c.simbolo }));
      });
      s.market = [];
      for (let i = 0; i < R.marketSize; i++) s.market.push(this._drawRegion());
      const pl = cfg.players || [];
      s.players = [];
      for (let i = 0; i < n; i++) {
        const p = pl[i] || {};
        s.players.push({ id: i, name: p.name || ('Giocatore ' + (i + 1)), kind: p.kind || 'ai', level: p.level || null,
          pm: R.startPM, hand: [], table: [], workers: R.workers, pendingWorker: false, objective: null, left: 0, passed: false, peek: null });
      }
      for (let i = 0; i < n; i++) for (let k = 0; k < R.startCards; k++) { const c = this._drawRegion(); if (c != null) s.players[i].hand.push(c); }
      s.first = R.firstPlayer >= 0 ? R.firstPlayer % n : this.randInt(n);
      s.startFirst = s.first;
      s.round = 0; s.phase = 'setup'; s.occupied = {}; s.over = false; s.lastEvent = null;
      s.eventsDrawn = 0; s.transit = [];   // carte pescate da un Evento e non ancora assegnate (così lo stato è sempre coerente)
      return s;
    }

    // ───────────────────────── utilità ─────────────────────────
    rand() {
      const s = this.s;
      const a = (s.rng + 0x6D2B79F5) | 0; s.rng = a;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    randInt(n) { return Math.floor(this.rand() * n); }
    _shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = this.randInt(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
    pn(pid) { return this.s.players[pid].name; }
    card(id) { return FF.REGION_CARDS[id]; }
    cname(id) { const c = FF.REGION_CARDS[id]; return c.regione + (c.variante === 'neutra' ? '' : c.bonus && c.bonus.tipo === 'confine' ? ' (conf. ' + c.bonus.verso.join('/') + ')' : ' (bonus rete)'); }
    stat(name, pid, k) {
      if (!this.statsOn) return;
      k = k == null ? 1 : k;
      if (pid == null || pid < 0) this.stats.g[name] = (this.stats.g[name] || 0) + k;
      else this.stats.p[pid][name] = (this.stats.p[pid][name] || 0) + k;
    }
    emit(k, text, p, data) {
      if (!this.logOn) return null;
      const ev = { i: this.events.length, r: this.s.round, ph: this.s.phase, k, p: p == null ? -1 : p, text, d: data };
      this.events.push(ev);
      if (this.onEvent) this.onEvent(ev);
      return ev;
    }
    // registra un evento di cronaca e, in modalità animata, lo "yielda" come beat (l'interfaccia lo mostra e aspetta il clic)
    *say(k, text, p, data) { const ev = this.emit(k, text, p, data); if (this.beats && ev) yield { type: 'beat', ev }; }

    // Chiede una decisione al controller (o dalla coda di replay) e registra la risposta (indice dell'opzione).
    *ask(dec) {
      let ans;
      if (this.replay.length) ans = this.replay.shift();
      else ans = yield dec;
      if (!Number.isInteger(ans) || ans < 0 || ans >= dec.options.length) ans = 0;
      this.history.push(ans);
      return ans;
    }

    // ───────────────────────── mazzo Carte Regione ─────────────────────────
    _drawRegion() {
      const s = this.s;
      if (!s.regionDeck.length && s.regionDiscard.length) {
        s.regionDeck = this._shuffle(s.regionDiscard); s.regionDiscard = [];
        this.emit('sys', '🔀 Il mazzo Carte Regione è finito: si rimescolano gli scarti.');
        this.stat('rimescolo_regione', -1);
      }
      return s.regionDeck.length ? s.regionDeck.pop() : null;
    }
    regionCardsLeft() { return this.s.regionDeck.length + this.s.regionDiscard.length; }
    _refillSlot(i) { const c = this._drawRegion(); this.s.market[i] = c; }

    // ───────────────────────── tavolo di un giocatore ─────────────────────────
    entryOfRegion(p, regione) { return p.table.find((e) => FF.regionOf(e) === regione); }
    // celle dove si può giocare una nuova carta: la prima in (0,0); le altre a contatto ortogonale con una già giocata
    freeCells(p) {
      if (!p.table.length) return [[0, 0]];
      const out = [], seen = new Set();
      if (!this.rules.requireAdjacentPlacement) {
        const xs = p.table.map((e) => e.x), ys = p.table.map((e) => e.y);
        for (let x = Math.min(...xs) - 1; x <= Math.max(...xs) + 1; x++) for (let y = Math.min(...ys) - 1; y <= Math.max(...ys) + 1; y++) if (!p.table.some((e) => e.x === x && e.y === y)) out.push([x, y]);
        return out;
      }
      for (const e of p.table) for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = e.x + d[0], y = e.y + d[1], k = FF.cellKey(x, y);
        if (seen.has(k) || p.table.some((o) => o.x === x && o.y === y)) continue;
        seen.add(k); out.push([x, y]);
      }
      return out;
    }

    // ───────────────────────── punteggio (per giocatore) ─────────────────────────
    scoreOf(pid) {
      const p = this.s.players[pid], R = this.rules;
      const acc = FF.accuracyScore(p.table, this.s.target, R), bor = FF.borderScore(p.table, R), pat = FF.patternScore(p.table, R);
      const obj = 0; // hook Obiettivi Segreti: ancora vuoto (il mazzo si scrive insieme a Niky)
      const coerenza = bor.total + pat.total;
      return { accRaw: acc.raw, accPts: acc.pts, accLabel: acc.label, border: bor.total, pattern: pat.total, patternBy: pat.by, coerenza, objectives: obj, total: acc.pts + coerenza + obj, pm: p.pm, hits: acc.hits };
    }

    // ───────────────────────── azioni: legalità e opzioni ─────────────────────────
    marketPrice(slot) { const id = this.s.market[slot]; return id == null ? null : this.card(id).price; }
    playOptions(pid) {
      const p = this.s.players[pid], out = [];
      for (const id of p.hand) {
        const reg = this.card(id).regione;
        if (this.entryOfRegion(p, reg)) out.push({ card: id, replace: true });
        else for (const c of this.freeCells(p)) out.push({ card: id, x: c[0], y: c[1] });
      }
      return out;
    }
    buyOptions(pid) {
      const p = this.s.players[pid], out = [];
      this.s.market.forEach((id, i) => { if (id != null && p.pm >= this.card(id).price) out.push({ slot: i, card: id, price: this.card(id).price }); });
      if (p.pm >= this.rules.blindPrice && this.regionCardsLeft() > 0) out.push({ blind: true, price: this.rules.blindPrice });
      return out;
    }
    symbolOptions(pid) {
      const p = this.s.players[pid], out = [], M = this.rules.maxSymbolsPerCard;
      p.table.forEach((e, idx) => { if (e.sym.length < M) FF.SYMBOLS.forEach((x) => { if (this.s.pool[x] > 0) out.push({ sym: x, idx }); }); });
      return out;
    }
    legalAction(pid, a) {
      const p = this.s.players[pid];
      switch (a) {
        case 'gioca': return p.hand.length > 0;
        case 'compra': return this.buyOptions(pid).length > 0;
        case 'simbolo': return this.symbolOptions(pid).length > 0;
        case 'pm': return true;
        case 'sblocca': return p.workers + (p.pendingWorker ? 1 : 0) < 3 && p.pm >= this.rules.thirdWorkerCost;
        default: return false;
      }
    }
    // Opzioni di piazzamento di un lavoratore (o coppia di lavoratori) per il giocatore pid
    placeOptions(pid) {
      const s = this.s, p = s.players[pid], R = this.rules, out = [];
      const free1 = SPACES1.filter((sp) => !s.occupied[sp] && this.legalAction(pid, sp));
      free1.forEach((sp) => out.push({ space: sp }));
      if (p.left >= 2) {
        const acts = (R.sez2OccupiesSez1 ? free1 : SPACES1.filter((a) => this.legalAction(pid, a)));
        if (!s.occupied.doppia && acts.length >= 2) out.push({ space: 'doppia' });
        if (!s.occupied.ripetuta && acts.some((a) => a !== 'sblocca')) out.push({ space: 'ripetuta' });
      }
      out.push({ pass: true });
      return out;
    }

    // ───────────────────────── azioni: esecuzione ─────────────────────────
    // free = true: azione gratuita data da un Evento (non occupa spazio né lavoratore)
    *act(pid, a, free, tag) {
      switch (a) {
        case 'gioca': return yield* this.actPlay(pid);
        case 'compra': return yield* this.actBuy(pid);
        case 'simbolo': return yield* this.actSymbol(pid, !!free);
        case 'pm': { const p = this.s.players[pid]; p.pm++; this.stat('pm_guadagnati', pid); this.stat('azione_pm', pid); yield* this.say('act', `💰 ${this.pn(pid)} guadagna 1 PM (ora ${p.pm}).`, pid); return; }
        case 'sblocca': {
          const p = this.s.players[pid]; p.pm -= this.rules.thirdWorkerCost; this.stat('pm_spesi', pid, this.rules.thirdWorkerCost);
          if (this.rules.thirdWorkerNextRound) p.pendingWorker = true; else { p.workers = 3; p.left++; }
          this.stat('terzo_lavoratore', pid);
          yield* this.say('act', `👷 ${this.pn(pid)} paga ${this.rules.thirdWorkerCost} PM e sblocca il 3° lavoratore${this.rules.thirdWorkerNextRound ? ' (dal prossimo round)' : ''}.`, pid);
          return;
        }
        default: return;
      }
    }

    *actPlay(pid) {
      const s = this.s, p = s.players[pid], opts = this.playOptions(pid);
      if (!opts.length) return;
      const ans = yield* this.ask({ type: 'play', pid, options: opts });
      const o = opts[ans], idx = p.hand.indexOf(o.card);
      p.hand.splice(idx, 1);
      const reg = this.card(o.card).regione;
      if (o.replace) {
        const e = this.entryOfRegion(p, reg), old = e.id;
        s.regionDiscard.push(old); e.id = o.card;
        this.stat('sostituzioni', pid);
        yield* this.say('act', `🃏 ${this.pn(pid)} sostituisce ${reg}: ${this.cname(old)} → ${this.cname(o.card)} (i simboli già sopra restano).`, pid, { card: o.card, replace: true });
      } else {
        p.table.push({ id: o.card, x: o.x, y: o.y, sym: [], fusion: null });
        this.stat('carte_giocate', pid);
        yield* this.say('act', `🃏 ${this.pn(pid)} gioca ${this.cname(o.card)} in (${o.x},${o.y}).`, pid, { card: o.card, x: o.x, y: o.y });
      }
    }

    *actBuy(pid) {
      const s = this.s, p = s.players[pid], opts = this.buyOptions(pid);
      if (!opts.length) return;
      const ans = yield* this.ask({ type: 'buy', pid, options: opts });
      const o = opts[ans]; let id;
      p.pm -= o.price; this.stat('pm_spesi', pid, o.price);
      if (o.blind) { id = this._drawRegion(); this.stat('acquisti_alla_cieca', pid); }
      else { id = s.market[o.slot]; this._refillSlot(o.slot); this.stat('acquisti_mercato', pid); }
      this.stat('prezzo_' + this.card(id).variante, -1);
      p.hand.push(id);
      yield* this.say('act', o.blind ? `🛒 ${this.pn(pid)} paga ${o.price} PM e pesca alla cieca: ${this.cname(id)}.` : `🛒 ${this.pn(pid)} compra dal mercato ${this.cname(id)} per ${o.price} PM.`, pid, { card: id, blind: !!o.blind });
    }

    // raccoglie un simbolo dal pool e lo mette su una propria carta giocata (max 2 simboli per carta; il 2° compatibile fonde in automatico)
    *actSymbol(pid, free) {
      const s = this.s, p = s.players[pid], opts = this.symbolOptions(pid);
      if (!opts.length) { yield* this.say('act', `⚠ ${this.pn(pid)} non può raccogliere simboli${free ? ' (l\'effetto va perso)' : ''}.`, pid); this.stat('simbolo_perso', pid); return; }
      const ans = yield* this.ask({ type: 'symbol', pid, options: opts });
      const o = opts[ans], e = p.table[o.idx];
      s.pool[o.sym]--; e.sym.push(o.sym);
      this.stat('simboli_raccolti', pid); this.stat('simbolo_' + o.sym, -1);
      const f = FF.fusionOf(e.sym);
      if (f) { e.fusion = f; this.stat('fusioni', pid); this.stat('fusione_' + f, -1); }
      yield* this.say('act', `${SYMBOL_INFO[o.sym].i} ${this.pn(pid)} mette ${sn(o.sym)} su ${FF.regionOf(e)}${f ? ` → 💥 FUSIONE: ${f}!` : ` (${e.sym.map((x) => SYMBOL_INFO[x].i).join('')})`}.`, pid, { sym: o.sym, region: FF.regionOf(e), fusion: f });
    }

    // ───────────────────────── il round ─────────────────────────
    *roundGen() {
      const s = this.s, R = this.rules, n = this.n;
      s.round++; s.phase = 'round'; s.occupied = {};
      s.players.forEach((p) => { p.left = p.workers; p.passed = false; });
      yield* this.say('round', `━━ Round ${s.round}/${R.rounds} · ore ${hourOf(s.round)} · primo giocatore: ${this.pn(s.first)} ━━`, -1);
      if (R.eventRounds.indexOf(s.round) >= 0) yield* this.eventGen();
      s.phase = 'place';
      let cur = s.first;
      for (let guard = 0; guard < 500; guard++) {
        let pid = null;
        for (let k = 0; k < n; k++) { const q = (cur + k) % n, p = s.players[q]; if (p.left >= 1 && !p.passed) { pid = q; break; } }
        if (pid == null) break;
        const p = s.players[pid], opts = this.placeOptions(pid);
        if (opts.length === 1) { p.passed = true; this.stat('passa_forzato', pid); yield* this.say('pass', `⏭ ${this.pn(pid)} non ha spazi utili: passa per questo round.`, pid); cur = (pid + 1) % n; continue; }
        const ans = yield* this.ask({ type: 'place', pid, options: opts });
        const o = opts[ans];
        if (o.pass) { p.passed = true; this.stat('passa_scelto', pid); yield* this.say('pass', `⏭ ${this.pn(pid)} passa per questo round (lavoratori non usati: ${p.left}).`, pid); }
        else yield* this.doPlace(pid, o.space);
        cur = (pid + 1) % n;
      }
      s.players.forEach((p) => { if (p.left > 0) this.stat('lavoratori_inutilizzati', p.id, p.left); if (p.pendingWorker) { p.workers = 3; p.pendingWorker = false; } });
      if (R.rotateFirst) s.first = (s.first + 1) % n;
    }

    *doPlace(pid, space) {
      const s = this.s, p = s.players[pid], R = this.rules;
      s.occupied[space] = pid; this.stat('spazio_' + space, -1); this.stat('spazio_' + space, pid);
      if (SPACES1.indexOf(space) >= 0) {
        p.left -= 1;
        yield* this.say('place', `👷 ${this.pn(pid)} piazza un lavoratore su «${SPACE_NAMES[space]}».`, pid);
        yield* this.act(pid, space, false);
        return;
      }
      p.left -= 2;
      yield* this.say('place', `👷👷 ${this.pn(pid)} piazza 2 lavoratori su «${SPACE_NAMES[space]}».`, pid);
      const usable = (a) => this.legalAction(pid, a) && (!R.sez2OccupiesSez1 || !s.occupied[a]);
      if (space === 'doppia') {
        const o1 = SPACES1.filter(usable).map((a) => ({ act: a }));
        if (!o1.length) return;
        const a1 = o1[yield* this.ask({ type: 'doppia1', pid, options: o1 })].act;
        if (R.sez2OccupiesSez1) s.occupied[a1] = pid;
        yield* this.act(pid, a1, false);
        const o2 = SPACES1.filter((a) => a !== a1 && usable(a)).map((a) => ({ act: a }));
        if (!o2.length) { yield* this.say('act', `⚠ ${this.pn(pid)} non ha una seconda azione possibile: va persa.`, pid); return; }
        const a2 = o2[yield* this.ask({ type: 'doppia2', pid, options: o2 })].act;
        if (R.sez2OccupiesSez1) s.occupied[a2] = pid;
        yield* this.act(pid, a2, false);
      } else {
        const o1 = SPACES1.filter((a) => a !== 'sblocca' && usable(a)).map((a) => ({ act: a }));
        if (!o1.length) return;
        const a1 = o1[yield* this.ask({ type: 'ripetuta', pid, options: o1 })].act;
        if (R.sez2OccupiesSez1) s.occupied[a1] = pid;
        yield* this.act(pid, a1, false);
        if (this.legalAction(pid, a1)) yield* this.act(pid, a1, false);
        else yield* this.say('act', `⚠ ${this.pn(pid)} non può ripetere «${SPACE_NAMES[a1]}»: la seconda volta va persa.`, pid);
      }
    }

    // ───────────────────────── Carte Evento ─────────────────────────
    order(from) { const out = []; for (let k = 0; k < this.n; k++) out.push((from + k) % this.n); return out; }
    *eventGen() {
      const s = this.s;
      if (!s.eventDeck.length) { if (!s.eventDiscard.length) return; s.eventDeck = this._shuffle(s.eventDiscard); s.eventDiscard = []; }
      const id = s.eventDeck.pop(), ev = FF.EVENTS[id], drawer = this.rules.eventDrawer === 'rotate' ? (s.startFirst + s.eventsDrawn) % this.n : s.first;
      s.eventsDrawn++;
      s.eventDiscard.push(id); s.lastEvent = id; s.phase = 'event';
      this.stat('eventi_pescati', -1); this.stat('evento_' + ev.categoria, -1);
      yield* this.say('event', `📻 CARTA EVENTO #${id} «${ev.titolo}» (la pesca ${this.pn(drawer)}): ${ev.testo}`, drawer, { event: id });
      if (ev.categoria === 'fenomeno') { yield* this.applyPhenomenon(ev); return; }
      const ops = FF.EVENT_OPS[id];
      if (!ops) { yield* this.say('event', `📻 Nessun effetto.`, -1); return; }
      for (const op of ops) yield* this.eventOp(op, drawer);
    }

    // Tipo A: la regione evolve nella fusione solo se il bersaglio richiede già il simbolo compatibile. Tipo B: la impone.
    // In entrambi i casi la regione deve essere tra quelle toccate dalla previsione corrente della sua area. [chiarito]
    *applyPhenomenon(ev) {
      const s = this.s, area = FF.AREA_OF[ev.regione], cond = (s.target[area] || []).find((c) => c.regione === ev.regione);
      if (!cond) { this.stat('evento_regione_fuori_gioco', -1); yield* this.say('event', `📻 ${ev.regione} non è tra le regioni della previsione di quest'area: l'Evento non si attiva.`, -1); return; }
      if (ev.tipo === 'A') {
        if (cond.req !== ev.simbolo_richiesto) { this.stat('evento_colpo_a_vuoto', -1); yield* this.say('event', `📻 Colpo a vuoto: ${ev.regione} richiede ${FF.isFusionName(cond.req) ? cond.req : sn(cond.req)}, non ${sn(ev.simbolo_richiesto)} (la Protezione Civile si scusa per l'errata comunicazione).`, -1); return; }
      } else if (cond.req === ev.fusione) { this.stat('evento_gia_cosi', -1); yield* this.say('event', `📻 ${ev.regione} richiedeva già ${ev.fusione}: nessun cambiamento.`, -1); return; }
      const before = cond.req; cond.req = ev.fusione;
      this.stat('evento_cambia_bersaglio', -1);
      yield* this.say('event', `🎯 Il bersaglio cambia! ${ev.regione}: ${FF.isFusionName(before) ? before : sn(before)} → ${ev.fusione}. Ora serve la fusione ${ev.fusione} (${ev.ricetta_fusione.map((x) => SYMBOL_INFO[x].i).join('+')}) su quella carta.`, -1, { region: ev.regione, from: before, to: ev.fusione });
    }

    *eventOp(op, drawer) {
      const s = this.s, name = op[0], k = op[1];
      switch (name) {
        case 'pmAll': for (const q of this.order(drawer)) { s.players[q].pm += k; this.stat('pm_guadagnati', q, k); } yield* this.say('event', `💰 Ogni giocatore guadagna ${k} PM.`, -1); break;
        case 'pmDrawer': s.players[drawer].pm += k; this.stat('pm_guadagnati', drawer, k); yield* this.say('event', `💰 ${this.pn(drawer)} guadagna ${k} PM.`, drawer); break;
        case 'pmPerHand': { const m = s.players[drawer].hand.length; s.players[drawer].pm += m; this.stat('pm_guadagnati', drawer, m); yield* this.say('event', `💰 ${this.pn(drawer)} guadagna ${m} PM (1 per ogni Carta Regione in mano).`, drawer); break; }
        case 'drawAll': for (const q of this.order(drawer)) for (let i = 0; i < k; i++) { const c = this._drawRegion(); if (c != null) s.players[q].hand.push(c); } yield* this.say('event', `🃏 Ogni giocatore pesca ${k} Carta Regione.`, -1); break;
        case 'symAll': for (const q of this.order(drawer)) for (let i = 0; i < k; i++) yield* this.act(q, 'simbolo', true); break;
        case 'symDrawer': for (let i = 0; i < k; i++) yield* this.act(drawer, 'simbolo', true); break;
        case 'peek': { const top = s.eventDeck.length ? s.eventDeck[s.eventDeck.length - 1] : null; s.players[drawer].peek = top; yield* this.say('event', `👁 ${this.pn(drawer)} guarda in segreto la prossima Carta Evento.`, drawer); break; }
        case 'objReroll': yield* this.say('event', `🎯 Nessun Obiettivo Segreto da cambiare (mazzo non ancora scritto).`, drawer); break;
        case 'freeWorker': {
          const p = s.players[drawer];
          if (p.workers < 3 && !p.pendingWorker) { p.workers = 3; p.left++; yield* this.say('event', `👷 ${this.pn(drawer)} sblocca gratis il 3° lavoratore (subito disponibile).`, drawer); }
          else yield* this.say('event', `👷 ${this.pn(drawer)} ha già il 3° lavoratore: nessun effetto.`, drawer);
          break;
        }
        case 'draw2keep1': {
          const a = this._drawRegion(), b = this._drawRegion(), c = [a, b].filter((x) => x != null);
          if (!c.length) break;
          s.transit = c.slice();
          const opts = c.map((id) => ({ card: id })), ans = yield* this.ask({ type: 'keep', pid: drawer, options: opts });
          s.transit = [];
          s.players[drawer].hand.push(opts[ans].card); c.forEach((id) => { if (id !== opts[ans].card) s.regionDiscard.push(id); });
          yield* this.say('event', `🃏 ${this.pn(drawer)} pesca 2 Carte Regione e ne tiene una.`, drawer); break;
        }
        case 'top3': {
          const c = []; for (let i = 0; i < 3; i++) { const x = this._drawRegion(); if (x != null) c.push(x); }
          if (!c.length) break;
          s.transit = c.slice();
          const opts = c.map((id) => ({ card: id })), ans = yield* this.ask({ type: 'keep', pid: drawer, options: opts });
          s.players[drawer].hand.push(opts[ans].card);
          let rest = c.filter((id) => id !== opts[ans].card);
          s.transit = rest.slice();
          if (rest.length === 2) { const o2 = [{ order: [rest[0], rest[1]] }, { order: [rest[1], rest[0]] }]; rest = o2[yield* this.ask({ type: 'order', pid: drawer, options: o2 })].order; }
          s.transit = [];
          // rest[0] resta più in alto tra le due rimesse in fondo al mazzo (il fondo è l'inizio dell'array)
          rest.slice().reverse().forEach((id) => s.regionDeck.unshift(id));
          yield* this.say('event', `🃏 ${this.pn(drawer)} guarda le prime 3 Carte Regione, ne tiene una e rimette le altre in fondo al mazzo.`, drawer); break;
        }
        case 'swapMarket': {
          const p = s.players[drawer], opts = [{ skip: true }];
          p.hand.forEach((h) => s.market.forEach((m, i) => { if (m != null) opts.push({ hand: h, slot: i, card: m }); }));
          if (opts.length === 1) break;
          const o = opts[yield* this.ask({ type: 'swap', pid: drawer, options: opts })];
          if (o.skip) { yield* this.say('event', `🔄 ${this.pn(drawer)} rinuncia allo scambio.`, drawer); break; }
          p.hand.splice(p.hand.indexOf(o.hand), 1); p.hand.push(o.card); s.market[o.slot] = o.hand;
          yield* this.say('event', `🔄 ${this.pn(drawer)} scambia ${this.cname(o.hand)} con ${this.cname(o.card)} del mercato.`, drawer); break;
        }
        case 'reviseAll':
          for (const q of this.order(drawer)) {
            const p = s.players[q]; if (!p.hand.length) continue;
            const opts = [{ skip: true }].concat(p.hand.map((id) => ({ discard: id })));
            const o = opts[yield* this.ask({ type: 'revise', pid: q, options: opts })];
            if (o.skip) continue;
            p.hand.splice(p.hand.indexOf(o.discard), 1); s.regionDiscard.push(o.discard);
            const c = this._drawRegion(); if (c != null) p.hand.push(c);
            yield* this.say('event', `🃏 ${this.pn(q)} scarta una Carta Regione e ne pesca una nuova.`, q);
          }
          break;
        default: break;
      }
    }

    // ───────────────────────── partita ─────────────────────────
    *run() {
      const s = this.s;
      yield* this.say('sys', `🎮 Partita iniziata — seed ${this.cfg.seed}. ${this.n} giocatori. Previsione: ${FF.AREAS.map((a) => `${FF.AREA_NAMES[a]} «${FF.PREVISIONI.find((p) => p.id === s.prev[a]).titolo}»`).join(' · ')}.`);
      for (let r = 0; r < this.rules.rounds; r++) yield* this.roundGen();
      yield* this.finish();
      return this.result;
    }

    *finish() {
      const s = this.s, R = this.rules;
      s.phase = 'end'; s.over = true;
      const scores = s.players.map((p) => this.scoreOf(p.id));
      const key = (sc) => R.tieBreak.map((k) => (k === 'accPts' ? sc.accPts : k === 'accRaw' ? sc.accRaw : k === 'coerenza' ? sc.coerenza : sc.pm));
      const cmp = (a, b) => { if (a.total !== b.total) return a.total - b.total; const ka = key(a), kb = key(b); for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] - kb[i]; return 0; };
      let best = scores[0]; scores.forEach((sc) => { if (cmp(sc, best) > 0) best = sc; });
      const winners = scores.map((sc, i) => (cmp(sc, best) === 0 ? i : -1)).filter((i) => i >= 0);
      this.result = { scores, winners, winner: winners.length === 1 ? winners[0] : null, rounds: s.round, startFirst: s.startFirst, target: s.target };
      yield* this.say('end', `🏁 Fine partita alle 20:00! ${scores.map((sc, i) => `${this.pn(i)} ${sc.total}`).join(' · ')} → ${this.result.winner == null ? 'PAREGGIO' : 'vince ' + this.pn(this.result.winner)}.`, -1);
      return this.result;
    }
  }

  FF.Game = Game;

  // Esegue un generatore fino alla fine rispondendo con chooser(dec, game) → indice. Restituisce il valore di ritorno.
  FF.drive = function (gen, chooser, game) {
    let r = gen.next();
    while (!r.done) {
      const v = r.value;
      r = gen.next(v && v.type === 'beat' ? undefined : chooser(v, game));
    }
    return r.value;
  };
  // Chooser casuale riproducibile (per test e fuzz)
  FF.randomChooser = function (seed) { const rng = FF.makeRng(seed); return (dec) => Math.floor(rng() * dec.options.length); };
  // Gioca una partita completa con un chooser; restituisce { game, result }
  FF.playGame = function (cfg, chooser) {
    const g = new Game(cfg);
    const result = FF.drive(g.run(), chooser || FF.randomChooser((cfg && cfg.seed) || 1), g);
    return { game: g, result };
  };
})(typeof window !== 'undefined' ? window : globalThis);
