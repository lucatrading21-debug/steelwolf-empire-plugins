---
description: Comunicazione inter-prodotti e architettura confluenza per l'IronX Ecosystem. Attivare quando si progetta o implementa la comunicazione tra indicatori IronX, il sistema ComBus, o l'integrazione con Captain IronX. Contiene pattern ComBus per NT8 MT5 TV, architettura confluenza multi-prodotto, gestione segnali condivisi, e gerarchia prodotti IronX.
---

# IRONX CONFLUENCE — COMUNICAZIONE INTER-PRODOTTI

## REGOLA FONDAMENTALE
Ogni prodotto IronX è autonomo e funziona standalone.
La confluenza è un livello opzionale che potenzia i prodotti
ma non è mai una dipendenza obbligatoria.

Captain IronX è l'unico orchestratore.
Gli indicatori non comunicano direttamente tra loro —
passano sempre attraverso i buffer o il ComBus.

## SEZIONE 1 — ARCHITETTURA CONFLUENZA

### 1.1 Gerarchia prodotti IronX

  LAYER 0 — Dati di mercato
    Barre, OHLCV, tick, volume

  LAYER 1 — Indicatori base
    Easy X Trend    → trend direction + segnali
    X-ATR Shield    → TP/SL/ATR/trailing
    IronX Stats     → performance analytics

  LAYER 2 — Orchestratore
    Captain IronX   → legge Layer 1 e decide

  LAYER 3 — Esecuzione
    Ordini su broker via Captain

### 1.2 Flusso dati standard

  Easy X Trend calcola → scrive Buffer[0-17] (18 buffer)
  X-ATR Shield calcola → scrive Buffer[0-13] (14 buffer)
  Captain IronX legge  → Buffer di entrambi
  Captain decide       → entra/esce/gestisce

### 1.3 Principio di indipendenza

Easy X Trend funziona senza Captain
X-ATR Shield funziona senza Captain
Captain NON funziona senza Easy X Trend
Captain NON funziona senza X-ATR Shield

## SEZIONE 2 — COMBUS NT8

### 2.1 Formato Chiavi ComBus NT8 (DA #109)

Formato CANONICO per TUTTE le piattaforme:
  IronX.<PRODOTTO>.<Symbol>.<TF>.<Suffisso>

NT8 NinjaScript C# — GlobalVariable:
  Scrittura:
    GlobalVariable.Set("IronX.EXT." + Instrument.FullName + "." +
      BarsPeriod.ToString() + ".Trend", trendValue);

  Lettura:
    if(GlobalVariable.Exists("IronX.EXT." + Instrument.FullName + "." +
       BarsPeriod.ToString() + ".Trend"))
      double trend = GlobalVariable.Get("IronX.EXT." + ...);

Nota: NT8 GlobalVariable ha lo stesso concetto di MT5
ma la sintassi è diversa (metodo su oggetto vs funzione globale).

### 2.2 iCustom — lettura buffer diretta NT8

Alternativa a GlobalVariable — più affidabile per same-chart:

  var ext = EasyXTrend(Close, Period, ShowSig);
  double trend    = ext.Signal_Trend[0];
  double signal   = ext.Signal_Trade[0];

Oppure via nome stringa:
  double trend = Indicator(
    "EasyXTrend", Period, ShowSig)
    (Close)[1][0];

### 2.3 EventChartCustom NT8

Inviare evento:
  if (trendChanged) {
    ChartControl.Dispatcher.InvokeAsync(() => {
      OnRenderTargetChanged();
    });
  }

## SEZIONE 3 — COMBUS MT5

### 3.1 C_IronX_ComBus — Wrapper Ufficiale MT5

IronX usa la classe C_IronX_ComBus (IronX_ComBus.mqh)
che genera automaticamente chiavi nel formato corretto.

Registrazione in OnInit:
  C_IronX_ComBus::Register("EXT");
  // Crea automaticamente IronX.EXT.{Symbol}.{TF}.Status = 1.0

Pubblicazione in OnCalculate:
  C_IronX_ComBus::Publish("Signal", BuffSignalTrade[last_confirmed]);
  C_IronX_ComBus::Publish("Trend",  BuffTrend[last_confirmed]);
  C_IronX_ComBus::Publish("Line",   BuffLine[last_confirmed]);
  C_IronX_ComBus::Publish("ATR",    BuffCalcATR[last_confirmed]);
  // Genera: IronX.EXT.XAUUSD.H1.Signal = 1.0 (esempio)

