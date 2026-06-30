---
description: Metodologia di ricerca approfondita per l'IronX Ecosystem. Attivare SEMPRE prima di costruire o replicare qualsiasi prodotto NinZa o KingRenko. Contiene fonti primarie verificate, percorsi di ricerca per NT8 MQL5 TradingView, metodo di reverse engineering da screenshot video e decompilati, regole per non fermarsi mai al primo ostacolo, struttura output ricerca. Claude NON scrive codice prima di completare la ricerca.
---

IRONX RESEARCH — METODOLOGIA DI RICERCA

REGOLA ASSOLUTA
Claude NON scrive una riga di codice prima di aver completato
la ricerca richiesta. La ricerca viene prima. Sempre.

Se un percorso di ricerca è bloccato, Claude trova un percorso
alternativo. Non si ferma al primo ostacolo. Mai.

DOMANDA OBBLIGATORIA ALL'AVVIO

Prima di qualsiasi sessione di ricerca o sviluppo, Claude chiede:

"Su quale piattaforma lavoriamo?
  1. NT8 — NinjaScript C#
  2. MT5 — MQL5
  3. TradingView — PineScript v6
  4. Tutte e tre (ricerca completa cross-platform)"

E poi:

"Che tipo di lavoro devo fare?
  1. Ricerca e analisi di un prodotto NinZa/KingRenko
  2. Sviluppo nuovo indicatore
  3. Replica di un indicatore esistente
  4. Code review o debugging
  5. Aggiornamento skill o documentazione"

Claude si concentra SOLO su piattaforma e tipo di lavoro scelti.

---

SEZIONE 1 — FONTI PRIMARIE VERIFICATE

1.1 NinZa.co — Fonte Principale

SITO UFFICIALE:
  https://ninza.co                          catalogo completo 250+ indicatori
  https://ninza.co/ninjatrader-8-indicators lista indicatori NT8
  https://ninza.co/free                     30+ indicatori gratuiti scaricabili
  https://ninza.co/install                  guida installazione
  https://ninza.co/product/[nome]           pagina singolo prodotto

FATTI VERIFICATI SU NINZA:
  - Prefisso tutti gli indicatori: "ninZa" (es. ninZaRenko, ninZaDragonTrend)
  - Signal_Trend plot CONFERMATO: 1=uptrend, -1=downtrend
  - Signal_Trade plot standard: 1=Long, -1=Short, 0=No signal
  - Membro ufficiale NinjaTrader Ecosystem
  - 10+ anni di sviluppo su NT8
  - 60.000+ trader nel mondo
  - Supporto Discord: 2600+ membri

SISTER BRAND:
  https://renkokings.com                    KingRenko$ e prodotti Renko
  https://best.ninza.co                     offerte e bundle esclusivi
  https://zuperview.com                     ZuperView — equivalente NinZa su TradingView

AVVISO CLOUDFLARE 403:
  ninza.co è protetto da Cloudflare e spesso restituisce 403
  WORKAROUNDS:
    1. Usare WebSearch (invece di WebFetch diretto)
    2. Provare URL alternativi:
       - https://renkokings.com (sister brand, meno protetto)
       - https://nt8.ninza.co (redirect potenziale a best.ninza.co)
       - https://best.ninza.co (bundle/offerte)
    3. Se tutti falliscono: usare decompilato + screenshot + video transcriptions

1.2 KingRenko$ — Fatti Verificati

DIFFERENZA NINZARENKO vs KINGRENKO$:

  ninZaRenko:
    - Open ARTIFICIALE per armonia visiva
    - Non backtestabile accuratamente
    - ID barra: 12345

  KingRenko$:
    - Open REALE — nessun artificio
    - OHLC reale e verificabile
    - Backtestabile accuratamente
    - Stesse impostazioni ninZaRenko: "Trend Threshold" e "Brick Size"
    - Close prices identiche a ninZaRenko con stesse impostazioni
    - Qualsiasi indicatore basato su Close funziona uguale su entrambi

1.3 Documentazione Ufficiale Piattaforme

NT8 — NinjaScript:
  https://ninjatrader.com/support/helpGuides/nt8/
  https://developer.ninjatrader.com/
  https://ninjatrader.com/support/helpGuides/nt8/developing_indicators.htm
  Forum: https://ninjatrader.com/support/forum/

MT5 — MQL5:
  https://www.mql5.com/en/docs
  https://www.mql5.com/en/forum
  https://www.mql5.com/en/code

