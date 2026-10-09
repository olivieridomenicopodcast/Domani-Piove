#!/usr/bin/env node
/* Cerca una disposizione a griglia delle 20 regioni che assomigli all'Italia: le regioni che confinano davvero devono toccarsi (a croce, non in diagonale),
   quelle che non confinano no, e ogni regione resta vicina alla sua posizione reale. Stampa la griglia e gli scarti rispetto ai confini veri.
   Uso: node tools/italia-map.js [tentativi]   — il risultato scelto va poi scritto in js/data.js (FF.ITALY_MAP) */
'use strict';
const R = ["Valle d'Aosta", 'Piemonte', 'Liguria', 'Lombardia', 'Trentino-Alto Adige', 'Veneto', 'Friuli-Venezia Giulia', 'Emilia-Romagna', 'Toscana', 'Umbria', 'Marche', 'Lazio', 'Abruzzo', 'Molise', 'Campania', 'Puglia', 'Basilicata', 'Calabria', 'Sicilia', 'Sardegna'];
// confini di terra reali tra regioni (le isole non ne hanno)
const B = [['Valle d\'Aosta', 'Piemonte'], ['Piemonte', 'Lombardia'], ['Piemonte', 'Liguria'], ['Piemonte', 'Emilia-Romagna'], ['Liguria', 'Emilia-Romagna'], ['Liguria', 'Toscana'], ['Lombardia', 'Emilia-Romagna'], ['Lombardia', 'Veneto'], ['Lombardia', 'Trentino-Alto Adige'],
  ['Trentino-Alto Adige', 'Veneto'], ['Veneto', 'Friuli-Venezia Giulia'], ['Veneto', 'Emilia-Romagna'], ['Emilia-Romagna', 'Toscana'], ['Emilia-Romagna', 'Marche'], ['Toscana', 'Umbria'], ['Toscana', 'Marche'], ['Toscana', 'Lazio'], ['Umbria', 'Marche'], ['Umbria', 'Lazio'],
  ['Marche', 'Lazio'], ['Marche', 'Abruzzo'], ['Lazio', 'Abruzzo'], ['Lazio', 'Molise'], ['Lazio', 'Campania'], ['Abruzzo', 'Molise'], ['Molise', 'Campania'], ['Molise', 'Puglia'], ['Campania', 'Puglia'], ['Campania', 'Basilicata'], ['Puglia', 'Basilicata'], ['Basilicata', 'Calabria']];
