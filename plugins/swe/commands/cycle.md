---
description: Ciclo sessione Empire SteelWolf — chiude la sessione corrente (D6 completo, GATE git clean) e riapre la successiva (apertura interattiva /swe:start) in un solo comando. Rispetta PROTOCOLLO GO e delega push/commit a Luke Windows.
argument-hint: [progetto-opzionale]
allowed-tools: Read Edit Write Bash Grep Glob
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

Esegui il ciclo chiusura+apertura Empire SteelWolf seguendo skill `cycle` plugin swe
in `skills/cycle/SKILL.md`. Riferimento completo body: vedi SKILL.md.

## Sequenza obbligatoria

### FASE 1 — CHIUSURA (skill `end`, protocollo D6)

1. Esegui l'intera sequenza di `/swe:end` (skill `end`):
   - Step 0 chiusura interattiva (raccolta dati D6)
   - SESSION_LOG + LESSONS_LEARNED + EMPIRE_DASHBOARD + memory snapshot
   - Commit atomic (LL-Empire-018) — file specifici, mai `git add -A`
   - **GATE (LL-Empire-024):** `git status` clean su CMD Windows PRIMA di procedere
   - Push delegato Luke (V1 parity) + V6 backup se prossima sessione destructive

2. **CHECKPOINT — non attraversare senza closure pulita:**
   - Se il working tree NON è clean Windows-side → **STOP**, resta in FASE 1.
   - Il ciclo prosegue a FASE 2 solo a closure confermata.

### FASE 2 — APERTURA (skill `start`, nuova sessione)

3. Esegui l'intera sequenza di `/swe:start` (skill `start`) per la sessione successiva:
   - Step 0 dichiara PC + pull-first · CLAUDE.md hierarchy · SESSION_LOG ultime 20 righe · LESSONS_LEARNED indice · memory snapshot · briefing
   - Apertura interattiva (widget conferma PC · pull · priorità + colpo d'occhio CHECKLIST/ROADMAP)

4. **ATTENDI GO esplicito Luke** (LL-Empire-002) prima di eseguire qualsiasi lavoro della nuova sessione. Default = WAIT.

Argomento opzionale `$1`: progetto target da passare a `/swe:start` in FASE 2.

Note operative:
- Cowork: chiusura interattiva e apertura usano widget elicitation; CLI: testo.
- Commit/push/reinstall restano lato Luke Windows (LL-Empire-019/031).

LL critiche binding: 002, 008, 011, 018, 019, 021, 023, 024
