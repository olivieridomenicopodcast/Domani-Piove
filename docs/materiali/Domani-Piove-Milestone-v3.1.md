# DOMANI PIOVE
### Roadmap di sviluppo — Milestone verso il primo prototipo (v3)

*Basato su Domani-Piove-Concept-v9.md e Domani-Piove-Carte-Regione-Sistema-5.md*

---

## M0 — Congelare le decisioni minime bloccanti — ✅ TUTTI I PUNTI CHIUSI (aggiornato)

- [x] **Numero e tipi di simboli meteo** — RISOLTO (aggiornato, esteso)
  - 7 simboli base: Sole, Nuvolo, Pioggia, Vento, Temporale, Neve, Nebbia
  - **8 fusioni** (estese da 3, sessione del 15/09/2026), in due famiglie:
    - **Raddoppi (versione estrema dello stesso simbolo)**: Sole+Sole = Caldo Estremo · Vento+Vento = Burrasca · Pioggia+Pioggia = Alluvione · Temporale+Temporale = Downburst · Neve+Neve = Nevicata Estrema
    - **Coppie diverse (fenomeno emergente)**: Temporale+Vento = Tromba d'Aria · Temporale+Sole = Grandine (corretto da Temporale+Neve — meteorologicamente la grandine nasce da convezione intensa alimentata da calore) · Neve+Vento = Tormenta di Neve
    - Nebbia e Nuvolo non hanno fusione propria per ora — elenco volutamente contenuto, ampliabile dopo il primo playtest.
  - **Regola aggiornata**: le fusioni scattano **solo impilando i 2 simboli sulla stessa Carta Regione giocata** — rimossa l'opzione "regioni adiacenti" presente nella versione precedente, per semplicità (stile Alchemy: simbolo+simbolo nello stesso slot = nuovo simbolo).
  - Una Carta Regione giocata può avere più di un simbolo sopra contemporaneamente (semplicemente appoggiati) — necessario per il meccanismo sopra, ora esplicitato.
  - Le fusioni non alimentano più un punteggio "Fenomeno" a parte: modificano direttamente la previsione condivisa (vedi punto sotto e le Carte Evento).
  - **Idea futura accantonata**: fusioni "verso l'alto" che generano simboli base da altre fusioni (es. Nuvolo+Pioggia=Temporale) — piace il concetto ma aggiungerebbe complessità reale, da valutare dopo il primo playtest (vedi Concept-v9 sezione 9.2).

- [x] **Partizione delle regioni italiane nei 3 mazzi di Carte Previsione** — RISOLTO (invariato)
  - Nord (8) · Centro (4) · Sud e Isole (8), partizione ISTAT. Vale solo per le Carte Previsione; il mazzo Carte Regione resta unico e condiviso.

- [x] **Formato minimo di una Carta Regione** — RISOLTO E AGGIORNATO
  - Vedi Carte-Regione-Sistema-5.md per il sistema di bonus di confine/varianti.
  - **Cambio di design**: le Carte Regione non hanno simboli meteo stampati e non danno accesso a nessun simbolo — non è mai stato così sulle carte fisiche, è una precisazione di design confermata, non una correzione a un errore di produzione. Servono solo a stabilire quali regioni hai in gioco e quale bonus di confine attivi. L'unica fonte di simboli meteo in partita è l'azione dedicata "Raccogli un simbolo meteo" dal pool condiviso (vedi sotto).

- [x] **Formato minimo di una Carta Previsione — differenziato per area** — RISOLTO (invariato)
  - Nord e Sud e Isole: 1 Core (2pt) + 3 Secondarie (1pt cad.), 4 regioni toccate, max 5
  - Centro: 1 Core (3pt) + 1 Secondaria (2pt), 2 regioni toccate, max 5

- [x] **Valori della scala di accuratezza — sul totale delle tre aree** — RISOLTO (invariato)
  - Scaglioni: 0→0 · 1-6→3 · 7-10→6 · 11-13→10 · 14-15→15, su un totale grezzo 0-15

