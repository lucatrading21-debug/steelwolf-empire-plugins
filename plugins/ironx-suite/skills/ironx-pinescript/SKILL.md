---
description: PineScript v6 deep dive per l'IronX Ecosystem. Attivare quando si sviluppa su TradingView PineScript v6. Contiene struttura indicatori e strategie, gestione oggetti line box label table, barstate e anti-repaint, limiti TV e workaround, alert system, request.security MTF, e tutti i pattern critici PineScript v6 verificati.
---

# IRONX PINESCRIPT — TRADINGVIEW v6 DEEP DIVE

## REGOLA PIATTAFORMA
Questa skill si attiva SOLO per lavoro su TradingView PineScript v6.
Se il lavoro riguarda NT8 usare ironx-nt8.
Se riguarda MT5 usare ironx-mql5.

## SEZIONE 1 — ARCHITETTURA INDICATOR TV

### 1.1 Struttura file standard IronX

// IronXCharts © Luke SteelWolf
// Prodotto: [nome] v[X.X] — PineScript v6
// Equivalente NinZa: [nome]
//@version=6
indicator("IronX [nome]",
    shorttitle="IronX",
    overlay=true,
    max_lines_count=500,
    max_labels_count=500,
    max_boxes_count=500,
    max_bars_back=500)

// === INPUTS ===
int   i_period  = input.int(14, "Period", minval=1)
bool  i_showSig = input.bool(true, "Show Signals")
color i_bullCol = input.color(
    color.rgb(0,180,216), "Bull Color")
color i_bearCol = input.color(
    color.rgb(255,0,127), "Bear Color")

// === CALCOLI ===
float maValue = ta.ema(close, i_period)
bool  isBull  = maValue > maValue[1]

// === PLOT ===
plot(maValue, "MA", isBull ? i_bullCol : i_bearCol, 2,
    plot.style_line)

// === SEGNALI — solo su barra confermata ===
if barstate.isconfirmed
    if isBull and not isBull[1]
        label.new(bar_index, low,
            "▲", color=color.rgb(0,255,136),
            textcolor=color.white,
            style=label.style_label_up,
            size=size.small)

### 1.2 Differenze critiche da NT8

TV usa stessa direzione temporale di NT8:
  close    = barra corrente
  close[1] = una barra fa
  close[n] = n barre fa

MA attenzione: in TV tutto è serie temporale implicita
  Non esistono loop espliciti su barre storiche
  Il codice viene eseguito su ogni barra automaticamente

barstate — fondamentale per anti-repaint:
  barstate.isconfirmed  = barra CHIUSA (equivale OnBarClose NT8)
  barstate.isrealtime   = siamo in realtime
  barstate.islast       = ultima barra
  barstate.isnew        = prima esecuzione su questa barra
  barstate.ishistory    = siamo su storico

### 1.3 Limiti hard TV — CRITICI

  max_lines_count  = 500  (default 50)
  max_labels_count = 500  (default 50)
  max_boxes_count  = 500  (default 50)
  max_bars_back    = 500
  max request.security per script = 40

Superare questi limiti causa errore runtime.
Impostare SEMPRE i max nel dichiaratore indicator().

## SEZIONE 2 — ANTI-REPAINT TV

### 2.1 Regola fondamentale

SEGNALI solo dentro if barstate.isconfirmed:
  if barstate.isconfirmed
      if crossSignal
          label.new(...)  // definitivo — non ridisegna

MAI segnali fuori da barstate.isconfirmed:
  if crossSignal  // SBAGLIATO — ridisegna su ogni tick
      label.new(...)

### 2.2 request.security anti-repaint

CORRETTO:
  float htfClose = request.security(
      syminfo.tickerid, "60", close[1],
      lookahead=barmerge.lookahead_off)

SBAGLIATO — causa repaint:
  float htfClose = request.security(
      syminfo.tickerid, "60", close,
      lookahead=barmerge.lookahead_on)

Regola: usare close[1] per avere barra HTF chiusa
Regola: lookahead=barmerge.lookahead_off SEMPRE

### 2.3 var per stati persistenti

var bool lastSignal = false
var line trendLine  = na
var int  boxCount   = 0

