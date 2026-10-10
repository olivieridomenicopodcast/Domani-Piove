#!/usr/bin/env node
/* Genera il kit "stampa e gioca" in stampa/ (tutto dal codice e dal regolamento: si rigenera quando cambiano le regole):
   - carte-fronte-retro.html/.pdf : tutte le carte, 9 per foglio A4 (formato poker 63,5 × 88,9 mm), pagine fronte/retro alternate (retro specchiato)
   - carte-solo-fronti.html/.pdf  : solo i fronti (per bustine con una carta qualunque dietro)
   - plancia-centrale.html/.pdf   : 4 pagine A4 orizzontali (turno e azioni · mercato e mazzi · previsione e bersaglio · eventi e riserve)
   - plance-giocatori.html/.pdf   : 4 plance personali (una per giocatore, A4 orizzontale)
   - plancia-italia.html/.pdf     : la mappa d'Italia di un giocatore in 5 tessere A4 verticali, da accostare (1 copia per giocatore)
   - foglio-punti.html/.pdf, regolamento.pdf, index.html (istruzioni)
   Uso: node tools/build-print.js [--no-pdf]    (i PDF si fanno con Chromium/Playwright) */
'use strict';
const fs = require('fs'), path = require('path');
require('../js/cards.js'); require('../js/data.js'); require('../js/ui/sprites.js');
const FF = globalThis.FF, S = FF.Sprites, R = FF.DEFAULT_RULES;
const root = path.join(__dirname, '..'), out = path.join(root, 'stampa');
fs.mkdirSync(out, { recursive: true });

const CW = 63.5, CH = 88.9, GX = (210 - 3 * CW) / 2, GY = (297 - 3 * CH) / 2;   // griglia 3×3 centrata su A4
const SW = 65, SH = 91;                                                           // posto per una carta: un po' più grande, per posarla senza precisione
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const SEATC = ['#c0392b', '#2c7fb8', '#2e8b57', '#c98a1c'];
const AREA_COL = { nord: '#3d6c9e', centro: '#4f8a52', sud_isole: '#b9792b' };
const symIco = (x, w) => `<span class="ico" style="width:${w || 7}mm;height:${w || 7}mm">${S.symbol(x)}</span>`;

// ───────────────────────── elenco carte ─────────────────────────
const cards = [];   // { f: svg fronte, b: svg retro, g: gruppo }
const G = { reg: 'Carte Regione', prev: 'Carte Previsione', evt: 'Carte Evento', obj: 'Obiettivi Segreti', ref: 'Carte di riferimento' };
FF.REGION_CARDS.forEach((c) => cards.push({ f: S.region(c.id), b: S.back('regione'), g: G.reg }));
FF.PREVISIONI.forEach((p) => cards.push({ f: S.previsione(p), b: S.back('previsione'), g: G.prev }));
FF.EVENT_IDS.forEach((id) => cards.push({ f: S.evento(id), b: S.back('evento'), g: G.evt }));
FF.OBJECTIVES.forEach((o) => cards.push({ f: S.obiettivo(o), b: S.back('obiettivo'), g: G.obj }));
S.RIFERIMENTI.forEach((k) => cards.push({ f: S.riferimento(k), b: S.back('riferimento'), g: G.ref }));
const counts = { reg: FF.REGION_CARDS.length, prev: FF.PREVISIONI.length, evt: FF.EVENT_IDS.length, obj: FF.OBJECTIVES.length, ref: S.RIFERIMENTI.length };
const sheets = [];
for (let i = 0; i < cards.length; i += 9) sheets.push(cards.slice(i, i + 9));
const ns = sheets.length;

function cropMarks() {
  const xs = [0, 1, 2, 3].map((i) => GX + i * CW), ys = [0, 1, 2, 3].map((i) => GY + i * CH), L = 4, GAP = 1;
  let h = '';
  for (const x of xs) h += `<i class="m v" style="left:${x}mm;top:${GY - GAP - L}mm;height:${L}mm"></i><i class="m v" style="left:${x}mm;top:${GY + 3 * CH + GAP}mm;height:${L}mm"></i>`;
  for (const y of ys) h += `<i class="m h" style="top:${y}mm;left:${GX - GAP - L}mm;width:${L}mm"></i><i class="m h" style="top:${y}mm;left:${GX + 3 * CW + GAP}mm;width:${L}mm"></i>`;
  return h;
}
function sheetPage(cs, idx, side) {
  // il retro si stampa ribaltando sul lato lungo: le colonne si specchiano
  const cells = cs.map((c, i) => {
    const r = Math.floor(i / 3), col = i % 3, cc = side === 'b' ? 2 - col : col;
    return `<div class="c" style="left:${GX + cc * CW}mm;top:${GY + r * CH}mm">${side === 'b' ? c.b : c.f}</div>`;
  }).join('');
  const groups = [...new Set(cs.map((c) => c.g))].join(' · ');
  return `<section class="sheet">${cropMarks()}${cells}<div class="foot">Domani Piove · foglio ${idx + 1}/${ns} · ${side === 'b' ? '<b>RETRO</b> (ribalta sul lato lungo)' : '<b>FRONTE</b>'} · ${esc(groups)}</div></section>`;
}
const BTN = '<div class="noprint"><button onclick="window.print()">🖨 Stampa</button></div>';
const wrapHtml = (title, css, body) => `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css}</style></head><body>${BTN}${body}</body></html>`;
const CSS_BASE = `
* { box-sizing: border-box; } html, body { margin: 0; background: #888; font-family: "Trebuchet MS", Verdana, sans-serif; color: #222; }
.noprint { position: fixed; top: 6px; right: 6px; z-index: 9; font: 700 14px sans-serif; } .noprint button { padding: 8px 14px; font: inherit; border: 2px solid #333; border-radius: 8px; background: #ffd54a; cursor: pointer; }
.foot { position: absolute; left: 0; right: 0; bottom: 2.5mm; text-align: center; font-size: 7pt; color: #666; }`;
const CSS_CARDS = `@page { size: A4; margin: 0; }${CSS_BASE}
.sheet { position: relative; width: 210mm; height: 297mm; background: #fff; overflow: hidden; page-break-after: always; break-after: page; margin: 0 auto 6mm; }
.c { position: absolute; width: ${CW}mm; height: ${CH}mm; } .c svg { width: 100%; height: 100%; display: block; }
.m { position: absolute; background: #000; display: block; } .m.v { width: .2mm; margin-left: -.1mm; } .m.h { height: .2mm; margin-top: -.1mm; }
.foot { bottom: 4mm; }
@media print { html, body { background: none; } .sheet { margin: 0; } .noprint { display: none; } }`;
const both = []; sheets.forEach((cs, i) => { both.push(sheetPage(cs, i, 'f')); both.push(sheetPage(cs, i, 'b')); });
fs.writeFileSync(path.join(out, 'carte-fronte-retro.html'), wrapHtml('Domani Piove — carte (fronte/retro)', CSS_CARDS, both.join('')));
fs.writeFileSync(path.join(out, 'carte-solo-fronti.html'), wrapHtml('Domani Piove — carte (solo fronti)', CSS_CARDS, sheets.map((cs, i) => sheetPage(cs, i, 'f')).join('')));

