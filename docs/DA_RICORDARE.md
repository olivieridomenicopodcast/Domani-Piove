# Da ricordare — misure, note di bilanciamento, cose da riguardare al playtest

*Da NON decidere ora: li riprendiamo col simulatore e coi playtest. Ricordarli a Niky a ogni tappa importante.*

## Cosa fanno oggi i giocatori a fine partita (base per scrivere gli Obiettivi Segreti)
*600 giocatori-partita, AI Difficile contro Difficile a 2 giocatori, regole definitive. L'AI NON cerca gli obiettivi: sono le frequenze «per caso» di oggi. Chi mira a un obiettivo lo raggiunge più spesso.*
| Cosa | Media | 10% / 50% / 90% |
|---|---|---|
| Carte Regione sul tavolo | 4,8 | 4 / 5 / 6 (max 7) |
| Regioni giocate: Nord · Centro · Sud e Isole | 2,0 · 1,1 · 1,7 | Nord 1/2/3 · Centro 0/1/2 · Sud 0/2/3 |
| Simboli sul tavolo (totale) · tipi diversi | 9,0 · 4,5 | tipi diversi 4/4/5 (max 7) |
| Bonus di confine attivi | 1,6 | 0 / 2 / 3 |
| Punti pattern · Accuratezza grezza · totale | 13,7 · 4,7 · 24,0 | totale 18 / 24 / 31 |
| PM e carte rimasti a fine partita | 1,1 · 1,2 | |
- **Chi raggiunge almeno:** 3 regioni del Nord 31% · 4 del Nord 9% · 2 del Centro 33% · 3 del Centro 7% · 3 del Sud 22% · tutte e 3 le aree 56% · **entrambe le isole 3%** · 5 tipi di simbolo 47% · 6 tipi 7% · **almeno 1 fusione 2%** · 3° lavoratore 6% · 3 bonus di confine 16% · 3 PM a fine partita 11%.
- **Lettura:** le fusioni quasi non si fanno oggi (una fusione toglie la carta dalla previsione, salvo che il bersaglio chieda proprio quella fusione): un obiettivo sulle fusioni cambierebbe molto il modo di giocare. Le due isole insieme e la «rete estrema» a 3 regioni sono rarissime. Con ≈ 4,8 carte a testa gli obiettivi di territorio devono chiedere poche regioni.

## Misure della tappa 5 (con le regole NUOVE: scala di Accuratezza 1-2/3-4/5-6/7+ e segnalino «Protezione Civile») — da discutere con Niky
*Tutte con intervallo di confidenza al 95%. Dove non indicato, AI Difficile contro Difficile, posti alternati.*
- **Fedeltà contro pattern (ora in equilibrio):** solo-fedeltà batte solo-pattern **56,3%** [50,7–61,8] (300 partite, 2 giocatori) e **36,0%** [28,8–43,9] a 3 giocatori (atteso 33,3%); l'AI normale batte solo-pattern 88,0% e solo-fedeltà 92,7%. Accuratezza grezza media dell'AI normale 4,6 su 15, Coerenza 15,3, totale 24,0.
- **Prove estreme** (60 partite ciascuna, A = Difficile): la AI normale batte casuale 100%, solo fedeltà 96,7% [88,6–99,1], solo pattern 95,0% [86,3–98,3], solo PM 100%, passivo 100%. **Nessuna strategia sbagliata di proposito regge.**
- **⚠ Vantaggio dell'ordine di turno (resta anche con il segnalino):** chi inizia la partita vince di più, e l'effetto scende con l'ordine di turno. Con giocatori Medi (≈ 4.500 partite): a 3 giocatori primo **36,0%**, secondo 33,3%, terzo 30,7%; a 2 giocatori 52,6% / 47,4%. **Non esiste alcun vantaggio legato al posto fisso** (33,0 / 33,6 / 33,3%): gli scarti visti in alcune serie brevi erano rumore. A 2 giocatori chi inizia ha **+0,50 punti** [0,14–0,86] (su ≈ 24); senza la rotazione del primo giocatore sarebbe +1,16.
- **Compensazione ADOTTATA (PM iniziali in più a chi NON inizia, `startPMBonus`):** verificata con le regole definitive (1.000 partite Difficile contro Difficile): chi inizia vince **48,8%** [45,7–51,9] a 2 giocatori, **31,8%** [29,0–34,8] a 3, **22,9%** [20,4–25,6] a 4 (attesi 50 / 33,3 / 25%): neutro, con un filo di sovra-compensazione. Misure di partenza:
| | 2 giocatori | 3 giocatori | 4 giocatori |
|---|---|---|---|
| Nessuna compensazione (3.000 partite) | 54,9% [53,1–56,7] | 38,1% [36,4–39,9] | 31,3% [29,6–33,0] |
| Tutti tranne il primo +1 PM (2.000; a 4 giocatori 1.500) | **48,0%** [45,8–50,2] | **31,6%** [29,6–33,6] | **26,1%** [23,9–28,4] |
| Solo l'ultimo +1 PM (3 giocatori) | — | 36,2% [34,1–38,3] (non basta) | — |
| Solo gli ultimi due +1 PM (4 giocatori) | — | — | 26,7% [24,6–29,1] |
  Atteso: 50% / 33,3% / 25%. La regola «chi non inizia parte con 3 PM invece di 2» riporta tutto vicino al neutro (leggermente oltre a 2 e 3 giocatori).
