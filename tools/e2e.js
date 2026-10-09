#!/usr/bin/env node
/* Prova nel browser: gioca una partita completa con un "bot" che clicca l'interfaccia, raccoglie errori di console,
   controlla che la pagina non scorra in orizzontale e fa screenshot dei momenti principali.
   Uso: NODE_PATH=/opt/node-tools/node_modules node tools/e2e.js [--url http://localhost:8123/] [--mode ai|hotseat|watch]
        [--seed x] [--out cartella] [--mobile] [--players 2|3|4] */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const url = get('url', 'http://localhost:8123/'), mode = get('mode', 'ai'), seed = get('seed', 'e2e1'), out = get('out', '/tmp/e2e'), mobile = args.includes('--mobile'), np = get('players', '2');
fs.mkdirSync(out, { recursive: true });
let rnd = 12345; const rand = () => { rnd = (rnd * 1664525 + 1013904223) >>> 0; return rnd / 4294967296; };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 900 }, hasTouch: mobile, isMobile: mobile });
  const errors = [], overflow = [];
  p.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push('CONSOLE ' + m.text()); });
  await p.goto(url);
  const tag = (mobile ? 'm-' : 'd-') + mode + '-';
  const shots = {};
  const vp = args.includes('--vp');
  const snap = async (name, full) => { if (shots[name]) return; shots[name] = 1; await p.screenshot({ path: `${out}/${tag}${vp ? 'vp-' : ''}${name}.png`, fullPage: !vp && full !== false }); };
  await snap('home');
  await p.click(`.mode[data-mode=${mode}]`);
  await p.click(`#su-n [data-v="${np}"]`);
  if (mode === 'watch') await p.click('#su-speed [data-v=instant]');
  await p.fill('#su-seed', seed);
  await snap('setup');
  await p.click('#su-go');
  const vis = async (sel) => { const e = await p.$(sel); return e && (await e.isVisible()) ? e : null; };
  const click = async (sel, nth) => {
    try { const all = await p.$$(sel); const e = all[nth == null ? 0 : Math.min(nth, all.length - 1)]; if (e && await e.isVisible()) { await e.click({ timeout: 2500 }); return true; } } catch (err) { /* il pannello si è già ridisegnato */ }
    return false;
  };
  const stats = { steps: 0, place: 0, play: 0, buy: 0, symbol: 0, other: 0, confirms: 0 };
  const checkOverflow = async (label) => { const o = await p.evaluate(() => { const W = window.innerWidth; const bad = []; document.querySelectorAll('body *').forEach((e) => { if (e.closest('.tblwrap,.tableau,.logbox,.legend,svg,.overlay')) return; const r = e.getBoundingClientRect(); if (r.width && r.right > W + 2) bad.push((e.className && e.className.baseVal === undefined ? e.className : e.tagName) + ' +' + Math.round(r.right - W)); }); return { sw: document.documentElement.scrollWidth - W, bad: bad.slice(0, 4) }; }); if (o.sw > 2 || o.bad.length) overflow.push(`${label}: scroll +${o.sw}px ${o.bad.join(', ')}`); };
  for (; stats.steps < 8000; stats.steps++) {
    if (await vis('.dlg:has-text("Confronto Finale")')) { await snap('fine'); break; }
    if (await click('.dlg [data-y]')) { stats.confirms++; await snap('conferma', false); continue; }
    if (await click('.dlg [data-go]')) { await snap('passa-telefono', false); continue; }
    if (await vis('#a-next')) {
      const k = (((await p.$eval('#g-announce', (e) => e.className).catch(() => '')) || '').match(/k-(\w+)/) || [])[1];
      if (k && !shots['msg-' + k]) { await snap('msg-' + k); await checkOverflow('msg-' + k); }
      await click('#a-next'); continue;
    }
    if (await vis('#g-action [data-sp]')) {
      stats.place++; stats.steps += 0;
      if (!shots.piazza) { await snap('piazza'); await checkOverflow('piazza'); }
      const enabled = await p.$$('#g-action .spacebtn[data-sp]:not(.off)');
      if (enabled.length && rand() > 0.12) { const sp = enabled[Math.floor(rand() * enabled.length)]; await sp.click({ timeout: 2500 }).catch(() => {}); } else await click('#g-action [data-sp="pass"]');
      continue;
    }
    if (await vis('#g-action [data-ok]')) {
      if (await vis('#pv .preview')) { if (!shots.anteprima) { await snap('anteprima'); await checkOverflow('anteprima'); } }
      await click('#g-action [data-ok]'); continue;
    }
    if (await vis('#g-action [data-cell], #g-action .tcell.pick [data-idx]')) {
      stats.play++;
      if (!shots.celle) { await snap('celle'); await checkOverflow('celle'); }
      const n = (await p.$$('#g-action [data-cell], #g-action .tcell.pick [data-idx]')).length;
      await click('#g-action [data-cell], #g-action .tcell.pick [data-idx]', Math.floor(rand() * n)); continue;
    }
    if (await vis('#g-action [data-card]')) { const n = (await p.$$('#g-action [data-card]')).length; await click('#g-action [data-card]', Math.floor(rand() * n)); continue; }
    if (await vis('#g-action [data-sym]')) { stats.symbol++; if (!shots.simbolo) { await snap('simbolo'); await checkOverflow('simbolo'); } const n = (await p.$$('#g-action [data-sym]')).length; await click('#g-action [data-sym]', Math.floor(rand() * n)); continue; }
    if (await vis('#g-action [data-slot]:not([disabled]), #g-action [data-blind]:not([disabled])')) {
      stats.buy++; if (!shots.compra) { await snap('compra'); await checkOverflow('compra'); }
      const n = (await p.$$('#g-action [data-slot]:not([disabled]), #g-action [data-blind]:not([disabled])')).length;
      await click('#g-action [data-slot]:not([disabled]), #g-action [data-blind]:not([disabled])', Math.floor(rand() * n)); continue;
    }
    if (await vis('#g-action [data-i]')) { stats.other++; await snap('altra-scelta'); const n = (await p.$$('#g-action [data-i]')).length; await click('#g-action [data-i]', Math.floor(rand() * n)); continue; }
    await p.waitForTimeout(25);
  }
  await checkOverflow('fine');
  const text = await p.$eval('.dlg', (e) => e.innerText).catch(() => '(nessuna finestra finale)');
  console.log(JSON.stringify({ mode, mobile, players: np, stats, errors, overflow, finale: text.slice(0, 260) }, null, 1));
  await b.close();
  process.exit(errors.length || overflow.length || !/Confronto Finale/.test(text) ? 1 : 0);
})();
