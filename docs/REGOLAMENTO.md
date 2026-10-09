# Domani Piove — Regolamento (versione playtest v0)

*Fonte unica: questo file viene mostrato anche nell'app (voce «Regole») e controllato dai test contro il codice.*
**[chiarito]** = deciso con Niky · **[interpretazione]** = scelta di Claude, da confermare al playtest · **[da misurare]** = si decide dopo le simulazioni.
Tutti i numeri sono valori di partenza da tarare col playtest.

## 1. Il gioco in breve
Siete meteorologi amatoriali, ognuno con il proprio canale. Sulla plancia centrale c'è **un'unica previsione, pubblica e uguale per tutti**: 3 Carte Previsione (Nord, Centro, Sud e Isole) trasformate in segnalini. Costruite davanti a voi una mappa di **Carte Regione** e vi mettete sopra **simboli meteo** per assomigliare il più possibile alla previsione. Ma durante la giornata la Protezione Civile può **cambiare il bersaglio**. Alle 20:00 si confronta tutto.

**Giocatori:** 2–4 · **Durata:** 12 round (un'ora ciascuno, dalle 8:00 alle 20:00).
**Punteggio finale = Accuratezza + Coerenza Geografica + Obiettivi Segreti.** [chiarito]

## 2. Materiale
- **96 Carte Regione** (40 Nord, 20 Centro, 36 Sud e Isole). Non hanno simboli stampati: stabiliscono quali regioni hai in gioco e quale bonus attivi. Ogni carta ha un solo bonus. Varianti: Neutra (1 PM), Confine (2 PM), Compensativa (3 PM).
- **36 Carte Previsione** (12 per area) e **80 Carte Evento** (30 Tipo A, 19 Tipo B, 31 neutre o positive).
- **7 simboli meteo**: Sole, Nuvolo, Pioggia, Vento, Temporale, Neve, Nebbia — **10 gettoni per simbolo** nel pool condiviso.
- **8 fusioni** (vedi §6) e i **Punti Meteo (PM)**.

## 3. Preparazione
1. Si pesca **1 Carta Previsione per area** (Nord, Centro, Sud e Isole), si legge ad alta voce e si trasferisce sulla plancia: ogni condizione diventa un **bersaglio** (regione + simbolo richiesto + punti). Le Previsioni non si leggono più dalle carte, ma dalla plancia. [chiarito]
2. Mercato: **5 Carte Regione scoperte** + mazzo coperto.
3. Ogni giocatore parte con **2 PM** e **2 Carte Regione** in mano. Nessun limite di carte in mano. [chiarito]
4. Ogni giocatore ha **2 lavoratori**.
5. Il primo giocatore è scelto a sorte. [interpretazione]
6. Obiettivi Segreti: si pescano 2, se ne tiene 1. *Il mazzo non esiste ancora: in questa versione la regola è un segnaposto che vale 0 punti.* [chiarito]

## 4. Il round
Un round è un'ora della giornata. Ogni round: (1) se è un round-Evento, si pesca la Carta Evento; (2) piazzamento dei lavoratori; (3) i lavoratori tornano a casa e gli spazi si liberano.

**Il primo giocatore passa a sinistra a ogni round.** [interpretazione]
**Carta Evento:** all'inizio dei round 4, 7 e 10 (11:00, 14:00, 17:00). La pesca il primo giocatore del round: dove una carta dice «il giocatore che pesca», è lui. [interpretazione]

### Piazzamento
Si gioca in ordine di turno, **un lavoratore alla volta**, a rotazione. Chi **passa** è fuori fino alla fine del round. Chi non ha spazi utili passa da solo. [interpretazione sulla contraddizione del Concept §4.2]
Uno spazio occupato è **bloccato fino alla fine del round**.

| Spazio | Lavoratori | Effetto |
|---|---|---|
| **Gioca una carta** | 1 | Metti una Carta Regione dalla mano sul tavolo (vedi §5) |
| **Compra una carta** | 1 | Prendi una carta dal mercato scoperto o dal mazzo coperto, pagando in PM |
| **Raccogli un simbolo** | 1 | Prendi un simbolo dal pool e mettilo su una tua carta giocata (vedi §6) |
| **Guadagna 1 PM** | 1 | +1 Punto Meteo |
| **Sblocca lavoratore** | 1 | Paga **5 PM**: 3° lavoratore, dal round dopo [interpretazione] |
| **Doppia azione** | 2 | Due azioni *diverse* tra le 5 sopra |
| **Azione ripetuta** | 2 | La *stessa* azione due volte (non «Sblocca») |

**[da misurare]** La Sezione 2 *non* occupa gli spazi della Sezione 1 corrispondenti (come dice il Concept: «decongestiona il tabellone»). Il parametro `sez2OccupiesSez1` permette di provare l'altra lettura in simulazione. Se la seconda azione di una Doppia/Ripetuta non è possibile, va persa.

**Prezzi (PM):** Neutra 1 · Confine 2 · Compensativa 3 · Pesca cieca (qualsiasi carta) 2. Comprata una carta del mercato, si rimpiazza dal mazzo. Se il mazzo finisce, si rimescolano gli scarti. [interpretazione]

## 5. Giocare le Carte Regione
- **Massimo 1 carta per regione.** Se giochi una carta di una regione già giocata, **sostituisce** la vecchia: la vecchia va negli scarti, la nuova prende il suo posto e **i simboli già sopra restano**. [chiarito]
- Le carte stanno su una **griglia**. La prima va al centro; **ogni altra va in una cella libera a contatto ortogonale (non in diagonale) con una carta già giocata**. Una volta giocate **le carte non si spostano**. [chiarito]
- **Adiacenza** (per i pattern) = contatto ortogonale. Il **bonus di confine non richiede contatto**: basta aver giocato la regione indicata. [chiarito]

## 6. Simboli e fusioni
- «Raccogli un simbolo» = prendi un gettone dal pool e **mettilo subito su una tua carta già giocata**. Non si sposta. Senza carte giocate (o con tutte piene) lo spazio non è usabile. [chiarito]
- **Una carta porta al massimo 2 simboli.** [chiarito]
- **La fusione è automatica**: quando i 2 simboli sono compatibili, la carta diventa quel fenomeno e **conta solo come la fusione** (non più come i simboli base). [chiarito]

| Fusione | Simboli |
|---|---|
| Caldo Estremo | Sole + Sole |
| Burrasca | Vento + Vento |
| Alluvione | Pioggia + Pioggia |
| Downburst | Temporale + Temporale |
| Nevicata Estrema | Neve + Neve |
| Tromba d'Aria | Temporale + Vento |
| Grandine | Temporale + Sole |
| Tormenta di Neve | Neve + Vento |

Nuvolo e Nebbia non hanno fusione. Due simboli non compatibili (es. Sole + Nuvolo) restano semplicemente sulla carta, che è piena. Se il pool di un simbolo è finito, non si può scegliere.

## 7. Le Carte Evento
Riguardano **solo il Fenomeno** (le fusioni): modificano il **bersaglio** sulla plancia. La carta si attiva solo se la regione nominata è tra quelle toccate dalla Previsione corrente della sua area (Core o Secondaria).
- **Tipo A (condizionale):** se il bersaglio di quella regione richiede già il simbolo compatibile, diventa la fusione. Altrimenti **colpo a vuoto**. Su un bersaglio già fuso, colpo a vuoto. [interpretazione]
- **Tipo B (incondizionato):** il bersaglio di quella regione diventa la fusione, qualunque cosa richiedesse. Se era già un'altra fusione, la sovrascrive. [interpretazione]
- **Neutre / positive:** nessun effetto, oppure PM, carte, simboli gratuiti, ecc. «Ogni giocatore» si risolve partendo dal primo giocatore. I simboli «gratuiti» si mettono come al §6: se non si può, l'effetto va perso. [interpretazione]

## 8. Fine partita e punteggio
Dopo il round delle 19:00 si arriva alle 20:00: **Confronto Finale**.

### Accuratezza
Si sommano i punti delle condizioni soddisfatte sul **bersaglio attuale** (dopo gli Eventi), per tutte e 3 le aree: totale grezzo 0–15. Una condizione è soddisfatta se hai giocato quella regione **e** la carta porta il simbolo richiesto (o la fusione richiesta).

| Totale grezzo | Esito | Punti |
|---|---|---|
| 0 | Previsione mancata | 0 |
| 1–6 | Parzialmente corretta | 3 |
| 7–10 | Buona | 6 |
| 11–13 | Molto accurata | 10 |
| 14–15 | Perfetta | 15 |

### Coerenza Geografica = bonus di confine + pattern
**Bonus di confine / compensativi:** +1 per ogni carta giocata il cui bonus è soddisfatto; si sommano senza tetto (tre regioni della «rete estrema» = +3, le due isole = +2).

**Pattern** (carte adiacenti in orto­gonale; una carta con fusione non partecipa ai pattern base; **ogni simbolo base** su una carta partecipa per conto suo):

| Simbolo | Regola | Punti | Perché |
|---|---|---|---|
| Sole — **Distesa** | per ogni gruppo connesso di Sole | 2 carte = 1 · 3 = 2 · 4 = 4 · 5 = 6 · 6+ = 9 | Gli anticicloni sono i sistemi più ampi e uniformi |
| Temporale — **Cella convettiva** | per ogni gruppo connesso di Temporale | 2 carte = +3 · 3 o più = +6 · isolato 0 [chiarito: per gruppo] | I temporali si organizzano in cluster |
| Pioggia — **Coda di pioggia** | per ogni Pioggia adiacente ad almeno un Temporale | +1 | La pioggia segue i margini del fronte temporalesco |
| Neve — **Manto di quota** | se esiste un gruppo di esattamente 2–3 carte con Neve (una volta sola) [interpretazione] | +4 | La neve è localizzata: Alpi, Appennino |
| Vento — **Ponte** | per ogni Vento adiacente ad almeno 2 simboli diversi tra loro | +2 | Il vento segnala il passaggio tra due masse d'aria |
| Nuvolo — **Frangia** | per ogni Nuvolo adiacente ad almeno un simbolo diverso | +1 | È il simbolo «di passaggio» |
| Nebbia — **Sacca isolata** | per ogni Nebbia senza altra Nebbia adiacente | +2 | La nebbia è iperlocale: unica regola «anti-cluster» |

### Obiettivi Segreti
*Segnaposto: 0 punti finché il mazzo non è scritto.*

### Spareggio [interpretazione]
Più punti totali; a parità più punti di Accuratezza, poi più Accuratezza grezza, poi più Coerenza, poi più PM; se ancora pari: pari merito.

## 9. Parametri (modificabili dall'app per fare esperimenti)
`rounds` 12 · `eventRounds` 4, 7, 10 · `startPM` 2 · `startCards` 2 · `workers` 2 · `thirdWorkerCost` 5 · `marketSize` 5 · `blindPrice` 2 · `poolPerSymbol` 10 · `maxSymbolsPerCard` 2 · `sez2OccupiesSez1` no · `requireAdjacentPlacement` sì · `borderPoints` 1 · `eventDrawer` primo giocatore (variante `rotate` solo per esperimenti).

## 10. Differenze rispetto al Concept v9 originale
| Tema | Concept v9 | Questa versione |
|---|---|---|
| Adiacenza | «contatto fisico», uguale per confine e pattern | Pattern: contatto ortogonale su griglia. Bonus di confine: solo possesso della regione |
| Posizione delle carte | disposte liberamente | Griglia, a contatto ortogonale, ferme dopo averle giocate |
| Simboli | «appoggiati/impilati» sulla carta | Subito su una carta giocata, max 2, non si spostano |
| Fusione | «scatta impilando 2 simboli» | Automatica; la carta conta solo come la fusione |
| Piazzamento | «uno alla volta a rotazione» e «continua a piazzare» | Rotazione stretta; chi passa è fuori dal round |
| Pattern Temporale | ambiguo (per carta o per gruppo) | Per gruppo |
| Pattern Neve | «bonus fisso se esiste un gruppo» | Una volta sola per giocatore |
| 3° lavoratore | «per il resto della partita» | Dal round successivo |
| Primo giocatore / chi pesca l'Evento | non scritto | A sorte, poi ruota; è lui che pesca l'Evento |
| Spareggio | non scritto | Vedi §8 |
| Obiettivi Segreti | pesca 2, tieni 1, punti | Solo il segnaposto (0 punti): il mazzo si scrive con Niky |
