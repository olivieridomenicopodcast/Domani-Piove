# Da ricordare — misure, note di bilanciamento, cose da riguardare al playtest

*Da NON decidere ora: li riprendiamo col simulatore e coi playtest. Ricordarli a Niky a ogni tappa importante.*

## Misure della tappa 4 (AI e simulatore) — da discutere con Niky, NIENTE è stato cambiato nelle regole
*Tutte con intervallo di confidenza al 95%, posti alternati. Comando di esempio: `node tools/sim.js --games 300 --a hard --b medium`.*
- **Livelli AI (2 giocatori, 300 partite):** Difficile batte Media **63,0%** [57,4–68,3]; Media batte Facile **93,7%** [90,3–95,9]; Difficile batte Facile **96,3%** [93,6–97,9]. A 4 giocatori (200 partite) una Difficile contro 3 Medie vince **43,0%** [36,3–49,9] (attese 25%). L'abilità conta.
- **⚠ Fedeltà contro Pattern (strategie estreme, 100 partite, entrambe AI Difficile):** chi gioca *solo per la fedeltà alla previsione* perde contro chi gioca *solo per i pattern* nel **97%** dei casi (vince **3,0%** [1,0–8,5]; punteggi medi 4,7 contro 15,8). Una AI normale batte «solo fedeltà» 100% [96,3–100] e «solo pattern» 85,0% [76,7–90,7]. L'Accuratezza grezza media è ≈ **2 su 15**: quasi sempre scaglione «Parzialmente corretta» (3 punti); la Coerenza Geografica vale ≈ **15-17 punti** (pattern ≈ 13-15). **Il Concept dice che la fedeltà deve restare la strada più remunerativa: con i numeri di partenza non lo è.** Motivo probabile: l'economia (PM e azioni) permette ≈ 5 carte giocate e ≈ 9 simboli a partita, e un gruppo di Sole/Temporale vale più delle condizioni della previsione. Limite della misura: l'AI fedele è euristica, non ottima.
- **⚠ A 3 giocatori chi inizia la partita ha un vantaggio:** vince il **38,9%** [35,9–42,0] (1000 partite Difficile; Media: 35,5% e 38,0%) contro il 33,3% atteso. Causa: gli Eventi escono ai round 4, 7, 10 (di 3 in 3) e il primo giocatore ruota di uno a round, quindi a 3 giocatori **pesca sempre lo stesso giocatore tutti e tre gli Eventi** (e prende i bonus «chi pesca»). Con la variante `eventDrawer=rotate` (l'Evento passa di mano a ogni pescata) scende al **35,4%** [32,4–38,4], compatibile col 33,3%. A 2 giocatori (52,3% [47,4–57,1]) e a 4 (26,0% [21,9–30,5]) non c'è vantaggio.
- **Posti fissi:** nessun vantaggio sistematico (controllato con 3 serie indipendenti).
- **Durata:** ≈ 22-24 piazzamenti di lavoratori a testa (distribuzione 20-28), uguale a 2 e 4 giocatori.
- **Eventi che cambiano il bersaglio:** 0,45-0,65 volte a partita nelle simulazioni (la stima analitica era 0,47). I colpi a vuoto sono ≈ 0,45 a partita; la regione nominata è «fuori gioco» ≈ 1 volta a partita.
- **Sprechi a fine partita (Difficile):** ≈ 1 PM e ≈ 1,3 carte in mano; lavoratori inutilizzati 0,4 a partita. **Mosse che tolgono punti da sole:** Difficile 0 su 3.197; Media 23 (per il rumore voluto).

## Proposte misurate per i due problemi (NON ancora adottate — aspettano la decisione di Niky)
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
