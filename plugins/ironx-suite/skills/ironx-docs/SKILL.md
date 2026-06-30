---
description: Standard di documentazione per l'IronX Ecosystem. Attivare quando si crea o aggiorna un CLAUDE.md, si documenta un bug critico nella sezione NON TOCCARE MAI, si scrive una ricerca in Cowork_Research, o si gestisce la documentazione di qualsiasi prodotto IronX. Contiene struttura CLAUDE.md, regole di scrittura, standard Git, e template pronti all'uso.
---

# IRONX DOCS — STANDARD DI DOCUMENTAZIONE

## REGOLA FONDAMENTALE
Ogni prodotto IronX ha sempre la sua documentazione aggiornata.
Il codice senza documentazione non esiste nell'IronX Ecosystem.
La documentazione si aggiorna NELLA STESSA SESSIONE in cui si
modifica il codice. Mai rimandare.

## TEMPLATE CLAUDE.md — STRUTTURA STANDARD

Ogni prodotto IronX ha un CLAUDE.md nella sua cartella radice.
Copiare e compilare questo template per ogni nuovo prodotto:

  # [NOME PRODOTTO] — CLAUDE.md
  IronXCharts © Luke SteelWolf
  Versione: [X.X]
  Piattaforma: [NT8 / MT5 / TV / Cross-platform]
  Equivalente NinZa: [nome prodotto NinZa di riferimento]
  Ultimo aggiornamento: [data]

  ## STATO ATTUALE
  [Descrizione chiara dello stato corrente dello sviluppo]
  [Es: "In sviluppo — MA engine completato, segnali da fare"]
  [Es: "Stabile — in produzione su NT8, MT5 in corso"]

  ## OBIETTIVO PRODOTTO
  [Cosa fa questo prodotto in una frase]
  [Quale problema risolve al trader]

  ## ARCHITETTURA FILE
  [Lista file con ruolo di ognuno]
  Es:
    EasyXTrend.mq5          indicatore principale
    EXT_Engine.mqh          logica MA engine e trend
    EXT_Dashboard.mqh       pannello visivo
    EXT_Integration.mqh     comunicazione con altri prodotti

  ## PARAMETRI INPUT
  [Lista completa parametri con tipo, default e descrizione]
  Es:
    MA_Period     int     14      Periodo media mobile principale
    MA_Type       enum    EMA     Tipo MA: SMA EMA WMA HMA ecc
    ATR_Period    int     14      Periodo ATR per filtro volatilità
    ShowSignals   bool    true    Mostra frecce segnali su chart

  ## LOGICA PRINCIPALE
  [Descrizione della logica con formule dove necessario]
  [Ogni sezione logica separata con titolo]

  ## BUFFER OUTPUT
    Il buffer layout è PRODOTTO-SPECIFICO (ogni prodotto IronX ha il suo).
    NON esiste un layout universale [0-5].
    Riferimento: CLAUDE.md "Buffer Reference" per layout reale di ogni prodotto.
    Esempio EXT v2.0: 18 buffer (0=MA Line, 1=LineColor, 2-5=OHLC, 6=BarColor,
      7=Buy, 8=Sell, 9=SignalTrade, 10=BG, 11=BGColor, 12=Trend, 13-17=Calc)

  ## DIPENDENZE
  [File include e indicatori esterni richiesti]
  Es:
    IronX/Core/IronX_Types.mqh
    IronX/Core/IronX_MathLib.mqh

  ## NON TOCCARE MAI
  [SEZIONE CRITICA — non modificare senza approvazione esplicita di Luke]

  Ogni entry in questa sezione segue questo formato:

    BUG-001 — [titolo breve]
    Data risolto: [data]
    COSA: descrizione del problema che appariva
    PERCHE: spiegazione tecnica della causa
    SOLUZIONE: cosa fa il codice attuale per risolverlo
    RISCHIO: cosa succede se si tocca questa parte

  ## PROSSIMI STEP
  [Lista ordinata di cosa fare nella prossima sessione]
  Es:
    1. Implementare segnali pullback su barra chiusa
    2. Testare anti-repaint su replay storico
    3. Aggiungere pannello dashboard con Strength value

