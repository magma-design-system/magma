# Studio di Magma: il modello degli oggetti

Il modello da cui derivano le viste dello studio (`projects/studio`), scritto con
`v2:design-interview` il 2026-11-20, nel formato `object-model.md` del plugin v2. Si parte da qui
per costruire (`v2:design-build`), per cambiare un flusso (`v2:design-reframe`) e per verificare
le schermate (`v2:design-audit`).

Ogni risposta dice da dove viene: **(persona)** l'ha detta o scelta chi bilancia Magma;
**(progetto: file)** viene dal repository; **(nota)** dal documento di partenza
`.claude/reports/studio-struttura-del-tema.md` del checkout principale, non versionato;
**(proposta)** è un'inferenza da confermare. Lo stato del tema descritto è quello di Magma 3
(branch `1292-magma-3` più la PR #1474).

## 1. Obiettivo

Alla fine c'è un **tema rilasciabile**: per Magma, il suo preset, con cui si compila; per un
prodotto, il preset di Magma modificato ed esportato come preset suo, da installare nel suo
progetto. Il flusso è **uno solo** per i due casi. (persona)

**Fatto**, per un tema: nessuna coppia della verifica che blocca, e il tema giudicato sulla
scena in chiaro e in scuro. Per l'insieme: ogni tema del preset così. (persona)

**Cosa cambia**: si bilancia **in ordine**: colori, pesi, temi, eccezioni per ultime, senza
tornare indietro. (persona)

**Perché ora** (persona):
- Magma 3 porta i ruoli relativi (alpha, intensità, strati di stato), che lo studio non sa
  ospitare;
- le pagine di Colori vengono dal playground e non dal flusso del bilanciamento;
- il tema di Magma 3 va bilanciato e verificato presto.

**Prima uscita**: il colore di Magma 3, cioè palette, superfici, ruoli con banda e traccia, tema
e verifica. Le eccezioni dei componenti e gli assi dimensionali vengono dopo. (persona)

**Successo** (persona):
- il tema di Magma 3 si bilancia tutto nello studio, senza kit né board esterne;
- chi progetta un prodotto fa il suo tema senza aiuto.

**Ipotesi più rischiosa**: che ai prodotti serva davvero un tema loro. Il primo prototipo deve
provarlo. (persona)

## 2. Persone

### Chi bilancia Magma

- **Chi è**: la persona intervistata. Bilancia il preset di Magma e decide le eccezioni.
  (persona)
- **Cosa porta**: l'occhio sul prodotto, le scelte di palette e di peso. (persona)
- **Cosa giudica**: l'equilibrio dei pesi sulla scena, in chiaro e in scuro. (persona)
- **Percorso dell'ultima volta (2026-11-18)** (persona, sulla proposta dal progetto: #1441,
  #1458, #1460):
  1. la palette: colorspace e saturazione delle famiglie;
  2. le superfici: la luminosità, nella pagina Superficie semantica di oggi;
  3. Configurazione -> Download config.
- **Dove si rallenta**: nell'andare avanti e indietro tra le pagine dei controlli e la scena per
  giudicare. (persona)
- **Cosa vuole**: sentirsi **sicuro**, cioè vedere cosa tocca ogni modifica, prima e dopo, e
  **veloce**, cioè pochi passi tra la modifica e il verdetto sul prodotto. (persona)
- **Chi porta la complessità**: lo studio. Motore e verifica tengono le soglie, chi bilancia non
  ragiona in Lc. (persona)
- **Guida**: dentro lo studio, non nella documentazione. (persona)
- **Fatti che contano**: lavora su desktop largo, con mouse e tastiera. (persona)

### Chi fa il tema di un prodotto

Questa voce è un'**ipotesi** della persona, da confermare con il team del sito docs (vedi
Domande aperte).

- **Cosa porta**: il colore del brand e il tono dei neutri. (persona)
- **Cosa fa**: parte dal preset di Magma o da un tema pronto, lo modifica e lo esporta come nuovo
  tema da installare nel suo progetto. (persona)
- **Cosa può modificare**: tutto, comprese le rampe di tutti i token e i pesi, che
  stanno nel preset del prodotto, sopra quello di Magma. In futuro anche padding e
  scala dei componenti. Nessuna azione è riservata a chi bilancia Magma. (persona)

