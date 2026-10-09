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
3. Ogni giocatore parte con **2 PM** e **2 Carte Regione** in mano. Nessun limite di carte in mano. [chiarito] **Compensazione dell'ordine di turno:** chi *non* è il primo giocatore della partita parte con **1 PM in più** (3 invece di 2). Chi sceglie per primo ha un piccolo vantaggio: con questa regola le vittorie di chi inizia tornano vicine a quelle attese. [chiarito]
4. Ogni giocatore ha **2 lavoratori**.
5. Il primo giocatore è scelto a sorte [interpretazione] e riceve il segnalino «Protezione Civile» [chiarito].
6. Obiettivi Segreti: ognuno pesca 2 carte Obiettivo, ne tiene 1 in segreto e scarta l'altra (vedi §8). [chiarito]

## 4. Il round
Un round è un'ora della giornata. Ogni round: (1) se è un round-Evento, si pesca la Carta Evento; (2) piazzamento dei lavoratori; (3) i lavoratori tornano a casa e gli spazi si liberano.

**Il primo giocatore passa a sinistra a ogni round.** [interpretazione]
**Carta Evento:** all'inizio dei round 4, 7 e 10 (11:00, 14:00, 17:00). La pesca e la legge ad alta voce chi ha il **segnalino «Protezione Civile»**: dove una carta dice «il giocatore che pesca», è lui. Dopo l'Evento il segnalino passa al giocatore alla sua sinistra. Il segnalino parte dal primo giocatore della partita. [chiarito]

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
- Le carte si giocano sulla **mappa d'Italia**: ogni regione ha **la sua casella fissa**, quindi non scegli dove metterla (la Lombardia sta sempre sopra il Piemonte, la Sicilia in fondo). Le carte non si spostano. [chiarito: forma dell'Italia; la disposizione esatta delle caselle è un'[interpretazione]]
- **Adiacenza** (per i pattern) = due caselle che si toccano a croce (non in diagonale) *e* tutte e due occupate. Il cartogramma è una versione «a scacchiera» dell'Italia: 22 dei 31 confini veri si toccano; Calabria e Sicilia si toccano apposta (lo Stretto). Una carta può restare isolata, se le regioni vicine non sono in gioco.
- Il **bonus di confine non richiede contatto**: basta aver giocato la regione indicata. [chiarito]

```
          TAA
      Lom Ven FVG
  VdA Pie ER
      Lig Tos Mar Abr
          Umb Laz Mol Pug
      Sar         Cam Bas
                      Cal
                      Sic
```

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
| 1–2 | Parzialmente corretta | 3 |
| 3–4 | Buona | 6 |
| 5–6 | Molto accurata | 10 |
| 7–15 | Eccellente | 15 |

