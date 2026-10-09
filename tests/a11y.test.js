'use strict';
// Contrasto dei colori (WCAG AA: 4,5 per il testo normale, 3 per testo grande o disattivato) calcolato dai colori reali del CSS.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
const V = {}; [...css.match(/:root\s*{([^}]*)}/)[1].matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{3,6})/g)].forEach((m) => { V[m[1]] = m[2]; });
const rgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const x = lum(rgb(a)), y = lum(rgb(b)); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const blend = (fg, bg, a) => '#' + rgb(fg).map((v, i) => Math.round(v * a + rgb(bg)[i] * (1 - a)).toString(16).padStart(2, '0')).join('');
const v = (n) => V[n];

// [descrizione, colore del testo, sfondo, soglia]
const PAIRS = [
  ['testo normale su carta', v('ink'), v('paper'), 4.5], ['testo normale su carta scura', v('ink'), v('paper2'), 4.5], ['testo normale su campo chiaro', v('ink'), '#fffdf6', 4.5],
  ['testo secondario su carta', v('muted'), v('paper'), 4.5], ['testo secondario su carta scura', v('muted'), v('paper2'), 4.5], ['testo secondario su campo chiaro', v('muted'), '#fffdf6', 4.5],
  ['link / numeri grandi su carta', v('accent2'), v('paper'), 3.0], ['link su campo chiaro', v('accent2'), '#fffdf6', 3.0],
  ['bottone primario (bianco su azzurro)', '#ffffff', v('accent2'), 3.0], ['barra in alto', '#ffffff', '#14293a', 4.5], ['testo bianco sul tavolo', '#ffffff', v('felt'), 4.5], ['testo sul tavolo chiaro', '#d6e4ee', v('felt'), 4.5],
  ['chip semitrasparente', '#ffffff', blend('#ffffff', v('felt'), 0.18), 4.5], ['motivo di azione non disponibile', v('bad'), '#e8e2d0', 4.5], ['azione non disponibile (grigia)', '#7b715c', '#e8e2d0', 3.0],
  ['etichetta «chiarito»', '#1e5b34', '#d5ecd9', 4.5], ['etichetta «interpretazione»', '#8a560a', '#fbe6c3', 4.5], ['anteprima: guadagno', v('ok'), '#eef6e6', 4.5], ['anteprima: perdita', v('bad'), '#eef6e6', 4.5],
  ['messaggio', v('ink'), '#fffbea', 4.5], ['messaggio dell\'Evento', v('ink'), '#fff1ee', 4.5], ['suggerimento', v('ink'), '#fff7d1', 4.5], ['avviso', v('ink'), '#fff1d6', 4.5],
  ['pulsante pericolo', '#7a1a10', '#fbe3df', 4.5], ['round attuale nella barra delle ore', '#ffffff', v('accent2'), 3.0], ['esito positivo', v('ok'), v('paper'), 4.5], ['esito negativo', v('bad'), v('paper'), 4.5],
];
test('accessibilità: i contrasti dei colori del CSS rispettano WCAG AA', () => {
  assert.ok(Object.keys(V).length >= 8, 'variabili CSS non lette');
  const bad = PAIRS.map(([d, fg, bg, min]) => ({ d, r: ratio(fg, bg), min })).filter((x) => x.r < x.min);
  assert.deepEqual(bad.map((x) => `${x.d}: ${x.r.toFixed(2)} < ${x.min}`), []);
});
test('accessibilità: base 17px, tasti grandi sul telefono e movimento ridotto', () => {
  assert.ok(/html\s*{\s*font-size:\s*17px/.test(css), 'testo base almeno 17px');
  assert.ok(/prefers-reduced-motion/.test(css), 'manca la gestione del movimento ridotto');
  assert.ok(/pointer:\s*coarse[\s\S]*min-height:\s*44px/.test(css), 'bersagli di tocco da 44px su schermi touch');
  assert.ok(/:focus-visible/.test(css), 'focus visibile da tastiera');
});
