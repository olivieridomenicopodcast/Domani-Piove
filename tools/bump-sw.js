#!/usr/bin/env node
/* Aggiorna la versione del service worker se i file in cache sono cambiati (e solo allora).
   Uso: node tools/bump-sw.js   — un test (tests/ui.test.js) fallisce se ci si dimentica di lanciarlo. */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.join(__dirname, '..'), swPath = path.join(root, 'sw.js'), sw = fs.readFileSync(swPath, 'utf8');
const files = [...sw.match(/const FILES = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]).filter((f) => f !== './');
const hash = crypto.createHash('sha1');
files.forEach((f) => { hash.update(f + '\0'); hash.update(fs.readFileSync(path.join(root, f))); });
const h = hash.digest('hex').slice(0, 10), cur = sw.match(/const VERSION = 'dp-v(\d+)'; \/\/ cache: ([0-9a-f]*)/);
if (cur && cur[2] === h) { console.log('sw.js già aggiornato (dp-v' + cur[1] + ', ' + h + ')'); process.exit(0); }
const n = cur ? Number(cur[1]) + 1 : 1;
const out = sw.replace(/const VERSION = 'dp-v\d+';( \/\/ cache: [0-9a-f]*)?/, `const VERSION = 'dp-v${n}'; // cache: ${h}`);
fs.writeFileSync(swPath, out); console.log('sw.js → dp-v' + n + ' (' + h + ')');
