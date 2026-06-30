---
description: "Contesto base permanente dell'IronX Ecosystem. Da attivare in ogni sessione di lavoro — Cowork, Code o Chat — indipendentemente dal prodotto o dalla piattaforma su cui si sta lavorando. Contiene filosofia, standard, governance e regole universali del progetto."
---

---
name: ironx-ecosystem
description: Contesto base permanente dell'IronX Ecosystem. Da attivare in ogni sessione di lavoro — Cowork, Code o Chat — indipendentemente dal prodotto o dalla piattaforma su cui si sta lavorando. Contiene filosofia, standard, governance e regole universali del progetto.
---

# IRONX ECOSYSTEM — ISTRUZIONI BASE

## IDENTITÀ
- Sviluppatore: Luke SteelWolf
- Brand: IronXCharts ©
- Progetto: IronX Ecosystem
- Obiettivo: Replica perfetta e completa dell'ecosistema NinZa.co,
  KingRenko.co e tutta la famiglia NinZa

## ECOSISTEMA E PIATTAFORME
L'IronX Ecosystem è composto da indicatori e indicatori
semi-automatizzati che vivono su 3 piattaforme:

- NinjaTrader 8 → C# NinjaScript → piattaforma MADRE
  (indicatori + strategie semi-automatizzate)
- MetaTrader 5 → MQL5 → EA che replicano NT8
- TradingView → PineScript v6 → indicatori/strategie che replicano NT8

LEGGE FONDAMENTALE: ogni prodotto su MT5 e TradingView deve
replicare in modo perfetto logica, grafica, comportamento e
fluidità del corrispettivo NT8, sfruttando al massimo le
capacità native di ogni piattaforma.

## PRODOTTI IRONX

| Prodotto | Livello | Ruolo | Equivalente NinZa | Stato |
|----------|---------|-------|-------------------|-------|
| Easy X Trend v2.0 | L1 | Trend direction + segnali | Easy Trend | ✅ Attivo |
| ATR X TradeShield v10.0 | L2 | TP/SL/Trailing/Risk + Stats | ATR TradeShield | ✅ Attivo |
| IronX MagnetOsc v1.0 | L1B | MTF momentum Push/Pull | MagnetOsc Turbo | ✅ Attivo |
| IronXRenko v1.0 | L0.5 | Renko chart via Custom Symbol | ninZaRenko | ✅ Attivo |
| IronX-ATR v1.0 | L1 | Wrapper visivo ATR gapless | ninZaATR | ✅ Attivo |
| IronX MA-Slope v1.0 | L1 | Slope momentum complementare a PCF | MA-Slope | 🔲 Pianificato |
| Captain IronX | L3 | Orchestratore EA | Captain Optimus | 🔲 Pianificato |

## GERARCHIA 4 LIVELLI — ARCHITETTURA ECOSISTEMA

**LAYER 0: IronX Core Library (.mqh) — HUB CENTRALE**
- IronX_MathLib: 17 MA + 3 ATR + Layer 2 (Ehlers/ZLEMA/DEMA/EMA) + PCF + Slope Engine
- IronX_RenkoMath: formule pure Renko (stateless)
- Incluso da TUTTI via #include (compile-time)

**LAYER 0.5: DATA GENERATORS**
- IronXRenko v1.0 — Renko chart via Custom Symbol API

**LAYER 1: INDICATORI PURI**
- Easy X Trend v2.0 — trend + segnali (289 MA combo, PCF)
- IronX-ATR v1.0 — wrapper visivo sub-window ATR gapless
- IronX MA-Slope v1.0 — slope momentum complementare a PCF (futuro)

**LAYER 1B: OSCILLATORI**
- IronX MagnetOsc v1.0 — MTF momentum Push/Pull

**LAYER 2: RISK MANAGEMENT**
- ATR X TradeShield v10.0 — legge EXT buffer, gestisce TP/SL/Trail/Stats

**LAYER 3: EXECUTION EA (futuro)**
- Captain IronX — Hit Bar + Signal Bar + Esecuzione

