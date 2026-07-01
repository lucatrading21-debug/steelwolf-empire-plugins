# Changelog

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

All notable changes to SteelWolf Empire plugins marketplace.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) • [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [1.3.0] — 2026-07-01

### Added

#### Plugin `swe` v1.1.0 — Apertura interattiva sessione (S158)
- `hooks/session-start.sh`: riscritto come echo statico ASCII puro (no MCP/rete/secret, no file-read) che inietta l'apertura interattiva SteelWolf: Step 0 (dichiara PC PREDATOR/ACE + git pull), doc L0, conferma stato (PC · pull · priorita) + colpo d'occhio CHECKLIST/ROADMAP, ATTENDI GO (LL-Empire-002).
- `commands/start.md`: aggiunti Step 0 (dichiara PC + pull) e step 6-bis Apertura interattiva prima di ATTENDI GO; pull-first 11 repo e CLAUDE.md hierarchy invariati.
- `skills/start/SKILL.md`: aggiunte §0 (STEP 0 dichiara PC + pull) e §5-bis (apertura interattiva — Cowork widget elicitation / Claude Code CLI testo).
- Pattern replicato da Nexus_Empire nel dominio SteelWolf (N4 dominio separato, fonte unica interna), governance LL-Empire.

#### Marketplace
- Plugin `swe` version 1.0.0 -> 1.1.0 (`plugin.json` + entry `marketplace.json`)
- `marketplace.json` metadata.version 1.2.0 -> 1.3.0

---

## [1.2.0] — 2026-06-30

### Added

#### Plugin `ironx-suite` v1.0.0 (NEW)
- `.claude-plugin/plugin.json` manifest
- README.md con tabella 15 skill + governance freeze V5
- 15 skill `ironx-*` (model-invocation, frontmatter `name` stripped per Issue #22063, CRLF→LF normalizzato):
  - `ironx-prime`, `ironx-ecosystem`, `ironx-platform-matrix`
  - `ironx-nt8`, `ironx-mql5`, `ironx-pinescript`
  - `ironx-signals`, `ironx-bar-types`, `ironx-alerts`, `ironx-confluence`
  - `ironx-research`, `ironx-engineer`, `ironx-quality`, `ironx-docs`, `ironx-session`

#### Marketplace
- `marketplace.json` metadata.version 1.1.0 → 1.2.0 + entry `ironx-suite`
- Layer 3 ADR-033: skill IronX da cache Desktop → marketplace versionato (cross-PC replicabile, NON copia cache)

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
