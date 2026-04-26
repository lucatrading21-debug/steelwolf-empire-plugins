# Changelog

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

All notable changes to SteelWolf Empire plugins marketplace.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) • [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [1.0.0] — 2026-04-27

### Added — Initial release

#### Marketplace
- `.claude-plugin/marketplace.json` — multi-plugin marketplace definition
- LICENSE (UNLICENSED proprietary)
- README.md root con quick start
- docs/INSTALL.md per Cowork + Code CLI + Web
- docs/DEVELOPMENT.md guide for plugin authors
- docs/ARCHITECTURE.md design decisions
- CHANGELOG.md (this file)
- .github/workflows/ CI schema validation

#### Plugin `swe` v1.0.0
- `.claude-plugin/plugin.json` manifest
- `.claude-plugin/hooks.json` lifecycle hooks
- Skills auto-discovery (model invocation):
  - `skills/start/SKILL.md` — apertura sessione Empire
  - `skills/end/SKILL.md` — chiusura D6
  - `skills/compact/SKILL.md` — compact mid-session
- Commands slash explicit (user invocation):
  - `commands/start.md` — `/swe:start`
  - `commands/end.md` — `/swe:end`
  - `commands/compact.md` — `/swe:compact`
- Hooks lifecycle scripts:
  - `hooks/session-start.sh` — reminder LL-Empire binding
  - `hooks/session-end.sh` — V1 parity checklist
  - `hooks/forced-eval.sh` — 84-100% skill activation pattern (Gap 10)

### Architecture decisions
- Plugin name `swe` (3 char namespace, slash `/swe:<command>`)
- Skill `name:` field OMITTED (Issue #22063 fix)
- Dual pattern skills/+commands/ (Anthropic 2026 native)
- License UNLICENSED proprietary, repo pubblico per marketplace install
- Hooks bash cross-platform via `${CLAUDE_PLUGIN_ROOT}`

### Empire LL binding referenced
LL-Empire-002, 003, 008, 011, 014, 018, 019, 021, 023, 024 (28+ lessons total)

### Compatibility
- ✅ Claude Code CLI
- ✅ Claude Cowork desktop ≥ 2026.04
- ⚠️ Claude.ai web (skills only, slash limited)

### Known issues
- Issue #27398: plugin hooks Cowork potrebbe non firere — fallback `~/.claude/settings.json`
- Issue #26951: marketplace install HTTP 404 occasional — retry pattern

---

## Future releases (planned)

### [1.1.0] — TBD
- Plugin `empire-research` — WebFetch + verifica spec esterno automatica
- Migration empire-quality, empire-pattern-detector, empire-docs da legacy core repo

### [1.2.0] — TBD
- Plugin `ironx-helpers` — IronX MT5/TV/NT8 cross-platform tools
- Plugin `ta-tools` — Trading Alliance bot operations
