# DOMANI PIOVE — Pacchetto materiali per la versione digitale

> **NOTA PER CLAUDE CODE (da leggere per prima):** il mazzo degli **Obiettivi Segreti non esiste ancora**. Niky lo costruirà insieme a te, ragionandoci a voce prima di implementare qualsiasi cosa. Non inventare tu il mazzo e non usare gli esempi in `01-regolamento/Obiettivi-Segreti-ESEMPI-NON-APPROVATI.md` (a Niky non erano piaciuti): parti da lì solo per capire il tipo di carta, poi chiedi a lui come procedere. Fino a quel momento, costruisci tutto il resto lasciando l'hook per gli Obiettivi Segreti vuoto (pesca 2 / tieni 1 / punti a fine partita).

Esportato dal progetto "Domani Piove" il 09/10/2026. Stato del gioco: **M1 chiuso** (prototipo fisico completo), **M2 (dry-run) e M3 (primo playtest) non ancora fatti**. Tutti i numeri sono valori di partenza da tarare col playtest.

## Cosa c'è dentro

| Cartella | File | Contenuto |
|---|---|---|
| `01-regolamento/` | `Domani-Piove-Concept-v9.md` | **Il regolamento di fatto**: turno, azioni, punteggio, fusioni, pattern, Carte Evento, tutto. Non esiste ancora un regolamento finale scritto (è in M4). |
| | `Domani-Piove-Milestone-v3.1.md` | Tutte le decisioni prese (valori di partenza inclusi), cosa è fatto, **cosa resta da fare**, domande di playtest |
| `02-carte/` | `Domani-Piove-Carte-Regione-Sistema-5.md` | Sistema delle 96 Carte Regione: bonus, confini, prezzi |
| | `Domani-Piove-Carte-Previsione-v1-2.md` | Le 36 Carte Previsione (testo + condizioni) |
| | `Domani-Piove-Carte-Evento-v2.md` | Le 80 Carte Evento (testo + condizioni) |
| `03-dati/` | `regole_e_costanti.json` | Costanti di gioco (round, PM, prezzi, fusioni, scaglioni, pattern) |
| | `carte_previsione.json` | 36 carte, strutturate (area, archetipo, condizioni core/secondarie con simbolo e punti) |
| | `carte_evento.json` | 80 carte, strutturate (tipo A/B/neutra/positiva, regione, fusione, condizione, testo) |
| | `carte_regione_varianti.json` | 58 varianti di Carta Regione, con `copie` (totale 96 carte fisiche) e `prezzo_pm` |

I JSON sono generati dai file `.md` con uno script e **verificati**: 36 Previsione (tutte a 5 punti max, copertura simboli identica alla tabella v1.2), 80 Evento (30 A + 19 B + 31 neutre/positive, tutte le 20 regioni toccate), 96 Carte Regione (40 Nord + 20 Centro + 36 Sud e Isole).

## Cose che NON ci sono (e perché)

- **Obiettivi Segreti — DA CREARE PRIMA, insieme a Niky**: il mazzo non è mai stato scritto (in standby). Esiste solo la regola (pesca 2, tieni 1) e 4 esempi di una versione molto vecchia, che a Niky non erano piaciuti. Sono in `01-regolamento/Obiettivi-Segreti-ESEMPI-NON-APPROVATI.md` solo per far capire il tipo di carta: non vanno implementati così come sono. Prima di costruire questa parte del gioco, bisogna scrivere il mazzo con lui.
- **Plancia Centrale v2** e **Segnapunti v1** (.docx): sono citati nella Milestone ma non sono nel progetto Claude, quindi non li ho potuti esportare. Li hai sul tuo PC. Layout della plancia, descritto nella Milestone: Sezione 1 (5 spazi), Sezione 2 (2 spazi), tracciato ore 8:00→20:00 con Carte Evento a 11/14/17, tabella delle 8 fusioni, riquadro riferimento rapido.
- **Proxy stampabili .docx** (Regione 96, Evento 80, Previsione 36): servono solo per stampare, non per il digitale. Il loro contenuto è già nei file sopra.
- **Carte-Evento-v1** (mazzetto di prova da 19 carte): superato dalla v2.
- Grafica: le carte fisiche sono fatte a mano, nessun asset grafico è nel progetto. I gettoni simbolo sono tondini di legno dipinti.

