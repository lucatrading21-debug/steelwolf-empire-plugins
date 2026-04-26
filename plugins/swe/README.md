# `swe` — SteelWolf Empire workflow plugin

> Plugin core SteelWolf Empire per workflow sessione Anthropic Claude (Code CLI + Cowork desktop + Web).

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See ../../LICENSE.

**Version:** 1.0.0
**Plugin name:** `swe` (namespaced)
**Slash invocation pattern:** `/swe:<command>`

## Slash commands

### `/swe:start [progetto]` — Apertura sessione

Esegue workflow apertura completo:
1. Pull-first protocol 11 repo Empire (LL-Empire-023)
2. CLAUDE.md hierarchy lettura (USER + PROJECT + repo)
3. SESSION_LOG ultime 20 righe + LESSONS_LEARNED indice
4. Memory snapshot più recente
5. Verifica empirica sandbox vs CMD Windows (LL-Empire-024)
6. Briefing stato (max 10 righe)
7. ATTENDI GO esplicito Luke (LL-Empire-002 NON DEROGABILE)

### `/swe:end` — Chiusura sessione

Esegue protocollo D6:
1. SESSION_LOG.md entry formato D6 (5 righe + DIRTY + Timestamp)
2. LESSONS_LEARNED.md update se nuove LL
3. EMPIRE_DASHBOARD.md update se status cambiato
4. Memory snapshot ADR-005 FALLBACK 2 (closure critica)
5. Commit atomic LL-Empire-018 (file specifici, NO `git add -A`)
6. **GATE binding** (LL-Empire-024): `git status` clean su CMD Windows
7. Push delegato Luke V1 parity verify
8. V6 backup se prossima sessione filesystem-destructive

### `/swe:compact [istruzione]` — Compact mid-session

Compact mirato a 60-70% context usage:
1. Pre-compact write LL-Empire-003 mandate
2. Identifica file critici aperti
3. Preferire sub-agent (Task tool) >40% budget
4. Compact istruzione mirata
5. Post-compact verify integrità context

## Skills auto-discovered

Le 3 skill in `skills/` triggerano automaticamente via description matching quando contesto utente lo richiede (model invocation). Pattern Anthropic 2026 standard.

## Hooks lifecycle

- **SessionStart** → reminder Empire binding + preview SESSION_LOG
- **SessionEnd** → checklist V1 parity + V6 backup
- **UserPromptSubmit** → forced-eval 3-step (EVALUATE → ACTIVATE → IMPLEMENT) per 84-100% activation rate skill

## File structure

```
plugins/swe/
├── .claude-plugin/
│   ├── plugin.json
│   └── hooks.json
├── skills/
│   ├── start/SKILL.md
│   ├── end/SKILL.md
│   └── compact/SKILL.md
├── commands/
│   ├── start.md
│   ├── end.md
│   └── compact.md
├── hooks/
│   ├── session-start.sh
│   ├── session-end.sh
│   └── forced-eval.sh
└── README.md (this file)
```

## Empire LL binding citate nel plugin

- LL-Empire-002 PROTOCOLLO GO (non derogabile)
- LL-Empire-003 Write-immediately mandate
- LL-Empire-008 Verifica empirica obbligatoria
- LL-Empire-011 Sonnet confabulation pattern
- LL-Empire-014 CRLF cross-OS drift
- LL-Empire-018 Atomic commit (no `git add -A`)
- LL-Empire-019 V1 parity verify
- LL-Empire-021 Mai checkout `--ours/--theirs` su append-only
- LL-Empire-023 Pull-first protocol obbligatorio
- LL-Empire-024 Sandbox stale post-pull (CMD Windows autoritativo)

## License

UNLICENSED proprietary. See [../../LICENSE](../../LICENSE).
