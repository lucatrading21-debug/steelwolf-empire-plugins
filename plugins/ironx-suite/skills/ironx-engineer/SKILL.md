---
description: Suite ingegneristica completa per l'IronX Ecosystem. Attivare quando si fa code review, reverse engineering, progettazione architettura, analisi matematica o ottimizzazione performance su qualsiasi prodotto IronX. Contiene 6 profili ingegneristici — Code Reviewer, Reverse Engineer, Architect, Math Engineer, Performance Engineer, Security Engineer.
---

# IRONX ENGINEER — SUITE INGEGNERISTICA

## REGOLA FONDAMENTALE
Prima di qualsiasi lavoro ingegneristico, identificare
quale profilo serve. Un profilo alla volta — non mescolare.
Ogni output è documentato e motivato.
Zero decisioni arbitrarie — ogni scelta ha una ragione.

## DOMANDA OBBLIGATORIA ALL'AVVIO

"Quale profilo ingegneristico serve oggi?
  1. Code Reviewer      → analisi qualità codice esistente
  2. Reverse Engineer   → decostruire logica da codice/screenshot
  3. Architect          → progettare struttura nuovo prodotto
  4. Math Engineer      → verificare formule e calcoli
  5. Performance        → ottimizzare velocità e memoria
  6. Security           → verificare robustezza e edge cases"

## PROFILO 1 — CODE REVIEWER

### Obiettivo
Analizzare codice IronX esistente e produrre
un report strutturato con problemi e soluzioni.

### Fasi di review — nell'ordine esatto

FASE 1 — Compilation Safety:
  Tutti i tipi dichiarati correttamente?
  Cast espliciti ovunque?
  Nessun warning potenziale?
  Include paths corretti?

FASE 2 — Logic Correctness:
  La logica produce il risultato atteso?
  I casi limite sono gestiti?
  I valori NaN e zero sono gestiti?
  Le divisioni per zero sono protette?

FASE 3 — Anti-Repaint:
  NT8: Calculate.OnBarClose impostato?
  MT5: segnali solo su i < rates_total-1?
  TV: segnali solo su barstate.isconfirmed?
  MTF: lookahead_off e [1] usati?

FASE 4 — Object Lifecycle:
  NT8: tutti i brush hanno Freeze()?
  MT5: ObjectsDeleteAll in OnDeinit?
  TV: oggetti eliminati prima di ricreare?
  Nessun ghost object possibile?

FASE 5 — IronX Standards:
  Buffer layout rispetta standard [0-5]?
  Naming convention IronX sugli oggetti?
  Header IronXCharts presente?
  Font Arial Bold per frecce e simboli?

FASE 6 — Edge Cases:
  Cosa succede su mercato chiuso?
  Cosa succede su simbolo sconosciuto?
  Cosa succede con dati storici insufficienti?
  Cosa succede su timeframe non standard?

### Output review

Per ogni problema trovato:
  GRAVITA: CRITICO / ALTO / MEDIO / BASSO
  POSIZIONE: file e riga
  PROBLEMA: descrizione chiara
  SOLUZIONE: codice corretto

Score finale:
  10/10 = production ready
  8-9   = minori correzioni
  6-7   = correzioni importanti
  0-5   = riscrivere

## PROFILO 2 — REVERSE ENGINEER

### Obiettivo
Decostruire la logica di un indicatore NinZa
da codice decompilato, screenshot o video.

### Metodo 8 step

STEP 1 — Identificazione:
  Nome prodotto, piattaforma, versione
  Tipo: indicatore, strategia, bar type

STEP 2 — Input map:
  Elencare tutti i parametri visibili
  Tipo, valore default, range possibile
  Raggruppare per categoria logica

STEP 3 — Buffer map:
  Identificare ogni plot visibile sul chart
  Colore, stile, posizione (overlay o panel)
  Mappare al buffer layout standard IronX

STEP 4 — Decostruzione logica:
  Identificare la logica principale
  Separare in moduli: MA, ATR, Segnali, Visual
  Documentare ogni modulo separatamente

STEP 5 — Diagramma flusso:
  Input → Calcolo → Filtro → Segnale → Visual
  Ogni freccia documentata con condizione

STEP 6 — Formulario matematico:
  Estrarre ogni formula usata
  Verificare con documentazione ufficiale
  Marcare come VERIFICATA o IPOTESI

STEP 7 — Dipendenze:
  Usa altri indicatori interni?
  Dipende da bar type specifico?
  Richiede dati MTF?

