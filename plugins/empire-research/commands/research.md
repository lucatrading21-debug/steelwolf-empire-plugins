---
description: "Empire research enforcement — WebFetch + WebSearch verifica empirica live di schema/spec/feature esterno Anthropic/GitHub PRIMA di proporre architettura. Anti-confabulation pattern LL-Empire-011 + LL-Empire-024."
argument-hint: [topic-da-verificare]
allowed-tools: Read WebFetch WebSearch Bash Grep
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

Esegui workflow research Empire seguendo skill `research` plugin empire-research
in `skills/research/SKILL.md`. Riferimento completo body: vedi SKILL.md.

## Sequenza obbligatoria

1. **WebFetch fonti autoritative** (almeno 2):
   - docs.claude.com / code.claude.com / platform.claude.com / support.claude.com

2. **WebSearch GitHub Issues** anthropic/claude-code per BUG / FEATURE / DOCS issues correlate

3. **WebSearch community** pattern validation (awesome-claude-*, blog 2026)

4. **Cross-check vs Roadmap interna Empire** (hub/ROADMAP_*, hub/LESSONS_LEARNED.md)

5. **Report findings con citazioni VERBATIM** — no paraphrasing che cambia semantica

6. **Pre-Mortem Q1-Q5** sui findings prima di action

7. **Output report** template skills/research/SKILL.md §5

Argomento `$1`: topic da verificare (es. "plugin hooks", "marketplace.json schema", "skill auto-discovery").

## Regole binding

- Mai assumere senza verifica live
- Roadmap interne NON autoritative per spec esterno (LL-Empire-027)
- Cita verbatim
- Verifica recency sources

LL critiche binding: 008 (verifica empirica), 011 (anti-confabulation), 024 (sandbox stale), 027 (Roadmap non autoritative)