## REGOLE SEZIONE NON TOCCARE MAI

Questa sezione è la memoria critica del prodotto.
Documenta bug che hanno richiesto ore o giorni per essere risolti.

QUANDO aggiungere una entry:
  Ogni volta che si risolve un bug non ovvio
  Ogni volta che si scopre un comportamento anomalo della piattaforma
  Ogni volta che una modifica apparentemente innocua rompe qualcosa

COME scrivere una entry:
  Essere specifici: non "fix oggetti" ma "fix ghost objects su OnDeinit
  quando l'indicatore viene rimosso durante barra realtime aperta"
  Includere sempre il codice o la riga esatta che risolve il problema
  Indicare la data precisa

COSA NON fare:
  Non cancellare mai entry esistenti
  Non modificare la soluzione senza approvazione di Luke
  Non spostare questa sezione in fondo al file

## STANDARD FILE DI RICERCA — Cowork_Research

Ogni ricerca salvata in Cowork_Research segue questo formato:

  # RICERCA — [Nome Prodotto o Elemento]
  Data: [data]
  Ricercatore: Claude [Opus/Sonnet] + Luke SteelWolf
  Piattaforma target: [NT8 / MT5 / TV / Cross-platform]
  Stato: COMPLETA / PARZIALE / IN CORSO

  ## OBIETTIVO RICERCA
  [Cosa si voleva trovare]

  ## STATO CONOSCENZA
    Logica principale:     VERIFICATA / IPOTESI / SCONOSCIUTA
    Parametri input:       VERIFICATI / PARZIALI / SCONOSCIUTI
    Visual e grafica:      VERIFICATA / PARZIALE / SCONOSCIUTA
    Formule matematiche:   VERIFICATE / PARZIALI / SCONOSCIUTE
    Segnali output:        VERIFICATI / PARZIALI / SCONOSCIUTI

  ## FONTI CONSULTATE
  [Dettagliato — vedi formato FONTI CONSULTATE migliorato sotto]

  ## RISULTATI
  [Contenuto organizzato per sezione — il cuore della ricerca]

  ## LACUNE ANCORA APERTE
  [Cosa non è stato possibile trovare e perché]

  ## PROPOSTA APPROCCIO SVILUPPO
  [Come procedere basandosi su quanto trovato]
  [Grado di certezza della proposta: ALTA / MEDIA / BASSA]

## ENHANCED FONTI CONSULTATE TEMPLATE