### Fuori dallo studio

Chi rilascia non lavora nello studio: riceve il preset, guarda la CI e pubblica.
(persona; progetto: AGENTS.md, rilascio manuale)

## 3. Metafora e vocabolario

**Il mondo**: una **bilancia di pesi** vista dal **prodotto davanti** (persona):
- ogni elemento pesa sugli altri: si toglie peso qui e si aggiunge là, finché il prodotto sta in
  equilibrio;
- si parte da ciò che si vede sulla scena e si risale alla causa.

**Cosa pesa** (persona):
- le superfici, il "cemento";
- i colori e le velature, il "mattone";
- le differenze tra contesti: lo stesso elemento pesa diverso su pagina, card e pozzo.

**Da dove arriva quello che si sa già fare**: il generatore di temi di daisyUI (persona).
- Si tiene: i controlli accanto alla scena, tutti i componenti insieme, pochi controlli, si parte
  da un tema pronto.
- Dello studio di oggi si lascia indietro (persona):
  - le sette pagine di Colori, divise per strumento;
  - i numeri senza contesto: L%, Lc e gradini che non dicono cosa toccano;
  - il giudizio in una sezione separata dai controlli.

**Le parole** sono quelle del registro dei termini dello studio, [`GLOSSARY.md`](GLOSSARY.md),
deciso il 2026-11-20 con `taxonomy` (persona). Quelle che toccano questo modello:

- **preset**: l'insieme che si compila e si esporta, quello di Magma o quello di un prodotto;
  "configurazione" esce come nome dell'insieme (nel codice resta `config`, formato pubblico);
- **tema**: solo il file del tema, con tinta, accenti e modalità;
- **pesi**: "bilanciamenti" esce, "bilanciare" resta il verbo del lavoro;
- **fondo**: ciò che sta sotto un elemento (pagina, card, pozzo, campitura); "superficie" resta
  il ruolo;
- **passo** (EN *stage*): un passo del flusso; **luminosità**: la L%; **livello**: solo soft, base
  e strong delle velature;
- **coppia accettata**: la coppia accettata dalla baseline (era "eccezione nota"); **eccezione**
  resta lo sfondo di una funzione;
- **colori di feedback**: info, success, warning, danger (erano "famiglie di stato"); **stato**
  resta del componente;
- **neutri**: il gruppo delle famiglie `tone`; **tono** resta la prop dei componenti;
- **candidato**: un'alternativa generata e misurata, di un'eccezione o di un tema da un colore di
  brand.

## 4. Entità

```
Preset  (uno per host: quello di Magma, o quello di un prodotto sopra il preset di Magma)
|- 1. Colori
|  '- Famiglia -> Rampa (gradini per modalità)
|     ... si riferisce a una Scala di contrasto (condivisa tra famiglie)
|- 2. Pesi
|  |- superfici (5 ruoli), bordi (3), testi (4 obiettivi)
|  '- ruoli trasparenti: velature, bande, tracce; intensità, alpha, inchiostro
|- 3. Temi  (i predefiniti + quelli del prodotto)
|  '- Tema: tinta -> Famiglia, accenti -> Famiglia, modalità
|- 4. Eccezioni
|  '- Eccezione (una funzione) -> componenti che la adottano -> stati -> Candidati
'- Modifiche (prima e dopo, annulla)

Accanto a ogni passo:
  Prove      -> Scena del passo + condizioni (modalità, più contrasto, breakpoint, fondo)
  Verifica   -> Coppie (primo piano, sfondo, modalità, tema) -> verdetto, filtrato sul passo
```

Raggruppamento per passo e gerarchia confermati. (persona)

Altre relazioni:
- un Tema si riferisce a Famiglie, per la tinta e per gli accenti;
- i ruoli dei Pesi nominano gradini delle Rampe;
- un'Eccezione usa un ruolo dei Pesi, il cui peso è lo stesso nelle due viste;
- una Coppia si riferisce a due ruoli, a una modalità e a un tema;
- la Scena mostra un Tema.

### Preset

