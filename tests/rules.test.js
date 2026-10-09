'use strict';
// Il regolamento mostrato nell'app (js/rulebook.js) deve essere generato da docs/REGOLAMENTO.md,
// e i valori citati nel testo (quantità di carte, parametri) devono coincidere col codice.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path');
const FF = require('./_load.js');
require('../js/rulebook.js');
const MD = fs.readFileSync(path.join(__dirname, '..', 'docs', 'REGOLAMENTO.md'), 'utf8');
const R = FF.DEFAULT_RULES;

test('regolamento: js/rulebook.js è sincronizzato con docs/REGOLAMENTO.md (rilancia node tools/build-rules.js)', () => {
  assert.equal(FF.RULEBOOK_MD, MD);
});
test('regolamento: js/cards.js è sincronizzato con data/*.json (rilancia node tools/build-data.js)', () => {
  const rd = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', f), 'utf8'));
  assert.deepEqual(FF.CARDS, { costanti: rd('regole_e_costanti.json'), regione: rd('carte_regione_varianti.json'), previsione: rd('carte_previsione.json'), evento: rd('carte_evento.json') });
});
test('regolamento: quantità di carte citate coincidono col codice', () => {
  const cnt = (a) => FF.REGION_CARDS.filter((c) => c.area === a).length;
  assert.ok(MD.includes(`**${FF.REGION_CARDS.length} Carte Regione** (${cnt('nord')} Nord, ${cnt('centro')} Centro, ${cnt('sud_isole')} Sud e Isole)`));
  const A = FF.EVENT_IDS.filter((i) => FF.EVENTS[i].tipo === 'A').length, B = FF.EVENT_IDS.filter((i) => FF.EVENTS[i].tipo === 'B').length;
  assert.ok(MD.includes(`**${FF.PREVISIONI.length} Carte Previsione** (12 per area) e **${FF.EVENT_IDS.length} Carte Evento** (${A} Tipo A, ${B} Tipo B, ${FF.EVENT_IDS.length - A - B} neutre o positive)`));
  assert.ok(MD.includes(`**${R.poolPerSymbol} gettoni per simbolo**`));
  assert.ok(MD.includes(`**${R.marketSize} Carte Regione scoperte**`));
  assert.ok(MD.includes(`**${R.startPM} PM** e **${R.startCards} Carte Regione**`));
  assert.ok(MD.includes(`**${R.workers} lavoratori**`));
  assert.ok(MD.includes(`Paga **${R.thirdWorkerCost} PM**`));
  assert.ok(MD.includes(`${R.rounds} round`));
  assert.ok(MD.includes(`round ${R.eventRounds.join(', ').replace(/, (\d+)$/, ' e $1')}`));
  assert.ok(MD.includes(`Neutra ${FF.REGION_CARDS.find((c) => c.variante === 'neutra').price} · Confine ${FF.REGION_CARDS.find((c) => c.variante === 'confine').price} · Compensativa ${FF.REGION_CARDS.find((c) => c.variante === 'compensativa').price} · Pesca cieca (qualsiasi carta) ${R.blindPrice}`));
});
test('regolamento: tabelle di fusioni, scaglioni e pattern coincidono col codice', () => {
  FF.FUSIONS.forEach((f) => {
    const cap = (s) => s[0].toUpperCase() + s.slice(1);
    const row = `| ${f.name} | ${f.recipe.map(cap).join(' + ')} |`;
    const alt = `| ${f.name} | ${f.recipe.slice().reverse().map(cap).join(' + ')} |`;
    assert.ok(MD.includes(row) || MD.includes(alt), 'fusione ' + f.name);
  });
  R.accuracy.forEach((s) => assert.ok(MD.includes(`| ${s.from === s.to ? s.from : s.from + '–' + s.to} | ${s.label} | ${s.pts} |`), 'scaglione ' + s.label));
  const P = R.pattern;
  assert.ok(MD.includes(`2 carte = ${P.soleScale[2]} · 3 = ${P.soleScale[3]} · 4 = ${P.soleScale[4]} · 5 = ${P.soleScale[5]} · 6+ = ${P.soleScale[6]}`));
  assert.ok(MD.includes(`2 carte = +${P.temporale2} · 3 o più = +${P.temporale3}`));
  [['Coda di pioggia', P.pioggia], ['Manto di quota', P.neve], ['Ponte', P.vento], ['Frangia', P.nuvolo], ['Sacca isolata', P.nebbia]].forEach(([n, v]) => {
    const line = MD.split('\n').find((l) => l.includes('**' + n + '**')); assert.ok(line && line.includes(`| +${v} |`), n);
  });
  assert.ok(R.sez2OccupiesSez1 === false && MD.includes('`sez2OccupiesSez1` no'));
  assert.ok(R.mapMode === 'italia' && MD.includes('`mapMode` italia'));
});
