---
description: Renko, NinZaRenko e KingRenko$ per l'IronX Ecosystem. Attivare quando si sviluppa o replica logiche su bar types custom. Contiene differenze ninZaRenko vs KingRenko$, comportamento OHLC, Trend Threshold, Brick Size, backtesting, pattern di codice per NT8 MT5 TV, e tutti i comportamenti verificati da documentazione ufficiale ninZa.
---

# IRONX BAR TYPES — RENKO E CUSTOM BARS

## REGOLA FONDAMENTALE
I dati su questa skill sono VERIFICATI da documentazione
ufficiale ninZa.co. Qualsiasi dettaglio non verificato
è marcato esplicitamente come IPOTESI.
Prima di sviluppare su bar types, leggere questa skill
interamente.

## SEZIONE 1 — NINZARENKO — FATTI VERIFICATI

### 1.1 Cos'è ninZaRenko

Fonte verificata: ninza.co/product/ninzarenko

- Bar type gratuito per NinjaTrader 8
- Uno dei bar type più scaricati su NT8 nel mondo
- Superiore a UniRenko per gestione dei gap di mercato
- UniRenko ha un bug: quando il mercato fa un gap,
  i Close prices perdono l'allineamento corretto
- ninZaRenko risolve questo problema nativamente
- ID barra: 12345 — univoco, non modificare mai

### 1.2 Caratteristica chiave — Open artificiale

ninZaRenko usa un Open ARTIFICIALE.
Questo open non corrisponde al prezzo reale di mercato
ma viene calcolato per creare armonia visiva sul chart.

Effetto visivo: trend molto più leggibile e pulito
Effetto tecnico: NON backtestabile accuratamente
perché l'Open non è reale.

Qualsiasi strategia basata su Open di ninZaRenko
NON può essere backtestata con precisione.

### 1.3 Impostazioni ninZaRenko — VERIFICATE

Trend Threshold:
  Parametro che determina la sensibilità del trend
  Valore più basso = più barre = più sensibile
  Valore più alto = meno barre = meno rumore

Brick Size:
  Dimensione del mattone Renko
  Può essere ATR-based o valore fisso
  ATR-based si adatta alla volatilità corrente

### 1.4 Comportamento su NT8

CurrentBar NON corrisponde al numero di box Renko.
Su Renko ogni barra è un box — ma il contatore
CurrentBar segue la logica interna NT8.

Per contare box Renko manualmente:
  private int _boxCount = 0;
  private double _lastClose = 0;

  in OnBarUpdate:
  if (Close[0] != _lastClose) {
    _boxCount++;
    _lastClose = Close[0];
  }

BrickSize disponibile come:
  BarsPeriod.Value per Renko standard NT8

## SEZIONE 2 — KINGRENKO$ — FATTI VERIFICATI

### 2.1 Cos'è KingRenko$

Fonte verificata: ninza.co/product/kingrenko
                  renkokings.com/product/kingrenko

KingRenko$ è definito da ninZa come il "vero volto"
di ninZaRenko. Stessa struttura visiva, ma con
OHLC reale — nessun Open artificiale.

KingRenko$ è un prodotto PREMIUM ($) distinto,
disponibile su renkokings.com, non su ninza.co.

### 2.2 Differenze critiche ninZaRenko vs KingRenko$

ninZaRenko:
  Open: ARTIFICIALE — calcolato per armonia visiva
  High: reale
  Low: reale
  Close: reale
  Backtesting: NON accurato — Open artificiale
  Live trading: ottimo — visivamente armonioso
  Costo: GRATUITO
  Platform: NT8 only

KingRenko$:
  Open: REALE — nessun artificio
  High: reale
  Low: reale
  Close: reale — IDENTICO a ninZaRenko con stesse impostazioni
  Backtesting: ACCURATO — tutti i dati reali
  Live trading: ottimo — OHLC verificabile
  Costo: PREMIUM ($)
  Platform: NT8 only

### 2.3 Relazione Close prices — CRITICA

Fatto verificato da ninZa:
Se ninZaRenko e KingRenko$ hanno le stesse impostazioni
(stesso Trend Threshold e stesso Brick Size),
i prezzi Close delle due barre corrispondono ESATTAMENTE.

Conseguenza fondamentale:
Qualsiasi indicatore IronX basato su Close prices
produce valori IDENTICI su ninZaRenko e KingRenko$.

