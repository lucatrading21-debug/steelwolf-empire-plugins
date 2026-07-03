# Enriched Visual View — card d'apertura sessione (base ufficiale S164/A5)

> **CARD FREEZE (S166, direttiva Luke — BINDING):** questa Enriched Visual View nella versione ricca collaudata in S166 è lo standard **INVARIABILE** per hub e OGNI progetto SteelWolf. Vietato impoverirla, semplificarla, improvvisarla o cambiarne stile/struttura. Riempirla SEMPRE completa coi dati reali del progetto.

Base UNICA per l'apertura di OGNI sessione e OGNI progetto SteelWolf (e blueprint Nexus).
Rendering via `show_widget` (Cowork). Su Code CLI/Chat puri → **fallback testo** (vedi sotto).

## Regole (binding)
- **Sempre questa card** in apertura: niente AskUserQuestion, niente elicitation nativo
  (il prefill non si accende — verificato S161). Card HTML custom = pre-acceso reale.
- **Pre-acceso**: i valori dedotti (PC, Pull, priorità #1) partono con classe `sel`/`on`
  e marcatore "● dedotto" (regole §5-bis deterministiche).
- **Dati a runtime** dal progetto risolto (§0-ter): sessione N, data/ora, branch/HEAD,
  ultimo commit (testo+data), checklist/roadmap parsate con flag, priorità dal carryover.
- **Degradazione**: SESSION_LOG assente → `S1`; nessun commit → `—`; checklist assente →
  sezione nascosta. Mai errore per dato mancante.
- **Icone flag**: SOLO outline (`ti-square-check` verde = fatto, `ti-square` = da fare).
  MAI varianti `-filled` (non caricate → riquadro vuoto).
- **Token-saving**: clona `opening-card.template.html`, sostituisci i `{{PLACEHOLDER}}`,
  NON riscrivere da zero.

## Placeholder
{{PROJECT_LABEL}} {{PC}} {{TIPO}} {{SESSION}} {{DATE_TIME}} {{BRANCH_HEAD}}
(OBBLIGATORI con ORA:
  {{DATE_TIME}} = data+ora apertura sessione, formato `YYYY-MM-DD · HH:MM TZ` (via shell `date`).
  {{LAST_COMMIT_HASH}} / {{LAST_COMMIT_DATE}} (`YYYY-MM-DD HH:MM`) / {{LAST_COMMIT_MSG}} — 3 campi SEPARATI, la data NON è omettibile.
  Ricavali: `git log -1 --date=format:"%Y-%m-%d %H:%M" --format="%h|%ad|%s"` e splitta su `|`.)
{{PULL_STATE}} {{LAST_COMMIT_HASH}} {{LAST_COMMIT_DATE}} {{LAST_COMMIT_MSG}} {{LL_LIST}} {{PROGRESS_PCT}} {{CK_DONE}} {{CK_TOTAL}}
{{CHECKLIST_ITEMS}} {{PRIORITIES}}  (+ pre-selezione: aggiungi `sel`/`on` al dedotto)

## Schema per-priorità (livello 1 sempre + livello 2 "Dettagli")
L1: badge Pn · Titolo · "Fai:" 1 riga · meta(Rischio ● / Stima tempo·token / Stato / MoSCoW)
L2: Piano · Prima → Dopo · Serve/Dipende da · Rischi & mitigazione · Verifica (DoD) · Consiglio

## Ecosistema (hub): ogni progetto mostra badge stato + **ultima modifica** (data ultimo commit del repo: `git log -1 --date=format:"%Y-%m-%d"`).

Sezioni fisse
Header brandizzato (SW + wordmark + N sessione) · riga meta (data/commit/pull) · LL richiamate ·
PC + Pull (pill pre-accese) · Riferimenti rapidi (sendPrompt) · tendina Checklist&Roadmap (flag+barra) ·
Priorità per workflow · Prossimo passo consigliato · Note di sessione · +Nuova voce Checklist ·
+Nuova voce Roadmap · Cross-cutting/DIRTY · Conferma (sendPrompt: PC·Pull·Priorità·Note·nuove voci).

## Fallback testo (Code CLI / Chat, no show_widget)
Rendi le STESSE informazioni in testo strutturato: header (sessione/PC/data/commit/pull),
priorità numerate con Fai/Piano/Prima→Dopo/Serve/Rischi/DoD/Consiglio, checklist con [x]/[ ],
prossimo passo, note. Poi ATTENDI GO (LL-002).

Il file `opening-card.template.html` contiene lo scheletro con `{{PLACEHOLDER}}`, CSS e JS statici,
+ un blocco priorità d'esempio ripetibile e le sezioni Note/nuove-voci.

## Parole povere + tracciabilità (simmetria con closing card, S165)
- Controlli (PC/Pull): glossa `.qglo` = termine tecnico + spiegazione senza gergo.
- Priorità: `In parole semplici` (discorsivo) + `Analisi & consultazione` + `Skill da usare` = provenienza/come verrà fatta.
- Principio condiviso con `end` (closing card): termine tecnico + parole povere + provenienza (skill/ricerca/fonte web con LINK reale, mai inventato — LL-Empire-011). Vedi `end/assets/closing-card.README.md`.
