---
description: Checklist qualità e standard di testing per l'IronX Ecosystem. Attivare prima di ogni commit o rilascio di un prodotto IronX. Contiene checklist pre-commit per NT8 MT5 TV, standard zero-ghost, zero-repaint, zero-warning, procedure di testing su storico e realtime, e criteri di accettazione per ogni prodotto.
---

# IRONX QUALITY — STANDARD QUALITÀ E TESTING

## REGOLA FONDAMENTALE
Nessun codice IronX viene committato o rilasciato
senza aver superato questa checklist completa.
Zero errori. Zero warning. Zero compromessi.
La qualità non è negoziabile nell'IronX Ecosystem.

## SEZIONE 1 — CRITERI DI ACCETTAZIONE UNIVERSALI

Ogni prodotto IronX deve soddisfare TUTTI questi criteri
prima di essere considerato production-ready:

COMPILAZIONE:
  0 errors
  0 warnings
  0 hint ignorati senza motivazione documentata

ANTI-REPAINT:
  Segnali non si spostano su replay storico
  Segnali non cambiano dopo chiusura barra
  Nessun segnale su barra aperta

OGGETTI GRAFICI:
  Zero ghost objects dopo rimozione indicatore
  Zero ghost objects dopo cambio simbolo
  Zero ghost objects dopo cambio timeframe
  Zero flash o tremolii durante aggiornamento

PERFORMANCE:
  NT8 OnBarUpdate meno di 5ms su 1000 barre
  NT8 OnRender meno di 2ms
  MT5 OnCalculate meno di 10ms su 1000 barre
  TV nessun timeout su storico lungo

BUFFER:
  Layout standard IronX rispettato [0-5]
  Valori corretti su ogni barra storica
  Valori corretti su barra realtime
  Reset corretto su cambio simbolo

DOCUMENTAZIONE:
  CLAUDE.md aggiornato con stato attuale
  NON TOCCARE MAI aggiornato se necessario
  Header IronXCharts presente in ogni file
  Commit message segue standard IronX

## SEZIONE 2 — CHECKLIST NT8 PRE-COMMIT

STRUTTURA CODICE:
  Calculate = Calculate.OnBarClose impostato?
  BarsRequiredToPlot impostato correttamente?
  Guard if (CurrentBar < BarsRequiredToPlot) return presente?
  Guard if (BarsInProgress != 0) return presente?
  Tutti i brush creati in DataLoaded?
  Brush.Freeze() su OGNI brush?
  MAI new() in OnBarUpdate?
  MAI LINQ in OnBarUpdate?
  OnTermination implementato con RemoveDrawObjects?

OGGETTI GRAFICI:
  Naming convention IronX su tutti gli oggetti?
  Tag univoca per ogni oggetto?
  IsBackgroundDrawingTool corretto per z-order?
  Font Arial Bold per frecce e simboli?
  MAI Wingdings?

BUFFER E SEGNALI:
  Buffer layout [0-5] rispettato?
  Signal_Trade emesso solo su cambio condizione?
  Signal_Trade = 0 su barre senza segnale?
  Strength clampata tra 0.0 e 1.0?

MULTI-TIMEFRAME:
  AddDataSeries in Configure?
  BarsInProgress filter per ogni serie?
  Valori HTF letti da barra chiusa?

ALERT:
  Alert solo su IsFirstTickOfBar?
  Anti-spam flag implementato?
  Messaggio segue formato standard IronX?

## SEZIONE 3 — CHECKLIST MT5 PRE-COMMIT

STRUTTURA CODICE:
  ArraySetAsSeries=false su tutti i buffer?
  PlotIndexSetDouble PLOT_EMPTY_VALUE = 0 impostato?
  IndicatorSetString INDICATOR_SHORTNAME impostato?
  prev_calculated usato per ottimizzazione loop?
  rates_total >= period check presente?
  Cast espliciti ovunque — (int) (uchar) (double)?
  NormalizeDouble su tutti i prezzi?