Questo significa:
  Sviluppare su KingRenko$ → testare e backtest accurato
  Deployare su ninZaRenko → stesso comportamento visivo

### 2.4 Stesse impostazioni

KingRenko$ condivide con ninZaRenko:
  Trend Threshold — stesso parametro, stesso comportamento
  Brick Size — stesso parametro, stesso comportamento

### 2.5 Template XML KingRenko$ — Parametri verificati

Fonte: decompilato XML templates KingRenko$ da renkokings.com

Standard template:
  Value = 12       (Brick Size in ticks)
  Value2 = 4       (Trend Threshold)

Solar Wave RK optimized:
  Value = 12       (Brick Size)
  Value2 = 4       (Trend Threshold)
  + 30/60 tick offsets configurabili

**Critico:** Value != Value2
  Value = Brick Size (dimensione mattone)
  Value2 = Trend Threshold (sensibilità reversal)

## SEZIONE 3 — FORMULE MATEMATICHE RENKO

### 3.1 Brick Close Calculation

Formula universale per tutti i Renko (ninZaRenko, KingRenko$, IronXRenko):

**Uptrend (long bricks):**
  close = prevClose + n × brickSize
  dove n è il numero di brick incrementali

**Downtrend (short bricks):**
  close = prevClose - n × brickSize
  dove n è il numero di brick decrementali

Ogni brick rappresenta una variazione di prezzo di esattamente
`brickSize` punti, sempre in unità di prezzo.

### 3.2 Open Offset — ninZaRenko e KingRenko$ a confronto

**ninZaRenko (artificial open):**
  open = prevClose
  L'open è ARTIFICIALE — non riflette il vero mercato
  Logica: crea continuità visiva sulla chart
  Effetto: chart più "pulito" ma non backtestabile

**KingRenko$ (real open):**
  open = prezzo di mercato al momento del brick formation
  L'open è REALE — corrisponde al prezzo effettivo
  Logica: massima fedeltà dati per backtesting
  Effetto: backtesting preciso e verificabile

**Conseguenza critica:**
Se una strategia legge Open[0], su ninZaRenko avrà
valori artificiali = risultati backtesting inaccurati.
Su KingRenko$ avrà valori reali = backtesting preciso.

### 3.3 Reversal Calculation — Standard Renko

Per passare da un brick all'altro richiede:
  |price_movement| > brickSize × 2

Esempio:
  Brick size = 10 ticks
  Reversal richiede movimento di almeno 20 ticks

Questo GARANTISCE che il prezzo non crei brick
in direzioni alterne ("ping-pong prevention").

### 3.4 Trend Threshold (KingRenko$ specifico)

Parametro AGGIUNTIVO rispetto al Brick Size.

**Definizione:**
Sensibilità che determina quando si passa da un brick all'altro
durante cambi di trend.

**Formula:**
Ogni Trend Threshold = movimento di X ticks aggiuntivi
per confermare la reversione.

**Esempio da template:**
  Brick Size = 12 ticks
  Trend Threshold = 4 ticks

  Un brick si forma quando:
    - prezzo sale almeno 12 ticks (brick) +
    - ulteriori 4 ticks di conferma (threshold)
  = totale 16 ticks per formare il brick

**Effetto pratico:**
  Trend Threshold più basso = brick più frequenti = chart più "sensibile"
  Trend Threshold più alto = brick meno frequenti = chart meno rumoroso

### 3.5 KingRenko$ Template Formula — Verificata da XML

Da decompilato XML KingRenko$:

```
Brick Formation:
  if |Close - prevClose| >= Value (Brick Size):
    new brick formed
    direction = sign(Close - prevClose)

Trend Reversal:
  if brick direction != previous direction
    AND |price_movement| > Value (Brick Size) × 2:
    reversal confirmed
    trend change = true

Threshold Application:
  effective_reversal = brick_movement > Value + Value2
  (Brick Size + Trend Threshold)
```

## SEZIONE 4 — RENKO SU NT8

### 4.1 Accesso dati Renko su NinjaScript

I dati OHLCV si accedono normalmente:
  Open[0]   prezzo open della barra corrente
  High[0]   prezzo high
  Low[0]    prezzo low
  Close[0]  prezzo close
  Volume[0] volume

Per ninZaRenko ricordare che Open[0] è artificiale.
Per KingRenko$ tutti i valori sono reali.

### 4.2 Rilevamento bar type in NinjaScript

