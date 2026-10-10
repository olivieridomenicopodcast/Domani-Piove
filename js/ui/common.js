/* DOMANI PIOVE — utilità UI condivise: DOM, modali, zoom delle carte, legenda, cronaca, regolamento */
(function (root) {
  'use strict';
  const FF = (root.FF = root.FF || {});
  const UI = (FF.UI = FF.UI || {});
  const S = FF.Sprites;

  UI.$ = (sel, el) => (el || document).querySelector(sel);
  UI.$$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  UI.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  UI.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const { $, $$, esc } = UI;

  // localStorage "sicuro" (può essere bloccato in navigazione privata)
  UI.store = {
    get(k, d) { try { const v = localStorage.getItem('dp_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('dp_' + k, JSON.stringify(v)); } catch (e) { /* ignora */ } },
    del(k) { try { localStorage.removeItem('dp_' + k); } catch (e) { /* ignora */ } },
  };

  let toastT;
  UI.toast = function (msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
  };
  UI.screen = function (id) {
    $$('.screen').forEach((s) => s.classList.toggle('active', s.id === 's-' + id));
    window.scrollTo(0, 0);
    $('#tb-info').innerHTML = '';
  };

  // Finestra modale. ritorna { el, close }. Tastiera: il focus entra nella finestra, Tab resta dentro, Esc chiude (opts.onEsc se la finestra non è chiudibile a clic).
  UI.modal = function (html, opts) {
    opts = opts || {};
    const wrap = document.createElement('div'), prev = document.activeElement;
    wrap.className = 'overlay' + (opts.solid ? ' solid' : '');
    wrap.innerHTML = `<div class="dlg ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true" tabindex="-1">${html}</div>`;
    $('#modal-root').appendChild(wrap);
    const dlg = wrap.firstElementChild, focusables = () => $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', dlg).filter((e) => !e.disabled && e.offsetParent !== null);
    const api = { el: dlg, close() { document.removeEventListener('keydown', onKey, true); wrap.remove(); if (prev && prev.focus && document.contains(prev)) { try { prev.focus(); } catch (e) { /* ignora */ } } } };
    function onKey(e) {
      if (!document.contains(wrap) || wrap !== $('#modal-root').lastElementChild) return;
      if (e.key === 'Escape') { if (opts.onEsc) { e.preventDefault(); opts.onEsc(); } else if (opts.dismiss !== false) { e.preventDefault(); api.close(); } }
      else if (e.key === 'Tab') { const f = focusables(); if (!f.length) { e.preventDefault(); return; } const first = f[0], last = f[f.length - 1]; if (e.shiftKey && (document.activeElement === first || !dlg.contains(document.activeElement))) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && (document.activeElement === last || !dlg.contains(document.activeElement))) { e.preventDefault(); first.focus(); } }
    }
    document.addEventListener('keydown', onKey, true);
    if (opts.dismiss !== false) wrap.addEventListener('click', (e) => { if (e.target === wrap) api.close(); });
    setTimeout(() => { const f = focusables(); (f.find((e) => e.hasAttribute('data-go') || e.hasAttribute('data-y') === false && e.classList.contains('primary')) || f[0] || dlg).focus(); }, 0);
    return api;
  };
  // conferma esplicita per mosse costose o rischiose: Promise<boolean>
  UI.confirm = function (title, bodyHtml, okLabel, cancelLabel) {
    return new Promise((resolve) => {
      const dlg = UI.modal(`<h2>⚠️ ${esc(title)}</h2><div class="warnbox">${bodyHtml}</div>
        <div class="btn-row"><button class="btn" data-n>${esc(cancelLabel || 'Torno indietro')}</button><button class="btn danger" data-y style="flex:1">${esc(okLabel || 'Confermo')}</button></div>`, { dismiss: false, onEsc: () => { dlg.close(); resolve(false); } });
      dlg.el.querySelector('[data-y]').onclick = () => { dlg.close(); resolve(true); };
      dlg.el.querySelector('[data-n]').onclick = () => { dlg.close(); resolve(false); };
    });
  };
  UI.download = function (name, text, type) {
    const blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  UI.copy = async function (text) {
    try { await navigator.clipboard.writeText(text); UI.toast('Copiato negli appunti ✓'); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); UI.toast('Copiato negli appunti ✓'); } catch (e2) { UI.toast('Copia non riuscita'); }
      ta.remove();
    }
  };
  UI.seg = function (container, onChange) {
    container.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-v]'); if (!b || b.disabled) return;
      $$('button', container).forEach((x) => x.classList.toggle('sel', x === b));
      if (onChange) onChange(b.dataset.v);
    });
  };
  UI.segVal = (container) => { const b = $('button.sel', container); return b ? b.dataset.v : null; };
  UI.randomSeed = () => 'dp-' + Math.random().toString(36).slice(2, 8);

  // ───────────────────────── carte: zoom con un tocco ─────────────────────────
  // spec: "reg:<id>" | "prev:<id>" | "evt:<id>" | "obj:<id>" | "sym:<nome>" | "fus:<nome>"
  UI.zoomSpec = function (spec) {
    const [t, a] = [spec.slice(0, spec.indexOf(':')), spec.slice(spec.indexOf(':') + 1)];
    let spr, titleH, desc;
    if (t === 'reg') {
      const c = FF.REGION_CARDS[Number(a)]; spr = S.region(c); titleH = c.regione;
      const lab = { neutra: 'Neutra: nessun bonus', confine: 'Confine: bonus alla frontiera', compensativa: 'Compensativa' }[c.variante];
      desc = `<b>${FF.AREA_NAMES[c.area]}</b> · ${lab} · si compra a <b>${FF.cardPrice(c) ? FF.cardPrice(c) + ' PM' : 'gratis'}</b>.<br>${S.bonusText(c).join(' ')}.<br><span class="muted">Non ha simboli stampati: i simboli si raccolgono dal pool e si mettono sopra.</span>`;
    } else if (t === 'prev') {
      const p = FF.PREVISIONI.find((x) => x.id === a); spr = S.previsione(p); titleH = p.titolo;
      desc = `<i>${esc(p.testo)}</i><br><br>` + p.condizioni.map((c) => `${c.livello === 'core' ? '★' : '•'} <b>${esc(c.regione)}</b>: ${FF.SYMBOL_INFO[c.simbolo].i} ${FF.SYMBOL_INFO[c.simbolo].n} (${c.punti} pt)`).join('<br>');
    } else if (t === 'obj') {
      const o = FF.OBJ[a]; spr = S.obiettivo(o); titleH = o.titolo;
      desc = `<b>${FF.OBJECTIVE_TYPES[o.tipo]}</b> · vale <b>${o.pts} punti</b> se raggiunto a fine partita, altrimenti 0.<br>${esc(o.testo)}<br><span class="muted">È segreto fino al Confronto Finale e non ha niente a che fare con la previsione.</span>`;
    } else if (t === 'evt') {
      const e = FF.EVENTS[Number(a)]; spr = S.evento(e); titleH = `#${e.id} ${e.titolo}`;
      desc = `<i>${esc(e.testo)}</i><br><br><b>${esc(e.condizione.replace(/\*\*/g, ''))}</b>`;
    } else if (t === 'sym') {
      const i = FF.SYMBOL_INFO[a]; spr = S.symbol(a); titleH = `${i.i} ${i.n}`;
      const fus = FF.FUSIONS.filter((f) => f.recipe.includes(a)).map((f) => `${f.name} (${f.recipe.map((x) => FF.SYMBOL_INFO[x].i).join('+')})`);
      desc = fus.length ? `Si fonde in: ${fus.join(', ')}.` : 'Non ha una fusione propria.';
    } else {
      const f = FF.FUSIONS.find((x) => x.name === a); spr = S.fusion(a); titleH = `💥 ${a}`;
      desc = `Nasce da ${f.recipe.map((x) => FF.SYMBOL_INFO[x].i + ' ' + FF.SYMBOL_INFO[x].n).join(' + ')} sulla stessa carta. Una carta fusa conta <b>solo come la fusione</b>.`;
    }
    const dlg = UI.modal(`<div class="zoomcard">${spr}</div><h2>${titleH}</h2><p>${desc}</p><div class="btn-row end"><button class="btn primary" data-x>Chiudi</button></div>`);
    dlg.el.querySelector('[data-x]').onclick = () => dlg.close();
  };
  document.addEventListener('click', (e) => {
    const z = e.target.closest('[data-zoom]');
    if (!z || z.dataset.noZoom != null) return;
    if (z.closest('.selectable') || z.classList.contains('selectable')) return; // nelle carte da scegliere il clic seleziona
    if (e.target.closest('.overlay') && !e.target.closest('.dlg .zoomable')) return;
    UI.zoomSpec(z.dataset.zoom);
  });

  // ───────────────────────── legenda ─────────────────────────
  UI.legendHTML = function () {
    const row = (ico, txt) => `<div class="lrow"><span class="lico">${ico}</span><span>${txt}</span></div>`;
    let h = '<div class="lgroup">Il senso del gioco</div>';
    h += row('🎯', 'La previsione è <b>una sola e uguale per tutti</b>. Costruisci davanti a te Carte Regione + simboli per assomigliarle. Un Evento può cambiarla.');
    h += '<div class="lgroup">Simboli</div>';
    h += FF.SYMBOLS.map((s) => row(S.symbol(s, 'tiny'), `<b>${FF.SYMBOL_INFO[s].n}</b>`)).join('');
    h += '<div class="lgroup">Fusioni (2 simboli sulla stessa carta)</div>';
    h += FF.FUSIONS.map((f) => row(S.fusion(f.name, 'tiny'), `<b>${f.name}</b> = ${f.recipe.map((x) => FF.SYMBOL_INFO[x].i).join(' + ')}`)).join('');
    h += '<div class="lgroup">Carte e segni</div>';
    h += row(S.region(FF.REGION_CARDS.find((c) => c.variante === 'confine'), 'tiny'), '<b>Carta Regione</b>: una per regione. Il bonus vale +1 se hai giocato la regione indicata (senza contatto).');
    h += row(S.coin('tiny'), '<b>Punti Meteo (PM)</b>: servono per comprare carte (Neutra 1 · Confine 2 · Compensativa 3 · alla cieca 2) e per il 3° lavoratore (5).');
    h += row(S.worker('tiny'), '<b>Lavoratore</b>: uno alla volta, a rotazione. Lo spazio occupato resta bloccato fino a fine round.');
    h += row('📻', '<b>Carta Evento</b> alle 11:00, 14:00 e 17:00: può cambiare il bersaglio della previsione.');
    h += row('⚡', '<b>Bersaglio cambiato</b>: sulla plancia compare il simbolo/fusione attuale e quello di partenza.');
    h += '<div class="lgroup">Pattern (Coerenza Geografica, a carte adiacenti)</div>';
    h += [['☀️', 'Distesa: gruppi di Sole (2=1, 3=2, 4=4, 5=6, 6+=9)'], ['⛈️', 'Cella convettiva: gruppo di Temporale (2=+3, 3+=+6)'], ['🌧️', 'Coda: +1 per Pioggia accanto a un Temporale'], ['❄️', 'Manto: +4 se c\'è un gruppo di 2-3 Neve'], ['💨', 'Ponte: +2 per Vento accanto a 2 simboli diversi'], ['☁️', 'Frangia: +1 per Nuvolo accanto a un altro simbolo'], ['🌫️', 'Sacca: +2 per Nebbia senza altra Nebbia accanto']].map((x) => row(x[0], x[1])).join('');
    return h;
  };

  // ───────────────────────── cronaca ─────────────────────────
  UI.logLine = function (ev) {
    return `<div class="ll k-${ev.k} ${ev.p >= 0 ? 'p' + ev.p : ''}"><span class="lt">${ev.k === 'note' ? '📝' : 'R' + ev.r}</span><span>${esc(ev.text)}</span></div>`;
  };

  // ───────────────────────── markdown (solo ciò che serve al regolamento) ─────────────────────────
  UI.md = function (src) {
    const inline = (t) => esc(t)
      .replace(/\*\*\[(chiarito|interpretazione[^\]]*|da misurare)\]\*\*/gi, (m, g) => `<span class="tag ${g.toLowerCase().startsWith('chiar') ? 'ok' : 'warn'}">${g}</span>`)
      .replace(/\[(chiarito|interpretazione[^\]]*|da misurare)\]/gi, (m, g) => `<span class="tag ${g.toLowerCase().startsWith('chiar') ? 'ok' : 'warn'}">${g}</span>`)
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/`(.+?)`/g, '<code>$1</code>');
    const out = []; const L = src.split('\n'); let i = 0;
    while (i < L.length) {
      const l = L[i];
      if (/^#{1,3} /.test(l)) { const n = l.match(/^#+/)[0].length; out.push(`<h${n}>${inline(l.replace(/^#+ /, ''))}</h${n}>`); i++; }
      else if (l.startsWith('> ')) { out.push(`<blockquote>${inline(l.slice(2))}</blockquote>`); i++; }
      else if (l.startsWith('|')) {
        const rows = []; while (i < L.length && L[i].startsWith('|')) rows.push(L[i++]);
        const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        const head = cells(rows[0]); const body = rows.slice(2).map(cells);
        out.push(`<div class="tblwrap"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      } else if (/^(- |\d+\. )/.test(l)) {
        const ord = /^\d/.test(l); const items = [];
        while (i < L.length && /^(- |\d+\. )/.test(L[i])) items.push(L[i++].replace(/^(- |\d+\. )/, ''));
        out.push(`<${ord ? 'ol' : 'ul'}>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</${ord ? 'ol' : 'ul'}>`);
      } else if (l.trim() === '') i++;
      else { const p = []; while (i < L.length && L[i].trim() && !/^(#|>|\||- |\d+\. )/.test(L[i])) p.push(L[i++]); out.push(`<p>${inline(p.join(' '))}</p>`); }
    }
    return out.join('\n');
  };
})(typeof window !== 'undefined' ? window : globalThis);
