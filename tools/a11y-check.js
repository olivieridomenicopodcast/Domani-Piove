#!/usr/bin/env node
/* Controlli di accessibilità nel browser (Playwright): nomi accessibili, id duplicati, lingua, scorrimento orizzontale a 320px,
   dimensione dei bersagli di tocco, focus visibile e una mossa giocata SOLO con la tastiera.
   Uso: NODE_PATH=/opt/node-tools/node_modules node tools/a11y-check.js [--url http://localhost:8123/] */
'use strict';
const { chromium } = require('playwright');
const args = process.argv.slice(2), url = args.includes('--url') ? args[args.indexOf('--url') + 1] : 'http://localhost:8123/';
const audit = () => {
  const name = (e) => {
    const lab = e.id && document.querySelector(`label[for="${e.id}"]`);
    return (e.getAttribute('aria-label') || (lab && lab.textContent) || (e.closest('label') && e.closest('label').textContent) || e.getAttribute('title') || (e.querySelector('svg title') && e.querySelector('svg title').textContent) || e.textContent || e.getAttribute('placeholder') || '').trim();
  };
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('.hidden'); };
  const out = { noName: [], dupIds: [], small: [], overflow: [] };
  document.querySelectorAll('button, a[href], input, select, textarea, summary').forEach((e) => { if (vis(e) && !name(e)) out.noName.push(e.tagName + '#' + e.id + '.' + String(e.className).slice(0, 40)); });
  const ids = {}; document.querySelectorAll('[id]').forEach((e) => { ids[e.id] = (ids[e.id] || 0) + 1; }); Object.keys(ids).forEach((k) => { if (ids[k] > 1) out.dupIds.push(k); });
  document.querySelectorAll('button, select, input[type=text], input[type=number], summary').forEach((e) => { if (!vis(e) || e.closest('svg')) return; const r = e.getBoundingClientRect(); if (Math.min(r.width, r.height) < 40) out.small.push(`${e.tagName}.${String(e.className).slice(0, 30)} ${Math.round(r.width)}x${Math.round(r.height)} "${name(e).slice(0, 20)}"`); });
  const W = window.innerWidth; document.querySelectorAll('body *').forEach((e) => { if (e.closest('.tblwrap,.tableau,.logbox,.legend,svg,.overlay,.timeline')) return; const r = e.getBoundingClientRect(); if (r.width && r.right > W + 2) out.overflow.push(String(e.className).slice(0, 30) + ' +' + Math.round(r.right - W)); });
  out.lang = document.documentElement.lang; out.viewport = !!document.querySelector('meta[name=viewport]'); out.title = document.title; out.scrollX = document.documentElement.scrollWidth - W;
  return out;
};
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const report = [], fail = [];
  for (const vp of [{ w: 320, h: 640, touch: true }, { w: 390, h: 844, touch: true }, { w: 1366, h: 900, touch: false }]) {
    const p = await b.newPage({ viewport: { width: vp.w, height: vp.h }, hasTouch: vp.touch, isMobile: vp.touch });
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    const check = async (label) => { const r = await p.evaluate(audit); report.push({ vp: vp.w, label, ...r }); if (r.noName.length || r.dupIds.length || r.overflow.length || r.scrollX > 2 || !r.lang || !r.viewport || (vp.touch && r.small.length)) fail.push(`${vp.w}px ${label}: ${JSON.stringify({ noName: r.noName, dup: r.dupIds, over: r.overflow.slice(0, 3), sx: r.scrollX, lang: r.lang, small: vp.touch ? r.small.slice(0, 4) : [] })}`); };
    await p.goto(url); await check('home');
    await p.click('#btn-rules'); await p.waitForSelector('.rules h1'); await check('regole'); await p.click('#ru-back');
    await p.click('.mode[data-mode=ai]'); await check('setup'); await p.click('#su-go');
    for (let i = 0; i < 40 && !(await p.$('#g-action .spacebtn')); i++) { await p.click('#a-next', { timeout: 400 }).catch(() => {}); }
    await check('gioco: piazzamento');
    if (!vp.touch) { // una mossa solo con la tastiera: Tab fino a un bottone "Guadagna 1 PM" e Invio
      let ok = false; const focusOnPanel = await p.evaluate(() => document.activeElement && document.activeElement.id === 'g-action');
      if (!focusOnPanel) fail.push('il focus non parte dal pannello della mossa');
      for (let i = 0; i < 30 && !ok; i++) { await p.keyboard.press('Tab'); ok = await p.evaluate(() => { const a = document.activeElement; return !!(a && a.matches && a.matches('.spacebtn[data-sp="pm"]')); }); }
      const outline = ok ? await p.evaluate(() => { const c = getComputedStyle(document.activeElement); return parseFloat(c.outlineWidth) > 0 && c.outlineStyle !== 'none'; }) : false;
      if (ok) { await p.keyboard.press('Enter'); await p.waitForTimeout(150); }
      const moved = await p.evaluate(() => /Guadagna 1 PM/.test(document.querySelector('#g-announce').innerText) || /guadagna 1 PM/i.test(document.querySelector('#g-log').innerText));
      report.push({ vp: vp.w, label: 'tastiera', raggiuntoConTab: ok, focusVisibile: outline, mossaEseguita: moved });
      if (!ok || !outline || !moved) fail.push(`tastiera: raggiunto=${ok} focusVisibile=${outline} mossa=${moved}`);
      // Esc chiude una finestra
      await p.click('#g-menu'); await p.waitForSelector('.dlg'); const focusIn = await p.evaluate(() => !!document.activeElement.closest('.dlg')); await p.keyboard.press('Escape'); const closed = !(await p.$('.dlg'));
      report.push({ vp: vp.w, label: 'finestra', focusDentro: focusIn, escChiude: closed }); if (!focusIn || !closed) fail.push(`finestra: focusDentro=${focusIn} escChiude=${closed}`);
    }
    await p.goto(url); await p.click('.mode[data-mode=sim]'); await p.waitForSelector('#sm-run'); await check('simulatore');
    if (errs.length) fail.push('errori pagina: ' + errs.join('; '));
    await p.close();
  }
  console.log(JSON.stringify(report.map((r) => ({ vp: r.vp, label: r.label, noName: r.noName, dupIds: r.dupIds, overflow: (r.overflow || []).length, scrollX: r.scrollX, piccoli: (r.small || []).length, ...(r.raggiuntoConTab !== undefined ? { tab: r.raggiuntoConTab, focus: r.focusVisibile, mossa: r.mossaEseguita } : {}), ...(r.escChiude !== undefined ? { focusDentro: r.focusDentro, esc: r.escChiude } : {}) })), null, 0));
  console.log(fail.length ? 'PROBLEMI:\n' + fail.join('\n') : 'OK: nessun problema rilevato');
  await b.close(); process.exit(fail.length ? 1 : 0);
})();