OGGETTI GRAFICI:
  OnDeinit con ObjectsDeleteAll(0,"IronX_")?
  Comment("") in OnDeinit?
  Naming convention IronX su tutti gli oggetti?
  ObjectMove per aggiornare — MAI ObjectCreate ogni bar?
  GlobalVariableDel in OnDeinit per ogni variabile creata?

INPUT VALIDATION (DA #118-123):
  ValidateInputs() presente come PRIMA istruzione in OnInit?
  CRITICAL errors → Print("PROD CRITICAL:") + return false → INIT_PARAMETERS_INCORRECT?
  WARNING → Print("PROD WARNING:") + continue (mai blocca)?
  MAI Alert() in validazione — solo Print() (DA #119)?
  Tutti i parametri int usati come divisori/periodi controllati per ≤0?
  Tutti i parametri color controllati per clrNONE (DA #120)?
  Validazione condizionale rispettata (es. SmoothPer solo se SmoothEn=true) (DA #121)?
  Cross-reference KAMA Fast < Slow verificata (DA #122)?
  Engine guards (MathMax, ATR>0) MANTENUTI come Layer 2 (DA #123)?
  Test con valori estremi: 0, -1, INT_MAX, clrNONE, ""?
  Test in multi-chart (nessun popup Alert cascata)?
  Format Print parseable: "PROD CRITICAL/WARNING: InpXxx=valore desc"?

COMBUS KEYS (DA #109-112):
  Formato IronX.<PROD>.<Symbol>.<TF>.<Suffix> usato (dot notation)?
  MAI formato underscore (IronX_EXT_Trend)?
  Register(PRODUCT_CODE) chiamato in OnInit?
  FlushProduct(PRODUCT_CODE) chiamato in OnDeinit?
  Publish() usa solo suffissi documentati in ironx-confluence §6.2/6.3?
  Consumer usa IronX_ComBusKey() o BuildKey() — MAI chiavi hardcoded?
  GlobalVariableCheck() prima di ogni lettura ComBus?
  Testato multi-instance: chiavi diverse per ogni Symbol/TF combo?
  Chiave Status creata automaticamente da Register()?
  Codice prodotto corretto (EXT, ATRS, MAOSC, XATR, RENKO, NC, TZ, FZ, TR, BOB, CPT)?

BUFFER E SEGNALI:
  Segnali scritti solo su i < rates_total-1?
  Barra aperta rates_total-1 aggiorna solo MA non segnali?
  Buffer non usati inizializzati a 0?

BAR PAINTING HOLLOW/SOLID (DA #99):
  DRAW_COLOR_CANDLES ha 5 colori se InpBarBiasBased=true?
  Colori calcolati da InpColorUp/InpColorDown (non hardcoded)?
  DimColor() usa blend 50% DimGray?
  Doji (close==open) mappato su indice 4 DimGray?
  Flat (trend==0) mappato su indice 4 DimGray?
  InpBarBiasBased=false → fallback logica semplice (3 colori)?

BACKGROUND PAINTING (DA #103-108):
  OBJ_RECTANGLE con OBJPROP_BACK=true usato (non DRAW_COLOR_HISTOGRAM)?
  BlendColor() usa ChartGetInteger(CHART_COLOR_BACKGROUND) — non colore fisso?
  MQL5 color format 0xBBGGRR — non 0xRRGGBB?
  Price boundaries 999999.0/0.0 per full-height — non price reali?
  OBJPROP_HIDDEN=true su tutti i rettangoli background?
  Flat (trend==0) → nessun rettangolo creato?
  Buffer 10/11 SEMPRE valorizzati anche se InpShowBackground=false?
  Plot 5 SEMPRE DRAW_NONE (visual rendering solo via OBJ_RECTANGLE)?
  Segment-based rendering — rettangoli solo su cambio trend, non ogni barra?
  Cleanup ObjectsDeleteAll in OnDeinit per rettangoli background?
  Test cambio sfondo chart — colori background si aggiornano?
  Test cambio TF — rettangoli ricreati senza ghost?
  Test multi-instance — nessun conflitto naming tra istanze EXT?
  Colori da InpBGColorUp/InpBGColorDn — non hardcoded clrLimeGreen/clrHotPink?
  InpBGOpacity=20 default (NinZa aligned)?
  InpShowBackground=false default (NinZa aligned)?

ALERT:
  Alert solo su i == rates_total-2?
  Anti-spam con static bool?
  SendNotification e SendMail configurati?

## SEZIONE 4 — CHECKLIST TV PRE-COMMIT

STRUTTURA CODICE:
  //@version=6 presente?
  indicator() con max_lines/labels/boxes_count=500?
  input con minval/maxval dove necessario?
  var usato per stati persistenti?
  nz() per proteggere divisioni per zero?
  na() check prima di usare valori opzionali?

OGGETTI GRAFICI:
  Oggetti eliminati prima di ricreare?
  MAI label.new() o line.new() ogni bar senza delete?
  Limite 500 rispettato per line box label?
  table aggiornata solo su barstate.islast?

BUFFER E SEGNALI:
  plotshape con and barstate.isconfirmed?
  Nessun segnale fuori da barstate.isconfirmed?
  request.security con lookahead=barmerge.lookahead_off?
  request.security usa [1] per barra chiusa HTF?
  Massimo 40 request.security rispettato?

ALERT:
  alertcondition con barstate.isconfirmed?
  alert() con freq_once_per_bar_close?
  MAI alert.freq_all?

## SEZIONE 5 — PROCEDURE DI TESTING

### 5.1 Test anti-repaint — obbligatorio

PROCEDURA NT8:
  1. Caricare indicatore su chart storico
  2. Notare posizione di tutti i segnali
  3. Fare screenshot
  4. Ricaricare indicatore
  5. Confrontare — segnali identici?
  6. Avanzare barra per barra con replay
  7. I segnali appaiono SOLO su barra chiusa?
  PASS: segnali identici e stabili

PROCEDURA MT5:
  1. Aprire Strategy Tester in modalità visual
  2. Eseguire su storico lungo
  3. Verificare che segnali non cambiano
  4. Confrontare output con e senza ottimizzazione
  PASS: risultati identici

PROCEDURA TV:
  1. Aprire replay su chart storico
  2. Avanzare barra per barra
  3. Segnali appaiono solo su barra confermata?
  4. Tornare indietro e avanzare di nuovo
  PASS: segnali identici

### 5.2 Test ghost objects — obbligatorio

PROCEDURA NT8:
  1. Aggiungere indicatore al chart
  2. Lasciare girare per 10 barre
  3. Rimuovere indicatore
  4. Verificare che nessun oggetto rimane
  5. Ripetere cambiando simbolo durante esecuzione
  PASS: chart pulito dopo rimozione

PROCEDURA MT5:
  1. Aggiungere indicatore
  2. Lasciare girare per qualche minuto
  3. Rimuovere indicatore
  4. Aprire Objects List — deve essere vuota per "IronX_"
  5. Verificare Comment è vuoto
  PASS: zero oggetti IronX rimasti

PROCEDURA TV:
  1. Aggiungere indicatore
  2. Rimuovere indicatore
  3. Nessun oggetto visibile rimasto?
  PASS: chart pulito

### 5.3 Test performance — raccomandato

PROCEDURA NT8:
  1. Aprire Performance Analyzer
  2. Caricare 5000 barre storiche
  3. Misurare tempo OnBarUpdate medio
  4. Verificare meno di 5ms
  PASS: sotto la soglia target

PROCEDURA MT5:
  1. Aprire Strategy Tester
  2. Eseguire su 1 anno di dati M1
  3. Verificare nessun lag visibile
  PASS: esecuzione fluida

### 5.4 Test buffer — obbligatorio per Captain

  1. Aggiungere indicatore al chart
  2. Aprire Data Window NT8 o Tester MT5
  3. Verificare ogni buffer su barre storiche:
     Buffer[0] = valore MA corretto
     Buffer[1] = 1 -1 o 0 corretto
     Buffer[2] = 1 -1 o 0 solo su cambio
     Buffer[3] = valore ATR positivo
     Buffer[4] = 1 -1 o 0 corretto
     Buffer[5] = valore tra 0.0 e 1.0
  4. Verificare su barra realtime
  PASS: tutti i buffer corretti

## SEZIONE 6 — LIVELLI DI RILASCIO

ALPHA — uso interno solo:
  Compilazione OK
  Logica principale implementata
  Testing base completato
  NON distribuire

BETA — testing esteso:
  Tutti i criteri di accettazione soddisfatti
  Anti-repaint verificato
  Ghost objects verificato
  CLAUDE.md aggiornato

RELEASE — production ready:
  Beta criteria soddisfatti
  Performance verificata
  Buffer testati con Captain
  NON TOCCARE MAI aggiornato
  Git tag creato: v[X.X]-[PRODOTTO]

## SEZIONE 7 — STANDARD ZERO-GHOST

Definizione ghost object:
  Qualsiasi oggetto grafico che rimane sul chart
  dopo che l'indicatore è stato rimosso o
  dopo cambio simbolo o timeframe.

Un solo ghost object = FAIL del test.

Cause comuni e soluzioni:

  NT8 — Brush non rilasciato:
    CAUSA: brush creato ma non nullificato
    SOLUZIONE: in OnTermination nullificare tutti i brush

  MT5 — ObjectsDeleteAll mancante:
    CAUSA: OnDeinit senza cleanup
    SOLUZIONE: ObjectsDeleteAll(0,"IronX_") SEMPRE

  MT5 — Oggetto creato con nome dinamico:
    CAUSA: nome oggetto non inizia con "IronX_"
    SOLUZIONE: rispettare naming convention sempre

  TV — Oggetto non eliminato:
    CAUSA: line/box/label creati senza delete
    SOLUZIONE: pattern var + delete prima di ricreare

## SEZIONE 8 — CHECKLIST DOCUMENTAZIONE PRE-COMMIT

  CLAUDE.md versione aggiornata?
  CLAUDE.md stato attuale aggiornato?
  Nuovi parametri documentati con tipo e default?
  Buffer output documentati se cambiati?
  NON TOCCARE MAI aggiornato se bug risolto?
  Header IronXCharts in ogni file modificato?
  Commit message segue standard IronX?
  Git tag creato se rilascio ufficiale?
  Prossimi step aggiornati in CLAUDE.md?

## SEZIONE 9 — RENKO-SPECIFIC CHECKLIST

PROCEDURA NINZA RENKO:
  1. ninZaRenko Open handling verificato (Open = prevClose sempre)?
  2. KingRenko$ Trend Threshold testato su dati live?
  3. Custom Symbol sync verificato (IronXRenko MT5)?
  4. NO open-based strategies backtestati su Renko?
  5. ComBus RENKO keys publishing correctly?

RISCHI SPECIFICI RENKO:
  Open = prevClose sempre — MAI usare Open come confermazione
  Brick brick identici su timeframe diversi — verificare sync
  Gap su aperture sessioni — gestire correttamente
  Custom Symbol history completa — verificare da sessione 1

## SEZIONE 10 — OSCILLATORI CHECKLIST (MAGNETOSC)

PROCEDURA MAGNETOSC:
  1. Push/Pull threshold values correct (80/20 default)?
  2. HTF Data Series Behind matches indicator (verifica dati)?
  3. Stochastic NOT clamped 0-100 (MagnetOsc specific!)?
  4. Signal Limiting working (2/area, split=10, margin=2)?
  5. Orbs rendering: dual-layer glow (outer 28px + inner 20px), ONLY on Push signals?

RISCHI SPECIFICI MAGNETOSC:
  Stochastic clamping a 0-100 rompe logica Push/Pull
  HTF lag su dati — verificare request.security() con [1]
  Orbs accumulation su Change — limitare a Push solamente
  Signal Limiting saturation — monitor area non super-affollate

## SEZIONE 11 — SOLAR WAVE CHECKLIST

PROCEDURA SOLAR WAVE:
  1. Signal_Wave progressive counter incrementing correctly?
  2. 4 market states (Strong/Weak × Up/Down) painting correctly?
  3. Trend Step distance displayed with asterisks for decreasing steps?
  4. Trailing Stop tracking price correctly?
  5. Dual Instance (Major/Minor) rendering without conflict?

RISCHI SPECIFICI SOLAR WAVE:
  Counter reset su market state change — verificare ordine operazioni
  Asterisk pattern su step decrescenti — counting/display logic
  Trailing stop distance aggiornamento — non saltare barre
  Dual instance z-order — Major su Minor sempre, mai opposto

## SEZIONE 12 — MA-SLOPE CHECKLIST (DA #124-131)

### 12.1 EXT v2.0 Slope LIGHT Checklist

PARAMETRI:
  InpSlopeEnabled default false (NinZa aligned — feature opzionale)?
  InpSlopeLookback default 5 (NINZA DIRETTA property panels)?
  InpSlopeThreshold default 120 (NINZA DIRETTA property panels)?
  ValidateInputs() controlla SlopeLookback > 0 se SlopeEnabled=true (DA #121)?

FORMULA:
  rawSlope = (MA[i] - MA[i-Lookback]) / Lookback / gaplessATR × 1000?
  gaplessATR = H-L only (Gapless, NON True Range con gap)?
  MathAbs(rawSlope) >= InpSlopeThreshold per gate?
  Calcolo SOLO su barra chiusa (i < rates_total-1)?
  Guard gaplessATR > 0 (divisione per zero)?

POSIZIONE FILTRO:
  DOPO PCF nella catena ValidateSignal?
  PRIMA di MTF Confirm?
  Slope disabled (InpSlopeEnabled=false) → filtro saltato?

REGOLA DA #25:
  Slope SOLO TF (timeframe alti) — MAI su scalping?
  Preset scalping hanno InpSlopeEnabled=false?
  Documentato che WR 21.3% su scalping (non usare)?

### 12.2 Choppiness Index (CI) Checklist (DA #132-140)

PARAMETRI:
  InpCIPeriod >= 2 (LOG10 domain protection)?
  InpCIThreshold > 0 (lateral threshold)?
  ValidateInputs() checks InpCIPeriod < 2 as CRITICAL?

FORMULA:
  MathLog10(SumATR / (MaxH - MinL)) / MathLog10(period) correct?
  Uses gapless_atr_buf[] (existing, not recalculated)?
  Guard range > 0 AND atr > 0?
  Multiplication × 100 applied?

INTEGRATION:
  Positioned AFTER Slope Filter in ValidateSignal chain?
  Applied BEFORE signal_count++ check?
  Disables signal when CI > threshold (lateral detected)?

TESTING:
  Test CI on trending market (should be low)?
  Test CI on lateral market (should be high)?
  Test edge case: period = 2 (minimum, LOG10(2)=0.301)?
  Test edge case: range = 0 or atr = 0?

### 12.3 IronX MA-Slope v1.0 FULL Checklist (futuro)

HYSTERESIS:
  4-state threshold: UptrendStart=+120, UptrendEnd=-60?
  DowntrendStart=-120, DowntrendEnd=+60?
  Band hysteresis 180 punti per direzione?
  Crosses zero INTENZIONALMENTE (end thresholds)?

SEGNALI:
  Signal_Trade 6 valori: ±1=Start, ±2=Slowdown, ±3=Resume?
  Signal_State 4 valori: ±2=Strong, ±1=Weak?
  ResumingSlowdownSplit = 5 bars per classificazione?
  Anti-repaint: solo barra chiusa confermata?

VISUAL:
  4-color histogram: DodgerBlue (pos↑), DarkBlue (pos↓), HotPink (neg↑), DarkRed (neg↓)?
  5 threshold lines: ±120 UptrendStart/DowntrendStart, ±60 ends, 0 center?
  Background painting standard (LimeGreen/HotPink DA #103-108)?
  Bar painting standard (DodgerBlue/DeepPink DA #99-102)?
  REGOLA GRAFICA COMPLETA rispettata (DA #131)?

COMBUS:
  Codice prodotto MASLOPE registrato?
  Chiavi: Status/Slope/Trend/Signal/State?
  Signal Adapter: IRONX_IND_MA_SLOPE con semantica corretta?

IronXCharts © Luke SteelWolf — marzo 2026
