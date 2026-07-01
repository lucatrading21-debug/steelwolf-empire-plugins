---
description: Ciclo sessione Empire SteelWolf — chiude la sessione corrente (D6 completo, GATE git clean) e prepara l'apertura della successiva da incollare in una CHAT NUOVA (session-boundary LL-050). Non lavora nella stessa chat. Rispetta PROTOCOLLO GO e delega push/commit a Luke Windows.
argument-hint: [progetto-opzionale]
allowed-tools: Read Edit Write Bash Grep Glob
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

Esegui il ciclo chiusura+handoff Empire SteelWolf seguendo skill `cycle` plugin swe
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

### FASE 2 — HANDOFF (prepara apertura, NON esegue in-chat)

**Regola session-boundary (LL-050): la sessione successiva NON si apre in questa chat.**
Aprire e lavorare nella stessa chat mescola i contesti. Quindi FASE 2:

3. **Scrivi lo snapshot di apertura** in `hub/SESSION_BRIEFINGS/S<n+1>_OPEN.md` (via skill `start` §5-ter): PC · pull · briefing · carryover · priorità proposte, letti a runtime dal SESSION_LOG appena aggiornato. Persiste su disco anche a chat chiusa.

4. **Emetti l'handoff** in chat: conferma che S<n> è chiusa e indica a Luke di **aprire una CHAT NUOVA** e lanciare `/swe:start $1`. Lo start ricostruirà (e ritroverà persistito) lo snapshot appena scritto.

5. **NON** eseguire l'apertura interattiva né alcun lavoro della nuova sessione in questa chat. Il ciclo termina qui.

Argomento opzionale `$1`: progetto target suggerito per `/swe:start` nella chat nuova.

Note operative:
- Cowork: chiusura interattiva usa widget elicitation; CLI: testo.
- Commit/push/reinstall restano lato Luke Windows (LL-Empire-019/031).

LL critiche binding: 002, 008, 011, 018, 019, 021, 023, 024, 050