STEP 8 — DLL Analysis (NUOVO — Critical for NinZa reverse engineering):

  1. Check for ninZaResources DLL (shared across all NinZa products):
     Contiene: Alert window, drawing utilities, color themes
     Impact: Se DLL assente, molti prodotti falliscono

  2. ninZa_AlertWindow = shared alert system:
     Funzionalità centralizzate per notification
     Utilizzato da: ThunderZilla, Easy Trend, ATR TradeShield, ecc.

  3. AgileDotNet obfuscation: method bodies stripped, class structure visible:
     Method bodies → => 0.0, => false, => null (non implementati visibilmente)
     Ma classe struct rimane leggibile
     Properties con [NinjaScriptProperty] sono SEMPRE visibili

  4. State variables are ALWAYS readable — focus on these for algorithm understanding:
     Esempio: ninZaSolarWave.cs → 12 state variables visibili
     Algoritmo deducibile da: nome variabile + tipo + setter/getter pattern
     Anche se corpo metodo è stripped, logica di stato è chiara

  5. Property attributes reveal parameter structure ([NinjaScriptProperty], [Display], [Range]):
     Ogni property ha metadata
     Default value → [Display(Default = X)]
     Range min/max → [Range(min, max)]
     Questi SEMPRE visibili anche con obfuscation

  6. Inner classes reveal data patterns (MarkerInfo, StepInfo, InstructionPanel, LogoPanel):
     Inner classes mantengono struttura anche obfuscate
     Pattern di naming (Info suffix, Panel suffix) rivela ruolo
     Enum interni → state machine structure

  7. Static constructors reveal: folder paths, default values, initialization order:
     Static constructor = inizializzazione sistema
     Paths to resources → dove salvare output
     Default values → parametri di default producotto
     Order of operations → dipendenze tra moduli

  8. When method bodies are stripped (=> 0.0, => false, => null), deduce from: state variables, property names, method signatures, call patterns:
     Non arrendersi su metodo vuoto
     Leggere: (a) state variables che modifica
              (b) proprietà che legge
              (c) chi chiama il metodo e perché
              (d) output atteso basato su firma
     Esempio: void UpdateTrend() stripped → ma vedi m_trendState += 1; in constructor → è contatore

### Sommario esecutivo (step 8.5 — dopo analisi DLL):
  Descrizione in 5 righe
  Complessità: BASSA / MEDIA / ALTA
  Fattibilità replica: PIENA / PARZIALE / LIMITATA
  Piattaforme supportate: NT8 / MT5 / TV

### Caso Studio — PaintBar Hollow/Solid (DA #99)

Captain Optimus decompilato (NON offuscato): PaintBar() righe 5376-5406.
  BarBiasBased=true → BarBrush = (trend*barDir>0) ? brush : Transparent
  CandleOutlineBrush = sempre trend color
  Doji (Close==Open) → skip
  Default: Captain=true, Easy Trend=false, FibMystery=true, Noble Cloud=true

Pattern di deduzione cross-prodotto:
  Easy Trend PaintBar è in NinZaResources (DLL condivisa, non decompilabile)
  MA Captain usa la STESSA logica → deduzione valida per tutto l'ecosistema NinZa
  Confermato da screenshot Luke (BAR_Uptrend/BAR_Downtrend)

### Gradi di certezza

VERIFICATO    = confermato da fonte ufficiale
IPOTESI       = dedotto da comportamento visivo
SCONOSCIUTO   = non determinabile senza codice sorgente

## PROFILO 3 — ARCHITECT

### Obiettivo
Progettare la struttura di un nuovo prodotto IronX
prima di scrivere qualsiasi riga di codice.

### Layer stack IronX

  LAYER 5 — UI e Visual
    Rendering, oggetti grafici, dashboard, colori

  LAYER 4 — Signal Output
    Buffer [0-5], alert, ComBus, Captain interface

  LAYER 3 — Signal Engine
    Logica segnali, filtri, confluenza, anti-repaint

  LAYER 2 — Calculation Engine
    MA engine, ATR engine, oscillatori, formule

  LAYER 1 — Data Access
    OHLCV, volume, MTF, bar type detection

  LAYER 0 — Core
    Types, constants, utilities, math library

### Regole architettura

Ogni layer conosce solo i layer sotto di lui.
Layer 5 non parla direttamente con Layer 0.
Ogni modulo ha una singola responsabilità.
Nessuna logica di business in layer UI.
Nessun rendering in layer calcolo.

### Output architettura

Per ogni nuovo prodotto:
  Diagramma layer con responsabilità di ognuno
  Lista file con ruolo esatto
  Interfacce tra moduli
  Dipendenze esterne
  Stima complessità per piattaforma
  Rischi tecnici identificati

### Pattern consigliati IronX

