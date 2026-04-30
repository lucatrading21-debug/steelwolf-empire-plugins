---
description: "Verifica empirica live (WebFetch + WebSearch) di schema/spec/feature esterno Anthropic/GitHub PRIMA di proporre architettura o implementazione. Enforcement automatico LL-Empire-024 (sandbox stale) + LL-Empire-011 (anti-confabulation Sonnet) + LL-Empire-027 (Roadmap interne NON autoritative per spec esterno) + LL-Empire-025 (schema autoritativo Anthropic > Roadmap). Trigger naturale: contesto utente menziona 'schema', 'spec', 'plugin', 'hook', 'API Anthropic', 'feature recente', 'best practice 2026', 'plugin marketplace', 'hooks.json', 'settings.json', 'plugin.json', 'SKILL.md frontmatter', 'GitHub Actions Anthropic', 'Issue #', 'docs.claude.com'. Enforce verifica autoritativa GitHub raw (anthropics/claude-code main branch) quando docs.claude.com NOT reachable (redirect 3xx). Output cross-reference empire-pattern-detector T6 (incongruenze cross-skill) per pattern automatic flagging."
allowed-tools: Read WebFetch WebSearch Bash Grep
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

# EMPIRE RESEARCH v1.1

Skill che FORZA verifica empirica di spec/schema/feature esterno PRIMA di scrivere codice o proporre architettura. Anti-confabulation enforcement automatico.