// ───────────────────────── pagine A4 orizzontale: plancia centrale e plance giocatore ─────────────────────────
const CSS_LAND = `@page { size: A4 landscape; margin: 0; }${CSS_BASE}
.land { position: relative; width: 297mm; height: 210mm; background: #fff; overflow: hidden; page-break-after: always; break-after: page; margin: 0 auto 6mm; }
.spot { position: absolute; width: ${SW}mm; height: ${SH}mm; border: .5mm dashed #888; border-radius: 3.5mm; padding: 3mm; text-align: center; background: #fafafa; }
.spot > b { display: block; font-size: 10.5pt; letter-spacing: .3pt; margin-top: 2mm; } .spot > span { display: block; font-size: 8pt; color: #555; margin-top: 1.5mm; line-height: 1.35; } .spot > span b { color: #222; }
.ttl { position: absolute; left: 11mm; top: 5mm; font-size: 15pt; font-weight: 800; letter-spacing: .5pt; } .ttl small { font-weight: 400; font-size: 9pt; color: #666; letter-spacing: 0; margin-left: 3mm; }
.box { position: absolute; border: .45mm solid #555; border-radius: 3mm; background: #fff; padding: 2.5mm 3mm; overflow: hidden; }
.box h3 { margin: 0 0 1.2mm; font-size: 10.5pt; } .box p { margin: 0; font-size: 8.2pt; line-height: 1.3; } .box p b { color: #000; }
.slab { position: absolute; font-size: 8.5pt; font-weight: 700; letter-spacing: 1pt; color: #555; } .slab.n { font-weight: 400; letter-spacing: 0; font-size: 8.3pt; color: #333; }
.circle { position: absolute; border: .5mm dashed #777; border-radius: 50%; background: #fafafa; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: #777; text-align: center; line-height: 1.1; }
.ico { display: inline-block; vertical-align: middle; } .ico svg { width: 100%; height: 100%; }
.tr { position: absolute; width: 19mm; height: 24mm; border: .45mm solid #555; border-radius: 2mm; text-align: center; background: #fff; } .tr b { display: block; font-size: 13pt; margin-top: 2mm; } .tr span { font-size: 8pt; color: #555; } .tr em { display: block; font-style: normal; font-size: 7pt; font-weight: 700; color: #9a2a1a; margin-top: 1mm; }
.tr.ev { background: #fbe5e0; border-color: #9a2a1a; border-width: .7mm; } .tr.fin { background: #e9f3ff; }
.dot { display: inline-block; width: 4.2mm; height: 4.2mm; border-radius: 50%; border: .4mm solid #333; margin-right: 1mm; background: #fff; vertical-align: middle; }
@media print { html, body { background: none; } .land { margin: 0; } .noprint { display: none; } }`;
const spot = (x, y, title, sub, extra) => `<div class="spot" style="left:${x}mm;top:${y}mm"><b>${title}</b><span>${sub || ''}</span>${extra || ''}</div>`;
const land = (inner, foot) => `<section class="land">${inner}<div class="foot">${foot}</div></section>`;
const hour = (r) => (7 + r) + ':00';
const workers = (n) => Array.from({ length: n }, () => '<i class="dot"></i>').join('');

