---
description: Sistema alert cross-platform per l'IronX Ecosystem. Attivare quando si implementa un sistema di notifiche su NT8 MT5 o TradingView. Contiene pattern alert per ogni piattaforma, regole anti-spam, messaggi standard IronX, integrazione webhook, priorità e gestione sonora, e tutti i pattern verificati per alert senza falsi positivi.
---

# IRONX ALERTS — SISTEMA ALERT CROSS-PLATFORM

## REGOLA FONDAMENTALE
Un alert IronX viene emesso SOLO su barra chiusa confermata.
Mai su barra aperta. Mai su tick intermedi.
Un alert falso è peggio di nessun alert.

## SEZIONE 1 — REGOLE UNIVERSALI ALERT IRONX

REGOLA 1: Solo su barra chiusa
  NT8: if (IsFirstTickOfBar) Alert(...)
  MT5: if (i == rates_total - 2) Alert(...)
  TV:  alertcondition(cond and barstate.isconfirmed)

REGOLA 2: Anti-spam — una volta per segnale
  Usare flag per evitare alert multipli sullo stesso segnale
  Resettare il flag solo al segnale opposto

REGOLA 3: Messaggio standard IronX
  Formato: "[PRODOTTO] [DIREZIONE] — [SIMBOLO] [TIMEFRAME]"
  Esempio: "IronX Long Signal — XAUUSD H1"
  Esempio: "IronX Short Signal — NQ M15"

REGOLA 4: Priorità coerente
  Segnale Trade confermato → priorità Alta
  Cambio trend → priorità Media
  Alert informativo → priorità Bassa

## SEZIONE 2 — ALERT NT8

### 2.1 Pattern base NT8

if (IsFirstTickOfBar && signalLong) {
  Alert(
    "IronX_Signal_Long_" + CurrentBar,
    Priority.High,
    "IronX Long Signal — "
      + Instrument.FullName + " "
      + BarsPeriod.ToString(),
    NinjaTrader.Core.Globals.InstallDir
      + @"\sounds\Alert1.wav",
    10,
    Brushes.Cyan,
    Brushes.Black);
}

### 2.2 Anti-spam NT8

private bool _lastAlertWasLong = false;

in OnBarUpdate:
if (IsFirstTickOfBar) {
  if (signalLong && !_lastAlertWasLong) {
    Alert(...);
    _lastAlertWasLong = true;
  }
  if (signalShort && _lastAlertWasLong) {
    Alert(...);
    _lastAlertWasLong = false;
  }
}

### 2.3 Suoni NT8

File suoni in:
  NinjaTrader.Core.Globals.InstallDir + @"\sounds\"

File disponibili default:
  Alert1.wav  Alert2.wav  Alert3.wav
  Alert4.wav  Alert5.wav

Suono custom:
  PlaySound(@"C:\Sounds\IronX_Long.wav");

### 2.4 Priorità NT8

Priority.High    → popup immediato
Priority.Medium  → popup normale
Priority.Low     → solo log

## SEZIONE 3 — ALERT MT5

### 3.1 Pattern base MT5

Alert su barra appena chiusa (i == rates_total - 2):
  if(i == rates_total - 2 && signalLong) {
    string msg = "IronX Long Signal — "
      + Symbol() + " "
      + EnumToString((ENUM_TIMEFRAMES)Period());
    Alert(msg);
    SendNotification(msg);
    SendMail("IronX Signal", msg);
    PlaySound("alert.wav");
  }

### 3.2 Anti-spam MT5

static bool lastAlertWasLong = false;

if(i == rates_total - 2) {
  if(signalLong && !lastAlertWasLong) {
    Alert("IronX Long — " + Symbol());
    lastAlertWasLong = true;
  }
  if(signalShort && lastAlertWasLong) {
    Alert("IronX Short — " + Symbol());
    lastAlertWasLong = false;
  }
}

### 3.3 Canali alert MT5

Alert()               → popup su MT5 desktop
SendNotification()    → push su app MT5 mobile
SendMail()            → email via MT5 SMTP
PlaySound()           → suono locale

Abilitare notifiche mobile in MT5:
  Tools → Options → Notifications
  Inserire MetaQuotes ID

### 3.4 Timeframe string MT5

EnumToString((ENUM_TIMEFRAMES)Period())
Restituisce: "PERIOD_M1" "PERIOD_H1" ecc.

Versione leggibile:
  string tfName = "";
  switch(Period()) {
    case PERIOD_M1:  tfName = "M1";  break;
    case PERIOD_M5:  tfName = "M5";  break;
    case PERIOD_M15: tfName = "M15"; break;
    case PERIOD_M30: tfName = "M30"; break;
    case PERIOD_H1:  tfName = "H1";  break;
    case PERIOD_H4:  tfName = "H4";  break;
    case PERIOD_D1:  tfName = "D1";  break;
  }