// centro approssimativo (longitudine, latitudine)
const C = { "Valle d'Aosta": [7.4, 45.7], Piemonte: [7.9, 45.0], Liguria: [8.7, 44.3], Lombardia: [9.8, 45.6], 'Trentino-Alto Adige': [11.3, 46.5], Veneto: [12.0, 45.6], 'Friuli-Venezia Giulia': [13.2, 46.1], 'Emilia-Romagna': [11.0, 44.5], Toscana: [11.0, 43.4], Umbria: [12.5, 42.9], Marche: [13.2, 43.4], Lazio: [12.7, 41.9], Abruzzo: [13.9, 42.2], Molise: [14.6, 41.6], Campania: [14.8, 40.9], Puglia: [16.5, 41.0], Basilicata: [16.1, 40.5], Calabria: [16.4, 39.0], Sicilia: [14.0, 37.5], Sardegna: [9.0, 40.0] };
const isB = (a, b) => B.some((p) => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));
const W = Number(process.argv[3] || 7), H = Number(process.argv[4] || 9), tries = Number(process.argv[2] || 60), DIAG = process.argv[5] === 'diag';
const touch = (a, b) => (DIAG ? Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])) === 1 : Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1);   // diag: contano anche gli angoli
const want = {}; R.forEach((r) => { want[r] = [(C[r][0] - 7.0) / 11.0 * (W - 1), (47.0 - C[r][1]) / 10.4 * (H - 1)]; });
function cost(pos) {
  let c = 0;
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
    const a = pos[R[i]], b = pos[R[j]], d = Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1])), real = isB(R[i], R[j]), t = touch(a, b);
    if (real && !t) c += 6 * Math.max(1, (DIAG ? d : Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])) - 1);          // confine vero ma non si toccano
    if (!real && t) c += 5;                    // si toccano ma non confinano
  }
  for (const r of R) { const dx = pos[r][0] - want[r][0], dy = pos[r][1] - want[r][1]; c += 0.7 * (dx * dx + dy * dy); }
  return c;
}
let best = null, bestC = 1e9, seed = 12345; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
for (let t = 0; t < tries; t++) {
  const used = new Set(), pos = {};
  for (const r of R) { let x, y, k = 0; do { x = Math.max(0, Math.min(W - 1, Math.round(want[r][0] + (rnd() - .5) * 2))); y = Math.max(0, Math.min(H - 1, Math.round(want[r][1] + (rnd() - .5) * 2))); k++; if (k > 50) { x = Math.floor(rnd() * W); y = Math.floor(rnd() * H); } } while (used.has(x + ',' + y)); used.add(x + ',' + y); pos[r] = [x, y]; }
  let c = cost(pos), T = 6;
  for (let it = 0; it < 60000; it++) {
    T = 6 * (1 - it / 60000) + 0.02; const r = R[Math.floor(rnd() * 20)], old = pos[r].slice(); let nx = old[0] + Math.floor(rnd() * 3) - 1, ny = old[1] + Math.floor(rnd() * 3) - 1;
    if (rnd() < 0.15) { nx = Math.floor(rnd() * W); ny = Math.floor(rnd() * H); }
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const occ = R.find((q) => q !== r && pos[q][0] === nx && pos[q][1] === ny);
    if (occ) { const o = pos[occ].slice(); pos[r] = [nx, ny]; pos[occ] = old; const c2 = cost(pos); if (c2 <= c || rnd() < Math.exp((c - c2) / T)) c = c2; else { pos[r] = old; pos[occ] = o; } }
    else { pos[r] = [nx, ny]; const c2 = cost(pos); if (c2 <= c || rnd() < Math.exp((c - c2) / T)) c = c2; else pos[r] = old; }
  }
  if (c < bestC) { bestC = c; best = JSON.parse(JSON.stringify(pos)); }
}
const ab = (r) => ({ "Valle d'Aosta": 'VdA', Piemonte: 'Pie', Liguria: 'Lig', Lombardia: 'Lom', 'Trentino-Alto Adige': 'TAA', Veneto: 'Ven', 'Friuli-Venezia Giulia': 'FVG', 'Emilia-Romagna': 'ER ', Toscana: 'Tos', Umbria: 'Umb', Marche: 'Mar', Lazio: 'Laz', Abruzzo: 'Abr', Molise: 'Mol', Campania: 'Cam', Puglia: 'Pug', Basilicata: 'Bas', Calabria: 'Cal', Sicilia: 'Sic', Sardegna: 'Sar' }[r]);
console.log('costo', bestC.toFixed(1), 'griglia', W + '×' + H);
for (let y = 0; y < H; y++) console.log(Array.from({ length: W }, (_, x) => { const r = R.find((q) => best[q][0] === x && best[q][1] === y); return r ? ab(r) : ' · '; }).join(' '));
const missing = [], extra = [];
for (let i = 0; i < 20; i++) for (let j = i + 1; j < 20; j++) { const t = touch(best[R[i]], best[R[j]]), real = isB(R[i], R[j]); if (real && !t) missing.push(R[i] + '–' + R[j]); if (!real && t) extra.push(R[i] + '–' + R[j]); }
console.log('confini veri che NON si toccano (' + missing.length + '/' + B.length + '):', missing.join(', ') || 'nessuno'); console.log('si toccano ma NON confinano (' + extra.length + '):', extra.join(', ') || 'nessuno');
console.log(JSON.stringify(best));