// ── pagina 1: turno e azioni ──
function pagTurno() {
  const nR = R.rounds, tw = 19, gap = 2.2, total = (nR + 1) * tw + nR * gap, x0 = (297 - total) / 2;
  let h = `<div class="ttl">PLANCIA CENTRALE · 1/4 — IL TURNO<small>${nR} round, un'ora ciascuno</small></div>`;
  for (let r = 1; r <= nR; r++) { const ev = R.eventRounds.indexOf(r) >= 0; h += `<div class="tr ${ev ? 'ev' : ''}" style="left:${x0 + (r - 1) * (tw + gap)}mm;top:15mm"><b>${r}</b><span>${hour(r)}</span>${ev ? '<em>EVENTO</em>' : ''}</div>`; }
  h += `<div class="tr fin" style="left:${x0 + nR * (tw + gap)}mm;top:15mm"><b>🏁</b><span>${hour(nR + 1)}</span><em style="color:#245">CONFRONTO</em></div>`;
  h += `<div class="slab n" style="left:${x0}mm;top:41.5mm;width:${total}mm">Muovi il segnalino del round sulla casella corrente. Nei round segnati <b style="color:#9a2a1a">EVENTO</b> (${R.eventRounds.join(', ')}) chi ha la Protezione Civile pesca e legge la Carta Evento, prima di piazzare.</div>`;
  const sp = [
    ['gioca', 'Gioca una carta', 'Metti una Carta Regione dalla mano nella <b>sua casella</b> della tua mappa d\'Italia. Se la carta è <b>nuova</b> (non ne sostituisce una) prendi anche <b>1 simbolo gratis</b>: subito su una carta, o in riserva.'],
    ['compra', 'Compra una carta', 'Prendi una carta dal mercato pagando il suo prezzo in PM, oppure pesca <b>alla cieca</b> dal mazzo per ' + R.blindPrice + ' PM. Il mercato si rimpiazza dal mazzo.'],
    ['simbolo', 'Raccogli un simbolo', 'Prendi un simbolo dal pool e mettilo <b>subito</b> su una tua carta giocata. Un simbolo per carta (il 2° solo se forma una fusione).'],
    ['pm', 'Guadagna 1 PM', '+1 Punto Meteo.'],
    ['sblocca', 'Sblocca lavoratore', `Paga <b>${R.thirdWorkerCost} PM</b>: ottieni il 3° lavoratore, disponibile dal round dopo.`],
  ];
  const bw = 52, bg = 3.5, bx0 = (297 - (5 * bw + 4 * bg)) / 2;
  h += `<div class="slab" style="left:${bx0}mm;top:50mm">SEZIONE 1 — UN LAVORATORE</div>`;
  sp.forEach((s, i) => { h += `<div class="box" style="left:${bx0 + i * (bw + bg)}mm;top:55mm;width:${bw}mm;height:62mm"><h3>${s[1]}</h3><p>${s[2]}</p></div><div class="circle" style="left:${bx0 + i * (bw + bg) + bw / 2 - 8}mm;top:100mm;width:16mm;height:16mm">lavoratore</div>`; });
  h += `<div class="slab" style="left:${bx0}mm;top:122mm">SEZIONE 2 — DUE LAVORATORI (non occupa gli spazi della Sezione 1)</div>`;
  h += `<div class="box" style="left:${bx0}mm;top:127mm;width:84mm;height:52mm"><h3>Doppia azione · 2 lavoratori</h3><p>Fai <b>due azioni diverse</b> tra le cinque della Sezione 1. Se la seconda non è possibile, va persa.</p></div>`;
  h += `<div class="circle" style="left:${bx0 + 17}mm;top:158mm;width:16mm;height:16mm">lav. 1</div><div class="circle" style="left:${bx0 + 41}mm;top:158mm;width:16mm;height:16mm">lav. 2</div>`;
  h += `<div class="box" style="left:${bx0 + 88}mm;top:127mm;width:84mm;height:52mm"><h3>Azione ripetuta · 2 lavoratori</h3><p>Fai <b>la stessa azione due volte</b> (non «Sblocca lavoratore»).</p></div>`;
  h += `<div class="circle" style="left:${bx0 + 105}mm;top:158mm;width:16mm;height:16mm">lav. 1</div><div class="circle" style="left:${bx0 + 129}mm;top:158mm;width:16mm;height:16mm">lav. 2</div>`;
  h += `<div class="circle" style="left:${bx0 + 178}mm;top:127mm;width:46mm;height:46mm;font-size:7.5pt"><span>segnalino<br><b>PROTEZIONE<br>CIVILE</b><br>pesca l'Evento,<br>poi passa<br>a sinistra</span></div>`;
  h += `<div class="circle" style="left:${bx0 + 228}mm;top:127mm;width:46mm;height:46mm;font-size:7.5pt"><span>segnalino<br><b>PRIMO<br>GIOCATORE</b><br>passa a sinistra<br>a ogni round</span></div>`;
  h += `<div class="box" style="left:${bx0}mm;top:184mm;width:${5 * bw + 4 * bg}mm;height:18mm"><p>Si gioca <b>un lavoratore alla volta</b>, a rotazione, a partire dal primo giocatore. Uno spazio occupato è <b>bloccato fino alla fine del round</b>. Chi <b>passa</b> è fuori fino a fine round (e chi non ha spazi utili passa da solo). A fine round i lavoratori tornano a casa e gli spazi si liberano.</p></div>`;
  return land(h, 'Domani Piove · plancia centrale 1/4 · stampa su A4 orizzontale, scala 100%');
}
// ── pagina 2: mercato e mazzi ──
const rowX = (n, i) => { const gap = 4, total = n * SW + (n - 1) * gap; return (297 - total) / 2 + i * (SW + gap); };
function pagMercato() {
  const y1 = 9, y2 = y1 + SH + 6;
  const sp = [];
  for (let i = 0; i < 4; i++) sp.push(spot(rowX(4, i), y1, 'MERCATO ' + (i + 1), 'carta scoperta<br>il prezzo è scritto sulla carta'));
  sp.push(spot(rowX(4, 0), y2, 'MERCATO 5', 'carta scoperta<br>il prezzo è scritto sulla carta'));
  sp.push(spot(rowX(4, 1), y2, 'MAZZO CARTE REGIONE', `coperto<br><b>pesca alla cieca</b>: ${R.blindPrice} PM, qualsiasi carta`));
  sp.push(spot(rowX(4, 2), y2, 'SCARTI CARTE REGIONE', 'scoperti<br>se il mazzo finisce si rimescolano gli scarti'));
  sp.push(spot(rowX(4, 3), y2, 'MAZZO OBIETTIVI SEGRETI', 'coperto<br>a inizio partita ognuno ne pesca <b>2</b> e ne tiene <b>1</b>: l\'altro torna qui, coperto'));
  return land(sp.join(''), 'Domani Piove · plancia centrale 2/4 · mercato e mazzi · stampa su A4 orizzontale, scala 100%');
}
// ── pagina 3: previsione e bersaglio ──
function pagPrevisione() {
  const cw = 88, gap = 6, x0 = (297 - (3 * cw + 2 * gap)) / 2;
  let h = `<div class="ttl">PLANCIA CENTRALE · 3/4 — PREVISIONE E BERSAGLIO<small>una sola previsione, uguale per tutti</small></div>`;
  FF.AREAS.forEach((a, i) => {
    const x = x0 + i * (cw + gap), n = Math.max(...FF.PREVISIONI.filter((p) => p.area === a).map((p) => p.condizioni.length));
    h += `<div style="position:absolute;left:${x}mm;top:15mm;width:${cw}mm;height:9mm;background:${AREA_COL[a]};color:#fff;font-weight:800;text-align:center;line-height:9mm;border-radius:2mm;letter-spacing:1pt">${FF.AREA_NAMES[a].toUpperCase()}</div>`;
    h += spot(x + (cw - SW) / 2, 26, 'CARTA PREVISIONE', 'una per area, scoperta<br>(pescata a inizio partita)');
    h += `<div class="box" style="left:${x}mm;top:120mm;width:${cw}mm;height:${16 + n * 12.5}mm"><h3>BERSAGLIO ATTUALE</h3>${Array.from({ length: n }, (_, k) => `<div style="height:12.5mm;position:relative;font-size:8.5pt;line-height:12mm">condizione <b>${k + 1}</b> (dall'alto della carta)<div class="circle" style="right:0;top:1.5mm;width:10mm;height:10mm"></div></div>`).join('')}</div>`;
  });
  h += `<div class="slab n" style="left:${x0}mm;top:192mm;width:${3 * cw + 2 * gap}mm">Le condizioni (regione, Core/Secondaria, punti) sono quelle scritte sulla carta. Sul cerchio metti il <b>gettone del simbolo richiesto</b>; se un Evento cambia il bersaglio, sostituiscilo con il gettone della <b>fusione</b>. Le condizioni sono 4 per il Nord, 2 per il Centro, 4 per Sud e Isole.</div>`;
  return land(h, 'Domani Piove · plancia centrale 3/4 · previsione e bersaglio · stampa su A4 orizzontale, scala 100%');
}
// ── pagina 4: eventi, pool, PM ──
function pagEventi() {
  let h = '';
  h += spot(rowX(4, 0), 8, 'MAZZO EVENTI', 'coperto<br>si pesca ai round ' + R.eventRounds.join(', '));
  h += spot(rowX(4, 1), 8, 'SCARTI EVENTI', 'scoperti<br>l\'ultimo Evento resta in cima');
  h += `<div class="box" style="left:${rowX(4, 2)}mm;top:8mm;width:${2 * SW + 4}mm;height:${SH}mm"><h3>COME SI USA L'EVENTO</h3><p>La Carta Evento riguarda <b>solo il Fenomeno</b>: modifica il bersaglio sulla plancia della previsione.<br><br>Si attiva solo se la <b>regione nominata</b> è tra quelle della Previsione di quell'area.<br><br><b>Tipo A</b> (condizionale): se il bersaglio di quella regione richiede già il simbolo compatibile, diventa la fusione; altrimenti colpo a vuoto.<br><b>Tipo B</b> (imposto): il bersaglio diventa la fusione, qualunque fosse.<br><b>Neutre / positive</b>: fanno ciò che c'è scritto («ogni giocatore» parte dal primo giocatore).</p></div>`;
  h += `<div class="slab" style="left:11mm;top:104mm">POOL DEI SIMBOLI — ${R.poolPerSymbol} gettoni per simbolo (7 simboli, ${7 * R.poolPerSymbol} gettoni)</div>`;
  FF.SYMBOLS.forEach((x, i) => {
    const cx = 11 + i * 36.5;
    h += `<div class="circle" style="left:${cx}mm;top:111mm;width:33mm;height:33mm"></div><div style="position:absolute;left:${cx + 8.5}mm;top:113mm;width:16mm;height:16mm">${S.symbol(x)}</div><div style="position:absolute;left:${cx}mm;top:131mm;width:33mm;text-align:center;font-weight:700;font-size:9.5pt">${FF.SYMBOL_INFO[x].n}</div>`;
  });
  h += `<div class="slab" style="left:11mm;top:150mm">BANCA DEI PUNTI METEO (PM)</div>`;
  h += `<div class="box" style="left:11mm;top:156mm;width:90mm;height:40mm"><p style="font-size:9pt">Qui si tengono i <b>PM</b> non ancora presi dai giocatori (monete o gettoni). Ognuno parte con <b>${R.startPM} PM</b>; chi non è il primo giocatore ne ha <b>1 in più</b>.</p></div>`;
  h += `<div class="box" style="left:106mm;top:156mm;width:180mm;height:40mm"><h3>Fusioni (2 simboli sulla stessa carta)</h3><p style="font-size:8.5pt">${FF.FUSIONS.map((f) => `${symIco(f.recipe[0], 4.6)}+${symIco(f.recipe[1], 4.6)} <b>${f.name}</b>`).join(' &nbsp;·&nbsp; ')}</p><p style="font-size:8pt;margin-top:1.5mm">Il 2° simbolo si mette solo se forma una fusione; la carta conta solo come la fusione (non più come i simboli base).</p></div>`;
  return land(h, 'Domani Piove · plancia centrale 4/4 · eventi, pool dei simboli e PM · stampa su A4 orizzontale, scala 100%');
}
fs.writeFileSync(path.join(out, 'plancia-centrale.html'), wrapHtml('Domani Piove — plancia centrale', CSS_LAND, [pagTurno(), pagMercato(), pagPrevisione(), pagEventi()].join('')));

// ── plance giocatori ──
function plancia(p) {
  const col = SEATC[p];
  let h = `<div class="ttl" style="color:${col}">PLANCIA DEL GIOCATORE ${p + 1}<small>nome: ______________________________</small></div>`;
  h += spot(12, 16, 'OBIETTIVO SEGRETO', 'coperto, solo tu lo guardi<br>(ne tieni 1 dei 2 pescati)');
  h += `<div class="slab" style="left:85mm;top:16mm">I TUOI LAVORATORI</div>`;
  h += [0, 1].map((i) => `<div class="circle" style="left:${85 + i * 24}mm;top:22mm;width:21mm;height:21mm">lavoratore ${i + 1}</div>`).join('') + `<div class="circle" style="left:133mm;top:22mm;width:21mm;height:21mm;border-style:dotted;font-size:6.5pt">3°<br>${R.thirdWorkerCost} PM<br>dal round dopo</div>`;
  h += `<div class="slab" style="left:85mm;top:49mm">I TUOI PUNTI METEO (PM)</div><div class="box" style="left:85mm;top:55mm;width:72mm;height:27mm"><p style="font-size:8pt;color:#666">PM che hai (monete o gettoni). Partenza: ${R.startPM} PM (+1 se non sei il primo giocatore).</p></div>`;
  h += `<div class="slab" style="left:85mm;top:88mm">RISERVA DI SIMBOLI (massimo ${R.symbolReserve})</div>`;
  h += Array.from({ length: R.symbolReserve }, (_, i) => `<div class="circle" style="left:${85 + i * 24}mm;top:94mm;width:21mm;height:21mm">simbolo</div>`).join('') + `<div style="position:absolute;left:135mm;top:94mm;width:34mm;font-size:7.6pt;line-height:1.3;color:#555">Simboli tenuti da parte: si mettono gratis, senza lavoratore, all'inizio di un tuo turno. Quelli rimasti a fine partita si perdono.</div>`;
  h += `<div class="box" style="left:172mm;top:14mm;width:113mm;height:104mm"><h3>Promemoria del turno</h3><p style="font-size:8pt;line-height:1.32">
    <b>Round ${R.eventRounds.join(', ')}</b>: Evento (lo pesca chi ha la Protezione Civile).<br>
    <b>Piazzamento</b> a rotazione, un lavoratore alla volta; chi passa è fuori.<br>
    <b>Gioca</b> (carta nuova = +1 simbolo gratis) · <b>Compra</b> · <b>Raccogli un simbolo</b> · <b>+1 PM</b> · <b>Sblocca</b> 3° lavoratore (${R.thirdWorkerCost} PM).<br>
    <b>Doppia azione</b> (2 diverse) e <b>Azione ripetuta</b> (la stessa 2 volte): 2 lavoratori.<br>
    <b>Una carta per regione</b>: stessa regione = sostituisce, i simboli restano. Ogni regione ha la sua casella sulla mappa d'Italia.<br>
    <b>Simboli</b>: 1 per carta; il 2° solo se fa una <b>fusione</b>.<br>
    <b>Prezzi</b>: Neutra gratis · Confine 1 · Compensativa 2 · alla cieca ${R.blindPrice}.</p></div>`;
  h += `<div class="box" style="left:12mm;top:122mm;width:273mm;height:80mm"><h3>Punteggio finale (ore ${hour(R.rounds + 1)}) = Accuratezza + Coerenza Geografica + Obiettivo</h3>
    <p style="font-size:8.4pt;line-height:1.4"><b>Accuratezza</b>: somma i punti delle condizioni della previsione soddisfatte (regione giocata <b>e</b> simbolo/fusione richiesti sulla carta): ${R.accuracy.map((a) => `${a.from === a.to ? a.from : a.from + '–' + (a.to >= 15 ? '15' : a.to)} = <b>${a.pts}</b>`).join(' · ')}.<br>
    <b>Bonus di confine</b>: <b>+${R.borderPoints}</b> per ogni carta giocata il cui bonus è soddisfatto (basta aver giocato la regione indicata).<br>
    <b>Pattern</b> (carte vicine = caselle che si toccano a croce): ☀ Sole gruppo 2=${R.pattern.soleScale[2]}, 3=${R.pattern.soleScale[3]}, 4=${R.pattern.soleScale[4]}, 5=${R.pattern.soleScale[5]}, 6+=${R.pattern.soleScale[6]} · ⛈ Temporale gruppo 2=+${R.pattern.temporale2}, 3+=+${R.pattern.temporale3} · 🌧 Pioggia +${R.pattern.pioggia} accanto a un Temporale · ❄ Neve un gruppo di 2-3 carte +${R.pattern.neve} (una volta) · 💨 Vento +${R.pattern.vento} accanto ad almeno 2 simboli diversi · ☁ Nuvolo +${R.pattern.nuvolo} accanto a un simbolo diverso · 🌫 Nebbia +${R.pattern.nebbia} con una carta vicina e nessun'altra Nebbia vicina. Una carta con fusione non fa pattern.<br>
    <b>Obiettivo Segreto</b>: 3, 5 o 8 punti se raggiunto, altrimenti 0. Si rivela alla fine.<br>
    <b>Spareggio</b>: più punti di Accuratezza, poi più punti grezzi, poi più Coerenza, poi più PM.<br>
    Usa il <b>foglio punti</b> per fare i conti.</p></div>`;
  return land(h, `Domani Piove · plancia giocatore ${p + 1} · stampa su A4 orizzontale, scala 100%`);
}
fs.writeFileSync(path.join(out, 'plance-giocatori.html'), wrapHtml('Domani Piove — plance giocatori', CSS_LAND, [0, 1, 2, 3].map(plancia).join('')));

// ───────────────────────── mappa d'Italia: tessere A4 verticali ─────────────────────────
const TILES = [];   // { c, r, name }
const tileNames = { '0,0': 'alto a sinistra (Nord-Ovest)', '1,0': 'alto a destra (Nord-Est)', '0,1': 'centro a sinistra (Tirreno e Sardegna)', '1,1': 'centro a destra (Adriatico e Sud)', '1,2': 'in basso a destra (punta dello Stivale)', '0,2': 'in basso a sinistra' };
for (let r = 0; r < Math.ceil(FF.ITALY_H / 3); r++) for (let c = 0; c < Math.ceil(FF.ITALY_W / 3); c++) {
  const regs = Object.keys(FF.ITALY_MAP).filter((n) => Math.floor(FF.ITALY_MAP[n][0] / 3) === c && Math.floor(FF.ITALY_MAP[n][1] / 3) === r);
  if (regs.length) TILES.push({ c, r, regs });
}
const MW = 3 * SW, MH = 3 * SH, MX = (210 - MW) / 2, MY = (297 - MH) / 2;
const CSS_ITA = `@page { size: A4; margin: 0; }${CSS_BASE}
.sheet { position: relative; width: 210mm; height: 297mm; background: #fff; overflow: hidden; page-break-after: always; break-after: page; margin: 0 auto 6mm; }
.cell { position: absolute; width: ${SW}mm; height: ${SH}mm; border: .5mm dashed #999; border-radius: 3mm; text-align: center; overflow: hidden; }
.cell.void { border: none; background: repeating-linear-gradient(45deg, #fff, #fff 2mm, #f4f4f4 2mm, #f4f4f4 4mm); }
.cell .hd { height: 13mm; color: #fff; font-weight: 800; font-size: 12pt; line-height: 13mm; letter-spacing: .4pt; } .cell .sg { font-size: 30pt; font-weight: 800; margin-top: 18mm; color: #999; } .cell .ar { font-size: 8pt; color: #888; letter-spacing: 1pt; }
.m { position: absolute; background: #000; display: block; } .m.v { width: .2mm; margin-left: -.1mm; } .m.h { height: .2mm; margin-top: -.1mm; }
.ttl { position: absolute; left: 0; right: 0; top: 4mm; text-align: center; font-size: 9pt; color: #444; }
@media print { html, body { background: none; } .sheet { margin: 0; } .noprint { display: none; } }`;
function tilePage(t, i) {
  let h = '';
  for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) {
    const x = t.c * 3 + dx, y = t.r * 3 + dy, name = Object.keys(FF.ITALY_MAP).find((n) => FF.ITALY_MAP[n][0] === x && FF.ITALY_MAP[n][1] === y);
    const pos = `left:${MX + dx * SW}mm;top:${MY + dy * SH}mm`;
    if (name) { const a = FF.REGION_AREA[name]; h += `<div class="cell" style="${pos}"><div class="hd" style="background:${AREA_COL[a]}">${esc(name)}</div><div class="sg">${FF.SIGLA ? FF.SIGLA[name] : ''}</div><div class="ar">${esc(FF.AREA_NAMES[a].toUpperCase())}</div></div>`; }
    else h += `<div class="cell void" style="${pos}"></div>`;
  }
  const L = 4, GP = 1; let marks = '';
  for (const k of [0, 1, 2, 3]) { const x = MX + k * SW, y = MY + k * SH;
    marks += `<i class="m v" style="left:${x}mm;top:${MY - GP - L}mm;height:${L}mm"></i><i class="m v" style="left:${x}mm;top:${MY + MH + GP}mm;height:${L}mm"></i><i class="m h" style="top:${y}mm;left:${MX - GP - L}mm;width:${L}mm"></i><i class="m h" style="top:${y}mm;left:${MX + MW + GP}mm;width:${L}mm"></i>`; }
  const where = tileNames[t.c + ',' + t.r];
  return `<section class="sheet">${marks}<div class="ttl"><b>MAPPA D'ITALIA</b> · tessera ${i + 1}/${TILES.length}: <b>${where}</b></div>${h}<div class="foot">Domani Piove · 1 copia per giocatore · ritaglia lungo i segni agli angoli e accosta le tessere (vedi stampa/index.html) · le caselle a righe sono vuote</div></section>`;
}
fs.writeFileSync(path.join(out, 'plancia-italia.html'), wrapHtml("Domani Piove — mappa d'Italia (tessere)", CSS_ITA, TILES.map(tilePage).join('')));

