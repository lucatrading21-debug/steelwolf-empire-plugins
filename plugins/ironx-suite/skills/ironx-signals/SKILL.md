---
description: Logica segnali, buffer output e anti-repaint per l'IronX Ecosystem. Attivare quando si progetta o implementa un sistema di segnali su qualsiasi piattaforma. Contiene buffer layout per prodotto, tipi di segnale, logiche Trend e Trade, 4 gruppi colore, regole anti-repaint definitive per NT8 MT5 TV, gestione MTF, e pattern verificati per segnali senza repaint e senza future leaking.
---

# IRONX SIGNALS — LOGICA SEGNALI E BUFFER OUTPUT

## REGOLA FONDAMENTALE
Zero repaint. Zero future leaking.
Un segnale che ridisegna è peggio di nessun segnale.
Ogni segnale IronX viene emesso SOLO su barra chiusa confermata.

## SEZIONE 1 — BUFFER LAYOUT PRODOTTO-SPECIFICO

Ogni prodotto IronX ha il proprio buffer layout ottimizzato.
Captain IronX legge i buffer via iCustom/CopyBuffer con indici
prodotto-specifici (documentati nel CLAUDE.md principale).

### 1.1 Easy X Trend v2.0 — Buffer Layout Reale (18 buffer)

  Buffer[0]  = MA Line value (INDICATOR_DATA)
  Buffer[1]  = Line color index: 0=up, 1=down, 2=flat (COLOR_INDEX)
  Buffer[2-5]= Candle OHLC (INDICATOR_DATA)
  Buffer[6]  = Candle color index: 5 colori hollow/solid (COLOR_INDEX)
  Buffer[7]  = Buy arrow (INDICATOR_DATA)
  Buffer[8]  = Sell arrow (INDICATOR_DATA)
  Buffer[9]  = Signal_Trade: 1/-1/2/-2/0 (INDICATOR_DATA)
  Buffer[10] = Background value (INDICATOR_DATA)
  Buffer[11] = Background color index (COLOR_INDEX)
  Buffer[12] = Signal_Trend: 1/-1/0 (INDICATOR_DATA)
  Buffer[13-17] = Calcoli interni (INDICATOR_CALCULATIONS)

### 1.2 Buffer Chiave per Captain (cross-prodotto)

Captain IronX legge questi buffer semantici via CopyBuffer:
  EXT  Buffer[9]  = Signal_Trade (trigger entry)
  EXT  Buffer[12] = Signal_Trend (bias direzionale)
  EXT  Buffer[0]  = MA Line (livello prezzo)
  EXT  Buffer[13] = ATR (stop loss dinamico)
  ATRS Buffer[0]  = RawATR, Buffer[2-4] = SL1-3, Buffer[5-7] = TP1-3
  MAOSC Buffer[6] = Signal, Buffer[7] = HTF_Osc

NOTA: NON esiste un buffer COS. Il COS (Change Of State) è un
marker visivo DrawText ESCLUSIVO di Captain IronX (L3 EA) —
non è un buffer di nessun indicatore L1/L2.
Vedere Sezione 12 per COS Captain.

## SEZIONE 2 — TIPI DI SEGNALE IRONX

### 2.1 Signal_Trend — Contratto Universale (DA #115-117)

Segnale continuo — aggiornato su ogni barra chiusa CONFERMATA.
Non genera frecce — determina il colore delle barre e della MA.
OGNI prodotto IronX con trend DEVE pubblicare Signal_Trend su ComBus.

  1.0  = trend rialzista confermato
  -1.0 = trend ribassista confermato
  0.0  = neutro — laterale o transizione (solo IRONX_FLAT_NINZA mode)

Logica base (EXT_Engine_v2.mqh DetectTrend):
  MA corrente > MA precedente (> epsilon) → 1
  MA corrente < MA precedente (> epsilon) → -1
  Differenza sotto epsilon → 0 (NinZa mode) o prev_trend (Legacy mode)
  Epsilon = _Point * 0.5 (anti-jitter guard)