TradingView — PineScript v6:
  https://www.tradingview.com/pine-script-docs/
  https://www.tradingview.com/pine-script-reference/v6/
  Forum: https://www.tradingview.com/community/

---

SEZIONE 2 — PERCORSI DI RICERCA PER PRODOTTO

2.0 STEP PRELIMINARE — Verifica Ricerca Esistente (NUOVO — OBBLIGATORIO)

PRIMA di iniziare qualsiasi ricerca, leggere sempre:
  ✓ Ninza_Data/Cowork_Research/NinZa_IndicatorCatalog.md
  ✓ Ninza_Data/Cowork_Research/DECOMPILED_ANALYSIS.md
  ✓ Ninza_Data/Cowork_Research/AUDIT_COMPLETO_12MAR2026.md
  ✓ Cartella Ninza_Data/Decompiling/{prodotto}/ per decompilati

PERCHÉ:
  - Evita duplicazioni di lavoro
  - Rivela lo stato corrente della conoscenza (VERIFICATO/IPOTESI/SCONOSCIUTO)
  - Fornisce lista di fonti già consultate
  - Indica quali lacune restano aperte
  - Acelera ricerca cross-reference

AZIONI OBBLIGATORIE:
  1. Controllare status prodotto in NinZa_IndicatorCatalog.md
     Es: "Easy Trend: ricerca 100% completa, decompilato ~850 LOC disponibile"
  2. Se presente, leggere DECOMPILED_ANALYSIS.md sezione relativa
  3. Se decompilato esiste, estrarre algoritmo dal file C# in Decompiling/
  4. Se precedentemente ricercato, controllare sezione LACUNE ANCORA APERTE

2.1 Come ricercare un indicatore NinZa da replicare

STEP 1 — Pagina prodotto ufficiale:
  Aprire https://ninza.co/product/[nome-indicatore]
  Estrarre: descrizione, parametri input, plots esposti,
  segnali, comportamento, screenshot

STEP 2 — Video YouTube NinZa:
  Cercare "[nome indicatore] ninza.co" su YouTube
  Guardare tutorial ufficiali: parametri, visual, logica
  Cercare "ninZa [indicator] tutorial NinjaTrader"
  Cercare video di trader che usano l'indicatore in live

STEP 3 — Forum NinjaTrader:
  Cercare il nome dell'indicatore su ninjatrader.com/forum
  Trovare thread con domande tecniche che rivelano dettagli logica
  Cercare post ninZa.co staff con spiegazioni ufficiali

STEP 4 — Discord ninZa (2600+ membri):
  Se accessibile, cercare discussioni sull'indicatore
  Trovare configurazioni, impostazioni, comportamenti edge case

STEP 5 — Decompilati e codice utente:
  Cercare su GitHub "[indicator name] NinjaScript"
  Cercare su NinjaTrader App Share indicatori simili open source
  Analizzare qualsiasi file .cs o decompilato fornito da Luke

STEP 6 — Se ancora manca qualcosa:
  Cercare su Reddit: r/NinjaTrader, r/algotrading, r/Daytrading
  Cercare su TradingView community script simili
  Cercare su MQL5 CodeBase equivalenti MT5
  Cercare documentazione matematica della formula

2.2 Come ricercare da screenshot / immagini

STEP 1 — Identificazione elementi grafici:
  Elencare ogni elemento visibile: linee, frecce, box, label, colori
  Classificare: overlay su chart, pannello separato, o entrambi
  Identificare il tipo di barra (Renko, candele, Heiken Ashi)

STEP 2 — Estrazione colori:
  Identificare colori esatti di ogni elemento
  Approssimare valori RGB da screenshot
  Cercare nella palette IronX se già documentato
  Segnalare se il colore è nuovo e non ancora catalogato

STEP 3 — Reverse engineering della logica:
  Osservare quando appaiono segnali: su quale barra, in quale condizione
  Osservare la direzione frecce rispetto all'andamento del prezzo
  Identificare se i segnali sono su barra chiusa o aperta
  Analizzare le label: cosa mostrano — prezzo, valore, testo fisso

STEP 4 — Ipotesi logica:
  Formulare ipotesi sulla formula basata su osservazione
  Cercare conferma via web (STEP 2.1)
  Documentare le ipotesi con grado di certezza:
  VERIFICATO / IPOTESI / SCONOSCIUTO

2.3 Come ricercare da video (AGGIORNATO)

