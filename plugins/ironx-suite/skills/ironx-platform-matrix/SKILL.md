---
description: Mappa COMPLETA di equivalenza cross-platform NT8 MT5 TradingView. Attivare SEMPRE quando si sviluppa o replica qualsiasi elemento su NinjaScript C#, MQL5 o PineScript v6. Contiene equivalenze sintassi, struttura codice, ciclo di vita, data access, indicatori built-in, direzione temporale barre, anti-repaint, alert, Renko, performance e matrice fattibilità completa. Consultare PRIMA di scrivere qualsiasi riga di codice cross-platform.
---

# IRONX PLATFORM MATRIX
# Mappa Definitiva — Equivalenza, Fattibilità e Coerenza Cross-Platform

## LEGGE FONDAMENTALE

NT8 è la piattaforma MADRE. MT5 e TradingView devono replicare
logica, grafica, comportamento e fluidità di NT8 — non "qualcosa
di simile", ma la replica più fedele possibile nei limiti
tecnologici di ogni piattaforma.

- Equivalente diretto esiste → usarlo
- Equivalente diretto non esiste → usare l'alternativa documentata qui
- Nemmeno l'alternativa esiste → documentare la limitazione
  e scegliere la soluzione più vicina

Non si improvvisa mai. Si consulta questa skill prima.

## SEZIONE 1 — ARCHITETTURA DEI LINGUAGGI

### 1.1 Identità e Caratteristiche

| Aspetto | NT8 NinjaScript | MT5 MQL5 | TV PineScript v6 |
|---|---|---|---|
| Base | C# .NET 4.8 OOP completo | C-like con OOP parziale | Funzionale proprietario |
| Paradigma | Imperativo + OOP + Event-driven | Imperativo + OOP parziale | Funzionale + Serie temporali |
| Compilazione | JIT (.dll) | Ahead-of-time (.ex5) | Interpretato server-side |
| Esecuzione | Multi-thread local desktop | Single-thread per chart | Single-thread sandboxed cloud |
| IDE | NinjaScript Editor VS-like | MetaEditor built-in | Pine Editor browser |
| Filesystem | Pieno accesso C# | Solo /Files MT5 | Nessuno |
| Network | WebClient HttpClient | WebRequest() | Nessuno |
| Threading | Task async/await | Single-thread | Single-thread |
| Trading live | Pieno | Pieno | Solo via bridge esterno |
| Automazione | Strategy class | Expert Advisor | Solo alertcondition |
| Performance | 5/5 | 4/5 | 2/5 |

### 1.2 Performance Comparata

| Scenario | NT8 | MT5 | TV |
|---|---|---|---|
| Calcolo MA su 10k barre | ~1ms | ~2ms | ~50ms |
| 1000 oggetti grafici | Fluido | Rallenta | Lento capped |
| MTF 5 timeframes | Parallelo | Seriale | Lento repaint risk |
| Tick-by-tick update | Pieno | Pieno | Limitato |
| Renko custom | Nativo | Functional via Custom Symbol | Parziale |

## SEZIONE 2 — STRUTTURA CODICE E CICLO DI VITA

### 2.1 Direzione Temporale Barre — FONTE NUMERO 1 DI BUG

NT8:
  Close[0]     = barra CORRENTE (più recente)
  Close[n]     = n barre fa
  CurrentBar   = 0 sulla prima barra storica, cresce

MT5 con ArraySetAsSeries=false (DEFAULT IronX):
  close[0]              = barra PIU VECCHIA — OPPOSTO a NT8
  close[rates_total-1]  = barra più recente
  CONVERSIONE: close[rates_total-1-n] equivale a Close[n] di NT8
  REGOLA IRONX: usare SEMPRE ArraySetAsSeries=false nei buffer

TV:
  close    = barra CORRENTE (uguale a NT8)
  close[n] = n barre fa (uguale a NT8)
  bar_index = 0 sulla prima storica, cresce

### 2.2 Ciclo di Vita

NT8:
  SetDefaults → Configure → DataLoaded → Historical loop
  → Realtime → OnTermination

MT5:
  OnInit → Historical OnCalculate loop
  → Realtime OnCalculate → OnDeinit

TV:
  Full recalculation barra 0
  → barstate.isrealtime su ultima barra aperta

### 2.3 Template Struttura File

NT8 — NinjaScript Indicator:

  namespace NinjaTrader.NinjaScript.Indicators {
    public class MyIndicator : Indicator {

      private SolidColorBrush _bullBrush, _bearBrush;

      protected override void OnStateChange() {
        if (State == State.SetDefaults) {
          Name = "MyIndicator";
          Calculate = Calculate.OnBarClose;
          IsOverlay = true;
          BarsRequiredToPlot = 14;
        }
        if (State == State.Configure) {
          AddPlot(Brushes.Cyan, "Signal");
        }
        if (State == State.DataLoaded) {
          _bullBrush = new SolidColorBrush(
            Color.FromArgb(255, 0, 180, 216));
          _bullBrush.Freeze();
          _bearBrush = new SolidColorBrush(
            Color.FromArgb(255, 255, 0, 127));
          _bearBrush.Freeze();
        }
      }

      protected override void OnBarUpdate() {
        if (CurrentBar < BarsRequiredToPlot) return;
        if (BarsInProgress != 0) return;
        Values[0][0] = SMA(Close, 14)[0];
      }
    }
  }