Lettura da Captain EA (via helper function):
  string key = IronX_ComBusKey("EXT", "Trend");
  // Restituisce: "IronX.EXT.XAUUSD.H1.Trend"
  double trend = 0;
  if(GlobalVariableCheck(key))
    trend = GlobalVariableGet(key);

  Oppure via classe:
  double trend = C_IronX_ComBus::Read(
    C_IronX_ComBus::BuildKey("EXT", _Symbol, _Period, "Trend"));

Cleanup in OnDeinit:
  C_IronX_ComBus::FlushProduct("EXT");
  // Rimuove TUTTE le chiavi con prefisso "IronX.EXT."

### 3.1b Helper Function IronX_ComBusKey (DA #112)

  In IronX_Types.mqh — convenience per lettura senza classe:

  string IronX_ComBusKey(string product, string suffix) {
    return StringFormat("%s%s.%s.%s.%s", IRONX_GV_PREFIX, product,
                        _Symbol, IronX_GetTFName(_Period), suffix);
  }

  Uso tipico in Captain IronX / consumer:
    string k = IronX_ComBusKey("EXT", "Signal");
    if(GlobalVariableCheck(k))
      double sig = GlobalVariableGet(k);

### 3.1c DISTINZIONE CRITICA: ComBus vs State Persistence

  ComBus Signal Keys (IPC inter-prodotto):
    Formato: IronX.<Prod>.<Symbol>.<TF>.<Key> (dot notation)
    Scope: cross-chart, tutti i prodotti
    Update: ogni barra confermata
    Classe: C_IronX_ComBus

  State Persistence (restart recovery per-trade):
    Formato: <prefix>_<KEY> (underscore notation)
    Scope: singola istanza, per-trade
    Update: per tick
    Funzione: GlobalVariableSet/Get dirette

  MAI confondere i due sistemi.
  ComBus = comunicazione. State = persistenza.

### 3.2 iCustom handle MT5

Più efficiente di GlobalVariable per buffer:

  In OnInit:
  int _extHandle = iCustom(
    Symbol(), Period(),
    "IronX/EasyXTrend",
    InpPeriod, InpShowSig);

  In OnTick o OnCalculate:
  double trendBuf[];
  ArraySetAsSeries(trendBuf, true);
  CopyBuffer(_extHandle, 1, 0, 3, trendBuf);
  double trend = trendBuf[1]; // barra chiusa

  double signalBuf[];
  ArraySetAsSeries(signalBuf, true);
  CopyBuffer(_extHandle, 2, 0, 3, signalBuf);
  double signal = signalBuf[1];

### 3.3 EventChartCustom MT5

Inviare evento da indicatore a EA:
  EventChartCustom(ChartID(),
    1001,           // event id
    trendValue,     // lparam
    signalPrice,    // dparam
    "IronX_Trend"); // sparam

Ricevere in EA:
  void OnChartEvent(
    const int id,
    const long &lparam,
    const double &dparam,
    const string &sparam) {

    if(id == CHARTEVENT_CUSTOM + 1001) {
      double trend  = (double)lparam;
      double price  = dparam;
      string source = sparam;
      // gestire il segnale
    }
  }

## SEZIONE 4 — CONFLUENZA TRADINGVIEW

### 4.1 Limitazione TV

TradingView NON supporta comunicazione
diretta tra indicatori. Non esiste ComBus in TV.

Alternativa — tutto in uno script:
  Includere la logica di più indicatori
  in un singolo script TV quando serve confluenza.

Alternativa — input manuale:
  input.source() per collegare output
  di un indicatore come input di un altro.

### 4.2 Pattern confluenza TV

Leggere output di altro indicatore via input:
  float extTrend = input.source(
    close, "EasyXTrend Signal Trend")

Nota: richiede che l'utente selezioni
manualmente il plot dell'indicatore.

### 4.3 Confluenza via request.security

Simulare confluenza MTF:
  float h1Trend = request.security(
    syminfo.tickerid, "60",
    ta.ema(close, 14) > ta.ema(close, 14)[1]
      ? 1.0 : -1.0,
    lookahead=barmerge.lookahead_off)

## SEZIONE 5 — LOGICA CONFLUENZA CAPTAIN

### 5.1 Condizioni entrata Captain

