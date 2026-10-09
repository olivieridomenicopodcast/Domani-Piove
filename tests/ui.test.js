'use strict';
// Controlli sull'interfaccia che non richiedono un browser: sprite ben formati, pagine e service worker coerenti.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path');
const FF = require('./_load.js');
require('../js/ui/sprites.js');
const S = FF.Sprites, root = path.join(__dirname, '..');

// controllo di buona formazione: ogni tag aperto è chiuso (i tag self-closing e gli entity sono ammessi)
function wellFormed(svg) {
  const stack = [], re = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g; let m;
  while ((m = re.exec(svg))) {
    if (m[4] === '/') continue;
    if (m[1]) { assert.equal(stack.pop(), m[2], 'tag non chiuso: ' + m[2]); } else stack.push(m[2]);
  }
  assert.equal(stack.length, 0, 'tag rimasti aperti: ' + stack.join(','));
  assert.ok(!/NaN|undefined|\[object/.test(svg), 'valore non valido nello sprite');
}
test('sprite: tutte le carte e i gettoni si disegnano, ben formati, con rapporto 100×140', () => {
  FF.SYMBOLS.forEach((x) => { const v = S.symbol(x); wellFormed(v); assert.ok(v.includes('viewBox="0 0 40 40"')); });
  FF.FUSIONS.forEach((f) => wellFormed(S.fusion(f.name)));
  FF.REGION_CARDS.forEach((c) => { const v = S.region(c); wellFormed(v); assert.ok(v.includes('viewBox="0 0 100 140"')); });
  FF.PREVISIONI.forEach((p) => { const v = S.previsione(p); wellFormed(v); assert.ok(v.includes('viewBox="0 0 100 140"')); });
  FF.EVENT_IDS.forEach((id) => { const v = S.evento(id); wellFormed(v); assert.ok(v.includes('viewBox="0 0 100 140"')); });
  ['regione', 'evento', 'previsione'].forEach((k) => wellFormed(S.back(k)));
  [0, 1, 2, 3].forEach((i) => wellFormed(S.seat(i)));
  wellFormed(S.worker()); wellFormed(S.coin()); wellFormed(S.logo());
});
test('sprite: il testo delle carte non lascia mai tracce di errori e riporta nome e prezzo', () => {
  const c = FF.REGION_CARDS.find((x) => x.variante === 'compensativa' && x.regione === 'Calabria');
  const v = S.region(c); assert.ok(v.includes('Calabria')); assert.ok(v.includes('Valle d&#39;Aosta') && v.includes('Friuli-Venezia Giulia')); assert.ok(v.includes('>3<'));
});
test('PWA: ogni script di index.html esiste ed è nella cache del service worker', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8'), sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const scripts = Array.from(html.matchAll(/<script src="([^"]+)"/g)).map((m) => m[1]);
  assert.ok(scripts.length >= 9);
  scripts.forEach((f) => { assert.ok(fs.existsSync(path.join(root, f)), 'manca ' + f); assert.ok(sw.includes("'" + f + "'"), 'non in cache: ' + f); });
  ['css/style.css', 'manifest.json', 'icon-192.png', 'icon-512.png'].forEach((f) => { assert.ok(fs.existsSync(path.join(root, f)), 'manca ' + f); assert.ok(sw.includes("'" + f + "'"), 'non in cache: ' + f); });
  const man = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8')); assert.equal(man.display, 'standalone');
});
test('AI provvisoria: sceglie sempre un indice valido e una partita AI contro AI arriva in fondo', () => {
  const bots = [FF.AI.create('easy', 'x1'), FF.AI.create('hard', 'x2'), FF.AI.create('medium', 'x3')];
  const g = new FF.Game({ seed: 3, players: [{ name: 'A', kind: 'ai' }, { name: 'B', kind: 'ai' }, { name: 'C', kind: 'ai' }], log: false });
  const res = FF.drive(g.run(), (d) => { const a = bots[d.pid].decide(g, d); assert.ok(Number.isInteger(a) && a >= 0 && a < d.options.length); return a; }, g);
  assert.equal(res.rounds, 12);
});
test('animazione: con beats la partita emette un beat per ogni evento di cronaca', () => {
  const g = new FF.Game({ seed: 4, players: [{ name: 'A' }, { name: 'B' }], beats: true });
  let beats = 0; const it = g.run(); let r = it.next(); const ch = FF.randomChooser(4);
  while (!r.done) { if (r.value.type === 'beat') { beats++; r = it.next(); } else r = it.next(ch(r.value)); }
  assert.equal(beats, g.events.length);
});

test('PWA: la versione del service worker è aggiornata (se fallisce: node tools/bump-sw.js)', () => {
  const crypto = require('crypto'), sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const files = [...sw.match(/const FILES = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((f) => f !== './');
  const h = crypto.createHash('sha1'); files.forEach((f) => { h.update(f + '\0'); h.update(fs.readFileSync(path.join(root, f))); });
  const cur = sw.match(/const VERSION = 'dp-v(\d+)'; \/\/ cache: ([0-9a-f]+)/);
  assert.ok(cur, 'manca l\'impronta nella riga VERSION'); assert.equal(cur[2], h.digest('hex').slice(0, 10), 'i file in cache sono cambiati: lancia node tools/bump-sw.js');
});
