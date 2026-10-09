# Obiettivi Segreti — esempi storici (NON APPROVATI)

**Stato: il mazzo degli Obiettivi Segreti NON esiste ancora. Va creato prima di implementare questa parte del gioco, insieme a Niky.**

Questi esempi servono solo a far capire il tipo di carta. A Niky non erano piaciuti, quindi non vanno usati così come sono né implementati in automatico.

## Regola già decisa (Concept v9, sezione 7)
- A inizio partita si pescano **2 Obiettivi Segreti a testa**, se ne tiene **esattamente 1** e se ne scarta 1.
- Restano **segreti** (sono l'unica informazione nascosta del gioco).
- Danno punti a fine partita se completati; se non completati valgono 0 (nessuna penalità).
- Possono intrecciarsi con i bonus di confine e con le Carte Previsione.
- Punteggio finale = Accuratezza + Coerenza Geografica + **Obiettivi Segreti**.
- Una Carta Evento positiva (#67) permette di scartare il proprio Obiettivo Segreto e pescarne uno nuovo.

## Esempi dalla versione molto vecchia del gioco (chat del 02/09/2026, "Meccaniche di deduzione")
| Esempio | Punti allora |
|---|---|
| "Copri tutto l'Arco Alpino con Neve o Nuvolo variabile" | 8 |
| "Fai un fronte di Pioggia che collega Nord-Ovest e Centro" | 6 |
| "Tutte le Isole con lo stesso simbolo" | 5 |
| "Rappresenta tutti e 6 i simboli meteo almeno una volta" (ex bonus "Varietà") | non assegnato |

## Perché non sono utilizzabili così
- Nascono da un design superato: carte con simboli stampati e mappa personale per giocatore.
- Oggi i simboli arrivano solo dal pool condiviso ("Raccogli un simbolo meteo"), la previsione è unica e condivisa, e i simboli si impilano sulle Carte Regione giocate.
- I punti (8/6/5) non sono mai stati tarati: oggi l'Accuratezza vale al massimo 15.
- Le Carte Evento possono cambiare il bersaglio a metà partita: un obiettivo che dipende da simboli o regioni specifiche può diventare più facile o impossibile.

## Cosa serve decidere per scrivere il mazzo
1. Quanti obiettivi nel mazzo e quanti punti l'uno (da tarare rispetto all'Accuratezza, max 15).
2. Su cosa si basano: simboli, regioni, aree, confini, pattern, fusioni, Punti Meteo o lavoratori.
3. Se un obiettivo può dipendere dalla previsione corrente (che cambia con gli Eventi).
4. Se esiste un obiettivo di tipo "Varietà".