- **Scopo**: è ciò con cui si compila il colore di Magma o di un prodotto, ed è l'unità che esce
  dallo studio. (persona, con la gerarchia)
- **Contiene**: le impostazioni globali (colorspace, smooth, formula, saturazione) e i gruppi di
  export. (progetto: `.magma-design-tokensrc.json`)
- **Dove finisce**:
  - Magma: `.magma-design-tokensrc.json`, più i ruoli trasparenti, che oggi sono codice in
    `semantic.config.ts` e passano nel preset (persona: si regolano nello studio);
  - prodotto: il suo preset, esportato in JSON e installato nel suo progetto. (persona)
- **Figli**: famiglie, scale di contrasto, pesi, temi, eccezioni, modifiche.
- **Azioni**:
  - aprire: dal preset, da un tema pronto, da un colore di brand, dalla bozza;
  - salvare (nel comando di un progetto) o scaricare (su Pages);
  - annullare ogni passo. (persona)
- **Stati**: modificato o no, rispetto a quello caricato; pronto a uscire, cioè verde e giudicato
  sulla scena in ogni tema e modalità. (persona)
- **Sempre visibile**: le modifiche fatte (quante, in quale passo); se l'host salva o scarica.
  (persona)

### Famiglia

- **Scopo**: un colore della palette e la sua rampa. (progetto)
- **Contiene**: colore chiave, colorspace, saturazione, spostamento di tonalità, scala di
  contrasto, formula, seed, adesione alle superfici, export, alias. (progetto: README di
  design-tokens)
- **Figli**: la rampa per modalità, gradini 01..10 più il seed.
- **Azioni**: aggiungere, cambiare, eliminare (con annulla), farne un alias. (progetto, proposta)
- **Stati**: usata da un tema, come tinta o accento, oppure no. (persona)
- **Sempre visibile**: cosa dipinge (i componenti, il tema in cui si vede) e le coppie della
  verifica che tocca. (persona)

### Scala di contrasto

- **Scopo**: gli obiettivi dei dieci gradini, condivisi tra le famiglie che la usano. È
  un'entità a sé. (persona)
- **Contiene**: gradini, minimo, massimo, distribuzione (un easing o manuale). (progetto: README
  dello studio)
- **Azioni**: aggiungere, duplicare, rinominare, eliminare (con annulla), regolare. (progetto)
- **Sempre visibile**: le famiglie che la usano. (proposta)

### Pesi

- **Scopo**: quanto pesa ogni elemento neutro e ogni ruolo trasparente del preset,
  in una modalità. (persona)
- **Contiene**, per chiaro e per scuro separatamente (persona):
  - la luminosità (L%) delle 5 superfici e dei 3 bordi;
  - gli obiettivi dei 4 testi, con la loro soglia;
  - l'intensità globale, l'alpha di ogni ruolo trasparente, l'inchiostro tinto e la saturazione
    delle velature.
- **Dove finisce**: nel preset: il blocco `theme` della configurazione di oggi più i ruoli trasparenti.
- **Azioni**: regolare con uno slider che mostra il valore; annullare. (persona)
- **Stati**: un peso è sbagliato, oltre alla verifica, quando un elemento sparisce in un contesto
  (pagina, card, pozzo). (persona)
- **Sempre visibile**: il verdetto e il contrasto delle coppie che la modifica sposta. (persona)

### Tema

- **Scopo**: un tema che una pagina indossa, `data-theme-name`. (progetto)
- **Contiene**: nome, descrizione, tinta (una famiglia), accenti (`accent`, `ai`, ciascuno una
  famiglia), modalità. (progetto: formato 1, design-tokens SPEC)
- **Regole del progetto**:
  - tinta e testo vengono dalla stessa famiglia;
  - lo status non può essere la tinta;
  - `business` è la base.
- **Tipi**: predefinito (business, editorial) o del prodotto, con regole diverse; quali sia
  ancora da decidere. (persona, vedi Domande aperte)
- **Azioni**:
  - creare, da un tema pronto o da un colore di brand: più candidati, visti uno alla volta;
  - scegliere tinta e accenti tra le famiglie o dalla scena;
  - scegliere le modalità;
  - eliminare, con annulla. (persona)
