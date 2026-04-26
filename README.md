# SteelWolf Empire — Claude Plugins Marketplace

> Anthropic 2026-native plugin marketplace per workflow operations dell'**Empire SteelWolf** ecosystem (Trading Alliance, IronX, TA-Academy, Empire Hub).

[![License: UNLICENSED](https://img.shields.io/badge/license-UNLICENSED-red.svg)](./LICENSE)
[![Anthropic 2026 Native](https://img.shields.io/badge/Anthropic-2026%20native-blue.svg)](https://code.claude.com/docs/en/plugins)
[![Cross-platform](https://img.shields.io/badge/Cowork%20%7C%20Code%20CLI%20%7C%20Web-supported-green.svg)](#compatibility)

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See [LICENSE](./LICENSE).

---

## Cos'è SteelWolf Empire

Empire SteelWolf è un'infrastruttura cross-PC dual-workflow PREDATOR/ACE per gestione sessioni lavoro su 11 repo Empire ecosystem. Questo marketplace pubblica i plugin Claude che implementano i workflow Empire come componenti Anthropic-native installabili.

**Pattern Anthropic 2026:**

```
steelwolf-empire-plugins/
├── .claude-plugin/marketplace.json    ← marketplace definition
└── plugins/
    └── swe/                           ← plugin SteelWolf workflow Empire
        ├── .claude-plugin/
        │   ├── plugin.json            ← plugin manifest
        │   └── hooks.json             ← lifecycle hooks
        ├── skills/                    ← auto-discovery (model invocation)
        │   ├── start/SKILL.md         ← /swe:start auto-fire context-match
        │   ├── end/SKILL.md           ← /swe:end
        │   └── compact/SKILL.md       ← /swe:compact
        ├── commands/                  ← slash explicit (user invocation)
        │   ├── start.md               ← `/swe:start` typed by user
        │   ├── end.md
        │   └── compact.md
        └── hooks/                     ← lifecycle scripts
            ├── session-start.sh
            ├── session-end.sh
            └── forced-eval.sh         ← 84-100% skill activation
```

## Plugin disponibili

### 🚀 `swe` — SteelWolf Empire workflow (v1.0.0)

Plugin core per workflow sessione Empire:

| Slash Command | Skill | Effetto |
|---|---|---|
| `/swe:start [progetto]` | `swe:start` | Apertura sessione: pull-first 11 repo, CLAUDE.md hierarchy, SESSION_LOG, LESSONS_LEARNED, memory snapshot, briefing, ATTENDI GO Luke |
| `/swe:end` | `swe:end` | Chiusura D6: SESSION_LOG entry, LESSONS_LEARNED update, EMPIRE_DASHBOARD, commit atomic, V1 parity verify, GATE git status clean |
| `/swe:compact [istruzione]` | `swe:compact` | Compact mid-session: preserva file critici, preferire sub-agent delegation, 60-70% threshold |

**Hooks:**
- `SessionStart` → reminder LL-Empire binding + ultima entry SESSION_LOG
- `SessionEnd` → checklist V1 parity + V6 backup
- `UserPromptSubmit` (forced-eval) → 3-step EVALUATE/ACTIVATE/IMPLEMENT (84-100% activation)

## Installation

Vedi [INSTALL.md](./docs/INSTALL.md) per istruzioni complete per ogni client Claude (Code CLI, Cowork desktop, Web).

**Quick start (Cowork desktop):**

```
/plugin marketplace add lucatrading21-debug/steelwolf-empire-plugins
/plugin install swe@steelwolf-empire-plugins
```

Poi in nuova chat:
```
/swe:start
```

## Compatibility

| Client | Auto-discovery (skills) | Slash commands | Hooks |
|---|---|---|---|
| **Claude Code CLI** | ✅ supported | ✅ `/swe:start` etc. | ✅ supported |
| **Claude Cowork desktop** | ✅ supported | ✅ supported (Cowork ≥ 2026.04) | ⚠️ Issue [#27398](https://github.com/anthropics/claude-code/issues/27398) — fallback ~/.claude/settings.json |
| **Claude.ai web** | ✅ supported | ✅ supported (project context) | N/A (no shell hooks on web) |

## Architecture

Vedi [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) per design decisions, naming conventions (`/swe:` namespace), pattern dual skills+commands, fallback strategies, e cross-platform considerations.

## Development

Vedi [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) per local plugin dev, schema validation, CI workflow, contribution guidelines.

## Versioning

Vedi [CHANGELOG.md](./CHANGELOG.md). Plugin versions sono indipendenti — ognuno segue semantic versioning (semver).

## Empire ecosystem reference

Questo plugin marketplace è parte dell'Empire SteelWolf ecosystem. Repo correlati (privati):

- `steelwolf-empire-hub` — meta-architettura, ADR, governance
- `steelwolf-empire-core` — skill empire-core (legacy, in migration)
- `SteelWolf_Empire_Sync` — workspace sync cross-PC
- `Trading-Alliance-Bots` — bot Telegram production
- `IronX_EcoSystem` — indicatori MT5/TV/NT8
- `TA-Academy/Analysis/Content/Knowledge` — contenuti educativi
- `luke-empire-config` — governance V1-V6, scripts, ISTRUZIONI

## Author

**Luke SteelWolf** — [GitHub](https://github.com/lucatrading21-debug)

## License

UNLICENSED proprietary. See [LICENSE](./LICENSE).

Plugin installabile via Anthropic marketplace standard mechanism. NO redistribute, NO modify, NO commercial use senza permesso scritto. Bug reports welcome via GitHub Issues.

---

🔥 _Empire SteelWolf — l'eccellenza non è un'opzione, è il metodo._
