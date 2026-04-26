---
description: Compact mid-session Empire SteelWolf — preserva file critici (CLAUDE.md hierarchy + SESSION_LOG + write-in-progress), preferire sub-agent (Task tool) per task lunghi (preTokens isolation), pre-compact write LL-Empire-003 mandate
argument-hint: [istruzione-opzionale]
allowed-tools: Read Bash
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

Esegui workflow compact mid-session Empire SteelWolf seguendo skill `compact` plugin swe
in `skills/compact/SKILL.md`. Riferimento completo body: vedi SKILL.md.

## Sequenza obbligatoria

1. **Threshold:** 60-70% context usage trigger compact mirato (NON wholesale clear)

2. **Pre-compact write (LL-Empire-003 mandate):**
   - Salva qualsiasi draft sostanziale su filesystem ENTRO 1 turno
   - Compaction distrugge memoria conversazionale, NON file su disco

3. **Identifica file critici aperti** (lista in pre-compact memo):
   - CLAUDE.md hierarchy (USER + PROJECT + repo target)
   - SESSION_LOG.md ultime 20 righe
   - File in lavoro corrente (SKILL.md, ADR draft, ricerca pending)

4. **Preferire sub-agent (Task tool) over compact** per task >40% context budget:
   - Sub-agent isola preTokens parent (parent context preserved completo)
   - Return format: summary 50-80 righe
   - Pattern Roadmap M3 Action 3.3

5. **Compact istruzione mirata:**
   "Compact mantenendo: <lista file critici> + ultime 5 risposte Luke + decisioni architetturali sessione"

6. **Post-compact verify:** rileggi file critici per integrità context. Se persi → recovery da `_memory-snapshot/` o git history.

7. **Resume:** continua task con context più snello. Aggiorna SESSION_LOG con nota "compact mid-sessione ~HH:MM".

## Regole binding

- Mai compact mid-task (completa task corrente)
- Mai compact senza scrivere draft (LL-Empire-003)
- Mai compact con DIRTY flag attivo (propaga prima D7)
- Mai compact pre-GO Luke (context volatile invalida briefing)

Argomento opzionale `$1`: istruzione specifica per compact (es. "preserva A5_DESIGN.md").

LL critiche binding: 003 (write-immediately), 011 (Sonnet confabulation)