- **Stati**: verde o rosso, per modalità. (persona)
- **Sempre visibile**: come appare e le modalità che offre. (persona)
- **Gli altri temi**: quando cambia qualcosa che vale per tutti, silenzio finché uno non si
  rompe; poi un avviso con il link. (persona)

### Eccezione

- **Scopo**: decidere come dipinge, in ogni stato e su ogni fondo, una **funzione**
  condivisa da più componenti il cui colore non viene né dalla palette né da una superficie: la
  banda di tab, filtri e paginatore, la traccia, lo strato di hover, la cornice dei campi.
  (persona)
- **Di chi è**: della funzione, ed è la stessa in ogni tema. (persona)
- **Contiene**:
  - i componenti che adottano la funzione;
  - i candidati, generati e misurati dallo studio;
  - la scelta e il suo perché, scritto;
  - il ruolo usato e il suo peso, che si regola anche nei Pesi. (persona)
- **Dove finisce**: nel preset, con ruoli e alpha. Un componente che non adotta ancora
  il ruolo ha bisogno di codice. (persona; la seconda frase è una proposta)
- **Azioni**:
  - generare i candidati, su richiesta;
  - sceglierne uno;
  - scrivere il perché;
  - regolare il peso. (persona)
- **Stati**: aperta; candidati pronti; decisa; **decisa ma non ancora nel codice** (quella che
  conta). (persona)
- **Sempre visibile**: il componente in ogni stato su ogni fondo, e il perché.
  (persona)

### Modifica

- **Scopo**: sapere cosa si è cambiato e poter tornare indietro. (persona)
- **Contiene**: cosa è cambiato, in quale passo, prima e dopo. (proposta)
- **Azioni**: annullare sempre; le azioni che tolgono lavoro non chiedono conferma. (persona)
- **Si vede**: come prima e dopo sulla scena, rispetto all'ultima uscita. (persona)

### Prove

- **Scopo**: giudicare il prodotto accanto ai controlli di ogni passo. (persona)
- **Contiene**: la scena del passo, che cambia con il passo e mostra ciò che il passo tocca, e le
  sue condizioni: modalità, più contrasto, breakpoint di Magma, fondo. (persona)
- **Azioni**:
  - cambiare una condizione;
  - toccare un elemento della scena e arrivare al controllo che lo regola;
  - vedere prima e dopo. (persona)

### Verifica

- **Scopo**: una sola verifica del contrasto per tutto il preset, ogni tema e ogni
  modalità, con lo stesso motore della CI. Ogni passo la filtra sulle coppie che la sua modifica
  sposta. (persona; progetto: `contrast-gate.ts`)
- **Contiene**: le coppie, ognuna con categoria, obiettivo o soglia, severità e misura; il debito
  accettato (la baseline). (progetto)
- **Sempre visibile**:
  - il verdetto;
  - le coppie toccate;
  - le coppie solo segnalate, distinte da quelle che bloccano;
  - il debito accettato, con quanto manca. (persona)
- **Stati**: verde o rosso; per ogni tema e modalità, guardato o no, finché una modifica non lo
  tocca. (persona)
- **Uscire con la verifica rossa**: si può, chiedendo. (persona)

## 5. Viste

Si va da un passo all'altro **in ordine**, avanti e indietro. (persona)

```
Introduzione -> Partenza -> 1. Colori (-> Scala) -> 2. Pesi -> 3. Temi -> 4. Eccezioni -> Giro completo -> uscita
```

La barra dello studio porta sempre con sé:
- le modifiche fatte e "salva o scarica", cioè ciò che del preset è sempre visibile;
- l'uscita;
- le preferenze della persona.

### Introduzione

- **Entità al centro**: nessuna, è un'introduzione. **Scopo**: dire a cosa serve lo studio. È la
  pagina Start di oggi e resta. (persona)
- **Mai qui**: controlli del lavoro.
- **Ingresso**: l'avvio, il nome dello studio nella barra. **Uscita**: Partenza.

### Partenza

- **Entità al centro**: Preset. **Scopo**: aprire il preset su cui lavorare.
  (persona)