MT5 — MQL5 Indicator:

  #property indicator_plots   1
  #property indicator_type1   DRAW_LINE
  #property indicator_color1  clrCyan

  double Buffer1[];

  int OnInit() {
    SetIndexBuffer(0, Buffer1, INDICATOR_DATA);
    ArraySetAsSeries(Buffer1, false);
    return INIT_SUCCEEDED;
  }

  void OnDeinit(const int reason) {
    ObjectsDeleteAll(0, "IronX_");
    Comment("");
  }

  int OnCalculate(const int rates_total,
                  const int prev_calculated,
                  const datetime &time[],
                  const double &open[],
                  const double &high[],
                  const double &low[],
                  const double &close[],
                  const long &tick_volume[],
                  const long &volume[],
                  const int &spread[]) {
    int start = (prev_calculated > 0)
                ? prev_calculated - 1 : 14;
    for(int i = start; i < rates_total; i++) {
      bool isClosedBar = (i < rates_total - 1);
      Buffer1[i] = 0;
    }
    return rates_total;
  }

TV — PineScript v6 Indicator:

  //@version=6
  indicator("MyIndicator", overlay=true,
    max_lines_count=500,
    max_labels_count=500,
    max_boxes_count=500)

  int period = input.int(14, "Period", minval=1)
  float maValue = ta.sma(close, period)
  plot(maValue, "Signal", color.cyan, 2)

  if barstate.isconfirmed
      label.new(bar_index, high, "Signal",
        color=color.cyan)

## SEZIONE 3 — DATA ACCESS

### 3.1 Accesso OHLCV

| Dato | NT8 | MT5 | TV |
|---|---|---|---|
| Open | Open[0] | open[rates_total-1] | open |
| High | High[0] | high[rates_total-1] | high |
| Low | Low[0] | low[rates_total-1] | low |
| Close | Close[0] | close[rates_total-1] | close |
| Volume | Volume[0] | tick_volume[rates_total-1] | volume |
| N barre fa | Close[n] | close[rates_total-1-n] | close[n] |
| Tick size | TickSize | _Point | syminfo.mintick |
| Simbolo | Instrument.MasterInstrument.Name | Symbol() | syminfo.ticker |
| Timeframe | BarsPeriod.BarsPeriodType | Period() | timeframe.period |

### 3.2 Stato Barra

| Stato | NT8 | MT5 | TV |
|---|---|---|---|
| Barra APERTA | IsFirstTickOfBar == false | i == rates_total-1 | not barstate.isconfirmed |
| Barra CHIUSA | IsFirstTickOfBar == true | i < rates_total-1 | barstate.isconfirmed |
| Prima realtime | State == State.Realtime | prev_calculated == rates_total-1 | barstate.isnew |
| Ultima barra | CurrentBar == Count-1 | i == rates_total-1 | barstate.islast |

### 3.3 Multi-Timeframe

| Feature | NT8 | MT5 | TV |
|---|---|---|---|
| Aggiungere TF | AddDataSeries in Configure | iMA(NULL, PERIOD_H1) | request.security(ticker,"60",close) |
| Anti-repaint MTF | Calculate.OnBarClose | i < rates_total-1 | barmerge.lookahead_off + [1] |
| Regola IronX MT5 | — | Cachare valori MTF in array locali | — |
| Regola IronX TV | — | — | lookahead=barmerge.lookahead_off SEMPRE |

## SEZIONE 4 — INDICATORI BUILT-IN

### 4.1 Moving Averages

