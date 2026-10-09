/* DOMANI PIOVE — schermata di gioco: setup, sessione (umano / AI / passa-il-telefono / spettatore) e pannelli di decisione */
(function (root) {
  'use strict';
  const FF = (root.FF = root.FF || {});
  const UI = FF.UI;
  const { $, $$, esc } = UI;
  const S = FF.Sprites;
  const SN = FF.SYMBOL_INFO;

  // ───────────────────────── regole modificabili (esperimenti) ─────────────────────────
  const RULE_FIELDS = [
    ['rounds', 'Round (un\'ora l\'uno)'], ['startPM', 'PM iniziali'], ['startCards', 'Carte Regione iniziali'], ['workers', 'Lavoratori iniziali'], ['thirdWorkerCost', 'Costo del 3° lavoratore (PM)'],
    ['marketSize', 'Carte scoperte nel mercato'], ['blindPrice', 'Prezzo della pesca alla cieca'], ['poolPerSymbol', 'Gettoni per simbolo nel pool'], ['maxSymbolsPerCard', 'Simboli massimi per carta'],
    ['borderPoints', 'Punti per bonus di confine'], ['sez2OccupiesSez1', 'La Sezione 2 occupa anche gli spazi della Sezione 1'], ['requireAdjacentPlacement', 'Le carte vanno giocate a contatto con quelle già giocate'],
    ['thirdWorkerNextRound', 'Il 3° lavoratore arriva dal round dopo'], ['rotateFirst', 'Il primo giocatore ruota a ogni round'],
  ];
  UI.rulesFields = function (prefix, values) {
    const v = Object.assign({}, FF.DEFAULT_RULES, values || {});
    let h = '<div class="rulegrid">';
    for (const [k, label] of RULE_FIELDS) {
      const def = FF.DEFAULT_RULES[k];
      if (typeof def === 'boolean') h += `<label for="${prefix}${k}">${label}</label><input type="checkbox" id="${prefix}${k}" data-rule="${k}" ${v[k] ? 'checked' : ''}>`;
      else h += `<label for="${prefix}${k}">${label} <span class="muted">(std ${def})</span></label><input type="number" id="${prefix}${k}" data-rule="${k}" value="${v[k]}" min="0" max="99">`;
    }
    return h + '</div>';
  };
  UI.readRules = function (container) {
    const r = {};
    $$('[data-rule]', container).forEach((el) => { const k = el.dataset.rule; const x = el.type === 'checkbox' ? el.checked : Number(el.value); if (x !== FF.DEFAULT_RULES[k]) r[k] = x; });
    return r;
  };

  // ───────────────────────── setup ─────────────────────────
  const SPEEDS = { step: 'Manuale (clic per avanzare)', slow: 'Lento', normal: 'Normale', fast: 'Veloce', instant: 'Istantaneo' };
  const SPEED_MS = { slow: 1700, normal: 950, fast: 320, instant: 0 };
  const PRESETS = {
    ai: { title: '🤖 Contro l\'AI', kinds: ['human', 'medium', 'medium'], n: 2 },
    hotseat: { title: '👥 Passa il telefono', kinds: ['human', 'human', 'human', 'human'], n: 2 },
    watch: { title: '🍿 AI contro AI', kinds: ['hard', 'medium', 'easy', 'medium'], n: 2 },
  };
  const kindOpts = (sel) => [['human', '👤 Umano'], ['easy', '🤖 AI Facile'], ['medium', '🤖 AI Media'], ['hard', '🤖 AI Difficile']].map(([k, l]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${l}</option>`).join('');

  UI.openSetup = function (mode) {
    UI.screen('setup');
    const el = $('#s-setup'), P = PRESETS[mode];
    const last = UI.store.get('setup_' + mode, {});
    const kinds = last.kinds || P.kinds, names = last.names || [UI.store.get('pname', 'Niky'), 'Erika', 'Giocatore 3', 'Giocatore 4'];
    const speedDef = last.speed || (mode === 'watch' ? 'normal' : 'step'), nDef = last.n || P.n;
    const rows = [0, 1, 2, 3].map((i) => `<div class="seatrow" data-seat="${i}"><span class="srbadge">${S.seat(i)}</span>
      <select id="su-k${i}" aria-label="Tipo del giocatore ${i + 1}">${kindOpts(kinds[i])}</select>
      <input type="text" id="su-n${i}" value="${esc(names[i] || '')}" maxlength="16" aria-label="Nome del giocatore ${i + 1}"></div>`).join('');
    el.innerHTML = `<div class="wrap narrow"><div class="card"><h2>${P.title}</h2>
      <p class="small muted">Gli umani giocano sullo stesso dispositivo: prima di ogni scelta privata compare una schermata di passaggio. ${mode !== 'hotseat' ? 'Le AI hanno tre livelli (Facile &lt; Media &lt; Difficile) e non vedono le tue carte né i mazzi.' : ''}</p>
      <div class="field"><label>Numero di giocatori</label><div class="seg" id="su-n">${[2, 3, 4].map((n) => `<button data-v="${n}" class="${n === nDef ? 'sel' : ''}">${n}</button>`).join('')}</div></div>
      <div class="field"><label>Giocatori</label>${rows}</div>
      <div class="field"><label>Messaggi delle mosse</label><div class="seg" id="su-speed">${Object.entries(SPEEDS).map(([k, v]) => `<button data-v="${k}" class="${k === speedDef ? 'sel' : ''}">${v}</button>`).join('')}</div></div>
      <div class="field"><label for="su-seed">Seed (vuoto = casuale)</label><div class="inline"><input type="text" id="su-seed" placeholder="es. prova-1" value="${esc(last.seed || '')}"><button class="btn sm" id="su-dice" title="Seed casuale">🎲</button></div></div>
      <details class="adv"><summary>⚙ Varianti di regole (avanzate)</summary>${UI.rulesFields('su-r-', last.rules)}</details>
      <div class="btn-row"><button class="btn" id="su-back">← Indietro</button><button class="btn primary grow" id="su-go">Inizia la partita</button></div></div></div>`;
    const syncN = () => { const n = Number(UI.segVal($('#su-n'))); $$('.seatrow').forEach((r) => { r.classList.toggle('hidden', Number(r.dataset.seat) >= n); }); };
    UI.seg($('#su-n'), syncN); syncN();
    UI.seg($('#su-speed'));
    $('#su-dice').onclick = () => { $('#su-seed').value = UI.randomSeed(); };
    $('#su-back').onclick = () => UI.go('home');
    $('#su-go').onclick = () => {
      const n = Number(UI.segVal($('#su-n')));
      const ks = [0, 1, 2, 3].map((i) => $('#su-k' + i).value), ns = [0, 1, 2, 3].map((i) => $('#su-n' + i).value.trim());
      const players = ks.slice(0, n).map((k, i) => (k === 'human' ? { name: ns[i] || 'Giocatore ' + (i + 1), kind: 'human' } : { name: (ns[i] && !/^(Niky|Erika|Giocatore|AI )/.test(ns[i]) ? ns[i] : 'AI ' + (i + 1)) + ' · ' + FF.AI_LEVELS[k], kind: 'ai', level: k }));
      if (ns[0]) UI.store.set('pname', ns[0]);
      if (!players.length || (mode === 'ai' && !players.some((p) => p.kind === 'human'))) { UI.toast('Serve almeno un giocatore umano (o scegli «AI contro AI»).'); return; }
      const seed = $('#su-seed').value.trim() || UI.randomSeed();
      const rules = UI.readRules(el), speed = UI.segVal($('#su-speed'));
      UI.store.set('setup_' + mode, { kinds: ks, names: ns, seed: $('#su-seed').value.trim(), speed, rules, n });
      UI.startSession({ seed, rules, players, speed, notes: [] });
    };
  };

  UI.startSession = function (cfg, history, opts) {
    if (UI.session) UI.session.dispose();
    UI.session = new Session(cfg, history, opts);
    UI.session.start();
  };

  // ───────────────────────── anteprima delle conseguenze ─────────────────────────
  function scoreTable(g, table) {
    const a = FF.accuracyScore(table, g.s.target, g.rules), c = FF.borderScore(table, g.rules).total + FF.patternScore(table, g.rules).total;
    return { raw: a.raw, pts: a.pts, coer: c, total: a.pts + c };
  }
  const cloneTable = (t) => t.map((e) => ({ id: e.id, x: e.x, y: e.y, sym: e.sym.slice(), fusion: e.fusion }));
  UI.previewMove = function (g, pid, move) {
    const p = g.s.players[pid], before = scoreTable(g, p.table), t = cloneTable(p.table), notes = [];
    if (move.kind === 'play') {
      if (move.replace) { const e = t.find((x) => FF.REGION_CARDS[x.id].regione === g.card(move.card).regione); e.id = move.card; }
      else t.push({ id: move.card, x: move.x, y: move.y, sym: [], fusion: null });
    } else if (move.kind === 'symbol') {
      const e = t[move.idx]; e.sym.push(move.sym); e.fusion = FF.fusionOf(e.sym);
      if (e.fusion) notes.push(`💥 Fusione: ${e.fusion}. La carta conterà <b>solo come ${e.fusion}</b>.`);
    }
    const after = scoreTable(g, t);
    return { before, after, notes };
  };
  const previewHTML = (pv) => {
    const d = (a, b) => (b > a ? `<span class="up">▲ ${b}</span>` : b < a ? `<span class="down">▼ ${b}</span>` : `<span>${b}</span>`);
    return `<div class="preview"><div><b>Anteprima</b> (punteggio provvisorio)</div><div>Accuratezza: grezzo ${pv.before.raw} → ${d(pv.before.raw, pv.after.raw)} · punti ${pv.before.pts} → ${d(pv.before.pts, pv.after.pts)}</div>
      <div>Coerenza Geografica: ${pv.before.coer} → ${d(pv.before.coer, pv.after.coer)} · <b>Totale ${pv.before.total} → ${d(pv.before.total, pv.after.total)}</b></div>${pv.notes.map((n) => `<div>${n}</div>`).join('')}</div>`;
  };

  // ───────────────────────── sessione ─────────────────────────
  const WEIGHT = { round: 0.7, sys: 0.5, event: 1.5, place: 0.8, act: 1.0, pass: 0.6, end: 1, note: 0 };
  const NEXT_TXT = {
    setup: 'Poi: primo round, ore 8:00.', place: 'Poi: i lavoratori si piazzano uno alla volta, a rotazione.', event: 'Poi: si piazzano i lavoratori.', end: 'Partita finita.',
  };

  class Session {
    constructor(cfg, history, opts) {
      this.cfg = cfg; opts = opts || {};
      this.review = !!opts.review;
      this.speed = cfg.speed || 'step';
      this.paused = false; this.cancelled = false; this.waiter = null; this.timer = null;
      cfg.notes = cfg.notes || [];
      this.game = new FF.Game({ seed: cfg.seed, rules: cfg.rules, players: cfg.players, beats: true, log: true, replay: history || [] });
      this.ai = cfg.players.map((p, i) => (p.kind === 'ai' ? FF.AI.create(p.level, cfg.seed + 'a' + i) : null));
      this.humans = cfg.players.map((p, i) => (p.kind === 'human' ? i : -1)).filter((i) => i >= 0);
      this.multi = this.humans.length > 1;
      this.fast = !this.review && !!(history && history.length);
      this.reveal = null; this.showAll = true; this.currentActor = null; this.viewPid = null; this.lastCover = null;
    }
    dispose() { this.cancelled = true; if (this.timer) clearTimeout(this.timer); this.waiter = null; if (this.keyHandler) document.removeEventListener('keydown', this.keyHandler); }

    // quali mani sono visibili sul tavolo
    viewHands() {
      const g = this.game;
      if (g.s.over || this.review) return g.s.players.map((p) => p.id);
      if (!this.humans.length) return this.showAll ? g.s.players.map((p) => p.id) : [];
      if (this.humans.length === 1) return [this.humans[0]];
      return this.reveal != null ? [this.reveal] : [];
    }

    // ── interfaccia ──
    buildUI() {
      UI.screen('game');
      const el = $('#s-game');
      el.innerHTML = `<div class="gbar"><span class="turn" id="g-turn"></span><span class="chip" id="g-first"></span><span class="spacer"></span><div class="ctrl" id="g-ctrl"></div></div>
        <div class="glayout"><aside class="legendcol"><details class="panel" id="g-legend"><summary class="ptitle">Legenda</summary><div class="legend">${UI.legendHTML()}</div></details></aside>
        <div class="maincol">
          <div class="announce" id="g-announce"></div>
          <div class="suggest hidden" id="g-suggest" aria-live="polite"></div>
          <div class="nexttxt" id="g-nexttxt"></div>
          <div class="panel action" id="g-action"></div>
          <div class="panel"><div class="ptitle">Plancia centrale</div><div id="g-board"></div></div>
          <div class="panel"><div class="ptitle">Mercato Carte Regione</div><div id="g-market"></div></div>
          <div class="panel"><div class="ptitle">Il tavolo di <span id="g-tabname"></span></div><div class="tabs" id="g-tabs"></div><div id="g-table"></div><div class="handbox" id="g-hand"></div></div>
        </div>
        <div class="sidecol">
          <div class="panel"><div class="ptitle">Punti e risorse</div><div id="g-scores"></div></div>
          <div class="panel"><div class="ptitle">A colpo d'occhio</div><div id="g-states"></div></div>
          <div class="panel"><div class="ptitle">Cronaca</div><div class="logbox" id="g-log" tabindex="0"></div></div>
        </div></div>`;
      if (window.innerWidth >= 1300) $('#g-legend').open = true;
      $('#g-ctrl').innerHTML = `<select id="g-speed" title="Velocità dei messaggi" aria-label="Velocità dei messaggi">${Object.entries(SPEEDS).map(([k, v]) => `<option value="${k}" ${k === this.speed ? 'selected' : ''}>${v}</option>`).join('')}</select>
        <button class="btn sm" id="g-pause">⏸ Pausa</button><button class="btn sm" id="g-next">⏭ Avanti</button>
        <button class="btn sm ${this.humans.length && !this.review ? '' : 'hidden'}" id="g-skip" title="Salta i messaggi fino alla tua prossima scelta">⏩ Fino alla mia mossa</button>
        <button class="btn sm" id="g-note" title="Aggiungi una nota di playtest alla cronaca">📝 Nota</button><button class="btn sm" id="g-menu">☰ Menu</button>`;
      $('#g-speed').onchange = (e) => { this.speed = e.target.value; this.cfg.speed = this.speed; this.paused = false; this.syncCtrl(); this.release(); };
      $('#g-pause').onclick = () => { this.paused = !this.paused; this.syncCtrl(); if (!this.paused) this.release(); };
      $('#g-next').onclick = () => this.release();
      $('#g-skip').onclick = () => { this.skipTo = true; this.release(); };
      $('#g-announce').addEventListener('click', (e) => { if (this.waiter && !e.target.closest('button')) this.release(); });
      this.keyHandler = (e) => {
        if ((e.code === 'Space' || e.code === 'Enter') && this.waiter && !document.querySelector('.overlay') && !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'SUMMARY'].includes((document.activeElement || {}).tagName)) { e.preventDefault(); this.release(); }
      };
      document.addEventListener('keydown', this.keyHandler);
      $('#g-note').onclick = () => this.addNote();
      $('#g-menu').onclick = () => this.menu();
      this.game.onEvent = (ev) => this.onEvent(ev);
      this.syncCtrl();
    }
    syncCtrl() {
      const stepping = this.speed === 'step' || this.paused;
      $('#g-pause').textContent = this.paused ? '▶ Riprendi' : '⏸ Pausa';
      $('#g-pause').classList.toggle('hidden', this.speed === 'step');
      $('#g-next').classList.toggle('hidden', !stepping);
    }
    onEvent(ev) {
      if (this.cancelled || this.fast) return;
      const box = $('#g-log'); if (!box) return;
      box.insertAdjacentHTML('beforeend', UI.logLine(ev));
      box.scrollTop = box.scrollHeight;
    }
    logHTML() {
      const notes = this.cfg.notes, ev = this.game.events; let h = '';
      const note = (n) => UI.logLine({ k: 'note', r: n.r, p: -1, text: n.text });
      ev.forEach((e, i) => { notes.filter((n) => n.at === i).forEach((n) => { h += note(n); }); h += UI.logLine(e); });
      notes.filter((n) => n.at >= ev.length).forEach((n) => { h += note(n); });
      return h;
    }
    rebuildLog() { const box = $('#g-log'); box.innerHTML = this.logHTML(); box.scrollTop = box.scrollHeight; }

    renderAll(active) {
      if (this.cancelled) return;
      const g = this.game, s = g.s;
      $('#g-turn').innerHTML = `🕒 Round <b>${Math.max(1, s.round)}/${g.rules.rounds}</b> · ore <b>${(7 + Math.max(1, s.round))}:00</b>`;
      $('#g-first').innerHTML = `👑 Primo: <b>${esc(s.players[s.first].name)}</b>`;
      UI.renderBoard($('#g-board'), g);
      $('#g-market').innerHTML = UI.marketHTML(g);
      UI.$('#g-scores').innerHTML = UI.scoresHTML(g); UI.$('#g-states').innerHTML = UI.statesHTML(g);
      $('#g-nexttxt').textContent = NEXT_TXT[s.phase] || '';
      this.renderTable(active);
    }
    // mappa del giocatore osservato (di default quello che sta decidendo, o il primo umano)
    renderTable(active) {
      const g = this.game, n = g.n;
      if (active != null && active >= 0) this.viewPid = active;
      if (this.viewPid == null || this.viewPid >= n) this.viewPid = this.humans[0] != null ? this.humans[0] : 0;
      const v = this.viewPid;
      $('#g-tabname').textContent = g.s.players[v].name;
      $('#g-tabs').innerHTML = g.s.players.map((p) => `<button class="tab ${p.id === v ? 'sel' : ''} ${active === p.id ? 'act' : ''}" data-pid="${p.id}">${S.seat(p.id, 'tiny')} ${esc(p.name)}</button>`).join('');
      $$('#g-tabs .tab').forEach((b) => { b.onclick = () => { this.viewPid = Number(b.dataset.pid); this.renderTable(null); }; });
      $('#g-table').innerHTML = UI.tableauHTML(g, v);
      const vis = this.viewHands().indexOf(v) >= 0, hand = g.s.players[v].hand;
      $('#g-hand').innerHTML = vis ? `<div class="sub">Mano (${hand.length}) · solo tu la vedi</div><div class="hand">${hand.map((id) => `<button class="cardbtn" data-zoom="reg:${id}">${S.region(id)}</button>`).join('') || '<span class="muted">Nessuna carta in mano.</span>'}</div>`
        : `<div class="sub">Mano: ${hand.length} carte <span class="muted">(nascoste)</span></div>`;
    }
    setAction(html) { const a = $('#g-action'); if (a) { a.innerHTML = html; this.applySuggest(); } return a; }

    // ── pacing ──
    release() { if (this.timer) { clearTimeout(this.timer); this.timer = null; } const w = this.waiter; this.waiter = null; if (w) w(); }
    announce(ev, opts) {
      const box = $('#g-announce'); if (!box) return;
      opts = opts || {}; const d = ev.d || {};
      let icon;
      if (ev.k === 'round') icon = '<span class="aemoji">🕒</span>';
      else if (ev.k === 'end') icon = '<span class="aemoji">🏆</span>';
      else if (ev.k === 'event' && d.event) icon = `<span class="amini">${S.evento(d.event)}</span>`;
      else if (ev.k === 'event') icon = '<span class="aemoji">📻</span>';
      else if (ev.k === 'act' && d.card != null && !d.blind) icon = `<span class="amini">${S.region(d.card)}</span>`;
      else if (ev.k === 'act' && d.blind) icon = `<span class="amini">${S.back('regione')}</span>`;
      else if (ev.k === 'act' && d.fusion) icon = `<span class="atoken">${S.fusion(d.fusion)}</span>`;
      else if (ev.k === 'act' && d.sym) icon = `<span class="atoken">${S.symbol(d.sym)}</span>`;
      else if (ev.k === 'place') icon = `<span class="aemoji">${S.worker('big')}</span>`;
      else if (ev.p >= 0) icon = `<span class="aseat">${S.seat(ev.p)}</span>`;
      else icon = '<span class="aemoji">🃏</span>';
      const text = ev.text.replace(/━+/g, '').trim();
      box.className = `announce k-${ev.k} ${ev.p >= 0 ? 'p' + ev.p : ''}${opts.prompt ? ' prompt' : ''}`;
      box.innerHTML = `<div class="aicon">${icon}</div><div class="atext"><div class="amain">${esc(text)}</div></div>${opts.button ? '<button class="btn primary abtn" id="a-next">Avanti ▶</button>' : ''}${opts.prompt && opts.suggest ? '<button class="btn abtn" id="a-sug" title="L\'AI difficile ti propone una mossa (non vede le carte degli altri)">💡 Suggerimento</button>' : ''}`;
      const b = $('#a-next'); if (b) b.onclick = () => this.release();
      const sg = $('#a-sug'); if (sg) sg.onclick = () => this.showSuggest();
    }
    promptFor(d) {
      const n = this.game.s.players[d.pid].name;
      return {
        place: `${n}: tocca a te — piazza un lavoratore o passa`, play: `${n}: scegli la Carta Regione da giocare e dove`, buy: `${n}: scegli quale carta comprare`, symbol: `${n}: scegli il simbolo e la carta su cui metterlo`,
        doppia1: `${n}: Doppia azione — scegli la 1ª azione`, doppia2: `${n}: Doppia azione — scegli la 2ª azione`, ripetuta: `${n}: Azione ripetuta — quale azione fai due volte?`,
        keep: `${n}: scegli la carta da tenere`, order: `${n}: scegli l'ordine delle carte rimesse in fondo`, swap: `${n}: vuoi scambiare una carta con il mercato?`, revise: `${n}: vuoi scartare una carta e pescarne una nuova?`,
      }[d.type] || `Tocca a ${n}`;
    }
    async pace(ev) {
      if (this.fast || this.cancelled) return;
      const always = (ev.k === 'round' || ev.k === 'event' || ev.k === 'end') && this.speed !== 'instant';
      const stepping = this.speed === 'step' || this.paused || always;
      if (this.skipTo && !always) { this.announce(ev); return; }
      this.setAction('<div class="muted idle">Segui i messaggi qui sopra ☝️ <span class="small">(clic sul messaggio, Avanti, Spazio o Invio)</span></div>');
      if (stepping) { this.announce(ev, { button: true }); await new Promise((r) => { this.waiter = r; }); return; }
      const base = SPEED_MS[this.speed];
      this.announce(ev);
      if (!base) { if (ev.i % 12 === 0) await UI.sleep(0); return; }
      const w = WEIGHT[ev.k] == null ? 1 : WEIGHT[ev.k];
      await new Promise((r) => { this.waiter = r; this.timer = setTimeout(() => { this.timer = null; this.waiter = null; r(); }, base * w * 1.4); });
    }

    // ── ciclo principale ──
    async start() {
      this.buildUI();
      const g = this.game;
      $('#tb-info').innerHTML = `<span class="chip">seed ${esc(this.cfg.seed)}</span>${this.review ? '<span class="chip">revisione</span>' : ''}`;
      this.renderAll(null);
      $('#g-log').innerHTML = '';
      this.announce({ k: 'sys', p: -1, text: this.review ? 'Rivedi la partita: i messaggi si avanzano a mano.' : 'Si comincia! I messaggi delle mosse compaiono qui.', d: {} });
      const it = g.run();
      let r = it.next();
      while (!r.done) {
        if (this.cancelled) return;
        const d = r.value;
        if (d.type === 'beat') {
          if (!this.fast && this.speed !== 'instant') this.renderAll(d.ev.p >= 0 ? d.ev.p : null);
          await this.pace(d.ev);
          if (this.fast && g.replay.length === 0) { this.fast = false; this.rebuildLog(); this.renderAll(); }
          r = it.next();
          continue;
        }
        if (this.fast) { this.fast = false; this.rebuildLog(); }
        this.currentActor = d.pid;
        const pl = this.cfg.players[d.pid];
        let ans;
        if (pl.kind === 'human' && !this.review) {
          this.skipTo = false;
          this.renderAll(d.pid);
          this.curDec = d; this.sugg = null; this.hideSuggest();
          this.announce({ k: 'prompt', p: d.pid, text: this.promptFor(d), d: {} }, { prompt: true, suggest: true });
          ans = await this.humanDecide(d);
          this.curDec = null; this.sugg = null; this.hideSuggest();
        } else if (this.review) ans = 0;
        else ans = this.aiDecide(d);
        this.currentActor = null;
        if (this.cancelled) return;
        r = it.next(ans);
        this.save();
      }
      if (this.cancelled) return;
      if (!this.review) UI.store.del('save');
      this.renderAll(null);
      this.setAction('<div class="muted idle">Partita finita.</div>');
      this.endDialog();
    }
    aiDecide(d) {
      try { return this.ai[d.pid].decide(this.game, d); }
      catch (e) { console.error('AI error', e); return FF.RandomBot(1).decide(this.game, d); }
    }
    save() {
      if (this.review) return;
      UI.store.set('save', { cfg: this.cfg, history: this.game.history, round: this.game.s.round, t: Date.now() });
    }

    // ── decisioni umane ──
    async humanDecide(d) {
      if (this.multi && this.lastCover !== d.pid) {
        this.reveal = null; this.renderAll(d.pid);
        await this.cover(d.pid, this.promptFor(d));
        this.lastCover = d.pid;
      }
      this.reveal = d.pid; this.renderAll(d.pid);
      let ans;
      switch (d.type) {
        case 'place': ans = await this.placePanel(d); break;
        case 'play': ans = await this.playPanel(d); break;
        case 'buy': ans = await this.buyPanel(d); break;
        case 'symbol': ans = await this.symbolPanel(d); break;
        case 'doppia1': case 'doppia2': case 'ripetuta': ans = await this.actPanel(d); break;
        case 'keep': ans = await this.cardsPanel(d, 'Tieni questa carta'); break;
        case 'order': ans = await this.orderPanel(d); break;
        case 'swap': ans = await this.swapPanel(d); break;
        case 'revise': ans = await this.revisePanel(d); break;
        default: ans = 0;
      }
      if (this.multi) { this.setAction('<h3>Scelta fatta ✔</h3><div class="muted">Passa il dispositivo se serve.</div>'); }
      return ans;
    }
    cover(pid, why) {
      const p = this.cfg.players[pid];
      return new Promise((resolve) => {
        const dlg = UI.modal(`<div class="bigseat">${S.seat(pid)}</div><h2>Tocca a ${esc(p.name)}</h2><p>${esc(why)}</p>
          <p class="small muted">Passa il dispositivo: gli altri giocatori non devono guardare lo schermo.</p>
          <div class="btn-row end"><button class="btn primary big" data-go>Sono ${esc(p.name)} — mostra la mia mano</button></div>`, { solid: true, dismiss: false });
        dlg.el.querySelector('[data-go]').onclick = () => { dlg.close(); resolve(); };
      });
    }
    // aspetta un clic su uno dei bottoni/elementi nel pannello azione; il ritorno è deciso da handler(el) (undefined = ignora)
    waitClick(handler) {
      return new Promise((resolve) => {
        const box = $('#g-action');
        const on = async (e) => {
          const out = await handler(e);
          if (out !== undefined) { box.removeEventListener('click', on); resolve(out); }
        };
        box.addEventListener('click', on);
        this._cancelWait = () => box.removeEventListener('click', on);
      });
    }

    // ── pannello: piazza un lavoratore ──
    placePanel(d) {
      const g = this.game, pid = d.pid, p = g.s.players[pid];
      const idx = {}; d.options.forEach((o, i) => { if (o.space) idx[o.space] = i; else idx.pass = i; });
      const btn = (sp) => {
        const why = idx[sp] == null ? (UI.spaceReason(g, pid, sp) || 'Non disponibile ora') : null, two = sp === 'doppia' || sp === 'ripetuta';
        return `<button class="spacebtn ${why ? 'off' : ''}" data-sp="${sp}" ${why ? 'aria-disabled="true"' : ''}><span class="sb-w">${S.worker()}${two ? S.worker() : ''}</span><span class="sb-t"><b>${esc(FF.SPACE_NAMES[sp])}</b><span class="small">${esc(UI.SPACE_DESC[sp])}</span>${why ? `<span class="why">⛔ ${esc(why)}</span>` : ''}</span></button>`;
      };
      this.setAction(`<h3>${S.seat(pid, 'tiny')} ${esc(p.name)} — piazza un lavoratore</h3>
        <div class="small muted">PM: <b>${p.pm}</b> · lavoratori da piazzare: <b>${p.left}</b> · carte in mano: <b>${p.hand.length}</b></div>
        <div class="spacebtns">${FF.SPACES1.map(btn).join('')}${FF.SPACES2.map(btn).join('')}</div>
        <div class="btn-row"><button class="btn" data-sp="pass">⏭ Passa (non uso altri lavoratori in questo round)</button></div>`);
      return this.waitClick(async (e) => {
        const b = e.target.closest('[data-sp]'); if (!b) return undefined;
        const sp = b.dataset.sp;
        if (sp === 'pass') {
          if (d.options.length > 1 && p.left > 0) { const ok = await UI.confirm('Passare davvero?', `Hai ancora <b>${p.left}</b> lavoratore/i e puoi fare altro. Se passi, per questo round hai finito.`, 'Sì, passo', 'No, continuo'); if (!ok) return undefined; }
          return idx.pass;
        }
        if (idx[sp] == null) { UI.toast('⛔ ' + (UI.spaceReason(g, pid, sp) || 'Non disponibile')); return undefined; }
        if (sp === 'sblocca') { const ok = await UI.confirm('Sbloccare il 3° lavoratore?', `Paghi <b>${g.rules.thirdWorkerCost} PM</b> (ne hai ${p.pm}, ne resteranno ${p.pm - g.rules.thirdWorkerCost}). Il lavoratore arriva ${g.rules.thirdWorkerNextRound ? 'dal prossimo round' : 'subito'}.`, 'Sì, lo sblocco', 'No'); if (!ok) return undefined; }
        return idx[sp];
      });
    }

    // ── pannello: gioca una carta (carta → cella → anteprima → conferma) ──
    playPanel(d) {
      const g = this.game, pid = d.pid, p = g.s.players[pid];
      const cards = Array.from(new Set(d.options.map((o) => o.card)));
      let sel = null;
      const draw = () => {
        const opts = d.options.filter((o) => o.card === sel);
        const cells = opts.filter((o) => !o.replace).map((o) => [o.x, o.y]), rep = opts.find((o) => o.replace);
        const pickIdx = rep ? [p.table.findIndex((e) => FF.regionOf(e) === g.card(sel).regione)] : [];
        this.setAction(`<h3>${S.seat(pid, 'tiny')} ${esc(p.name)} — gioca una Carta Regione</h3>
          <div class="sub">1. Scegli la carta dalla mano</div><div class="hand">${cards.map((id) => `<button class="cardbtn selectable ${id === sel ? 'chosen' : ''}" data-card="${id}" title="${esc(g.card(id).regione)}">${S.region(id)}</button>`).join('')}</div>
          ${sel != null ? `<div class="sub">2. ${rep ? 'Questa regione è già in gioco: tocca la carta da sostituire' : 'Tocca la cella dove metterla (a contatto con le tue carte)'}</div>${UI.tableauHTML(g, pid, { cells, pickIdx })}${rep ? '<div class="small muted">Sostituire: la vecchia carta va negli scarti e <b>i simboli già sopra restano</b>.</div>' : ''}` : '<div class="small muted">Tocca una carta per vedere dove puoi giocarla. (Tocca di nuovo per ingrandirla.)</div>'}
          <div id="pv"></div>`);
      };
      draw();
      let chosen = null;
      return this.waitClick(async (e) => {
        const cb = e.target.closest('[data-card]');
        if (cb) { if (sel === cb.dataset.card * 1) { UI.zoomSpec('reg:' + sel); return undefined; } sel = Number(cb.dataset.card); chosen = null; draw(); return undefined; }
        const cell = e.target.closest('[data-cell]'), rp = e.target.closest('.tcell.pick [data-idx]');
        let opt = null;
        if (cell) { const [x, y] = cell.dataset.cell.split(',').map(Number); opt = d.options.find((o) => o.card === sel && o.x === x && o.y === y); }
        else if (rp) opt = d.options.find((o) => o.card === sel && o.replace);
        if (opt) {
          chosen = opt;
          const pv = UI.previewMove(g, pid, { kind: 'play', card: opt.card, replace: opt.replace, x: opt.x, y: opt.y });
          $('#pv').innerHTML = previewHTML(pv) + `<div class="btn-row"><button class="btn" data-no>Cambia</button><button class="btn primary grow" data-ok>✔ Conferma: gioca ${esc(g.card(opt.card).regione)}</button></div>`;
          return undefined;
        }
        if (e.target.closest('[data-no]')) { chosen = null; draw(); return undefined; }
        if (e.target.closest('[data-ok]') && chosen) return d.options.indexOf(chosen);
        return undefined;
      });
    }

    // ── pannello: compra ──
    buyPanel(d) {
      const g = this.game, pid = d.pid, p = g.s.players[pid];
      const slots = {}; d.options.forEach((o, i) => { if (o.blind) slots.blind = i; else slots[o.slot] = i; });
      this.setAction(`<h3>${S.seat(pid, 'tiny')} ${esc(p.name)} — compra una carta</h3><div class="small muted">Hai <b>${p.pm} PM</b>. Tocca una carta per acquistarla.</div>
        ${UI.marketHTML(g, { pick: true, blind: slots.blind != null, disabled: (i) => slots[i] == null, afford: (i) => slots[i] != null })}<div id="pv"></div>`);
      let chosen = null;
      return this.waitClick(async (e) => {
        const c = e.target.closest('[data-slot],[data-blind]');
        if (c && !c.disabled) {
          chosen = c.dataset.blind ? slots.blind : slots[Number(c.dataset.slot)];
          const o = d.options[chosen];
          $('#pv').innerHTML = `<div class="preview"><div><b>${o.blind ? 'Pesca alla cieca dal mazzo' : 'Compri ' + esc(g.card(o.card).regione)}</b></div><div>Paghi <b>${o.price} PM</b>: ${p.pm} → <b>${p.pm - o.price}</b>. La carta va nella tua mano.</div></div><div class="btn-row"><button class="btn" data-no>Cambia</button><button class="btn primary grow" data-ok>✔ Conferma l'acquisto</button></div>`;
          return undefined;
        }
        if (e.target.closest('[data-no]')) { chosen = null; $('#pv').innerHTML = ''; return undefined; }
        if (e.target.closest('[data-ok]') && chosen != null) return chosen;
        return undefined;
      });
    }

    // ── pannello: raccogli un simbolo (simbolo → carta → anteprima → conferma) ──
    symbolPanel(d) {
      const g = this.game, pid = d.pid, p = g.s.players[pid];
      const syms = Array.from(new Set(d.options.map((o) => o.sym)));
      let sel = null, chosen = null;
      const draw = () => {
        const pickIdx = d.options.filter((o) => o.sym === sel).map((o) => o.idx);
        this.setAction(`<h3>${S.seat(pid, 'tiny')} ${esc(p.name)} — raccogli un simbolo</h3>
          <div class="sub">1. Scegli il simbolo dal pool</div><div class="pool">${FF.SYMBOLS.map((x) => { const ok = syms.indexOf(x) >= 0; return `<button class="poolsym ${ok ? 'selectable' : 'empty'} ${x === sel ? 'chosen' : ''}" ${ok ? `data-sym="${x}"` : 'disabled'} title="${SN[x].n}">${S.symbol(x)}<span class="pc">${g.s.pool[x]}</span></button>`; }).join('')}</div>
          ${sel ? `<div class="sub">2. Tocca la carta su cui metterlo (${SN[sel].i} ${SN[sel].n})</div>${UI.tableauHTML(g, pid, { pickIdx })}` : `<div class="small muted">Tocca un simbolo.${syms.length < FF.SYMBOLS.length ? ' Quelli in grigio sono finiti nel pool.' : ''}</div>`}<div id="pv"></div>`);
      };
      draw();
      return this.waitClick(async (e) => {
        const sb = e.target.closest('[data-sym]');
        if (sb) { sel = sb.dataset.sym; chosen = null; draw(); return undefined; }
        const cb = e.target.closest('.tcell.pick [data-idx]');
        if (cb && sel) {
          const idx = Number(cb.dataset.idx), opt = d.options.find((o) => o.sym === sel && o.idx === idx);
          if (!opt) return undefined;
          chosen = opt;
          const pv = UI.previewMove(g, pid, { kind: 'symbol', sym: sel, idx });
          chosen.pv = pv;
          $('#pv').innerHTML = previewHTML(pv) + `<div class="btn-row"><button class="btn" data-no>Cambia</button><button class="btn primary grow" data-ok>✔ Conferma: ${SN[sel].i} su ${esc(FF.regionOf(p.table[idx]))}</button></div>`;
          return undefined;
        }
        if (e.target.closest('[data-no]')) { chosen = null; draw(); return undefined; }
        if (e.target.closest('[data-ok]') && chosen) {
          if (chosen.pv.after.total < chosen.pv.before.total) {
            const ok = await UI.confirm('Questa mossa ti toglie punti', `Il totale provvisorio passa da <b>${chosen.pv.before.total}</b> a <b>${chosen.pv.after.total}</b>${chosen.pv.notes.length ? '<br>' + chosen.pv.notes.join('<br>') : ''}<br>I simboli non si spostano più.`, 'Lo faccio lo stesso', 'Torno indietro');
            if (!ok) return undefined;
          }
          return d.options.indexOf(chosen);
        }
        return undefined;
      });
    }

    // ── pannelli semplici ──
    actPanel(d) {
      const g = this.game, p = g.s.players[d.pid];
      this.setAction(`<h3>${S.seat(d.pid, 'tiny')} ${esc(p.name)} — ${esc(this.promptFor(d).split('—').pop().trim())}</h3><div class="spacebtns">${d.options.map((o, i) => `<button class="spacebtn" data-i="${i}"><span class="sb-t"><b>${esc(FF.SPACE_NAMES[o.act])}</b><span class="small">${esc(UI.SPACE_DESC[o.act])}</span></span></button>`).join('')}</div>`);
      return this.waitClick(async (e) => { const b = e.target.closest('[data-i]'); return b ? Number(b.dataset.i) : undefined; });
    }
    cardsPanel(d, label) {
      this.setAction(`<h3>${esc(this.promptFor(d))}</h3><div class="hand">${d.options.map((o, i) => `<div class="pickcard"><button class="cardbtn selectable" data-i="${i}">${S.region(o.card)}</button><div class="small">${esc(label)}</div></div>`).join('')}</div>`);
      return this.waitClick(async (e) => { const b = e.target.closest('[data-i]'); return b ? Number(b.dataset.i) : undefined; });
    }
    orderPanel(d) {
      this.setAction(`<h3>${esc(this.promptFor(d))}</h3><div class="small muted">La prima resta più in alto tra le due, in fondo al mazzo.</div><div class="btn-row">${d.options.map((o, i) => `<button class="btn" data-i="${i}">${o.order.map((id) => `<span class="mini">${S.region(id)}</span>`).join(' → ')}</button>`).join('')}</div>`);
      return this.waitClick(async (e) => { const b = e.target.closest('[data-i]'); return b ? Number(b.dataset.i) : undefined; });
    }
    swapPanel(d) {
      this.setAction(`<h3>${esc(this.promptFor(d))}</h3><div class="btn-row"><button class="btn primary" data-i="0">Non scambio</button></div><div class="swaplist">${d.options.map((o, i) => (i === 0 ? '' : `<button class="btn" data-i="${i}">Dai <span class="mini">${S.region(o.hand)}</span> prendi <span class="mini">${S.region(o.card)}</span></button>`)).join('')}</div>`);
      return this.waitClick(async (e) => { const b = e.target.closest('[data-i]'); return b ? Number(b.dataset.i) : undefined; });
    }
    revisePanel(d) {
      this.setAction(`<h3>${esc(this.promptFor(d))}</h3><div class="btn-row"><button class="btn primary" data-i="0">Tengo la mano com'è</button></div><div class="hand">${d.options.map((o, i) => (i === 0 ? '' : `<div class="pickcard"><button class="cardbtn selectable" data-i="${i}">${S.region(o.discard)}</button><div class="small">Scarta questa</div></div>`)).join('')}</div>`);
      return this.waitClick(async (e) => { const b = e.target.closest('[data-i]'); return b ? Number(b.dataset.i) : undefined; });
    }

    // ── suggerimento dell'AI (facoltativo) ──
    describeOption(d, o) {
      const g = this.game, rn = (id) => g.card(id).regione;
      switch (d.type) {
        case 'place': return o.pass ? 'Passa per questo round' : `Piazza su «${FF.SPACE_NAMES[o.space]}»`;
        case 'play': return o.replace ? `Gioca ${rn(o.card)} al posto di quella che hai` : `Gioca ${rn(o.card)} nella cella (${o.x},${o.y})`;
        case 'buy': return o.blind ? `Pesca alla cieca (${o.price} PM)` : `Compra ${rn(o.card)} (${o.price} PM)`;
        case 'symbol': return `Metti ${SN[o.sym].i} ${SN[o.sym].n} su ${FF.regionOf(g.s.players[d.pid].table[o.idx])}`;
        case 'doppia1': case 'doppia2': case 'ripetuta': return `Scegli «${FF.SPACE_NAMES[o.act]}»`;
        case 'keep': return `Tieni ${rn(o.card)}`;
        case 'swap': return o.skip ? 'Non scambiare' : `Scambia ${rn(o.hand)} con ${rn(o.card)}`;
        case 'revise': return o.skip ? 'Tieni la mano' : `Scarta ${rn(o.discard)}`;
        default: return 'Questa scelta';
      }
    }
    showSuggest() {
      const d = this.curDec; if (!d || this.review) return;
      const r = FF.AI.suggest(this.game, d), o = d.options[r.index];
      this.sugg = { d, index: r.index };
      const box = $('#g-suggest'); box.classList.remove('hidden');
      box.innerHTML = `<b>💡 Suggerimento dell'AI difficile:</b> ${esc(this.describeOption(d, o))}. <span class="muted small">Guadagno stimato ${r.value >= 0 ? '+' : ''}${r.value.toFixed(1)} punti (è solo una stima: l'AI non vede le carte degli altri e può sbagliare).</span>`;
      this.applySuggest();
    }
    hideSuggest() { const box = $('#g-suggest'); if (box) { box.classList.add('hidden'); box.innerHTML = ''; } }
    applySuggest() {
      $$('#g-action .suggested').forEach((e) => e.classList.remove('suggested'));
      if (!this.sugg) return;
      const { d, index } = this.sugg, o = d.options[index], q = (sel) => $$('#g-action ' + sel).forEach((e) => e.classList.add('suggested'));
      switch (d.type) {
        case 'place': q(o.pass ? '[data-sp="pass"]' : `[data-sp="${o.space}"]`); break;
        case 'play': q(`[data-card="${o.card}"]`); if (o.replace) q('.tcell.pick .cardbtn'); else q(`[data-cell="${o.x},${o.y}"]`); break;
        case 'buy': q(o.blind ? '[data-blind]' : `[data-slot="${o.slot}"]`); break;
        case 'symbol': q(`[data-sym="${o.sym}"]`); q(`.tcell.pick[data-idx="${o.idx}"] .cardbtn`); break;
        default: q(`[data-i="${index}"]`);
      }
    }

    // ── note, menu, fine ──
    addNote() {
      const dlg = UI.modal(`<h2>📝 Nota di playtest</h2><p class="small muted">La nota entra nella cronaca esportata, nel punto esatto della partita.</p><textarea id="nt-text" rows="4" placeholder="Cosa ti sembra strano o interessante?"></textarea><div class="btn-row end"><button class="btn" data-x>Annulla</button><button class="btn primary" data-ok>Aggiungi</button></div>`);
      dlg.el.querySelector('[data-x]').onclick = () => dlg.close();
      dlg.el.querySelector('[data-ok]').onclick = () => {
        const t = dlg.el.querySelector('#nt-text').value.trim(); dlg.close(); if (!t) return;
        this.cfg.notes.push({ at: this.game.events.length, r: this.game.s.round, text: t }); this.rebuildLog(); this.save(); UI.toast('Nota aggiunta ✓');
      };
    }
    exportLog(kind) {
      const g = this.game, name = `domani-piove-${this.cfg.seed}`;
      if (kind === 'json') UI.download(name + '.json', JSON.stringify({ seed: this.cfg.seed, rules: this.cfg.rules, players: this.cfg.players, history: g.history, notes: this.cfg.notes, events: g.events, result: g.result }, null, 1), 'application/json');
      else {
        const notes = this.cfg.notes, lines = [`DOMANI PIOVE — seed ${this.cfg.seed}`, `Giocatori: ${this.cfg.players.map((p) => p.name + (p.kind === 'ai' ? ' (AI)' : '')).join(', ')}`, ''];
        g.events.forEach((e, i) => { notes.filter((n) => n.at === i).forEach((n) => lines.push(`[NOTA R${n.r}] ${n.text}`)); lines.push(`R${e.r}\t${e.text}`); });
        notes.filter((n) => n.at >= g.events.length).forEach((n) => lines.push(`[NOTA R${n.r}] ${n.text}`));
        UI.download(name + '.txt', lines.join('\n'));
      }
    }
    menu() {
      const dlg = UI.modal(`<h2>☰ Menu</h2><div class="menulist"><button class="btn" data-a="rules">📖 Regole</button><button class="btn" data-a="txt">⬇ Esporta la cronaca (.txt)</button><button class="btn" data-a="json">⬇ Esporta la partita (.json)</button><button class="btn" data-a="seed">📋 Copia il seed</button><button class="btn danger" data-a="home">🏠 Esci dalla partita</button></div><div class="btn-row end"><button class="btn primary" data-a="x">Chiudi</button></div>`);
      dlg.el.addEventListener('click', async (e) => {
        const a = e.target.closest('[data-a]'); if (!a) return; const k = a.dataset.a;
        if (k === 'x') dlg.close();
        else if (k === 'rules') { dlg.close(); UI.showRulesModal(); }
        else if (k === 'txt' || k === 'json') this.exportLog(k);
        else if (k === 'seed') UI.copy(String(this.cfg.seed));
        else if (k === 'home') { dlg.close(); const ok = await UI.confirm('Uscire dalla partita?', 'La partita resta salvata: potrai riprenderla dal menu principale.', 'Esci', 'Resto qui'); if (ok) UI.go('home'); }
      });
    }
    endDialog() {
      const g = this.game, r = g.result, win = r.winners.map((i) => g.s.players[i].name);
      const rows = r.scores.map((sc, i) => `<tr class="${r.winners.indexOf(i) >= 0 ? 'win' : ''}"><td>${S.seat(i, 'tiny')} ${esc(g.s.players[i].name)}</td><td>${sc.accRaw}</td><td>${sc.accPts}</td><td>${sc.border}</td><td>${sc.pattern}</td><td>${sc.objectives}</td><td><b>${sc.total}</b></td></tr>`).join('');
      const dlg = UI.modal(`<h2>🏁 Confronto Finale — ore 20:00</h2><p class="big">${r.winner == null ? '🤝 Pareggio tra ' + esc(win.join(' e ')) : '🏆 Vince <b>' + esc(win[0]) + '</b>'}</p>
        <div class="tblwrap"><table class="scoretbl"><thead><tr><th></th><th>Acc. grezzo</th><th>Acc. punti</th><th>Confine</th><th>Pattern</th><th>Obiettivi</th><th>Totale</th></tr></thead><tbody>${rows}</tbody></table></div>
        <div class="small muted">Pattern per giocatore: ${r.scores.map((sc, i) => esc(g.s.players[i].name) + ' — ' + FF.SYMBOLS.map((x) => SN[x].i + sc.patternBy[x]).join(' ')).join(' · ')}</div>
        <div class="btn-row"><button class="btn" data-a="review">⏪ Rivedi</button><button class="btn" data-a="txt">⬇ Cronaca</button><button class="btn" data-a="json">⬇ Partita</button><button class="btn primary" data-a="home">Menu</button></div>`, { wide: true });
      dlg.el.addEventListener('click', (e) => {
        const a = e.target.closest('[data-a]'); if (!a) return; const k = a.dataset.a;
        if (k === 'review') { dlg.close(); UI.startSession(Object.assign({}, this.cfg, { speed: 'step' }), g.history, { review: true }); }
        else if (k === 'txt' || k === 'json') this.exportLog(k);
        else if (k === 'home') { dlg.close(); UI.go('home'); }
      });
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