- **Intorno**, tutto in linea (persona):
  - il preset di Magma;
  - i temi pronti, con aspetto e modalità;
  - un colore di brand, con i candidati uno alla volta;
  - la bozza, da riprendere al passo dove era.
- **Mai qui**: i controlli dei passi, la verifica.
- **Ingresso**: Introduzione, o l'apertura senza una bozza. **Uscita**: Colori, o il passo della
  bozza. (proposta)

### 1. Colori

- **Entità al centro**: Famiglia. **Scopo**: regolare un colore e vedere cosa dipinge.
- **Intorno**:
  - le famiglie, in linea: elenco accanto per gruppo, menu o ricerca, oppure dalla scena;
  - tutti i campi della famiglia, in linea;
  - la scala, in linea per sceglierla; si modifica nella sua pagina, Scala;
  - la scena del passo, accanto: i componenti che la famiglia dipinge;
  - le coppie toccate, in linea;
  - i temi che la usano, nominati, con un link a Temi. (persona; proposta per gli ultimi due)
- **Mai qui**: pesi, temi, eccezioni.
- **Ingresso**: Partenza, o un elemento toccato sulla scena. **Uscita**: Scala; il passo dopo,
  Pesi.

### Scala

- **Entità al centro**: Scala di contrasto. **Scopo**: regolare gli obiettivi condivisi. È una
  pagina sua. (persona)
- **Intorno**:
  - le famiglie che la usano, in linea, una come campione;
  - la distribuzione dei gradini, in linea;
  - la scena del campione, accanto: i suoi componenti in ogni stato;
  - le coppie toccate. (progetto, proposta)
- **Ingresso**: la scala di una famiglia. **Uscita**: torna alla famiglia, con un link che la
  nomina.

### 2. Pesi

- **Entità al centro**: Pesi. **Scopo**: bilanciare superfici, bordi, testi e ruoli trasparenti
  in una modalità. (persona)
- **Intorno**:
  - una modalità alla volta, una scheda per modalità, con la scena che la segue;
  - i gruppi in linea in una vista sola: superfici, bordi, testi, trasparenti;
  - la scena del passo, accanto: il prodotto intero, con il fondo come condizione;
  - le coppie toccate, le segnalate distinte e il debito. (persona)
- **Mai qui**: palette, temi, eccezioni.
- **Ingresso**: Colori. **Uscita**: Temi.

### 3. Temi

- **Entità al centro**: Tema. **Scopo**: tinta, accenti e modalità, giudicati sulla scena.
  (persona)
- **Intorno**:
  - i temi, in un elenco accanto: predefiniti e del prodotto, con il verdetto per modalità come
    stato. Uno è al centro, con la sua scena accanto;
  - tinta e accenti, in linea, scelti tra le famiglie (con il campione) o dalla scena;
  - le modalità, in linea;
  - gli altri temi, con un avviso solo quando uno si rompe;
  - le famiglie, con un link a Colori. (persona)
- **Mai qui**: pesi, palette.
- **Ingresso**: Pesi; un tema nuovo nasce nella Partenza. **Uscita**: Eccezioni.

### 4. Eccezioni

- **Entità al centro**: Eccezione, cioè una funzione. **Scopo**: scegliere come la funzione
  dipinge in ogni stato, su ogni fondo. (persona)
- **Intorno**, in linea (persona):
  - le funzioni, in un elenco accanto;
  - i componenti che la adottano;
  - la griglia di varianti, toni e stati sul fondo scelto;
  - i candidati, uno alla volta a tutta larghezza, con schede e uno zoom che tiene la posizione;
  - lo slider del peso, lo stesso dei Pesi e collegato a quello;
  - le misure;
  - il perché.
- **Mai qui**: palette, tinta e accenti.
- **Ingresso**: Temi, o un elemento toccato sulla scena. **Uscita**: Giro completo.

### Giro completo

- **Entità al centro**: Verifica. **Scopo**: giudicare ogni tema in ogni modalità prima di
  uscire. (persona)
- **Intorno**:
  - ogni tema per modalità, in linea, con il segno di "guardato";
  - la sua scena e le sue coppie: che bloccano, segnalate e debito;
  - l'uscita, salvare o scaricare, con una domanda se la verifica è rossa. (persona)