| MA | NT8 | MT5 | TV | Formula |
|---|---|---|---|---|
| SMA (0) | SMA(Close,p)[0] | iMA(NULL,0,p,0,MODE_SMA,PRICE_CLOSE,0) | ta.sma(close,p) | sum(price,N)/N |
| EMA (1) | EMA(Close,p)[0] | iMA(NULL,0,p,0,MODE_EMA,PRICE_CLOSE,0) | ta.ema(close,p) | prev+a*(price-prev), a=2/(N+1) |
| SMMA (2) | SMMA(Close,p)[0] | iMA(NULL,0,p,0,MODE_SMMA,PRICE_CLOSE,0) | (smma[1]*(p-1)+close)/p | (prev*(N-1)+price)/N |
| LWMA (3) | LWMA(Close,p)[0] | iMA(NULL,0,p,0,MODE_LWMA,PRICE_CLOSE,0) | ta.wma(close,p) | sum(price_i*w_i)/sum(w_i) |
| DEMA (4) | DEMA(Close,p)[0] | 2*EMA1-EMA(EMA1) | 2*ta.ema(c,p)-ta.ema(ta.ema(c,p),p) | 2*EMA-EMA(EMA) |
| TEMA (5) | TEMA(Close,p)[0] | 3*(e1-e2)+e3 | formula manuale | 3*E1-3*E2+E3 |
| HMA (6) | HMA(Close,p)[0] | WMA(2*WMA(p/2)-WMA(p),sqrt(p)) | formula manuale | WMA(2*WMA(N/2)-WMA(N),sqrt(N)) |
| T3 (7) | T3(Close,p)[0] | GD^3, VFactor=0.7 | formula manuale | Molto smooth, lag minimo |
| KAMA (8) | KAMA(Close,p)[0] | a adattivo da ER | formula manuale | Fast=2,Slow=30, a modulato da efficienza |
| VIDYA (9) | VIDYA(Close,p)[0] | a modulato da CMO | formula manuale | CMO=9 |
| WMA (10) | WMA(Close,p)[0] | Wilder smoothing | formula manuale | Wilder smoothing |
| ZLEMA (11) | Custom | EMA(2*P-P[lag],N), lag=(N-1)/2 | formula manuale | Per Gold, riduce lag |
| ALMA (12) | Custom | Gaussian, offset=0.85, sigma=6 | formula manuale | Per indici, Gaussian |
| LSMA (13) | Custom | iLinReg(NULL,0,p,0,PRICE_CLOSE,0) | ta.linreg(close,p,0) | Linear regression endpoint |
| VWMA (14) | VWMA(Close,Vol,p)[0] | Sum(c*v,p)/Sum(v,p) | ta.vwma(close,p) | sum(P*V)/sum(V), fallback SMA se vol=0 |
| REMA (15) | Custom | ricorsiva con Lambda=0.5 | formula manuale | Recursive con Lambda=0.5, buffer-based, REQUIRES i>=2 guard |
| TMA (16) | Custom | SMA(SMA(P,ceil(N/2)),floor(N/2)+1) | formula manuale | Triangular MA, NinZa native, doppia smoothing |

**TOTALE: 17 MA types in IronX** (vs 11 in NinZa)
**IronX Extra 6:** ALMA, LSMA, REMA, TMA, T3, KAMA, VIDYA

**NOTA CRITICA:**
- REMA: requires recursion guard `if(i>=2)` — buffer-based implementation
- TMA: floor/ceil operations, double SMA application — NinZa native
- Tutte le 17 MA sono implement in IronX_MathLib.mqh (Core Library)

### 4.2 Oscillatori

| Indicatore | NT8 | MT5 | TV |
|---|---|---|---|
| ATR | ATR(p)[0] | iATR(NULL,0,p,0) | ta.atr(p) |
| RSI | RSI(Close,p)[0] | iRSI(NULL,0,p,PRICE_CLOSE,0) | ta.rsi(close,p) |
| MACD | MACD(Close,12,26,9).Diff[0] | iMACD(...,MODE_MAIN,0) | [m,s,h]=ta.macd(c,12,26,9) |
| Bollinger | Bollinger(Close,20,2).Upper[0] | iBands(...,MODE_UPPER,0) | [m,u,l]=ta.bb(c,20,2) |
| Highest | MAX(High,p)[0] | iHighest(NULL,0,MODE_HIGH,p,0) | ta.highest(high,p) |
| Lowest | MIN(Low,p)[0] | iLowest(NULL,0,MODE_LOW,p,0) | ta.lowest(low,p) |

### 4.3 Funzioni Matematiche

| Funzione | NT8 | MT5 | TV |
|---|---|---|---|
| Max(a,b) | Math.Max(a,b) | MathMax(a,b) | math.max(a,b) |
| Abs | Math.Abs(x) | MathAbs(x) | math.abs(x) |
| Sqrt | Math.Sqrt(x) | MathSqrt(x) | math.sqrt(x) |
| Round | Math.Round(x,d) | NormalizeDouble(x,d) | math.round(x) |
| Crossover | CrossAbove(s1,s2,1) | s1[0]>s2[0] and s1[1]<=s2[1] | ta.crossover(s1,s2) |
| Crossunder | CrossBelow(s1,s2,1) | s1[0]<s2[0] and s1[1]>=s2[1] | ta.crossunder(s1,s2) |

## SEZIONE 5 — OGGETTI GRAFICI

### 5.1 Bar Painting

| Feature | NT8 | MT5 | TV |
|---|---|---|---|
| Colorare barra | BarBrushes[0] = brush | DRAW_COLOR_CANDLES + color index | barcolor(color) |
| Colorare bordo separato | CandleOutlineBrushes[0] = brush | IMPOSSIBILE con DRAW_COLOR_CANDLES | plotcandle(bordercolor=c) |
| Hollow (corpo trasparente) | BarBrush = Brushes.Transparent | IMPOSSIBILE — simulare con DimColor() | plotcandle(color=color.new(c,70)) |
| Nascondere barra | BarBrushes[0] = Brushes.Transparent | DRAW_NONE su Plot candle | barcolor(na) |
| Per-bar color | BarBrushes[idx] (array per-bar) | Color index buffer (INDICATOR_COLOR_INDEX) | series color argument |
| LIMITE NT8 | Max 65535 brush — Freeze() obbligatorio | — | — |
| LIMITE MT5 | — | Ogni color index = body+wick intero, NO outline separato | — |
| LIMITE TV | — | — | barcolor() colora chart, plotcandle() colora plot separato |