## Cosa manca da fare (dalla Milestone)

**Prima del playtest (M2/M3):** dry-run in solitaria; playtest reale con 2-3 persone (21 domande di osservazione nella Milestone, sezione M3).

**Dopo il playtest (M4):**
- Scrivere il regolamento finale (con la tabella pattern + colonna "Perché")
- Tarare: scaglioni di accuratezza, valore Nord/Centro/Sud, Coerenza Geografica vs fedeltà, numeri dei 7 pattern
- Rivalutare: limite carte in mano (ora nessuno), simbolo che resta se sostituisci la carta (ora resta), Scarta & Converti (escluso), costo 3° lavoratore (5 PM), frequenza Eventi (ogni 3 round), gettoni pool (10 per tipo), risorse iniziali (2 PM + 2 carte, pensate per 2 giocatori)
- Spazi aggiuntivi sulla plancia lavoratori, solo se si intasa con 3-4 giocatori
- Gettoni dedicati per le 8 fusioni (ora: 2 simboli impilati) e gettoni PM distinguibili dai simboli
- Scrivere gli Obiettivi Segreti
- Mazzo Centro: eventuale varietà aggiuntiva (ora solo 6 coppie di regioni, 12 carte)
- Testo flavor delle carte compensative

## Buchi e incoerenze che incontrerà chi implementa (da decidere con te)

1. **Chi pesca la Carta Evento** alle 11:00/14:00/17:00? Non è scritto. Varie carte positive dicono "il giocatore che pesca questa carta", quindi serve una regola (es. il giocatore di turno / il primo giocatore).
2. **Ordine di turno / primo giocatore**: la rotazione "un lavoratore alla volta" è descritta, ma non chi comincia e se il primo giocatore cambia ogni round.
3. **Fine partita e spareggio**: la partita finisce al round delle 20:00 (Milestone), ma non c'è nessuno spareggio in caso di parità.
4. **Come contano le fusioni sull'Accuratezza**: quando un Evento trasforma il bersaglio (es. Sole → Caldo Estremo), il giocatore deve avere la fusione impilata sulla carta di quella regione. È implicito ma non scritto esplicitamente.
5. **Tipo A**: "se la previsione richiede già [simbolo]" — la condizione si guarda sul bersaglio **attuale** sulla plancia, non sulla carta pescata (quindi un Evento precedente può cambiare l'esito di uno successivo).
6. **Costo del 3° lavoratore**: il Concept dice "da fissare", la Milestone lo fissa a 5 PM. Vale la Milestone (più recente).
7. **Frequenza Eventi**: il Concept dice "2-3 round", la Milestone fissa 1 ogni 3 round. Vale la Milestone.
8. **Tabella del "mazzetto da 16 carte"** in Carte-Evento-v2: la riga "#20 Veneto/Grandine" è sbagliata, quella carta è la **#29** (la #20 è Puglia/Caldo Estremo). Segnalato anche nel file. Il sottoinsieme non serve più (mazzo fisico da 80 già ritagliato).
9. **Riferimenti a file con numeri vecchi** (es. "Carte-Previsione-v1.md", "Concept-v8", "Milestone-v3.md" invece di v3.1): sono solo etichette, i contenuti sono quelli giusti.
10. **Etichette sulle carte fisiche**: nei proxy le carte compensative (isole e rete estrema) si chiamano "BONUS TERRITORIO", nei documenti "Compensativa". Stessa cosa.
11. **Mercato**: 5 carte scoperte + mazzo coperto; il numero di carte è nella Milestone, non nel Concept. Quando una carta viene comprata si rimpiazza dal mazzo (implicito).
12. **Pesca Carte Regione a mazzo esaurito**: non definito (il mazzo da 96 potrebbe finire a 4 giocatori; è un punto aperto).