STEP 1 — Fermare il video nei momenti chiave:
  Pausare su screenshot di Properties panel indicator
  Pausare su zoom chart showing signals/colors/markers
  Pausare su label/text visibili

STEP 2 — Estrazione parametri da Properties:
  CRITICO: Video spesso mostrano esattamente i parametri nel pannello settings
  Leggere nome parametro, tipo (number/bool/enum), default value
  Confrontare con altri video dello stesso indicatore per uniformità
  Documentare: "Parameter X = value Y (verificato video z)"

STEP 3 — Analisi comportamento su barre specifiche:
  Osservare QUANDO appaiono segnali (quale barra)
  Osservare il timing (appena aperta vs fine chiusura)
  Osservare il pattern: frequenza, densità, raggruppamento
  Notare edge case: comportamento su gap, volatilità alta, laterale

STEP 4 — Estrazione colori e stili grafici:
  Notare colori esatti di ogni elemento (frecce, linee, label)
  Identificare dimensione font, spessore linea, stile (solid/dash/dot)
  Identificare posizione elementi su chart (overlay, separate panel, corner)
  Cercare palette coerenti (es: verde sempre uptrend, rosso sempre downtrend)

STEP 5 — Localizzazione timestamp logica critica:
  Trovare timestamp dove algorithm è visibile chiaramente
  Es: "Easy Trend reversal al minuto 3:45 della ricerca"
  Es: "MagnetOsc Push/Pull switch al minuto 8:12"
  Questo velocizza future review video

### 2.3b Choppiness Index (CI) — STANDARD UNIVERSALE Non NinZa (DA #132-140)

Ricerca CI per EXT v2.0 Slope Filter complementare:

**STEP 1 — Verificare che CI è STANDARD UNIVERSALE:**
  ✓ Kaufman formula ufficiale (libri, not NinZa proprietary)
  ✓ Dreiss formula (Investopedia)
  ✓ MQL5 CodeBase implementazioni 10+ (tutti concordi)
  ✓ PineScript v6 ta.log10() built-in support

**STEP 2 — Identificare NinZa equivalenti:**
  ✗ Easy Trend NON ha CI
  ✗ Sidewayz RT/ZP/MA hanno algoritmi proprietari offuscati
  ✗ CCI (Lambert) ≠ CI (Dreiss) — indicatori DIVERSI

**STEP 3 — Implementazione cross-platform equivalenza:**
  NT8: Math.Log10(sumATR / range) / Math.Log10(period) × 100
  MT5: MathLog10(sumATR / range) / MathLog10((double)period) × 100
  TV:  ta.log10(sumATR / range) / ta.log10(period) × 100

**STEP 4 — Parametri standard verificati:**
  Default period: 14 (Fibonacci standard, fonte: Kaufman)
  Default threshold: 61.8 (Fibonacci, fonte: Investopedia tradizionale)
  ATR source: gapless H-L only (SCELTA IRONX per Slope complementare)

**STEP 5 — Semantica:**
  CI > 61.8 → mercato laterale → gate segnali
  CI < 61.8 → mercato trending → segnali validi

SEZIONE 2.4 — Video Transcriptions come Fonte NINZA DIRETTA

Luke fornisce video transcriptions per i prodotti NinZa analizzati.
Queste transcriptions sono FONTE PRIMARIA VERIFICATA perché:
  - Derivate direttamente da video ufficiali NinZa
  - Contengono esatte diciture dell'indicatore
  - Mostrano esattamente i parametri mostrati nel video
  - Classificate come NINZA DIRETTA (massima affidabilità)

COME USARE TRANSCRIPTIONS:
  1. Cercare in Ninza_Data/Cowork_Research/ file con "transcription" o "video"
  2. Estrae timestamp specifici per logica chiave
  3. Citare come: "[Video_NinZa_nome.transcription, timestamp X]"
  4. Confrontare con decompilato per cross-reference

---

SEZIONE 3 — METODO RICERCA CROSS-PLATFORM

Quando si ricerca l'equivalente cross-platform di un elemento NT8:

ORDINE DI RICERCA:
  1. Controllare ironx-platform-matrix — equivalente già documentato?
  2. Se no — cercare documentazione ufficiale della piattaforma target
  3. Se non esiste equivalente diretto — cercare workaround su forum
  4. Se nessun workaround — documentare limitazione + soluzione più vicina
  5. MAI inventare soluzioni senza base documentata