var dichiara variabile che persiste tra barre
Senza var la variabile si resetta ad ogni barra

## SEZIONE 3 — OGGETTI GRAFICI TV

### 3.1 Line

Creare:
  var line myLine = na
  if barstate.isconfirmed and crossCondition
      if not na(myLine)
          line.delete(myLine)
      myLine := line.new(
          bar_index[5], low[5],
          bar_index, low,
          color=color.rgb(0,102,255),
          width=2,
          style=line.style_solid)

Stili disponibili:
  line.style_solid
  line.style_dashed
  line.style_dotted
  line.style_arrow_right
  line.style_arrow_left
  line.style_arrow_both

Estendere a destra:
  line.new(..., extend=extend.right)

Aggiornare linea esistente:
  line.set_xy1(myLine, bar_index, price)
  line.set_xy2(myLine, bar_index, price)
  line.set_color(myLine, newColor)

### 3.2 Box

Creare:
  var box myBox = na
  if barstate.isconfirmed and zoneCondition
      myBox := box.new(
          left=bar_index[10],
          top=zoneHigh,
          right=bar_index,
          bottom=zoneLow,
          border_color=color.rgb(0,191,255),
          border_width=1,
          bgcolor=color.new(
              color.rgb(0,191,255), 85))

Estendere box dinamicamente:
  if not na(myBox)
      box.set_right(myBox, bar_index)

Aggiornare box:
  box.set_top(myBox, newHigh)
  box.set_bottom(myBox, newLow)
  box.set_bgcolor(myBox, newColor)

Eliminare box:
  box.delete(myBox)
  myBox := na

### 3.3 Label

Creare:
  label.new(
      bar_index, high,
      text="SIGNAL",
      color=color.rgb(255,165,0),
      textcolor=color.white,
      style=label.style_label_down,
      size=size.small)

Stili label disponibili:
  label.style_label_up
  label.style_label_down
  label.style_label_left
  label.style_label_right
  label.style_label_center
  label.style_none
  label.style_triangleup
  label.style_triangledown
  label.style_arrowup
  label.style_arrowdown
  label.style_circle
  label.style_diamond

Size disponibili:
  size.tiny / size.small / size.normal
  size.large / size.huge / size.auto

Aggiornare label:
  label.set_text(myLabel, "nuovo testo")
  label.set_color(myLabel, newColor)
  label.set_xy(myLabel, bar_index, price)

LIMITE: max 500 label — eliminare vecchi con label.delete()

### 3.4 Table — Dashboard Panel

Creare table:
  var table panel = na
  if barstate.islast
      if not na(panel)
          table.delete(panel)
      panel := table.new(
          position.top_right,
          2,   // colonne
          5,   // righe
          bgcolor=color.new(
              color.rgb(17,17,32), 20),
          border_color=color.rgb(0,180,216),
          border_width=1,
          frame_color=color.rgb(0,180,216),
          frame_width=1)

      table.cell(panel, 0, 0,
          text="IronX Trend",
          text_color=color.rgb(255,165,0),
          text_size=size.small,
          bgcolor=color.new(
              color.rgb(17,17,32), 0))

      table.cell(panel, 1, 0,
          text=isBull ? "BULL" : "BEAR",
          text_color=isBull
              ? color.rgb(0,180,216)
              : color.rgb(255,0,127),
          text_size=size.small)

Posizioni table disponibili:
  position.top_left    / position.top_center
  / position.top_right
  position.middle_left / position.middle_center
  / position.middle_right
  position.bottom_left / position.bottom_center
  / position.bottom_right

LIMITE TV: table non è interattiva — nessun click
Usare input.bool() per simulare toggle:
  bool i_showLong = input.bool(true, "Enable Long")

### 3.5 plotshape — Segnali

Freccia su (Long):
  plotshape(
      series=longSignal and barstate.isconfirmed,
      title="Long",
      style=shape.arrowup,
      location=location.belowbar,
      color=color.rgb(0,255,136),
      size=size.small)

Freccia giù (Short):
  plotshape(
      series=shortSignal and barstate.isconfirmed,
      title="Short",
      style=shape.arrowdown,
      location=location.abovebar,
      color=color.rgb(255,68,102),
      size=size.small)

