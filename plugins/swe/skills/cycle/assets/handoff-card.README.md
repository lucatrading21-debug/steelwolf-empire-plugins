# Enriched Visual View — card di HANDOFF Cycle (FASE 2, S165)

> **CARD FREEZE (S166, direttiva Luke — BINDING):** questa Enriched Visual View nella versione ricca collaudata in S166 è lo standard **INVARIABILE** per hub e OGNI progetto SteelWolf. Vietato impoverirla, semplificarla, improvvisarla o cambiarne stile/struttura. Riempirla SEMPRE completa coi dati reali del progetto.

Terza card della famiglia (apertura `start` · chiusura `end` · handoff `cycle`). E' il **ponte**
tra la sessione appena chiusa (S<n>) e la successiva (S<n+1>). Rendering via `show_widget` (Cowork);
su Code CLI / Chat -> fallback testo. LINGUA: italiano SEMPRE.

## Regola BINDING (LL-Empire-050 · session boundary)
La card **NON apre** e **NON lavora** la sessione successiva nella stessa chat. Mostra:
1. **Recap S<n>** (read-only): Tipo · Obiettivo · Cosa fatto (breve) · Commit generati · Working tree.
2. **CTA boundary**: il comando `/swe:start [progetto]` da lanciare in **CHAT NUOVA** — mostrato come
   **SOLO TESTO** (nessun pulsante `sendPrompt` che avvii il lavoro qui: violerebbe LL-050).
3. **Cosa si farà in S<n+1>** (continuazione): PC · pull · **priorità con Dettagli a tendina IDENTICI all'opening-card**
   (blocco `.prio` con L2 a 10 campi: In parole semplici · Piano · Prima→Dopo · Serve/Dipende · Dati richiesti ·
   **Analisi & consultazione** = ricerche/fonti con LINK reale · **Skill da usare** = skill/plugin · Rischi · Come sarà
   completato/DoD · Consiglio, ognuno con chiosa) + carryover. Priorità/carryover letti da `SESSION_BRIEFINGS/S<n+1>_OPEN.md`.
4. **Checklist & Roadmap** del progetto a drill-down per milestone (come opening-card), barra %.
5. **Meta ricca** identica all'opening: data+ora ciclo, branch/HEAD, ultimo commit (hash·data·msg), Continuità, Parità PC, LL richiamate.

## Precondizione
La card si mostra SOLO a **closure confermata** (FASE 1 = `end` completa, GATE git clean Windows-side
verificato, LL-024). Prima del gate: STOP in FASE 1, niente handoff.

## Placeholder (ricca come opening-card)
Meta (con ORA): {{DATE_TIME}} (`YYYY-MM-DD · HH:MM TZ` via shell date) · {{BRANCH_HEAD}} · {{PC_PARITY}} ·
{{LAST_COMMIT_HASH}} / {{LAST_COMMIT_DATE}} (`YYYY-MM-DD HH:MM`) / {{LAST_COMMIT_MSG}}
(via `git log -1 --date=format:"%Y-%m-%d %H:%M" --format="%h|%ad|%s"`) · {{LL_LIST}}.
Recap S(n): {{PROJECT_LABEL}} {{PC}} {{TIPO}} {{SESSION}} {{OBIETTIVO}} {{DONE_SUMMARY}} {{COMMITS}} {{WT_CLEAN}}.
Continuazione S(n+1): {{NEXT_SESSION}} {{PULL_NEXT}} {{NEXT_PRIORITIES}} {{CARRYOVER}}.
Checklist&Roadmap: {{CK_DONE}} {{CK_TOTAL}} {{PROGRESS_PCT}} {{CHECKLIST_MILESTONES}} (drill-down per milestone, flag outline, voci `.new` per le spunte di sessione).
CTA: {{START_CMD}} {{SNAPSHOT_PATH}} {{CROSS_CUTTING}}.

## Parole povere + tracciabilità (coerenza con opening/closing)
Glosse `.glo`/`.hl` in parole povere sui campi; il "perché chat nuova" è spiegato senza gergo
accanto al termine tecnico (LL-050). Nessun link inventato (LL-Empire-011).

## Fallback testo (Code CLI / Chat, no show_widget)
Stesse info in testo: "S<n> chiusa (recap) · apri CHAT NUOVA e lancia `/swe:start [progetto]` ·
in S<n+1> ritrovi: PC/pull/priorità #1/carryover · snapshot in S<n+1>_OPEN.md". Poi STOP (LL-050).
