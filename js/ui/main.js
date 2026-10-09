/* DOMANI PIOVE — avvio, navigazione, ripresa partita, service worker */
(function (root) {
  'use strict';
  const FF = (root.FF = root.FF || {});
  const UI = FF.UI;
  const { $, esc } = UI;

  UI.go = function (where) {
    if (UI.session) { UI.session.dispose(); UI.session = null; }
    $('#modal-root').innerHTML = '';
    if (where === 'home') { UI.screen('home'); renderResume(); }
    else if (where === 'sim') UI.openSim();
    else if (where === 'rules') UI.openRules();
    else UI.openSetup(where);
  };
  UI.backToGame = function () { UI.screen('game'); };

  function renderResume() {
    const box = $('#resume-box');
    const sv = UI.store.get('save', null);
    if (!sv || !sv.cfg) { box.innerHTML = ''; return; }
    const names = sv.cfg.players.map((p) => esc(p.name)).join(' · ');
    box.innerHTML = `<div class="card resume"><h2>💾 Partita in corso</h2><p class="small muted">${names} · round ${sv.round || 1} · seed ${esc(sv.cfg.seed)}</p>
      <div class="btn-row"><button class="btn primary" id="rs-go">▶ Riprendi</button><button class="btn danger" id="rs-del">Elimina</button></div></div>`;
    $('#rs-go').onclick = () => UI.startSession(Object.assign({}, sv.cfg, { speed: sv.cfg.speed || 'step' }), sv.history);
    $('#rs-del').onclick = () => { UI.store.del('save'); renderResume(); };
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('#logo-ico').innerHTML = FF.Sprites.logo();
    $('#hero-cards').innerHTML = [FF.Sprites.region(FF.REGION_CARDS.find((c) => c.regione === 'Veneto' && c.variante === 'confine'), 'h1'), FF.Sprites.previsione(FF.PREVISIONI[0], 'h2'), FF.Sprites.evento(29, 'h3'), FF.Sprites.region(FF.REGION_CARDS.find((c) => c.regione === 'Sicilia' && c.variante === 'compensativa'), 'h4')].join('');
    $('#hero-syms').innerHTML = FF.SYMBOLS.map((s) => FF.Sprites.symbol(s)).join('');
    $('#btn-home').onclick = () => UI.go('home');
    $('#btn-rules').onclick = () => UI.go('rules');
    document.querySelectorAll('.mode').forEach((b) => b.addEventListener('click', () => UI.go(b.dataset.mode)));
    renderResume();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  });
})(typeof window !== 'undefined' ? window : globalThis);