Tipo dato: double OBBLIGATORIO (ComBus GlobalVariables = double)
Anti-repaint: solo barra chiusa (last_confirmed = rates_total - 2)
ComBus suffix: .Trend (standard) — .Signal_Trend (Noble Cloud, 3 output)

NinZa standard (ninza.co web CONFERMATO):
  "trend indicators always have a Signal_Trend plot with values 1=uptrend, -1=downtrend"
  IronX superset: include 0.0 per flat mode (NinZa: alcuni indicatori usano 0=no trend)

NinZa NT8 architettura (DA #116):
  NT8 NON usa GlobalVariables per Signal_Trend. Usa CacheIndicator<>+Values[]
  in-process. IronX MT5 usa ComBus/GlobalVariables perché .ex5 separati.
  TV usa input.source() o mega-script. Risultato equivalente.

### 2.2 Signal_Trade — Segnale di entrata

Segnale evento — appare solo al cambio di condizione.
Genera frecce e label su chart.

  1  = segnale Long — freccia su
  -1 = segnale Short — freccia giù
  0  = nessun segnale attivo

Logica base:
  Crossover MA con trigger → 1 solo sulla barra del cross
  Crossunder MA con trigger → -1 solo sulla barra del cross
  Barre successive senza cross → 0

### 2.3 Signal_Trade Esteso — Pullback (valori ±2)

Aggiuntivo al segnale base ±1 — appare SOLO se InpPullbackEn=true.

  2  = Pullback BUY: low<=MA AND close>MA in uptrend
  -2 = Pullback SELL: high>=MA AND close<MA in downtrend

ATTENZIONE — Semantica diversa per prodotto:
  EXT  ±2 = Pullback (ENTRY)
  TZ   ±2 = Slowdown (EXIT WARNING), ±3 = Pullback
  MAOSC ±2 = Pull (ENTRY reversal)
  SEMPRE usare Signal Adapter Translate() per prodotti misti.

### 2.4 Strength — Forza segnale

Valore continuo da 0.0 a 1.0.
Usato da Captain IronX per sizing della posizione.

  0.0 - 0.3 = segnale debole
  0.3 - 0.7 = segnale medio
  0.7 - 1.0 = segnale forte

Calcolo base:
  Normalizzare distanza MA da media storica
  Combinare con ATR relativo
  Clampare tra 0.0 e 1.0

## SEZIONE 3 — ANTI-REPAINT DEFINITIVO

### 3.1 NT8 — Regole

REGOLA 1: Calculate = Calculate.OnBarClose SEMPRE
  Non usare OnPriceChange per indicatori con segnali

REGOLA 2: Guard all'inizio di OnBarUpdate
  if (CurrentBar < BarsRequiredToPlot) return;
  if (BarsInProgress != 0) return;

REGOLA 3: Segnali solo su IsFirstTickOfBar
  if (IsFirstTickOfBar) {
    // Prima esecuzione sulla nuova barra
    // La barra precedente è ora chiusa e definitiva
    Values[2][1] = crossedUp ? 1 : crossedDown ? -1 : 0;
  }

REGOLA 4: MAI leggere Close[0] per segnali definitivi
  Usare Close[1] — la barra chiusa più recente

### 3.2 MT5 — Regole

REGOLA 1: Segnali definitivi solo su barre chiuse
  for(int i = start; i < rates_total; i++) {
    if(i < rates_total - 1) {
      // barra chiusa — segnale definitivo
      Buffer2[i] = calcSignal(i);
    } else {
      // barra aperta — solo MA, mai segnali
      Buffer0[i] = calcMA(i);
      Buffer2[i] = 0;
    }
  }

REGOLA 2: prev_calculated per efficienza
  int start = (prev_calculated > 0)
              ? prev_calculated - 1
              : InpPeriod;

REGOLA 3: MAI ArraySetAsSeries=true sui buffer

### 3.3 TV — Regole

REGOLA 1: Segnali solo dentro barstate.isconfirmed
  bool longSignal  = false
  bool shortSignal = false
  if barstate.isconfirmed
      longSignal  := crossover(ma, ma[1])
      shortSignal := crossunder(ma, ma[1])

REGOLA 2: plotshape con and barstate.isconfirmed
  plotshape(longSignal and barstate.isconfirmed,
      style=shape.arrowup, ...)

REGOLA 3: request.security con lookahead_off e [1]
  float htfVal = request.security(
      syminfo.tickerid, "60",
      ta.ema(close, 14)[1],
      lookahead=barmerge.lookahead_off)

## SEZIONE 4 — LOGICA MA ENGINE

### 4.1 17 tipi MA supportati IronX (ENUM_IRONX_MA_TYPE 0-16)

  0  SMA   Simple Moving Average
  1  EMA   Exponential Moving Average
  2  SMMA  Smoothed Moving Average (RMA/Wilder)
  3  LWMA  Linear Weighted Moving Average
  4  DEMA  Double Exponential Moving Average
  5  TEMA  Triple Exponential Moving Average
  6  HMA   Hull Moving Average
  7  T3    T3 Moving Average (VFactor=0.7)
  8  KAMA  Kaufman Adaptive MA (Fast=2, Slow=30)
  9  VIDYA Variable Index Dynamic Average (CMO=9)
  10 WMA   Wilder Smoothing (=SMMA)
  11 ZLEMA Zero Lag EMA
  12 ALMA  Arnaud Legoux MA (offset=0.85, sigma=6)
  13 LSMA  Least Squares MA (linear regression endpoint)
  14 VWMA  Volume Weighted MA (fallback SMA se vol=0)
  15 REMA  Recursive EMA (Lambda=0.5, guard i>=2)
  16 TMA   Triangular MA = SMA(SMA(P,ceil(N/2)),floor(N/2)+1)

### 4.2 Formule critiche

HMA:
  halfPeriod = period / 2
  sqrtPeriod = sqrt(period)
  wma1 = WMA(close, halfPeriod)
  wma2 = WMA(close, period)
  raw  = 2 * wma1 - wma2
  HMA  = WMA(raw, sqrtPeriod)

DEMA:
  ema1 = EMA(close, period)
  ema2 = EMA(ema1, period)
  DEMA = 2 * ema1 - ema2

TEMA:
  ema1 = EMA(close, period)
  ema2 = EMA(ema1, period)
  ema3 = EMA(ema2, period)
  TEMA = 3*ema1 - 3*ema2 + ema3

ZLEMA:
  lag  = (period - 1) / 2
  src  = 2 * close - close[lag]
  ZLEMA = EMA(src, period)

SMMA (prima barra):
  SMMA[0] = SMA(close, period)
SMMA (barre successive):
  SMMA[i] = (SMMA[i-1] * (period-1) + close[i]) / period

### 4.3 ATR Engine

ATR standard:
  TR = max(High-Low, abs(High-Close[1]), abs(Low-Close[1]))
  ATR = SMMA(TR, period)

ATR normalizzato (per Strength):
  ATR_normalized = ATR / Close * 100

## SEZIONE 5 — LOGICA TREND DETECTION

### 5.1 SuperTrend base

upperBand = (high + low) / 2 + multiplier * ATR
lowerBand = (high + low) / 2 - multiplier * ATR

if close > upperBand[1]:
  trend = 1   // Bullish
if close < lowerBand[1]:
  trend = -1  // Bearish

### 5.2 Cambio trend — segnale Trade

longSignal  = trend == 1 and trend[1] == -1
shortSignal = trend == -1 and trend[1] == 1

Questi generano Signal_Trade = 1 o -1
Solo sulla barra del cambio — poi torna a 0

### 5.3 Filtri per qualità segnale

Filtro ATR — evitare segnali in bassa volatilità:
  atrFilter = ATR > ATR_average * 0.8

Filtro trend HTF — confluenza multi-timeframe:
  htfTrend = request.security(..., Signal_Trend[1])
  htfFilter = htfTrend == localTrend

Filtro volume:
  volFilter = volume > ta.sma(volume, 20)

## SEZIONE 6 — GESTIONE MTF

### 6.1 Gerarchia timeframe IronX

  M1  M5  M15  → scalping
  M30  H1      → intraday
  H4  D1       → swing
  W1  MN       → posizionale

Regola confluenza:
  Segnale Trade valido solo se allineato con
  almeno un timeframe superiore

### 6.2 Pattern MTF per piattaforma

NT8:
  AddDataSeries in Configure per ogni TF aggiuntivo
  Leggere via BarsInProgress filter
  Cachare in Series<double> dedicata

MT5:
  Handle iCustom per ogni TF
  CopyBuffer per leggere valori
  Cachare in array locali

TV:
  request.security per ogni TF
  Massimo 40 chiamate per script
  Usare sempre [1] e lookahead_off

## SEZIONE 7 — COMUNICAZIONE BUFFER CON CAPTAIN

Captain IronX legge i buffer di ogni indicatore IronX
con indici prodotto-specifici (vedere Sezione 1):

  EXT:   Buffer[9]=Signal_Trade, [12]=Trend, [0]=Line, [13]=ATR
  ATRS:  Buffer[0]=RawATR, [2-4]=SL1-3, [5-7]=TP1-3
  MAOSC: Buffer[6]=Signal, [7]=HTF_Osc
  NC:    Buffer[1]=Signal_Trend, [2]=Signal_Cloud, [3]=Signal_Trade

COS (Change Of State) NON è un buffer — è un marker DrawText
di Captain IronX (L3 EA). Appare quando TUTTI gli indicatori
concordano sulla direzione E cambiano stato simultaneamente.
Vedere Sezione 12 per dettagli COS Captain.

Se un buffer non è usato:
  Impostare PLOT_EMPTY_VALUE = 0 per i buffer non usati
  Non lasciare buffer non inizializzati

## SEZIONE 8 — CHECKLIST SEGNALI PRE-COMMIT

  Buffer layout allineato al CLAUDE.md per il prodotto?
  Signal_Trade emesso solo su cambio condizione?
  Nessun segnale su barra aperta?
  NT8: Calculate.OnBarClose impostato?
  MT5: segnali solo su i < rates_total-1?
  TV: segnali solo dentro barstate.isconfirmed?
  MTF usa pattern anti-repaint corretto?
  Colori parametrici (4 gruppi: Plot, Bar, BG, Marker)?
  Marker colors da InpMarkerColorUp/Dn — mai hardcoded?
  Bar colors da InpBarColorUp/Dn — mai hardcoded?
  Buffer non usati inizializzati a 0?
  Testato su replay — segnali non si spostano?
  Testato cambio simbolo — buffer si resettano?

## SEZIONE 9 — NOBLE CLOUD SIGNAL SYSTEM

Noble Cloud è UNICO nell'ecosistema: ha 3 signal output separati (non un singolo Signal_Trade multi-valore).

### 9.1 Buffer Layout Noble Cloud (4 plots)

  Plot[0] = Baseline (MA lenta, visibile dash 2px)
  Plot[1] = Signal_Trend (1/-1, direzione baseline)
  Plot[2] = Signal_Cloud (1/-1/0, stato cloud)
  Plot[3] = Signal_Trade (1/-1/0, segnale entry filtrato)

REGOLA: Signal plots 1-3 sono TRASPARENTI (data-only). Solo Baseline è visibile.

### 9.2 Signal_Cloud — Stato cloud (UNICO per Noble Cloud)

  1  = Cloud bullish (Kernel > Baseline)
  -1 = Cloud bearish (Kernel < Baseline)
  0  = Crossover / transizione

### 9.3 Signal Adapter plotSelector

Noble Cloud richiede EncodeNobleCloud() prima di Translate():
  int encoded = C_IronX_SignalAdapter::EncodeNobleCloud(bufferIndex, raw_value);
  C_IronX_SignalAdapter::Translate(IRONX_IND_NOBLE_CLOUD, encoded, result);

  bufferIndex 0 → Signal_Trade → encoded ±1 → IRONX_SIG_CLOUD_ENTRY
  bufferIndex 1 → Signal_Cloud → encoded ±2 → IRONX_SIG_CLOUD_STATE
  bufferIndex 2 → Signal_Trend → encoded ±3 → IRONX_SIG_CLOUD_TREND

REGOLA: MAI leggere Signal_Trade Noble Cloud senza EncodeNobleCloud — 3 buffer separati!

### 9.4 Signal Split e Filtri

  Signal Split (Bars) = 5 (default) — minimo 5 barre tra segnali consecutivi
  Filter: Bar Min = 10 — cloud deve durare almeno 10 barre per essere valida
  Filter: Bar Max = 300 — cloud oltre 300 barre viene ignorata
  Alert Blocking = 60 secondi — anti-spam alert

## SEZIONE 10 — BAR PAINTING HOLLOW/SOLID BUFFER

Bar Painting usa il color buffer (BuffCandleColor, index 6 in EXT v2.0) con 5 indici:

  Index 0 = Bull Solid (trend>0 AND close>open) → InpColorUp
  Index 1 = Bear Solid (trend<0 AND close<open) → InpColorDown
  Index 2 = Bull Hollow (trend<0 AND close>open) → DimColor(InpColorUp)
  Index 3 = Bear Hollow (trend>0 AND close<open) → DimColor(InpColorDown)
  Index 4 = Flat/Doji (trend==0 OR close==open) → DimGray

Logica in SetBarColor (EXT_Visual_v2.mqh):
  Trigger = trend * barDir (dove barDir = sign(close-open))
  trend*barDir > 0 → ALIGNED → SOLID (colore pieno trend)
  trend*barDir < 0 → AGAINST → HOLLOW (colore dimmed)
  trend==0 OR barDir==0 → FLAT/DOJI → DimGray

InpBarBiasBased=false → logica disabilitata, tutte le barre solid per trend.

## SEZIONE 11 — BACKGROUND PAINTING BUFFER E VISUAL (DA #103-108)

Background Painting usa buffer 10 (BuffBackground) e 11 (BuffBGColor) per dati iCustom/ComBus.
Rendering visivo via OBJ_RECTANGLE con OBJPROP_BACK=true (NON via plot histogram).

Buffer 10 (BuffBackground): valore close per barre con trend!=0, 0 per flat
Buffer 11 (BuffBGColor): 0=uptrend, 1=downtrend — per iCustom reading

Visual rendering:
  OBJ_RECTANGLE con OBJPROP_BACK=true → z-order [0] DIETRO candele
  Colori pre-blended con sfondo chart via BlendColor(fg, chart_bg, opacity)
  Segment-based: 1 rettangolo per trend continuo (~10-30 per 500 barre)
  Flat (trend==0): nessun rettangolo = gap trasparente (identico NinZa BackBrush)

Colori default NinZa (DA #105):
  Bullish: clrLimeGreen — 3 fonti NinZa indipendenti
  Bearish: clrHotPink — 3 fonti NinZa indipendenti
  Opacity: 20 (Easy Trend), 10 (Solar Wave), 30 (Captain)
  InpShowBackground=false default (NinZa aligned)

Plot 5 (Background): SEMPRE DRAW_NONE (DA #107)
  Buffer dati mantenuti per iCustom/CopyBuffer/ComBus
  MAI usare DRAW_COLOR_HISTOGRAM per background — alpha ignorato, linee sottili

## SEZIONE 11b — CHOPPINESS INDEX FILTER (DA #132-140)

Choppiness Index (CI) è un filtro di precisione per identificare mercati laterali vs trending.

### 11b.1 Formula Standard UNIVERSALE (non proprietaria NinZa)

```
CI = 100 × LOG10(SUM(ATR,N) / (MaxH - MinL)) / LOG10(N)
```

**Fonte:** Kaufman / Dreiss formula standard. NON è proprietaria NinZa.

**Parametri:**
- Period N: default 14 (Fibonacci standard)
- Threshold: default 61.8 (Fibonacci standard)
- ATR source: gapless (H-L only) — SCELTA ARCHITETTURALE IRONX

**Valori:**
- CI > 61.8 → laterale (trending debole)
- CI < 61.8 → trending (movimento direzionale)

### 11b.2 CI nella Precision Filters Chain

Posizione nella catena ValidateSignal:
1. Range Filter (ATR multiplier)
2. Time Filter
3. MTF Confirm
4. Slope Filter (DA #124-131)
5. **CI Filter** ← posizione (nuova)
6. Signal Count (max 3 per trend)
7. Cooldown (minimo barre tra segnali)
8. Confluence Index (CI) ← diverso, non conflitto
9. ATR Ratio

### 11b.3 Implementazione MQL5

CI uses gapless_atr_buf[] (already calculated by Engine):
```
double rawCI = MathLog10(BuffSumATR[i] / (MaxHigh - MinLow)) / MathLog10(period);
double CI = 100 * rawCI;
if(CI > InpCIThreshold) signal_valid = false; // lateral market
```

Guardia: gapless ATR > 0 (divisione per zero).

### 11b.4 ValidateInputs per CI (DA #118-123)

CRITICAL: InpCIPeriod >= 2 (LOG10(1)=0 causa divisione).
WARNING: se InpCIThreshold <= 0 o > 100.

### 11b.5 NinZa NOTE STORICHE

NinZa Easy Trend NON ha CI integrato.
Ci sono prodotti NinZa separati con CI:
- Sidewayz RT, ZP, MA — prodotti proprietari con algoritmi sconosciuti
- CCI (Lambert) ≠ CI (Dreiss) — sono indicatori DIVERSI

## SEZIONE 12 — COMBUS SIGNAL KEYS PER CAPTAIN (DA #109-112)

### 12.1 Formato Chiavi ComBus

  IronX.<PRODOTTO>.<Symbol>.<TF>.<Suffisso>

  MAI formato underscore (IronX_EXT_Trend) — SEMPRE dot notation.
  Generato da C_IronX_ComBus::BuildKey() o IronX_ComBusKey().

### 12.2 Mappa Completa Chiavi Signal per Captain

  EXT Signal Keys (Easy X Trend v2.0):
    .Signal   = Signal_Trade (0/1/-1/2/-2)
    .Trend    = Signal_Trend (1/-1/0)
    .Line     = MA Line value
    .ATR      = ATR value

  ATRS Signal Keys (ATR TradeShield v10.0):
    .ATR      = ATR corrente
    .SL1      = Stop Loss livello 1
    .TP1      = Take Profit livello 1
    .BE_Stage = Break Even stage
    .R_Multiple = R-Multiple

  MAOSC Signal Keys (MagnetOsc v1.0):
    .Signal   = Signal (0/1/-1/2/-2)
    .LTF_Osc  = Oscillatore LTF
    .HTF_Osc  = Oscillatore HTF

  NC Signal Keys (Noble Cloud — futuro):
    .Signal_Cloud = Cloud state (1/-1/0)
    .Signal_Trade = Entry signal (1/-1/0)
    .Signal_Trend = Baseline direction (1/-1)
    .Baseline     = Baseline MA value

  TZ Signal Keys (ThunderZilla — futuro):
    .Signal    = Signal_Trade (0/±1/±2/±3/±4)
    .Trend     = Trend (1/-1/0)
    .Momentum  = Momentum score

  MASLOPE Signal Keys (MA-Slope — futuro L1):
    .Slope     = MA Slope value (×1000 integer scale)
    .Trend     = Signal_Trend (+1/-1/0)
    .Signal    = Signal_Trade (+1/-1/-2/+2/+3/-3)
    .State     = Signal_State (+2/+1/-1/-2)

NOTA CRITICA — Signal_Trade semantica diversa per prodotto:
  EXT     2/-2 = Pullback (ENTRY)
  TZ      2/-2 = Slowdown (EXIT WARNING), 3/-3 = Pullback
  MAOSC   2/-2 = Pull (ENTRY reversal)
  MASLOPE -2/+2 = Slowdown (EXIT WARNING), +3/-3 = Resume (ENTRY) — DA #124
  SEMPRE usare Signal Adapter Translate() — MAI leggere raw.

### MA-Slope Signal System (DA #124-131)

MA-Slope 4 output: MASlope(histogram ×1000), Signal_Trend(+1/-1/0), Signal_State(+2/+1/-1/-2 isteresi), Signal_Trade(6 valori).
Formula: (MA[i]-MA[i-N])/N/ninZaATR×1000. Threshold ±120. Lookback 5. ATR(100). Smooth: LinReg period 2.
Isteresi: UptrendEnd=-60, DowntrendEnd=+60 (attraversano zero!).
EXT v2.0 LIGHT: gate |slope|<threshold, 3 params, SOLO TF M15+ (DA #25).
PCF + Slope COMPLEMENTARI (DA #127): PCF=1-bar noise, Slope=N-bar strength.

## SEZIONE 13 — 4 GRUPPI COLORE STANDARD (DA GAP H1)

Ogni indicatore IronX con visual output ha 4 gruppi colore parametrici:

  PLOT (MA Line):     InpColorUp=DodgerBlue  InpColorDown=Crimson  InpColorFlat=Gray
  BAR (Candle Paint): InpBarColorUp=DodgerBlue  InpBarColorDn=DeepPink
  BACKGROUND:         InpBGColorUp=LimeGreen  InpBGColorDn=HotPink  InpBGOpacity=20
  MARKER (Segnali):   InpMarkerColorUp=DodgerBlue  InpMarkerColorDn=HotPink
  MARKER (Pullback):  InpPBColorUp=Cyan  InpPBColorDn=Orange

Sistema 3 livelli bearish (intenzionale NinZa):
  Livello 1 (forte):   Crimson (#DC143C) — Plot MA line
  Livello 2 (medio):   DeepPink (#FF1493) — Bar painting candele
  Livello 3 (leggero): HotPink (#FF69B4) — Background + Marker segnali

REGOLA: MAI hardcodare colori nei moduli — SEMPRE passare come parametri da input.
Fonte: NINZA DIRETTA — screenshot Proprietà + Captain Optimus decompilato.

## SEZIONE 14 — COS CHANGE OF STATE (SOLO CAPTAIN IRONX L3)

COS = Change Of State / SyncSignal marker.
Proprietario ESCLUSIVO: Captain IronX (L3 EA).
NON è un buffer. NON è un segnale di nessun indicatore L1/L2.
NON implementare in EXT, MAOSC, ATRS o altri indicatori.

### 14.1 Trigger Logic

  COS appare quando:
  1. TUTTI gli indicatori configurati concordano sulla direzione (unanimita')
  2. signalState CAMBIA rispetto alla barra precedente
  3. Se entrambi true → disegna COS marker + fire alert
  Continuing: se unanimita' ma stessa direzione → disegna "•"

### 14.2 Parametri COS (NinZa Captain Optimus decompilato righe 1306-1312)

  MarkerBrushBullish = DodgerBlue
  MarkerBrushBearish = HotPink
  MarkerStringSyncSignalBullishStart = "⮙ + COS"
  MarkerStringSyncSignalBearishStart = "COS + ⮛"
  MarkerStringSyncSignalBullishContinuing = "•"
  MarkerStringSyncSignalBearishContinuing = "•"
  MarkerFont = Arial, 20px

Fonte: NINZA DIRETTA — Captain Optimus decompilato 9244 LOC.

IronXCharts © Luke SteelWolf — marzo 2026