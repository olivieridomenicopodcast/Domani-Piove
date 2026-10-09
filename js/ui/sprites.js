/* DOMANI PIOVE — sprite SVG generati nel codice (nessuna risorsa esterna).
   Le carte hanno rapporto 100×140 (come una carta da poker) e sono pensate anche per la stampa:
   tools/export-sprites.js le salva come file in assets/sprites/. */
(function (root) {
  'use strict';
  const FF = (root.FF = root.FF || {});
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const AREA_COL = { nord: '#3d6c9e', centro: '#4f8a52', sud_isole: '#b9792b' };
  const AREA_DARK = { nord: '#27496b', centro: '#2f5a32', sud_isole: '#7d4e16' };
  const SIGLA = { "Valle d'Aosta": 'VDA', Piemonte: 'PIE', Liguria: 'LIG', Lombardia: 'LOM', 'Trentino-Alto Adige': 'TAA', Veneto: 'VEN', 'Friuli-Venezia Giulia': 'FVG', 'Emilia-Romagna': 'EMR',
    Toscana: 'TOS', Umbria: 'UMB', Marche: 'MAR', Lazio: 'LAZ', Abruzzo: 'ABR', Molise: 'MOL', Campania: 'CAM', Puglia: 'PUG', Basilicata: 'BAS', Calabria: 'CAL', Sicilia: 'SIC', Sardegna: 'SAR' };
  FF.SIGLA = SIGLA;
  const SYM_BG = { sole: '#fbe8a6', nuvolo: '#e3e8ee', pioggia: '#cfe3f3', vento: '#dff0e6', temporale: '#c9c6dd', neve: '#e6f1fb', nebbia: '#dedcd6' };

  // icone dei 7 simboli, disegnate in un riquadro 40×40
  const ICON = {
    sole: '<g><g stroke="#e8a30c" stroke-width="2.6" stroke-linecap="round">' + [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="20" y1="20" x2="20" y2="5" transform="rotate(${a} 20 20) translate(0 0)" />`).join('') + '</g><circle cx="20" cy="20" r="9" fill="#f6b91f" stroke="#e8a30c" stroke-width="1.5"/></g>',
    nuvolo: '<path d="M10 28a6 6 0 0 1 1-11.9A8 8 0 0 1 26 13a7 7 0 0 1 4 12.9V28z" fill="#fff" stroke="#7d8896" stroke-width="1.8" stroke-linejoin="round"/>',
    pioggia: '<path d="M10 22a5.5 5.5 0 0 1 1-10.9A7.5 7.5 0 0 1 25 9a6.5 6.5 0 0 1 4 12z" fill="#e7edf3" stroke="#6c7f93" stroke-width="1.6" stroke-linejoin="round"/><g stroke="#2d7fc4" stroke-width="2.6" stroke-linecap="round"><line x1="13" y1="26" x2="11" y2="32"/><line x1="20" y1="26" x2="18" y2="33"/><line x1="27" y1="26" x2="25" y2="32"/></g>',
    vento: '<g fill="none" stroke="#3f8a64" stroke-width="2.6" stroke-linecap="round"><path d="M6 14h17a4.5 4.5 0 1 0-4.5-4.5"/><path d="M6 21h24a4.5 4.5 0 1 1-4.5 4.5"/><path d="M6 28h12a3.5 3.5 0 1 1-3.5 3.5"/></g>',
    temporale: '<path d="M10 20a5.5 5.5 0 0 1 1-10.9A7.5 7.5 0 0 1 25 7a6.5 6.5 0 0 1 4 13z" fill="#7a7694" stroke="#4a4668" stroke-width="1.6" stroke-linejoin="round"/><polygon points="22,19 14,29 19.5,29 17,37 27,25 21,25" fill="#f6c31f" stroke="#c28f00" stroke-width="1.2" stroke-linejoin="round"/>',
    neve: '<g stroke="#4b97d6" stroke-width="2.6" stroke-linecap="round">' + [0, 60, 120].map((a) => `<line x1="20" y1="6" x2="20" y2="34" transform="rotate(${a} 20 20)"/>`).join('') + '</g><g stroke="#4b97d6" stroke-width="1.8" stroke-linecap="round">' + [0, 60, 120, 180, 240, 300].map((a) => `<polyline points="16.5,9 20,12.5 23.5,9" fill="none" transform="rotate(${a} 20 20)"/>`).join('') + '</g>',
    nebbia: '<g stroke="#8b8a82" stroke-width="3.4" stroke-linecap="round"><line x1="7" y1="12" x2="27" y2="12"/><line x1="13" y1="19" x2="34" y2="19"/><line x1="7" y1="26" x2="28" y2="26"/><line x1="14" y1="33" x2="33" y2="33"/></g>',
  };
  const svg = (vb, inner, cls, extra) => `<svg class="spr ${cls || ''}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" ${extra || ''}>${inner}</svg>`;
  const title = (t) => `<title>${esc(t)}</title>`;

  // gettone simbolo (tondino)
  const S = (FF.Sprites = {});
  S.symbol = function (sym, cls) {
    const info = FF.SYMBOL_INFO[sym];
    return svg('0 0 40 40', `${title(info.n)}<circle cx="20" cy="20" r="19" fill="${SYM_BG[sym]}" stroke="#6b4f2a" stroke-width="1.6"/><g transform="translate(4 4) scale(.8)">${ICON[sym]}</g>`, 'sym ' + (cls || ''));
  };
  // gettone fusione: i due simboli affiancati su un tondino rosso
  S.fusion = function (name, cls) {
    const f = FF.FUSIONS.find((x) => x.name === name), a = f.recipe[0], b = f.recipe[1];
    return svg('0 0 40 40', `${title(name)}<circle cx="20" cy="20" r="19" fill="#ffd9c7" stroke="#b6401a" stroke-width="2.6"/><g transform="translate(2.5 9) scale(.52)">${ICON[a]}</g><g transform="translate(17.5 9) scale(.52)">${ICON[b]}</g><path d="M20 28l1.7 3.4 3.8.5-2.8 2.6.7 3.7-3.4-1.8-3.4 1.8.7-3.7-2.8-2.6 3.8-.5z" fill="#b6401a"/>`, 'sym fus ' + (cls || ''));
  };
  S.req = (r, cls) => (FF.isFusionName(r) ? S.fusion(r, cls) : S.symbol(r, cls));
  S.reqName = (r) => (FF.isFusionName(r) ? r : FF.SYMBOL_INFO[r].n);

  // testo a capo su più righe (stima grossolana della larghezza)
  function wrap(text, max) {
    const words = String(text).split(/\s+/), lines = []; let cur = '';
    for (const w of words) { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
    if (cur) lines.push(cur);
    return lines;
  }
  const MINOR = /^(di|del|dei|della|delle|dal|dalle|dai|sul|sulle|sulla|sui|in|da|e|a|al|alla|nel|nella|il|la|le|lo|un|una)$/;
  const tc = (t) => String(t).toLowerCase().split(' ').map((w, i) => (i > 0 && MINOR.test(w) ? w : w.replace(/(^|['-])(\p{L})/gu, (m, x, y) => x + y.toUpperCase()))).join(' ');
  S.titleCase = tc;
  const lines = (arr, x, y, dy, attrs) => arr.map((l, i) => `<text x="${x}" y="${y + i * dy}" ${attrs}>${esc(l)}</text>`).join('');
  const FONT = 'font-family="Georgia, \'Times New Roman\', serif"';
  const SANS = 'font-family="system-ui, -apple-system, \'Segoe UI\', Roboto, sans-serif"';

  S.bonusText = function (c) {
    const b = c.bonus; if (!b) return ['Nessun bonus'];
    if (b.tipo === 'confine') return ['+1 punto se hai', 'giocato ' + b.verso.join(' / ')];
    if (b.tipo === 'isole') return ['+1 punto se hai', 'giocato ' + b.se_giocata_una_di.join(' / ')];
    return ['+1 punto se hai giocato', 'almeno una tra:'].concat(b.se_giocata_una_di);
  };
  // Carta Regione (id numerico della carta fisica o oggetto carta)
  S.region = function (c, cls) {
    if (typeof c === 'number') c = FF.REGION_CARDS[c];
    const col = AREA_COL[c.area], dark = AREA_DARK[c.area], nm = c.regione;
    const fs = Math.min(11, 88 / (nm.length * 0.62));
    const lab = { neutra: 'NEUTRA', confine: 'CONFINE', compensativa: 'BONUS RETE' }[c.variante];
    const bt = S.bonusText(c);
    const nb = bt.length, bh = Math.max(34, nb * 9 + 10), by = 128 - bh;
    const body = `${title(nm + ' — ' + bt.join(' ') + ' (' + c.price + ' PM)')}
      <rect x="1.5" y="1.5" width="97" height="137" rx="7" fill="#f7f0de" stroke="#5a4326" stroke-width="2"/>
      <rect x="4" y="4" width="92" height="28" rx="4" fill="${col}"/>
      <text x="50" y="${15 + fs * 0.35}" text-anchor="middle" font-size="${fs.toFixed(1)}" font-weight="700" fill="#fff" ${FONT}>${esc(nm)}</text>
      <text x="50" y="28" text-anchor="middle" font-size="6.6" letter-spacing="1" fill="#e8eef5" ${SANS}>${esc(FF.AREA_NAMES[c.area].toUpperCase())}</text>
      <circle cx="46" cy="${(32 + by) / 2 + 1}" r="19" fill="${col}" opacity=".13" stroke="${dark}" stroke-width="1.6"/>
      <text x="46" y="${(32 + by) / 2 + 8}" text-anchor="middle" font-size="19" font-weight="800" fill="${dark}" ${SANS}>${SIGLA[nm]}</text>
      <circle cx="84" cy="43" r="9" fill="#e6c14a" stroke="#8a6a0e" stroke-width="1.4"/>
      <text x="84" y="46.5" text-anchor="middle" font-size="10" font-weight="800" fill="#4b3606" ${SANS}>${c.price}</text>
      <text x="84" y="57" text-anchor="middle" font-size="5.2" fill="#7b6a4b" ${SANS}>PM</text>
      <rect x="6" y="${by}" width="88" height="${bh}" rx="4" fill="${c.bonus ? '#fff8e1' : '#ece6d3'}" stroke="${c.bonus ? '#c9a227' : '#b9ae92'}" stroke-width="1"/>
      ${lines(bt, 50, by + (bh - nb * 9) / 2 + 7, 9, `text-anchor="middle" font-size="7.4" fill="#3a2d17" ${SANS}`)}
      <text x="8" y="136" font-size="5.8" letter-spacing=".7" fill="#7b6a4b" ${SANS}>${lab}</text>`;
    return svg('0 0 100 140', body, 'card region ' + (cls || ''));
  };
  // Carta Previsione (oggetto del JSON)
  S.previsione = function (p, cls) {
    const col = AREA_COL[p.area], tl = wrap(tc(p.titolo), 19), n = p.condizioni.length;
    const y0 = 28 + tl.length * 9.2, sepY = y0 + 8, rowsTop = sepY + 5, avail = 126 - rowsTop, rh = Math.min(26, avail / n);
    const rows = p.condizioni.map((c, i) => {
      const cy = rowsTop + i * rh + rh / 2, isc = c.livello === 'core', small = n > 2;
      const ic = small ? 0.42 : 0.6, w = 40 * ic;
      return `<g transform="translate(6 ${(cy - w / 2).toFixed(1)}) scale(${ic})">${ICON[c.simbolo]}</g>
        <text x="${(6 + w + 3).toFixed(1)}" y="${(cy + (small ? 2.4 : -1)).toFixed(1)}" font-size="${c.regione.length > 17 ? (isc ? 5.5 : 5.9) : c.regione.length > 15 ? 6.3 : small ? 7.2 : 8}" fill="#2b2216" font-weight="${isc ? 700 : 400}" ${SANS}>${esc(c.regione)}</text>
        ${small ? '' : `<text x="${(6 + w + 3).toFixed(1)}" y="${(cy + 8).toFixed(1)}" font-size="6" fill="#5b6b80" ${SANS}>${isc ? 'Core' : 'Secondaria'} · ${esc(FF.SYMBOL_INFO[c.simbolo].n)}</text>`}
        <text x="94" y="${(cy + 3.5).toFixed(1)}" text-anchor="end" font-size="${small ? 8 : 11}" font-weight="800" fill="${isc ? '#b4261a' : '#47546b'}" ${SANS}>${isc ? '★' : ''}${c.punti}</text>`;
    }).join('');
    const body = `${title('Previsione ' + p.titolo)}<rect x="1.5" y="1.5" width="97" height="137" rx="7" fill="#eef3f8" stroke="#2c3e55" stroke-width="2"/>
      <rect x="4" y="4" width="92" height="14" rx="4" fill="${col}"/><text x="50" y="13.6" text-anchor="middle" font-size="6.6" letter-spacing=".8" font-weight="700" fill="#fff" ${SANS}>PREVISIONE · ${esc(FF.AREA_NAMES[p.area].toUpperCase())}</text>
      ${lines(tl, 50, 29, 9.2, `text-anchor="middle" font-size="8.2" font-weight="700" fill="#1d2a3a" ${FONT}`)}
      <text x="50" y="${(y0 + 4).toFixed(1)}" text-anchor="middle" font-size="5.8" fill="#5b6b80" ${SANS}>${esc(p.tipologia)}</text>
      <line x1="6" y1="${sepY.toFixed(1)}" x2="94" y2="${sepY.toFixed(1)}" stroke="#a9b6c6" stroke-width=".8"/>${rows}
      <text x="50" y="134" text-anchor="middle" font-size="6.2" fill="#3b4a5e" ${SANS}>max ${p.max_punti} punti${n > 2 ? ' · ★ = Core' : ''}</text>`;
    return svg('0 0 100 140', body, 'card prev ' + (cls || ''));
  };
  S.eventShort = function (e) {
    if (e.categoria !== 'fenomeno') return e.condizione.replace(/^./, (c) => c.toUpperCase());
    return e.tipo === 'A' ? `Se ${e.regione} richiede già ${FF.SYMBOL_INFO[e.simbolo_richiesto].n}: diventa ${e.fusione}.` : `${e.regione} diventa ${e.fusione}, qualunque cosa richiedesse.`;
  };
  // Carta Evento (oggetto del JSON o id)
  S.evento = function (e, cls) {
    if (typeof e === 'number') e = FF.EVENTS[e];
    const phen = e.categoria === 'fenomeno', head = phen ? '#9a2a1a' : e.categoria === 'positiva' ? '#2c6b4a' : '#4a5a70';
    const tl = wrap(e.titolo, 19), sh = wrap(S.eventShort(e), 24);
    const chip = phen ? 'TIPO ' + e.tipo + (e.tipo === 'A' ? ' · CONDIZIONALE' : ' · IMPOSTO') : e.categoria === 'positiva' ? 'POSITIVA' : 'NESSUN EFFETTO';
    const ty = 30 + tl.length * 9.5, rg = phen ? wrap(e.regione.toUpperCase(), 20) : [];
    const fy = ty + 8 + rg.length * 8;
    const body = `${title('Evento #' + e.id + ' ' + e.titolo)}<rect x="1.5" y="1.5" width="97" height="137" rx="7" fill="#f4f1ea" stroke="#2f3a4a" stroke-width="2"/>
      <rect x="4" y="4" width="92" height="15" rx="4" fill="${head}"/><text x="50" y="14" text-anchor="middle" font-size="6.4" letter-spacing=".9" font-weight="700" fill="#fff" ${SANS}>PROTEZIONE CIVILE</text>
      ${lines(tl, 50, 31, 9.5, `text-anchor="middle" font-size="8.6" font-weight="700" fill="#1f2530" ${FONT}`)}
      <text x="50" y="${ty}" text-anchor="middle" font-size="5.8" letter-spacing=".5" font-weight="700" fill="${head}" ${SANS}>${chip}</text>
      ${lines(rg, 50, ty + 8, 8, `text-anchor="middle" font-size="7" font-weight="800" fill="#1f2530" ${SANS}`)}
      ${phen ? `<g transform="translate(${50 - 17} ${fy}) scale(.85)">${FF.Sprites.fusion(e.fusione).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>` : ''}
      ${lines(sh.slice(0, 6), 50, phen ? fy + 44 : 66 + (tl.length - 1) * 5, 8.4, `text-anchor="middle" font-size="6.5" fill="#2b2216" ${SANS}`)}
      <text x="94" y="134" text-anchor="end" font-size="5.4" fill="#8a8473" ${SANS}>#${e.id}</text>`;
    return svg('0 0 100 140', body, 'card evt ' + (cls || ''));
  };
  // Carta Obiettivo Segreto (id come 'T1' o oggetto)
  const OBJ_COL = { territorio: '#2f6b4f', simboli: '#7a4f9a', pattern: '#2c6f9c', risorse: '#9a6b1f' };
  S.obiettivo = function (o, cls) {
    if (typeof o === 'string') o = FF.OBJ[o];
    const col = OBJ_COL[o.tipo], tl = wrap(o.titolo, 17), tx = wrap(o.testo, 25), band = o.pts <= 3 ? 'FACILE' : o.pts <= 5 ? 'MEDIA' : 'DIFFICILE';
    const ty = 36 + tl.length * 10;
    const body = `${title('Obiettivo Segreto ' + o.titolo + ' — ' + o.testo + ' (' + o.pts + ' punti)')}
      <rect x="1.5" y="1.5" width="97" height="137" rx="7" fill="#f3efe4" stroke="#3a2d17" stroke-width="2"/>
      <rect x="4" y="4" width="92" height="17" rx="4" fill="${col}"/>
      <text x="50" y="12" text-anchor="middle" font-size="5.6" letter-spacing=".9" font-weight="700" fill="#fff" ${SANS}>OBIETTIVO SEGRETO</text>
      <text x="50" y="18.6" text-anchor="middle" font-size="5.2" letter-spacing=".8" fill="#f1f1f1" ${SANS}>${esc(FF.OBJECTIVE_TYPES[o.tipo].toUpperCase())}</text>
      ${lines(tl, 50, 33, 10, `text-anchor="middle" font-size="9" font-weight="700" fill="#1f2530" ${FONT}`)}
      <line x1="14" y1="${(ty - 4).toFixed(1)}" x2="86" y2="${(ty - 4).toFixed(1)}" stroke="#bfb59b" stroke-width=".8"/>
      ${lines(tx.slice(0, 5), 50, ty + 5, 8.6, `text-anchor="middle" font-size="6.8" fill="#2b2216" ${SANS}`)}
      <circle cx="50" cy="116" r="14" fill="${col}"/><text x="50" y="122" text-anchor="middle" font-size="17" font-weight="800" fill="#fff" ${SANS}>${o.pts}</text>
      <text x="50" y="135" text-anchor="middle" font-size="5.2" letter-spacing=".8" fill="#6b5d40" ${SANS}>${band} · PUNTI</text>`;
    return svg('0 0 100 140', body, 'card obj ' + (cls || ''));
  };
  // dorso generico (mazzi coperti)
  S.back = function (kind, cls) {
    const c = { regione: '#4f6f52', evento: '#9a2a1a', previsione: '#3d6c9e', obiettivo: '#5b3a78' }[kind] || '#555', lab = { regione: 'REGIONI', evento: 'EVENTI', previsione: 'PREVISIONI', obiettivo: 'OBIETTIVI' }[kind] || '';
    return svg('0 0 100 140', `<rect x="1.5" y="1.5" width="97" height="137" rx="7" fill="${c}" stroke="#2a2a2a" stroke-width="2"/><rect x="8" y="8" width="84" height="124" rx="4" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/><g transform="translate(30 50) scale(1.0)">${ICON.pioggia}</g><text x="50" y="108" text-anchor="middle" font-size="9" letter-spacing="1.4" font-weight="700" fill="#fff" ${SANS}>${lab}</text><text x="50" y="122" text-anchor="middle" font-size="6" fill="#fff" fill-opacity=".8" ${SANS}>DOMANI PIOVE</text>`, 'card back ' + (cls || ''));
  };
  S.seat = function (i, cls) {
    const cols = ['#c0392b', '#2c7fb8', '#2e8b57', '#c98a1c'];
    return svg('0 0 40 40', `<circle cx="20" cy="20" r="18" fill="${cols[i % 4]}" stroke="#fff" stroke-width="2.5"/><text x="20" y="27" text-anchor="middle" font-size="20" font-weight="800" fill="#fff" ${SANS}>${i + 1}</text>`, 'seat ' + (cls || ''));
  };
  S.worker = function (cls) { return svg('0 0 40 40', '<circle cx="20" cy="11" r="7" fill="#3a2d17"/><path d="M6 36a14 14 0 0 1 28 0z" fill="#3a2d17"/>', 'worker ' + (cls || '')); };
  S.coin = function (cls) { return svg('0 0 40 40', '<circle cx="20" cy="20" r="17" fill="#e6c14a" stroke="#8a6a0e" stroke-width="2.4"/><text x="20" y="26" text-anchor="middle" font-size="16" font-weight="800" fill="#4b3606" font-family="system-ui,sans-serif">PM</text>', 'coin ' + (cls || '')); };
  S.logo = function () { return svg('0 0 40 40', `<g transform="scale(1)">${ICON.pioggia}</g>`, 'logo'); };
  FF.AREA_COL = AREA_COL;
})(typeof window !== 'undefined' ? window : globalThis);
