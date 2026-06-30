---
description: MQL5 deep dive per l'IronX Ecosystem. Attivare quando si sviluppa su MetaTrader 5 MQL5. Contiene struttura indicatori e EA, CCanvas per grafica avanzata, gestione oggetti chart, buffer layout, OnCalculate anti-repaint, ordini e position management MT5, comunicazione inter-indicatori, e tutti i pattern critici MQL5 verificati.
---

# IRONX MQL5 — METATRADER 5 DEEP DIVE

## REGOLA PIATTAFORMA
Questa skill si attiva SOLO per lavoro su MT5 MQL5.
Se il lavoro riguarda NT8 usare ironx-nt8.
Se riguarda TradingView usare ironx-pinescript.

## SEZIONE 1 — ARCHITETTURA INDICATOR MQL5

### 1.1 Struttura file standard IronX

//+------------------------------------------------------------------+
//| IronXCharts © Luke SteelWolf                                     |
//| Prodotto: [nome]                                                  |
//| Versione: [X.X]                                                   |
//| Piattaforma: MetaTrader 5 — MQL5                                 |
//| Equivalente NinZa: [nome]                                        |
//+------------------------------------------------------------------+
#property copyright   "IronXCharts © Luke SteelWolf"
#property version     "1.00"
#property indicator_chart_window
#property indicator_plots 1

#include <IronX/Core/IronX_Types.mqh>
#include <IronX/Core/IronX_MathLib.mqh>

input int    InpPeriod    = 14;     // Periodo MA
input bool   InpShowSig   = true;   // Mostra segnali

double Buffer0[];
double Buffer1[];

int OnInit() {
  // Step 0: Input validation — ALWAYS FIRST (DA #118)
  if(!ValidateInputs())
     return INIT_PARAMETERS_INCORRECT;

  SetIndexBuffer(0, Buffer0, INDICATOR_DATA);
  SetIndexBuffer(1, Buffer1, INDICATOR_DATA);
  ArraySetAsSeries(Buffer0, false);
  ArraySetAsSeries(Buffer1, false);
  PlotIndexSetString(0, PLOT_LABEL, "MA Line");
  PlotIndexSetDouble(0, PLOT_EMPTY_VALUE, 0.0);
  IndicatorSetString(INDICATOR_SHORTNAME, "IronX [nome]");
  return INIT_SUCCEEDED;
}

// ValidateInputs() — Template Universale IronX (DA #118-123)
// CRITICAL → Print("PROD CRITICAL:") + return false
// WARNING → Print("PROD WARNING:") + continue
// MAI Alert() — causa popup cascata multi-chart (DA #119)
// MAI modificare input vars (read-only in MQL5)
// Layer 1 validation — Engine guards sono Layer 2 defense-in-depth (DA #123)
bool ValidateInputs() {
  bool valid = true;
  if(InpPeriod <= 0) { PrintFormat("PROD CRITICAL: InpPeriod=%d invalid (min=1)", InpPeriod); valid = false; }
  if(!valid) return false;
  // WARNING examples:
  if(InpColor == clrNONE) PrintFormat("PROD WARNING: InpColor=clrNONE. Element invisible."); // DA #120
  return true;
}

void OnDeinit(const int reason) {
  ObjectsDeleteAll(0, "IronX_");
  Comment("");
}

int OnCalculate(
  const int rates_total,
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
              ? prev_calculated - 1
              : InpPeriod;
  if (rates_total < InpPeriod) return 0;

  for(int i = start; i < rates_total; i++) {
    bool isClosedBar = (i < rates_total - 1);
    // logica qui
  }
  return rates_total;
}

### 1.2 Direzione temporale — REGOLA CRITICA

ArraySetAsSeries=false è il DEFAULT IronX:
  close[0]             = barra più VECCHIA
  close[rates_total-1] = barra più RECENTE

Equivalenza con NT8:
  NT8 Close[0]    = MT5 close[rates_total-1]
  NT8 Close[1]    = MT5 close[rates_total-2]
  NT8 Close[n]    = MT5 close[rates_total-1-n]

MAI usare ArraySetAsSeries=true sui buffer IronX
Creerebbe inconsistenza con prev_calculated

### 1.3 Buffer Layout — PRODOTTO-SPECIFICO

Il buffer layout IronX NON è universale [0-5].
Ogni prodotto definisce il proprio layout ottimizzato.

