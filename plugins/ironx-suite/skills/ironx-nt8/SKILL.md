---
description: NinjaTrader 8 deep dive per l'IronX Ecosystem. Attivare quando si sviluppa su NT8 NinjaScript C#. Contiene struttura indicatori e strategie, SharpDX rendering, WPF controls, Drawing Tools, gestione brush, Series e DataSeries, multi-timeframe, strategie semi-automatizzate, ordini e position management, e tutti i pattern critici NT8 verificati.
---

# IRONX NT8 — NINJASCRIPT C# DEEP DIVE

## REGOLA PIATTAFORMA
Questa skill si attiva SOLO per lavoro su NT8 NinjaScript C#.
Se il lavoro riguarda MT5 o TradingView, usare ironx-mql5
o ironx-pinescript.

## SEZIONE 1 — ARCHITETTURA INDICATOR

### 1.1 Stati del ciclo di vita

SetDefaults:
  Impostare Name, Description, Calculate, IsOverlay
  BarsRequiredToPlot, IsAutoScale, ScaleJustification
  MAI creare oggetti qui — solo valori primitivi

Configure:
  AddPlot() — UNICO posto dove aggiungere plot
  AddLine() — linee fisse
  AddDataSeries() — per multi-timeframe
  MAI creare brush o Series qui

DataLoaded:
  Creare Series<T> e DataSeries
  Creare e Freeze() tutti i brush
  Inizializzare variabili complesse
  UNICO posto corretto per new SolidColorBrush()

OnBarUpdate:
  Logica principale dell'indicatore
  SEMPRE prima: if (CurrentBar < BarsRequiredToPlot) return;
  SEMPRE: if (BarsInProgress != 0) return;
  MAI new() — MAI LINQ — MAI lock()

OnRender:
  Solo rendering SharpDX se necessario
  Usare flag dirty per evitare ridisegni inutili

OnTermination:
  Cleanup oggetti grafici
  RemoveDrawObjects() se necessario

### 1.2 Calculate modes

Calculate.OnBarClose:
  STANDARD IronX — usare sempre per indicatori
  Chiamato una volta per barra chiusa
  Garantisce anti-repaint

Calculate.OnPriceChange:
  Solo per indicatori tick-sensitive
  MAI usare per segnali di trading

Calculate.OnEachTick:
  Solo per strategie che richiedono tick precision
  Mai per indicatori standard

### 1.3 Plot e Values

Aggiungere plot in Configure:
  AddPlot(new Stroke(Brushes.Cyan, 2), PlotStyle.Line, "MA");
  AddPlot(new Stroke(Brushes.Orange, 1), PlotStyle.Dot, "Signal");

Scrivere valori in OnBarUpdate:
  Values[0][0] = maValue;
  Values[1][0] = signalValue;

Colore dinamico per plot:
  PlotBrushes[0][0] = isBull ? _bullBrush : _bearBrush;

PlotStyle disponibili:
  Line, Dot, Square, Hash, Cross, TriangleUp, TriangleDown
  Bar, Histogram, StepLine, PriceBox, BlockLine

## SEZIONE 2 — BRUSH E COLORI

### 2.1 Regole critiche brush

REGOLA 1: Freeze() è OBBLIGATORIO su ogni brush
  Senza Freeze() si ottiene eccezione cross-thread
  _brush = new SolidColorBrush(Color.FromArgb(255,0,180,216));
  _brush.Freeze();

REGOLA 2: Creare brush SOLO in DataLoaded
  Mai in OnBarUpdate, mai in OnRender

REGOLA 3: Cache — non ricreare ogni tick
  Dichiarare come variabile privata di classe
  Riusare la stessa istanza per tutta la vita dell'indicatore

REGOLA 4: Limite 65535 brush per chart
  Per colorazioni dinamiche usare un set limitato di brush
  Es: array di 8 brush predefiniti invece di creare nuovi

### 2.2 Creazione brush standard IronX

