# Architecture — Design Decisions

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

Reference design SteelWolf Empire plugin marketplace.

---

## Decision 1 — Multi-plugin marketplace pattern

**Decisione:** single repository hosts multiple Empire plugins via `.claude-plugin/marketplace.json` listing.

**Rationale:**
- Pattern Anthropic-native (matches `anthropics/claude-plugins-official`, `anthropics/knowledge-work-plugins`)
- Scalability: adding new Empire plugin = new entry in `plugins[]` array, no new repo overhead
- Single source of truth per scoperta + install
- Cross-PC sync (PREDATOR ↔ ACE) via 1 git pull

**Alternatives considered:**
- 1 repo per plugin: rejected (N repo overhead for ~5 future plugins)
- Local marketplace only: rejected (Cowork desktop `--plugin-dir` not supported, Issue #26268)

## Decision 2 — Plugin name `swe` (3 char)

**Decisione:** plugin name `swe` (SteelWolf Empire abbreviation).

**Rationale:**
- Slash command pattern: `/swe:start`, `/swe:end`, `/swe:compact`
- 3 char namespace = collision-free, brand-specific
- Total slash length: 8-12 chars (vs 20+ if `/steelwolf-empire:start`)
- Anthropic plugin namespace convention: `<plugin>:<command>`

**Trade-offs:**
- Less verbose than full name → potential collision if future plugin uses `swe`
- Mitigation: namespace globally unique within Empire ecosystem

## Decision 3 — Dual pattern skills/ + commands/

**Decisione:** ogni plugin Empire fornisce ENTRAMBI:
- `skills/<name>/SKILL.md` (auto-discovery via description match — model invocation)
- `commands/<name>.md` (slash explicit — user invocation)

**Rationale:**
- Anthropic 2026 standard pattern (knowledge-work-plugins reference)
- Skills auto-fire when context matches → low-friction usage
- Commands explicit when user needs control → predictable invocation
- Cross-platform: skills work on Cowork desktop AND Claude.ai web; commands explicit più affidabili Claude Code CLI

**Citation Anthropic docs:**
> "Custom slash commands have been merged into skills. Files in .claude/commands/ still work, but skills (.claude/skills/) are now the recommended approach."

Per zero ambiguity Empire mantiene entrambi.

## Decision 4 — Skill `name` field OMETTI

**Decisione:** SKILL.md frontmatter NON include `name:` field.

**Rationale:**
- Issue #22063: `name` field bypasses plugin namespace, registering skill as `/<name>` (without plugin prefix)
- Senza `name`, folder name diventa skill identifier → invocation via plugin namespace `/swe:<folder>`
- Pulizia naming: zero confusion `/swe-start` (no namespace) vs `/swe:start` (namespaced)

**Trade-off:**
- Less explicit metadata
- Mitigation: description field exhaustive

## Decision 5 — Hooks lifecycle integration

**Decisione:** plugin include `hooks.json` con SessionStart, SessionEnd, UserPromptSubmit.

**Rationale:**
- SessionStart → reminder LL-Empire binding all'apertura sessione
- SessionEnd → checklist V1 parity + V6 backup
- UserPromptSubmit → forced-eval pattern (84-100% skill activation rate vs 20% baseline)

**Citation:**
> "Forced-eval hit 84% skill activation [Haiku 4.5]. Sonnet 4.5 with the real Claude Code environment pushes both forced-eval and llm-eval approaches to 100%."

**Known issue mitigation:** Issue #27398 plugin hooks Cowork potrebbe non firere — fallback documented in INSTALL.md (copy to `~/.claude/settings.json` user-level).

## Decision 6 — License UNLICENSED proprietary

**Decisione:** repository pubblico (per Anthropic marketplace install) ma proprietary UNLICENSED.

**Rationale:**
- Cowork desktop install richiede repo pubblico OR Claude GitHub App auth setup complesso
- V3 binding garantisce zero secrets (verified TIER 0)
- Empire = metodologia/workflow, non codice proprietario commerciale
- Code visibile (per install) ma redistribute/modify legally restricted

**Alternative rejected:**
- MIT/Apache: explicit open-source, perde controllo IP
- Private + GitHub App: setup overhead, cross-PC duplication

## Decision 7 — `commands/` come pointer leggeri ai SKILL.md

**Decisione:** commands/ files sono THIN wrapper che riferiscono al SKILL.md corrispondente.

**Rationale:**
- Single source of truth = SKILL.md (full workflow body)
- commands/ = metadata + step ad alto livello + pointer
- Zero duplication, single edit propaga
- Compatibilità: skills auto-fire IDENTICA a commands explicit invocation

## Decision 8 — Hook scripts bash (cross-platform)

**Decisione:** hook scripts `.sh` (bash), eseguiti via `bash ${CLAUDE_PLUGIN_ROOT}/hooks/<script>.sh`.

**Rationale:**
- Bash universalmente disponibile (Linux native, macOS native, Windows via Git Bash / WSL)
- `${CLAUDE_PLUGIN_ROOT}` env var supportata Anthropic 2026
- Issue #20551 known: bash hooks may fail on Windows paths with spaces (Google Drive) — workaround: avoid spaces in user path, Empire path standard `C:\Users\<user>\SteelWolf_Empire\` no spaces

**Alternative rejected:**
- PowerShell `.ps1`: Windows-only, rompe cross-platform
- Cross-platform Python script: overhead dipendenza Python

## Decision 9 — CI validation GitHub Actions

**Decisione:** automated schema validation su ogni PR/push.

**Rationale:**
- LL-Empire-024 binding: never confabulate schema, always verify
- Frontmatter validation prevents Issue #22063 (name field bug) regressions
- Plugin.json/marketplace.json schema validation catches typos pre-merge

**Implementation:** `.github/workflows/skill-schema-validate.yml` + `.github/workflows/plugin-schema-validate.yml`

## Decision 10 — Forced-eval pattern (Gap 10)

**Decisione:** UserPromptSubmit hook implements 3-step forced-eval pattern.

**Pattern:**
1. EVALUATE — for each available skill: "skill-name — YES/NO + reason"
2. ACTIVATE — if YES, invoke skill via Skill() tool BEFORE proceeding
3. IMPLEMENT — only after Step 2, proceed with implementation

**Rationale:**
- Community-validated 84-100% activation rate
- Without: ~20% activation (Claude often skips relevant skills)
- Critical for Empire daily-use reliability

## Cross-platform compatibility matrix

| Feature | Code CLI | Cowork desktop | Web (claude.ai) |
|---|---|---|---|
| Plugin install via marketplace | ✅ | ✅ (≥2026.04) | ⚠️ project-level |
| Skills auto-discovery | ✅ | ✅ | ✅ |
| Slash commands explicit | ✅ | ✅ (post Cowork ≥2026.04) | ⚠️ limited |
| Hooks lifecycle | ✅ | ⚠️ Issue #27398 | ❌ |
| Forced-eval pattern | ✅ | ⚠️ depends on hooks | ❌ |
| `${CLAUDE_PLUGIN_ROOT}` env var | ✅ | ✅ | N/A |

## Future plugins roadmap

Pianificati per Empire ecosystem:

- `empire-research` — WebFetch + verifica spec esterno automatica (Gap 6, M3)
- `empire-quality` — pre-commit checklist Empire (migration da hub/steelwolf-empire-core/skills/)
- `empire-pattern-detector` — pattern detection v4.0 (migration core)
- `empire-docs` — documentation standards (migration core)
- `ironx-helpers` — IronX-specific MT5/TV/NT8 cross-platform tools
- `ta-tools` — Trading Alliance bot operations

Reference: hub/steelwolf-empire-hub/ROADMAP_M1_M2_ANTHROPIC_2026_ALIGN.md (private)