Esempio Easy X Trend v2.0 (18 buffer):
  SetIndexBuffer(0,  BuffLine, INDICATOR_DATA);       // MA Line
  SetIndexBuffer(1,  BuffLineColor, INDICATOR_COLOR_INDEX);
  SetIndexBuffer(2,  BuffO, INDICATOR_DATA);          // Trend Candle O
  SetIndexBuffer(3,  BuffH, INDICATOR_DATA);          // Trend Candle H
  SetIndexBuffer(4,  BuffL, INDICATOR_DATA);          // Trend Candle L
  SetIndexBuffer(5,  BuffC, INDICATOR_DATA);          // Trend Candle C
  SetIndexBuffer(6,  BuffBarColor, INDICATOR_COLOR_INDEX);
  SetIndexBuffer(7,  BuffBuy, INDICATOR_DATA);        // Buy signal marker
  SetIndexBuffer(8,  BuffSell, INDICATOR_DATA);       // Sell signal marker
  SetIndexBuffer(9,  BuffSignalTrade, INDICATOR_DATA); // 1/-1/2/-2/0
  SetIndexBuffer(10, BuffBackground, INDICATOR_DATA);
  SetIndexBuffer(11, BuffBGColor, INDICATOR_COLOR_INDEX);
  SetIndexBuffer(12, BuffTrend, INDICATOR_DATA);      // 1/-1/0
  SetIndexBuffer(13-17, calc buffers);                // ATR, RawMA, SmoothedMA, TR, ATR

Valori Signal_Trend:  1=Bull  -1=Bear  0=Neutro
Valori Signal_Trade:  1=Long  -1=Short  2=Pullback Buy  -2=Pullback Sell  0=No signal

Per layout di altri prodotti: CLAUDE.md "Buffer Reference"

## SEZIONE 2 — ANTI-REPAINT MQL5

### 2.1 Regola fondamentale

SEGNALI DEFINITIVI solo su barre chiuse:
  if(i < rates_total - 1) {
    // questa barra è chiusa — segnale definitivo
    Buffer1[i] = calcolaTrend(i);
  }

Barra corrente aperta — aggiornamento continuo:
  if(i == rates_total - 1) {
    // questa barra è ancora aperta
    // aggiornare solo valori non-segnale
    Buffer0[i] = calcolaMA(i);
  }

### 2.2 Ottimizzazione prev_calculated

int start = (prev_calculated > 0)
            ? prev_calculated - 1
            : InpPeriod;

Questo ricalcola SOLO le barre nuove
Obbligatorio per performance su storico lungo

### 2.3 Inizializzazione buffer

All'inizio del loop prima del calcolo:
  if(prev_calculated == 0) {
    ArrayInitialize(Buffer0, 0.0);
    ArrayInitialize(Buffer1, 0.0);
  }

## SEZIONE 3 — OGGETTI GRAFICI MT5

### 3.1 Regole fondamentali oggetti

REGOLA 1: ObjectsDeleteAll in OnDeinit — SEMPRE e OBBLIGATORIA
  void OnDeinit(const int reason) {
    ObjectsDeleteAll(0, "IronX_");
  }

REGOLA 2: Naming convention IronX
  "IronX_[PRODOTTO]_[TIPO]_" + IntegerToString(time[i])
  Es: "IronX_EXT_MRK_" + IntegerToString((int)time[i])

REGOLA 3: Aggiornare con ObjectMove/SetString NON ricreare
  Ricreare oggetti ogni bar causa memory leak e lag

REGOLA 4: Max circa 1000 oggetti per chart
  Eliminare oggetti vecchi quando non servono più

### 3.2 Frecce e marker

Freccia su (Long signal):
  string name = "IronX_EXT_MRK_" + IntegerToString((int)time[i]);
  ObjectCreate(0, name, OBJ_ARROW, 0, time[i], low[i]);
  ObjectSetInteger(0, name, OBJPROP_ARROWCODE, 241);
  ObjectSetInteger(0, name, OBJPROP_COLOR, C'00,255,136');
  ObjectSetInteger(0, name, OBJPROP_WIDTH, 2);
  ObjectSetInteger(0, name, OBJPROP_ANCHOR, ANCHOR_TOP);

Freccia giù (Short signal):
  ObjectCreate(0, name, OBJ_ARROW, 0, time[i], high[i]);
  ObjectSetInteger(0, name, OBJPROP_ARROWCODE, 242);
  ObjectSetInteger(0, name, OBJPROP_COLOR, C'255,68,102');
  ObjectSetInteger(0, name, OBJPROP_ANCHOR, ANCHOR_BOTTOM);

Triangolo su con Arial Bold:
  ObjectCreate(0, name, OBJ_ARROW, 0, time[i], low[i]);
  ObjectSetString(0, name, OBJPROP_FONT, "Arial Bold");
  ObjectSetInteger(0, name, OBJPROP_ARROWCODE, 0x25B2);
  ObjectSetInteger(0, name, OBJPROP_COLOR, C'00,255,136');

### 3.3 Label e testo