Flusso dati: TOP→DOWN sempre. iCustom MAI per math, SOLO per segnali.

## STANDARD DI QUALITÀ ASSOLUTI
Ogni prodotto dell'ecosistema deve rispettare senza eccezioni:
- Zero oggetti ghost
- Zero ritardi
- Zero flash
- Zero tremolii
- Zero repaint (nessun ridisegno di segnali passati)
- Zero future leaking (nessun calcolo su barre future)
- Fluidità e confluenza perfetta tra tutti i prodotti
- Massimo sfruttamento della tecnologia grafica nativa
  di ogni piattaforma (oggetti, marker, label, spazi, dinamicità)

## STANDARD TECNICI UNIVERSALI
- Buffer layout: prodotto-specifico (EXT v2.0 = 18 buffer, MAOSC = 15, ATRS = 14, NC = 10)
  Ogni prodotto definisce il proprio layout — vedere CLAUDE.md "Buffer Reference"
  Buffer comuni iCustom/ComBus: Signal_Trend, Signal_Trade, ATR (indici variano per prodotto)
- Naming oggetti grafici: "IronX_[PRODOTTO]_[TIPO]_[ID]"
- Font marker: SEMPRE "Arial Bold" per ▲▼ — MAI Wingdings
- Prefisso versione oggetti chart: IronX_EXT_v50_, IronX_ATS_v10_, ecc.
- Cast espliciti sempre: (uchar), (int), (double) — mai impliciti
- 0 errors, 0 warnings in compilazione — obbligatorio