// ───────────────────────── foglio punti (A4 verticale) con esempio compilato ─────────────────────────
const accPts = (raw) => (R.accuracy.find((a) => raw >= a.from && raw <= a.to) || R.accuracy[R.accuracy.length - 1]).pts;
const EX = { raw: 5, border: 3, pat: { sole: 0, temporale: R.pattern.temporale2, pioggia: R.pattern.pioggia, neve: 0, vento: 0, nuvolo: 0, nebbia: R.pattern.nebbia }, obj: 3 };
EX.acc = accPts(EX.raw); EX.bor = EX.border * R.borderPoints; EX.patTot = Object.values(EX.pat).reduce((a, b) => a + b, 0); EX.tot = EX.acc + EX.bor + EX.patTot + EX.obj;
const PAT_ROWS = [['sole', 'Sole', 'gruppo connesso: 2=' + R.pattern.soleScale[2] + ' · 3=' + R.pattern.soleScale[3] + ' · 4=' + R.pattern.soleScale[4] + ' · 5=' + R.pattern.soleScale[5] + ' · 6+=' + R.pattern.soleScale[6]], ['temporale', 'Temporale', 'per gruppo: 2=+' + R.pattern.temporale2 + ' · 3 o più=+' + R.pattern.temporale3], ['pioggia', 'Pioggia', '+' + R.pattern.pioggia + ' per ogni Pioggia accanto a un Temporale'], ['neve', 'Neve', '+' + R.pattern.neve + ' una volta: un gruppo di 2-3 carte'], ['vento', 'Vento', '+' + R.pattern.vento + ' per ogni Vento accanto ad almeno 2 simboli diversi'], ['nuvolo', 'Nuvolo', '+' + R.pattern.nuvolo + ' per ogni Nuvolo accanto a un simbolo diverso'], ['nebbia', 'Nebbia', '+' + R.pattern.nebbia + ' per ogni Nebbia con una carta vicina e nessun\'altra Nebbia vicina']];
const cellsN = (n, v) => Array.from({ length: n }, () => `<td class="in">${v == null ? '' : v}</td>`).join('');
const foglio = `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Domani Piove — foglio punti</title><style>
@page { size: A4; margin: 10mm; } * { box-sizing: border-box; } body { font: 9.5pt/1.3 "Trebuchet MS", Verdana, sans-serif; color: #222; margin: 0; }
h1 { margin: 0 0 1mm; font-size: 17pt; } p { margin: 1mm 0; } table { border-collapse: collapse; width: 100%; margin-top: 3mm; } th, td { border: .3mm solid #666; padding: 1.3mm 2mm; vertical-align: middle; }
th { background: #e9eef5; font-size: 9pt; } td.in { width: 20mm; height: 8mm; text-align: center; } td.ex { background: #fff6d6; width: 22mm; text-align: center; font-weight: 700; } td small { color: #555; display: block; font-size: 7.6pt; line-height: 1.2; }
.ico { display: inline-block; vertical-align: middle; } .ico svg { width: 100%; height: 100%; display: block; }
tr.tot td { font-weight: 800; background: #eef6ee; font-size: 11pt; } .note { font-size: 8.4pt; color: #444; } .sec td { background: #f3f3f3; font-weight: 700; }
.noprint { position: fixed; top: 6px; right: 6px; font: 700 14px sans-serif; } .noprint button { padding: 8px 14px; border: 2px solid #333; border-radius: 8px; background: #ffd54a; cursor: pointer; font: inherit; } @media print { .noprint { display: none; } }
</style></head><body>${BTN}
<h1>Domani Piove — foglio punti</h1><p class="note">Si compila alle ${hour(R.rounds + 1)}, al Confronto Finale. <b>Totale = Accuratezza + Coerenza Geografica (confine + pattern) + Obiettivo Segreto.</b> La colonna gialla è un esempio già compilato.</p>
<table><tr><th style="width:62mm">Voce</th><th>Giocatore 1</th><th>Giocatore 2</th><th>Giocatore 3</th><th>Giocatore 4</th><th>Esempio</th></tr>
<tr><td>Nome</td>${cellsN(4)}<td class="ex">Marta</td></tr>
<tr class="sec"><td colspan="6">1 · ACCURATEZZA — condizioni della previsione (bersaglio attuale, dopo gli Eventi)</td></tr>
<tr><td>Punti grezzi<small>somma dei punti delle condizioni soddisfatte (0–15)</small></td>${cellsN(4)}<td class="ex">${EX.raw}</td></tr>
<tr><td>Punti Accuratezza<small>${R.accuracy.map((a) => `${a.from === a.to ? a.from : a.from + '–' + (a.to >= 15 ? '15' : a.to)} → ${a.pts}`).join(' · ')}</small></td>${cellsN(4)}<td class="ex">${EX.acc}</td></tr>
<tr class="sec"><td colspan="6">2 · COERENZA GEOGRAFICA</td></tr>
<tr><td>Bonus di confine<small>n. carte con bonus soddisfatto × ${R.borderPoints}</small></td>${cellsN(4)}<td class="ex">${EX.border} × ${R.borderPoints} = ${EX.bor}</td></tr>
${PAT_ROWS.map(([k, n, d]) => `<tr><td>${symIco(k, 5)} ${n}<small>${d}</small></td>${cellsN(4)}<td class="ex">${EX.pat[k]}</td></tr>`).join('')}
<tr><td><b>Coerenza</b> (confine + pattern)</td>${cellsN(4)}<td class="ex">${EX.bor + EX.patTot}</td></tr>
<tr class="sec"><td colspan="6">3 · OBIETTIVO SEGRETO</td></tr>
<tr><td>Obiettivo raggiunto?<small>3, 5 o 8 punti se raggiunto, altrimenti 0</small></td>${cellsN(4)}<td class="ex">${EX.obj}</td></tr>
<tr class="tot"><td>TOTALE</td>${cellsN(4)}<td class="ex">${EX.tot}</td></tr>
<tr><td>PM rimasti<small>solo per lo spareggio</small></td>${cellsN(4)}<td class="ex">2</td></tr></table>
<p class="note"><b>Esempio (Marta):</b> 5 punti grezzi → ${EX.acc}; ${EX.border} bonus di confine → ${EX.bor}; pattern: Temporale in un gruppo di 2 = ${EX.pat.temporale}, una Pioggia accanto a un Temporale = ${EX.pat.pioggia}, una Nebbia con una carta vicina = ${EX.pat.nebbia}; obiettivo «Tutto lo Stivale» raggiunto = ${EX.obj}. Totale ${EX.acc} + ${EX.bor} + ${EX.patTot} + ${EX.obj} = <b>${EX.tot}</b>.</p>
<p class="note"><b>Pareggio:</b> vince chi ha più punti di Accuratezza; poi più punti grezzi; poi più Coerenza; poi più PM; se ancora pari, pari merito. Una carta con fusione non partecipa ai pattern; «carte vicine» = caselle che si toccano a croce sulla mappa d'Italia.</p>
</body></html>`;
fs.writeFileSync(path.join(out, 'foglio-punti.html'), foglio);