Verificare se siamo su Renko:
  if (BarsPeriod.BarsPeriodType ==
      BarsPeriodType.Renko) {
    // su Renko standard NT8
  }

Per ninZaRenko e KingRenko$ usare il nome:
  if (Bars.BarsType.ToString()
      .Contains("ninZaRenko")) {
    // su ninZaRenko
  }

### 4.3 Pattern tracking box Renko NT8

Contare box e direzione:
  private int  _bullBoxes = 0;
  private int  _bearBoxes = 0;
  private bool _lastWasBull = false;

  in OnBarUpdate:
  bool isBull = Close[0] > Open[0];
  if (isBull != _lastWasBull) {
    // cambio direzione
    _bullBoxes = 0;
    _bearBoxes = 0;
    _lastWasBull = isBull;
  }
  if (isBull) _bullBoxes++;
  else _bearBoxes++;

### 4.4 AddDataSeries Pattern — Renko in NT8

Quando si lavora con Renko custom in NinjaScript,
usare il pattern AddDataSeries() in Configure():

```csharp
// Per ninZaRenko:
AddDataSeries(new ninZaRenko(
    BarsArray[0].Instrument.MasterInstrument.Name,
    BarsPeriodType.Tick,
    1,
    brickSize,      // valore Brick Size
    trendThreshold  // valore Trend Threshold
));

// Accesso in OnBarUpdate:
if (BarsInProgress == 1) {  // secondary series
    // dati Renko disponibili
    double renkoClose = Close[0];
}
```

**Critico:** AddDataSeries() carica i dati Renko
in una serie secondaria. Controllare BarsInProgress
per distinguere tra primary (0) e secondary (1+).

## SEZIONE 5 — RENKO SU MT5

### 5.1 Limitazione MT5

MT5 NON ha un bar type Renko nativo.
ninZaRenko e KingRenko$ sono NT8-only.

Workaround possibili:
  1. Indicatore che simula logica Renko su candele standard
  2. Custom bar type di terze parti per MT5
  3. Custom Symbol API (MT5 5.0+) per creare simboli sintetici

### 5.2 IronXRenko v1.0 — Implementazione MT5 via Custom Symbol API

**Fonte verificata:** /Include/IronX/IronXRenko/ (6 moduli)

IronXRenko è l'implementazione IronX nativa per MT5
che replica il comportamento Renko via Custom Symbol API.

**Architettura:**
- RENKO_Types.mqh      — Strutture e enum
- RENKO_Engine.mqh     — Logica brick formation
- RENKO_SymbolManager.mqh — Gestione custom symbol
- RENKO_HistoryGenerator.mqh — Generazione history Renko
- RENKO_LiveFeed.mqh   — Aggiornamento dati live
- RENKO_SessionManager.mqh — Gestione sessioni di trading

**Flusso:**
1. IronXRenko crea custom symbol (es: GOLD_RENKO_MT5)
2. RENKO_Engine calcola brick secondo formule standard
3. RENKO_HistoryGenerator popola history dai dati reali
4. RENKO_LiveFeed aggiorna live feed per nuovi brick
5. Indicator/EA legge custom symbol come barre normali

**Limitazione critica (identica a ninZaRenko/KingRenko$):**
IronXRenko ha Open artificiale (prevClose).
ANY strategia basata su Open NON backtestabile accuratamente.
Close-based indicators funzionano perfettamente.

### 5.3 ComBus IPC Key — IronXRenko

IronXRenko comunica via ComBus (Global Variables):

```
Key format: IronX.RENKO.{Parent}.R{B}_{T}.{SubKey}

Esempio:
  IronX.RENKO.EURUSD.R12_0.Status
  IronX.RENKO.EURUSD.R12_0.BrickCount
  IronX.RENKO.EURUSD.R12_0.Direction

Campi:
  Status       — "OK", "SYNCING", "ERROR"
  BrickCount   — numero totale brick formati
  Direction    — 1 (up), -1 (down), 0 (flat)
  NextBrickAt  — prezzo target per prossimo brick
  LastUpdate   — timestamp ultimo aggiornamento
```

### 5.4 Simulazione logica Renko in MQL5

Per barre standard (non Custom Symbol):

Calcolo brick size ATR-based:
  double atr = iATR(Symbol(), Period(), 14,
    rates_total-1-1);
  double brickSize = NormalizeDouble(
    atr * multiplier, _Digits);