- [x] **Formula di punteggio finale — RIVISTA (nuovo, sostituisce la versione con bucket "Coerenza Geografica" a parte dal Fenomeno)**
  - **Punteggio finale = Accuratezza (0/3/6/10/15) + Coerenza Geografica (bonus di confine + pattern) + Obiettivi Segreti.** Restano **3 fonti**, non 4: il Fenomeno **non è più un bucket di punteggio a sé**.
  - Motivo del cambio: le Carte Evento non premiano più direttamente chi genera una fusione — **modificano il bersaglio condiviso** (la previsione sulla plancia centrale) che Accuratezza, Coerenza Geografica e Obiettivi Segreti continuano a misurare normalmente.

- [x] **Previsione condivisa (nuovo, sostituisce il modello con previsione individuale per giocatore)**
  - A inizio partita si pescano **3 Carte Previsione in totale** (una per area), **non una per giocatore**: rappresentano un'unica "vera giornata" che tutti devono ricreare.
  - Si leggono pubblicamente e si trasferiscono su **gettoni/segnalini sulla plancia centrale condivisa**, che resta l'unica fonte di verità per tutta la partita.
  - Effetto sul mercato: tutti i giocatori hanno bisogno esattamente delle stesse Carte Regione — la corsa al mercato diventa più diretta.

- [x] **Struttura del turno — piazzamento lavoratori (nuovo, sostituisce il turno "1 azione")**
  - Round = 1 ora della giornata, da 8:00 a 20:00 (**12 round, confermato** — non più provvisorio).
  - 2 lavoratori base a testa, 3° sbloccabile — **costo fissato a 5 Punti Meteo** come valore di partenza per il primo playtest.
  - Piazzamento **un lavoratore alla volta, a rotazione tra i giocatori** dentro il round (come Agricola/Caylus). Spazio occupato resta bloccato fino al cambio di round (stile stagioni Everdell).
  - Sezione 1 (1 lavoratore ciascuno, **5 spazi, confermati senza modifiche per il primo playtest**): Gioca una carta · Compra una carta (paga in PM) · Raccogli un simbolo meteo (dal pool condiviso — **unica fonte di simboli del gioco**) · Guadagna 1 Punto Meteo · Sblocca lavoratore.
  - Sezione 2 (2 lavoratori ciascuno): Doppia azione · Azione ripetuta.
  - **Punti Meteo (PM)** è la valuta per accedere al mercato Carte Regione — prezzi già fissati in Carte-Regione-Sistema-5.md sezione 12 (Neutra 1 · Confine 2 · Compensativa 3 · Pesca cieca 2), e confermati validi anche col nuovo sistema simboli, dato che riguardano solo l'acquisto della carta (regione + bonus di confine), non simboli.

- [x] **Carte Evento — meccanismo e ruolo (nuovo, chiarito nella sessione del 15/09/2026)**
  - **Tipo A (condizionale)** / **Tipo B (incondizionato)**, guardrail comune, carte neutre/positive possibili.
  - **Chiarimento importante**: entrambi i tipi riguardano sempre e solo il Fenomeno (le fusioni) — Tipo A scatena la fusione solo se la regione richiede già il simbolo compatibile, Tipo B la impone direttamente a prescindere. Nessuna Carta Evento scambia mai un semplice simbolo base con un altro simbolo base.
  - **Frequenza fissata per il primo playtest**: 1 carta ogni 3 round (11:00, 14:00, 17:00 — 3 attivazioni sui 12 round).
  - **Mazzetto di prova scritto (19 carte)**: vedi Domani-Piove-Carte-Evento-v1.md — 8 Tipo A (una per fusione) + 6 Tipo B (6 fusioni in versione aggressiva) + 5 neutre/positive, in stile bollettino/allerta Protezione Civile.