- **Ingresso**: Eccezioni, o l'avviso di un tema rotto. **Uscita**: l'uscita, oppure il passo a
  cui appartiene una coppia.

Gli assi della sezione Tema di oggi (forma, densità, tipografia, profondità) diventeranno passi
dopo le Eccezioni, quando ci saranno. (persona)

## 6. Meccanismi interni

| Meccanismo | Cosa muove | Come si vede |
| --- | --- | --- |
| generazione di rampe, superfici e testi, a ogni modifica | Famiglia, Pesi | la scena si aggiorna |
| verifica, a ogni modifica | Verifica, filtrata sul passo | il verdetto e le coppie toccate |
| pittura della scena nei riquadri | Prove | la scena |
| generazione e misura dei candidati, **su richiesta** | Eccezione -> candidati pronti | un'attesa sull'eccezione |
| bozza nel browser | Preset -> modificato | le modifiche nella barra |
| salvataggio (comando) o download (Pages) | Preset -> uscita | salva o scarica, nella barra |
| rilascio: PR, CI, publish | fuori dallo studio | nessuna vista |

Il lavoro della macchina si vede sull'oggetto che cambia, mai come una pagina. (persona)

## 7. Il design system

Letto dal server MCP di Magma (build del worktree `magma-wt-1472`, 2026-11-20). I principi di
Magma sono bozze in revisione (persona): un conflitto non si risolve a favore di Magma per
principio.

| Vista | Pattern e blocchi | Linguaggio di design |
| --- | --- | --- |
| barra e pagine | `app-shell`, `page-header` | `actions`, `titles`, `widths` |
| Introduzione | `app-shell` | `surfaces` (la banda che introduce) |
| Partenza | `page-header` | `surfaces` (un elemento di un insieme), `actions` |
| Colori, Temi | `record-detail` con l'elenco accanto; lacuna: lista e dettaglio (#1262) | `surfaces`, `rhythm` |
| Scala | `record-detail` | `rhythm` |
| Pesi | lacuna: spazio di lavoro con anteprima | `rhythm`, `titles` |
| Eccezioni | lacuna: confrontare alternative | `density` |
| Giro completo | lacuna: revisione a voci; `confirm-action` per uscire con la verifica rossa | `actions` |
| annulla | `message-placement` (toast con Annulla) | `actions` (rimozione) |
| la macchina | `loading` | |
| un altro tema rotto | `message-placement` (toast con link) | |

## 8. Conflitti

### Passi in ordine

- **Il modello dice**: si va da un passo all'altro in ordine.
- **Il design system dice**: `app-shell`: le sezioni sono link, raggiunte da ogni pagina. Magma
  non ha un pattern dei passi ordinati.
- **Effetto**: senza una regola, l'ordine non si vede o si impone con un meccanismo inventato.
- **Risoluzione** (persona): **decide il prodotto**, nel layer dello studio
  (`/magma:pattern-layer`). Aperta finché il layer non la scrive.

### Spazio di lavoro

- **Il modello dice**: la scena al breakpoint desktop (da 1024px) sta accanto ai controlli.
- **Il design system dice**: `widths`: la pagina sta nella cornice della barra (1280px). Magma
  non ha un blocco per un editor con anteprima.
- **Effetto**: la scena al breakpoint desktop non entra accanto ai controlli.
- **Risoluzione** (persona): **cambia il design system**, con un blocco spazio di lavoro a
  pannelli; la lacuna è già scritta in #693. L'issue si apre sul sì della persona.

### Confrontare alternative

- **Il modello dice**: i candidati si vedono uno alla volta a tutta larghezza, con schede e uno
  zoom che tiene la posizione.
- **Il design system dice**: nessun pattern per confrontare alternative.
- **Risoluzione** (persona): **cambia il design system**: un pattern che parte dalla pagina della
  board della cornice (versione 2). L'issue si apre sul sì della persona.

### Revisione a voci

- **Il modello dice**: ogni tema e modalità resta segnato come guardato, finché una modifica non
  lo tocca.
- **Il design system dice**: nessun pattern.
- **Risoluzione** (persona): **cambia il design system**. L'issue si apre sul sì della persona.

Finché un conflitto non è risolto, si costruisce come dice il design system.