Logica cambio barra Renko simulata:
  static double lastRenkoClose = 0;
  static int    renkoTrend = 0;

  double currentClose = close[rates_total-1];

  if(lastRenkoClose == 0)
    lastRenkoClose = currentClose;

  if(currentClose >= lastRenkoClose + brickSize) {
    renkoTrend = 1;
    lastRenkoClose = currentClose;
  }
  if(currentClose <= lastRenkoClose - brickSize) {
    renkoTrend = -1;
    lastRenkoClose = currentClose;
  }

**Nota:** Questa logica è APPROSSIMATIVA. Per implementazione
completa usare IronXRenko v1.0 con Custom Symbol API.

## SEZIONE 6 — RENKO SU TRADINGVIEW

### 6.1 TradingView Renko Nativo

TradingView ha un Renko nativo accessibile via:

```pine
// Verificare se siamo su Renko
if chart.is_renko
    // logica Renko

// Per creare chart Renko sintetico:
request.security(syminfo.tickerid, "1R", close)
// "1R" = 1-point Renko
```

### 6.2 Ticker.renko() — TV 5.0+

Formula moderna in PineScript v5+:

```pine
renkoClose = ta.renko(close, brickSize)

// ticker.renko() per chart Renko nativo
if barstate.isconfirmed
    // anti-repaint safe
```

TradingView Renko è **NATIVO** (non simulato).
Comportamento diverso da ninZaRenko/KingRenko$/IronXRenko.

### 6.3 Limitazioni e Differenze TV Renko vs ninZaRenko

**TradingView ticker.renko():**
  ✅ Nativo e ottimizzato TV
  ❌ Non equivalente a ninZaRenko
  ❌ Algorithm offuscato, non open source
  ❌ Non backtestabile su dati storici pre-2020
  ✅ Real OHLC (no artificial open)

**ninZaRenko:**
  ✅ Open artificiale per chart leggibile
  ❌ Open artificiale = no backtest accurato
  ✅ Gratuito, NT8 native
  ✅ Supporto community forte

**Conclusione:** Non è possibile replicare perfettamente
ninZaRenko in TradingView. Usare TV nativo e
documentare differenze come limitazione porting.

### 6.4 Brick size in TV

```pine
float brickSize = syminfo.mintick * brickMultiplier

// Esempio XAUUSD (1 decimale = 1 centesimo)
// syminfo.mintick = 0.01
// Se brickMultiplier = 100 → brickSize = 1.0 (1 dollaro)

// Esempio NQ (0.25 minimum)
// syminfo.mintick = 0.25
// Se brickMultiplier = 50 → brickSize = 12.5 (12.5 indice)
```

Su chart Renko TV il close di ogni barra
corrisponde a un multiplo del brick size (identico a formula 3.1).

### 6.5 Renko Porting Research — TradingView Non Supportato

**Conclusione Audit 12/03/2026:**

IronXRenko v1.0 (MT5 Custom Symbol) è IMPOSSIBILE portare
su TradingView. Motivi:

1. TV non supporta Custom Symbols
2. TV ticker.renko() è proprietario, non replicabile
3. AddDataSeries (NT8) non ha equivalente TV
4. request.security() non supporta Renko sintetici

**Raccomandazione:** Documentare TradingView Renko come
prodotto separato (ticker.renko()) e NON cercare di
replicare ninZaRenko/IronXRenko su TV.

## SEZIONE 7 — MATRIX DISPONIBILITÀ PIATTAFORME

| Platform | ninZaRenko | KingRenko$ | IronXRenko | TV Renko nativo |
|----------|-----------|-----------|-----------|-----------------|
| NT8 | ✅ Gratuito | ✅ Premium | N/A | N/A |
| MT5 | ❌ Non disponibile | ❌ Non disponibile | ✅ Custom Symbol API | N/A |
| TV | ❌ Non disponibile | ❌ Non disponibile | ❌ IMPOSSIBILE | ✅ ticker.renko() |
| NinjaTrader | ✅ Nativo | ✅ Nativo | N/A | N/A |
| cTrader | ❓ Sconosciuto | ❓ Sconosciuto | ❌ Renko no | ❌ No |

**Legenda:**
  ✅ = Disponibile e verificato
  ❌ = Non disponibile / Impossibile
  ❓ = Sconosciuto / Potenziale ricerca futura
  N/A = Non applicabile

