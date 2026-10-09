# DOMANI PIOVE
### Sistema definitivo delle Carte Regione — Confini, bonus, prezzi e varianti

*Documento di consolidamento — collegato a Domani-Piove-Concept-v8.md. Sostituisce/integra la sezione 2 del concept con il sistema di bilanciamento sviluppato in sessione di lavoro dedicata.*

---

## 1. Principio generale

Ogni regione italiana ha un numero di **varianti di Carta Regione** pari a:

> 1 Carta Neutra (nessun bonus) + N Carte Confine (1 bonus di confine ciascuna) + eventuali Carte Compensative (1 bonus alternativo ciascuna, per regioni povere di confini)

**Regola cardine: 1 carta = 1 bonus.** Nessuna carta cumula più di un bonus stampato. Ogni bonus di confine o compensativo è sempre una variante di carta a sé stante.

Ogni bonus di confine, salvo eccezioni esplicite, è **unidirezionale**: se Regione A ha il bonus verso Regione B, non è detto che Regione B abbia il bonus verso Regione A. La direzione è stata assegnata secondo il criterio descritto in sezione 2.

**Nota sul punteggio:** il bonus di confine non contribuisce alla scala di accuratezza previsionale — rappresenta la qualità della rete di monitoraggio del giocatore, non una previsione più fedele. Nel punteggio finale confluisce, insieme ai pattern geografici, nel bucket unificato **Coerenza Geografica** (vedi Domani-Piove-Concept-v8.md, sezione 6). Ogni bonus attivo vale **+1 punto** di Coerenza Geografica.

---

## 2. Come si è arrivati al sistema (sintesi del ragionamento)

1. **Partenza**: 1 carta base + 1 carta per ogni confine geografico reale. Risultato troppo sbilanciato (da 1 carta per Sicilia/Sardegna a 7 per Emilia-Romagna/Lazio).
2. **Scoperta**: sommando le varianti per area (non solo il numero di regioni), il Nord risultava quasi il doppio del Sud e Isole (32 vs 22), con il Centro il più povero in assoluto (14).
3. **Regola di riequilibrio applicata a ogni confine tra due regioni:**
   - Se **entrambe le regioni hanno pochi confini reali** (≤3) → bonus **bidirezionale** (combo doppia consentita, premia chi ha comunque poche opzioni).
   - Se **almeno una ha molti confini** (≥4) → bonus **unidirezionale**, assegnato strategicamente (non solo per conteggio grezzo) per non aggravare regioni/aree già povere — vedi criteri caso per caso in sezione 3.
   - A parità, si è ragionato su equità di "chi ha già ceduto qualcosa" nel processo, non su un criterio fisso.
4. **Casi limite (0 o 1 solo bonus-confine attivo) → bonus compensativo:**
   - **Sicilia e Sardegna** (0 confini reali, strutturale): bonus reciproco condizionale — Sicilia ottiene +1 se ha giocato anche Sardegna, e viceversa.
   - **Valle d'Aosta, Friuli-Venezia Giulia, Calabria** (1 solo confine reale): bonus di rete a tre — ciascuna ottiene +1 se ha giocato **almeno una delle altre due**, non serve averle entrambe.
5. **Obiettivo raggiunto**: tutte le regioni "normali" (non isole) convergono a **3 varianti totali** ciascuna, indipendentemente dal numero di confini reali di partenza. Le isole restano a 2 per scelta di design (compensazione diversa, non mancanza).

---

## 3. Tabella finale — NORD (8 regioni)