Shapes disponibili:
  shape.arrowup / shape.arrowdown
  shape.triangleup / shape.triangledown
  shape.circle / shape.square
  shape.diamond / shape.cross / shape.xcross
  shape.labelup / shape.labeldown

### 3.6 barcolor e bgcolor

Colorare barre:
  barcolor(isBull
      ? color.rgb(0,180,216)
      : color.rgb(255,0,127))

Background su condizione:
  bgcolor(isSession
      ? color.new(color.rgb(0,180,216), 90)
      : na)

### 3.7 plotcandle — Hollow/Solid (DA #100)

PineScript v6 supporta hollow REALE via plotcandle():
  plotcandle(open, high, low, close,
      color = bodyColor,           // corpo candela (series color)
      bordercolor = trendColor,    // bordo candela (series color)
      wickcolor = trendColor)      // wick candela (series color)

Hollow simulation per EXT TV:
  trendColor = trend > 0 ? color.new(#1E90FF, 0) : color.new(#DC143C, 0)
  barDir = close > open ? 1 : close < open ? -1 : 0
  aligned = trend * barDir > 0
  bodyColor = aligned ? trendColor : color.new(trendColor, 70)
  // 70 = 70% trasparenza → corpo quasi invisibile, bordo pieno

REGOLA: su TV hollow è REALE (bordercolor separato), su MT5 è simulato (DimColor).

### 3.8 bgcolor() — Background Painting (DA #103-108)

PineScript v6 bgcolor() è l'equivalente diretto di MT5 OBJ_RECTANGLE BACK.
Su MT5 serve pre-blend manuale + OBJ_RECTANGLE. Su TV è NATIVO con trasparenza reale.

Pattern C3 Background Painting per EXT TV:
  // Colori background (equivalenti MT5 InpBGColorUp/InpBGColorDn)
  i_bg_bull = input.color(color.rgb(50, 205, 50), "BG Bull")    // LimeGreen
  i_bg_bear = input.color(color.rgb(255, 105, 180), "BG Bear")  // HotPink
  i_bg_opacity = input.int(20, "BG Opacity", minval=0, maxval=100)
  i_show_bg = input.bool(false, "Show Background")  // default false (NinZa aligned)

  // Background painting — trasparenza REALE (non pre-blend)
  bg_transp = 100 - i_bg_opacity  // TV: 0=opaco, 100=invisibile (invertito vs MT5)
  bg_color = trend > 0 ? color.new(i_bg_bull, bg_transp) :
             trend < 0 ? color.new(i_bg_bear, bg_transp) : na
  bgcolor(i_show_bg ? bg_color : na)

DIFFERENZE CRITICHE MT5 vs TV per background:
  MT5: pre-blend manuale (BlendColor) + OBJ_RECTANGLE BACK — NO alpha nativa
  TV:  bgcolor() con color.new(c, transparency) — alpha REALE nativa
  MT5: segment-based (1 rect per segmento trend) — performance
  TV:  bgcolor() per-bar (automatico, nessun object management)
  MT5: 0xBBGGRR format — TV: color.rgb(R,G,B) format
  MT5: opacity 0-100 (0=trasparente) — TV: transparency 0-100 (0=opaco, INVERTITO)

REGOLA: su TV bgcolor() è NATIVO e superiore. Su MT5 serve workaround OBJ_RECTANGLE.

## SEZIONE 4 — PLOT E LINEE INDICATORE

### 4.1 plot()

Base:
  plot(maValue, "MA Line",
      color=isBull
          ? color.rgb(0,180,216)
          : color.rgb(255,0,127),
      linewidth=2)

Step line:
  plot(stepValue, "Step",
      color=color.rgb(0,180,216),
      style=plot.style_stepline)

Istogramma:
  plot(histValue, "Hist",
      color=histValue > 0
          ? color.rgb(0,255,136)
          : color.rgb(255,68,102),
      style=plot.style_histogram)

### 4.2 fill() tra due plot

p1 = plot(upperBand, color=color.rgb(0,180,216))
p2 = plot(lowerBand, color=color.rgb(255,0,127))
fill(p1, p2,
    color=color.new(color.rgb(0,180,216), 85))

### 4.3 hline()

hline(0, "Zero Line",
    color=color.rgb(136,136,153),
    linestyle=hline.style_dashed,
    linewidth=1)

## SEZIONE 5 — COLORI TV

### 5.1 Creazione colori

Da RGB:
  color.rgb(0, 180, 216)

Con trasparenza (0=opaco 100=invisibile):
  color.new(color.rgb(0,180,216), 85)

Colori IronX in TV:
  BULLISH    = color.rgb(0,180,216)
  BEARISH    = color.rgb(255,0,127)
  BUY        = color.rgb(0,255,136)
  SELL       = color.rgb(255,68,102)
  LABEL      = color.rgb(255,165,0)
  SUPPORT    = color.rgb(0,102,255)
  RESISTANCE = color.rgb(255,105,180)
  PANEL_BG   = color.rgb(17,17,32)
  NEUTRAL    = color.rgb(136,136,153)

## SEZIONE 6 — MULTI-TIMEFRAME

### 6.1 request.security

Pattern base anti-repaint:
  [htfHigh, htfLow, htfClose] =
      request.security(
          syminfo.tickerid,
          "60",
          [high[1], low[1], close[1]],
          lookahead=barmerge.lookahead_off)

Pattern per MA su HTF:
  float htfMA = request.security(
      syminfo.tickerid, "D",
      ta.ema(close, 20)[1],
      lookahead=barmerge.lookahead_off)

Timeframe strings:
  "1" "3" "5" "15" "30" "60" "120" "240"
  "D" "W" "M"

Max 40 chiamate request.security per script

## SEZIONE 7 — ALERT TV

### 7.1 alertcondition

alertcondition(
    longSignal and barstate.isconfirmed,
    title="IronX Long Signal",
    message="IronX Long — {{ticker}} {{interval}}")

alertcondition(
    shortSignal and barstate.isconfirmed,
    title="IronX Short Signal",
    message="IronX Short — {{ticker}} {{interval}}")

Placeholder disponibili nel message:
  {{ticker}}     simbolo
  {{interval}}   timeframe
  {{close}}      prezzo close
  {{time}}       timestamp
  {{exchange}}   exchange

### 7.2 alert() — programmatico

if barstate.isconfirmed and longSignal
    alert("IronX Long: " + syminfo.ticker,
        alert.freq_once_per_bar_close)

Frequenze:
  alert.freq_once_per_bar      una per barra
  alert.freq_once_per_bar_close una per barra chiusa
  alert.freq_all               ogni tick

## SEZIONE 8 — LIMITAZIONI TV E WORKAROUND

| Limitazione | Workaround IronX |
|---|---|
| No rotazione testo | Usare label con stile diverso |
| No click su oggetti | input.bool() per toggle |
| Max 500 line/box/label | Eliminare vecchi esplicitamente |
| No ComBus inter-indicatori | Non risolvibile in TV |
| No trading automatico | alertcondition + webhook broker |
| No filesystem | Non risolvibile in TV |
| No network | Non risolvibile in TV |
| DEMA TEMA ZLEMA mancano | Implementare formula manuale |
| Bar painting wick separato | plotcandle(wickcolor=c) — RISOLVIBILE in TV |
| Bar painting hollow/solid | plotcandle(color=color.new(c,70), bordercolor=c) — PIENO in TV |
| Renko limitato | chart.is_renko per rilevamento |

## SEZIONE 9 — PATTERN CRITICI TV

### 9.1 Cleanup oggetti dinamici

var line myLine = na
var box  myBox  = na
var label myLbl = na

if barstate.isconfirmed
    // Eliminare prima di ricreare
    if not na(myLine) : line.delete(myLine)
    if not na(myBox)  : box.delete(myBox)
    if not na(myLbl)  : label.delete(myLbl)
    // Ricreare
    myLine := line.new(...)
    myBox  := box.new(...)
    myLbl  := label.new(...)

### 9.2 Gestione na

Controllare sempre na prima di usare:
  if not na(myValue)
      // usare myValue

Valore default se na:
  float val = na(source) ? 0.0 : source

### 9.3 Rilevamento Renko

if chart.is_renko
    // siamo su chart Renko
    float brickSize = syminfo.mintick * 10

## SEZIONE 10 — CHECKLIST TV PRE-COMMIT

  indicator() con max_lines/labels/boxes_count=500?
  Segnali dentro barstate.isconfirmed?
  request.security con lookahead_off e [1]?
  var usato per stati persistenti?
  Oggetti eliminati prima di ricreare?
  Nessun loop su oggetti ogni barra senza delete?
  Max 40 request.security rispettato?
  alertcondition con barstate.isconfirmed?
  Testato su replay — zero repaint?
  Limiti 500 rispettati per line box label?
  Versione //@version=6 presente?

## SEZIONE 11 — NOBLE CLOUD PINESCRIPT v6

### 11.1 Architettura Noble Cloud TV

Noble Cloud è nativo per PineScript — dual-MA + fill():

  //@version=6
  indicator("IronX Noble Cloud v1.0", overlay=true)

  // Inputs
  base_type  = input.string("SMA", "Baseline MA", options=["SMA","EMA","HMA",...])
  base_per   = input.int(60, "Baseline Period")
  base_sm_on = input.bool(true, "Baseline Smoothing")
  base_sm_m  = input.string("EMA", "Baseline Smooth Method")
  base_sm_p  = input.int(60, "Baseline Smooth Period")
  kern_type  = input.string("SMA", "Kernel MA")
  kern_per   = input.int(20, "Kernel Period")
  kern_sm_on = input.bool(true, "Kernel Smoothing")
  kern_sm_m  = input.string("EMA", "Kernel Smooth Method")
  kern_sm_p  = input.int(5, "Kernel Smooth Period")
  sig_split  = input.int(5, "Signal Split Bars")

### 11.2 Calcolo Core

  // MA helper function
  calcMA(src, type, period) =>
    type == "SMA" ? ta.sma(src, period) :
    type == "EMA" ? ta.ema(src, period) :
    type == "HMA" ? ta.hma(src, period) :
    // ... altri tipi
    ta.sma(src, period)

  // Baseline
  base_raw = calcMA(close, base_type, base_per)
  baseline = base_sm_on ? calcMA(base_raw, base_sm_m, base_sm_p) : base_raw

  // Kernel
  kern_raw = calcMA(close, kern_type, kern_per)
  kernel = kern_sm_on ? calcMA(kern_raw, kern_sm_m, kern_sm_p) : kern_raw

### 11.3 Cloud e Segnali

  // Cloud
  cloud_bull = kernel > baseline
  fill_bull = color.new(color.teal, 0)
  fill_bear = color.new(#2F4F4F, 0)

  // Plots
  p_base = plot(baseline, "Baseline", style=plot.style_line, linewidth=2)
  p_kern = plot(kernel, "Kernel", display=display.none)
  fill(p_base, p_kern, color=cloud_bull ? fill_bull : fill_bear)

  // Signals (anti-repaint)
  var int last_sig_bar = 0
  signal_cloud = cloud_bull ? 1 : -1
  signal_trend = baseline > baseline[1] ? 1 : -1

  // Signal_Trade con filtro
  cloud_changed = (cloud_bull != cloud_bull[1]) and barstate.isconfirmed
  sig_ok = (bar_index - last_sig_bar) >= sig_split
  signal_trade = cloud_changed and sig_ok ? (cloud_bull ? 1 : -1) : 0

  if signal_trade != 0
    last_sig_bar := bar_index

### 11.4 Confluenza con Easy X Trend TV

Noble Cloud TV può leggere Easy Trend via input.source():

  ext_trend = input.source(close, "Easy Trend Signal")

  // Confluenza
  aligned = (ext_trend > 0 and signal_cloud > 0) or
            (ext_trend < 0 and signal_cloud < 0)

  // Entry solo se aligned
  entry_long  = signal_trade == 1 and aligned
  entry_short = signal_trade == -1 and aligned

### 11.5 Fattibilità TV

  Noble Cloud TV: ✅ ALTA — nessun blocco
  - Dual-MA + fill() = nativo PineScript
  - barstate.isconfirmed = zero repaint
  - input.source() per confluenza
  - Unico limite: 40 request.security per MTF (non servono per NC base)

IronXCharts © Luke SteelWolf — marzo 2026