Label su barra:
  string name = "IronX_EXT_LBL_" + IntegerToString((int)time[i]);
  ObjectCreate(0, name, OBJ_TEXT, 0, time[i], high[i]);
  ObjectSetString(0, name, OBJPROP_TEXT, "SIGNAL");
  ObjectSetString(0, name, OBJPROP_FONT, "Arial Bold");
  ObjectSetInteger(0, name, OBJPROP_FONTSIZE, 9);
  ObjectSetInteger(0, name, OBJPROP_COLOR, C'255,165,0');
  ObjectSetInteger(0, name, OBJPROP_ANCHOR, ANCHOR_BOTTOM);

### 3.4 Box e rettangoli

Box zona price:
  string name = "IronX_EXT_BOX_" + IntegerToString((int)time[i]);
  ObjectCreate(0, name, OBJ_RECTANGLE,
    0, time[i], priceHigh, timeFuture, priceLow);
  ObjectSetInteger(0, name, OBJPROP_COLOR, C'00,180,216');
  ObjectSetInteger(0, name, OBJPROP_BACK, true);
  ObjectSetInteger(0, name, OBJPROP_FILL, true);
  ObjectSetInteger(0, name, OBJPROP_WIDTH, 1);

CRITICO: OBJ_RECTANGLE non supporta alpha transparency
Per box con trasparenza reale usare CCanvas (Sezione 4)

Aggiornare box esistente:
  ObjectMove(0, name, 1, newTime, newPrice);

### 3.5 Linee

Linea orizzontale:
  ObjectCreate(0, name, OBJ_HLINE, 0, 0, price);
  ObjectSetInteger(0, name, OBJPROP_COLOR, C'0,102,255');
  ObjectSetInteger(0, name, OBJPROP_STYLE, STYLE_SOLID);
  ObjectSetInteger(0, name, OBJPROP_WIDTH, 1);

Trend line 2 punti:
  ObjectCreate(0, name, OBJ_TREND,
    0, time1, price1, time2, price2);
  ObjectSetInteger(0, name, OBJPROP_RAY_RIGHT, true);

### 3.6 Dashboard panel

Panel background:
  ObjectCreate(0, "IronX_EXT_PNL_BG", OBJ_RECTANGLE_LABEL,
    0, 0, 0);
  ObjectSetInteger(0, "IronX_EXT_PNL_BG",
    OBJPROP_XDISTANCE, 10);
  ObjectSetInteger(0, "IronX_EXT_PNL_BG",
    OBJPROP_YDISTANCE, 30);
  ObjectSetInteger(0, "IronX_EXT_PNL_BG",
    OBJPROP_XSIZE, 200);
  ObjectSetInteger(0, "IronX_EXT_PNL_BG",
    OBJPROP_YSIZE, 120);
  ObjectSetInteger(0, "IronX_EXT_PNL_BG",
    OBJPROP_BGCOLOR, C'17,17,32');
  ObjectSetInteger(0, "IronX_EXT_PNL_BG",
    OBJPROP_BORDER_TYPE, BORDER_FLAT);
  ObjectSetInteger(0, "IronX_EXT_PNL_BG",
    OBJPROP_CORNER, CORNER_LEFT_UPPER);

Label dentro panel:
  ObjectCreate(0, "IronX_EXT_PNL_LBL", OBJ_LABEL, 0, 0, 0);
  ObjectSetString(0, "IronX_EXT_PNL_LBL",
    OBJPROP_TEXT, "Trend: BULL");
  ObjectSetInteger(0, "IronX_EXT_PNL_LBL",
    OBJPROP_XDISTANCE, 20);
  ObjectSetInteger(0, "IronX_EXT_PNL_LBL",
    OBJPROP_YDISTANCE, 50);
  ObjectSetInteger(0, "IronX_EXT_PNL_LBL",
    OBJPROP_COLOR, C'0,180,216');
  ObjectSetString(0, "IronX_EXT_PNL_LBL",
    OBJPROP_FONT, "Arial Bold");
  ObjectSetInteger(0, "IronX_EXT_PNL_LBL",
    OBJPROP_FONTSIZE, 10);

Bottone interattivo:
  ObjectCreate(0, "IronX_CPT_BTN_LONG",
    OBJ_BUTTON, 0, 0, 0);
  ObjectSetString(0, "IronX_CPT_BTN_LONG",
    OBJPROP_TEXT, "LONG");
  ObjectSetInteger(0, "IronX_CPT_BTN_LONG",
    OBJPROP_XSIZE, 80);
  ObjectSetInteger(0, "IronX_CPT_BTN_LONG",
    OBJPROP_YSIZE, 30);
  ObjectSetInteger(0, "IronX_CPT_BTN_LONG",
    OBJPROP_BGCOLOR, C'0,255,136');
  ObjectSetInteger(0, "IronX_CPT_BTN_LONG",
    OBJPROP_COLOR, C'0,0,0');

