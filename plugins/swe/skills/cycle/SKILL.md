---
description: "Ciclo sessione Empire SteelWolf — chiude la sessione corrente (skill end, protocollo D6 completo con GATE git clean LL-Empire-024) e, solo a closure confermata, PREPARA l'apertura della successiva scrivendo lo snapshot in SESSION_BRIEFINGS ed emettendo l'handoff da incollare in una CHAT NUOVA (session-boundary LL-Empire-050). NON apre né lavora nella stessa chat. Commit/push delegati Luke Windows. Trigger: /swe:cycle [progetto-opzionale]."
allowed-tools: Read Edit Write Bash Grep Glob
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

# EMPIRE CYCLE v1.2

Ciclo end+handoff Empire — chiude e prepara la riapertura in **chat nuova**.
Composizione delle skill `end` e `start`: non duplica la loro logica, le orchestra
con un gate di sicurezza in mezzo e il confine di sessione LL-Empire-050 rispettato.

> Creata 2026-07-01 (S160). v1.1 (S161): FASE 2 = handoff (non apertura in-chat), fix LL-Empire-050.
> v1.2 (S165): FASE 1 usa la Enriched Visual View di CHIUSURA (`end` §0-bis.2, asset `closing-card`) — non piu' widget elicitation nativo.
> Binding: LL-Empire-002 (GO), LL-Empire-018 (atomic commit), LL-Empire-019 (V1 parity), LL-Empire-023 (pull-first), LL-Empire-024 (sandbox stale → CMD Windows autoritativo), LL-Empire-050 (session boundary = nuova chat per ogni Sn).

---

## §0-ter — RISOLUZIONE PROGETTO (propagazione $1)

`/swe:cycle <progetto>` propaga `$1` a entrambe le fasi via `_PROJECTS_INDEX.yaml`:
- **FASE 1** (`end`): chiude la catena DEL PROGETTO risolto (`session_prefix`), roll-up `hub/_status/<slug>.yaml`.
- **FASE 2** (handoff): persiste `SESSION_BRIEFINGS/S<n+1>_OPEN.md` con lo slug del progetto + handoff "`/swe:start <slug>` in chat nuova".
- **GUARD**: `swe_writes: false` -> il ciclo non opera nel dominio autonomo.

---

## §1 — FASE 1: CHIUSURA (skill `end`)

Esegui l'intera skill `end` (protocollo D6):
1. §0-bis chiusura interattiva — raccolta dati D6 con **Enriched Visual View di chiusura** (`end` §0-bis.2, asset `closing-card` via `show_widget` in Cowork / testo strutturato in CLI).
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

## §3 — FASE 2: HANDOFF (prepara apertura, NON esegue in-chat)

**Regola LL-Empire-050 (session boundary): ogni sessione = chat nuova.** Aprire e
lavorare la sessione successiva nella stessa chat mescola i contesti ("si impazzisce").
Quindi il ciclo **non** esegue `start` qui: lo **prepara**.

1. **Persisti lo snapshot di apertura** — invoca la sola procedura di persistenza di `start`
   (§5-ter): scrivi `hub/SESSION_BRIEFINGS/S<n+1>_OPEN.md` (PC · pull · briefing · carryover ·
   priorità proposte) leggendo a runtime il SESSION_LOG appena aggiornato. Via bash-write
   (LL-Empire-063). Il file resta su disco anche a chat chiusa.
2. **Emetti l'handoff** in chat (max ~5 righe): "S<n> chiusa. Apri una CHAT NUOVA e lancia
   `/swe:start [progetto]`." Se `/swe:cycle $1` passa un progetto, includilo nel suggerimento.
3. **STOP.** Non eseguire l'apertura interattiva di `start` né alcun lavoro della nuova
   sessione in questa chat. Il ciclo termina.

Nella chat nuova, `/swe:start` ricostruirà il briefing e **ritroverà** lo snapshot
persistito in `SESSION_BRIEFINGS/S<n+1>_OPEN.md`.

---

## §4 — STEP FINALE: ATTENDI GO nella chat nuova (LL-Empire-002)

Il GO per il lavoro della nuova sessione si dà **nella chat nuova**, dopo `/swe:start`.
In questa chat il ciclo si limita a chiudere + handoff. Default = WAIT.

---

## §5 — NOTE OPERATIVE

- **Un comando, due skill**: `cycle` non reimplementa `end`/`start`, le richiama (FASE 1 = `end` intera; FASE 2 = solo la persistenza-briefing di `start` + handoff). I bugfix a quelle skill si propagano.
- **Perché handoff e non apertura**: LL-Empire-050. La riapertura in-chat violerebbe il confine di sessione e confonderebbe i contesti.
- **Cowork vs CLI**: chiusura interattiva usa la Enriched Visual View (`closing-card`, card HTML custom via `show_widget`) in Cowork; in CLI stesso contenuto in testo strutturato (fallback). MAI AskUserQuestion / elicitation nativo (prefill non si accende, S161).
- **Delega Luke**: commit atomici, push V1-parity e reinstall plugin restano lato Windows (LL-Empire-019/031).
- **Handoff Tipo D/K**: se cross-PC, `end` §7 governa titolo handoff + snapshot obbligatorio; lo snapshot `S<n+1>_OPEN.md` indica il PC di destinazione.

---

## RIFERIMENTI

- Chiusura: skill `end`
- Apertura: skill `start` (§5-ter persistenza briefing)
- Compact mid-session: skill `compact`
- Workflow completo: `hub/SESSION_PROTOCOL.md`
- LL critiche binding: 002, 018, 019, 021, 023, 024, 050
