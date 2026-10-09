#!/usr/bin/env node
/* Esporta gli sprite SVG in assets/sprites/*.svg (carte 100×140, pronte per la stampa) e genera sprites.html (anteprima).
   Uso: node tools/export-sprites.js */
'use strict';
const fs = require('fs'), path = require('path');
require('../js/cards.js'); require('../js/data.js'); require('../js/ui/sprites.js');
const FF = globalThis.FF, S = FF.Sprites;
const dir = path.join(__dirname, '..', 'assets', 'sprites');
fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const slug = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const files = []; const seenName = {};
const put = (group, name, svg) => {
  let n = slug(name); const key = group + '/' + n; seenName[key] = (seenName[key] || 0) + 1; if (seenName[key] > 1) n += '-' + seenName[key];
  fs.mkdirSync(path.join(dir, group), { recursive: true });
  const f = path.join(group, n + '.svg'); fs.writeFileSync(path.join(dir, f), svg.replace('<svg ', '<svg width="100" height="' + (group === 'simboli' ? 100 : 140) + '" '));
  files.push({ group, name, f, svg });
};
FF.SYMBOLS.forEach((x) => put('simboli', x, S.symbol(x)));
FF.FUSIONS.forEach((f) => put('simboli', 'fusione-' + f.name, S.fusion(f.name)));
const done = new Set();
FF.REGION_CARDS.forEach((c) => { const k = c.regione + '|' + c.variante + '|' + JSON.stringify(c.bonus); if (done.has(k)) return; done.add(k); put('carte-regione', c.regione + '-' + c.variante + (c.bonus && c.bonus.verso ? '-' + c.bonus.verso.join('-') : ''), S.region(c)); });
FF.PREVISIONI.forEach((p) => put('carte-previsione', p.id + '-' + p.titolo, S.previsione(p)));
FF.EVENT_IDS.forEach((id) => put('carte-evento', String(id).padStart(2, '0') + '-' + FF.EVENTS[id].titolo, S.evento(id)));
FF.OBJECTIVES.forEach((o) => put('carte-obiettivo', o.id + '-' + o.titolo, S.obiettivo(o)));
['regione', 'evento', 'previsione', 'obiettivo'].forEach((k) => put('dorsi', k, S.back(k)));
const html = '<!DOCTYPE html><meta charset="utf-8"><title>Domani Piove — sprite</title><style>body{font-family:system-ui;background:#eee;padding:1rem}h2{margin-top:2rem}.g{display:flex;flex-wrap:wrap;gap:12px}.c{width:140px;text-align:center;font-size:12px}.c svg{width:140px;height:auto;filter:drop-shadow(0 2px 3px #0004)}.c svg.sym{width:70px}</style><h1>Sprite (' + files.length + ')</h1>' +
  ['simboli', 'carte-regione', 'carte-previsione', 'carte-evento', 'carte-obiettivo', 'dorsi'].map((g) => '<h2>' + g + '</h2><div class="g">' + files.filter((x) => x.group === g).map((x) => '<div class="c">' + x.svg + '<div>' + x.name.replace(/</g, '&lt;') + '</div></div>').join('') + '</div>').join('');
fs.writeFileSync(path.join(__dirname, '..', 'sprites.html'), html);
console.log('Esportati ' + files.length + ' sprite in assets/sprites/ e anteprima in sprites.html');
