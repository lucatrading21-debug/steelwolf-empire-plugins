---
description: Apertura sessione Empire SteelWolf — pull-first 11 repo + CLAUDE.md hierarchy + SESSION_LOG ultime 20 righe + LESSONS_LEARNED indice + memory snapshot + briefing + ATTENDI GO esplicito Luke (LL-Empire-002)
argument-hint: [progetto-opzionale]
allowed-tools: Read Bash Grep Glob
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

Esegui workflow apertura sessione Empire SteelWolf seguendo skill `start` plugin swe
in `skills/start/SKILL.md`. Riferimento completo body: vedi SKILL.md.

## Sequenza obbligatoria

1. **Pull-first protocol 11 repo** (LL-Empire-023 binding) — CMD da Luke Windows. Sequenza completa in `hub/SESSION_PROTOCOL.md` §2.2.

2. **CLAUDE.md hierarchy** Anthropic 2026:
   - `~/.claude/CLAUDE.md` (USER, M1 Action 1.1)
   - `hub/steelwolf-empire-hub/CLAUDE.md` (PROJECT)
   - `config/luke-empire-config/CLAUDE.md` (governance V1-V6)
   - `<repo>/CLAUDE.md` se sessione su repo specifico

3. **SESSION_LOG.md** ultime 20 righe + **LESSONS_LEARNED.md** indice (24 LL v1.8 binding)

4. **Memory snapshot** più recente in `hub/_memory-snapshot/`

5. **Verifica empirica** sandbox vs CMD Windows (LL-Empire-024): se delta sandbox non confermato Windows-side, chiedi a Luke verifica `findstr` PRIMA di proporre azioni recovery

6. **Briefing stato** (max 10 righe):
   - Tipo ultima sessione + obiettivo + completato
   - DIRTY flag attivo? Cosa propagare (D7)?
   - Prossimo passo previsto
   - Blocchi attivi (PROTOCOLLO GO pending, drift, ecc.)
   - TIER status corrente

7. **ATTENDI GO esplicito Luke** (LL-Empire-002 NON DEROGABILE)
   - Default state = WAIT
   - Leggere/capire/vedere ≠ permesso eseguire
   - Solo "GO" o approvazione esplicita = procedere

Argomento opzionale `$1`: nome progetto target (es. `trading-alliance-bots`, `ironx-ecosystem`).

LL critiche binding: 002, 008, 011, 014, 018, 019, 021, 023, 024