Long entry — condizioni Captain Optimus (NINZA DIRETTA decompilato):
  EXT Signal_Trade  == 1    segnale Long da EXT
  EXT Signal_Trend  == 1    trend Bull confermato
  ATS StopLoss      > 0     ATRShield attivo
  Session attiva             filtro sessione di trading
  Bar Direction aligned      bar direction == trend
  Bar Age 0-10               barra giovane (max 10 barre dal cambio)
  Unanimity                  tutti gli indicatori concordano
  Min Consensus Bars         consenso mantenuto per N barre

Short entry — condizioni invertite simmetriche.

NOTA: COS (Change of State) è un MARKER ESCLUSIVO Captain Optimus L3.
  COS testo: "⮙ + COS" (bull) / "COS + ⮛" (bear)
  COS font: Arial 20px, colori MarkerBrushBullish/Bearish
  Trigger: consensus unanimity + direction change (SyncSignal)
  Fonte: Captain Optimus decompilato righe 1306-1312
  COS NON è un buffer di EXT — è un marker visivo di Captain

### 5.2 Gestione posizione Captain

Stop loss dinamico da ATRShield via ComBus:
  string kSL = IronX_ComBusKey("ATRS", "SL1");
  double sl1 = GlobalVariableCheck(kSL) ? GlobalVariableGet(kSL) : 0;
  sl = entryPrice - sl1  (Long)
  sl = entryPrice + sl1  (Short)

Take profit da ATRShield via ComBus:
  string kTP = IronX_ComBusKey("ATRS", "TP1");
  double tp1 = GlobalVariableCheck(kTP) ? GlobalVariableGet(kTP) : 0;
  tp = entryPrice + tp1  (Long)
  tp = entryPrice - tp1  (Short)

Trailing/BE da ATRShield via ComBus:
  string kBE = IronX_ComBusKey("ATRS", "BE_Stage");
  double be_stage = GlobalVariableCheck(kBE) ? GlobalVariableGet(kBE) : 0;

### 5.3 Uscita anticipata Captain

Uscita se trend cambia contro posizione:
  Long aperta + EXT Signal_Trend diventa -1
  → chiudere posizione immediatamente

Uscita se ThunderZilla Slowdown:
  Long aperta + TZ Signal_Trade == 2 (Slowdown)
  → considerare uscita parziale (TZ 2/-2 = EXIT WARNING)

Uscita se MagnetOsc contraddice:
  Long aperta + MAOSC momentum diventa bearish
  → considerare riduzione posizione

## SEZIONE 6 — STANDARD COMBUS KEYS DEFINITIVO (DA #109-112)

### 6.1 Formato Canonico — REGOLA UNIVERSALE IRONX

  IronX.<PRODOTTO>.<Symbol>.<TF>.<Suffisso>

  Componenti:
    IronX.     = prefisso fisso (IRONX_GV_PREFIX in IronX_Types.mqh)
    PRODOTTO   = codice breve univoco (EXT, ATRS, MAOSC, ecc.)
    Symbol     = _Symbol runtime (es. XAUUSD, BTCUSD)
    TF         = IronX_GetTFName(_Period) (es. H1, M15, D1)
    Suffisso   = tipo dato (Signal, Trend, ATR, ecc.)

  Implementazione: C_IronX_ComBus::BuildKey() in IronX_ComBus.mqh
  Helper: IronX_ComBusKey(product, suffix) in IronX_Types.mqh

  MAI usare formato underscore IronX_EXT_Trend per ComBus.
  MAI omettere Symbol e TF dalla chiave.
  MAI hardcodare chiavi ComBus — SEMPRE usare BuildKey o helper.