- **Analisi forzata degli Eventi** (80 coppie di partite per carta, AI Media, Δ punteggio di chi pesca rispetto a un Evento a caso):
  - **#74 Potenziamento del centro operativo (3° lavoratore gratis): +5,70 [+4,45 ; +6,95]** — di gran lunga la più forte; poi #76 Ricognizione aerea +2,46, #73 Incentivo alla raccolta dati +2,44, #70 Premio +1,94, #64 e #16 (pescare una carta) ≈ +1,5, #63 e #8 (+2 PM a tutti) ≈ +1,1.
  - **Tutti i fenomeni fanno perdere punti anche a chi li pesca**: da −0,8 a −1,7 (peggiore #42 Bora di ritorno −1,66 [−2,68 ; −0,65]). Le carte positive aiutano anche gli altri (+2/+3) perché sostituiscono un Evento a caso, che di solito è un fenomeno.
- **Analisi forzata delle Carte Regione** (60 coppie, AI Media): quasi tutte entro il rumore; le uniche con intervallo che esclude 0 sono Lazio neutra +1,50 [+0,16 ; +2,84] e Friuli-Venezia Giulia neutra −1,67 [−3,11 ; −0,22]. Servono più partite per tarare le singole carte.

## Misure della tappa 4 (AI e simulatore) — fatte con le REGOLE ORIGINALI, prima delle due decisioni sotto
*Tutte con intervallo di confidenza al 95%, posti alternati. Comando di esempio: `node tools/sim.js --games 300 --a hard --b medium`.*
- **Livelli AI (2 giocatori, 300 partite):** Difficile batte Media **63,0%** [57,4–68,3]; Media batte Facile **93,7%** [90,3–95,9]; Difficile batte Facile **96,3%** [93,6–97,9]. A 4 giocatori (200 partite) una Difficile contro 3 Medie vince **43,0%** [36,3–49,9] (attese 25%). L'abilità conta.
- **⚠ Fedeltà contro Pattern (strategie estreme, 100 partite, entrambe AI Difficile):** chi gioca *solo per la fedeltà alla previsione* perde contro chi gioca *solo per i pattern* nel **97%** dei casi (vince **3,0%** [1,0–8,5]; punteggi medi 4,7 contro 15,8). Una AI normale batte «solo fedeltà» 100% [96,3–100] e «solo pattern» 85,0% [76,7–90,7]. L'Accuratezza grezza media è ≈ **2 su 15**: quasi sempre scaglione «Parzialmente corretta» (3 punti); la Coerenza Geografica vale ≈ **15-17 punti** (pattern ≈ 13-15). **Il Concept dice che la fedeltà deve restare la strada più remunerativa: con i numeri di partenza non lo è.** Motivo probabile: l'economia (PM e azioni) permette ≈ 5 carte giocate e ≈ 9 simboli a partita, e un gruppo di Sole/Temporale vale più delle condizioni della previsione. Limite della misura: l'AI fedele è euristica, non ottima.
- **⚠ A 3 giocatori chi inizia la partita ha un vantaggio:** vince il **38,9%** [35,9–42,0] (1000 partite Difficile; Media: 35,5% e 38,0%) contro il 33,3% atteso. Causa: gli Eventi escono ai round 4, 7, 10 (di 3 in 3) e il primo giocatore ruota di uno a round, quindi a 3 giocatori **pesca sempre lo stesso giocatore tutti e tre gli Eventi** (e prende i bonus «chi pesca»). Con la variante `eventDrawer=rotate` (l'Evento passa di mano a ogni pescata) scende al **35,4%** [32,4–38,4], compatibile col 33,3%. A 2 giocatori (52,3% [47,4–57,1]) e a 4 (26,0% [21,9–30,5]) non c'è vantaggio.
- **Posti fissi:** nessun vantaggio sistematico (controllato con 3 serie indipendenti).
- **Durata:** ≈ 22-24 piazzamenti di lavoratori a testa (distribuzione 20-28), uguale a 2 e 4 giocatori.
- **Eventi che cambiano il bersaglio:** 0,45-0,65 volte a partita nelle simulazioni (la stima analitica era 0,47). I colpi a vuoto sono ≈ 0,45 a partita; la regione nominata è «fuori gioco» ≈ 1 volta a partita.
- **Sprechi a fine partita (Difficile):** ≈ 1 PM e ≈ 1,3 carte in mano; lavoratori inutilizzati 0,4 a partita. **Mosse che tolgono punti da sole:** Difficile 0 su 3.197; Media 23 (per il rumore voluto).

## Proposte misurate per i due problemi (ADOTTATE da Niky: nuova scala di Accuratezza e segnalino «Protezione Civile» che passa di mano)
*Strumento: `node tools/experiment.js '<json delle regole>' [partite] [seed] [giocatori]`. Tutte con AI Difficile; «solo fedeltà» = ignora i pattern, «solo pattern» = ignora la previsione, «AI normale» = tiene conto di tutto.*

**Problema 1 — la fedeltà non conviene (solo-fedeltà contro solo-pattern, 2 giocatori, A = solo-fedeltà):**
| Variante | Solo-fedeltà batte solo-pattern | AI normale batte solo-pattern / solo-fedeltà | Totale medio AI normale |
|---|---|---|---|
| Regole attuali (120 partite) | 9,2% [5,2–15,7] | 80,8% / 100% | 19,5 |
| Tetto di 6 alla Coerenza | 21,7% [15,2–29,9] | 74,2% / 100% | 9,0 |
| Tetto di 9 alla Coerenza | 8,3% [4,6–14,7] | 75,0% / 100% | 12,0 |
| Pattern circa dimezzati | 17,5% [11,7–25,3] | 81,7% / 100% | 12,9 |
| 3 lavoratori a testa | 2,5% [0,9–7,1] | 75,8% / 99,2% | 27,1 |
| **Scala di Accuratezza «1-2 → 3, 3-4 → 6, 5-6 → 10, 7+ → 15» (300 partite)** | **51,0% [45,4–56,6]** | **92,0% / 93,3%** | 23,9 |
| Scala più dolce «1-3 → 3, 4-6 → 6, 7-9 → 10, 10+ → 15» | 26,7% [20,2–34,3] | 83,3% / 100% | 21,2 |
| Scala con punti più bassi «1-2 → 2, 3-4 → 5, 5-6 → 8, 7+ → 12» | 36,0% [28,8–43,9] | 85,3% / 98,0% | 21,5 |
| Scala nuova + tetto 8 alla Coerenza | 83,3% [75,7–88,9] | 99,2% / 82,5% | 17,0 |
- **Perché funziona la nuova scala:** le soglie attuali (1-6, 7-10, 11-13, 14-15) sono pensate per un grezzo fino a 15, ma nelle partite si arriva a 2-6: tra 1 e 6 punti grezzi si prendono sempre 3 punti, quindi non conviene impegnarsi. Con la scala nuova ogni 2 punti di previsione c'è un gradino (stessi punti finali 3/6/10/15, cambiano solo le soglie).
- **Con la scala nuova** a 3 giocatori (150 partite): solo-fedeltà 29,3% [22,6–37,1] (atteso 33,3%); i livelli delle AI restano distinti (Difficile batte Media 63,0% [57,4–68,3]; Media batte Facile 96,7% [94,0–98,2]). Accuratezza grezza media dell'AI normale: da 2,3 a 4,3.
- **Attenzione ai nomi:** con la scala nuova «Perfetta» scatta a 7+ su 15 (non a 14-15): conviene rinominare i gradini.
- **Idee scartate dalle misure:** il solo tetto, i soli pattern dimezzati e i 3 lavoratori non bastano; con 3 lavoratori i pattern guadagnano ancora di più.

**Problema 2 — a 3 giocatori chi inizia pesca sempre gli Eventi (vantaggio di chi inizia):**
| Variante | 2 giocatori | 3 giocatori | 4 giocatori |
|---|---|---|---|
| Regole attuali | 52,3% [47,4–57,1] | 38,9% [35,9–42,0] (atteso 33,3%) | 26,0% [21,9–30,5] |
| L'Evento passa di mano a ogni pescata (`eventDrawer=rotate`) | 49,1% [45,6–52,5] (800 partite) | 35,4% [32,4–38,4] | 27,9% [24,9–31,2] (atteso 25%) |

## Misure precedenti
1. **Frequenza degli Eventi che cambiano il bersaglio** (stima analitica sui dati, una Previsione casuale per area): un Evento pescato a caso cambia il bersaglio nel ~16% dei casi → **circa 0,47 cambi a partita** con 3 Eventi. I Tipo A scattano solo nell'~8% dei casi, i Tipo B nel ~53%. Il «bersaglio mobile» è un pilastro del concept ma succede in media meno di una volta a partita. **Da riconfermare col simulatore.**

## Punti aperti
2. **Economia PM/simboli.** (Misurato: ≈ 5 carte e ≈ 9 simboli a partita, vedi sopra.) Se la Sezione 2 occupasse gli spazi della Sezione 1, «Guadagna 1 PM» e «Raccogli un simbolo» varrebbero al massimo ~12 usi a partita per tutto il tavolo. Ora la Sezione 2 *non* li occupa (`sez2OccupiesSez1`): **misurare** PM e simboli a partita nei due casi e decidere con Niky.
3. **Congestione a 3-4 giocatori:** 5+2 spazi, 6-12 lavoratori. Misurare i lavoratori inutilizzati e i passa forzati.
4. **Mazzo Carte Regione a 4 giocatori:** misurare quante volte si rimescola.
5. **Fedeltà vs Coerenza Geografica:** la fedeltà deve restare la strada più remunerativa. Misurare con strategie estreme.
6. **Scaglioni di Accuratezza (0/3/6/10/15):** salti molto grandi (da 13 a 14 vale +5). Misurare la distribuzione dei totali grezzi.
7. **Pattern Sole «Distesa»:** un gruppo da 6+ vale 9 punti; verificare che non diventi dominante.
8. **Primo giocatore:** misurare il vantaggio di posto (ruota ogni round, ma chi comincia la partita?).
9. **Obiettivi Segreti:** da scrivere insieme a Niky (vedi DA_IMPLEMENTARE.md).

## Forma dell'Italia (regola di Niky) — misure
- Ogni regione ha una casella fissa (`FF.ITALY_MAP`, `mapMode: 'italia'`); adiacenza = caselle a croce. Cartogramma = [interpretazione], da confermare con Niky (22/31 confini veri si toccano; Calabria–Sicilia voluta).
- Misura (200 partite, 2 giocatori, Difficile): solo-fedeltà vs solo-pattern **74%** [67.5–79.6] con la mappa, contro 55.5% con la griglia libera. Coerenza media del giocatore misto 13.0 (era 15.6). Le adiacenze sono meno controllabili, quindi i pattern rendono meno e la fedeltà pesa di più.
- Tutte le strategie estreme perdono ancora (Fedeltà 90%, Pattern 94% di vittorie per l'AI normale).
- Da decidere con Niky: ribilanciare (es. pattern Sole/Temporale più generosi) o accettare lo spostamento. Non toccato senza la sua scelta.

## Obiettivi Segreti — implementati (mazzo di 24, pesca 2 tieni 1) — misure
- Dati in `js/data.js` (`FF.OBJECTIVES`), regole in `docs/REGOLAMENTO.md` §8 (tabella controllata da un test), strumento di misura `tools/obiettivi.js` (`--write` aggiorna `FF.OBJ_RATE`, le probabilità che l'AI usa per scegliere/cambiare obiettivo).
- Come funziona nel motore: a inizio partita decisione `objective` (2 carte → 1) per ogni giocatore, a partire dal primo; Evento #67 → decisione `objswap`; punti in `scoreOf`; la cronaca li rivela a fine partita. L'AI non conosce gli obiettivi altrui (`determinize` li cancella). I punteggi provvisori in app NON includono gli obiettivi.
- Tarature fatte dopo le misure (mirando, 600 partite, 2 giocatori): le carte «4 regioni precise» erano impossibili (0-5%) → «almeno 3 tra 6-7 regioni»; le carte PM (Cassaforte, Economia di guerra) erano raggiunte al 98% perché i PM sono quasi gratis → 9 PM / 7 PM con mano vuota; «Cantiere» 11 simboli; «Le due Isole» (3%) → «Estremo Sud e Isole» (≥1 tra Calabria, Sicilia, Sardegna, facile 3).
- Risultato: un giocatore AI che punta all'obiettivo lo raggiunge ~47% delle volte, ≈ 2,0 punti a giocatore (su ~22 totali).
- Effetti sul resto del gioco (2 giocatori, salvo dove indicato): Difficile > Media **56,0%** [51,6–60,3] (era 63% senza obiettivi: gli obiettivi aggiungono fortuna e comprimono la differenza di abilità); Media > Facile 92,3%; fedeltà vs pattern **62,3%** [56,7–67,6] (era 74% con la mappa e senza obiettivi); strategie estreme tutte perdenti (Fedeltà 75%, Pattern 88%, Casuale 99%, Accumulatore e Passivo 100% di vittorie per la AI normale). Vantaggio di chi inizia: 2 giocatori 51,9%, 3 giocatori 31,5% (atteso 33,3), 4 giocatori 20,7% [16,5–25,7] (atteso 25: un po' basso, da rivedere al playtest).
- Carte ancora scomode (dipendono dalla fortuna): Tutti i fenomeni in campo (~11%), Alta pressione estesa (~14%), Squadra al completo (~8%), Cantiere (~15%), Arco alpino (~17%). Da guardare al playtest con persone vere.

## Nebbia troppo redditizia con la mappa fissa (scoperto dal playtest di Niky) — misure
- La AI riempie le carte di Nebbia: 3,4 carte su 4,7 la portano e il pattern Nebbia vale in media **6,6 punti a giocatore** (su ~12,5 di Coerenza e ~23 totali). Con la griglia libera erano 4,0.
- Perché: «Sacca isolata» dà +2 a ogni Nebbia senza altra Nebbia vicina, e sulla mappa d'Italia ogni giocatore ha solo ~5 delle 20 regioni, quindi quasi ogni carta è isolata da sola: +2 per 1 azione, sempre.
- Varianti misurate (200 partite, 2 giocatori, AI Difficile; punti Nebbia / totale medio / solo-fedeltà vs solo-pattern): attuale 6,6 / 22,9 / 62% · Nebbia +1 → 3,1 / 19,6 / 73% · Nebbia solo con almeno un vicino (`nebbiaNeedsNeighbor`, già nel codice, spenta) → 2,4 / 20,2 / 67% · vicino + 1 punto → 0,8 / 18,8 / 71%. Niente deciso: i punteggi dei pattern non si toccano finché Niky non sceglie.

## Un solo simbolo per carta (correzione di Niky) — misure
- **Regola:** una carta porta 1 simbolo; il 2° si può mettere solo se forma una fusione (`secondSymbolOnlyFusion: true`). Prima il codice ammetteva 2 simboli qualsiasi (errore mio: avevo letto «max 2» come «2 qualsiasi»). Il testo del regolamento (§6) e la tabella delle differenze sono corretti.
- Effetto (AI Difficile, 2 giocatori): punteggio medio 22,7 → **17,3** (Accuratezza 7,2, Coerenza 8,2); carte giocate 5,3; fusioni 0,2 a partita (si fanno solo quando un Evento cambia il bersaglio). Pattern Nebbia ancora il più redditizio (**4,7 punti** a giocatore: 2,4 carte con Nebbia; era 6,6) perché ogni carta isolata vale +2; Vento 0,07, Sole 0,05, Pioggia 0,02.
- Solo-fedeltà vs solo-pattern: **65%** [58,2–71,3]; l'AI normale batte le strategie estreme: Fedeltà 70%, Pattern 88%, Casuale 99%, Accumulatore e Passivo 100%. La scala di Accuratezza (3/6/10/15 per 1-2/3-4/5-6/7+) era tarata sul gioco a 2 simboli: da rimisurare dopo che Niky decide su Nebbia.
- Obiettivi rifatti perché con 1 simbolo per carta «Carte piene» e «Cantiere» erano impossibili: S1 «Quattro fenomeni» (4 tipi), S2 «Tempo a coppie», S5 «Sei fenomeni» (6 tipi, 8 punti), S6 «Precipitazioni sparse», P3 «Massa d'aria uniforme» (3 carte vicine con lo stesso simbolo, 8 punti), R6 «Tavolo attrezzato» (6 carte, tutte con un simbolo); R4 «Tavolo grande» 7 carte, T5 «Rete fitta» 3 bonus, T9 Arco alpino con anche la Liguria. Media 2,0 punti di obiettivo a giocatore, raggiunto ~45%.
- Ancora aperto: Nebbia (varianti già misurate sopra, nessuna applicata) e la scala di Accuratezza.

## Nebbia solo con almeno una carta vicina (scelta di Niky) — misure
- Regola applicata (`nebbiaNeedsNeighbor: true`): la Nebbia punta +2 solo se ha almeno una carta adiacente e nessun'altra Nebbia adiacente. Obiettivo P1 allineato («2 carte con Nebbia, ognuna accanto a qualche carta, nessuna accanto ad altra Nebbia»).
- Effetto (AI Difficile, 2 giocatori): punteggio medio 16,6 (Accuratezza 8,9 · **Coerenza 5,3**); Nebbia 1,5 punti a giocatore (era 4,7), carte con Nebbia 0,8. Fusioni 0,4 a partita.
- **Problema aperto:** ora i pattern pesano poco. Solo-fedeltà vs solo-pattern **84,7%** [80,2–88,3]; la AI normale batte «solo fedeltà» appena **58,8%** [52,6–64,7] (prima 70-75%): la previsione da sola è quasi una strategia completa. Il test «prove estreme» ora chiede solo che «solo fedeltà» perda più di metà delle volte.
- Opzioni già misurate senza toccare i pattern (250 partite): scala Accuratezza 0/2/4/7/10 → fedeltà vs pattern 57,6% · scala 0/2/4/6/8 → 56,4% · Confine +2 → 64,8% · scala 0/2/4/7/10 + Confine +2 → 44%. Niente applicato: da decidere con Niky.

## Scala 0/2/4/7/10 e bonus di confine +2 (scelta di Niky) — misure
- Applicato: Accuratezza 1–2 → 2, 3–4 → 4, 5–6 → 7, 7+ → 10 (`data/regole_e_costanti.json`) e `borderPoints: 2` (le carte mostrano «+2 punti se hai giocato…»). Pattern invariati.
- Misure (2 giocatori, AI Difficile salvo dove indicato): punteggio medio 16,1–16,8 (Accuratezza ~6-8, Coerenza ~8,3); **solo-fedeltà vs solo-pattern 45,7%** [40,1–51,3] (era 84,7%); la AI normale batte le strategie estreme: Fedeltà 75%, Pattern 71%, Casuale 99%, Accumulatore e Passivo 100%. Difficile > Media 64,0%, Media > Facile 85,3%.
- Vantaggio di chi inizia: 2 giocatori 50,0% (ok), 3 giocatori **27,8%** [23,6–32,4] (atteso 33,3: ora chi inizia è un po' svantaggiato, la compensazione +1 PM potrebbe essere troppa a 3), 4 giocatori 22,7% [18,4–27,8] (atteso 25).
- Obiettivi rimisurati: raggiunti ~54%, 2,8 punti a giocatore.
- Da rivedere al playtest: compensazione PM a 3 giocatori; con la scala più bassa le Pattern strategy (solo pattern) sono ora alla pari con la fedeltà, quindi gli estremi sono i più vicini ai tempi normali.

## Quanto rende una partita di 12 / 16 / 20 / 24 round (AI Difficile, 250 partite, 2 e 4 giocatori) — `tools/lunghezza.js`
Eventi ai round proporzionali (12: 4/7/10 · 16: 5/9/13 · 20: 7/12/17 · 24: 8/14/20). Valori per giocatore, 2 giocatori (a 4 sono quasi uguali):

| | 12 | 16 | 20 | 24 |
|---|---|---|---|---|
| carte sul tavolo (media / massimo) | 5,4 / 8 | 6,6 / 10 | 7,6 / 12 | 8,5 / 13 |
| simboli messi | 5,4 | 6,6 | 7,8 | 8,7 |
| condizioni della previsione prese (su 10) | 2,5 | 2,8 | 2,9 | 3,0 |
| Accuratezza grezza (su 15) | 4,1 | 4,7 | 5,0 | 5,1 |
| scaglione 7+ | 11% | 18% | 27% | 29% |
| area Centro completa (2 condizioni) | 9% | 11% | 18% | 17% |
| area Nord / Sud completa, previsione intera | 0% | 0% | 0% | 0% |
| bonus di confine (pt) | 4,3 | 6,5 | 8,2 | 10,0 |
| pattern (pt) | 3,9 | 5,9 | 7,6 | 9,1 |
| giocatori con almeno 1 pattern | 84% | 92% | 95% | 94% |
| obiettivo raggiunto | 54% | 67% | 75% | 81% |
| PM avanzati a fine partita | 2,6 | 3,8 | 5,1 | 7,3 |
| punteggio totale | 16,4 | 21,9 | 26,3 | 29,9 |

- Pattern più frequenti: Nebbia (66→91% dei giocatori), Nuvolo (48→75%), Temporale (20→33%), Neve (10→18%); Sole, Pioggia e Vento quasi mai (<10%, Vento 22% a 24 round).
- Una carta con simbolo costa ~4-5 azioni (comprarla, giocarla, il simbolo, i PM per pagarla): con 2 lavoratori e 12 round le azioni sono ~24, quindi ~5 carte. Raddoppiare i round non raddoppia le carte (8,5 a 24): i PM avanzano (7,3) e il 3° lavoratore lo sblocca solo il 10-21%.
- Nessuna previsione intera in nessuna lunghezza: Nord e Sud (4 condizioni ciascuna) non vengono mai completate; servirebbero 10 carte di regioni precise, con il simbolo giusto.

## Più carte e più simboli in 12 round: varianti misurate (nessuna applicata) — 200 partite, 2 giocatori, AI Difficile
Nuovi parametri sperimentali nel motore, tutti spenti di default: `pmGain` (PM dell'azione «Guadagna PM»), `incomePM` (PM gratis a inizio round, senza lavoratore), `priceShift` (somma al prezzo delle carte, minimo 0), `playGivesSymbol` (giocare una carta dà 1 simbolo gratis).
Diagnosi: con 12 round ci sono ~24 azioni e circa il 40% serve solo a guadagnare PM (1 PM per azione); una carta con simbolo costa 3 azioni distinte (comprare, giocare, simbolo) più i PM per pagarla.

| Variante | carte | simboli | cond. prev. (su 10) | 7+ | pattern | obiettivo | totale | fedeltà vs pattern | vince chi inizia |
|---|---|---|---|---|---|---|---|---|---|
| base | 5,4 | 5,5 | 2,5 | 12% | 4,0 | 55% | 16,7 | 45% | 50% |
| PM ×2 per azione | 6,1 | 5,8 | 2,7 | 18% | 5,3 | 67% | 20,6 | 43% | 49% |
| +1 PM gratis a round | 6,7 | 6,4 | 2,8 | 25% | 6,3 | 72% | 23,6 | 47% | 51% |
| +2 PM gratis a round | 7,5 | 7,0 | 2,9 | 26% | 7,4 | 79% | 27,1 | 33% | 48% |
| prezzi −1 (neutra gratis) | 6,5 | 6,3 | 2,8 | 21% | 5,9 | 62% | 21,8 | 38% | 45% |
| prezzi −1 e cieca 1 | 6,6 | 6,3 | 2,9 | 22% | 6,0 | 61% | 22,1 | 43% | 48% |
| giocare una carta dà 1 simbolo | 6,3 | 7,3 | 2,7 | 20% | 4,9 | 70% | 19,5 | 62% | 45% |
| 3 lavoratori da subito | 7,2 | 7,3 | 2,9 | 21% | 6,7 | 78% | 24,7 | 31% | 49% |
| +1 PM a round + gioca dà simbolo | 8,1 | 9,2 | 3,0 | 36% | 7,7 | 89% | 27,7 | 48% | 47% |
| prezzi −1 + gioca dà simbolo | 7,9 | 9,0 | 3,0 | 33% | 7,3 | 76% | 26,0 | 48% | 50% |
| +1 PM a round + prezzi −1 + gioca dà simbolo | 9,1 | 10,3 | 3,2 | 40% | 9,5 | 92% | 32,8 | 37% | 44% |

Nota: le condizioni della previsione prese restano ~3 su 10 anche con 9 carte: più carte non bastano per completare le previsioni; con più azioni gli obiettivi (soglie) e la scala di Accuratezza andrebbero poi rialzati.

## Più carte e simboli: variante APPLICATA (scelta di Niky) — prezzi −1, simbolo gratis alla giocata, riserva di 2
- Regole: `priceShift: -1` (Neutra gratis, Confine 1, Compensativa 2, cieca 2), `playGivesSymbol: true` (solo per carte nuove, non per sostituzioni), `symbolReserve: 2` (riserva pubblica; si mettono gratis, senza lavoratore, all'inizio di un proprio turno; quelli rimasti a fine partita si perdono). Vale anche per i simboli gratuiti degli Eventi. Riserva: **uso gratuito** scelto perché con l'uso a pagamento (una azione) sarebbe solo un modo di rinviare lo stesso costo, senza il vantaggio di aspettare un Evento.
- Misura della riserva (200 partite, AI Difficile): per la AI la riserva è neutra (punteggio 26,5 con riserva 0 e con riserva 2; ne usa 1,1 su 1,9 presi) perché non pianifica l'attesa di un Evento: il vantaggio per un giocatore umano resta da vedere al playtest. Prima di scrivere la valutazione «tienilo solo se la regione che mi serve è in mano o in mercato» la AI sprecava la riserva (−1 punto).
- Dopo le nuove regole (2 giocatori, AI Difficile, 12 round): carte sul tavolo ≈ 7,8 per giocatore; fusioni 0,6; punteggio medio 24,4 (Accuratezza 9,6 · Coerenza 14,8). Fedeltà vs pattern **42,7%** [37,2–48,3]; Difficile > Media **67,6%**, Media > Facile **95,7%**; strategie estreme tutte perdenti (Fedeltà 72%, Pattern 73%, Casuale 99,7%, Accumulatore/Passivo 100%).
- **Vantaggio di chi inizia ora in linea con l'atteso a tutti i numeri di giocatori**: 2 → 48,1% (atteso 50), 3 → 33,5% (33,3), 4 → 27,1% (25).
- Obiettivi ritarati su queste regole (soglie più alte: 9 carte, 7 tipi di simbolo, 4 regioni di un'area, ecc.): ~45-50% raggiunti, 2,5 punti a giocatore.
- Da decidere: con più carte la Coerenza (14,8) pesa più dell'Accuratezza (9,6): la scala 0/2/4/7/10 potrebbe tornare più generosa.