| Regione | Neutra | Confine (verso) | Compensativo | Totale |
|---|---|---|---|---|
| Valle d'Aosta | 1 | 1 → Piemonte | 1 → rete estrema (Friuli o Calabria) | 3 |
| Friuli-Venezia Giulia | 1 | 1 → Veneto | 1 → rete estrema (Valle d'Aosta o Calabria) | 3 |
| Trentino-Alto Adige | 1 | 2 → Lombardia, Veneto | — | 3 |
| Veneto | 1 | 2 → Emilia-Romagna, Trentino-Alto Adige | — | 3 |
| Piemonte | 1 | 2 → Lombardia, Liguria | — | 3 |
| Liguria | 1 | 2 → Lombardia, Toscana | — | 3 |
| Lombardia | 1 | 2 → Veneto, Emilia-Romagna | — | 3 |
| Emilia-Romagna | 1 | 2 → Piemonte, Liguria | — | 3 |

**Totale varianti Nord: 24**

---

## 4. Tabella finale — CENTRO (4 regioni)

| Regione | Neutra | Confine (verso) | Compensativo | Totale |
|---|---|---|---|---|
| Umbria | 1 | 2 → Toscana, Marche | — | 3 |
| Marche | 1 | 2 → Emilia-Romagna, Toscana | — | 3 |
| Toscana | 1 | 2 → Emilia-Romagna, Lazio | — | 3 |
| Lazio | 1 | 2 → Umbria, Abruzzo | — | 3 |

**Totale varianti Centro: 12**

---

## 5. Tabella finale — SUD E ISOLE (8 regioni)

| Regione | Neutra | Confine (verso) | Compensativo | Totale |
|---|---|---|---|---|
| Sicilia | 1 | — | 1 → con Sardegna | 2 |
| Sardegna | 1 | — | 1 → con Sicilia | 2 |
| Calabria | 1 | 1 → Basilicata *(bidirezionale)* | 1 → rete estrema (Valle d'Aosta o Friuli) | 3 |
| Molise | 1 | 2 → Lazio, Puglia | — | 3 |
| Abruzzo | 1 | 2 → Marche, Molise | — | 3 |
| Campania | 1 | 2 → Lazio, Molise | — | 3 |
| Puglia | 1 | 2 → Campania, Basilicata | — | 3 |
| Basilicata | 1 | 2 → Campania, Calabria *(bidirezionale)* | — | 3 |

**Totale varianti Sud e Isole: 22**

---

## 6. Riepilogo generale

| Area | Regioni | Totale varianti Carte Regione |
|---|---|---|
| **Nord** | 8 | **24** |
| **Centro** | 4 | **12** |
| **Sud e Isole** | 8 | **22** |

**Gerarchia di ricchezza/difficoltà per le future Carte Previsione: Nord (24) > Sud e Isole (22) > Centro (12).**

Il Centro resta l'area strutturalmente più semplice (metà delle regioni delle altre due aree). Nord e Sud e Isole sono invece ora quasi equivalenti in ricchezza (24 vs 22), a differenza del calcolo iniziale grezzo che li dava molto più distanti (32 vs 22).

---

## 7. Confini bidirezionali (eccezioni alla regola unidirezionale)

Solo due confini nell'intera mappa restano bidirezionali, perché coinvolgono sempre regioni con pochi confini reali (≤3) su entrambi i lati:

- **Calabria ↔ Basilicata**

Il confine Puglia-Basilicata, inizialmente bidirezionale, è stato reso **unidirezionale** (solo su Puglia→Basilicata) nel passaggio di ribilanciamento in cui Puglia ha ceduto il proprio confine verso Molise: Basilicata ha perso la direzione verso Puglia come compenso.

Tutti gli altri confini censiti sono unidirezionali per scelta di design (vedi sezione 2, punto 3).

---

## 8. Bonus "rete estrema" (Valle d'Aosta / Friuli-Venezia Giulia / Calabria)

Le tre regioni con un solo confine reale condividono un bonus compensativo a rete:

| Regione | +1 punto se ha giocato... |
|---|---|
| Valle d'Aosta | Friuli-Venezia Giulia **oppure** Calabria |
| Friuli-Venezia Giulia | Valle d'Aosta **oppure** Calabria |
| Calabria | Valle d'Aosta **oppure** Friuli-Venezia Giulia |

**Punteggio additivo, senza tetto**: ogni carta della rete che soddisfa la propria condizione vale +1 per sé stessa, e i punti si sommano — non è un bonus unico fisso per il gruppo. Possedere 2 delle 3 regioni della rete (es. Friuli + Calabria) dà **+2** (ciascuna soddisfa la propria condizione grazie all'altra). Possedere tutte e 3 dà **+3** (ognuna soddisfa la propria condizione). Questa è la stessa identica logica del bonus isole (sezione 9), estesa da 2 a 3 nodi — non una regola diversa.

Cornice tematica proposta ma non vincolante per il regolamento: "Sentinelle d'Italia" o "Regioni di Confine Estremo" (Valle d'Aosta = confine ovest, Friuli = confine est, Calabria = punta sud).

**Nota di bilanciamento**: la condizione resta OR (basta una delle altre due, non serve possederle entrambe) — è leggermente più facile da attivare rispetto al bonus isole, dove serve sempre quella specifica unica altra regione. Il prezzo è comunque identico (vedi sezione 12) per semplicità al tavolo; se il playtest mostra che la rete estrema è sistematicamente più conveniente delle isole, si potrà intervenire lì.

---

## 9. Bonus isole (Sicilia / Sardegna)

- Sicilia ottiene **+1** se ha giocato anche Sardegna, e viceversa.
- **Punteggio additivo**: con solo 2 regioni nel gruppo, il massimo è +2 (una carta per ciascuna condizione soddisfatta) — stessa logica della rete estrema, qui limitata a 2 nodi invece di 3.
- Nessun bonus di confine possibile (0 confini reali, struttura geografica, non correggibile).
- Restano a 2 varianti totali (neutra + compensativa) invece delle 3 di tutte le altre regioni — scelta di design accettata, non un errore residuo.

---

## 10. Copie fisiche e dimensione del mazzo

Il mazzo Carte Regione resta **unico e condiviso** per tutta Italia (non diviso per area) — la separazione Nord/Centro/Sud e Isole vale solo per le Carte Previsione, non per le Carte Regione.

**Criterio scelto per le copie fisiche — livello di tensione "via di mezzo":**

| Tipo carta | Copie per variante | Perché |
|---|---|---|
| Neutra (nessun bonus) | 1 copia | È già la scelta di ripiego, non deve essere né rara né abbondante |
| Confine / Compensativo | 2 copie | Sufficienti da non essere disperante se un avversario ne prende una, ma non tante da eliminare la competizione |

**Totale carte fisiche per area:**

| Area | Neutre (×1) | Bonus (×2) | Totale carte |
|---|---|---|---|
| Nord | 8 | 32 | **40** |
| Centro | 4 | 16 | **20** |
| Sud e Isole | 8 | 28 | **36** |

**Totale mazzo Carte Regione: 96 carte.**

---

## 11. Punti ancora aperti dopo questo consolidamento

- **Gestione mazzo esaurito**: con 96 carte e fino a 4 giocatori, va testato in playtest se il mazzo regge l'intera durata.
- **Testo tematico e flavor** delle carte compensative: da scrivere in fase di editing finale.
- Le Carte Previsione (Core/Secondarie) sono già scritte (36 carte, vedi Domani-Piove-Carte-Previsione-v1-2.md), calibrate su questo documento.
- **Struttura completa della plancia Punti Meteo/lavoratori** (caselle, importi, costo di sblocco del 3° lavoratore): in fase di progettazione, non ancora consolidata in un documento — vedi conversazione di sviluppo corrente.

---

## 12. Prezzi in Punti Meteo (mercato Carte Regione)

**Punti Meteo (PM)** è la valuta introdotta per l'accesso al mercato delle Carte Regione (ottenuta tramite piazzamento lavoratori su una plancia condivisa, ancora in fase di progettazione — vedi sezione 11).

| Categoria carta | Prezzo (PM) |
|---|---|
| Neutra | 1 |
| Confine | 2 |
| Compensativa (isole + rete estrema) | 3 |
| Pesca cieca dal mazzo coperto (qualsiasi categoria) | 2 |

**Perché questi valori:**

- **Neutra economica**: nessun bonus, è la scelta di ripiego — deve costare poco per non penalizzare chi non trova altro.
- **Confine intermedia**: bonus attivabile con una sola condizione (hai giocato la regione giusta).
- **Compensativa più cara**: con il punteggio additivo senza tetto (sezione 8-9), il gruppo compensativo può valere più di una singola carta Confine (fino a +3 per la rete estrema, +2 per le isole) — il prezzo più alto riflette questo potenziale, non solo la rarità nel mazzo.
- **Pesca cieca a 2, non a 1**: sul mazzo intero (96 carte), la composizione è 21% Neutra, 69% Confine, 10% Compensativa — il valore medio di una carta pescata a caso è **1,9 PM**. Fissare il prezzo a 1 avrebbe reso la pesca cieca sempre più conveniente del mercato scoperto (nessun motivo razionale per pagare 2-3 su una carta visibile). A 2 PM il rischio è bilanciato: si perde con una Neutra (21% delle volte), si pareggia con una Confine (69%), si guadagna con una Compensativa (10%).

**Nota**: questo valore medio (1,9) è calcolato sul mazzo pieno a inizio partita. Man mano che si pesca, la composizione residua cambia — un prezzo fisso a 2 resta un'approssimazione accettabile per il prototipo, da osservare in playtest verso fine mazzo.

---

*Documento di consolidamento — sistema Carte Regione v3.0 (numerazione file: Sistema-5, poiché segue Sistema-1, Sistema-2, Sistema-3 e Sistema-4). Collegato a Domani-Piove-Concept-v8.md e Domani-Piove-Milestone-v2-3.md. Aggiornamenti rispetto a Sistema-4: (1) il bonus "rete estrema" e il bonus isole sono ora esplicitamente **additivi senza tetto** (ogni carta che soddisfa la propria condizione vale +1, si somma) invece di un bonus fisso a +1 per il gruppo; (2) aggiunta la sezione 12 con i prezzi in Punti Meteo per categoria di carta (Neutra 1 / Confine 2 / Compensativa 3 / pesca cieca 2), con relativo ragionamento sul valore medio atteso del mazzo.*
