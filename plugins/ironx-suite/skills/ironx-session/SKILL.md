---
description: Workflow di apertura e chiusura sessioni di lavoro IronX su Claude Cowork e Claude Code. Attivare ad inizio e fine di ogni sessione di sviluppo o ricerca. Contiene la sequenza di attivazione skill, regole di handoff tra sessioni, gestione CLAUDE.md, checklist apertura e chiusura, e come non perdere mai il contesto tra una sessione e l'altra.
---

# IRONX SESSION — WORKFLOW SESSIONI DI LAVORO

## APERTURA SESSIONE — SEQUENZA OBBLIGATORIA

Ogni volta che si inizia una sessione di lavoro IronX,
Claude esegue questa sequenza nell'ordine esatto:

STEP 1 — Identificare il contesto:
  "Su quale piattaforma lavoriamo oggi?
    1. NT8 — NinjaScript C#
    2. MT5 — MQL5
    3. TradingView — PineScript v6
    4. Cross-platform"

STEP 2 — Identificare il tipo di lavoro:
  "Che tipo di sessione è questa?
    1. Ricerca su prodotto NinZa/KingRenko
    2. Sviluppo / coding
    3. Code review o debugging
    4. Aggiornamento documentazione o skill
    5. Progettazione architettura"

STEP 2.5 — Read existing Cowork_Research (NEW):
  Prima di iniziare lavoro NUOVO su un prodotto NinZa, SEMPRE controllare:
  1. Ninza_Data/Cowork_Research/{ProductName}/ per ricerca esistente
  2. NinZa_IndicatorCatalog.md — stato corrente del prodotto e progress
  3. DECOMPILED_ANALYSIS.md — decompilazioni già eseguite (evitare duplicati)
  4. CLAUDE.md — per documentazione IronX esistente e "NON TOCCARE MAI" entries

  Se il prodotto è gia stato ricercato:
    → Leggere file esistenti PRIMA di iniziare new work
    → Evitare di ripetere lavoro già fatto
    → Estendere ricerca da dove era rimasta, non ricominciare

  Se il prodotto NON è stato ricercato:
    → Creare nuova cartella in Cowork_Research/{ProductName}/
    → Iniziare ricerca da zero seguendo profilo Reverse Engineer

STEP 2.6 — Check Deep Research sources (NEW):
  PRIMA di cercare sul web, consultare SEMPRE:
  1. Ninza_Data/Deep_Research_Ninza_System/ — 7 documenti Gemini (FONTE TERZA verificata)
  2. Ninza_Data/Decompiling/ — 17 cartelle decompilate (FONTE PRIMARIA NinZa)
  3. Ninza_Data/ScreenShot/ — 167+ screenshot organizzati per prodotto (VISUAL REFERENCE)
  4. Ninza_Data/Docs_Originali/ — 9 file documentali (FONTE PRIMARIA NinZa)

  REGOLA: Queste sono RIFERIMENTI PRIMARI — leggerli PRIMA di fare web search.
  Se la risposta è gia in Ninza_Data, non cercare altrove.

STEP 3 — Leggere CLAUDE.md del prodotto attivo:
  Aprire e leggere il CLAUDE.md del prodotto su cui si lavora
  Prestare MASSIMA attenzione alla sezione NON TOCCARE MAI
  Non modificare mai quella sezione senza approvazione esplicita di Luke

STEP 4 — Confermare lo stato:
  Comunicare a Luke: piattaforma, tipo lavoro, stato attuale
  del prodotto letto da CLAUDE.md

## CHIUSURA SESSIONE — SEQUENZA OBBLIGATORIA

Prima di chiudere qualsiasi sessione di lavoro:

STEP 1 — Aggiornare CLAUDE.md:
  Documentare ogni modifica significativa fatta
  Aggiornare lo stato del prodotto
  Se è stato risolto un bug critico, aggiungere alla sezione
  NON TOCCARE MAI con descrizione e motivazione

STEP 2 — Riepilogo sessione:
  Elencare cosa è stato fatto
  Elencare cosa è rimasto aperto
  Indicare il prossimo step consigliato

STEP 3 — Verificare file prodotti:
  Tutti i file modificati sono salvati?
  Il codice compila senza errori e warning?
  Se no, segnalarlo esplicitamente a Luke prima di chiudere

STEP 4 — Proporre aggiornamento skill se necessario:
  Se durante la sessione è emerso qualcosa di importante
  che manca nelle skill esistenti, proporlo a Luke
  seguendo la governance di ironx-ecosystem

## GESTIONE CLAUDE.md