*Un gradino ogni 2 punti di previsione: nelle partite simulate si arriva di solito a 2-6 punti grezzi. [chiarito con Niky, dopo le misure]*

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
- A inizio partita ognuno **pesca 2 Obiettivi e ne tiene 1** (l'altro si scarta, coperto). Restano **segreti** fino al Confronto Finale. [chiarito]
- Si controllano **a fine partita**, solo sul **tuo** tavolo, sulla tua mano e sui tuoi PM. Se la condizione è soddisfatta prendi i punti scritti sulla carta, altrimenti **0** (nessuna penalità). [chiarito]
- **Tre fasce di punti: facile 3 · media 5 · difficile 8.** Non c'entrano mai con la previsione. [chiarito]
- «**Carta con il simbolo X**» = carta che porta quel simbolo e non è fusa (come per i pattern). «**Vicine**» = caselle che si toccano a croce sulla mappa. «**Tipi di simbolo**» = i tipi diversi presenti sul tuo tavolo, contando tutti i simboli. [interpretazione]
- L'Evento «Collaborazione internazionale» ti permette di scartare il tuo Obiettivo e pescarne uno nuovo dal mazzo (senza guardarlo prima). [chiarito]
- Il mazzo ha **24 carte** (9 Territorio · 6 Simboli · 3 Pattern · 6 Risorse e azioni). Soglie e fasce sono valori di partenza **[da misurare]**: l'ultima colonna è quanto spesso li raggiunge un giocatore AI Difficile che li ha scelti e ci punta (600 partite, 2 giocatori).

| # | Titolo | Condizione | Punti | Fascia | Riuscita misurata |
|---|---|---|---|---|---|
| T1 | **Tutto lo Stivale** | Almeno 1 regione in ognuna delle 3 aree (Nord, Centro, Sud e Isole). | 3 | facile | 74% |
| T2 | **Pianura Padana** | Almeno 3 regioni del Nord. | 5 | media | 43% |
| T3 | **Dorsale appenninica** | Almeno 2 regioni del Centro. | 5 | media | 46% |
| T4 | **Mediterraneo** | Almeno 3 regioni di Sud e Isole. | 5 | media | 32% |
| T5 | **Rete fitta** | Almeno 2 bonus di confine attivi. | 5 | media | 57% |
| T6 | **Estremo Sud e Isole** | Almeno una tra Calabria, Sicilia e Sardegna. | 3 | facile | 52% |
| T7 | **Costa tirrenica** | Almeno 3 tra Liguria, Toscana, Lazio, Campania, Calabria, Sicilia e Sardegna. | 5 | media | 39% |
| T8 | **Costa adriatica** | Almeno 3 tra Friuli-Venezia Giulia, Veneto, Emilia-Romagna, Marche, Abruzzo, Molise e Puglia. | 5 | media | 16% |
| T9 | **Arco alpino** | Almeno 3 tra Valle d'Aosta, Piemonte, Lombardia, Trentino-Alto Adige, Veneto e Friuli-Venezia Giulia. | 5 | media | 17% |
| S1 | **Cinque fenomeni** | 5 tipi di simbolo diversi sul tuo tavolo. | 3 | facile | 84% |
| S2 | **Carte piene** | 5 carte con 2 simboli ciascuna. | 5 | media | 45% |
| S3 | **Tempo stabile** | 4 carte con lo stesso simbolo. | 3 | facile | 70% |
| S4 | **Neve a bassa quota** | 2 carte con Neve. | 5 | media | 48% |
| S5 | **Tutti i fenomeni in campo** | Tutti e 7 i tipi di simbolo sul tuo tavolo. | 8 | difficile | 11% |
| S6 | **Raffiche di vento** | 2 carte con Vento. | 3 | facile | — |
| P1 | **Nebbia a banchi** | 4 carte con Nebbia, nessuna accanto a un’altra Nebbia. | 3 | facile | 41% |
| P2 | **Cella temporalesca** | 2 carte con Temporale vicine tra loro. | 5 | media | 29% |
| P3 | **Alta pressione estesa** | 3 carte con Sole vicine tra loro. | 8 | difficile | 14% |
| R1 | **Mano vuota** | Nessuna Carta Regione in mano a fine partita. | 3 | facile | 99% |
| R2 | **Economia di guerra** | 7 o più PM e nessuna Carta Regione in mano. | 5 | media | 57% |
| R3 | **Cassaforte** | 9 o più PM a fine partita. | 5 | media | 48% |
| R4 | **Tavolo grande** | 6 o più carte sul tuo tavolo. | 5 | media | 31% |
| R5 | **Squadra al completo** | Hai il 3° lavoratore. | 8 | difficile | 8% |
| R6 | **Cantiere** | 11 o più simboli sul tuo tavolo. | 8 | difficile | 15% |

*La riuscita è alta per le carte che la AI sa inseguire (PM, mano vuota) e bassa per quelle che dipendono dalla fortuna (Tutti i fenomeni, Alta pressione, Squadra al completo): vanno viste al playtest con persone vere.*

### Spareggio [interpretazione]
Più punti totali; a parità più punti di Accuratezza, poi più Accuratezza grezza, poi più Coerenza, poi più PM; se ancora pari: pari merito.

## 9. Parametri (modificabili dall'app per fare esperimenti)
`rounds` 12 · `eventRounds` 4, 7, 10 · `startPM` 2 · `startCards` 2 · `workers` 2 · `thirdWorkerCost` 5 · `marketSize` 5 · `blindPrice` 2 · `poolPerSymbol` 10 · `maxSymbolsPerCard` 2 · `sez2OccupiesSez1` no · `mapMode` italia (variante `libera` = griglia libera a contatto, solo per esperimenti) · `borderPoints` 1 · `eventDrawer` segnalino che passa di mano (variante `first` = il primo giocatore del round, solo per esperimenti) · `objectives` sì (variante no = senza Obiettivi, solo per esperimenti) · `startPMBonus` 0 al primo giocatore e +1 PM a tutti gli altri.

## 10. Differenze rispetto al Concept v9 originale
| Tema | Concept v9 | Questa versione |
|---|---|---|
| Adiacenza | «contatto fisico», uguale per confine e pattern | Pattern: caselle che si toccano a croce sulla mappa d'Italia. Bonus di confine: solo possesso della regione |
| Posizione delle carte | disposte liberamente | Mappa d'Italia: casella fissa per regione, ferme dopo averle giocate |
| Simboli | «appoggiati/impilati» sulla carta | Subito su una carta giocata, max 2, non si spostano |
| Fusione | «scatta impilando 2 simboli» | Automatica; la carta conta solo come la fusione |
| Piazzamento | «uno alla volta a rotazione» e «continua a piazzare» | Rotazione stretta; chi passa è fuori dal round |
| Pattern Temporale | ambiguo (per carta o per gruppo) | Per gruppo |
| Pattern Neve | «bonus fisso se esiste un gruppo» | Una volta sola per giocatore |
| 3° lavoratore | «per il resto della partita» | Dal round successivo |
| Primo giocatore | non scritto | A sorte, poi ruota di uno a ogni round; chi non inizia parte con 1 PM in più (compensazione misurata: senza, chi inizia vince il 55% a 2 giocatori, il 38% a 3 e il 31% a 4) |
| Chi pesca l'Evento | non scritto | Segnalino «Protezione Civile» che passa a sinistra a ogni Evento (a 3 giocatori il primo giocatore pescherebbe sempre tutti e tre gli Eventi) |
| Scala di Accuratezza | 1–6 → 3, 7–10 → 6, 11–13 → 10, 14–15 → 15 | 1–2 → 3, 3–4 → 6, 5–6 → 10, 7+ → 15 (con le soglie vecchie la fedeltà non conveniva: ≈ 9% contro i pattern; ora ≈ 51%) |
| Spareggio | non scritto | Vedi §8 |
| Obiettivi Segreti | pesca 2, tieni 1, punti | Mazzo di 24 carte scritto con Niky: 3 fasce (3/5/8), solo il tuo tavolo, mai legati alla previsione, 0 se non raggiunti |
