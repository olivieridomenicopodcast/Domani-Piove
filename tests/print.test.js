'use strict';
// Kit stampabile: conteggi, formato e assenza di errori nei file generati da tools/build-print.js
// (se fallisce: node tools/build-print.js e riprova)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const FF = require('./_load.js');
require('../js/ui/sprites.js');
const out = path.join(__dirname, '..', 'stampa');
const read = (f) => fs.readFileSync(path.join(out, f), 'utf8');
const pdfInfo = (f) => { try { return execFileSync('pdfinfo', [path.join(out, f)]).toString(); } catch (e) { return null; } };
const TOTAL = FF.REGION_CARDS.length + FF.PREVISIONI.length + FF.EVENT_IDS.length + FF.OBJECTIVES.length + FF.Sprites.RIFERIMENTI.length;

test('kit stampabile: quantità di carte per mazzo come nel regolamento', () => {
  assert.equal(FF.REGION_CARDS.length, 96); assert.equal(FF.PREVISIONI.length, 36); assert.equal(FF.EVENT_IDS.length, 80); assert.equal(FF.OBJECTIVES.length, 24);
  assert.equal(TOTAL % 9, 0, 'le carte riempiono esattamente i fogli (9 per foglio): ' + TOTAL);
  const ns = TOTAL / 9, html = read('carte-solo-fronti.html'), both = read('carte-fronte-retro.html');
  assert.equal((html.match(/class="sheet"/g) || []).length, ns);
  assert.equal((both.match(/class="sheet"/g) || []).length, ns * 2);
  assert.equal((html.match(/class="c"/g) || []).length, TOTAL);
  assert.equal((both.match(/class="c"/g) || []).length, TOTAL * 2);
  assert.equal((both.match(/RETRO/g) || []).length, ns);
});
test('kit stampabile: il retro è specchiato sul lato lungo e ogni mazzo ha il suo dorso', () => {
  const both = read('carte-fronte-retro.html'), sheets = both.split('<section class="sheet">').slice(1);
  const gx = (210 - 3 * 63.5) / 2, lefts = (sh) => Array.from(sh.matchAll(/class="c" style="left:([\d.]+)mm/g)).map((m) => Number(m[1]));
  const f = lefts(sheets[0]), b = lefts(sheets[1]);
  assert.deepEqual(f.slice(0, 3).map((x) => +(x - gx).toFixed(2)), [0, 63.5, 127]);
  assert.deepEqual(b.slice(0, 3).map((x) => +(x - gx).toFixed(2)), [127, 63.5, 0]);       // colonne ribaltate
  const back = (kind) => FF.Sprites.back(kind).slice(0, 90);
  assert.ok(sheets[1].includes(back('regione'))); assert.ok(both.includes(back('previsione')) && both.includes(back('evento')) && both.includes(back('obiettivo')) && both.includes(back('riferimento')));
});
test('kit stampabile: formato carta poker 63,5 × 88,9 mm, rapporto delle grafiche 100×140', () => {
  const html = read('carte-solo-fronti.html');
  assert.ok(html.includes('width: 63.5mm; height: 88.9mm'));
  assert.ok(html.includes('size: A4'));
  assert.ok(Math.abs(63.5 / 88.9 - 100 / 140) < 0.005);
  assert.ok(html.includes('viewBox="0 0 100 140"'));
});
test('kit stampabile: nessun «undefined», «NaN» o «[object» nei file generati', () => {
  fs.readdirSync(out).filter((f) => f.endsWith('.html')).forEach((f) => { const t = read(f); ['undefined', 'NaN', '[object', 'null'].forEach((bad) => assert.ok(!new RegExp('(^|[^\\w])' + bad.replace('[', '\\[') + '([^\\w]|$)').test(t.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '')), f + ' contiene ' + bad)); });
});
test('kit stampabile: mappa d\'Italia (tessere), plancia centrale e plance giocatore', () => {
  const ita = read('plancia-italia.html'), regions = Object.keys(FF.ITALY_MAP);
  regions.forEach((r) => assert.ok(ita.includes(r.replace(/'/g, "'")), 'manca ' + r));
  assert.equal((ita.match(/class="sheet"/g) || []).length, 5);
  assert.equal((ita.match(/class="cell"/g) || []).length, regions.length);
  assert.ok(ita.includes('width: 65mm; height: 91mm'));
  assert.equal((read('plancia-centrale.html').match(/class="land"/g) || []).length, 4);
  assert.equal((read('plance-giocatori.html').match(/class="land"/g) || []).length, 4);
  const c = read('plancia-centrale.html'); FF.SPACE_NAMES && ['Gioca una carta', 'Compra una carta', 'Raccogli un simbolo', 'Guadagna 1 PM', 'Sblocca lavoratore', 'Doppia azione', 'Azione ripetuta'].forEach((n) => assert.ok(c.includes(n), n));
});
test('kit stampabile: i numeri scritti nei fogli coincidono con le regole in uso', () => {
  const R = FF.DEFAULT_RULES, fp = read('foglio-punti.html'), pg = read('plance-giocatori.html');
  R.accuracy.forEach((a) => assert.ok(fp.includes(`${a.from === a.to ? a.from : a.from + '–' + (a.to >= 15 ? '15' : a.to)} → ${a.pts}`), 'scala ' + a.pts));
  assert.ok(fp.includes('× ' + R.borderPoints)); assert.ok(pg.includes(`Neutra gratis`) && pg.includes(`alla cieca ${R.blindPrice}`) && pg.includes(`${R.thirdWorkerCost} PM`));
  const idx = read('index.html'); assert.ok(idx.includes(`${TOTAL} carte, ${TOTAL / 9} fogli`));
  ['carte-fronte-retro.pdf', 'carte-solo-fronti.pdf', 'plancia-centrale.pdf', 'plance-giocatori.pdf', 'plancia-italia.pdf', 'foglio-punti.pdf', 'regolamento.pdf'].forEach((f) => assert.ok(idx.includes(f) && fs.existsSync(path.join(out, f)), f));
});
test('kit stampabile: i PDF hanno pagine A4 e il numero di pagine atteso', (t) => {
  if (pdfInfo('foglio-punti.pdf') == null) { t.skip('pdfinfo non disponibile'); return; }
  const info = (f) => { const t = pdfInfo(f); return { pages: Number(t.match(/Pages:\s+(\d+)/)[1]), size: t.match(/Page size:\s+([\d.]+) x ([\d.]+)/).slice(1).map(Number) }; };
  const near = (a, b) => Math.abs(a - b) < 2, A4 = [595.3, 841.9];
  const cf = info('carte-fronte-retro.pdf'), cs = info('carte-solo-fronti.pdf');
  assert.equal(cf.pages, TOTAL / 9 * 2); assert.equal(cs.pages, TOTAL / 9);
  [cf, cs, info('plancia-italia.pdf'), info('foglio-punti.pdf'), info('regolamento.pdf')].forEach((i) => assert.ok(near(i.size[0], A4[0]) && near(i.size[1], A4[1]), 'A4 verticale'));
  [info('plancia-centrale.pdf'), info('plance-giocatori.pdf')].forEach((i) => { assert.equal(i.pages, 4); assert.ok(near(i.size[0], A4[1]) && near(i.size[1], A4[0]), 'A4 orizzontale'); });
  assert.equal(info('plancia-italia.pdf').pages, 5); assert.equal(info('foglio-punti.pdf').pages, 1);
});
test('kit stampabile: il pulsante nell\'app e la cache offline includono la pagina di stampa', () => {
  const root = path.join(__dirname, '..');
  assert.ok(fs.readFileSync(path.join(root, 'index.html'), 'utf8').includes('href="stampa/index.html"') && !/class="mode[ "][^>]*stampa\/index/.test(fs.readFileSync(path.join(root, 'index.html'), 'utf8')));
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  ['stampa/index.html', 'stampa/carte-fronte-retro.html', 'stampa/plancia-italia.html', 'stampa/foglio-punti.html'].forEach((f) => assert.ok(sw.includes("'" + f + "'"), f));
});