## SEZIONE 4 — ALERT TRADINGVIEW

### 4.1 alertcondition — dichiarativo

Dichiarare in cima allo script:
  alertcondition(
      longSignal and barstate.isconfirmed,
      title="IronX Long Signal",
      message="IronX Long — {{ticker}} {{interval}}")

  alertcondition(
      shortSignal and barstate.isconfirmed,
      title="IronX Short Signal",
      message="IronX Short — {{ticker}} {{interval}}")

  alertcondition(
      trendChange and barstate.isconfirmed,
      title="IronX Trend Change",
      message="IronX Trend Change — {{ticker}} {{interval}} — Close: {{close}}")

### 4.2 alert() — programmatico

if barstate.isconfirmed
    if longSignal
        alert(
            "IronX Long: " + syminfo.ticker
              + " " + timeframe.period
              + " Close: " + str.tostring(close),
            alert.freq_once_per_bar_close)

Frequenze:
  alert.freq_once_per_bar        una per barra aperta
  alert.freq_once_per_bar_close  una per barra chiusa
  alert.freq_all                 ogni tick — MAI usare

### 4.3 Placeholder messaggio TV

  {{ticker}}    simbolo es XAUUSD
  {{interval}}  timeframe es 60
  {{close}}     prezzo close
  {{open}}      prezzo open
  {{high}}      prezzo high
  {{low}}       prezzo low
  {{volume}}    volume
  {{time}}      timestamp Unix
  {{exchange}}  exchange

### 4.4 Webhook TV — integrazione broker

Messaggio JSON per webhook:
  message="{ \"action\": \"long\",
    \"symbol\": \"{{ticker}}\",
    \"price\": {{close}},
    \"timeframe\": \"{{interval}}\" }"

Usato per automazione via:
  3Commas, Alertatron, TradingConnector, WunderTrading

## SEZIONE 5 — MESSAGGI STANDARD IRONX

### 5.1 Formato messaggio

LONG:
  "IronX Long Signal — [SIMBOLO] [TIMEFRAME]"
  "IronX Long Signal — XAUUSD H1"
  "IronX Long Signal — NQ M15"

SHORT:
  "IronX Short Signal — [SIMBOLO] [TIMEFRAME]"

TREND CHANGE:
  "IronX Trend Bull — [SIMBOLO] [TIMEFRAME]"
  "IronX Trend Bear — [SIMBOLO] [TIMEFRAME]"

PULLBACK:
  "IronX Pullback Buy — [SIMBOLO] [TIMEFRAME]"
  "IronX Pullback Sell — [SIMBOLO] [TIMEFRAME]"

CAPTAIN COS (solo Captain IronX L3):
  "Captain COS Long — [SIMBOLO] [TIMEFRAME]"
  "Captain COS Short — [SIMBOLO] [TIMEFRAME]"

INFORMATIVO:
  "IronX [PRODOTTO] — [SIMBOLO] — [MESSAGGIO]"

### 5.2 Asset name standard

  XAUUSD  = "Gold"
  XAGUSD  = "Silver"
  BTCUSD  = "Bitcoin"
  ETHUSD  = "Ethereum"
  NQ      = "Nasdaq Futures"
  US30    = "Dow Jones"
  US500   = "S&P 500"
  MNQ     = "Micro Nasdaq"

## SEZIONE 6 — INTEGRAZIONE CON CAPTAIN IRONX

Captain IronX riceve segnali dai buffer (non da alert).
Gli alert sono per il TRADER — non per Captain.

Alert → notifica umana
Buffer Signal_Trade → input per Captain

Flusso corretto:
  Indicatore calcola segnale su barra chiusa
  → Scrive su Buffer[2] Signal_Trade
  → Emette alert per il trader
  → Captain legge Buffer[2] indipendentemente

## SEZIONE 7 — CHECKLIST ALERT PRE-COMMIT

  Alert emesso solo su barra chiusa?
  NT8: IsFirstTickOfBar check presente?
  MT5: i == rates_total-2 usato?
  TV: barstate.isconfirmed in alertcondition?
  Anti-spam flag implementato?
  Messaggio segue formato standard IronX?
  Tutti i canali attivati (popup+push+email)?
  Webhook JSON valido se usato?
  Testato — alert non scatta su tick intermedi?
  Testato — alert non si ripete sullo stesso segnale?

IronXCharts © Luke SteelWolf — marzo 2026