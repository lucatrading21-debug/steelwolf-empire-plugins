---
description: "Ciclo sessione Empire SteelWolf — chiude la sessione corrente (skill end, protocollo D6 completo con GATE git clean LL-Empire-024) e, solo a closure confermata, riapre la successiva (skill start, apertura interattiva + ATTENDI GO). Un solo comando per il passaggio consecutivo tra sessioni. Commit/push delegati Luke Windows. Trigger: /swe:cycle [progetto-opzionale]."
allowed-tools: Read Edit Write Bash Grep Glob
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

# EMPIRE CYCLE v1.0

Ciclo end+start Empire — chiude e riapre in un colpo. Composizione delle skill
`end` e `start`: non duplica la loro logica, le orchestra in sequenza con un gate
di sicurezza in mezzo.

> Creata 2026-07-01 (S160). Dominio SteelWolf N4.
> Binding: LL-Empire-002 (GO), LL-Empire-018 (atomic commit), LL-Empire-019 (V1 parity), LL-Empire-023 (pull-first), LL-Empire-024 (sandbox stale → CMD Windows autoritativo).

---

## §1 — FASE 1: CHIUSURA (skill `end`)

Esegui l'intera skill `end` (protocollo D6):
1. §0-bis chiusura interattiva — raccolta dati D6 (widget Cowork / testo CLI).
2. Update SESSION_LOG + LESSONS_LEARNED (se LL nuove) + EMPIRE_DASHBOARD (se status cambiato) + memory snapshot.
3. Commit atomic LL-Empire-018 (file specifici, MAI `git add -A`).
4. **GATE LL-Empire-024:** `git status` clean su **CMD Windows**.
5. Push delegato Luke (V1 parity) + V6 backup se la prossima sessione è filesystem-destructive.

---

## §2 — CHECKPOINT (gate di transizione)

**Non attraversare senza closure pulita.**

- Se il working tree NON è clean Windows-side → **STOP in FASE 1**. Risolvi (commit/stash/conflict LL-Empire-021) prima di procedere.
- Il ciclo entra in FASE 2 **solo** a closure confermata (WT clean verificato CMD Windows).
- Cowork non pusha né dichiara closure da solo: la conferma "clean" è Windows-side (LL-Empire-024).

---

## §3 — FASE 2: APERTURA (skill `start`)

Esegui l'intera skill `start` per la sessione successiva:
1. §0 Step 0 — dichiara PC + pull-first 11 repo (LL-Empire-023).
2. CLAUDE.md hierarchy + SESSION_LOG ultime 20 righe + LESSONS_LEARNED indice + memory snapshot.
3. Verifica empirica sandbox vs CMD Windows (LL-Empire-024).
4. Briefing stato (max 10 righe).
5. §5-bis apertura interattiva (widget PC · pull · priorità + colpo d'occhio CHECKLIST/ROADMAP).

Se `/swe:cycle $1` passa un progetto, inoltralo a `start` come target.

---

## §4 — STEP FINALE: ATTENDI GO (LL-Empire-002 NON DEROGABILE)

Dopo l'apertura interattiva della nuova sessione: **default = WAIT**.
Nessuna esecuzione del lavoro della nuova sessione prima di GO esplicito Luke.

---

## §5 — NOTE OPERATIVE

- **Un comando, due skill**: `cycle` non reimplementa `end`/`start`, le richiama. Ogni bugfix a quelle skill si propaga automaticamente al ciclo.
- **Cowork vs CLI**: chiusura interattiva e apertura usano widget elicitation in Cowork; in Claude Code CLI stesso contenuto in testo.
- **Delega Luke**: commit atomici, push V1-parity e reinstall plugin restano lato Windows (LL-Empire-019/031).
- **Uso tipico**: fine giornata / passaggio S(n) → S(n+1) consecutivo senza cambio chat manuale, oppure handoff Tipo D/K (in tal caso `end` §7 governa il titolo handoff + snapshot obbligatorio).

---

## RIFERIMENTI

- Chiusura: skill `end`
- Apertura: skill `start`
- Compact mid-session: skill `compact`
- Workflow completo: `hub/SESSION_PROTOCOL.md`
- LL critiche binding: 002, 018, 019, 021, 023, 024