### 6.2 Mappa Completa Prodotti ATTIVI (verificati da codice)

  EXT (Easy X Trend v2.0):
    IronX.EXT.{Symbol}.{TF}.Status       1.0 (attivo)
    IronX.EXT.{Symbol}.{TF}.Signal       Signal_Trade (0/1/-1/2/-2)
    IronX.EXT.{Symbol}.{TF}.Trend        Signal_Trend (1/-1/0)
    IronX.EXT.{Symbol}.{TF}.Line         MA Line value (double)
    IronX.EXT.{Symbol}.{TF}.ATR          ATR value (double)

  ATRS (ATR TradeShield v10.0):
    IronX.ATRS.{Symbol}.{TF}.Status      1.0 (attivo)
    IronX.ATRS.{Symbol}.{TF}.ATR         ATR corrente (double)
    IronX.ATRS.{Symbol}.{TF}.SL1         Stop Loss livello 1
    IronX.ATRS.{Symbol}.{TF}.TP1         Take Profit livello 1
    IronX.ATRS.{Symbol}.{TF}.BE_Stage    Break Even stage (int)
    IronX.ATRS.{Symbol}.{TF}.R_Multiple  R-Multiple corrente

  MAOSC (MagnetOsc v1.0):
    IronX.MAOSC.{Symbol}.{TF}.Status     1.0 (attivo)
    IronX.MAOSC.{Symbol}.{TF}.Signal     Signal (0/1/-1/2/-2)
    IronX.MAOSC.{Symbol}.{TF}.LTF_Osc   Oscillatore LTF
    IronX.MAOSC.{Symbol}.{TF}.HTF_Osc   Oscillatore HTF

  XATR (IronX-ATR v1.0):
    IronX.XATR.{Symbol}.{TF}.Status      1.0 (attivo)
    IronX.XATR.{Symbol}.{TF}.ATR         Smoothed ATR
    IronX.XATR.{Symbol}.{TF}.RawTR       Raw True Range

  RENKO (IronXRenko v1.0):
    IronX.RENKO.{Symbol}.{TF}.Status     1.0 (attivo)
    IronX.RENKO.{Symbol}.{TF}.Heartbeat  TimeCurrent (double)

### 6.3 Mappa Prodotti FUTURI (suffissi previsti da ricerca)

  NC (Noble Cloud):
    IronX.NC.{Symbol}.{TF}.Status         1.0 (attivo)
    IronX.NC.{Symbol}.{TF}.Signal_Cloud   Cloud state (1/-1/0)
    IronX.NC.{Symbol}.{TF}.Signal_Trade   Entry signal (1/-1/0)
    IronX.NC.{Symbol}.{TF}.Signal_Trend   Baseline direction (1/-1)
    IronX.NC.{Symbol}.{TF}.Baseline       Baseline MA value

  TZ (ThunderZilla):
    IronX.TZ.{Symbol}.{TF}.Status         1.0 (attivo)
    IronX.TZ.{Symbol}.{TF}.Signal         Signal_Trade (0/1/-1/2/-2/3/-3/4/-4)
    IronX.TZ.{Symbol}.{TF}.Trend          Trend (1/-1/0)
    IronX.TZ.{Symbol}.{TF}.Momentum       Momentum score

  FZ (Fibonacci Zone):
    IronX.FZ.{Symbol}.{TF}.Status         1.0 (attivo)
    IronX.FZ.{Symbol}.{TF}.Signal         Signal (1/-1/0)
    IronX.FZ.{Symbol}.{TF}.Zone_High      Fibonacci zone high
    IronX.FZ.{Symbol}.{TF}.Zone_Low       Fibonacci zone low

  TR (Trio Reversal):
    IronX.TR.{Symbol}.{TF}.Status         1.0 (attivo)
    IronX.TR.{Symbol}.{TF}.Signal_State   Reversal state
    IronX.TR.{Symbol}.{TF}.ATR            ATR-based value
    IronX.TR.{Symbol}.{TF}.Reversal_Dir   Direzione reversal

  BOB (Bo$$ Order Block):
    IronX.BOB.{Symbol}.{TF}.Status        1.0 (attivo)
    IronX.BOB.{Symbol}.{TF}.Signal        OB signal (1/-1/0)
    IronX.BOB.{Symbol}.{TF}.OB_High       Order block high
    IronX.BOB.{Symbol}.{TF}.OB_Low        Order block low
    IronX.BOB.{Symbol}.{TF}.FVG_Flag      FVG detected (1/0)

  CPT (Captain IronX):
    IronX.CPT.{Symbol}.{TF}.Status        1.0 (attivo)
    IronX.CPT.{Symbol}.{TF}.State         0=flat 1=long -1=short
    IronX.CPT.{Symbol}.{TF}.LastEntry     Prezzo ultimo ingresso
    IronX.CPT.{Symbol}.{TF}.R_Multiple    R-Multiple corrente
    IronX.CPT.{Symbol}.{TF}.Consensus     Consensus score

### 6.4 Forward-Compatibility ComBus v2.0

  ComBus v2.0 estende il formato con metadata one-time:
    IronX.<PRODOTTO>.<Symbol>.<TF>.Config.<Campo>

  Esempio:
    IronX.EXT.XAUUSD.H1.Config.Period = 14
    IronX.EXT.XAUUSD.H1.Config.MAType = 1
    IronX.EXT.XAUUSD.H1.Config.Version = 200

  Il formato base v1.1 (Signal Keys) resta invariato.
  Config Keys hanno un segmento extra — mai ambigue.
  Documentazione completa: TASK_9_COMBUS_V2_PROTOCOL.md