FONTI PER EQUIVALENZE:
  NT8 verso MT5: https://www.mql5.com/en/forum, MQL5 CodeBase, Stack Overflow
  NT8 verso TV:  https://www.tradingview.com/pine-script-docs/, TV community scripts
  Generale: GitHub, Stack Overflow tag "mql5" "ninjatrader" "pinescript"

---

SEZIONE 4 — CLASSIFICAZIONE FONTI (NUOVO — OBBLIGATORIO)

OGNI pezzo di informazione deve essere classificato con una di queste etichette:

┌─ NINZA DIRETTA (massima affidabilità)
│  - Decompilato NT8 C# (.cs file)
│  - Screenshot ufficiale NinZa
│  - Video ufficiale ninza.co
│  - Video transcription fornito da Luke
│  - Sito ninza.co / renkokings.com / best.ninza.co
│  - Discord/Forum NinZa staff official statement
│  Uso: Implementare direttamente, validazione minima richiesta

├─ FONTE TERZA VERIFICATA (media affidabilità)
│  - Web source confermato da ALMENO 1 altra fonte indipendente
│  - Gemini Deep Research confermato da decompilato o sito ufficiale
│  - Forum NinjaTrader community con multiple confirmazioni
│  - Video trader con comportamento coerente a video altri trader
│  - Wikipedia/Investopedia per formule matematiche standard
│  Uso: Implementare con test, validazione media richiesta

├─ FONTE TERZA NON VERIFICATA (bassa affidabilità)
│  - Web source singolo senza cross-reference
│  - Gemini Deep Research senza conferma indipendente
│  - Post singolo forum/Reddit senza consensus
│  - Articolo non-reviewed su piccoli siti
│  Uso: Segnalare SEMPRE come NON VERIFICATO, chiedere approvazione Luke
│  NON implementare senza conferma esplicita

└─ IPOTESI (deduzione logica)
   - Interpretazione logica basata su pattern osservati
   - Reverse engineering da comportamento visivo
   - Estensione ragionevole di algoritmo noto
   Uso: Documentare SEMPRE come IPOTESI, spiegare logica, chiedere approvazione Luke
   NON implementare autonomamente anche se sembra ovvio

FORMATO DOCUMENTAZIONE:
  Ogni dato deve riportare: [Affermazione] (FONTE: classificazione, URL/file, data accesso)
  Es: "Easy Trend usa EMA 20 (FONTE: NINZA DIRETTA, decompilato Easy Trend v4.3)"
  Es: "ATR cap 1.5x previene gap shock (FONTE: IPOTESI, logica: cap ATR extreme)"

---

SEZIONE 5 — STRUTTURA OUTPUT RICERCA (AGGIORNATA)

Ogni ricerca completata produce un file .md in Cowork_Research/ con questa struttura:

  RICERCA: [Nome Prodotto / Elemento]
  Data: [data]
  Piattaforma target: [NT8 / MT5 / TV / Cross-platform]
  Ricercatore: [Claude / Luke]

  STATO CONOSCENZA (obbligatorio):
    Logica principale:       VERIFICATA / IPOTESI / SCONOSCIUTA
    Parametri input:         VERIFICATI / PARZIALI / SCONOSCIUTI
    Visual / Grafica:        VERIFICATA / PARZIALE / SCONOSCIUTA
    Formule matematiche:     VERIFICATE / PARZIALI / SCONOSCIUTE
    Segnali output:          VERIFICATI / PARZIALI / SCONOSCIUTI

  FONTI CONSULTATE (obbligatorio):
    [1] NINZA DIRETTA — decompilato Easy Trend.cs, Ninza_Data/Decompiling/Easy_Trend/
    [2] NINZA DIRETTA — screenshot #3, Ninza_Data/ScreenShot/Easy_Trend/03_reversal.png
    [3] NINZA DIRETTA — video transcription, Ninza_Data/Deep_Research_Ninza_System/Easy_Trend_Video_Analysis.md
    [4] FONTE TERZA VERIFICATA — https://ninjatrader.com/support/forum/, thread Easy Trend behavior
    [5] FONTE TERZA NON VERIFICATA — https://www.reddit.com/r/NinjaTrader/, post "EMA crossover signals"
    [6] IPOTESI — Logica pullback dedotta da pattern screenshot + video behavior

  RISULTATI (organizzato per sezione):
    [Contenuto sezione per sezione, ogni affermazione con classificazione fonte]

  DIFFERENZE IRONX vs NINZA:
    [Cosa IronX implementa diversamente, perché, con quale trade-off]
    Es: "IronX ha 17 MA vs NinZa 11 — 6 extra: ALMA, LSMA, REMA, TMA, T3, KAMA, VIDYA"
    Es: "IronX ATR Pro (cap 1.5x) è ESCLUSIVA — NinZa non ha equivalente"

  LACUNE ANCORA APERTE:
    [Cosa non è stato possibile trovare e perché]
    [Effort estimate per risolvere (minuti/ore/giorni)]
    [Suggerimento approccio alternativo se impossibile verificare]

  PROPOSTA APPROCCIO SVILUPPO:
    [Come procedere basandosi su quanto trovato]
    [Specifiche algoritmo con riga-per-riga se possibile]
    [Dipendenze da altre componenti IronX]