**Signal_Trend — Contratto Universale (DA #115-117):**
- 1.0 = trend rialzista confermato
- -1.0 = trend ribassista confermato
- 0.0 = flat/laterale (solo IRONX_FLAT_NINZA mode)
- Tipo: double (obbligatorio per ComBus GlobalVariables)
- Anti-repaint: solo barra chiusa confermata
- Ogni prodotto trend DEVE pubblicare .Trend su ComBus
- NinZa standard (ninza.co web): "1=uptrend, -1=downtrend"
- IronX superset: include 0.0 in NinZa flat mode
- NT8 usa CacheIndicator (NO GlobalVar), MT5 usa ComBus, TV usa input.source()

**Signal_Trade (5 valori standard):**
- 0 = nessun segnale
- 1 = inizio uptrend (Long start)
- -1 = inizio downtrend (Short start)
- 2 = pullback Buy (entry reversal)
- -2 = pullback Sell (entry reversal)

**ATTENZIONE CRITICA:** La semantica di 2/-2 VARIA per prodotto:
- Easy X Trend: 2/-2 = Pullback (ENTRY)
- ThunderZilla: 2/-2 = Slowdown (EXIT WARNING)
- MagnetOsc: 2/-2 = Pull (ENTRY reversal)

**Signal Adapter OBBLIGATORIO per Captain** — MAI leggere Signal_Trade raw da prodotti diversi senza traduzione unificata (vedere IronX_SignalAdapter.mqh).

**Input Validation — Standard Universale IronX (DA #118-123):**
- ValidateInputs() centralizzata come PRIMA istruzione in OnInit per OGNI prodotto
- CRITICAL errors (periodo ≤0, divisione per zero) → Print("PROD CRITICAL:") + return false → INIT_PARAMETERS_INCORRECT
- WARNING (color clrNONE, range fuori limite) → Print("PROD WARNING:") + continue
- MAI Alert() — causa popup cascata in multi-chart (DA #119)
- MAI modificare variabili input (read-only in MQL5)
- Engine guards (MathMax, ATR>0) mantenuti come Layer 2 defense-in-depth (DA #123)
- clrNONE check su OGNI parametro color (DA #120)
- Cross-platform: MQL5=ValidateInputs(), PineScript=input.int(minval/maxval), NT8=[Range] attribute
- Template universale: copiare struttura da EXT v2.0 per nuovi prodotti

## STANDARD COMBUS KEYS — REGOLA UNIVERSALE (DA #109-112)

Formato CANONICO per TUTTE le chiavi ComBus inter-prodotto:
  IronX.<PRODOTTO>.<Symbol>.<TF>.<Suffisso>

Implementazione:
  Classe C_IronX_ComBus in IronX_ComBus.mqh (publish/read/flush)
  Helper IronX_ComBusKey() in IronX_Types.mqh (convenience read)

Regole NON DEROGABILI:
  MAI formato underscore (IronX_EXT_Trend) per ComBus
  MAI omettere Symbol e TF dalla chiave
  MAI hardcodare chiavi — SEMPRE BuildKey() o IronX_ComBusKey()
  MAI GlobalVariableDel singola — SEMPRE FlushProduct()
  Register() in OnInit, FlushProduct() in OnDeinit

Codici prodotto registrati:
  EXT=Easy X Trend, ATRS=ATR TradeShield, MAOSC=MagnetOsc,
  XATR=IronX-ATR, RENKO=IronXRenko, MASLOPE=IronX MA-Slope,
  NC=Noble Cloud, TZ=ThunderZilla, FZ=Fibonacci Zone,
  TR=Trio Reversal, BOB=Bo$$ Order Block, CPT=Captain IronX

Dettaglio chiavi per prodotto: vedere ironx-confluence §6.2/6.3.

## STRUTTURA CARTELLE
- IronX_Ecosystem/    → codice sorgente di tutti i prodotti
- Cowork_Research/    → output di ricerche e analisi

## REGOLE DI OUTPUT
- Lingua italiana per tutto il testo
- Termini tecnici di trading e programmazione in inglese
- Ricerche e analisi → file .md in Cowork_Research/
- Codice → nella cartella IronX_Ecosystem/
- Documentazione: strutturata, professionale, riutilizzabile

## PRIORITÀ ASSOLUTE
- Solidità prima della velocità
- Prima si studia, poi si scrive
- Ogni modifica al codice deve essere motivata e documentata
- La sezione "NON TOCCARE MAI" in ogni CLAUDE.md documenta
  bug critici risolti: non modificare mai senza approvazione esplicita

## RICERCA

Per ogni prodotto da realizzare o replicare, Claude deve:
- Ricercare in profondità: web, forum, GitHub,
  documentazione ufficiale della piattaforma
- Studiare le regole native, il linguaggio, le formule
  e gli oggetti grafici della piattaforma richiesta
- Non scrivere una riga di codice prima di avere
  piena conoscenza della tecnologia coinvolta

**STATO RICERCA (12 marzo 2026):** 18 prodotti NinZa ricercati, 11 decompilati analizzati (~20K LOC C#), 167 screenshot, 22+ video trascritti. Coerenza dati verificata 9.5/10. Scoperte: ZuperView = sister brand NinZa su TradingView (zuperview.com), Easy Trend e MagnetOsc già portati su TV. Vedere Cowork_Research/ per tutti i file analitici, decompilati, screenshot e ricerche deep research.

## SCOPERTA TRADINGVIEW

**ZuperView (zuperview.com) = sister brand NinZa su TradingView**

Easy Trend e MagnetOsc sono già stati portati su TradingView sotto il brand ZuperView. Questo rappresenta la strategia di porting TV definitiva per l'ecosistema IronX e un modello di riferimento per future migrazioni PineScript v6.

## MAPPA SKILL ECOSYSTEM
Quando serve informazione specifica, attivare la skill dedicata:
- ironx-platform-matrix → equivalenze NT8/MT5/TV, fattibilità, codice
- ironx-engineer        → code review, reverse engineering, architettura, math
- ironx-signals         → logica segnali, buffer output, anti-repaint
- ironx-nt8             → NinjaScript C#, WPF, SharpDX, DrawingTools
- ironx-mql5            → MQL5, CCanvas, ARGB, oggetti chart, buffer
- ironx-pinescript      → PineScript v6, limitazioni TV, table/label/box
- ironx-quality         → checklist qualità, zero-ghost, testing, pre-commit
- ironx-session         → apertura/chiusura sessioni Claude Code, workflow
- ironx-bar-types       → Renko, NinZaRenko, logiche e grafica bar types
- ironx-confluence      → comunicazione inter-prodotti, ComBus, Captain
- ironx-alerts          → sistema alert cross-platform NT8/MT5/TV
- ironx-docs            → standard documentazione, markdown, template
- ironx-research        → metodologia ricerca, verificazione fonti, deep research

## GOVERNANCE — PRINCIPIO DI EVOLUZIONE CONTROLLATA
Durante qualsiasi sessione di lavoro (Cowork, Code o Chat,
con Opus 4.6 o Sonnet 4.6), se Claude identifica una
miglioria a una skill esistente o rileva che manca qualcosa
di importante, NON la aggiunge autonomamente.

Claude si ferma e propone a Luke:
1. Quale skill va modificata
2. Cosa aggiungere esattamente e perché
3. Quale impatto ha sul resto dell'ecosistema

Solo dopo approvazione esplicita di Luke la skill viene
aggiornata. Le skill evolvono in modo organico, controllato
e tracciabile nel tempo.

## IronX CHOPPINESS INDEX (M2 FILTER) — AGGIUNTO (DA #132-140)

**Status:** Ricerca completata, implementazione-ready.
**Formula:** CI = 100×LOG10(SUM(ATR,N)/(MaxH-MinL))/LOG10(N) — STANDARD UNIVERSALE
**Defaults:** period=14, threshold=61.8 (Fibonacci)
**Posizione:** Precision Filters, dopo Slope, prima signal_count
**Scope:** EXT v2.0 LIGHT (3 params, internal gate)
**ComBus:** No (internal gate only, non-pubblicato)

**Decisioni (DA #132-140):**
- DA #132: CI formula standard non-proprietaria Kaufman/Dreiss
- DA #133: gapless_atr_buf[] riuso, no recalc
- DA #134: MathLog10 implementation MQL5
- DA #135: period >= 2 CRITICAL in ValidateInputs
- DA #136: Posizione catena Precision Filters
- DA #137: Semantica: CI > 61.8 = laterale (no segnali)
- DA #138: Cross-platform equivalenza: NT8 Math.Log10, TV ta.log10()
- DA #139: NinZa note: no CI in Easy Trend, Sidewayz/CCI sono prodotti diversi
- DA #140: Regola permanente: CI LIGHT non pubblica su ComBus

## DECISIONI ARCHITETTURALI CROSS-PLATFORM RECENTI

DA #99: Bar Painting Hollow/Solid = Soluzione 2 dimmed colors su MT5. Trigger: trend*barDir>0=SOLID, <0=HOLLOW. 5 indici DRAW_COLOR_CANDLES.
DA #100: MQL5 DRAW_COLOR_CANDLES NON supporta outline/body separati. TV plotcandle() sì. NT8 BarBrush/CandleOutlineBrush sì.
DA #101: DimColor() = blend 50% con DimGray per simulare hollow su MT5.
DA #102: Candle colors parametrici (InpColorUp/InpColorDown), non più hardcoded.

Queste DA si applicano a TUTTI i prodotti IronX che implementano bar painting.

DA #103: Background Painting = OBJ_RECTANGLE BACK + pre-blend con chart bg. Plot 5 DRAW_NONE permanente. Buffer 10/11 mantenuti per iCustom/ComBus. Segment-based (~10-30 rect per 500 barre).
DA #104: BlendColor() formula: per canale RGB result = bg*(100-opacity)/100 + fg*opacity/100. bg da ChartGetInteger(0, CHART_COLOR_BACKGROUND). MQL5 color = 0xBBGGRR.
DA #105: NinZa Background standard: LimeGreen(#32CD32) bullish / HotPink(#FF69B4) bearish — 3 fonti NinZa indipendenti. Opacity: ET=20, SW=10, FM=20, Captain=30.
DA #106: IronX Background parametri: InpBGColorUp=clrLimeGreen, InpBGColorDn=clrHotPink, InpBGOpacity=20. InpShowBackground=false default (NinZa aligned).
DA #107: Plot 5 ALWAYS DRAW_NONE. Buffer 10/11 solo dati per iCustom. Visual rendering interamente via OBJ_RECTANGLE BACK. MAI DRAW_COLOR_HISTOGRAM.
DA #108: MQL5 NO alpha su OBJ_RECTANGLE e plot colors — confermato. Pre-blend con sfondo chart è l'unica soluzione che mantiene z-order corretto (livello [0] dietro candele).

Queste DA si applicano a TUTTI i prodotti IronX che implementano background painting.

## STANDARD 4 GRUPPI COLORE — EXT v2.0 (DA #113)

Ogni prodotto IronX con visual sul chart ha fino a 4 gruppi colore INDIPENDENTI.
I default bearish sono INTENZIONALMENTE diversi per gruppo (design NinZa verificato).

| Gruppo | Bullish | Bearish | Fonte |
|--------|---------|---------|-------|
| PLOT (MA line) | DodgerBlue (#1E90FF) | Crimson (#DC143C) | EXT InpColorUp/Down |
| BAR (candle painting) | DodgerBlue (#1E90FF) | DeepPink (#FF1493) | Captain decomp. riga 1379 |
| BACKGROUND | LimeGreen (#32CD32) | HotPink (#FF69B4) | 3 fonti NinZa indipendenti |
| MARKER (signals) | DodgerBlue (#1E90FF) | HotPink (#FF69B4) | Screenshot NinZa |

Sistema 3-livelli bearish (NinZa intenzionale):
  Crimson (Plot) → DeepPink (Bar) → HotPink (Background + Marker)

Questa gerarchia si applica come DEFAULT a TUTTI i prodotti futuri (NC, TZ, FZ, TR, BOB)
salvo parametri specifici per prodotto che sovrascrivono i default.

REGOLA: TUTTI i colori visual sono PARAMETRICI (input) — MAI hardcoded.

## IronX MA-SLOPE v1.0 — MOMENTUM COMPLEMENTARE A PCF (DA #124-131)

**Ruolo:** Indicatore L1 complementare a PCF Filter di EXT v2.0. Misura la velocità di cambiamento della MA per identificare momentum e divergenze. Mantiene 2 buffer pubblici per segnalazioni e confluenza con Captain.

**Formula NinZa CONFERMATA (3 fonti concordi — decompilato + screenshot + legacy .mqh):**
```
rawSlope = (MA[i] - MA[i-Lookback]) / Lookback / ninZaATR × 1000
smoothSlope = LinReg(rawSlope, 2)   // LinReg per SMOOTHING, NON per calcolo
```
- Lookback default = 5 (NinZa property panel)
- ninZaATR = Gapless ATR (H-L only, no gap)
- ×1000 per integer-scale readability (valori tipici ±50-300)
- LinReg period 2 = smoothing della slope, NON calcolo raw slope

**Caratteristiche:**
- Derivata prima della MA (velocità di trend) normalizzata ATR
- Cross-instrument by design: stessa threshold funziona su Gold, NQ, FDAX, Forex
- Threshold hysteresis 4-state: UptrendStart=+120, UptrendEnd=-60, DowntrendStart=-120, DowntrendEnd=+60
- Band hysteresis: 180 punti per direzione (crosses zero!)
- Complementare a PCF: PCF=1-bar noise filter su MA line, Slope=N-bar strength filter su signal validation
- DA #25 VINCOLANTE: "Slope SOLO TF, MAI scalping (WR 21.3% verificato)"
- ComBus publish per inter-prodotto confluenza con MagnetOsc + Captain
- ZuperView NON ha portato MA-Slope su TV → IronX first-mover opportunity

**ComBus Keys:**
```
IronX.MASLOPE.{Symbol}.{TF}.Status     // "OK", "INVALID", "INIT"
IronX.MASLOPE.{Symbol}.{TF}.Slope      // valore slope raw
IronX.MASLOPE.{Symbol}.{TF}.Trend      // 1/-1/0 (aligned/against/flat) — Signal_Trend contract
IronX.MASLOPE.{Symbol}.{TF}.Signal     // 1/-1/2/-2 (trend start, momentum buy/sell) — Signal_Trade
IronX.MASLOPE.{Symbol}.{TF}.State      // 0-4 (INIT, STRONG_UP, WEAK_UP, WEAK_DOWN, STRONG_DOWN)
```

**Doppio Prodotto (DECISIONE DEFINITIVA Luke):**
1. **EXT v2.0 Slope Filter LIGHT** — 3 parametri gate nei precision filters:
   - InpSlopeEnabled (bool, default false)
   - InpSlopeLookback (int, default 5)
   - InpSlopeThreshold (int, default 120)
   - Formula: `MathAbs((MA[i] - MA[i-InpSlopeLookback]) / InpSlopeLookback / ninZaATR × 1000) >= InpSlopeThreshold`

2. **IronX MA-Slope v1.0 (futuro L1 separato)** — Full replica NinZa:
   - 20 parametri NinZa completi, sub-window histogram
   - 4-state hysteresis, Signal_Trade 6 valori, Signal_State 4 valori
   - Background/bar painting, 4-color histogram, alert system
   - Ricerca COMPLETA in MA_Slope_RESEARCH_COMPLETA.md

**Signal System MA-Slope (6 valori Signal_Trade):**
- +1=UpStart, -1=DnStart
- -2=UpSlowdown, +2=DnSlowdown (WARNING exit)
- +3=UpResume, -3=DnResume
- ResumingSlowdownSplit = 5 bars

**Signal_State (4 valori):** +2=strong up, +1=weak up, -1=weak down, -2=strong down

**Decisioni Architetturali:**
- DA #124: Formula NinZa = (MA[i]-MA[i-N])/N/ninZaATR×1000. LinReg=smoothing (period 2), NON calcolo
- DA #125: Threshold hysteresis: ±120 start, ∓60 end. Band 180 punti. Crosses zero!
- DA #126: NinZa defaults (NINZA DIRETTA property panels): EMA 25, Smooth EMA 5, Lookback 5, Threshold ±120, ATR 100
- DA #127: PCF vs Slope COMPLEMENTARI: PCF=1-bar noise MA line, Slope=N-bar strength signal validation
- DA #128: EXT LIGHT = 3 params gate in precision filters (dopo PCF, prima MTF Confirm)
- DA #129: MA-Slope FULL = L1 separato, sub-window, Signal Adapter con IRONX_IND_MA_SLOPE
- DA #130: Signal_Trade MA-Slope: ±2=Slowdown (WARNING), ±3=Resume — semantica diversa da EXT!
- DA #131: REGOLA GRAFICA COMPLETA — regola permanente (vedere sezione dedicata sotto)

## REGOLA GRAFICA COMPLETA — OBBLIGATORIA PER TUTTI I PRODOTTI (DA #131)

Ogni ricerca prodotto NinZa DEVE includere documentazione visual/grafica COMPLETA:

1. **CHART OBJECTS:** tipo (histogram, line, rectangle, arrow), dimensioni (width, height), z-order (BACK, FRONT), opacity, stile (SOLID, DASH, DOT), periodo di vita
2. **COLORI (sistema completo):** valori HEX esatti, mappatura stato→colore, supporto dark/light theme, 4 gruppi colore standard (Plot/Bar/Background/Marker)
3. **MARKERS/LABELS:** caratteri Unicode (con codice esatto), font, dimensione, posizione (above/below bar, offset), condizioni di trigger, cooldown, interazioni tra markers di prodotti diversi
4. **DASHBOARD/PANELS:** layout, posizione, drag behavior, docking, testi, formattazione
5. **CONFLUENZE/INTERAZIONI:** come il prodotto interagisce visivamente con altri prodotti IronX sullo stesso chart
6. **RENDERING BEHAVIOR:** stepped vs smooth, repaint behavior, TF scaling, Renko behavior, refresh frequency
7. **ALERT SYSTEM:** testo esatto, trigger conditions, suono vs visual, popup colors, frequenza/blocking

**QUESTA REGOLA VALE PER SEMPRE** — si applica retroattivamente a tutti i prodotti già ricercati (verificare gap) e obbligatoriamente a tutti i prodotti futuri.