Ogni fonte consultata DEVE seguire questo formato strutturato:

  [#] CLASSIFICAZIONE — Descrizione breve
      URL/Path: [link o percorso file]
      Data accesso: [data]
      Estratto: [breve summary di cosa conteneva]
      Verificazione: [decompilato/screenshot/video/web cross-ref]

  CLASSIFICAZIONI OBBLIGATORIE:
    NINZA DIRETTA
      = decompilato, screenshot, video ufficiale NinZa
      = sito renkokings.com/ninza.co
      = FONTE PIU AFFIDABILE

    FONTE TERZA VERIFICATA
      = web/Gemini confermato da ALMENO 1 fonte indipendente
      = cross-referenced e validato

    FONTE TERZA NON VERIFICATA
      = web/Gemini senza conferma ancora
      = da includere CON CAUTELA

    IPOTESI
      = deduzione logica da pattern, screenshot, comportamento visivo
      = DEVE essere segnalata SEMPRE come ipotesi, MAI come fatto

  ESEMPIO CORRETTO:
  [1] NINZA DIRETTA — ninZaSolarWave.cs (753 LOC)
      URL: Decompilato JetBrains
      Data: 12/03/2026
      Estratto: 9 NinjaScriptProperty, 5 Series output, 12 state variables documentate
      Verificazione: decompilato diretto

  [2] FONTE TERZA VERIFICATA — MQL5 SolarWave implementation
      URL: https://www.mql5.com/...
      Data: 12/03/2026
      Estratto: Algoritmo core step-based trend, confermato con decompilato NT8
      Verificazione: cross-ref vs decompilato [1]

  [3] IPOTESI — Signal_Wave counter logic
      URL: N/A — dedotto da decompilato
      Data: 12/03/2026
      Estratto: Counter incrementa su cambio di trend (ipotesi da state vars)
      Verificazione: logica coerente con nome variabile m_signal_wave_counter

## DIFFERENZE IRONX vs NINZA — SEZIONE OBBLIGATORIA

Ogni file di ricerca SU UN PRODOTTO NINZA DEVE contenere una sezione
che documenta ESPLICITAMENTE cosa IronX fa DIVERSAMENTE da NinZa:

  ## DIFFERENZE IRONX vs NINZA

  ### Feature Extra IronX (Non in NinZa)
  1. [Feature name] — Descrizione, motivo aggiunto, impatto
  2. [Feature name] — Descrizione, motivo aggiunto, impatto

  Esempio:
  1. IronX ha 17 MA vs NinZa 11 — IronX include ALMA, LSMA, REMA, TMA, T3, KAMA, VIDYA
  2. ATR Pro cap 1.5x — IronX exclusive per protezione gap news

  ### Implementazioni Diverse
  1. [Aspetto] — Come fa NinZa vs Come fa IronX
  2. [Aspetto] — Come fa NinZa vs Come fa IronX

  Esempio:
  1. Buffer layout — NinZa layout variabile per prodotto, IronX layout prodotto-specifico (EXT=18, MAOSC=15, ATRS=14)
  2. Signal semantica — NinZa EXT 2/-2=Pullback vs ThunderZilla 2/-2=Slowdown

  ### Limitazioni IronX rispetto NinZa
  1. [Limitazione] — Perché non replicato, quando eventualmente lo sarà

  Esempio:
  1. Dual-Direction MA — NinZa in FibonacciMystery, IronX non ha (algoritmo offuscato)

  ### Vantaggi Architetturali IronX
  1. [Vantaggio] — Come funziona, benefici

  Esempio:
  1. Signal Adapter unificato — Tutte le prodotti semantiche mappate a enum standard (FONTE: CLAUDE.md sessione 36)

## STANDARD COMMENTI NEL CODICE

Ogni file di codice IronX ha un header standard:

  NT8 — NinjaScript:
    // ============================================================
    // IronXCharts © Luke SteelWolf
    // Prodotto: [nome]
    // Versione: [X.X]
    // Piattaforma: NinjaTrader 8 — NinjaScript C#
    // Equivalente NinZa: [nome]
    // ============================================================

  MT5 — MQL5:
    //+------------------------------------------------------------------+
    //| IronXCharts © Luke SteelWolf                                     |
    //| Prodotto: [nome]                                                  |
    //| Versione: [X.X]                                                   |
    //| Piattaforma: MetaTrader 5 — MQL5                                 |
    //| Equivalente NinZa: [nome]                                        |
    //+------------------------------------------------------------------+

  TV — PineScript:
    // IronXCharts © Luke SteelWolf
    // Prodotto: [nome] v[X.X] — PineScript v6
    // Equivalente NinZa: [nome]

Sezioni logiche nel codice commentate con:
    // === [NOME SEZIONE] ===

Bug fix documentati inline con:
    // NON TOCCARE — [descrizione breve] — risolto [data]

## STANDARD GIT COMMIT

Formato messaggio commit:
  [PRODOTTO] [TIPO]: descrizione breve in italiano

Tipi:
  FEAT      nuova funzionalità
  FIX       bug risolto
  REFACTOR  ristrutturazione codice senza cambio funzionalità
  DOCS      solo documentazione
  TEST      aggiunta o modifica test
  STYLE     formattazione, nessun cambio logica

Esempi corretti:
  EasyXTrend FEAT: aggiunto MA engine con 16 tipi
  ATRShield FIX: risolto ghost objects in OnDeinit
  IronX DOCS: aggiornato CLAUDE.md con stato v2.1
  EasyXTrend REFACTOR: separata logica segnali da rendering

Versioni prodotto: gestite con Git tags, MAI nel nome del file.
Tag format: v[X.X]-[PRODOTTO]
Es: v2.1-EasyXTrend, v1.0-ATRShield

## CHECKLIST DOCUMENTAZIONE PRIMA DI COMMIT

  Il CLAUDE.md è aggiornato con lo stato attuale?
  La sezione NON TOCCARE MAI è aggiornata se necessario?
  I nuovi parametri sono documentati con tipo e default?
  I buffer output sono documentati se cambiati?
  Il messaggio commit segue lo standard?
  Le dipendenze sono aggiornate?
  I prossimi step sono aggiornati?
  Se ricerca Cowork_Research — FONTI CONSULTATE complete e classificate?
  Se ricerca Cowork_Research — DIFFERENZE IRONX vs NINZA sezione presente?

## STANDARD DECISIONI ARCHITETTURALI (DA)

Ogni decisione architetturale significativa viene numerata e documentata
nel CLAUDE.md principale sotto "Decisioni Architetturali".

FORMATO DA:
  DA #[N]: [Titolo breve] = [Decisione presa]. [Dettaglio tecnico].

QUANDO creare una DA:
  Scelta tra alternative tecniche (es. DimColor vs DimGray per hollow)
  Limitazione piattaforma scoperta (es. DRAW_COLOR_CANDLES no outline/body)
  Pattern cross-platform definito (es. trigger logic trend*barDir)
  Formula o algoritmo validato (es. DimColor blend 50% DimGray)
  Default parametri decisi (es. InpBarBiasBased=true per IronX)

REGOLE DA:
  Numerazione progressiva — MAI rinumerare
  Ogni DA riferisce la fonte (decompilato, screenshot, MQL5 ufficiale, Luke)
  Le DA cross-platform (NT8+MT5+TV) vanno anche in ironx-ecosystem skill
  Le DA specifiche per piattaforma vanno anche nella skill piattaforma
  "Note per Ricominciare da Zero" DEVE sempre riferire il range DA aggiornato

ESEMPIO CORRETTO (DA #99):
  DA #99: Bar Painting Hollow/Solid = Soluzione 2 dimmed colors su MT5.
  Trigger: trend*barDir>0=SOLID, <0=HOLLOW. 5 indici DRAW_COLOR_CANDLES.

ESEMPIO CORRETTO (DA #103-108 — Background Painting):
  DA #103: Background Painting = OBJ_RECTANGLE BACK + pre-blend con chart bg.
  Plot 5 DRAW_NONE permanente. Buffer 10/11 mantenuti per iCustom/ComBus.
  Segment-based (~10-30 rect per 500 barre).

  DA #104: BlendColor() formula: per canale RGB
  result = bg*(100-opacity)/100 + fg*opacity/100.
  bg da ChartGetInteger(0, CHART_COLOR_BACKGROUND). MQL5 color = 0xBBGGRR.

  DA #105-106: Colori NinZa standard LimeGreen/HotPink, Opacity 20.
  DA #107: Plot 5 ALWAYS DRAW_NONE — MAI DRAW_COLOR_HISTOGRAM.
  DA #108: MQL5 NO alpha nativa — pre-blend unica soluzione.

  DA #109: Standard ComBus Keys definitivo:
  IronX.<PRODOTTO>.<Symbol>.<TF>.<Suffisso>
  Implementato via C_IronX_ComBus::BuildKey() e Publish().
  MAI formato underscore. MAI chiavi hardcoded.
  Codici: EXT, ATRS, MAOSC, XATR, RENKO, NC, TZ, FZ, TR, BOB, CPT.

  DA #110: ComBus Diagnostic Pattern — grep GlobalVariable*
  nel codebase, verificare dot notation, suffissi, Register/Flush.

  DA #111: ComBus vs State Persistence — due sistemi diversi.
  ComBus = dot notation inter-prodotto. State = underscore per-trade.

  DA #112: IronX_ComBusKey() helper in IronX_Types.mqh —
  convenience per consumer senza #include IronX_ComBus.mqh.

## STANDARD AGGIORNAMENTO SKILL Updated_Skills

Quando una ricerca o implementazione produce dati VERIFICATI che impattano
le skill dell'ecosistema, aggiornare IMMEDIATAMENTE le skill coinvolte.

PROCEDURA:
  1. Identificare TUTTE le skill impattate dal nuovo dato
  2. Aggiornare OGNUNA nella stessa sessione — mai rimandare
  3. Inserire il dato nella sezione più appropriata della skill
  4. Se necessario, creare nuova sezione nella skill
  5. Verificare coerenza tra skill — nessuna contraddizione

SKILL TIPICAMENTE IMPATTATE PER TIPO DI DATO:
  Nuova formula/algoritmo → ironx-engineer (Math Engineer) + ironx-mql5/nt8/pinescript
  Nuova limitazione piattaforma → ironx-platform-matrix + skill piattaforma
  Nuovo pattern segnale → ironx-signals + ironx-quality (checklist)
  Nuovo pattern visual → ironx-mql5/nt8/pinescript + ironx-quality
  Nuovo dato reverse engineering → ironx-engineer (Reverse Engineer) + ironx-research
  Nuova DA cross-platform → ironx-ecosystem + tutte le skill piattaforma coinvolte

## STANDARD DA #124-131 — MA-SLOPE

Le DA #124-131 documentano la ricerca MA-Slope e le relative decisioni:

  DA #124: Formula NinZa = (MA[i]-MA[i-N])/N/ninZaATR×1000 — confermata 3 fonti
  DA #125: Threshold hysteresis: ±120 start, ∓60 end, band 180 punti, crosses zero
  DA #126: NinZa defaults NINZA DIRETTA: EMA 25, Smooth EMA 5, Lookback 5, Threshold ±120
  DA #127: PCF vs Slope complementari: PCF=1-bar noise, Slope=N-bar strength
  DA #128: EXT LIGHT = 3 params gate (InpSlopeEnabled/Lookback/Threshold)
  DA #129: MA-Slope FULL = L1 separato con Signal Adapter IRONX_IND_MA_SLOPE
  DA #130: Signal_Trade MA-Slope: ±2=Slowdown, ±3=Resume — semantica diversa da EXT
  DA #131: REGOLA GRAFICA COMPLETA — regola permanente per ogni ricerca prodotto NinZa

Formato DA: come per DA #99-131, vedere template in sezione STANDARD DECISIONI ARCHITETTURALI.

## REGOLA GRAFICA COMPLETA — DA #131 (PERMANENTE)

Ogni file di ricerca in Cowork_Research/ per prodotti NinZa DEVE includere una sezione
GRAFICA COMPLETA con 7 categorie obbligatorie:

  1. CHART OBJECTS: tipo, dimensioni, z-order, opacity, stile, periodo di vita
  2. COLORI: HEX esatti, mappatura stato→colore, 4 gruppi standard
  3. MARKERS/LABELS: Unicode (codice), font, size, posizione, trigger, cooldown
  4. DASHBOARD/PANELS: layout, drag, docking, testi
  5. CONFLUENZE: interazione visiva con altri prodotti IronX
  6. RENDERING: stepped/smooth, repaint, TF scaling, Renko behavior
  7. ALERT: testo, trigger, suono/visual, popup, frequenza/blocking

Questa regola si applica retroattivamente e per tutti i prodotti futuri.
Verificare gap nei file di ricerca esistenti.

IronXCharts © Luke SteelWolf — marzo 2026