> Creata 2026-04-27 in plugin `empire-research`. Binding: LL-Empire-008 (verifica empirica), LL-Empire-011 (Sonnet confabulation), LL-Empire-024 (sandbox stale), LL-Empire-025 (schema autoritativo Anthropic), LL-Empire-027 (Roadmap interne non autoritative).
> v1.1 enhancement (M2 P2 Fase 1 closure 2026-04-30 continuation S4): aggiunta §6.1 cross-reference empire-pattern-detector T6 (incongruenze cross-skill ciclate verso pattern detector) + trigger phrases description aggressive (plugin marketplace / hooks.json / settings.json / plugin.json / SKILL.md frontmatter / GitHub Actions / Issue # / docs.claude.com).

---

## §1 — TRIGGER OBBLIGATORI

Skill DEVE attivarsi (auto OR via `/empire-research:research`) se prompt utente o contesto include:

- "schema" / "spec" / "format" Anthropic
- "plugin" / "marketplace" / "hook" / "agent" Claude
- "feature recente" / "2026" / "best practice"
- "Roadmap" interna Empire menziona spec esterno
- Implementazione contro API/SDK Anthropic
- Cross-platform pattern (Cowork/Code/Web)
- Bug noto / GitHub Issue Anthropic
- **NUOVO v1.1:** "plugin marketplace" / "hooks.json" / "settings.json" / "plugin.json" / "SKILL.md frontmatter"
- **NUOVO v1.1:** "GitHub Actions Anthropic" / "Issue #" / "docs.claude.com"

## §2 — METODOLOGIA RICERCA OBBLIGATORIA

### Step 1 — WebFetch fonti autoritative (mandatory)

Almeno 2 fonti tra:
- `https://docs.claude.com/en/docs/<topic>` (Anthropic ufficiale)
- `https://code.claude.com/docs/en/<topic>` (Claude Code docs)
- `https://platform.claude.com/docs/en/<topic>` (Anthropic API docs)
- `https://support.claude.com/en/articles/<id>` (Help Center)

**Workaround docs.claude.com NOT reachable** (redirect 3xx, finding empirico S4 2026-04-30): usa GitHub raw fonte autoritativa fallback:
- `https://raw.githubusercontent.com/anthropics/claude-code/main/plugins/<plugin>/skills/<skill>/SKILL.md`
- `https://api.github.com/repos/anthropics/claude-code/git/trees/main?recursive=1`

### Step 2 — WebSearch GitHub Issues anthropic/claude-code

Cerca pattern `BUG`, `FEATURE`, `DOCS` issues su:
- `github.com/anthropics/claude-code/issues`
- `github.com/anthropics/claude-plugins-official/issues`
- Verifica issue OPEN vs CLOSED + data ultimo update

### Step 3 — WebSearch community pattern (validation)

Cerca implementazioni reali:
- `awesome-claude-skills`, `awesome-claude-plugins`
- Blog posts 2026 (date-filter)
- DeepWiki references plugin/skill

### Step 4 — Cross-check vs Roadmap interna Empire

Confronta findings live con:
- `hub/ROADMAP_M1_M2_ANTHROPIC_2026_ALIGN.md`
- `hub/LESSONS_LEARNED.md` (LL-Empire bindings)
- `hub/ADR/ADR-NNN-*.md` (decisioni firmate Luke)

### Step 5 — Report findings con citazioni VERBATIM

Format output:

```markdown
## Findings autoritative (WebFetch live)

### Citation 1 — [docs.claude.com URL]
> "verbatim quote..."

### Citation 2 — [GitHub Issue #NNNN]
> "verbatim quote..."

## Confronto Roadmap interna Empire
- Allineamento: ...
- Discrepanze: ...

## Decisione raccomandata
- ...
```

## §3 — REGOLE BINDING

- **Mai assumere** — solo data autoritativa via tool live
- **Roadmap interne NON autoritative** per spec esterno (LL-Empire-027)
- **Cita verbatim** quando possibile (no paraphrasing che cambia semantica)
- **Date sources** — verifica recency (post knowledge cutoff modello)
- **GitHub Issues OPEN** come red flag (BUG noti)
- **Pre-Mortem post-research** — Q1-Q5 sui findings prima di action

## §4 — ANTI-CONFABULATION PATTERN (LL-Empire-011)

Se findings WebFetch contraddicono claim modello (es. Sonnet narrative plausibile ma falsa):

1. PRIORITÀ DATI EMPIRICI sopra modello reasoning
2. Documenta confabulation in LESSONS_LEARNED (rinforza LL-011)
3. Update skill description per catch pattern futuri
4. Notifica Luke con "WebFetch contraddice ipotesi precedente: <citazione>"

## §5 — OUTPUT REPORT TEMPLATE

```markdown
# Research Report — <topic>

**Date:** YYYY-MM-DD HH:MM CEST
**Scope:** <breve>

## Sources WebFetched
- [URL 1]
- [URL 2]

## Sources WebSearched
- query: "..."
- top results: [...]

## Findings critici (verbatim citations)
> "quote 1"
> "quote 2"

## Confronto Roadmap interna
- Allineamento: ...
- Discrepanze: ...

## Bug noti / Limitations (GitHub Issues)
- Issue #NNNN: ...

## Decisione raccomandata
- Path A/B/C: ...
- Pre-Mortem Q1-Q5: ...

## Verbatim sources for closure docs
[Title 1](URL1)
[Title 2](URL2)
```

## §6 — INTEGRAZIONE EMPIRE WORKFLOW

Skill `empire-research` triggera:
- All'inizio task implementazione contro spec esterno
- Pre Action 1.X di Roadmap M1-M2-M3 (Anthropic 2026 alignment)
- Pre proposta nuovo plugin Empire
- Pre patch schema breaking change

Output report stored: 
- Verbatim citations → SESSION_LOG entry
- LL-Empire candidate → LESSONS_LEARNED se pattern emerge
- Reference URLs → ADR-NNN se decisione architetturale

## §6.1 — INTEGRAZIONE empire-pattern-detector (cross-skill T6, NEW v1.1)

Findings WebFetched possono triggerare pattern detection T6 (incongruenze cross-skill) automatic verso skill `empire-core:detector`:

| Discrepanza WebFetch | T6 Urgency | Destinazione pattern |
|---|---|---|
| `docs.claude.com` schema contraddice `hub/CLAUDE.md` | **CRITICAL** | LESSONS_LEARNED.md hub + CLAUDE.md hub aggiornamento |
| Roadmap interna assume feature inesistente | **IMPORTANT** | LESSONS_LEARNED.md hub (LL-Empire-027 binding rinforzo) |
| Schema Empire-defined diverge da Anthropic 2026 official | **CRITICAL** | ADR-NNN motivazione documentata (es. Issue #22063 enforcement Empire) |
| GitHub Issue OPEN identifica BUG runtime | **IMPORTANT** | CLAUDE.md hub sezione caveat noti |
| Plugin pattern Anthropic non riflesso in Empire | **USEFUL** | empire-research/SKILL.md trigger phrases update |

**Procedura:** research output → suggerimento empire-pattern-detector §5 procedure (NON edit autonomo). Pattern detector decide priorita auto T2>T6>T3>T1>T5>T4>T7. Luke approva GO esplicito (LL-Empire-002).

## RIFERIMENTI

- LL-Empire-008 (verifica empirica obbligatoria)
- LL-Empire-011 (Sonnet confabulation pattern)
- LL-Empire-024 (sandbox stale post-pull)
- LL-Empire-025 (schema autoritativo Anthropic)
- LL-Empire-027 (Roadmap interne non autoritative)
- ADR-008 (plugin marketplace architecture)
- Skill cross-reference: `empire-core:detector` (T6 cross-skill incongruenze)