In classe (dichiarazione):
  private SolidColorBrush _bullBrush;
  private SolidColorBrush _bearBrush;
  private SolidColorBrush _signalBuyBrush;
  private SolidColorBrush _signalSellBrush;
  private SolidColorBrush _labelBrush;
  private SolidColorBrush _bgBrush;

In DataLoaded (inizializzazione):
  _bullBrush = new SolidColorBrush(
    Color.FromArgb(255, 0, 180, 216));
  _bullBrush.Freeze();

  _bearBrush = new SolidColorBrush(
    Color.FromArgb(255, 255, 0, 127));
  _bearBrush.Freeze();

  _signalBuyBrush = new SolidColorBrush(
    Color.FromArgb(255, 0, 255, 136));
  _signalBuyBrush.Freeze();

  _signalSellBrush = new SolidColorBrush(
    Color.FromArgb(255, 255, 68, 102));
  _signalSellBrush.Freeze();

  _labelBrush = new SolidColorBrush(
    Color.FromArgb(255, 255, 165, 0));
  _labelBrush.Freeze();

  _bgBrush = new SolidColorBrush(
    Color.FromArgb(38, 0, 180, 216));
  _bgBrush.Freeze();

## SEZIONE 3 — DRAWING TOOLS

### 3.1 Oggetti grafici principali

Frecce segnale:
  Draw.ArrowUp("IronX_EXT_MRK_" + CurrentBar,
    true, 0, Low[0] - TickSize * 3, _signalBuyBrush);

  Draw.ArrowDown("IronX_EXT_MRK_" + CurrentBar,
    true, 0, High[0] + TickSize * 3, _signalSellBrush);

Label testo:
  Draw.Text("IronX_EXT_LBL_" + CurrentBar,
    true, "SIGNAL", 0, High[0] + TickSize * 5,
    0, _labelBrush, new SimpleFont("Arial Bold", 9),
    TextAlignment.Center, Brushes.Transparent,
    Brushes.Transparent, 0);

Linea orizzontale:
  Draw.HorizontalLine("IronX_EXT_LIN_support",
    Close[0], _supportBrush);

Rettangolo zona:
  Draw.Rectangle("IronX_EXT_BOX_" + CurrentBar,
    true, 5, High[0], 0, Low[0],
    _outlineBrush, _fillBrush, true);

Background barra singola:
  BackBrushes[0] = isBull ? _bgBullBrush : _bgBearBrush;