### 6.5 Regole Codice ComBus — NON DEROGABILI

  PUBLISH: usare SEMPRE C_IronX_ComBus::Publish(suffix, value)
  READ: usare IronX_ComBusKey(product, suffix) o BuildKey()
  CLEANUP: FlushProduct() in OnDeinit — MAI GlobalVariableDel singole
  STATUS: Register() crea automaticamente la chiave Status
  SUFFISSI: esatti come documentati in §6.2/6.3 — MAI inventare
  FORMATO: dot notation con Symbol e TF — MAI underscore
  CASE: suffissi CamelCase (Signal_Trade, BE_Stage) — MAI lowercase

## SEZIONE 7 — CHECKLIST CONFLUENZA PRE-COMMIT

  Ogni prodotto funziona standalone senza Captain?
  ComBus Keys formato IronX.<PROD>.<Symbol>.<TF>.<Suffix>?
  MAI underscore (IronX_EXT_Trend) per ComBus — SEMPRE dot notation?
  Register() chiamato in OnInit con codice prodotto corretto?
  FlushProduct() chiamato in OnDeinit per cleanup automatico?
  Publish() usa solo suffissi documentati in §6.2/6.3?
  Consumer usa IronX_ComBusKey() o BuildKey() — MAI chiavi hardcoded?
  GlobalVariableCheck() prima di ogni GlobalVariableGet()?
  iCustom handle cachato in OnInit?
  Lettura buffer su barra chiusa [1] non [0]?
  TV: confluenza gestita con input.source() o mega-script?
  Testato standalone — ogni prodotto funziona da solo?
  Testato confluenza — Captain riceve dati corretti via ComBus?
  Testato multi-instance — chiavi diverse per ogni Symbol/TF?

## SEZIONE 8 — NOBLE CLOUD NELLA CONFLUENZA

### 8.1 Ruolo Noble Cloud

Noble Cloud è un CONFIRMATION LAYER (Livello 1C):
  LAYER 1  — Easy X Trend (direzione trend)
  LAYER 1C — Noble Cloud (CONFERMA zona)
  LAYER 1B — MagnetOsc (timing momentum)
  LAYER 2  — ATR TradeShield (risk management)
  LAYER 3  — Captain IronX (orchestrazione)

### 8.2 ComBus Noble Cloud

  IronX.NC.{Symbol}.{TF}.Signal_Cloud   1/-1/0 stato cloud
  IronX.NC.{Symbol}.{TF}.Signal_Trade   1/-1/0 entry signal
  IronX.NC.{Symbol}.{TF}.Signal_Trend   1/-1 direzione baseline
  IronX.NC.{Symbol}.{TF}.Baseline       valore baseline MA

### 8.3 Confluenza EXT + Noble Cloud per Captain

Captain legge ENTRAMBI via iCustom/CopyBuffer:

  EXT_Trend  = CopyBuffer(hEXT, BuffTrend)
  NC_Cloud   = CopyBuffer(hNC, 2)  // Signal_Cloud
  NC_Trend   = CopyBuffer(hNC, 1)  // Signal_Trend

  Allineamento:
    3/3 = EXT_Trend == NC_Cloud == NC_Trend → STRONG
    2/3 = EXT_Trend == NC_Cloud → MEDIUM
    1/3 o meno → BLOCKED — stare fuori dal mercato

### 8.4 Noble Cloud + Easy Trend Entry Protocol

  Confluenza RICHIESTA per entry:
    1. Easy Trend Signal_Trade pullback (2/-2) presente
    2. Noble Cloud Signal_Cloud aligned (stessa direzione)
    3. Noble Cloud Signal_Trend aligned (opzionale, bonus)

  Se Easy Trend e Noble Cloud CONFLITTUALI:
    → Signal INVALIDO — "stare out of market" [regola NinZa]

### 8.5 Noble Cloud è UNICO

Noble Cloud ha 3 buffer signal separati, non uno. Captain DEVE:
  1. Leggere 3 buffer via CopyBuffer separati (indici 1, 2, 3)
  2. Usare EncodeNobleCloud() prima di Signal Adapter Translate
  3. NON trattare Noble Cloud come gli altri indicatori (singolo Signal_Trade)

IronXCharts © Luke SteelWolf — marzo 2026