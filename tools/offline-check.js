#!/usr/bin/env node
/* Prova la PWA offline: carica l'app, aspetta il service worker, spegne la rete, ricarica e gioca una partita AI contro AI.
   Uso: NODE_PATH=/opt/node-tools/node_modules node tools/offline-check.js [--url http://localhost:8123/] */
'use strict';
const { chromium } = require('playwright');
const args = process.argv.slice(2), url = args.includes('--url') ? args[args.indexOf('--url') + 1] : 'http://localhost:8123/';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const ctx = await b.newContext({ viewport: { width: 1100, height: 800 } }), p = await ctx.newPage(), out = {}, errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(url);
  out.swReady = await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; return !!(r && r.active); });
  out.cacheFiles = await p.evaluate(async () => { const ks = await caches.keys(); const c = await caches.open(ks[0]); return { name: ks[0], n: (await c.keys()).length }; });
  const html = await (await fetch(url + 'index.html')).text(), want = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map((m) => m[1]).filter((u) => !/^https?:/.test(u));
  out.missingInCache = await p.evaluate(async (list) => { const miss = []; for (const u of list) if (!(await caches.match(u))) miss.push(u); return miss; }, want);
  await ctx.setOffline(true);
  await p.reload(); await p.waitForSelector('.mode');
  out.offlineTitle = await p.title();
  await p.click('.mode[data-mode=watch]'); await p.click('#su-speed [data-v=instant]'); await p.fill('#su-seed', 'offline1'); await p.click('#su-go');
  for (let i = 0; i < 400; i++) { if (await p.$('.dlg:has-text("Confronto Finale")')) break; await p.click('#a-next', { timeout: 500 }).catch(() => {}); }
  out.partitaOffline = !!(await p.$('.dlg:has-text("Confronto Finale")'));
  await p.goto(url + 'index.html'); await p.click('#btn-rules'); await p.waitForSelector('.rules h1'); out.regoleOffline = await p.$$eval('.rules h2', (e) => e.length);
  await p.goto(url); await p.click('.mode[data-mode=sim]'); await p.waitForSelector('#sm-run'); await p.fill('#sm-n', '6'); await p.click('#sm-run'); await p.waitForSelector('.tiles', { timeout: 60000 }); out.simulatoreOffline = true;
  out.errors = errs; console.log(JSON.stringify(out, null, 1)); await b.close();
  process.exit(!out.swReady || out.missingInCache.length || !out.partitaOffline || errs.length ? 1 : 0);
})();
