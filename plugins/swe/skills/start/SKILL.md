---
description: "Apertura sessione Empire SteelWolf. Pull-first 11 repo (LL-Empire-023) + leggi CLAUDE.md hierarchy + ultime 20 righe SESSION_LOG + LESSONS_LEARNED indice + memory snapshot piu' recente + briefing stato + ATTENDI GO esplicito Luke (LL-Empire-002). Token saving target 3-5K. Trigger: /swe:start <progetto-opzionale>."
allowed-tools: Read Bash Grep Glob
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

# EMPIRE START v1.0

Apertura sessione Empire — Cowork, Code o Chat. Token-saving target: 3-5K read iniziale.

> Creata 2026-04-26 in `hub/steelwolf-empire-hub/.claude/skills/`. Split da empire-session §2 (deprecato).
> Binding: LL-Empire-002 (PROTOCOLLO GO), LL-Empire-008 (verifica empirica), LL-Empire-023 (pull-first), LL-Empire-024 (sandbox stale).

---

## §1 — TIPI DI SESSIONE

| Tipo | Uso | Chi |
|------|-----|-----|
| **A** | Architettura, skill, governance, ricerca profonda | Cowork (Opus) |
| **B** | Sviluppo, docs, design, fix, planning, migration | Claude Code (Sonnet) |
| **C** | Operations: deploy, git ops, security fix, cleanup | Claude Code (Sonnet) |
| **D** | Analisi: TA, review, audit qualita', cross-check | Opus o Sonnet |
| **E** | Closure post-recovery (caso speciale) | Cowork |

Dichiarare tipo nella prima riga sessione: "Sessione Tipo X — obiettivo".

---

## §2 — STEP 1: PULL-FIRST PROTOCOL (LL-Empire-023 binding)

**OBBLIGATORIO** prima di qualsiasi altra azione. CMD Luke da Windows:

```cmd
cd /d %USERPROFILE%\SteelWolf_Empire\hub\steelwolf-empire-hub && git pull origin Dev_Academy
cd /d %USERPROFILE%\SteelWolf_Empire\hub\steelwolf-empire-core && git pull origin dev
cd /d %USERPROFILE%\SteelWolf_Empire\hub\steelwolf-empire-meta && git pull origin dev
cd /d %USERPROFILE%\SteelWolf_Empire\config\luke-empire-config && git pull origin main
cd /d %USERPROFILE%\SteelWolf_Empire\trading-alliance-bots && git pull origin dev
cd /d %USERPROFILE%\SteelWolf_Empire\ta-academy && git pull origin dev
cd /d %USERPROFILE%\SteelWolf_Empire\ta-analysis && git pull origin dev
cd /d %USERPROFILE%\SteelWolf_Empire\ta-content && git pull origin dev
cd /d %USERPROFILE%\SteelWolf_Empire\ta-knowledge && git pull origin dev
cd /d %USERPROFILE%\SteelWolf_Empire && git pull origin main
```

Sequenza completa 11 repo: vedi `hub/SESSION_PROTOCOL.md` §2.2.

**Post-pull verifica `git status` per ogni repo.** Se molti file "modified" senza intervento Luke → drift CRLF (LL-Empire-014):

```cmd
git add --renormalize .
git commit -m "fix: line-ending normalization (LL-014)"
```

---

## §3 — STEP 2: CONTESTO HIERARCHY (Anthropic 2026)

Lettura ordinata, token-economic:

1. `~/.claude/CLAUDE.md` (USER-level, M1 Action 1.1)
2. `hub/steelwolf-empire-hub/CLAUDE.md` (PROJECT-level Empire)
3. `config/luke-empire-config/CLAUDE.md` (governance V1-V6)
4. `<repo target>/CLAUDE.md` se sessione su repo specifico
5. Ultime 20 righe `hub/steelwolf-empire-hub/SESSION_LOG.md`
6. Indice `hub/steelwolf-empire-hub/LESSONS_LEARNED.md` (LL binding)
7. Memory snapshot piu' recente in `hub/_memory-snapshot/`
8. Memoria Cowork `%APPDATA%\Claude\...\memory\MEMORY.md`

---

## §4 — STEP 3: VERIFICA EMPIRICA STATO (LL-Empire-024 sandbox check)

Prima di briefing, verifica che vista sandbox bash sia coerente con CMD Windows:

```bash
git rev-parse HEAD
git status -sb
```

Se sandbox mostra delta non confermato da Luke via CMD Windows → **LL-Empire-024 sandbox stale**: chiedi a Luke verifica `findstr` Windows-side prima di proporre azioni recovery. CMD Windows e' SEMPRE autoritativo.

---

## §5 — STEP 4: BRIEFING

Riassumi a Luke (max 10 righe):
- Tipo ultima sessione + obiettivo + completato
- DIRTY flag attivo? Cosa propagare (D7)?
- Prossimo passo previsto
- Eventuali blocchi attivi (PROTOCOLLO GO pending, drift, ecc.)
- TIER status corrente (es. "TIER 2 ✅ Bootstrap PASS 32/32")

---

## §6 — STEP 5: ATTENDI GO (LL-Empire-002 binding NON DEROGABILE)

**ZERO esecuzione prima di GO esplicito Luke.**

- Leggere istruzioni NON e' permesso eseguirle
- Capire cosa va fatto NON e' permesso farlo
- Vedere il prossimo task NON e' permesso farlo
- Solo "GO" o approvazione esplicita = permesso procedere

Default state = WAIT. Per ops filesystem destructive: GO esplicito mandatory PER OGNI step.

---

## §7 — SKILL ATTIVAZIONE PER TIPO

| Tipo | Skill da attivare in aggiunta a empire-start |
|------|---------------------------------------------|
| Qualsiasi | empire-pattern-detector |
| A | empire-docs + skill-creator |
| B | empire-quality (pre-commit) + skill specifiche repo |
| C | empire-quality (pre-deploy) |
| D | empire-quality + skill dominio specifiche |

Per repo IronX: ironx-prime PRIMA di empire-start (firewall §11).

---

## RIFERIMENTI

- Workflow completo: `hub/SESSION_PROTOCOL.md`
- Closure: skill `empire-end`
- Compact mid-session: skill `empire-compact`
- Roadmap M1: `hub/ROADMAP_M1_M2_ANTHROPIC_2026_ALIGN.md` Action 1.2
- LL critiche binding: 002, 008, 011, 014, 018, 019, 021, 023, 024