// ───────────────────────── pagina di istruzioni ─────────────────────────
const nTiles = TILES.length;
const pagesCards = ns * 2;
const index = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Domani Piove — stampa e gioca</title><style>
body{font:16px/1.5 "Trebuchet MS",Verdana,sans-serif;max-width:860px;margin:0 auto;padding:16px;color:#222;background:#f7f4ea} h1{margin:.2em 0} h2{border-bottom:2px solid #c9b98b;margin-top:1.6em} a.dl{display:inline-block;margin:.2em .3em .2em 0;padding:.45em .8em;border-radius:8px;background:#24445f;color:#fff;text-decoration:none;font-weight:700} a.dl.alt{background:#7a6a3a}
table{border-collapse:collapse;width:100%} td,th{border:1px solid #bbb;padding:.35em .6em;text-align:left;vertical-align:top} th{background:#efe6c8} .note{background:#fff3c4;border-left:5px solid #d4a017;padding:.5em .8em;border-radius:4px} code{background:#eee;padding:0 .3em} .asm{display:inline-grid;grid-template-columns:repeat(2,64px);gap:3px;margin:.4em 0} .asm div{height:78px;border:2px solid #555;border-radius:4px;background:#fff;font-size:12px;text-align:center;padding-top:26px} .asm .no{border-style:dashed;color:#aaa;background:#f1f1f1}
</style></head><body>
<p><a href="../index.html">← Torna all'app</a></p>
<h1>🖨 Stampa e gioca — Domani Piove</h1>
<p>Tutto quello che serve per giocare con carta e forbici. I file si rigenerano dal codice (<code>node tools/build-print.js</code>) quando cambiano le regole.</p>
<div class="note"><b>Impostazioni di stampa (valgono per tutti i PDF):</b> carta <b>A4</b>, scala <b>100% (non «adatta alla pagina»)</b>, margini «nessuno/predefiniti», stampa a colori. Per le carte fronte/retro: <b>fronte-retro sul lato lungo</b> (flip on long edge). Non so come la tua stampante allinei i due lati: fai prima una prova sul primo foglio.</div>
<h2>1 · Le carte (${cards.length} carte, ${ns} fogli, 9 per foglio)</h2>
<p><a class="dl" href="carte-fronte-retro.pdf">⬇ Carte fronte/retro (${pagesCards} facciate)</a> <a class="dl alt" href="carte-solo-fronti.pdf">⬇ Carte solo fronti (${ns} pagine)</a></p>
<table><tr><th>Mazzo</th><th>Carte</th><th>Dorso</th><th>Come si usa</th></tr>
<tr><td>Carte Regione</td><td>${counts.reg}</td><td>verde</td><td>si mescolano; mercato di ${R.marketSize} scoperte + mazzo coperto; ognuno parte con ${R.startCards} in mano</td></tr>
<tr><td>Carte Previsione</td><td>${counts.prev}</td><td>blu</td><td>12 per area (Nord, Centro, Sud e Isole): a inizio partita si pesca 1 carta per area, scoperta sulla plancia</td></tr>
<tr><td>Carte Evento</td><td>${counts.evt}</td><td>rosso</td><td>si mescolano; si pesca ai round ${R.eventRounds.join(', ')}</td></tr>
<tr><td>Obiettivi Segreti</td><td>${counts.obj}</td><td>viola</td><td>ognuno ne pesca 2 e ne tiene 1 (segreto)</td></tr>
<tr><td>Carte di riferimento</td><td>${counts.ref}</td><td>grigio</td><td><b>non fanno parte dei mazzi</b>: si tengono scoperte a bordo tavolo (Fusioni, Pattern, Punteggio, Round, segnalino Protezione Civile, segnalino Primo giocatore, Eventi)</td></tr></table>
<p><b>Taglio:</b> ritaglia lungo i segni neri nei margini (3 colonne × 3 righe). Il retro è già specchiato per la stampa fronte/retro sul lato lungo. Con la versione «solo fronti» metti ogni carta in una bustina con una carta qualunque dietro (i mazzi si distinguono dal fronte: stesso ruolo del dorso).</p>
<p>I segnalini (Protezione Civile e Primo giocatore) sono carte di riferimento: puoi usarle come segnalino (passandole di mano) oppure usare un oggetto qualsiasi.</p>
<h2>2 · Plancia centrale (4 pagine A4 orizzontali)</h2>
<p><a class="dl" href="plancia-centrale.pdf">⬇ Plancia centrale</a> stampala una volta sola e mettila al centro. Le pagine: 1 turno e azioni · 2 mercato e mazzi · 3 previsione e bersaglio · 4 eventi, pool dei simboli e PM. I posti per le carte sono un po' più grandi (65 × 91 mm) della carta, per posarla senza precisione. Puoi accostarle come vuoi.</p>
<h2>3 · Plance dei giocatori (1 pagina A4 orizzontale a testa)</h2>
<p><a class="dl" href="plance-giocatori.pdf">⬇ Plance giocatori (4 pagine)</a> stampa solo quante ne servono (una per giocatore, da 2 a 4). Contengono i posti per Obiettivo Segreto, lavoratori, PM e riserva di simboli, il promemoria del turno e il riepilogo del punteggio.</p>
<h2>4 · Mappa d'Italia (${nTiles} tessere A4 verticali per giocatore)</h2>
<p><a class="dl" href="plancia-italia.pdf">⬇ Mappa d'Italia (${nTiles} tessere)</a> <b>stampa una copia per giocatore.</b> Ogni regione ha la sua casella fissa; le carte si posano nella casella con il suo nome. Ritaglia ogni tessera lungo i segni agli angoli (tutto il margine bianco va via) e accosta le tessere bordo a bordo come qui (le caselle sono 65 × 91 mm):</p>
<div class="asm"><div>1<br>Nord-Ovest</div><div>2<br>Nord-Est</div><div>3<br>Tirreno</div><div>4<br>Adriatico/Sud</div><div class="no">(vuoto)</div><div>5<br>Calabria e Sicilia</div></div>
<p>Due regioni sono <b>vicine</b> se le loro caselle si toccano a croce (non in diagonale): vale per i pattern. Il bonus di confine non richiede contatto. Una mappa assemblata è larga circa 39 cm e alta circa 55 cm: serve un tavolo grande, oppure un cartoncino su cui fissare le tessere.</p>
<h2>5 · Foglio punti e regolamento</h2>
<p><a class="dl" href="foglio-punti.pdf">⬇ Foglio punti (con esempio)</a> <a class="dl" href="regolamento.pdf">⬇ Regolamento</a></p>
<h2>6 · Preparazione del tavolo</h2>
<ol><li>Plancia centrale al centro; mappa d'Italia e plancia davanti a ogni giocatore.</li>
<li>Mescola i mazzi Regione, Evento e Obiettivi. Metti ${R.marketSize} Carte Regione scoperte sul mercato (3+2 posti, a piacere).</li>
<li>Dividi le Previsioni per area, pesca <b>1 per area</b> e mettile scoperte; sul cerchio di ogni condizione metti il gettone del simbolo richiesto.</li>
<li>Ognuno pesca ${R.startCards} Carte Regione e 2 Obiettivi (ne tiene 1); ${R.startPM} PM (3 se non sei il primo giocatore); ${R.workers} lavoratori.</li>
<li>Primo giocatore a sorte: riceve il segnalino Protezione Civile. Segnalino del round sul round 1 (ore 8:00).</li></ol>
<h2>7 · Segnalini fisici che servono (non sono stampati)</h2>
<table><tr><th>Cosa</th><th>Quanti</th><th>Suggerimento</th></tr>
<tr><td>Lavoratori</td><td>${R.workers + 1} per giocatore (il 3° si sblocca): fino a 12</td><td>pedine, bottoni, tappi di 4 colori</td></tr>
<tr><td>Punti Meteo (PM)</td><td>circa 40-50</td><td>monete, fagioli, perline</td></tr>
<tr><td>Simboli meteo</td><td>${7 * R.poolPerSymbol} (${R.poolPerSymbol} per ciascuno dei 7 simboli)</td><td>7 colori di bottoni/perline, oppure carte-segnalino fatte a mano; servono anche per il bersaglio e la riserva</td></tr>
<tr><td>Segnalino del round</td><td>1</td><td>una pedina qualsiasi</td></tr>
<tr><td>Segnalino Protezione Civile e Primo giocatore</td><td>2 (c'è anche la carta di riferimento)</td><td>due oggetti diversi</td></tr></table>
<h2>Cosa è stato verificato e cosa no</h2>
<p class="note">Il kit è generato da codice; i conteggi e i formati sono controllati da test automatici e ho guardato le pagine dei PDF convertite in immagini. <b>Non</b> ho potuto provare la stampa su carta (allineamento fronte/retro della tua stampante, tolleranze di taglio, leggibilità del testo piccolo sulle carte).</p>
</body></html>`;
fs.writeFileSync(path.join(out, 'index.html'), index);

console.log(`${cards.length} carte in ${ns} fogli (${ns * 2} facciate fronte/retro) · ${nTiles} tessere mappa · plancia centrale 4 pagine · 4 plance giocatore`);

// ───────────────────────── PDF ─────────────────────────
if (process.argv.includes('--no-pdf')) process.exit(0);
(async () => {
  const { chromium } = require('playwright');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const pdf = async (html, file, opts) => {
    const p = await b.newPage();
    await p.goto('file://' + path.join(out, html)); await p.waitForTimeout(200);
    await p.pdf(Object.assign({ path: path.join(out, file), printBackground: true, preferCSSPageSize: true }, opts || {}));
    await p.close();
  };
  await pdf('carte-fronte-retro.html', 'carte-fronte-retro.pdf');
  await pdf('carte-solo-fronti.html', 'carte-solo-fronti.pdf');
  await pdf('plancia-centrale.html', 'plancia-centrale.pdf');
  await pdf('plance-giocatori.html', 'plance-giocatori.pdf');
  await pdf('plancia-italia.html', 'plancia-italia.pdf');
  await pdf('foglio-punti.html', 'foglio-punti.pdf');
  // regolamento: testo reso dall'app stessa
  { const p = await b.newPage(); await p.goto('file://' + path.join(root, 'index.html')); await p.waitForTimeout(500);
    const html = await p.evaluate(() => FF.UI.md(FF.RULEBOOK_MD));
    await p.setContent(`<!doctype html><meta charset="utf-8"><style>@page{size:A4;margin:14mm}body{font:10pt/1.45 "Trebuchet MS",Verdana,sans-serif;color:#222}h1{font-size:19pt}h2{font-size:13.5pt;border-bottom:1.5px solid #999;margin-top:16px}h3{font-size:11pt}table{border-collapse:collapse;width:100%;margin:6px 0}td,th{border:1px solid #999;padding:3px 6px;font-size:9pt;vertical-align:top}th{background:#eee}pre{background:#f3f3f3;padding:6px;font-size:8.5pt;line-height:1.25}</style>${html}`);
    await p.pdf({ path: path.join(out, 'regolamento.pdf'), printBackground: true, preferCSSPageSize: true }); await p.close(); }
  await b.close();
  console.log('PDF scritti in stampa/');
})().catch((e) => { console.error(e); process.exit(1); });
