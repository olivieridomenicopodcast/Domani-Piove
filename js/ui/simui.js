/* DOMANI PIOVE — schermata del simulatore: tornei AI, esperimenti sulle regole, prove estreme, analisi "forzata" delle carte, esportazioni */
(function (root) {
  'use strict';
  const FF = (root.FF = root.FF || {});
  const UI = FF.UI;
  const { $, $$, esc } = UI;
  const pct = (x) => (100 * x).toFixed(1) + '%';
  const f2 = (x) => (x >= 0 ? '+' : '') + x.toFixed(2);

  // ── grafici semplici in HTML/SVG ──
  function bars(items, fmt) {
    const max = Math.max(1e-9, ...items.map((i) => i.v));
    return `<div class="bars">${items.map((it) => `<div class="barrow"><span class="bl">${esc(it.label)}</span><span class="bt"><span class="bf" style="width:${(100 * it.v / max).toFixed(1)}%;background:${it.color || '#2c7fb8'}"></span></span><span class="bv">${fmt ? fmt(it.v, it) : it.v.toFixed(2)}</span></div>`).join('')}</div>`;
  }
  function lineChart(series, xs) {
    const W = 560, H = 230, L = 38, B = 26, T = 10, R = 10;
    const ys = series.flatMap((s) => s.pts.filter((v) => v != null));
    const ymax = Math.max(1, ...ys) * 1.05, xmin = xs[0], xmax = xs[xs.length - 1];
    const X = (x) => L + (W - L - R) * (x - xmin) / Math.max(1, xmax - xmin), Y = (y) => H - B - (H - B - T) * y / ymax;
    let g = '';
    for (let i = 0; i <= 4; i++) { const y = ymax * i / 4; g += `<line x1="${L}" x2="${W - R}" y1="${Y(y)}" y2="${Y(y)}" stroke="#d8c8a0" stroke-width="1"/><text x="${L - 4}" y="${Y(y) + 4}" font-size="11" text-anchor="end" fill="#6d5a3d">${y.toFixed(0)}</text>`; }
    xs.forEach((x, k) => { g += `<text x="${X(x)}" y="${H - 8}" font-size="11" text-anchor="middle" fill="#6d5a3d">${k === xs.length - 1 ? 'fine' : x}</text>`; });
    for (const s of series) {
      const d = xs.map((x, i) => (s.pts[i] == null ? null : `${X(x).toFixed(1)},${Y(s.pts[i]).toFixed(1)}`)).filter(Boolean).join(' ');
      g += `<polyline points="${d}" fill="none" stroke="${s.color}" stroke-width="3" stroke-linejoin="round"/>`;
    }
    return `<svg viewBox="0 0 ${W} ${H}" class="linechart" role="img" aria-label="Andamento dei punteggi nel tempo">${g}</svg><div class="legendline">${series.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>`;
  }
  const tile = (big, label, sub) => `<div class="tile"><div class="tbig">${big}</div><div class="tlab">${label}</div>${sub ? `<div class="tsub">${sub}</div>` : ''}</div>`;
  const parseParams = (txt) => { const o = {}; String(txt || '').split(/[,;\s]+/).filter(Boolean).forEach((p) => { const [k, v] = p.split('='); if (k && v != null) o[k] = v === 'true' ? true : v === 'false' ? false : Number(v); }); return o; };
  const parseVal = (s) => { s = s.trim(); if (s === 'true') return true; if (s === 'false') return false; if (s === 'null') return null; return isNaN(Number(s)) ? s : Number(s); };
  const PARAM_LIST = ['startPM', 'startCards', 'workers', 'thirdWorkerCost', 'marketSize', 'blindPrice', 'poolPerSymbol', 'maxSymbolsPerCard', 'coerCap', 'borderPoints', 'sez2OccupiesSez1', 'requireAdjacentPlacement', 'thirdWorkerNextRound', 'rotateFirst', 'eventDrawer', 'rounds',
    'pattern.pioggia', 'pattern.neve', 'pattern.vento', 'pattern.nuvolo', 'pattern.nebbia', 'pattern.temporale2', 'pattern.temporale3'];
  const profOpts = (sel) => Object.keys(FF.Sim.PROFILES).map((k) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${esc(FF.Sim.PROFILES[k].label)}</option>`).join('');

  UI.openSim = function () {
    UI.screen('sim');
    const el = $('#s-sim'), last = UI.store.get('sim_setup', {});
    el.innerHTML = `<div class="wrap"><div class="card"><h2>📊 Simulazione veloce</h2>
      <p class="small muted">Partite AI contro AI in blocco. Il <b>profilo A</b> siede a rotazione in tutti i posti (posti alternati) contro il <b>profilo B</b>: se i due profili sono uguali A vince 1 partita su N. Le strategie «estreme» sono sbagliate di proposito e devono perdere.</p>
      <div class="rowgrid"><div class="field"><label for="sm-a">Profilo A</label><select id="sm-a">${profOpts(last.a || 'hard')}</select><input type="text" id="sm-ap" placeholder="parametri AI, es. eff=0.6 denial=0" value="${esc(last.ap || '')}" aria-label="Parametri AI del profilo A"></div>
      <div class="field"><label for="sm-b">Profilo B</label><select id="sm-b">${profOpts(last.b || 'medium')}</select><input type="text" id="sm-bp" placeholder="parametri AI (facoltativi)" value="${esc(last.bp || '')}" aria-label="Parametri AI del profilo B"></div></div>
      <div class="rowgrid"><div class="field"><label>Giocatori</label><div class="seg" id="sm-np">${[2, 3, 4].map((n) => `<button data-v="${n}" class="${n === (last.np || 2) ? 'sel' : ''}">${n}</button>`).join('')}</div></div>
      <div class="field"><label for="sm-n">Partite</label><input type="number" id="sm-n" min="2" value="${last.n || 200}"></div>
      <div class="field"><label for="sm-seed">Seed</label><input type="text" id="sm-seed" value="${esc(last.seed || 'playtest')}"></div>
      <div class="field"><label for="sm-logs">Partite da poter rivedere</label><input type="number" id="sm-logs" min="0" max="100" value="${last.logs == null ? 30 : last.logs}"></div></div>
      <label class="chk"><input type="checkbox" id="sm-swap" ${last.swap === false ? '' : 'checked'}> Posti alternati (consigliato)</label>
      <details class="adv"><summary>⚙ Varianti di regole</summary>${UI.rulesFields('sm-r-', last.rules)}</details>
      <div class="btn-row"><button class="btn primary" id="sm-run">▶ Avvia simulazione</button><button class="btn" id="sm-back">← Indietro</button></div>
      <hr><h3>🧪 Esperimento sulle regole</h3><p class="small muted">Ripete la simulazione cambiando un solo parametro e confronta i risultati (vittorie, punteggi, chi inizia, durata…).</p>
      <div class="rowgrid"><div class="field"><label for="sm-ep">Parametro</label><select id="sm-ep">${PARAM_LIST.map((p) => `<option value="${p}" ${p === (last.ep || 'poolPerSymbol') ? 'selected' : ''}>${p}</option>`).join('')}</select></div>
      <div class="field"><label for="sm-ev">Valori (separati da virgola)</label><input type="text" id="sm-ev" value="${esc(last.ev || '6,8,10')}"></div></div>
      <div class="btn-row"><button class="btn" id="sm-exp">🧪 Avvia esperimento</button></div>
      <hr><h3>🛑 Prove estreme</h3><p class="small muted">Il profilo A contro ogni strategia sbagliata di proposito (casuale, solo fedeltà, solo pattern, solo PM, passivo). Se una non perde, la regola ha un buco.</p>
      <div class="btn-row"><button class="btn" id="sm-ext">🛑 Avvia prove estreme</button></div>
      <hr><h3>🔬 Analisi «forzata» delle carte</h3><p class="small muted">Per ogni carta si giocano le STESSE partite (stessi seed) con e senza forzatura: la differenza di punteggio misura quanto rende, anche se l'AI non la sceglierebbe mai. Eventi: la carta esce come primo Evento. Carte Regione: A parte con quella carta in mano. Previsioni: quella carta è la previsione della sua area.</p>
      <div class="rowgrid"><div class="field"><label for="sm-fk">Cosa analizzare</label><select id="sm-fk"><option value="evento">Carte Evento (80)</option><option value="regione">Carte Regione (58 varianti)</option><option value="previsione">Carte Previsione (36)</option></select></div>
      <div class="field"><label for="sm-fn">Coppie di partite per carta</label><input type="number" id="sm-fn" min="5" value="${last.fn || 30}"></div></div>
      <div class="btn-row"><button class="btn" id="sm-for">🔬 Avvia analisi</button></div>
      <div id="sm-prog" class="hidden"><div class="progress"><span id="sm-bar"></span></div><div class="small" id="sm-ptxt"></div><button class="btn sm danger" id="sm-cancel">Annulla</button></div></div>
      <div id="sm-out"></div></div>`;
    $('#sm-back').onclick = () => UI.go('home');
    UI.seg($('#sm-np'));
    let cancel = null;
    const read = () => {
      const o = { a: $('#sm-a').value, b: $('#sm-b').value, ap: $('#sm-ap').value, bp: $('#sm-bp').value, np: Number(UI.segVal($('#sm-np'))), n: Math.max(2, Number($('#sm-n').value) || 200), seed: $('#sm-seed').value.trim() || 'playtest', logs: Math.max(0, Number($('#sm-logs').value) || 0), swap: $('#sm-swap').checked, rules: UI.readRules(el), ep: $('#sm-ep').value, ev: $('#sm-ev').value, fn: Math.max(5, Number($('#sm-fn').value) || 30) };
      UI.store.set('sim_setup', o);
      return { games: o.n, seed: o.seed, players: o.np, a: o.a, b: o.b, aParams: parseParams(o.ap), bParams: parseParams(o.bp), swap: o.swap, rules: o.rules, keepGames: o.logs, _o: o };
    };
    const busy = (on) => { $$('#s-sim .btn').forEach((b) => { if (b.id !== 'sm-cancel' && b.id !== 'sm-back') b.disabled = on; }); $('#sm-prog').classList.toggle('hidden', !on); };
    const progress = (i, n, label) => { $('#sm-bar').style.width = (100 * i / Math.max(1, n)).toFixed(1) + '%'; $('#sm-ptxt').textContent = `${i}/${n} partite${label ? ' · ' + label : ''}`; };
    const go = async (fn) => {
      cancel = { cancelled: false }; busy(true); $('#sm-out').innerHTML = '';
      try { await fn(cancel); } catch (e) { console.error(e); UI.toast('Errore nella simulazione: ' + e.message); }
      busy(false);
    };
    $('#sm-cancel').onclick = () => { if (cancel) cancel.cancelled = true; };
    $('#sm-run').onclick = () => go(async (c) => { const o = read(); const agg = await FF.Sim.runAsync(o, progress, c); showAgg(agg); });
    $('#sm-exp').onclick = () => go(async (c) => {
      const o = read(), vals = o._o.ev.split(',').map(parseVal).filter((x) => x !== '');
      if (!vals.length) { UI.toast('Inserisci almeno un valore'); return; }
      const ex = await FF.Sim.experiment(o, o._o.ep, vals, progress, c), md = FF.Sim.experimentReport(ex, o);
      const items = ex.rows.map((r) => ({ label: String(JSON.stringify(r.value)), v: r.agg.aWins / Math.max(1, r.agg.n), color: '#2c7fb8' }));
      $('#sm-out').innerHTML = `<div class="card"><h2>Esperimento: ${esc(o._o.ep)}</h2><h3>A vince (per valore)</h3>${bars(items, pct)}${UI.md(md)}<div class="btn-row"><button class="btn" id="x-md">⬇ .md</button><button class="btn" id="x-copy">📋 Copia</button></div></div>`;
      $('#x-md').onclick = () => UI.download(`domani-piove-esperimento-${o._o.ep}.md`, md); $('#x-copy').onclick = () => UI.copy(md);
    });
    $('#sm-ext').onclick = () => go(async (c) => {
      const o = read(), ex = await FF.Sim.extremeSuite(o, progress, c), md = FF.Sim.extremeReport(ex, o), bad = ex.rows.filter((r) => !r.ok).length;
      $('#sm-out').innerHTML = `<div class="card"><h2>Prove estreme</h2><p class="${bad ? 'bad' : 'good'}"><b>${bad ? `⚠ ${bad} strategia/e sbagliata/e NON perde abbastanza: la regola ha un buco.` : '✔ Tutte le strategie sbagliate di proposito perdono.'}</b></p>${UI.md(md)}<div class="btn-row"><button class="btn" id="x-md">⬇ .md</button><button class="btn" id="x-copy">📋 Copia</button></div></div>`;
      $('#x-md').onclick = () => UI.download('domani-piove-prove-estreme.md', md); $('#x-copy').onclick = () => UI.copy(md);
    });
    $('#sm-for').onclick = () => go(async (c) => {
      const o = read(), kind = $('#sm-fk').value; o.games = o._o.fn;
      const fa = await FF.Sim.forcedAnalysis(kind, o, progress, c), md = FF.Sim.forcedReport(fa);
      const rows = fa.rows.slice().sort((a, b) => (kind === 'evento' ? b.dDrawer.m - a.dDrawer.m : b.dA.m - a.dA.m));
      const items = rows.map((r) => { const d = kind === 'evento' ? r.dDrawer : r.dA; return { label: r.item.label, v: Math.abs(d.m), color: d.m >= 0 ? '#1f8a4c' : '#c0392b', real: d.m }; });
      $('#sm-out').innerHTML = `<div class="card"><h2>Analisi forzata · ${esc({ evento: 'Carte Evento', regione: 'Carte Regione', previsione: 'Carte Previsione' }[kind])}</h2><h3>Δ punteggio ${kind === 'evento' ? 'di chi pesca' : 'di A'}</h3>${bars(items, (v, it) => f2(it.real))}<p class="small muted">Verde = la carta aiuta, rosso = danneggia. Con poche partite per carta gli intervalli sono larghi: leggi la tabella.</p>${UI.md(md)}<div class="btn-row"><button class="btn" id="x-md">⬇ .md</button><button class="btn" id="x-csv">⬇ CSV</button><button class="btn" id="x-copy">📋 Copia</button></div></div>`;
      $('#x-md').onclick = () => UI.download(`domani-piove-forzata-${kind}.md`, md); $('#x-csv').onclick = () => UI.download(`domani-piove-forzata-${kind}.csv`, FF.Sim.forcedCSV(fa), 'text/csv;charset=utf-8'); $('#x-copy').onclick = () => UI.copy(md);
    });
  };

  // ── risultati di una simulazione ──
  function showAgg(agg) {
    const n = agg.n, out = $('#sm-out'), np = agg.players, o = agg.opts, ci = FF.Sim.wilson(agg.aWins, n), d = FF.Sim.meanCI(agg.diff.n, agg.diff.s1, agg.diff.s2), expect = 1 / np;
    const same = o.a === o.b && !Object.keys(o.aParams || {}).length && !Object.keys(o.bParams || {}).length;
    const fw = FF.Sim.wilson(agg.firstWins, agg.firstN), dur = FF.Sim.meanCI(agg.placements.n, agg.placements.s1, agg.placements.s2);
    const xs = agg.traj.A.map((v, k) => k + 1).filter((k) => agg.traj.n[k - 1] >= n * 0.3);
    const line = xs.length > 1 ? lineChart([{ name: 'Profilo A', color: '#e8833a', pts: xs.map((k) => agg.traj.A[k - 1] / agg.traj.n[k - 1]) }, { name: 'Profilo B (media)', color: '#2f6fd1', pts: xs.map((k) => agg.traj.B[k - 1] / agg.traj.n[k - 1]) }], xs) : '';
    const hist = (h, label) => Object.keys(h).map(Number).sort((a, b) => a - b).map((k) => ({ label: label(k), v: h[k] / n }));
    const gper = (k) => (agg.stats.g[k] || 0) / n, per = (t, k) => ((agg.stats[t][k] || 0) / Math.max(1, t === 'A' ? agg.nA : agg.nB));
    const md = FF.Sim.report(agg);
    const tiers = FF.DEFAULT_RULES.accuracy.map((s) => ({ label: `${s.from === s.to ? s.from : s.from + '–' + s.to} grezzo → ${s.pts} pt`, v: ((agg.accPts.A[s.pts] || 0) + (agg.accPts.B[s.pts] || 0)) / (agg.nA + agg.nB) }));
    const rowsG = agg.games.map((g) => `<tr><td>${g.i + 1}</td><td><code>${esc(g.seed)}</code></td><td>${g.aSeat + 1}</td><td>${g.scores.join(' / ')}</td><td>${g.winner == null ? 'pari' : g.winner === g.aSeat ? 'A' : 'B'}</td><td><button class="btn sm" data-rev="${g.i}">⏪ Rivedi</button></td></tr>`).join('');
    out.innerHTML = `<div class="card"><h2>Risultati · ${n} partite · ${(agg.ms / 1000).toFixed(1)} s</h2>
      <div class="tiles">${tile(pct(agg.aWins / n), 'A vince', `95%: ${pct(ci[0])} – ${pct(ci[1])}${same ? ' · atteso ' + pct(expect) : ''}`)}
      ${tile(f2(d.m), 'punteggio A − B', `95%: ${d.lo.toFixed(2)} ; ${d.hi.toFixed(2)}`)}
      ${tile(pct(agg.firstWins / Math.max(1, agg.firstN)), 'chi inizia vince', `95%: ${pct(fw[0])} – ${pct(fw[1])} · atteso ${pct(expect)}`)}
      ${tile(dur.m.toFixed(1), 'piazzamenti a testa', `95%: ${dur.lo.toFixed(1)} – ${dur.hi.toFixed(1)}`)}
      ${tile(gper('evento_cambia_bersaglio').toFixed(2), 'volte che il bersaglio cambia', `a partita · colpi a vuoto ${gper('evento_colpo_a_vuoto').toFixed(2)}`)}
      ${tile((agg.acc.A.s1 / Math.max(1, agg.acc.A.n)).toFixed(1), 'Accuratezza grezza di A', `su 15 · coerenza ${(agg.coer.A / Math.max(1, agg.nA)).toFixed(1)}`)}</div>
      <h3>Vittorie per posto</h3>${bars(agg.seatWins.map((w, p) => ({ label: 'Posto ' + (p + 1), v: w / n, color: ['#c0392b', '#2c7fb8', '#2e8b57', '#c98a1c'][p] })), pct)}
      <h3>Andamento dei punteggi nel tempo</h3>${line}
      <div class="rowgrid3"><div><h3>Durata (piazzamenti a testa)</h3>${bars(hist(agg.placements.hist, (k) => String(k)), pct)}</div><div><h3>Distacco 1°–2°</h3>${bars(hist(agg.marginHist, (k) => (k >= 20 ? '20+' : String(k))), pct)}</div><div><h3>Gradini di Accuratezza</h3>${bars(tiers, pct)}</div></div>
      <div class="rowgrid3"><div><h3>Spazi usati (a partita)</h3>${bars(FF.SPACES1.concat(FF.SPACES2).map((sp) => ({ label: FF.SPACE_NAMES[sp], v: gper('spazio_' + sp) })), (v) => v.toFixed(2))}</div>
      <div><h3>Simboli raccolti (a partita)</h3>${bars(FF.SYMBOLS.map((x) => ({ label: FF.SYMBOL_INFO[x].i + ' ' + FF.SYMBOL_INFO[x].n, v: gper('simbolo_' + x) })), (v) => v.toFixed(2))}</div>
      <div><h3>Pattern medi di A</h3>${bars(FF.SYMBOLS.map((x) => ({ label: FF.SYMBOL_INFO[x].i + ' ' + FF.SYMBOL_INFO[x].n, v: (agg.patBy.A[x] || 0) / Math.max(1, agg.nA) })), (v) => v.toFixed(2))}</div></div>
      <details class="adv"><summary>📋 Report completo (Markdown)</summary><div class="rules">${UI.md(md)}</div></details>
      <div class="btn-row"><button class="btn" id="x-md">⬇ Markdown</button><button class="btn" id="x-csv">⬇ CSV</button><button class="btn" id="x-json">⬇ JSON</button><button class="btn" id="x-copy">📋 Copia report</button></div></div>
      ${agg.games.length ? `<div class="card"><h2>Elenco partite</h2><p class="small muted">«Rivedi» riproduce la partita dal seed, messaggio per messaggio, con le mani visibili.</p><div class="tblwrap"><table class="gtable"><thead><tr><th>#</th><th>Seed</th><th>Posto A</th><th>Punteggi</th><th>Vince</th><th></th></tr></thead><tbody>${rowsG}</tbody></table></div></div>` : ''}`;
    $('#x-md').onclick = () => UI.download('domani-piove-simulazione.md', md);
    $('#x-csv').onclick = () => UI.download('domani-piove-simulazione.csv', FF.Sim.toCSV(agg), 'text/csv;charset=utf-8');
    $('#x-json').onclick = () => UI.download('domani-piove-simulazione.json', FF.Sim.toJSON(agg), 'application/json');
    $('#x-copy').onclick = () => UI.copy(md);
    $$('[data-rev]', out).forEach((b) => (b.onclick = () => review(agg, Number(b.dataset.rev))));
    out.scrollIntoView({ behavior: 'smooth' });
  }

  // apre in modalità "Rivedi" una partita della simulazione, usando la cronologia delle risposte (stesso seed, stesse scelte)
  function review(agg, i) {
    const g = agg.games.find((x) => x.i === i); if (!g) return;
    UI.startSession({ seed: g.seed, rules: agg.opts.rules || {}, players: g.players, speed: 'step', notes: [] }, g.history.slice(), { review: true });
  }
})(typeof window !== 'undefined' ? window : globalThis);