- [x] **Risorse di partenza (nuovo — RISOLTO, rivisto)**
  - **Punti Meteo iniziali: 2 a testa** (corretto da 0 — con 0 nessuno poteva permettersi "Compra una carta" al primo turno, vedi motivazione sotto).
  - **Carte Regione in mano al round 1: 2 a testa** (corretto da 0) — oltre a queste, si continuano ad acquisire carte dal display di mercato scoperto o dal mazzo coperto tramite l'azione "Compra una carta" (confermato: il mercato con display scoperto + pesca cieca e i 4 prezzi differenziati per categoria sono già documentati in Concept-v9 sezione 3 e in Carte-Regione-Sistema-5.md sezione 12).
  - **Motivo della correzione**: con 0 PM e 0 carte a testa, nessun giocatore avrebbe potuto permettersi "Compra una carta" (costo minimo 1 PM) né "Gioca una carta" al primissimo turno — il round 1 sarebbe stato quasi obbligatoriamente tutto "Guadagna 1 PM"/"Raccogli un simbolo meteo", un avvio piatto. Con 2 PM e 2 carte a testa, dal round 1 tutte le azioni di Sezione 1 sono già potenzialmente disponibili.

- [x] **Obiettivi Segreti — regola di pesca (nuovo — RISOLTO)**
  - Si pescano **2 Obiettivi Segreti a testa** a inizio partita, **se ne tiene esattamente 1 e se ne scarta 1** (regola confermata — risolve l'ambiguità "se ne tiene almeno 1, da confermare" del Concept-v9 sezione 7, ora aggiornata anche lì).

- [x] **Quantità di gettoni simbolo nel pool condiviso (nuovo — RISOLTO come valore di partenza)**
  - **10 gettoni per ciascuno dei 7 simboli base**, per il primo playtest (pensato a 2 giocatori). Scelta deliberatamente abbondante: si parte larghi per far girare il gioco, e si restringe in M4 se il playtest mostra che il pool è troppo generoso.
  - Gli **8 simboli di fusione** (Caldo Estremo, Burrasca, Alluvione, Downburst, Nevicata Estrema, Tromba d'Aria, Grandine, Tormenta di Neve) non si pescano dal pool: nascono impilando 2 simboli base compatibili sulla stessa Carta Regione giocata (sezione 6-bis del Concept). **Soluzione per il primo playtest (sessione del 25/09/2026)**: non ancora realizzati gettoni fisici dedicati per le fusioni — quando avviene una fusione, i 2 gettoni base restano semplicemente impilati sulla carta a segnalare che è successo, e verranno sostituiti con gettoni speciali dedicati in un secondo momento. Soluzione temporanea ma sufficiente per giocare.

- [x] **Pattern geografici — regola per simbolo (nuovo — RISOLTO, sessione del 15/09/2026)**
  - Ogni simbolo meteo ha una propria regola spaziale, non un'unica formula ripetuta sette volte (tabella completa con le motivazioni in Domani-Piove-Concept-v9.md sezione 6): **Sole = Distesa** (punti scalari sul cluster connesso, 2=1/3=2/4=4/5=6/6+=9) · **Temporale = Cella convettiva** (+3 se 2+ adiacenti, +6 se 3+, isolato = 0) · **Pioggia = Coda di pioggia** (+1 per carta adiacente ad almeno un Temporale) · **Neve = Manto di quota** (+4 fisso per un gruppo di esattamente 2-3 adiacenti, niente oltre) · **Vento = Ponte** (+2 per carta adiacente ad almeno 2 simboli diversi) · **Nuvolo = Frangia** (+1 per carta adiacente ad almeno 1 simbolo diverso) · **Nebbia = Sacca isolata** (+2 per carta SENZA altra Nebbia adiacente, anti-cluster).
  - Adiacenza = contatto fisico sul tavolo, stessa definizione del bonus di confine.
  - Le carte con un fenomeno fuso sopra (es. Downburst) non partecipano più ai pattern base, per default — decisione rivedibile.
  - Numeri tutti provvisori, da tarare in playtest.
  - **Nota per il regolamento finale**: riportare la tabella con la colonna "Perché" — le motivazioni aiutano a spiegare e ricordare le regole al tavolo, vedi M4.
  - **Con questo si chiude l'ultimo bloccante reale per M3 — vedi sezione M3 sotto.**

**Rimandabile a dopo M3** (default ragionevole ora, si corregge col playtest):
- **Limite di carte in mano: nessun limite per il primo playtest** (deciso — resta comunque da rivalutare in M4 se emergono problemi di accumulo).
- **Sostituzione di una Carta Regione con un simbolo già impilato sopra: il simbolo resta** (deciso per il primo playtest — da rivalutare in M4).
- **Scarta & Converti: non incluso nel primo prototipo** (deciso — resta un'azione futura, non nel round di test).
- Numeri delle 7 regole di pattern geografico — RISOLTE nella forma, provvisorie nei valori numerici (vedi sopra).
- Valore in punti dei bonus di confine: **confermato +1 punto per bonus attivo** (Carte-Regione-Sistema-5.md sezione 1).
- ~~Rapporto tra Tipo A/B e carte negative/neutre/positive nel mazzo definitivo delle Carte Evento~~ — **RISOLTO**: fissato a 30/19/31 (circa 37,5%/24%/38,5%), vedi Domani-Piove-Carte-Evento-v2.md (versione 2.1) — una prima versione (30/19/19, 72% fenomeno) è stata corretta perché troppo punitiva.
- Gestione mazzo Carte Regione esaurito (96 carte, fino a 4 giocatori)
- ~~Testo tematico/flavor delle Carte Evento~~ — **RISOLTO**: mazzo definitivo di 80 carte scritto in stile bollettino/allerta Protezione Civile, vedi Domani-Piove-Carte-Evento-v2.md. Resta aperto il testo tematico/flavor delle carte compensative.
- Taratura finale dei punti per scaglione (0/3/6/10/15) rispetto al peso di Coerenza Geografica e Obiettivi Segreti
- Eventuale mix di strutture nel mazzo Centro (2 vs 3 regioni) per varietà aggiuntiva
- ~~Formato fisico della plancia centrale (deve mostrare 3 previsioni + spazi azione contemporaneamente)~~ — **RISOLTO**: plancia centrale v2 realizzata e confermata fisicamente (sessione del 25/09/2026) — nessuno slot dedicato per le 3 Carte Previsione o per il display di mercato: restano semplicemente appoggiate sul tavolo accanto alla plancia. Vedi M1.

---

## M1 — Prototipo fisico "quick & dirty" — ✅ TUTTI I PUNTI CHIUSI (aggiornato, sessione del 25/09/2026)

- [x] Carte Regione — **tutte e 96 già realizzate a mano e ritagliate**, senza simboli stampati (mai stati previsti sulle carte fisiche — nessun disallineamento da correggere). Il primo playtest userà il mazzo completo.
- [x] Carte Previsione — **tutte e 36 realizzate e ritagliate** (versione v1.2 — vedi Domani-Piove-Carte-Previsione-v1-2.md per il testo e Domani-Piove-Carte-Previsione-Proxy-Completo-36.docx per il proxy stampabile usato per il ritaglio). Rispetto alla v1.1 originale sono stati ribilanciati 5 simboli Secondaria (5 Sole tolti: 2 → Vento, 1 → Neve, 1 → Nebbia, più un ulteriore Vento) in modo che tutte e 3 le aree tocchino tutti e 7 i simboli meteo. Copertura finale: Sole 38 (31,7%) · Nuvolo 24 · Pioggia 21 · Temporale 18 · Vento 8 (6,7%) · Neve 6 (5,0%) · Nebbia 5 (4,2%).
- [x] Gettoni simbolo meteo per il pool condiviso — **realizzati**: tondini di legno dipinti a mano con i disegni dei simboli, 10 per ciascuno dei 7 simboli base (70 gettoni totali). Le fusioni (8 tipi) non hanno ancora gettoni dedicati: per il primo playtest, quando 2 simboli si impilano sulla stessa Carta Regione, si lasciano visibilmente impilati per segnalare che la fusione è avvenuta, e verranno sostituiti con gettoni speciali dedicati in seguito.
- [x] Plancia centrale — **realizzata fisicamente e confermata** (v2 — Domani-Piove-Plancia-Centrale-v2.docx), stampata in orizzontale a piena pagina, con: Sezione 1 (5 spazi azione), Sezione 2 (2 spazi azione), tracciato delle ore 8:00→20:00 con le caselle Carta Evento evidenziate (11:00/14:00/17:00) e la casella finale "20:00 — FINE PARTITA" in evidenza (serve un cubetto segnaore per avanzare sul tracciato), tabella di riferimento delle 8 fusioni, riquadro di riferimento rapido (risorse iniziali, prezzi mercato, pool simboli). Le 3 Carte Previsione rivelate e il display di mercato non hanno slot dedicati: restano semplicemente appoggiate sul tavolo accanto alla plancia.
- [x] Mazzo/display per il mercato Carte Regione — **risolto: nessun oggetto fisico dedicato necessario**. Il "display" è costituito dalle Carte Regione vere e proprie: 5 carte scoperte sempre in mostra (stile Splendor) + mazzo coperto per la pesca cieca. I Punti Meteo (la valuta di acquisto) si tracciano con gettoni sciolti (vedi sotto).
- [x] Le Carte Evento — **mazzo fisico ritagliato**: il set completo di 80 carte del mazzo definitivo (testo in Domani-Piove-Carte-Evento-v2.md, proxy stampabile in Domani-Piove-Carte-Evento-Proxy-Completo-80.docx) è stato tagliato integralmente — non solo il sottoinsieme minimo da 16 carte previsto inizialmente per il primo playtest.
- [x] **Tracciamento dei Punti Meteo (PM)** *(punto aggiunto durante il prototipaggio, non nella checklist originale)* — risolto con **gettoni sciolti**: trovati tondini di legno beige adatti allo scopo. ⚠️ **Nota aperta**: sono visivamente troppo simili ai gettoni simbolo meteo (stesso legno beige, ma senza disegno sopra, mentre i simboli meteo hanno il disegno del simbolo) — **da sostituire con gettoni più chiaramente differenziati** prima del playtest, per evitare confusione al tavolo tra "quanti PM ho" e "che simboli ho raccolto".
- [x] **Segnapunti per il Confronto Finale** *(bonus, non nella checklist originale)* — creato **Segnapunti v1** (Domani-Piove-Segnapunti-v1.docx): foglio A4 diviso in 4 quadranti ritagliabili, ciascuno con le righe da compilare per Accuratezza (totale grezzo 0-15 e scaglione corrispondente), Coerenza Geografica (bonus di confine, bonus di pattern, totale) e Obiettivi Segreti, più la riga del totale finale. Serve solo al Confronto Finale di fine partita, non durante il gioco.

**Nota aperta non bloccante per M1/M2**: gli **Obiettivi Segreti restano in standby**, su richiesta esplicita — esiste un solo esempio isolato nei documenti di progetto e il mazzo completo non è ancora scritto. Non blocca M1/M2 (il dry-run può procedere ignorando quel bucket di punteggio), ma andrà chiuso prima di un Confronto Finale reale in M3.

---

## M2 — Dry-run in solitaria

- [ ] Simulare 2-4 giocatori muovendo le carte da solo
- [ ] Verificare il piazzamento lavoratori a rotazione (un lavoratore alla volta, spazio bloccato fino al cambio round)
- [ ] Verificare il flusso Rivelazione → round di piazzamento → Carte Evento → Confronto Finale senza incastri
- [ ] **Verificare il round 1 con 2 PM e 2 carte in mano a testa** — controllare che il ventaglio di azioni disponibili da subito funzioni come previsto (vedi nota in M0, Risorse di partenza)
- [ ] Provare a mano il conteggio del totale 0-15 e la lettura dello scaglione
- [ ] Provare a mano la somma finale Accuratezza + Coerenza Geografica + Obiettivi Segreti
- [ ] Verificare che le Carte Evento, quando si attivano, siano facili da applicare sulla plancia centrale (cambio gettone) senza confusione
- [ ] Annotare dubbi/ambiguità emerse, in particolare sulla lunghezza reale della partita con 12 round e sul ritmo di raccolta simboli dal pool condiviso

---

## M3 — Primo playtest reale (2-3 persone)

**✅ Nessun bloccante reale rimasto.** Le 7 regole di pattern geografico (sezione M0) chiudono l'ultimo punto che impediva di giocare una partita completa fino al Confronto Finale. Tutti gli ex-bloccanti (risorse di partenza, capacità plancia lavoratori, quantità gettoni pool, pattern geografici) sono stati fissati come valori di partenza per il primo playtest — vedi M0. Si può passare a M1/M2 e poi sedersi al tavolo.

Usare come checklist di osservazione le domande guida del concept (sezione 12), più le nuove aperte da M0:

1. La rivelazione totale a inizio partita genera competizione sentita per le risorse, o viene ignorata?
2. La scala di accuratezza a scaglioni sul totale delle tre aree è soddisfacente da dichiarare?
3. I conflitti previsione-vs-Coerenza Geografica generano decisioni interessanti, o solo confusione al tavolo?
4. Quanto spesso conviene rompere la previsione per inseguire la Coerenza Geografica?
5. Il formato differenziato delle Carte Previsione (Centro a 2 regioni, Nord/Sud a 4) risulta coerente ai giocatori?
6. Il gioco regge per 45-60 minuti a 2-4 giocatori senza risultare ripetitivo, **con 12 round e piazzamento a rotazione**?
7. Il Confronto Finale funziona anche senza effetto sorpresa?
8. Le fusioni (ora 8 tipi: 5 raddoppi + 3 coppie emergenti) capitano abbastanza spesso da sentirsi speciali, o sono troppo rare/frequenti con la regola "solo stessa carta"? E si ricordano facilmente tutte le 8, o sono già troppe da tenere a mente al tavolo?
9. Il mercato gratuito/a pagamento in PM risulta già abbastanza teso, dato che ora tutti vogliono le stesse regioni?
10. Il mazzo Carte Regione da 96 carte regge l'intera partita a 4 giocatori?
11. Con solo 6 combinazioni possibili di coppie di regioni nel mazzo Centro, i giocatori notano ripetizione tra partite diverse?
12. Il bucket Coerenza Geografica resta percepito come secondario rispetto alla fedeltà, o inizia a superarla in peso?
13. *(nuovo)* Il piazzamento lavoratori a rotazione (un lavoratore alla volta) è chiaro subito, o richiede una spiegazione lunga?
14. *(nuovo)* Le Carte Evento (Tipo A/B), con 3 attivazioni sui 12 round (11:00/14:00/17:00), sono percepite come un tocco di imprevedibilità gradito, troppo rade o troppo punitive quando rompono un piano già costruito?
15. *(nuovo)* La corsa al mercato, ora che la previsione è condivisa e identica per tutti, risulta più tesa/interessante o troppo deterministica (chi arriva prima vince quella regione)?
16. *(nuovo)* 12 round da un'ora ciascuno fanno sentire la partita della lunghezza giusta?
17. *(nuovo)* Separare le Carte Regione (solo territorio/confine) dai simboli (solo pool condiviso) rende i due sistemi più chiari da spiegare, o li rende due meccaniche scollegate che sembrano appartenere a giochi diversi?
18. *(nuovo)* Con 2 PM e 2 carte iniziali, il round 1 si sente come un avvio naturale e già ricco di scelte, o le opzioni disponibili sono comunque troppo poche?
19. *(nuovo)* 10 gettoni per simbolo nel pool bastano per 2 giocatori senza mai risultare scarsi, o sono già visibilmente troppi (pool che non si esaurisce mai)?
20. *(nuovo)* La plancia lavoratori (5 spazi Sezione 1 + 2 Sezione 2) si intasa con 3-4 giocatori, anche se il primo test è a 2?
21. *(nuovo)* I gettoni PM (attualmente identici nel materiale ai gettoni simbolo meteo, solo senza disegno) creano davvero confusione al tavolo, o basta la convenzione "senza disegno = PM"?

---

## M4 — Iterazione e bilanciamento

- [ ] **Scrivere il regolamento finale** — includere la tabella delle 7 regole di pattern geografico con la colonna "Perché" così com'è (Concept-v9 sezione 6), non solo le regole nude: le motivazioni aiutano a spiegarle e ricordarle al tavolo.
- [ ] Aggiustare la scala di accuratezza (soglie e/o punti) in base ai risultati
- [ ] Tarare il valore relativo Nord/Centro/Sud e Isole
- [ ] Bilanciare Coerenza Geografica vs fedeltà
- [ ] Tarare i numeri delle 7 regole di pattern geografico (valori di partenza fissati in M0)
- [ ] Rivalutare limite carte in mano, gestione simbolo su sostituzione carta, e Scarta & Converti, se il playtest mostra che i default scelti in M0 non bastano
- [ ] Decidere se introdurre la valuta dedicata in forma diversa, in base a quanto emerso su tensione di mercato
- [ ] Decidere se il mazzo Centro necessita di varietà aggiuntiva
- [ ] Confermare o ritarare il costo di sblocco del 3° lavoratore (valore di partenza: 5 PM)
- [ ] **Progettare gli spazi aggiuntivi della plancia lavoratori**, solo se il playtest mostra intasamento reale con 3-4 giocatori
- [ ] Confermare o ritarare la frequenza delle Carte Evento (valore di partenza: ogni 3 round)
- [ ] **Ritarare la quantità di gettoni simbolo nel pool condiviso** (valore di partenza: 10 per tipo) in base a quanto osservato — probabile riduzione se il pool risulta troppo abbondante
- [ ] Rivalutare se le Risorse di partenza (2 PM, 2 carte) restano valide anche a 3-4 giocatori, non solo nel primo test a 2
- [ ] Rivalutare se serve un secondo giro di playtest o si può passare a scheda di game design completa
- [ ] **Realizzare gettoni dedicati per le 8 fusioni**, a sostituire la soluzione temporanea "2 simboli base impilati" usata nel primo playtest
- [ ] **Sostituire i gettoni Punti Meteo** con qualcosa di chiaramente distinguibile dai gettoni simbolo meteo (attualmente entrambi tondini di legno beige, differenziati solo dall'assenza di disegno)
- [ ] **Scrivere il mazzo degli Obiettivi Segreti**, attualmente in standby (solo 1 esempio isolato esistente) — da riprendere quando il resto del prototipo fisico è stato validato in playtest

---

*Documento di roadmap v3.1 — collegato a Domani-Piove-Concept-v9.md e Domani-Piove-Carte-Regione-Sistema-5.md.*

**Storico aggiornamenti principali:**
- **v2.3 → v2.4**: previsione condivisa unica; turno riscritto come piazzamento lavoratori con PM; il Fenomeno non è più una quarta fonte di punteggio; regola fusioni semplificata a "solo stessa Carta Regione".
- **v2.4 → v3.0**: fissati costo 3° lavoratore (5 PM) e frequenza Carte Evento (ogni 3 round); confermate le 96 Carte Regione già realizzate; corretta l'azione "Raccogli un simbolo meteo" (5 spazi di Sezione 1, non 4); **cambio di design**: le Carte Regione non danno più simboli, unica fonte è il pool condiviso.
- **v3.0 (stessa sessione, aggiornamento successivo)**: fissate le Risorse di partenza — prima tentativo a 0 PM/0 carte, poi corretto a **2 PM e 2 Carte Regione a testa** per evitare un round 1 senza scelte reali; confermata la capacità della plancia lavoratori (5+2 spazi, nessuna modifica per il primo playtest); fissata la quantità di gettoni nel pool condiviso (10 per ciascuno dei 7 simboli base); confermati come default nessun limite di carte in mano, simbolo che resta in caso di sostituzione carta, e Scarta & Converti escluso dal prototipo; confermato il numero di round (12, 8:00-20:00); deciso di usare il mazzo completo delle 36 Carte Previsione invece di un sottoinsieme di 3; fissata la regola esatta degli Obiettivi Segreti (2 pescati a testa, se ne tiene 1 e se ne scarta 1 — aggiornata anche nel Concept-v9 sezione 7); estese le fusioni da 3 a 8 (raddoppi = versione estrema, coppie diverse = fenomeno emergente), corretta Grandine da Temporale+Neve a Temporale+Sole, e accantonata come idea futura l'estensione delle fusioni "verso l'alto" (simboli base generati da altre fusioni).
- **v3.0 (stessa sessione, aggiornamento finale)**: definite le 7 regole di pattern geografico, una per simbolo (Sole=Distesa, Temporale=Cella convettiva, Pioggia=Coda di pioggia, Neve=Manto di quota, Vento=Ponte, Nuvolo=Frangia, Nebbia=Sacca isolata), scelte incrociando meteorologia reale e uso dei simboli nelle 36 Carte Previsione; carte con fenomeno fuso escluse dai pattern base per default; numeri provvisori. **Nessun bloccante reale rimasto: M3 può partire.**
- **v3.0 (correzione)**: le Carte Previsione hanno contenuto/struttura finalizzati ma NON sono ancora realizzate fisicamente (a differenza delle 96 Carte Regione) — corretta una svista nel checklist M1 che le segnava già come fatte.
- **v3.0 (Carte Evento)**: scritto un mazzetto di prova di 19 Carte Evento (Domani-Piove-Carte-Evento-v1.md), in stile bollettino/allerta Protezione Civile — 8 Tipo A (una per fusione) + 6 Tipo B (6 fusioni in versione incondizionata) + 5 neutre/positive. Chiarita e stretta la definizione di Tipo B (Concept-v9 sezione 6-bis): impone sempre una fusione, mai un semplice simbolo base — correzione di un'implementazione errata emersa durante la scrittura. Contenuto finalizzato, non ancora realizzato fisicamente.
- **v3.0 (Carte Evento — mazzo definitivo)**: esteso il mazzetto di prova a un mazzo definitivo di 68 carte (Domani-Piove-Carte-Evento-v2.md) — 30 Tipo A + 19 Tipo B + 19 neutre/positive — applicando un criterio di curatela per plausibilità meteorologica reale (ricerca su grandinate in Pianura Padana, rischio idrogeologico in Liguria, trombe d'aria in Puglia/Sicilia) invece della copertura esaustiva regione×fenomeno: ogni fusione è associata a 2-4 regioni "di casa", le altre regioni compaiono soprattutto tramite carte neutre/positive. Corretta l'assegnazione della Grandine (spostata anche sulla Pianura Padana, non solo Toscana/Umbria). Tutte le 20 regioni sono ora toccate da almeno una carta.
- **v3.0 (Carte Evento — correzione rapporto, v2.1)**: il rapporto 30/19/19 (72% carte fenomeno) è stato giudicato troppo punitivo. Corrette le 5 carte "nessun effetto" che nominavano erroneamente una regione (ora tutte generiche/nazionali) e aggiunte 12 nuove carte positive senza toccare le Tipo A: il mazzo definitivo passa da 68 a **80 carte** (30 Tipo A + 19 Tipo B + 31 neutre/positive, circa 61%/39%). Il sottoinsieme per il primo playtest passa da 14 a 16 carte (20% di 80), così da non dover realizzare fisicamente tutte le 80 carte prima di M3.
- **v3.0 → v3.1 (sessione del 25/09/2026 — chiusura M1)**: **M1 chiuso al 100%.** Realizzate fisicamente e ritagliate tutte e 36 le Carte Previsione (versione v1.2, ribilanciata su 5 simboli Secondaria per coprire tutti e 7 i simboli in ogni area); ritagliato il mazzo completo delle 80 Carte Evento; realizzati i 70 gettoni simbolo meteo base (10 × 7 simboli) dipinti a mano; costruita e confermata fisicamente la Plancia Centrale v2 (orizzontale, Sezione 1 + Sezione 2 + tracciato ore + tabella fusioni + riferimento rapido); risolto il display di mercato come non richiedente alcun oggetto dedicato (le Carte Regione stesse, 5 scoperte + mazzo coperto); risolto il tracciamento dei Punti Meteo con gettoni sciolti (trovati, ma segnalati come da sostituire per distinguibilità dai gettoni simbolo); creato come bonus un Segnapunti v1 a 4 quadranti per il Confronto Finale. Rimane volutamente in standby, su richiesta esplicita, il mazzo degli Obiettivi Segreti (solo 1 esempio isolato esistente) — non bloccante per M1/M2, da riprendere più avanti. Aggiunti a M4 tre nuovi item di follow-up: gettoni fusione dedicati, gettoni PM distinguibili, scrittura del mazzo Obiettivi Segreti.