Gestione click bottone in EA:
  void OnChartEvent(const int id,
    const long &lparam,
    const double &dparam,
    const string &sparam) {
    if(id == CHARTEVENT_OBJECT_CLICK) {
      if(sparam == "IronX_CPT_BTN_LONG") {
        // azione long
        ObjectSetInteger(0, sparam,
          OBJPROP_STATE, false);
      }
    }
  }

## SEZIONE 4 — CCANVAS — GRAFICA AVANZATA

### 3.7 Background Painting via OBJ_RECTANGLE BACK (DA #103-108)

LIMITAZIONE CRITICA MQL5:
  Alpha/trasparenza NON supportata su:
  - Plot colors (DRAW_FILLING, DRAW_COLOR_HISTOGRAM) — alpha ignorato
  - OBJ_RECTANGLE OBJPROP_COLOR — alpha ignorato
  Alpha supportata SOLO su CCanvas (ColorToARGB) — ma CCanvas = z-order SOPRA candele

SOLUZIONE IronX — Pre-blend con sfondo chart:
  1. Leggere sfondo chart: ChartGetInteger(0, CHART_COLOR_BACKGROUND)
  2. Calcolare colore blended:
     Per ogni canale RGB:
       result = bg_channel * (100 - opacity) / 100 + fg_channel * opacity / 100
  3. Applicare colore blended a OBJ_RECTANGLE con OBJPROP_BACK=true

  color BlendColor(color fg, color bg, int opacity):
    int r = (ColorGetRed(bg)*(100-opacity) + ColorGetRed(fg)*opacity) / 100
    int g = (ColorGetGreen(bg)*(100-opacity) + ColorGetGreen(fg)*opacity) / 100
    int b = (ColorGetBlue(bg)*(100-opacity) + ColorGetBlue(fg)*opacity) / 100
    return (color)((b << 16) | (g << 8) | r)

  Nota: MQL5 color format = 0xBBGGRR (NON 0xRRGGBB!)

Creazione rettangolo background:
  ObjectCreate(0, name, OBJ_RECTANGLE, 0,
    time1, 999999.0,    // top-left: segment start, extreme high
    time2, 0.0);        // bottom-right: segment end, extreme low
  ObjectSetInteger(0, name, OBJPROP_COLOR, blended_color);
  ObjectSetInteger(0, name, OBJPROP_BACK, true);    // z-order [0] DIETRO candele
  ObjectSetInteger(0, name, OBJPROP_FILL, true);     // riempimento solido
  ObjectSetInteger(0, name, OBJPROP_SELECTABLE, false);
  ObjectSetInteger(0, name, OBJPROP_HIDDEN, true);   // nasconde da lista oggetti

  Z-order: OBJPROP_BACK=true = livello [0] — identico NT8 BackBrush

Segment-based management:
  1 rettangolo per segmento di trend continuo (NON per barra)
  ~10-30 oggetti per 500 barre (ottimale)
  Estendere ultimo rettangolo quando trend continua (ObjectSetInteger time2)
  Nuovo rettangolo quando trend cambia direzione
  Flat (trend==0): nessun rettangolo = gap trasparente

