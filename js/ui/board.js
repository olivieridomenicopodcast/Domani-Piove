/* DOMANI PIOVE — disegno del tavolo: plancia, mercato, mappa di un giocatore, punteggi e stati "a colpo d'occhio" */
(function (root) {
  'use strict';
  const FF = (root.FF = root.FF || {});
  const UI = FF.UI;
  const { esc } = UI;
  const S = FF.Sprites;
  const SN = FF.SYMBOL_INFO;
  const hour = (r) => (7 + r) + ':00';

  const SPACE_DESC = {
    gioca: 'Metti una Carta Regione sul tavolo', compra: 'Prendi una carta pagando in PM', simbolo: 'Metti un simbolo su una tua carta', pm: '+1 Punto Meteo', sblocca: '3° lavoratore: 5 PM',
    doppia: '2 azioni diverse', ripetuta: 'La stessa azione 2 volte',
  };
  UI.SPACE_DESC = SPACE_DESC;

  // Perché uno spazio non è disponibile per il giocatore pid (null = disponibile)
  UI.spaceReason = function (g, pid, sp) {
    const s = g.s, p = s.players[pid], R = g.rules;
    if (s.occupied[sp] != null) return `Occupato da ${s.players[s.occupied[sp]].name}`;
    if (p.left < 1) return 'Hai finito i lavoratori';
    if (sp === 'doppia' || sp === 'ripetuta') {
      if (p.left < 2) return `Servono 2 lavoratori (te ne resta ${p.left})`;
      const acts = FF.SPACES1.filter((a) => g.legalAction(pid, a) && (!R.sez2OccupiesSez1 || !s.occupied[a]));
      if (sp === 'doppia' && acts.length < 2) return 'Servono almeno 2 azioni diverse possibili';
      if (sp === 'ripetuta' && !acts.some((a) => a !== 'sblocca')) return 'Nessuna azione ripetibile';
      return null;
    }
    if (g.legalAction(pid, sp)) return null;
    switch (sp) {
      case 'gioca': return 'Non hai Carte Regione in mano';
      case 'compra': return p.pm < 1 ? 'Non hai PM (la carta più economica costa 1)' : 'Nessuna carta acquistabile con i tuoi PM';
      case 'simbolo':
        if (!p.table.length) return 'Prima gioca una Carta Regione';
        if (!p.table.some((e) => e.sym.length < R.maxSymbolsPerCard)) return `Tutte le tue carte hanno già ${R.maxSymbolsPerCard} simboli`;
        return 'Il pool dei simboli è esaurito';
      case 'sblocca':
        if (p.workers >= 3) return 'Hai già il 3° lavoratore';
        if (p.pendingWorker) return 'Già sbloccato: arriva dal prossimo round';
        return `Servono ${R.thirdWorkerCost} PM (ne hai ${p.pm})`;
      default: return 'Non disponibile';
    }
  };

  // ───────────────────────── plancia ─────────────────────────
  UI.timelineHTML = function (g) {
    const R = g.rules, r = g.s.round; let h = '<div class="timeline" aria-label="Ore della giornata">';
    for (let i = 1; i <= R.rounds; i++) {
      const ev = R.eventRounds.indexOf(i) >= 0;
      h += `<div class="tl ${i === r ? 'now' : ''} ${i < r ? 'done' : ''} ${ev ? 'ev' : ''}" title="Round ${i} · ore ${hour(i)}${ev ? ' · Carta Evento' : ''}"><span class="tlh">${7 + i}</span>${ev ? '<span class="tle">📻</span>' : ''}</div>`;
    }
    h += `<div class="tl end ${g.s.over ? 'now' : ''}" title="20:00 · fine partita · Confronto Finale"><span class="tlh">20</span><span class="tle">🏁</span></div></div>`;
    return h;
  };
  UI.spacesHTML = function (g, activePid) {
    const s = g.s;
    const tile = (sp) => {
      const occ = s.occupied[sp], two = sp === 'doppia' || sp === 'ripetuta';
      return `<div class="space ${occ != null ? 'busy p' + occ : 'free'} ${two ? 'two' : ''}"><div class="sp-top"><span class="sp-w">${S.worker()}${two ? S.worker() : ''}</span><b>${esc(FF.SPACE_NAMES[sp])}</b></div>
        <div class="sp-d">${esc(SPACE_DESC[sp])}</div><div class="sp-o">${occ != null ? `${S.seat(occ, 'tiny')} ${esc(s.players[occ].name)}` : '<span class="muted">libero</span>'}</div></div>`;
    };
    return `<div class="spaces"><div class="sp-group"><div class="sp-title">Sezione 1 · un lavoratore</div><div class="sp-grid">${FF.SPACES1.map(tile).join('')}</div></div>
      <div class="sp-group"><div class="sp-title">Sezione 2 · due lavoratori</div><div class="sp-grid">${FF.SPACES2.map(tile).join('')}</div></div></div>`;
  };
  UI.targetHTML = function (g) {
    const s = g.s;
    return `<div class="targets">${FF.AREAS.map((a) => {
      const p = FF.PREVISIONI.find((x) => x.id === s.prev[a]);
      return `<div class="tgt a-${a}"><div class="tgt-h"><b>${FF.AREA_NAMES[a]}</b> <button class="linkbtn" data-zoom="prev:${p.id}" title="Vedi la Carta Previsione">${esc(p.titolo)}</button></div>
        ${s.target[a].map((c) => {
          const ch = c.req !== c.orig;
          return `<div class="cond ${ch ? 'chg' : ''} ${c.livello}"><span class="ci">${S.req(c.req, 'mini')}</span><span class="cr">${esc(c.regione)}</span><span class="cp">${c.livello === 'core' ? '★' : ''}${c.punti}</span>
            ${ch ? `<span class="cw" title="Era ${esc(S.reqName(c.orig))}">⚡ era ${S.symbol(c.orig, 'micro')}</span>` : ''}</div>`;
        }).join('')}</div>`;
    }).join('')}</div>`;
  };
  UI.poolHTML = function (g) {
    return `<div class="pool">${FF.SYMBOLS.map((x) => `<button class="poolsym ${g.s.pool[x] === 0 ? 'empty' : ''}" data-zoom="sym:${x}" title="${SN[x].n}: ${g.s.pool[x]} nel pool">${S.symbol(x)}<span class="pc">${g.s.pool[x]}</span></button>`).join('')}</div>`;
  };
  UI.marketHTML = function (g, opts) {
    opts = opts || {};
    const s = g.s;
    return `<div class="market">${s.market.map((id, i) => id == null ? `<div class="mslot empty">vuoto</div>` : `<div class="mslot"><button class="cardbtn ${opts.pick ? 'selectable' : ''}" data-zoom="reg:${id}" ${opts.pick ? `data-slot="${i}"` : ''} ${opts.disabled && opts.disabled(i) ? 'disabled' : ''}>${S.region(id)}</button><div class="price ${opts.afford && !opts.afford(i) ? 'no' : ''}">${S.coin('micro')} ${g.card(id).price}</div></div>`).join('')}
      <div class="mslot deck"><button class="cardbtn ${opts.pick && opts.blind ? 'selectable' : ''}" ${opts.pick && opts.blind ? 'data-blind="1"' : 'data-noZoom=1'} ${opts.pick && !opts.blind ? 'disabled' : ''}>${S.back('regione')}</button><div class="price">${S.coin('micro')} ${g.rules.blindPrice} <span class="muted small">alla cieca</span></div><div class="small muted">mazzo ${s.regionDeck.length} · scarti ${s.regionDiscard.length}</div></div></div>`;
  };

  // ───────────────────────── mappa di un giocatore ─────────────────────────
  // opts: { cells:[[x,y]] celle libere cliccabili, replaceRegion, pickIdx:[indici di carta cliccabili], showHits }
  UI.tableauHTML = function (g, pid, opts) {
    opts = opts || {};
    const p = g.s.players[pid], cells = opts.cells || [];
    const ita = g.rules.mapMode === 'italia';
    if (!ita && !p.table.length && !cells.length) return '<div class="muted empty-t">Nessuna Carta Regione giocata.</div>';
    const xs = p.table.map((e) => e.x).concat(cells.map((c) => c[0])), ys = p.table.map((e) => e.y).concat(cells.map((c) => c[1]));
    const x0 = ita ? 0 : Math.min(...xs), x1 = ita ? FF.ITALY_W - 1 : Math.max(...xs), y0 = ita ? 0 : Math.min(...ys), y1 = ita ? FF.ITALY_H - 1 : Math.max(...ys);
    const ghost = {}; if (ita) Object.keys(FF.ITALY_MAP).forEach((r) => { ghost[FF.ITALY_MAP[r].join(',')] = r; });
    const reqs = {}; FF.AREAS.forEach((a) => g.s.target[a].forEach((c) => { reqs[c.regione] = c; }));
    let h = `<div class="tableau ${ita ? 'italia' : ''}" style="--cols:${x1 - x0 + 1}" ${ita ? 'role="group" aria-label="Mappa d\'Italia"' : ''}>`;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const idx = p.table.findIndex((e) => e.x === x && e.y === y);
      if (idx >= 0) {
        const e = p.table[idx], reg = FF.regionOf(e), c = reqs[reg], met = c ? FF.condMet(p.table, c) : null;
        const pick = opts.pickIdx && opts.pickIdx.indexOf(idx) >= 0;
        const hint = (opts.hint && opts.hint[idx]) || '';
        h += `<div class="tcell ${pick ? 'pick' : ''} ${hint ? 'hinted' : ''}" data-idx="${idx}">
          <button class="cardbtn ${pick ? 'selectable' : ''}" data-zoom="reg:${e.id}" ${pick ? `data-idx="${idx}"` : ''} title="${esc(reg)}">${S.region(e.id)}</button>
          ${e.sym.length ? `<div class="syms">${e.fusion ? S.fusion(e.fusion) : e.sym.map((sy) => S.symbol(sy)).join('')}</div>` : ''}
          ${c ? `<div class="need ${met ? 'ok' : 'no'}" title="${met ? 'Soddisfa la previsione' : 'La previsione chiede: ' + esc(S.reqName(c.req))}">${S.req(c.req, 'micro')}<b>${met ? '✓' : ''}${c.punti}</b></div>` : ''}
          ${hint ? `<div class="hint">${esc(hint)}</div>` : ''}</div>`;
      } else if (cells.some((c) => c[0] === x && c[1] === y)) h += `<button class="tcell freecell selectable" data-cell="${x},${y}" aria-label="Gioca qui${ghost[x + ',' + y] ? ': ' + esc(ghost[x + ',' + y]) : ''}"><span>＋</span>${ghost[x + ',' + y] ? `<small>${esc(FF.REGION_ABBR[ghost[x + ',' + y]])}</small>` : ''}</button>`;
      else if (ghost[x + ',' + y]) h += `<div class="tcell ghost" title="${esc(ghost[x + ',' + y])}" aria-label="${esc(ghost[x + ',' + y])}: non ancora giocata"><small>${esc(FF.REGION_ABBR[ghost[x + ',' + y]])}</small></div>`;
      else h += '<div class="tcell void"></div>';
    }
    return h + '</div>';
  };

  // ───────────────────────── punteggi e stati ─────────────────────────
  UI.scoresHTML = function (g) {
    const s = g.s;
    return `<div class="tblwrap"><table class="scoretbl"><thead><tr><th></th><th title="Punti Meteo">PM</th><th title="Lavoratori rimasti / totali">👷</th><th title="Carte in mano">🂠</th><th title="Accuratezza (grezzo → punti)">Acc.</th><th title="Coerenza Geografica (confine + pattern)">Coer.</th><th>Tot.</th></tr></thead><tbody>
      ${s.players.map((p) => { const sc = g.scoreOf(p.id); return `<tr class="p${p.id}"><td>${S.seat(p.id, 'tiny')} ${esc(p.name)}</td><td>${p.pm}</td><td>${p.left}/${p.workers}</td><td>${p.hand.length}</td><td>${sc.accRaw}→${sc.accPts}</td><td>${sc.coerenza}</td><td><b>${sc.total}</b></td></tr>`; }).join('')}
      </tbody></table></div><div class="small muted">Punteggi provvisori: contano solo al Confronto Finale (il bersaglio può ancora cambiare).</div>`;
  };
  UI.statesHTML = function (g) {
    const s = g.s, R = g.rules, out = [];
    const nextEv = R.eventRounds.find((r) => r > s.round);
    out.push(['🕒', `Round <b>${Math.max(1, s.round)}/${R.rounds}</b> · ore <b>${hour(Math.max(1, s.round))}</b>`]);
    out.push(['👑', `Primo giocatore del round: <b>${esc(s.players[s.first].name)}</b>`]);
    out.push(['📻', nextEv ? `Prossima Carta Evento: round <b>${nextEv}</b> (ore <b>${hour(nextEv)}</b>), la pesca chi ha il segnalino «Protezione Civile» (${esc(s.players[g.rules.eventDrawer === 'rotate' ? (s.startFirst + s.eventsDrawn) % g.n : s.first].name)}).` : 'Non ci sono più Carte Evento in questa partita.']);
    if (s.lastEvent) { const e = FF.EVENTS[s.lastEvent]; out.push(['🗞', `Ultimo Evento: <button class="linkbtn" data-zoom="evt:${e.id}">#${e.id} ${esc(e.titolo)}</button>`]); }
    const chg = []; FF.AREAS.forEach((a) => s.target[a].forEach((c) => { if (c.req !== c.orig) chg.push(`${esc(c.regione)}: ${esc(S.reqName(c.orig))} → <b>${esc(S.reqName(c.req))}</b>`); }));
    out.push(['🎯', chg.length ? `Bersaglio cambiato dagli Eventi: ${chg.join('; ')}.` : 'Bersaglio <b>invariato</b>: nessun Evento lo ha ancora cambiato.']);
    s.players.forEach((p) => {
      const w = p.workers >= 3 ? 'ha il 3° lavoratore' : p.pendingWorker ? '3° lavoratore in arrivo dal prossimo round' : `3° lavoratore non sbloccato (${R.thirdWorkerCost} PM)`;
      out.push([`<span class="seatico">${S.seat(p.id, 'tiny')}</span>`, `<b>${esc(p.name)}</b>: ${w}${p.passed ? ' · <i>ha passato</i>' : ''}${p.peek != null ? ' · ha visto in anticipo un Evento' : ''}`]);
    });
    out.push(['🎲', `Obiettivi Segreti: <i>non ancora in gioco</i> (il mazzo si scrive con Niky).`]);
    const low = FF.SYMBOLS.filter((x) => s.pool[x] <= 2);
    out.push(['🧺', low.length ? `Pool quasi finito: ${low.map((x) => SN[x].i + ' ' + s.pool[x]).join(', ')}.` : 'Pool dei simboli abbondante.']);
    return out.map((r) => `<div class="srow"><span class="sico">${r[0]}</span><span>${r[1]}</span></div>`).join('');
  };
  UI.renderBoard = function (el, g) {
    el.innerHTML = `${UI.timelineHTML(g)}<div class="board-cols"><div>${UI.spacesHTML(g)}</div><div><div class="sub">Previsione sulla plancia (bersaglio attuale)</div>${UI.targetHTML(g)}<div class="sub">Pool dei simboli</div>${UI.poolHTML(g)}</div></div>`;
  };
})(typeof window !== 'undefined' ? window : globalThis);