Strategy pattern:
  Per MA engine con 16 tipi
  Ogni MA è una strategia intercambiabile

Observer pattern:
  Per ComBus e Captain
  Indicatori notificano Captain su cambio stato
  ComBus Keys: IronX.<PROD>.<Symbol>.<TF>.<Suffix> (DA #109)
  MAI underscore — SEMPRE dot notation con Symbol e TF

ComBus Diagnostic Pattern (DA #110):
  1. Grep tutti i GlobalVariableSet/Get/Check/Del nel codebase
  2. Verificare che OGNI chiave usi formato dot notation
  3. Verificare che suffissi corrispondano a ironx-confluence §6.2/6.3
  4. Verificare Register() in OnInit + FlushProduct() in OnDeinit
  5. Verificare che consumer usano BuildKey/IronX_ComBusKey
  6. Se trovate chiavi underscore → FIX immediato
  7. Se trovate chiavi hardcoded → refactor a BuildKey/helper

Factory pattern:
  Per creazione oggetti grafici
  Centralizza naming convention e stile

Object Pool:
  Per MT5 — riutilizzare oggetti grafici
  Evitare ObjectCreate/Delete ogni barra

Segment-Based Rect (DA #103 — Background Painting):
  Per MT5 — OBJ_RECTANGLE BACK per background trend
  Creare 1 rettangolo per segmento trend (non per barra)
  Estendere rettangolo corrente finché trend non cambia
  Pre-blend colore con sfondo chart via BlendColor()
  Cleanup: ObjectsDeleteAll con prefisso in OnDeinit
  Price boundaries: 999999.0 (top) / 0.0 (bottom) per full-height
  OBJPROP_HIDDEN=true su tutti — no inquinamento lista oggetti utente
  ~10-30 rettangoli per 500 barre (vs 500 se per-bar)

## PROFILO 4 — MATH ENGINEER

### Obiettivo
Verificare e implementare formule matematiche
per indicatori IronX su tutte le piattaforme.

### Formule verificate IronX

SMA:
  SMA = Sum(close, period) / period

EMA:
  k = 2 / (period + 1)
  EMA = close * k + EMA[1] * (1 - k)

WMA:
  Sum = 0, WeightSum = 0
  for i = 0 to period-1:
    Sum += close[i] * (period - i)
    WeightSum += (period - i)
  WMA = Sum / WeightSum

HMA:
  half = period / 2
  sqr  = sqrt(period)
  WMA1 = WMA(close, half)
  WMA2 = WMA(close, period)
  raw  = 2 * WMA1 - WMA2
  HMA  = WMA(raw, sqr)

DEMA:
  EMA1 = EMA(close, period)
  EMA2 = EMA(EMA1, period)
  DEMA = 2 * EMA1 - EMA2

TEMA:
  EMA1 = EMA(close, period)
  EMA2 = EMA(EMA1, period)
  EMA3 = EMA(EMA2, period)
  TEMA = 3*EMA1 - 3*EMA2 + EMA3

ZLEMA:
  lag  = (period - 1) / 2
  src  = 2 * close - close[lag]
  ZLEMA = EMA(src, period)

SMMA (prima barra):
  SMMA = SMA(close, period)
SMMA (barre successive):
  SMMA = (SMMA[1] * (period-1) + close) / period

ATR:
  TR   = max(High-Low,
             abs(High-Close[1]),
             abs(Low-Close[1]))
  ATR  = SMMA(TR, period)

SuperTrend:
  HL2  = (High + Low) / 2
  upperBand = HL2 + multiplier * ATR
  lowerBand = HL2 - multiplier * ATR
  if close > upperBand[1]: trend = 1
  if close < lowerBand[1]: trend = -1

VWAP:
  VWAP = Sum(TP * Volume) / Sum(Volume)
  TP   = (High + Low + Close) / 3

### Analisi numerica

Prima di implementare ogni formula verificare:
  Divisione per zero: Sum(volume) == 0?
  Overflow: valori molto grandi moltiplicati?
  NaN: sqrt di negativo? log di zero?
  Precisione: floating point su prezzi piccoli?

Protezioni standard:
  NT8:  if (Volume[0] == 0) return;
  MT5:  if(volume[i] == 0) continue;
  TV:   nz(volume, 1) per evitare divisione per 0

### Equivalenza cross-platform

Ogni formula implementata deve produrre
lo stesso risultato su NT8 MT5 e TV.
Differenze ammesse: massimo 0.0001%
(floating point rounding).

Verificare sempre su stesso simbolo e timeframe.

## PROFILO 5 — PERFORMANCE ENGINEER

### Obiettivo
Ottimizzare velocità e uso memoria degli
indicatori IronX su ogni piattaforma.

### Target performance IronX

  NT8 OnBarUpdate:  meno di 5ms su 1000 barre
  NT8 OnRender:     meno di 2ms per frame
  MT5 OnCalculate:  meno di 10ms su 1000 barre
  TV esecuzione:    nessun timeout (limite 20 secondi)
  Oggetti grafici:  massimo 200 per indicatore

### Hot path NT8

In OnBarUpdate evitare sempre:
  new() — allocazione heap ogni tick
  LINQ — overhead significativo
  lock() — possibile deadlock
  String concatenation in loop
  Math.Pow() — usare moltiplicazione diretta

In OnRender evitare:
  Ricalcolo valori — usare cache da OnBarUpdate
  Creazione brush — usare istanze pre-create
  Loop su tutte le barre — limitare a barre visibili

### Hot path MT5

In OnCalculate ottimizzare:
  Usare prev_calculated per ricalcolare solo barre nuove
  Cachare handle iCustom in OnInit
  Usare CopyBuffer invece di accesso singolo
  Riutilizzare oggetti con ObjectMove
  Evitare ObjectCreate/Delete ogni bar

Background Painting performance (DA #103):
  Segment-based: 1 OBJ_RECTANGLE per segmento trend (~10-30 per 500 barre)
  BlendColor() caching: pre-calcolare colori blended in OnInit (non ogni tick)
  Dirty flag: ricreare rect solo su full recalc, estendere su barra normale
  ChartGetInteger(CHART_COLOR_BACKGROUND) cachato — aggiornare solo su CHART_CHANGE

### Hot path TV

In PineScript ottimizzare:
  var per stati persistenti — evitare ricalcolo
  Limitare request.security a massimo 10 se possibile
  Eliminare oggetti vecchi — evitare accumulo
  Preferire plot() su label.new() dove possibile
  Calcoli pesanti solo su barstate.isconfirmed

### Pattern sliding window

Per calcoli su N barre precedenti:
  Invece di ricalcolare da zero ogni barra
  mantenere una somma scorrevole:

  NT8:
    _rollingSum += Close[0] - Close[Period];

  MT5:
    rollingSum += close[i] - close[i-Period];

  TV:
    var float rollingSum = 0.0
    rollingSum := rollingSum + close - close[period]

## PROFILO 6 — SECURITY ENGINEER

### Obiettivo
Verificare robustezza e gestione edge cases
negli indicatori IronX.

### Threat model IronX

RISCHIO 1 — Input validation:
  Parametri fuori range → crash o comportamento anomalo
  Protezione: clampare sempre i valori input
  Es: period = Math.Max(1, Math.Min(500, period))

RISCHIO 2 — Overflow numerico:
  Prezzi * volume su asset ad alto prezzo → overflow
  Protezione: usare double non float — verificare range

RISCHIO 3 — Dati insufficienti:
  BarsRequiredToPlot non impostato → accesso barre inesistenti
  Protezione: sempre impostare BarsRequiredToPlot correttamente
  Sempre guard: if (CurrentBar < BarsRequired) return

RISCHIO 4 — Ghost objects:
  Indicatore rimosso senza cleanup → oggetti orfani
  Protezione: OnTermination/OnDeinit con cleanup completo

RISCHIO 5 — Race condition NT8:
  BarsInProgress non controllato → calcoli su serie wrong
  Protezione: sempre if (BarsInProgress != 0) return

RISCHIO 6 — Memory leak MT5:
  ObjectCreate senza ObjectDelete → memoria esaurita nel tempo
  Protezione: ObjectMove per aggiornare — mai ricreare

### Checklist security per piattaforma

NT8:
  Tutti i parametri input hanno MinValue e MaxValue?
  BarsRequiredToPlot impostato correttamente?
  BarsInProgress check presente?
  OnTermination implementato con cleanup?
  Brush.Freeze() su ogni brush?

MT5:
  Input parameters hanno limiti min/max?
  rates_total >= period prima di calcolare?
  OnDeinit con ObjectsDeleteAll?
  GlobalVariableDel in OnDeinit?
  NormalizeDouble su tutti i prezzi?

TV:
  input.int/float con minval/maxval?
  na() check prima di usare valori?
  nz() per proteggere divisioni?
  Limiti 500 rispettati?

## CHECKLIST ENGINEER PRE-SESSIONE

  Profilo corretto identificato?
  Piattaforma target specificata?
  Output atteso definito?
  Documentazione da produrre concordata?
  Se Opus necessario — segnalato a Luke?

IronXCharts © Luke SteelWolf — marzo 2026