---

SEZIONE 6 — DEEP RESEARCH FILES COME FONTE (NUOVO)

Luke ha commissionato Gemini Deep Research per prodotti NinZa complessi.
Questi file si trovano in: Ninza_Data/Deep_Research_Ninza_System/

ELENCO CURRENT:
  - Easy_Trend_Complete_Analysis.md
  - ATR_TradeShield_Deep_Analysis.md
  - MagnetOsc_Turbo_Complete_Analysis.md
  - [altri file di ricerca completati]

CLASSIFICAZIONE:
  Deep Research files = FONTE TERZA NON VERIFICATA per default
  (Gemini è AI training-based, non human-verified)

REGOLA USO:
  1. Leggere Deep Research per contesto e overview
  2. SEMPRE cross-reference con:
     - Decompilato (se disponibile) — massima priorità
     - Screenshot (se disponibile) — conferma visiva
     - Video (se disponibile) — comportamento reale
  3. Se Deep Research contraddice decompilato: FIDARSI DECOMPILATO
  4. Se Deep Research unico disponibile: segnalare FONTE TERZA NON VERIFICATA, chiedere approvazione Luke
  5. MAI implementare feature basata SOLO su Deep Research senza conferma

QUANDO È UTILE:
  - Contesto storico prodotto (anno lancio, evoluzioni)
  - Algoritmi standard descritti (es: formule Fibonacci, MA tipi)
  - Overview architettura quando decompilato non disponibile
  - Identificazione gap tra descrizione prodotto e implementazione

---

SEZIONE 7 — REGOLE PER NON FERMARSI

Se una fonte è irraggiungibile:
  Provare versione cache Google: "cache:[URL]"
  Provare Web Archive: https://web.archive.org/web/[URL]
  Cercare il contenuto citato in altri siti
  Se ninza.co 403 Cloudflare: usare WebSearch o URL alternativi

Se un indicatore è a pagamento e non accessibile:
  Cercare review dettagliate su YouTube e forum
  Cercare trader che descrivono il comportamento in dettaglio
  Analizzare screenshot e video disponibili pubblicamente
  Cercare indicatori open source con logica simile su GitHub e MQL5 CodeBase

Se la formula matematica è sconosciuta:
  Cercare il nome della formula + "formula" + "algorithm" su Google Scholar
  Cercare su Investopedia, TradingView Wiki, Wikipedia
  Cercare implementazioni open source in qualsiasi linguaggio
  Analizzare il comportamento visivo per dedurre la formula

Se nessuna fonte funziona:
  Documentare tutto ciò che si sa con grado di certezza
  Proporre a Luke un approccio basato su ipotesi documentate
  Specificare effort estimate per completare ricerca
  NON procedere con lo sviluppo senza approvazione esplicita di Luke

---

SEZIONE 8 — QUANDO USARE OPUS VS SONNET

USARE OPUS 4.6 per:
  Ricerche profonde e multi-fonte su prodotti NinZa complessi
  Reverse engineering di logiche non documentate
  Progettazione architettura cross-platform
  Analisi di decompilati complessi
  Qualsiasi ricerca che richiede ragionamento profondo e sintesi

USARE SONNET 4.6 per:
  Ricerche semplici su documentazione ufficiale
  Aggiornamenti skill con contenuto già noto
  Sviluppo codice su specifiche già definite
  Code review su codice già progettato

---

---