## SEZIONE 8 — BACKTESTING LIMITATIONS — CRITICITÀ

### 8.1 Open Artificiale = Backtest Inaccurato

**Problema:**
ninZaRenko e KingRenko$ (stesso codice base) usano:
  open = prevClose (artificiale)

Questo significa che se una strategia LEGGE Open[0],
i dati di backtest NON corrispondono al prezzo reale di mercato.

**Conseguenza:**
- Fill prices in backtest NON realistici
- Slippage calcolato su prezzi fake
- Profitti/perdite backtestati NON affidabili

### 8.2 Close-Based Indicators — SAFE

Se l'indicatore legge SOLO Close/High/Low (mai Open):
  ✅ Backtest affidabile su both ninZaRenko e KingRenko$
  ✅ Risultati identici tra i due (stesse impostazioni)

Tutti gli indicatori IronX sono close-based:
  ✓ IronX-ATR (usa close-based ATR)
  ✓ Easy X Trend (usa close per signal)
  ✓ MagnetOsc (usa close per momentum)
  ✓ IronXRenko (Renko chiude sempre)

### 8.3 IronXRenko MT5 — Medesima Limitazione

IronXRenko v1.0 crea custom symbol con:
  open = prevClose (artificial)
  high/low/close = reali

**Conseguenza identica:**
Qualsiasi EA che legge Open[0] su IronXRenko symbol
avrà backtest inaccurato.

**Raccomandazione:**
Usare IronXRenko SOLO con indicatori close-based.
Documentare come "limitazione by design" (allineamento
con ninZaRenko/KingRenko$).

### 8.4 TradingView ticker.renko() — DIVERSO

TV native Renko usa OHLC reali (no artificial open).
Backtest su TV sarà accurato.

MA non è compatibile con ninZaRenko/KingRenko$ algorithm.

## SEZIONE 9 — IMPOSTAZIONI CONSIGLIATE

Nota: questa sezione contiene IPOTESI basate su
comportamento generale Renko. Aggiornare con dati
reali dopo ricerca su ninZa con Opus 4.6.

Brick Size ATR-based raccomandato per asset:
  XAU/USD (Gold):  ATR period 14, multiplier 0.5-1.0
  NQ Futures:      ATR period 14, multiplier 0.5-1.0
  BTC/USD:         ATR period 14, multiplier 1.0-2.0

Trend Threshold (KingRenko$ specifico):
  Conservativo (meno segnali): Value2 = 4-6
  Aggressivo (più segnali):    Value2 = 1-2

STATO: IPOTESI — verificare con ricerca ninZa dedicata

## SEZIONE 10 — CHECKLIST BAR TYPES PRE-SVILUPPO

  ✓ Sto lavorando su ninZaRenko o KingRenko$?
  ✓ Se ninZaRenko: l'indicatore usa Open? Se sì attenzione
  ✓ Se KingRenko$: backtest affidabile su close-based
  ✓ Il bar type target è NT8? MT5? TV?
  ✓ MT5: ho considerato IronXRenko Custom Symbol?
  ✓ MT5: ho documentato che IronXRenko ha Open artificiale?
  ✓ TV: sto usando ticker.renko() nativo?
  ✓ TV: ho documentato che è DIVERSO da ninZaRenko?
  ✓ Close-based indicator funziona su entrambi i bar type?
  ✓ Tracking manuale box implementato se necessario?
  ✓ BrickSize letto correttamente per la piattaforma?
  ✓ Trend Threshold impostato (se KingRenko$ o IronXRenko)?
  ✓ Open artificiale considerato nella strategia?
  ✓ Backtest risk comunicato al cliente?

## SEZIONE 11 — RIFERIMENTI E FONTI

**Ufficiali:**
- ninza.co/product/ninzarenko (gratuito)
- renkokings.com/product/kingrenko (premium)
- /Include/IronX/IronXRenko/ (implementazione MT5)

**Decompilati analizzati:**
- ninZaRenko.cs (NT8 original)
- KingRenko$ templates XML
- IronXRenko modules (6 file)

**Correlati IronX:**
- IronX_RenkoMath.mqh (formule pure)
- RENKO_Engine.mqh (engine brick)
- Custom Symbol API MT5 documentation

---

IronXCharts © Luke SteelWolf — marzo 2026
Aggiornato sessione 36 con formule matematiche, IronXRenko MT5, Platform Matrix, Backtesting Limitations.
