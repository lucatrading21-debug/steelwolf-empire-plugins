---
description: "Compact mid-session Empire SteelWolf. A 60-70% context usage triggera compact mirato preservando file critici aperti (CLAUDE.md hierarchy, SESSION_LOG, file write-in-progress). Pattern moderno Anthropic 2026: preferire sub-agent (Task tool) per task lunghi → preTokens isolation parent context. Trigger: /swe:compact <istruzione-opzionale>."
allowed-tools: Read Bash
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

# EMPIRE COMPACT v1.0

Compact mid-session Empire — gestione context window prima della saturazione.

> Creata 2026-04-26 in `hub/steelwolf-empire-hub/.claude/skills/`. Estratto da empire-session §3 (deprecato).
> Binding: LL-Empire-003 (write-immediately mandate), Roadmap M3 Action 3.3 sub-agent delegation.

---

## §1 — TRIGGER THRESHOLD

A 60-70% context usage:

- Anthropic 2026 best practice: compact **mirato**, NON wholesale clear
- Preserva file critici in context: CLAUDE.md hierarchy, SESSION_LOG ultime entry, file write-in-progress
- Drop: ricerche gia' consumate, draft gia' salvati su filesystem (LL-Empire-003), output bash voluminosi gia' processati

---

## §2 — PATTERN MODERNO: SUB-AGENT DELEGATION (preferito)

Per task lunghi (>40% context budget stimato): **preferire sub-agent (Task tool) over compact**.

**Vantaggi sub-agent:**
- Isola preTokens del parent (parent context preserved completo)
- Return format: summary 50-80 righe, non dump completo
- Evita compact entirely se task e' delegabile

**Esempi candidati sub-agent:**
- Deep research multi-source (es. Anthropic 2026 audit, NinZa reverse engineering)
- Audit empirico filesystem completo (es. 11-repo pull-first verifica)
- Code review batch >5 file (NT8 / MQL5 / Pine cross-platform)
- Test suite drill multi-step (TIER 2 bootstrap, A1 plugin verify)

---

## §3 — COMPACT WORKFLOW (se sub-agent non applicabile)

1. **Pre-compact write (LL-Empire-003 mandate):** scrivi su filesystem qualsiasi draft sostanziale (specifiche, decisioni, codice non-committato). Compaction distrugge memoria conversazionale, non file su disco.

2. **Identifica file critici aperti:** lista in pre-compact memo:
   - CLAUDE.md hierarchy (USER + PROJECT + repo target)
   - SESSION_LOG.md ultime 20 righe
   - File in lavoro corrente (es. SKILL.md, ADR draft, ricerca pending)

3. **Compact istruzione:** "Compact mantenendo: [lista file critici] + ultime 5 risposte Luke + decisioni architetturali sessione corrente".

4. **Post-compact verify:** rileggi file critici per assicurarti che context sia integro. Se persi → recovery da `_memory-snapshot/` o git history.

5. **Resume:** continua task con context piu' snello. Aggiorna SESSION_LOG con nota "compact mid-sessione ~HH:MM".

---

## §4 — REGOLE BINDING

- **Mai compact mid-task** — completa il task in corso prima
- **Mai compact senza scrivere draft** (LL-Empire-003) — compaction distrugge memoria conversazionale, non file
- **Mai compact con DIRTY flag attivo** — propaga prima (D7)
- **Mai compact pre-GO Luke** — context volatile invalida riepilogo briefing
- **Mai compact con 8+ file modified uncommitted** — committare prima (LL-Empire-018)

---

## §5 — TOKEN-SAVING TIPS PER EVITARE COMPACT

Strategie per restare sotto soglia 60% e non dover compact:

- **Read partial files:** usa `offset`/`limit` parameters invece di full read su file grandi
- **Bash filtering:** `head`/`tail`/`grep`/`findstr` invece di `cat`/`type` su file grandi
- **Memoria Cowork:** usa `*.md` files in `memory/` per stato cross-turno invece di tenerlo in conversation
- **Riferimenti incrociati:** cita file via path invece di ripeterne il contenuto
- **Skill description:** matching auto-discovery, non includere body skill nel context se non necessario
- **Plugin scope:** caricare solo skill rilevanti per il tipo sessione (vedi empire-start §7)

---

## §6 — METRICA: TOKEN BUDGET TRACKING

Roadmap M2 Action 2.8 introduce `preTokens`/`postTokens` in SESSION_LOG JSON:

```json
{
  "preTokens": 245678,
  "postTokens": 412345,
  "tokenBudgetPct": 41.2
}
```

Target empirici Empire:
- Apertura sessione (empire-start): <5K tokens
- Closure sessione (empire-end): <3K tokens
- Compact mid-session necessario se postTokens >65% budget

---

## RIFERIMENTI

- Apertura: skill `empire-start`
- Closure: skill `empire-end`
- Sub-agent pattern documentazione: Roadmap M3 Action 3.3 (deferred M3)
- Token-saving best practices: ROADMAP_M1_M2_ANTHROPIC_2026_ALIGN.md
- LL critiche binding: 003 (write-immediately), 011 (Sonnet confabulation)