Ogni prodotto IronX ha il suo CLAUDE.md nella cartella radice.
Struttura standard:

  NOME PRODOTTO
  Versione corrente
  Piattaforma

  STATO ATTUALE
  [descrizione stato sviluppo]

  ARCHITETTURA
  [struttura file e moduli]

  PARAMETRI INPUT
  [lista parametri con tipo e default]

  LOGICA PRINCIPALE
  [descrizione logica e formule]

  BUFFER OUTPUT
  [mappa buffer secondo standard IronX]

  DIPENDENZE
  [altri file o indicatori richiesti]

  NON TOCCARE MAI
  [sezione critica — bug risolti documentati]
  Ogni entry deve contenere:
    COSA: descrizione del bug o comportamento
    PERCHE: spiegazione tecnica
    SOLUZIONE: cosa fa il codice attuale
    DATA: quando è stato risolto

  PROSSIMI STEP
  [cosa fare nella prossima sessione]

## REGOLE COWORK VS CODE

CLAUDE COWORK — usare per:
  Ricerche approfondite su NinZa e piattaforme
  Progettazione architettura e skill
  Analisi di screenshot e video
  Costruzione e aggiornamento documentazione
  Discussioni strategiche sul progetto

CLAUDE CODE — usare per:
  Sviluppo codice diretto su repository
  Compilazione e test
  Code review su file reali
  Refactoring e debugging
  Lettura e scrittura file CLAUDE.md nel repo

REGOLA HANDOFF COWORK verso CODE:
  Prima di passare a Claude Code, produrre in Cowork:
  1. Specifiche tecniche complete in .md
  2. Lista file da modificare o creare
  3. Comportamento atteso con esempi
  4. Checklist di accettazione (cosa deve funzionare)

REGOLA HANDOFF CODE verso COWORK:
  Prima di tornare in Cowork, aggiornare in Code:
  1. CLAUDE.md con stato attuale
  2. Commit su Git con messaggio descrittivo
  3. Lista problemi aperti da discutere in Cowork

## GESTIONE GIT

Ogni fine sessione di sviluppo su Claude Code:

  git add .
  git commit -m "[PRODOTTO] [TIPO]: descrizione breve"

Esempi messaggi commit:
  "EasyXTrend FEAT: aggiunto MA engine con 16 tipi"
  "ATRShield FIX: risolto ghost objects in OnDeinit"
  "IronX DOCS: aggiornato CLAUDE.md con stato v2.1"
  "EasyXTrend REFACTOR: separata logica segnali da rendering"

Versioni prodotto gestite con Git tags, MAI nel nome del file.

## QUANDO USARE OPUS VS SONNET

Segnalare a Luke di passare a Opus 4.6 quando:
  La sessione richiede ricerca profonda multi-fonte
  Si deve progettare architettura complessa
  Si analizza un decompilato o logica non documentata
  Il problema è bloccato da più di 2 tentativi falliti
  Si deve prendere una decisione architetturale importante

Sonnet 4.6 è sufficiente per:
  Sviluppo codice su specifiche già definite
  Aggiornamenti documentazione
  Code review su codice già progettato
  Sessioni di debug con errori chiari

## REGOLA ZERO ERRORI

Nessuna sessione si chiude con:
  Codice che non compila
  Warning non risolti
  Ghost objects non gestiti
  Repaint non verificato
  CLAUDE.md non aggiornato

Se non si riesce a risolvere prima della chiusura,
documentare esplicitamente il problema in CLAUDE.md
nella sezione PROSSIMI STEP con dettaglio tecnico completo.

## REGOLA FONTE PRIMARIA NINZA

"NinZa.co e le sue brand associate (renkokings.com, zuperview.com)
sono l'UNICA fonte primaria per la replica di prodotti nell'IronX Ecosystem.
Qualsiasi altra fonte è secondaria e richiede verifica incrociata
prima di essere utilizzata come fondamento di sviluppo o decisioni architetturali."

APPLICAZIONE PRATICA:
  1. Qualsiasi informazione SU algoritmo NinZa deve essere tracciata
     con riferimento a: decompilato / screenshot ufficiale / video NinZa / sito ufficiale

  2. Se una fonte secondaria (web, Gemini, forum) fornisce informazione
     NON confermata da fonte NinZa primaria → deve essere segnalata come IPOTESI

  3. Se sviluppo si basa su IPOTESI (non fonte primaria) → documentare
     chiaramente in CLAUDE.md e NON TOCCARE MAI con notation: "[IPOTESI]"

  4. Prima di committing codice basato su IPOTESI, chiedere approvazione
     esplicita a Luke (non auto-commit)

IronXCharts © Luke SteelWolf — marzo 2026
