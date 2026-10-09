# Obiettivi Segreti — BOZZA da approvare insieme a Niky (NON ancora nel gioco)

## Regole già decise
- Si pescano **2 Obiettivi** a testa a inizio partita, se ne **tiene 1** e si scarta l'altro. [chiarito, Concept §7]
- Restano **segreti** fino al Confronto Finale. Se non completato vale **0** (nessuna penalità). [chiarito]
- **3 fasce di punti scritte sulla carta: facile 3 · media 5 · difficile 8.** [chiarito con Niky]
- Possono basarsi su **Territorio, Simboli, Pattern e disposizione, Risorse e azioni**. [chiarito con Niky]
- **Mai legati alla previsione** (né a quella iniziale né al bersaglio attuale): parlano solo di ciò che hai costruito. [chiarito con Niky]
- **24 obiettivi** nel mazzo, 6 per tipo. [chiarito con Niky]
- Si controllano **a fine partita guardando il tavolo** e contando (somme e confronti, niente punti «fluttuanti»).
- L'Evento #67 «Collaborazione internazionale» permette di scartare il proprio Obiettivo e pescarne uno nuovo (già nei dati).

## Definizioni usate (da confermare)
- **«Regione del Nord / Centro / Sud e Isole»**: la partizione ISTAT del gioco (Nord 8, Centro 4, Sud e Isole 8).
- **«Vicine»**: carte a contatto ortogonale (come per i pattern). **«In linea»**: carte contigue su una riga o una colonna.
- **«Carta con il simbolo X»**: carta che porta quel simbolo e non è fusa (come per i pattern). [interpretazione]
- **«Tipi di simbolo»**: i tipi diversi tra i simboli base presenti sul tuo tavolo. [interpretazione]
- Tutto si riferisce solo al **tuo** tavolo, alla tua mano e ai tuoi PM a fine partita.

## La bozza dei 24 (la percentuale è «quanto spesso succede per caso» con l'AI Difficile che NON mira a obiettivi: 800 giocatori-partita, 2 giocatori)
Chi mira all'obiettivo lo raggiunge più spesso: dopo la tua approvazione insegno all'AI a mirarci e rimisuro le fasce.

### Territorio
| # | Titolo | Condizione | Per caso | Fascia |
|---|---|---|---|---|
| T1 | Tutto lo Stivale | almeno 1 regione in ognuna delle 3 aree | 58% | facile · 3 |
| T2 | Valle Padana | 3 o più regioni del Nord | 32% | media · 5 |
| T3 | Dorsale appenninica | 2 o più regioni del Centro | 30% | media · 5 |
| T4 | Mediterraneo | 3 o più regioni di Sud e Isole | 24% | media · 5 |
| T5 | Rete fitta | 3 o più bonus di confine attivi | 19% | media · 5 |
| T6 | Isole gemelle | Sicilia **e** Sardegna | 3,6% | difficile · 8 |

### Simboli
| # | Titolo | Condizione | Per caso | Fascia |
|---|---|---|---|---|
| S1 | Cielo variabile | 5 tipi di simbolo diversi | 50% | facile · 3 |
| S2 | Carte piene | 5 carte con 2 simboli ciascuna | 51% | facile · 3 |
| S3 | Monotema | 4 carte con lo stesso simbolo | 28% | media · 5 |
| S4 | Inverno in arrivo | 2 carte con Neve | 12% | media · 5 |
| S5 | Tavolozza completa | 6 tipi di simbolo diversi | 8,5% | difficile · 8 |
| S6 | Il capolavoro | almeno 1 fusione sul tavolo | 1% | difficile · 8 |

### Pattern e disposizione
| # | Titolo | Condizione | Per caso | Fascia |
|---|---|---|---|---|
| P1 | Sacche di nebbia | 3 carte con Nebbia, nessuna accanto a un'altra Nebbia | 30% | facile · 3 |
| P2 | Fronte compatto | 4 carte a quadrato 2×2 | 24% | media · 5 |
| P3 | Fila indiana | 4 carte in linea | 23% | media · 5 |
| P4 | Cella convettiva | 3 carte con Temporale vicine | 26% | media · 5 |
| P5 | Distesa | 3 carte con Sole vicine | 9% | difficile · 8 |
| P6 | Coda di pioggia | 2 carte con Pioggia, ciascuna accanto a un Temporale | 9,5% | difficile · 8 |

### Risorse e azioni
| # | Titolo | Condizione | Per caso | Fascia |
|---|---|---|---|---|
| R1 | Zero sprechi | nessuna carta in mano | 39% | facile · 3 |
| R2 | Economia di guerra | 2 o più PM **e** nessuna carta in mano | 18% | media · 5 |
| R3 | Cassaforte | 3 o più PM | 12,5% | media · 5 |
| R4 | Collezione | 6 o più carte sul tavolo | 15,5% | media · 5 |
| R5 | Squadra al completo | hai il 3° lavoratore | 6% | difficile · 8 |
| R6 | Cantiere | 11 o più simboli sul tavolo | 7,6% | difficile · 8 |

**Totale: 5 facili (3) · 12 medie (5) · 7 difficili (8).**

## Da riguardare dopo l'approvazione
- Insegnare all'AI a scegliere e perseguire l'obiettivo; rimisurare le percentuali «mirando» e ritoccare le fasce.
- Controllare che gli obiettivi non rovinino l'equilibrio fedeltà/pattern (prove estreme) né il vantaggio di chi inizia.
- Testo «bollettino» e grafica delle carte (SVG 100×140) e inserimento nella partita, nella cronaca e nel Confronto Finale.

## Scartati (troppo facili o inutili)
«4 tipi di simbolo» (91%), «3 carte in fila» (87%), «2 Nebbia isolate» (84%), «tutte le carte con almeno 1 simbolo» (78%), «5 carte o meno ma 8 simboli» (76%), «3 carte in mano» (che premierebbe tenere carte senza giocarle), «7 carte sul tavolo» (0,9%), «2 fusioni diverse» (0%), «5 PM» (0,9%).