Background barra globale (DA #103 — Background Painting):
  BackBrushAll[0] = trendBgBrush;  // colora TUTTA la barra (non solo corpo)

  NT8 supporta alpha REALE via brush:
  _bgBullBrush = new SolidColorBrush(
    Color.FromArgb(51, 50, 205, 50));   // LimeGreen, alpha=51 (opacity ~20%)
  _bgBullBrush.Freeze();

  DIFFERENZA DA MT5:
  NT8: BackBrushAll con alpha reale — NATIVO, zero workaround
  MT5: OBJ_RECTANGLE BACK + pre-blend manuale — workaround perché MQL5 NO alpha
  TV:  bgcolor() con color.new(c, transparency) — NATIVO

  Pattern NinZa confermato:
  NinZa usa BackBrushAll per background trend painting su NT8.
  Colori: LimeGreen (bullish) / HotPink (bearish) con Opacity ~20%.

Colorare candela:
  BarBrushes[0] = isBull ? _bullBrush : _bearBrush;
  CandleOutlineBrushes[0] = isBull
    ? _bullOutlineBrush : _bearOutlineBrush;

### 3.2 Regole Drawing Tools

Stessa tag sovrascrive oggetto esistente — usarla per aggiornare
IsAutoScale=true fa scalare il chart sull'oggetto
IsBackgroundDrawingTool=true manda l'oggetto sotto le candele
AutoScale=false per oggetti che non devono influire sulla scala

### 3.3 Font standard IronX

SimpleFont per testo su chart:
  new SimpleFont("Arial Bold", 9)   per label piccoli
  new SimpleFont("Arial Bold", 11)  per label medi
  new SimpleFont("Arial Bold", 14)  per label grandi

REGOLA: MAI Wingdings o Webdings per frecce e simboli
Usare SEMPRE "Arial Bold" con caratteri Unicode:
  ▲ = \u25B2   freccia su
  ▼ = \u25BC   freccia giù
  ● = \u25CF   cerchio pieno
  ★ = \u2605   stella

## SEZIONE 4 — SHARPDX RENDERING

### 4.1 Quando usare OnRender

Usare SharpDX solo quando Drawing Tools non bastano:
  Hatching e pattern diagonali su box
  Testo ruotato
  Forme geometriche complesse
  Animazioni fluide tick-by-tick
  Performance critica su grandi quantità di oggetti

### 4.2 Pattern OnRender base

protected override void OnRender(
  ChartControl chartControl,
  ChartScale chartScale) {

  base.OnRender(chartControl, chartScale);

  if (Bars == null || ChartControl == null) return;

  using (var brush = new
    SharpDX.Direct2D1.SolidColorBrush(
      RenderTarget,
      new SharpDX.Color4(0f, 0.706f, 0.847f, 1f))) {

    float x = chartControl.GetXByBarIndex(
      ChartBars, CurrentBar);
    float y = chartScale.GetYByValue(Close[0]);

    RenderTarget.DrawEllipse(
      new SharpDX.Direct2D1.Ellipse(
        new SharpDX.Vector2(x, y), 5f, 5f),
      brush, 2f);
  }
}

### 4.3 Coordinate SharpDX

Pixel X da indice barra:
  float x = chartControl.GetXByBarIndex(ChartBars, barIndex);

Pixel Y da valore prezzo:
  float y = chartScale.GetYByValue(priceValue);

Valore prezzo da pixel Y:
  double price = chartScale.GetValueByY((int)pixelY);

## SEZIONE 5 — SERIES E DATA MANAGEMENT

### 5.1 Series<T>

Dichiarazione:
  private Series<double> _myValues;
  private Series<bool> _mySignals;
  private Series<int> _myStates;

Inizializzazione in DataLoaded:
  _myValues = new Series<double>(this);
  _mySignals = new Series<bool>(this);

Uso in OnBarUpdate:
  _myValues[0] = calculatedValue;
  bool prevSignal = _mySignals[1];

### 5.2 Multi-Timeframe

In Configure aggiungere serie:
  AddDataSeries(BarsPeriodType.Minute, 60);

In OnBarUpdate filtrare:
  if (BarsInProgress == 0) {
    // logica barre primarie
  }
  if (BarsInProgress == 1) {
    // logica barre HTF
    _htfClose[0] = Close[0];
  }

Anti-repaint MTF:
  Usare sempre Calculate.OnBarClose
  Accedere ai valori HTF solo da BarsInProgress==0
  con indice [1] per avere barra HTF chiusa

## SEZIONE 6 — STRATEGIE SEMI-AUTOMATIZZATE

### 6.1 Struttura Strategy

public class MyStrategy : Strategy {

  protected override void OnStateChange() {
    if (State == State.SetDefaults) {
      Name = "MyStrategy";
      Calculate = Calculate.OnBarClose;
      IsExitOnSessionCloseStrategy = true;
      TraceOrders = true;
    }
  }

  protected override void OnBarUpdate() {
    if (CurrentBar < BarsRequiredToPlot) return;
    if (BarsInProgress != 0) return;
    // logica entrata e uscita
  }
}

### 6.2 Ordini base

Entrata:
  EnterLong(1, quantity, "Long_Signal");
  EnterShort(1, quantity, "Short_Signal");

Uscita:
  ExitLong("Exit_Long", "Long_Signal");
  ExitShort("Exit_Short", "Short_Signal");

Stop e target:
  SetStopLoss("Long_Signal",
    CalculationMode.Ticks, stopTicks, false);
  SetProfitTarget("Long_Signal",
    CalculationMode.Ticks, targetTicks);

Trailing stop:
  SetTrailStop("Long_Signal",
    CalculationMode.Ticks, trailTicks, false);

### 6.3 Position management

Posizione aperta:
  if (Position.MarketPosition == MarketPosition.Long) { }
  if (Position.MarketPosition == MarketPosition.Short) { }
  if (Position.MarketPosition == MarketPosition.Flat) { }

Valore posizione:
  Position.Quantity
  Position.AveragePrice
  Position.GetUnrealizedProfitLoss(
    PerformanceUnit.Currency, Close[0])

## SEZIONE 7 — COMUNICAZIONE INTER-INDICATORI

### 7.1 iCustom — leggere buffer di altro indicatore

double trendValue = Indicator(
  "ninZaEasyTrend", Period)(Close)[1][0];

Oppure accesso diretto ai valori:
  var ext = EasyXTrend(Close, 14);
  double trend = ext.Signal_Trend[0];

### 7.2 GlobalVariables — ComBus IronX (DA #109)

Formato: IronX.<PRODOTTO>.<Symbol>.<TF>.<Suffisso>

Scrivere:
  GlobalVariable.Set("IronX.EXT." + Instrument.FullName + "." +
    BarsPeriod.ToString() + ".Trend", trendValue);

Leggere da altro indicatore:
  string key = "IronX.EXT." + Instrument.FullName + "." +
    BarsPeriod.ToString() + ".Trend";
  if (GlobalVariable.Exists(key))
    double trend = GlobalVariable.Get(key);

MAI formato underscore (IronX_EXT_Trend) — SEMPRE dot notation.

### 7.3 EventChartCustom

Inviare evento:
  ChartControl.Dispatcher.InvokeAsync(() => {
    OnRenderTargetChanged();
  });

## SEZIONE 8 — ALERT NT8

Standard IronX per alert su segnale:
  if (IsFirstTickOfBar && crossSignal) {
    Alert("IronX_Signal_Long",
      Priority.High,
      "IronX Long Signal — " + Instrument.FullName,
      NinjaTrader.Core.Globals.InstallDir
        + @"\sounds\Alert1.wav",
      10, Brushes.Cyan, Brushes.Black);
  }

## SEZIONE 9 — PATTERN CRITICI NT8

### 9.1 Guard universale OnBarUpdate

protected override void OnBarUpdate() {
  if (CurrentBar < BarsRequiredToPlot) return;
  if (BarsInProgress != 0) return;
  if (State == State.Historical
    && IsFirstTickOfBar == false) return;
}

### 9.2 Cleanup OnTermination

protected override void OnTermination() {
  RemoveDrawObjects();
  if (_bullBrush != null) _bullBrush = null;
  if (_bearBrush != null) _bearBrush = null;
}

### 9.3 Prevenzione ghost objects

Usare sempre tag con CurrentBar per oggetti nuovi
Usare tag fissa per oggetti che si aggiornano
Non usare tag con timestamp — rischio duplicati su replay

### 9.4 Renko su NT8

CurrentBar non corrisponde al numero di box Renko
Per contare box usare tracking manuale:
  private int _renkoBoxCount = 0;
  if (Close[0] > Open[0]) _renkoBoxCount++;

BrickSize disponibile come:
  BarsPeriod.Value per Renko standard
  Per ninZaRenko leggere da parametri esposti

## SEZIONE 10 — CHECKLIST NT8 PRE-COMMIT

  Calculate = Calculate.OnBarClose impostato?
  BarsInProgress != 0 check presente?
  Tutti i brush creati in DataLoaded e Freeze()?
  MAI new() in OnBarUpdate?
  DrawObjects usano naming convention IronX?
  RemoveDrawObjects() in OnTermination?
  Multi-timeframe usa BarsInProgress filter?
  Alert usa IsFirstTickOfBar?
  Compilazione 0 errors 0 warnings?
  Testato su replay storico — zero repaint?
  Testato rimozione indicatore — zero ghost objects?

IronXCharts © Luke SteelWolf — marzo 2026