HOLLOW/SOLID CROSS-PLATFORM:
  NT8: CandleOutlineBrush=trendColor + BarBrush=Transparent (hollow reale)
  MT5: DRAW_COLOR_CANDLES + DimColor() blend 50% DimGray (hollow simulato, DA #99-101)
  TV:  plotcandle(color=color.new(trendColor,70), bordercolor=trendColor) (hollow reale)

### 5.2 Linee

| Feature | NT8 | MT5 | TV |
|---|---|---|---|
| Orizzontale | Draw.HorizontalLine | ObjectCreate OBJ_HLINE | hline(price) |
| Trend 2 punti | Draw.Line | ObjectCreate OBJ_TREND | line.new(x1,y1,x2,y2) |
| Step line | PlotStyle.StepLine | DRAW_SECTION | plot.style_stepline |
| Tratteggiata | DashStyleHelper.Dash | STYLE_DASH | line.style_dashed |
| LIMITE TV | — | — | Max 500 linee |
| LIMITE MT5 | — | ObjectsDeleteAll in OnDeinit OBBLIGATORIA | — |

### 5.3 Box e Rettangoli

| Feature | NT8 | MT5 | TV |
|---|---|---|---|
| Rettangolo | Draw.Rectangle | ObjectCreate OBJ_RECTANGLE | box.new(l,t,r,b) |
| Fill trasparente | Color.FromArgb(alpha,R,G,B) | CCanvas obbligatoria | color.new(c,transp) |
| Estendi dinamicamente | Stessa tag sovrascrive | ObjectMove | box.set_right(id,bar_index) |
| CRITICO MT5 | — | OBJ_RECTANGLE no alpha — usare CCanvas + OBJ_BITMAP_LABEL | — |
| LIMITE TV | — | — | Max 500 box |

### 5.4 Marker e Frecce

| Feature | NT8 | MT5 | TV |
|---|---|---|---|
| Freccia su | Draw.ArrowUp | DRAW_ARROW codice 241 | plotshape shape.arrowup |
| Freccia giù | Draw.ArrowDown | DRAW_ARROW codice 242 | plotshape shape.arrowdown |
| Triangolo su | Draw.TriangleUp | ShortToString(0x25B2) Arial Bold | plotshape shape.triangleup |
| Triangolo giù | Draw.TriangleDown | ShortToString(0x25BC) Arial Bold | plotshape shape.triangledown |
| REGOLA NT8 | SEMPRE Arial Bold per frecce MAI Wingdings | — | — |
| REGOLA MT5 | — | font Arial Bold codici 0x25B2 e 0x25BC | — |

### 5.5 Label e Testo

| Feature | NT8 | MT5 | TV |
|---|---|---|---|
| Testo su barra | Draw.Text | ObjectCreate OBJ_TEXT | label.new(bar_index,high,"testo") |
| Font bold | "Arial Bold" | ObjectSetString OBJPROP_FONT "Arial Bold" | text_formatting=text.format_bold |
| Rotazione | SharpDX transform | OBJPROP_ANGLE | IMPOSSIBILE in TV |
| LIMITE TV | — | — | Max 500 label — nessuna rotazione |

### 5.6 Dashboard e Panel

| Feature | NT8 | MT5 | TV |
|---|---|---|---|
| Panel fisso | OnRender SharpDX + WPF | OBJ_RECTANGLE_LABEL + OBJ_LABEL | table.new(position,cols,rows) |
| Bottone interattivo | WPF Button + click | OBJ_BUTTON + OnChartEvent | IMPOSSIBILE |
| LIMITE TV | — | — | Usare input.bool() per simulare controlli |

## SEZIONE 6 — ALERT SYSTEM

| Tipo | NT8 | MT5 | TV |
|---|---|---|---|
| Popup | Alert("msg",Priority.High) | Alert("msg") | alertcondition(cond,"title","msg") |
| Suono | PlaySound("file.wav") | PlaySound("sound.wav") | Built-in client |
| Email | Alert SMTP | SendMail("subj","body") | Via webhook |
| Push mobile | Custom/email | SendNotification("msg") | App TV |

Regola universale alert IronX:
  NT8: Calculate.OnBarClose + if(IsFirstTickOfBar) Alert(...)
  MT5: if(i == rates_total-2) Alert(...)
  TV:  alertcondition(cond and barstate.isconfirmed, ...)

## SEZIONE 7 — Z-ORDER E RENDERING

NT8 dal basso all'alto:
  [0] BackBrush e BackBrushes
  [1] Grid lines
  [2] Drawing Tools con IsBackgroundDrawingTool=true
  [3] Candele e Barre
  [4] Plot lines AddPlot
  [5] Drawing Tools standard
  [6] OnRender SharpDX

MT5:
  [0] OBJPROP_BACK=true sotto candele
  [1] Candele
  [2] OBJPROP_BACK=false sopra
  [3] OBJPROP_ZORDER higher più in foreground

TV:
  [0] bgcolor() sotto candele
  [1] Candele
  [2] plot() line box label sopra

### 7.1 Background Painting Cross-Platform (DA #103-108)

NT8: BackBrushAll = WPF Brush con alpha nativo
  ninZa_BrushManager.CreateOpacityBrush(color, opacity)
  Opacity range 0-100, alpha = opacity * 255 / 100
  Z-order: livello [0] DIETRO candele

MT5: OBJ_RECTANGLE BACK + pre-blend con sfondo chart
  Alpha NON supportata su OBJ_RECTANGLE ne su plot colors
  Soluzione: BlendColor(fg, ChartGetInteger(CHART_COLOR_BACKGROUND), opacity)
  Z-order: OBJPROP_BACK=true = livello [0] DIETRO candele
  Segment-based: 1 rettangolo per trend continuo (~10-30 per 500 barre)

TV: bgcolor(color.new(c, transp))
  Alpha nativa via color.new(color, transparency)
  Transparency 0=opaco, 100=trasparente (invertito vs NT8!)
  Z-order: livello [0] DIETRO candele

Colori standard NinZa ecosystem:
  Bullish: LimeGreen (#32CD32) — 3 fonti indipendenti
  Bearish: HotPink (#FF69B4) — 3 fonti indipendenti
  Opacity default: ET=20, SW=10, FM=20, Captain=30

## SEZIONE 8 — NAMING E LIFECYCLE OGGETTI

Naming Convention IronX:
  FORMATO: IronX_[PRODOTTO]_[TIPO]_[ID]

  PRODOTTI: EXT=EasyXTrend  ATS=ATRShield  STA=Statistics  CPT=Captain
  TIPI: LBL=Label  BOX=Box  LIN=Line  MRK=Marker  PNL=Panel
        ICE=Iceberg  FRC=Fractal  SES=Session  BG=Background

  NT8: "IronX_EXT_MRK_" + CurrentBar.ToString()
  MT5: "IronX_EXT_ICE_" + IntegerToString(time[i])
  TV:  non necessario — oggetti identificati da variabile ID

Lifecycle:
  NT8: stessa tag sovrascrive — cleanup in OnTermination
  MT5: ObjectMove per aggiornare MAI ricreare — ObjectsDeleteAll in OnDeinit OBBLIGATORIA
  TV:  var id = na — line.delete(id) prima di ricreare — ESPLICITA

## SEZIONE 9 — BUFFER OUTPUT E ANTI-REPAINT

Buffer Layout — PRODOTTO-SPECIFICO:
  NON esiste un layout universale [0-5]. Ogni prodotto ha il suo.
  EXT v2.0:  18 buffer (0=MA, 1=Color, 2-5=OHLC, 6=BarColor, 7=Buy, 8=Sell,
             9=SignalTrade, 10=BG, 11=BGColor, 12=Trend, 13-17=Calc)
  ATRS v10.0: 14 buffer (0=RawATR, 1=SmoothATR, 2-4=SL, 5-7=TP, 8-13=Hit)
  MAOSC v1.0: 15 buffer (6=Signal, 7=HTF_Osc, 13=DynOB, 14=DynOS)
  NC v1.0:    10 buffer (0=Baseline, 2=Kernel, 3-4=Cloud, 6-8=Signals)
  Riferimento completo: CLAUDE.md "Buffer Reference"

Anti-Repaint Regole Definitive:

  NT8:
    SEMPRE Calculate = Calculate.OnBarClose
    SEMPRE if (CurrentBar < BarsRequiredToPlot) return
    MAI Close[0] su OnPriceChange per segnali

  MT5:
    SEMPRE if(i < rates_total-1) per segnale definitivo
    SEMPRE prev_calculated per ricalcolare solo barre nuove
    MAI scrivere su buffer[rates_total-1] per segnali

  TV:
    SEMPRE barstate.isconfirmed per segnali
    SEMPRE lookahead=barmerge.lookahead_off
    MAI security() con lookahead_on

## SEZIONE 10 — RENKO E BAR TYPES

### 10.1 Renko Supporto Cross-Platform

| Feature | NT8 | MT5 | TV |
|---|---|---|---|
| Renko nativo | ninZaRenko nativo | IronXRenko v1.0 via Custom Symbol API | chart.is_renko parziale |
| KingRenko$ | Backtestabile — Open reale | Non applicabile | Non applicabile |
| Box size | ATR fixed custom | Simulato con tick | Via syminfo.mintick |
| Renko gapless | ninZaRenko mode | IronXRenko implementato | No |
| Shadow Renko | ninZaRenko mode | IronXRenko opzionale | No |
| CRITICO NT8 | CurrentBar non uguale numero box — usare tracking dedicato | — | — |

### 10.2 IronXRenko MT5 Implementation

**IronXRenko v1.0 è FUNZIONALE su MT5 via Custom Symbol API:**
- `CustomSymbolCreate()` — crea simbolo custom con Renko bricks
- `CustomRatesUpdate()` — aggiorna OHLC storia
- `CustomTicksAdd()` — aggiunge tick realtime
- Pattern identico a NT8 + KingRenko$

**Limitazione:** NON nativo come ninZaRenko, ma FUNZIONALE 100%

ninZaRenko vs KingRenko$:
  ninZaRenko — Open artificiale per armonia visiva — NON backtestabile
  KingRenko$ — OHLC reale — backtestabile — stessi Close di ninZaRenko
  Stesse impostazioni: Trend Threshold e Brick Size
  Qualsiasi indicatore su Close funziona identico su entrambi

### 10.3 NT8 AddDataSeries Renko Pattern

```csharp
// In Configure():
AddDataSeries(new ninZaRenko(
    input: Closes[0],
    TrendThreshold: 10.0,
    BrickSize: ATR(14)[0] * 2.0,
    RenkoMode: NinZaRenkoMode.CloseOnly
));

// In OnBarUpdate():
if (BarsInProgress == 1)  // Renko secondary series
{
    if (Close[0] > Open[0])
        Draw.DotUp("RenkoUp_" + CurrentBar, IsAutoScale, 0, Low[0] - TickSize, Brushes.Cyan);
}
```

## SEZIONE 11 — TradingView Porting — Patterns & Limitations

### 11.1 input.source() Pattern

**Soluzione TV per inter-indicatore data flow:**

TV NON ha `iCustom()` o `CopyBuffer()`. Alternativa è **input.source()**:
- User manually connects uno plot di indicatore A come source per indicatore B
- Script riceve il valore già calcolato
- Equivalente a `iCustom()` ma manuale (non automatico)

**Esempio:**
```pinescript
// Easy X Trend Indicator su TV
maLine = ta.ema(close, 14)
plot(maLine, "EMA14", color=color.cyan)

// ATR TradeShield Indicator su TV
import ... as ext
externalMA = input.source(close, "Source")  // User can select EMA14 plot
atr = ta.atr(14)
// Use externalMA instead of reading EXT buffer
```

**Processo di collegamento:**
1. User apre ATR TradeShield su TV
2. Input → Source dropdown
3. Seleziona "Easy X Trend - EMA14"
4. ATR TradeShield riceve il valore del plot

**NOTA CRITICA:** User MUST link manualmente — nessuna auto-detection come in MT5

### 11.2 Matrice Fattibilità TradingView Porting

| Prodotto IronX | TV Fattibilità | Blocco Principale | Soluzione |
|---|---|---|---|
| Easy X Trend | ✅ ALTA | Nessuno | Monolithic script, plot([lineValue, signalTrade, trendColor]) |
| MagnetOsc | ✅ ALTA | MTF limit | request.security() (40 max per script), anti-repaint con lookahead_off |
| IronX-ATR | ✅ ALTA | Nessuno | Semplice wrapper, plot ATR con colore dinamico |
| ATR TradeShield | ⚠️ MEDIA | No iCustom | input.source() per ricevere EXT MA da user manual link, plot TP/SL |
| MA-Slope | ✅ ALTA | Nessuno | ZuperView NON ha portato MA-Slope → IronX first-mover opportunity su TV |
| Solar Wave | ✅ ALTA | Nessuno | ZuperView reference — già portato, use pattern |
| IronXRenko | ❌ IMPOSSIBILE | No Custom Symbol | TV Renko nativo only — chart.is_renko(), ticker.renko(), non custom |
| Captain IronX | ⚠️ BASSA | No inter-indicator auto | Mega-script necessario, raccogliere tutte 3 source (EXT, MAOSC, ATRS) in input |

### 11.3 ZuperView Reference

**SCOPERTA CRITICA:** ZuperView (zuperview.com) = sister brand NinZa su TradingView

**Status porting NinZa → ZuperView:**
- Easy Trend: ✅ Già portato (100% replica)
- MagnetOsc: ✅ Già portato (100% replica)
- ATR TradeShield: ⏳ Candidato
- altri: da valutare

**Consultare ZuperView come reference quando si porta Easy Trend / MagnetOsc su TV.**
Architettura input.source() è IDENTICA, pattern validation confermato.

## SEZIONE 12 — MATRICE FATTIBILITA FEATURE

Legenda: PIENO / QUASI / PARZIALE / WORKAROUND / IMPOSSIBILE

| Feature | NT8 | MT5 | TV | Note workaround |
|---|---|---|---|---|
| Bar painting corpo | PIENO | PIENO | PIENO | — |
| Bar painting wick separato | PIENO | IMPOSSIBILE | PIENO | MT5: DRAW_COLOR_CANDLES no outline sep. TV: plotcandle bordercolor |
| Bar painting hollow/solid | PIENO | WORKAROUND | PIENO | MT5: DimColor() dimmed, NT8: Transparent, TV: color.new(c,70) |
| Background zona price | PIENO | PARZIALE | PIENO | MT5: OBJ_RECTANGLE back |
| Step lines | PIENO | QUASI | PIENO | — |
| Linee tratteggiate plot | PIENO | PIENO | WORKAROUND | TV: line.new ogni N barre |
| Label sfondo custom | PIENO | PIENO | QUASI | TV: stili predefiniti |
| Rotazione testo | PIENO | PIENO | IMPOSSIBILE | — |
| Box fill trasparente | PIENO | WORKAROUND | PIENO | MT5: CCanvas |
| Box hatching diagonale | PIENO | WORKAROUND | WORKAROUND | CCanvas e linee multiple |
| Panel interattivo | PIENO | PIENO | IMPOSSIBILE | TV: input.bool() |
| Bottoni click | PIENO | PIENO | IMPOSSIBILE | — |
| MA Engine 17 tipi | PIENO | PIENO | PARZIALE | TV: DEMA TEMA ZLEMA ALMA LSMA REMA TMA mancano — solo built-in 8 |
| Multi-timeframe | PIENO | PIENO | PARZIALE | TV: repaint risk, max 40 request.security() |
| ComBus inter-indicatori | PIENO | PIENO | IMPOSSIBILE | TV: use input.source() manual link. Formato: IronX.<Prod>.<Sym>.<TF>.<Key> (DA #109) |
| Trading automatico | PIENO | PIENO | IMPOSSIBILE | TV: solo alerts + webhook |
| Renko custom | PIENO | PIENO (IronXRenko) | IMPOSSIBILE (custom) | TV: only native Renko chart type |

## SEZIONE 13 — PALETTE COLORI E TRASPARENZE

Colori Standard IronX:
  BULLISH_PRIMARY   #00B4D8   R=0   G=180 B=216   Barre bull frecce up
  BEARISH_PRIMARY   #FF007F   R=255 G=0   B=127   Barre bear frecce down
  SIGNAL_BUY        #00FF88   R=0   G=255 B=136   Segnale Long confermato
  SIGNAL_SELL       #FF4466   R=255 G=68  B=102   Segnale Short confermato
  SIGNAL_LABEL      #FFA500   R=255 G=165 B=0     Labels testo segnali
  SUPPORT_LINE      #0066FF   R=0   G=102 B=255   Linee zone supporto
  RESISTANCE_LINE   #FF69B4   R=255 G=105 B=180   Linee zone resistenza
  ICE_BOX           #00BFFF   R=0   G=191 B=255   Iceberg boxes
  RETURN_CIRCLE     #00CED1   R=0   G=206 B=209   Fibonacci return levels
  FRACTAL_BULL      #00FFAA   R=0   G=255 B=170   Fractal dots bullish
  FRACTAL_BEAR      #FF4466   R=255 G=68  B=102   Fractal dots bearish
  BACKGROUND_DARK   #0A0A0F   R=10  G=10  B=15    Sfondo chart
  PANEL_BG          #111120   R=17  G=17  B=32    Panel background
  NEUTRAL_GRAY      #888899   R=136 G=136 B=153   Elementi neutri

4 Gruppi Colore IronX (DA #113):
  PLOT bullish:   DodgerBlue (#1E90FF) — bearish: Crimson (#DC143C)
  BAR bullish:    DodgerBlue (#1E90FF) — bearish: DeepPink (#FF1493)
  BG bullish:     LimeGreen (#32CD32)  — bearish: HotPink (#FF69B4)
  MARKER bullish: DodgerBlue (#1E90FF) — bearish: HotPink (#FF69B4)
  I 3 livelli bearish diversi sono INTENZIONALI (design NinZa verificato).

Conversione per Piattaforma:
  NT8:  Color.FromArgb(alpha, R, G, B)
        alpha: 255=opaco  0=trasparente
        Es: Color.FromArgb(255, 0, 180, 216)

  MT5:  C'RRGGBB'
        Es: C'00B4D8'
        Trasparenza REALE solo via CCanvas
        ATTENZIONE: oggetti standard MT5 NON supportano alpha

  TV:   color.new(color, transparency)
        transparency: 0=opaco  100=invisibile — OPPOSTO a NT8
        Es: color.new(color.rgb(0,180,216), 85)

Trasparenze Standard:
  Zone background:    NT8 alpha=38   MT5 alpha=38   TV transp=85
  Iceberg box fill:   NT8 alpha=76   MT5 alpha=76   TV transp=70
  Session background: NT8 alpha=25   MT5 alpha=25   TV transp=90
  Panel background:   NT8 alpha=51   MT5 alpha=51   TV transp=80
  Signal highlight:   NT8 alpha=153  MT5 alpha=153  TV transp=40

## SEZIONE 14 — PERFORMANCE E OTTIMIZZAZIONE

NT8:
  Brush.Freeze() su OGNI brush — obbligatorio
  Cache brush in variabili — non ricreare ogni tick
  MAI LINQ in OnBarUpdate()
  MAI new() in OnBarUpdate()

MT5:
  Cache iCustom/iMA in array locali
  prev_calculated per ricalcolare solo barre nuove
  Riutilizzare oggetti con ObjectMove e SetString
  MAI ObjectCreate/ObjectDelete ogni bar

TV:
  var per stati persistenti
  Max 40 request.security() per script
  Eliminare oggetti vecchi esplicitamente
  Preferire plot() su label.new() dove possibile

Target performance IronX:
  OnBarUpdate NT8: meno di 5ms su 1000 barre
  OnRender NT8: meno di 2ms
  Oggetti per indicatore: max 200

## SEZIONE 15 — CHECKLIST PRE-SVILUPPO

  Ho verificato la direzione temporale barre (Sezione 2.1)?
  Ho controllato la matrice fattibilità (Sezione 12)?
  L'equivalente esiste nativamente o serve workaround?
  Ho gestito anti-repaint (Sezione 9)?
  Ho convertito correttamente i colori (Sezione 13)?
  Ho applicato la naming convention (Sezione 8)?
  Rispettati i limiti: NT8 65535 brush / MT5 1000 obj / TV 500?
  Aggiunto OnDeinit e ObjectsDeleteAll per MT5?
  Testato su storico E su barra realtime?
  Zero ghost objects dopo rimozione indicatore?
  Zero repaint su replay storico?
  Consultato ZuperView per TV patterns (Sezione 11.3)?
  input.source() linked per inter-indicator data se TV (Sezione 11.1)?
  MA selection coerente: 17 tipi IronX vs 8 built-in TV (Sezione 4.1)?

## SEZIONE 15 — COMBUS EQUIVALENZE CROSS-PLATFORM (DA #109-112)

### 15.1 Inter-Indicator Communication

  NT8:  GlobalVariable.Set/Get("IronX.EXT." + sym + "." + tf + ".Signal", val)
  MT5:  C_IronX_ComBus::Publish("Signal", val) / IronX_ComBusKey("EXT","Signal")
  TV:   input.source(close, "EasyXTrend Signal") — manuale, NON automatico

### 15.2 Formato Chiavi ComBus (MT5/NT8 only)

  Formato: IronX.<PRODOTTO>.<Symbol>.<TF>.<Suffisso>
  Helper MT5: IronX_ComBusKey(product, suffix) in IronX_Types.mqh
  Classe MT5: C_IronX_ComBus::BuildKey/Publish/Read in IronX_ComBus.mqh
  Cleanup: FlushProduct(product) in OnDeinit

  MAI formato underscore (IronX_EXT_Trend) — SEMPRE dot notation.
  TV non ha equivalente ComBus — usa input.source() o mega-script.

### 15.3 Matrice Comunicazione

  | Meccanismo | NT8 | MT5 | TV |
  |---|---|---|---|
  | ComBus GlobalVar | IronX.<P>.<S>.<T>.<K> | IronX.<P>.<S>.<T>.<K> | N/A |
  | iCustom/Buffer | AddIndicator()[buf] | CopyBuffer(handle,idx) | input.source() |
  | Events | ChartControl.Dispatcher | EventChartCustom() | N/A |
  | Helper function | N/A (uso diretto) | IronX_ComBusKey() | N/A |
  | Cleanup | N/A | FlushProduct() | N/A |

## SEZIONE 16 — MA-SLOPE CROSS-PLATFORM (DA #124-131)

### 16.1 Formula Cross-Platform

NT8 (NinZa original):
  rawSlope = (Values[0][0] - Values[0][Lookback]) / Lookback / ninZaATR[0] * 1000
  smoothSlope = LinReg(rawSlope, 2)   // LinReg per SMOOTHING, NON per calcolo

MT5 (IronX EXT LIGHT — 3 params gate):
  double rawSlope = (MA[i] - MA[i - InpSlopeLookback]) / InpSlopeLookback / ninZaATR * 1000.0;
  // Gate: MathAbs(rawSlope) >= InpSlopeThreshold
  // ninZaATR = Gapless ATR (H-L only)

MT5 (IronX MA-Slope FULL — futuro L1):
  double rawSlope = (MA[i] - MA[i - InpLookback]) / InpLookback / ATR[i] * 1000.0;
  double smoothSlope = LinReg(rawSlope, InpSlopeSmooth);  // default 2
  // 4-state hysteresis: ±120 start, ∓60 end

TV PineScript v6:
  rawSlope = (maValue - maValue[lookback]) / lookback / ta.atr(atrPeriod) * 1000
  smoothSlope = ta.linreg(rawSlope, slopeSmooth, 0)
  // alertcondition + barstate.isconfirmed per anti-repaint

### 16.2 Equivalenze Specifiche

| Elemento | NT8 | MT5 | TV |
|---|---|---|---|
| ATR Gapless | ninZaATR.Values[0] | high[i]-low[i] smoothed | ta.atr() (include gap — differenza!) |
| LinReg smooth | LinReg(series, 2) | iLinReg custom | ta.linreg(src, len, 0) |
| Threshold check | if(slope >= threshold) | MathAbs(slope) >= threshold | math.abs(slope) >= threshold |
| Hysteresis state | Series<int> states | int array state tracking | var int state = 0 |
| 4-color histogram | SharpDX ARGB | DRAW_COLOR_HISTOGRAM 4 colori | histogram + color series |
| Signal_State output | Values[2][0] | Buffer[idx] | plot(stateValue) |

### 16.3 ZuperView Gap — MA-Slope NON Portato

ZuperView (sister brand NinZa su TV) NON ha portato MA-Slope Trend Filter.
Prodotti ZuperView portati: Easy Trend ✅, MagnetOsc ✅.
MA-Slope su TradingView = FIRST-MOVER OPPORTUNITY per IronX.
Architettura TV: sub-window indicator, histogram + threshold lines, barstate.isconfirmed anti-repaint.

### 16.4 Nota TV ATR Gapless

TV ta.atr() INCLUDE gap (usa True Range con close[1]).
Per replicare ninZaATR Gapless su TV: `gaplessATR = ta.ema(high - low, atrPeriod)` — DIFFERENZA CRITICA.
Senza questo fix, threshold ±120 NON è cross-instrument su TV.

IronXCharts © Luke SteelWolf — marzo 2026