Colori standard NinZa (DA #105):
  Bullish: LimeGreen (#32CD32) — 3 fonti NinZa indipendenti
  Bearish: HotPink (#FF69B4) — 3 fonti NinZa indipendenti
  Opacity default Easy Trend: 20 (scala 0-100)

Reagire a cambio sfondo chart:
  In OnChartEvent(CHARTEVENT_CHART_CHANGE):
    Ricalcolare colori blended
    Ricolorare tutti i rettangoli esistenti
    ChartRedraw()

### 4.1 Quando usare CCanvas

Usare CCanvas quando OBJ_RECTANGLE non basta:
  Box con trasparenza alpha reale
  Hatching e pattern diagonali
  Grafica pixel-level
  Forme personalizzate

### 4.2 Setup CCanvas

#include <Canvas/Canvas.mqh>

CCanvas canvas;

In OnInit:
  canvas.CreateBitmapLabel(0, 0,
    "IronX_EXT_CVS_main",
    10, 30, 200, 120,
    COLOR_FORMAT_ARGB_NORMALIZE);
  canvas.FontSet("Arial Bold", 10);

### 4.3 Disegnare su CCanvas

Sfondo semi-trasparente:
  canvas.Erase(ColorToARGB(C'17,17,32', 180));

Rettangolo con alpha:
  canvas.FillRectangle(x1, y1, x2, y2,
    ColorToARGB(C'0,180,216', 76));

Testo:
  canvas.TextOut(10, 10, "Trend: BULL",
    ColorToARGB(C'0,180,216', 255));

Linea diagonale per hatching:
  canvas.Line(x1, y1, x2, y2,
    ColorToARGB(C'0,180,216', 100));

Applicare al chart:
  canvas.Update();

Cleanup:
  canvas.Destroy();

## SEZIONE 5 — EXPERT ADVISOR STRUCTURE

### 5.1 Struttura EA IronX

input double InpLotSize    = 0.1;
input int    InpMagicNumber = 12345;
input double InpStopLoss    = 50;
input double InpTakeProfit  = 100;

CTrade trade;

int OnInit() {
  trade.SetExpertMagicNumber(InpMagicNumber);
  trade.SetDeviationInPoints(10);
  trade.SetTypeFilling(ORDER_FILLING_IOC);
  return INIT_SUCCEEDED;
}

void OnTick() {
  if(!IsNewBar()) return;
  // logica
}

void OnDeinit(const int reason) {
  ObjectsDeleteAll(0, "IronX_");
}

bool IsNewBar() {
  static datetime lastBar = 0;
  datetime currentBar = iTime(Symbol(), Period(), 0);
  if(currentBar != lastBar) {
    lastBar = currentBar;
    return true;
  }
  return false;
}

### 5.2 Ordini MT5

Apertura ordine:
  trade.Buy(InpLotSize, Symbol(), 0, 0, 0,
    "IronX Long Signal");
  trade.Sell(InpLotSize, Symbol(), 0, 0, 0,
    "IronX Short Signal");

Con stop e target:
  double sl = NormalizeDouble(
    Ask - InpStopLoss * _Point, _Digits);
  double tp = NormalizeDouble(
    Ask + InpTakeProfit * _Point, _Digits);
  trade.Buy(InpLotSize, Symbol(), Ask, sl, tp,
    "IronX Long");

Chiusura posizione:
  if(PositionSelect(Symbol())) {
    trade.PositionClose(Symbol());
  }

### 5.3 Position management

Verificare posizione aperta:
  if(PositionSelect(Symbol())) {
    ENUM_POSITION_TYPE type =
      (ENUM_POSITION_TYPE)
      PositionGetInteger(POSITION_TYPE);
    double openPrice =
      PositionGetDouble(POSITION_PRICE_OPEN);
    double volume =
      PositionGetDouble(POSITION_VOLUME);
    double profit =
      PositionGetDouble(POSITION_PROFIT);
  }

## SEZIONE 6 — COMUNICAZIONE INTER-INDICATORI

### 6.1 iCustom — leggere buffer

double trendValue = iCustom(Symbol(), Period(),
  "IronX/EasyXTrend",
  Period, ShowSignals,
  1,  // buffer index Signal_Trend
  1); // barra index (1 = chiusa)

Cachare il handle per performance:
  int _extHandle;

  In OnInit:
  _extHandle = iCustom(Symbol(), Period(),
    "IronX/EasyXTrend", Period, ShowSignals);

  In OnCalculate:
  double val[];
  CopyBuffer(_extHandle, 1, 0, 3, val);
  double trendValue = val[0];

### 6.2 ComBus IronX — C_IronX_ComBus (DA #109-112)

FORMATO CHIAVI COMBUS: IronX.<PRODOTTO>.<Symbol>.<TF>.<Suffisso>
  Esempio: IronX.EXT.XAUUSD.H1.Signal = 1.0

PUBBLICARE (da indicatore — usa classe C_IronX_ComBus):
  // In OnInit:
  C_IronX_ComBus::Register("EXT");

  // In OnCalculate:
  C_IronX_ComBus::Publish("Signal", BuffSignalTrade[last_confirmed]);
  C_IronX_ComBus::Publish("Trend",  BuffTrend[last_confirmed]);

LEGGERE (da Captain/consumer — usa helper function):
  // In IronX_Types.mqh:
  // string IronX_ComBusKey(string product, string suffix)
  string key = IronX_ComBusKey("EXT", "Trend");
  if(GlobalVariableCheck(key))
    double trend = GlobalVariableGet(key);

  // Oppure via classe:
  double trend = C_IronX_ComBus::Read(
    C_IronX_ComBus::BuildKey("EXT", _Symbol, _Period, "Trend"));

CLEANUP in OnDeinit:
  C_IronX_ComBus::FlushProduct("EXT");
  // Rimuove TUTTE le chiavi "IronX.EXT.*" automaticamente

MAI usare formato underscore (IronX_EXT_Trend) per ComBus.
MAI hardcodare chiavi — SEMPRE BuildKey() o IronX_ComBusKey().
MAI GlobalVariableDel singola per cleanup — SEMPRE FlushProduct().

### 6.3 EventChartCustom

Inviare evento a EA:
  EventChartCustom(ChartID(), 1001,
    signalValue, price, "IronX_Signal");

Ricevere in EA via OnChartEvent:
  void OnChartEvent(const int id, ...) {
    if(id == CHARTEVENT_CUSTOM + 1001) {
      // gestire segnale
    }
  }

## SEZIONE 7 — ALERT MQL5

Standard IronX per alert su segnale:
  if(i == rates_total - 2) {
    string msg = "IronX Long Signal — "
      + Symbol() + " " + EnumToString(Period());
    Alert(msg);
    SendNotification(msg);
    SendMail("IronX Signal", msg);
  }

## SEZIONE 8 — PATTERN CRITICI MQL5

### 8.1 Guard universale OnCalculate

if(rates_total < InpPeriod) return 0;
int start = (prev_calculated > 0)
            ? prev_calculated - 1
            : InpPeriod;

### 8.2 Normalizzazione prezzi

Sempre normalizzare prima di usare prezzi:
  double price = NormalizeDouble(
    close[rates_total-1], _Digits);
  double atr = NormalizeDouble(
    iATR(NULL, 0, 14, rates_total-1-1), _Digits);

### 8.3 Cast espliciti

Sempre usare cast espliciti:
  int bars = (int)rates_total;
  uchar alpha = (uchar)180;
  double val = (double)intValue;

MAI cast impliciti — causano warning e comportamenti inattesi

### 8.4 Prefisso versione oggetti

Includere versione nel prefisso oggetti per evitare
conflitti quando si aggiorna l'indicatore:
  "IronX_EXT_v50_MRK_" + IntegerToString((int)time[i])
  "IronX_ATS_v10_BOX_" + IntegerToString((int)time[i])

## SEZIONE 9 — CHECKLIST MT5 PRE-COMMIT

  ArraySetAsSeries=false su tutti i buffer?
  OnDeinit con ObjectsDeleteAll("IronX_")?
  Naming convention IronX su tutti gli oggetti?
  Cast espliciti ovunque — zero cast impliciti?
  NormalizeDouble su tutti i prezzi?
  prev_calculated usato per ottimizzazione?
  Segnali scritti solo su i < rates_total-1?
  GlobalVariableDel in OnDeinit?
  Compilazione 0 errors 0 warnings?
  Testato su replay storico — zero repaint?
  Testato rimozione indicatore — zero ghost objects?
  Testato con spread alto — comportamento corretto?

## SEZIONE 10 — NOBLE CLOUD IMPLEMENTAZIONE MT5

### 10.1 Architettura Dual-MA Cloud

Noble Cloud usa due MA calcolate separatamente:

  Baseline: MA lenta (default SMA 60, smoothed EMA 60)
  Kernel:   MA veloce (default SMA 20, smoothed EMA 5)
  Cloud:    fill area tra Baseline e Kernel

  Se Kernel > Baseline → Cloud BULLISH (Teal)
  Se Kernel < Baseline → Cloud BEARISH (DarkSlateBlue)

### 10.2 Buffer Layout Proposto (10 buffer)

  Buffer[0] = Baseline MA         DRAW_COLOR_LINE (visibile, dash 2px)
  Buffer[1] = Baseline Color      COLOR_MAP 0=rise 1=fall
  Buffer[2] = Kernel MA           DRAW_NONE (nascosto, per cloud calc)
  Buffer[3] = Cloud High          DRAW_FILLING (upper boundary)
  Buffer[4] = Cloud Low           DRAW_FILLING (lower boundary)
  Buffer[5] = Cloud Color         COLOR_MAP 0=bullish 1=bearish
  Buffer[6] = Signal_Cloud        DRAW_NONE (1/-1/0)
  Buffer[7] = Signal_Trade        DRAW_NONE (1/-1/0)
  Buffer[8] = Signal_Trend        DRAW_NONE (1/-1)
  Buffer[9] = Bar Color           COLOR_MAP for bar painting

### 10.3 Cloud Fill con DRAW_FILLING

  SetIndexBuffer(3, BuffCloudHigh, INDICATOR_DATA);
  SetIndexBuffer(4, BuffCloudLow, INDICATOR_DATA);
  PlotIndexSetInteger(cloud_plot, PLOT_DRAW_TYPE, DRAW_FILLING);
  PlotIndexSetInteger(cloud_plot, PLOT_COLOR_INDEXES, 2);
  PlotIndexSetInteger(cloud_plot, PLOT_LINE_COLOR, 0, clrTeal);
  PlotIndexSetInteger(cloud_plot, PLOT_LINE_COLOR, 1, C'47,79,79');

  BuffCloudHigh[i] = MathMax(baseline, kernel);
  BuffCloudLow[i]  = MathMin(baseline, kernel);
  // Color index: kernel > baseline ? 0 : 1

### 10.4 OnCalculate Pattern

  // STEP 1: Calcola Baseline MA raw
  double base_raw = IronX_MathLib::CalcMA(base_type, price, base_period, i);

  // STEP 2: Smooth Baseline (opzionale)
  double baseline = base_smooth_on ?
    IronX_MathLib::CalcMA(base_smooth_method, base_raw_buf, base_smooth_period, i) :
    base_raw;

  // STEP 3: Calcola Kernel MA raw
  double kern_raw = IronX_MathLib::CalcMA(kern_type, price, kern_period, i);

  // STEP 4: Smooth Kernel (opzionale)
  double kernel = kern_smooth_on ?
    IronX_MathLib::CalcMA(kern_smooth_method, kern_raw_buf, kern_smooth_period, i) :
    kern_raw;

  // STEP 5: Cloud state
  BuffSignalCloud[i] = (kernel > baseline) ? 1 : (kernel < baseline) ? -1 : 0;

  // STEP 6: Trend direction
  BuffSignalTrend[i] = (baseline > baseline_prev) ? 1 : -1;

  // STEP 7: Signal generation (solo barra chiusa)
  if(i < rates_total - 1) {
    // Filtro: cloud cambiata + Signal Split + Bar Min/Max
    BuffSignalTrade[i] = calcTradeSignal(i);
  }

### 10.5 11 MA Types Disponibili

Noble Cloud espone 11 MA (set NinZa standard):
  DEMA, EMA, HMA, LinReg(=LSMA), SMA, TEMA, TMA, VWMA, WMA, WilderMA(=SMMA), ZLEMA

Per IronX: esporre tutti i 17 MA di IronX_MathLib.

## SEZIONE 11 — BAR PAINTING HOLLOW/SOLID (DA #99-102)

### 11.1 Limitazione MQL5

DRAW_COLOR_CANDLES: ogni color index = intera candela (body+wick).
NON supporta outline/body separati (NT8 sì via BarBrush/CandleOutlineBrush).
PLOT_LINE_COLOR NON supporta alpha/ARGB — solo colori solidi.
Soluzione IronX: dimmed colors (blend 50% con DimGray) per simulare hollow.

### 11.2 DRAW_COLOR_CANDLES 5 Indici

  PlotIndexSetInteger(1, PLOT_COLOR_INDEXES, 5);
  PlotIndexSetInteger(1, PLOT_LINE_COLOR, 0, InpColorUp);                    // Bull Solid
  PlotIndexSetInteger(1, PLOT_LINE_COLOR, 1, InpColorDown);                  // Bear Solid
  PlotIndexSetInteger(1, PLOT_LINE_COLOR, 2, C_EXT_Visual::DimColor(InpColorUp));   // Bull Hollow
  PlotIndexSetInteger(1, PLOT_LINE_COLOR, 3, C_EXT_Visual::DimColor(InpColorDown)); // Bear Hollow
  PlotIndexSetInteger(1, PLOT_LINE_COLOR, 4, clrDimGray);                    // Flat/Doji

### 11.3 DimColor() Formula

  static color DimColor(color c) {
     uchar r = (uchar)((c) & 0xFF);
     uchar g = (uchar)((c >> 8) & 0xFF);
     uchar b = (uchar)((c >> 16) & 0xFF);
     r = (uchar)((r + 0x69) / 2);
     g = (uchar)((g + 0x69) / 2);
     b = (uchar)((b + 0x69) / 2);
     return (color)((b << 16) | (g << 8) | r);
  }

### 11.4 Trigger Logico SetBarColor

  trend == 0           → index 4 (DimGray)
  close == open (doji) → index 4 (DimGray)
  trend*barDir > 0     → aligned → index 0 (bull) o 1 (bear) = SOLID
  trend*barDir < 0     → against → index 2 (bull hollow) o 3 (bear hollow) = DIMMED
  InpBarBiasBased=false → logica semplificata: trend>0=0, trend<0=1, flat=2

### 11.5 NON TOCCARE MAI

  DimColor() blend 50% DimGray — MAI CCanvas o trasparenza per hollow
  InpBarBiasBased — MAI rimuovere
  Doji SEMPRE DimGray — MAI colorare
  Candle colors da InpColorUp/InpColorDown — MAI hardcodare

## SEZIONE 12 — MA-SLOPE FORMULA MQL5 (DA #124-131)

### 12.1 EXT v2.0 LIGHT Integration (3 params gate)

Slope Filter LIGHT integrato nei Precision Filters di EXT v2.0.
Posizione: DOPO PCF, PRIMA di MTF Confirm (nella catena ValidateSignal).

Parametri:
  input bool  InpSlopeEnabled    = false;  // Slope Filter ON/OFF
  input int   InpSlopeLookback   = 5;      // Slope lookback bars
  input int   InpSlopeThreshold  = 120;    // Slope minimum threshold (×1000)

Formula nel loop OnCalculate:
  // Calcola ninZaATR gapless (H-L only, smoothed EMA)
  double gaplessATR = BuffIronATR[i];  // già calcolato da EXT Engine

  // Calcola slope normalizzata
  if(i >= InpSlopeLookback && gaplessATR > 0) {
    double rawSlope = (BuffSmoothedMA[i] - BuffSmoothedMA[i - InpSlopeLookback])
                      / InpSlopeLookback / gaplessATR * 1000.0;

    // Gate: segnale valido SOLO se slope abbastanza forte
    if(InpSlopeEnabled && MathAbs(rawSlope) < InpSlopeThreshold)
      signal = 0;  // filtra segnale debole
  }

REGOLE CRITICHE:
  - DA #25: Slope SOLO TF, MAI scalping (WR 21.3% verificato) — NON NEGOZIABILE
  - PCF e Slope sono COMPLEMENTARI (DA #127): PCF=1-bar noise, Slope=N-bar strength
  - ninZaATR = Gapless (H-L only) — MAI True Range con gap
  - ×1000 per integer-scale readability (valori tipici ±50-300)
  - Threshold default ±120 (NINZA DIRETTA da property panels)
  - Lookback default 5 (NINZA DIRETTA da property panels)

### 12.2 ValidateInputs() per Slope LIGHT (DA #118-123)

  // Dentro ValidateInputs():
  if(InpSlopeEnabled) {
    if(InpSlopeLookback <= 0) {
      PrintFormat("EXT CRITICAL: InpSlopeLookback=%d invalid (min=1)", InpSlopeLookback);
      valid = false;
    }
    if(InpSlopeThreshold <= 0) {
      PrintFormat("EXT WARNING: InpSlopeThreshold=%d. Slope filter disabled at 0.", InpSlopeThreshold);
    }
  }

### 12.3 Choppiness Index (CI) MQL5 Implementation (DA #132-140)

CI = 100 × LOG10(SUM(ATR,N) / (MaxHigh - MinLow)) / LOG10(N)

**Integration Pattern:**

```cpp
// In OnInit:
int InpCIPeriod = 14;        // default, Fibonacci
int InpCIThreshold = 618;     // ×10 for integer (61.8 == 618)

// Validation (ValidateInputs):
if(InpCIPeriod < 2) {
  PrintFormat("PROD CRITICAL: InpCIPeriod=%d < 2 (LOG10 domain)", InpCIPeriod);
  return false;
}

// In OnCalculate loop (AFTER Slope, BEFORE signal_count):
if(i >= InpCIPeriod) {
  double sumATR = 0;
  double maxH = high[i], minL = low[i];

  // Calculate SUM(ATR, period)
  for(int j = 0; j < InpCIPeriod; j++) {
    sumATR += BuffIronATR[i-j];  // gapless ATR buffer
    maxH = MathMax(maxH, high[i-j]);
    minL = MathMin(minL, low[i-j]);
  }

  double range = maxH - minL;
  if(range > 0 && sumATR > 0) {
    double ci_raw = MathLog10(sumATR / range) / MathLog10((double)InpCIPeriod);
    double ci = 100 * ci_raw;

    // Gate signal if laterality detected
    if(MathAbs(ci) > (double)InpCIThreshold / 10.0)
      signal = 0;  // lateral market, no signal
  }
}
```

**Key Rules:**
- Uses gapless_atr_buf[] (already in EXT Engine, don't recalculate)
- MathLog10() support verified in MQL5 docs
- Guard: range > 0 AND atr > 0 (divisione per zero)
- InpCIPeriod >= 2 CRITICAL, verified in ValidateInputs
- Applied AFTER Slope in ValidateSignal chain

### 12.4 IronX MA-Slope v1.0 FULL (futuro L1 separato)

Quando si sviluppa il prodotto FULL:
  - Sub-window indicator con DRAW_COLOR_HISTOGRAM (4 colori)
  - 4-state hysteresis: UptrendStart=+120, UptrendEnd=-60, DowntrendStart=-120, DowntrendEnd=+60
  - Signal_Trade 6 valori: ±1=TrendStart, ±2=Slowdown, ±3=Resume
  - Signal_State 4 valori: ±2=Strong, ±1=Weak
  - ResumingSlowdownSplit = 5 bars per distinguere Slowdown da Resume
  - LinReg smoothing period 2 (per SMOOTHING slope, NON per calcolo raw)
  - Background painting standard (LimeGreen/HotPink, DA #103-108)
  - Bar painting standard (DodgerBlue/DeepPink, DA #99-102)
  - ComBus: IronX.MASLOPE.{Symbol}.{TF}.Status/Slope/Trend/Signal/State
  - Signal Adapter: IRONX_IND_MA_SLOPE, ±2=Slowdown (WARNING), ±3=Resume
  - Ricerca completa: MA_Slope_RESEARCH_COMPLETA.md

IronXCharts © Luke SteelWolf — marzo 2026