## 9. Contesto

**Chi è coinvolto**
- Decide il team del design system; costruisce la persona con gli agenti. (persona)
- Vanno avvisati il sito docs, che linka le pagine dello studio per indirizzo, e i prodotti dei
  temi, perché un tema rilasciato cambia il loro colore. (persona)
- Principi: i principi v2 della persona; quelli di Magma sono bozze in correzione incrementale.
  (persona)

**Cosa si sa già**
- Si ascolta il sito docs (prd-docs). (persona)
- Qualche prodotto ha già aperto lo studio su Pages; non ci sono dati d'uso. (persona; progetto)
- Entrano nel progetto: l'architettura #1397, il formato del tema #694, gli assi #696 e #691.
  (persona)

**Cosa esiste già**
- Vincoli che restano (persona):
  - Magma installato come vendor;
  - ogni pagina ha un indirizzo nel hash;
  - il motore vero di design-tokens nel browser;
  - la bozza nel browser e le uscite come download, il salvataggio solo con un comando.
- Riferimento: solo daisyUI. (persona)

**Dove e come si usa**
- Su desktop largo. (persona)
- Due host: il sito su Pages e un comando nel progetto, `magma-studio`, che salva in
  `magma/themes/`. (persona)
- WCAG 2.2 AA e daltonismo: verdetti e differenze mai affidati al solo colore. (persona)
- La scena si giudica ai breakpoint di Magma. (persona)

**Compiti e flussi**
- Frequenti: ritoccare un tema, fare un tema nuovo, decidere un'eccezione. Raro: regolare una
  famiglia. (persona)
- Errori che contano: rompere un altro tema, uscire con la verifica rossa, perdersi nelle
  modifiche. (persona)
- Le azioni distruttive si annullano, senza conferma. (persona)

**Dati e numeri**
- In vista: il verdetto e il contrasto delle coppie toccate. (persona)
- Si regola con slider che mostrano il valore. (persona)
- Le alternative si vedono una alla volta, larghe. (persona)
- I temi non hanno un limite: un prodotto ha i predefiniti più uno suo. (persona)

**Parti saltate**
- contenuto e lettura: uno strumento di controlli e numeri;
- brand e tono: l'identità è Magma;
- immagini: non ce ne sono;
- più pezzi e media: uno strumento solo;
- scrittura dei testi: nessun flusso editoriale.

## 10. Domande aperte

1. **Temi predefiniti per un prodotto**: restano bloccati e il prodotto li copia, oppure li cambia
   nel suo preset? La direzione della persona: i predefiniti restano tali, i temi del
   prodotto hanno le loro regole. Chi: la persona, con il team.
2. **Le eccezioni nel preset di un prodotto**: un prodotto le modifica? La persona ha detto
   "sono di Magma" e poi "il preset si modifica per intero". Proposta: la forma resta di Magma, i
   pesi viaggiano con il preset.
3. **Il formato del "nuovo tema" di un prodotto**: porta l'intero preset modificato, non
   solo tinta, accenti e modalità. Serve un formato 2 del tema (#694)? Chi: la persona.
4. **La sezione Regole** (linguaggio di design, pattern, blocchi): dove va? Non collocata.
5. **Il ruolo di chi fa il tema di un prodotto** è un'ipotesi: va confermato con il team del sito
   docs.
6. **Pesi ed eccezioni**: è corretta la lettura che vuole il ruolo e il suo peso nei Pesi, e
   l'eccezione come la decisione su quali componenti lo adottano e come dipinge? (proposta)
7. **Dalla Partenza con un colore di brand**, dopo il candidato scelto si va a Colori e poi in
   ordine? (proposta)
8. **Intensità relativa limitata dalla verifica** (idea di #1474): lo slider si ferma dove la
   verifica fallirebbe? (dalla nota, non chiesta)
9. **Solo desktop** e `app-shell`, che vuole la barra a ogni larghezza: la barra resta usabile
   stretta, lo spazio di lavoro no? (proposta)

## 11. Deroghe ai principi

Nessuna per ora. (Nel formato v2 la sezione si chiama "Exceptions": rinominata per non
confondersi con le eccezioni dei componenti.)
