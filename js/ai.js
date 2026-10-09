/* DOMANI PIOVE — AI.
   ATTENZIONE: questa è una versione PROVVISORIA (tappa 3): sceglie a caso tra le mosse legali, solo per poter provare
   l'interfaccia. Le AI vere (facile < media < difficile, con informazione nascosta rispettata) arrivano nella tappa 4. */
(function (root) {
  'use strict';
  const FF = (root.FF = root.FF || {});
  FF.AI_LEVELS = { easy: 'Facile', medium: 'Media', hard: 'Difficile' };
  FF.RandomBot = function (seed) {
    const rng = FF.makeRng(seed);
    return { level: 'random', decide(game, dec) { return Math.floor(rng() * dec.options.length); } };
  };
  FF.AI = { create(level, seed) { const b = FF.RandomBot(seed); b.level = level; return b; } };
})(typeof window !== 'undefined' ? window : globalThis);
