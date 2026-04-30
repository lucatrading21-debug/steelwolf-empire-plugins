# empire-core

> **SteelWolf Empire — core utilities plugin** per Claude (Code CLI + Cowork desktop + Web).
>
> Cross-workspace governance: quality checklist + pattern detection T1-T7 + Pre-Mortem Q1-Q5 binding.

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See [LICENSE](../../LICENSE).

---

## Cosa fa

`empire-core` espone utility Empire-wide cross-workspace per qualita' governance e rilevamento pattern, disponibili in OGNI repo dove Luke lavora (non solo dentro `hub/steelwolf-empire-hub`).

| Skill | Trigger | Scope |
|---|---|---|
| `empire-quality` | `/empire-core:quality` o auto-discovery pre-commit | Checklist pre-commit cross-repo Empire-wide |
| `empire-pattern-detector` | `/empire-core:detector` o sempre attivo background | Rilevamento pattern T1-T7 + Pre-Mortem Q1-Q5 gate |

---

## Slash commands

| Command | Skill triggered | Scope |
|---|---|---|
| `/empire-core:quality` | `empire-quality` | Esegue checklist pre-commit universale (codice, docs, skill, git) + criteri accettazione + zero-regression rule |
| `/empire-core:detector` | `empire-pattern-detector` | Attiva pattern detection T1-T7 esplicito + Pre-Mortem gate + cross-skill incongruenze §6 |

---

## Install

```bash
/plugin marketplace add lucatrading21-debug/steelwolf-empire-plugins
/plugin install empire-core@steelwolf-empire-plugins
```

---

## Uso quotidiano

### Pre-commit quality check

```
/empire-core:quality
```

Output: checklist universale §1 (codice, docs, skill, git) + criteri accettazione §2 + zero-regression rule §4. Sezioni §3 specifiche per repo (Trading-Alliance, IronX, TA-*) sono **TBD STUB v0.1**, da popolare in sessione dedicata futura (M2 P2 Fase 2 candidate).

### Pattern detection esplicito

```
/empire-core:detector
```

Output: scan §1-§8 pattern detection v4.0 — context-aware project detection da `CLAUDE.md` locale, classificazione T1-T7 + urgency, auto-priorita T2>T6>T3>T1>T5>T4>T7, Pre-Mortem §5B Q1-Q5 obbligatorio per nuove proposte, cross-skill incongruenze §6, IronX firewall §11.

### Auto-discovery

Entrambe le skill attivano AUTO via Claude skill discovery quando:
- `empire-quality`: contesto pre-commit, mention "checklist", "quality", "pre-commit", "rilascio"
- `empire-pattern-detector`: SEMPRE attivo background (governance), trigger T1-T7 frasi segnale (vedi SKILL.md §3)

---

## Architettura

```
empire-core/
├── .claude-plugin/
│   └── plugin.json                      # plugin metadata Anthropic 2026
├── README.md                            # questo file
├── commands/
│   ├── quality.md                       # /empire-core:quality bridge
│   └── detector.md                      # /empire-core:detector bridge
└── skills/
    ├── empire-quality/
    │   └── SKILL.md                     # body + checklist §1-§4
    └── empire-pattern-detector/
        └── SKILL.md                     # body + T1-T7 §1-§8 + Pre-Mortem §5B
```

Pattern dual skills+commands segue convention `swe` + `empire-research` (consistency Empire marketplace).

---

## Source of truth

- **Plugin (questo)** = master per body skill body (cross-workspace canonical).
- **Workspace `hub/steelwolf-empire-core/skills/{empire-quality,empire-pattern-detector}/`** = sync copy con `name:` field per backward compat workspace skill discovery hub-side.
- Body markdown `§1-§N` identico bit-per-bit tra plugin e workspace (verificato Diff M2 P2 Fase 1 closure).

Aggiornamenti future: editare PRIMA plugin, poi propagare workspace via diff body section. Frontmatter divergence intenzionale (plugin schema vieta `name:` per Issue #22063).

---

## LL-Empire binding

- **LL-Empire-002** PROTOCOLLO GO non derogabile (skill detector §5)
- **LL-Empire-004** Pre-Mortem Q1-Q5 obbligatorio nuove proposte (detector §5B)
- **LL-Empire-005** Bias ragionevolezza apparente (detector §5B refuta proposte plausibili senza dati)
- **LL-Empire-007** Conflict hierarchy (Schema Anthropic > Roadmap Empire > Sonnet review > assunzioni)
- **LL-Empire-008** Verifica empirica obbligatoria (Pre-Mortem Q1+Q5 dati misurati)
- **LL-Empire-018** File generation pre-flight check (quality §1)
- **LL-Empire-022** Repo Git untracked dirs checklist (quality §1)
- **LL-Empire-023** Pull-first protocol (quality §1)

---

## CI Validation

GitHub Actions workflows validano automaticamente:
- `plugin-schema-validate.yml` → `.claude-plugin/plugin.json` schema (semver, kebab-case, ≥30 char description)
- `skill-schema-validate.yml` → `skills/**/SKILL.md` frontmatter (NO `name:` field per Issue #22063, description required, allowed-tools opzionale)

Pre-commit local: `bash scripts/pre-commit-validate.sh` (root marketplace repo).

---

## Roadmap

- **v1.0.0** (questa release, M2 P2 Fase 1 closure 2026-04-30): migration empire-quality + empire-pattern-detector cross-workspace via plugin.
- **v1.1.0** (M2 P2 Fase 2 candidate): popolazione §3 sezioni repo-specifiche empire-quality (Trading-Alliance, IronX, TA-*).
- **v1.2.0** (M3 candidate): integrazione cross-plugin con `empire-research` (research findings → pattern detector T2/T3 entries automatic).

---

## License

UNLICENSED proprietary. See [LICENSE](../../LICENSE).
