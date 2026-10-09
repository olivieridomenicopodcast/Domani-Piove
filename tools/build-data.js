#!/usr/bin/env node
/* Genera js/cards.js dai JSON in data/ (fonte dei dati di carte e costanti, esportati dal progetto).
   Uso: node tools/build-data.js   (da rilanciare se cambia un JSON in data/) */
'use strict';
const fs = require('fs'), path = require('path');
const rd = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', f), 'utf8'));
const CARDS = { costanti: rd('regole_e_costanti.json'), regione: rd('carte_regione_varianti.json'), previsione: rd('carte_previsione.json'), evento: rd('carte_evento.json') };
fs.writeFileSync(path.join(__dirname, '..', 'js', 'cards.js'),
  '/* GENERATO da tools/build-data.js a partire da data/*.json: non modificare a mano */\n(function (root) { (root.FF = root.FF || {}).CARDS = ' + JSON.stringify(CARDS) + '; })(typeof window !== \'undefined\' ? window : globalThis);\n');
console.log('js/cards.js aggiornato: ' + CARDS.regione.length + ' varianti regione, ' + CARDS.previsione.length + ' previsioni, ' + CARDS.evento.length + ' eventi');