SEZIONE 9 — REGOLA GRAFICA COMPLETA (DA #131 — PERMANENTE)

REGOLA OBBLIGATORIA PER TUTTI I PRODOTTI NINZA

Ogni ricerca prodotto NinZa in Cowork_Research/ DEVE includere una sezione dedicata
"GRAFICA COMPLETA" con le seguenti 7 categorie obbligatorie:

1. CHART OBJECTS
   - Tipo oggetto: histogram bars, lines (trend/horizontal/step), rectangles, arrows, labels
   - Dimensioni: width (pixel/points), height, line thickness
   - Z-order: BACK (dietro candele) vs FRONT (sopra), livello rendering
   - Opacity: valore percentuale, metodo (alpha nativa vs pre-blend)
   - Stile: SOLID, DASH, DOT, DASHDOT
   - Periodo di vita: permanente, per-barra, per-segmento-trend

2. COLORI (sistema completo)
   - Valori HEX esatti per ogni elemento (#RRGGBB e 0xBBGGRR per MT5)
   - Mappatura stato→colore (es: strong up = DodgerBlue, weak down = DarkRed)
   - Supporto dark/light theme (come reagiscono i colori al cambio sfondo)
   - 4 gruppi colore standard: Plot, Bar, Background, Marker (DA #113)
   - Colori parametrici (da input) vs hardcoded

3. MARKERS/LABELS
   - Caratteri Unicode con codice esatto (es: 0x25B2 = ▲)
   - Font: nome, size, bold/regular
   - Posizione: above/below bar, offset in points/pixels
   - Condizioni di trigger: su quale barra, quale stato, quale segnale
   - Cooldown: minimo N barre tra markers
   - Interazioni: come i marker di questo prodotto si integrano con quelli di altri prodotti

4. DASHBOARD/PANELS
   - Layout: posizione corner, dimensioni, elementi interni
   - Drag behavior: draggable, docking, snap
   - Testi: cosa mostra, formato, aggiornamento frequenza
   - Collapsible: se ha bottone collapse, comportamento

5. CONFLUENZE/INTERAZIONI
   - Come il prodotto interagisce visivamente con altri prodotti IronX sullo stesso chart
   - Sovrapposizioni: chi sta sopra chi (z-order tra prodotti)
   - Colori: conflitti colore tra prodotti e soluzioni
   - Dashboard dock: come i panel si posizionano tra loro

6. RENDERING BEHAVIOR
   - Stepped vs smooth (line style su diverse condizioni)
   - Repaint behavior: cosa si ridisegna e quando
   - TF scaling: come cambia la visual su TF diversi
   - Renko behavior: differenze su Renko vs candele
   - Refresh frequency: ogni tick vs ogni barra vs ogni N secondi

7. ALERT SYSTEM
   - Testo esatto del messaggio alert per ogni trigger
   - Condizioni di trigger precise
   - Suono vs visual vs push (quali combinazioni)
   - Popup colors (se applicabile)
   - Frequenza/blocking: anti-spam, cooldown tra alert, once-per-bar
   - Priorità alert (high/medium/low)

QUESTA REGOLA VALE PER SEMPRE — si applica:
  - A TUTTI i prodotti futuri da ricercare
  - RETROATTIVAMENTE a prodotti già ricercati (verificare gap e colmare)
  - A TUTTE le piattaforme (NT8, MT5, TV)

FORMATO NELLA SEZIONE 5 OUTPUT:
  Aggiungere sezione "GRAFICA COMPLETA" tra "RISULTATI" e "LACUNE ANCORA APERTE"
  con le 7 sottosezioni numerate sopra.

GAP NOTI DA COLMARE (prodotti già ricercati):
  - Easy Trend: PARZIALE (screenshot dettagliati, mancano specifiche alert esatte)
  - ATR TradeShield: PARZIALE (dashboard documentato, mancano specifiche line styles)
  - MagnetOsc: PARZIALE (orbs documentati, mancano alert specifiche)
  - Noble Cloud: BUONO (14 screenshot, markers documentati, cloud fill documentato)
  - MA-Slope: COMPLETO (sezione 14 nel file RESEARCH_COMPLETA, 10 GAP identificati G1-G10)

---

IronXCharts © Luke SteelWolf — marzo 2026 — v3.2
Aggiornato: SEZIONE 2.0 (Step preliminare), SEZIONE 2.3 (Video extraction), SEZIONE 4 (Classificazione fonti), SEZIONE 5 (Output structure), SEZIONE 6 (Deep Research), SEZIONE 7 (Anti-Cloudflare), SEZIONE 9 (REGOLA GRAFICA COMPLETA DA #131)
