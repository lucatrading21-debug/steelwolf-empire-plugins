---
description: "Ciclo sessione Empire SteelWolf — chiude la sessione corrente (skill end, protocollo D6 completo con GATE git clean LL-Empire-024) e, solo a closure confermata, PREPARA l'apertura della successiva scrivendo lo snapshot in SESSION_BRIEFINGS ed emettendo l'handoff da incollare in una CHAT NUOVA (session-boundary LL-Empire-050). NON apre né lavora nella stessa chat. Commit/push delegati Luke Windows. Trigger: /swe:cycle [progetto-opzionale]."
allowed-tools: Read Edit Write Bash Grep Glob
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

# EMPIRE CYCLE v1.3

Ciclo end+handoff Empire — chiude e prepara la riapertura in **chat nuova**.
Composizione delle skill `end` e `start`: non duplica la loro logica, le orchestra
con un gate di sicurezza in mezzo e il confine di sessione LL-Empire-050 rispettato.

> Creata 2026-07-01 (S160). v1.1 (S161): FASE 2 = handoff (non apertura in-chat), fix LL-Empire-050.
> v1.2 (S165): FASE 1 usa la Enriched Visual View di CHIUSURA (`end` §0-bis.2, asset `closing-card`) — non piu' widget elicitation nativo.
> v1.4 (S166 Passo 4): §3-bis persistenza blocco swe-model in S<n+1>_OPEN.md (SSOT card deterministica) + CARD FREEZE. Card handoff INVARIATA.
> v1.3 (S165): FASE 2 rende la Enriched Visual View di HANDOFF (asset `cycle/assets/handoff-card`) — ponte S(n)->S(n+1) ricco come opening-card (meta+ora, Cosa fatto/Cosa si farà, Checklist&Roadmap drill-down), SOLO testo per il comando (LL-050, nessuna apertura in-chat).
> Binding: LL-Empire-002 (GO), LL-Empire-018 (atomic commit), LL-Empire-019 (V1 parity), LL-Empire-023 (pull-first), LL-Empire-024 (sandbox stale → CMD Windows autoritativo), LL-Empire-050 (session boundary = nuova chat per ogni Sn).

---

## §0-ter — RISOLUZIONE PROGETTO (propagazione $1)

`/swe:cycle <progetto>` propaga `$1` a entrambe le fasi via `_PROJECTS_INDEX.yaml`:
- **FASE 1** (`end`): chiude la catena DEL PROGETTO risolto (`session_prefix`), roll-up `hub/_status/<slug>.yaml`.
- **FASE 2** (handoff): persiste `SESSION_BRIEFINGS/S<n+1>_OPEN.md` con lo slug del progetto + handoff "`/swe:start <slug>` in chat nuova".
- **GUARD dominio ESTERNO**: `swe_writes: false` (repo:null: `nexus`/`workdash`) -> il ciclo non opera. (`bot-alliance` da S166 = SteelWolf `swe_writes:true`, catena `BA-S`.)
- **COERENZA SCRIVANIA↔PROGETTO (S166, Opzione B)**: il ciclo deve combaciare con la scrivania corrente (`desk_mount`); mismatch -> RIFIUTA; Hub = lanciatore; FAIL-OPEN se non riconosciuta. Vedi `start` §0-ter.5-6.

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
   **Passo 4 (S166) — modello card:** nello STESSO file, includi anche il blocco fenced ```swe-model``` con il **modello COMPLETO** (freeze) della card di S<n+1> — shape `skills/start/assets/render-card.README.md`, dati ricchi del progetto risolto: ecosistema (solo hub/predator), TUTTI i workflow, TUTTE le priorità coi 10 campi L2, checklist/roadmap a milestone. Così l'apertura successiva la rende in automatico via hook (deterministica). Vedi §3-bis.
2. **[CARD FREEZE S166 — direttiva Luke: la handoff-card in questa versione ricca è INVARIABILE per hub e ogni progetto; mai impoverirla/cambiarne stile.]** **Rendi la Enriched Visual View di HANDOFF** (asset `${CLAUDE_PLUGIN_ROOT}/skills/cycle/assets/handoff-card.template.html`; regole+placeholder in `handoff-card.README.md`): genera il modello JSON (`kind:"handoff"`) coi campi handoff (recap S(n): OBIETTIVO/DONE_SUMMARY/COMMITS/WT_CLEAN; continuazione: NEXT_SESSION/PULL_NEXT/`priorities[]` read-only/CARRYOVER; CHECKLIST_MILESTONES; START_CMD/SNAPSHOT_PATH) -> esegui `node ${CLAUDE_PLUGIN_ROOT}/skills/start/assets/render-card.mjs <model.json>` -> `show_widget` (renderer deterministico S167 Passo 6, NON clonare a mano). **STEP OBBLIGATORIO NON SALTABILE (anti-dimenticanza):** rendi la card PRIMA del testo di handoff; se non l-hai mostrata, non procedere (fallback testo solo su Code CLI/Chat). Card **ricca come opening-card**: meta con ORA (data+ora ciclo, branch/HEAD, ultimo commit hash·data·msg via `git log -1 --date=format:"%Y-%m-%d %H:%M"`, Continuità, Parità PC, LL richiamate) + **Cosa si è fatto in S<n>** (Tipo/Obiettivo/Cosa fatto/Commit/Working tree) + **Cosa si farà in S<n+1>** (PC/pull + **priorità con Dettagli a tendina come opening-card**: L2 a 10 campi incl. Skill da usare + Analisi&consultazione/ricerche con LINK reale + carryover, da `S<n+1>_OPEN.md`) + **Checklist & Roadmap** drill-down per milestone (barra %, voci `.new` per le spunte) + CTA `{{START_CMD}}`=`/swe:start [progetto]`. **BINDING LL-050**: il comando è mostrato SOLO come testo; VIETATO un pulsante `sendPrompt` che avvii `/swe:start` in questa chat. Su Code CLI/Chat -> fallback testo (~5 righe): "S<n> chiusa (recap). Apri una CHAT NUOVA e lancia `/swe:start [progetto]`." Se `/swe:cycle $1` passa un progetto, includilo.
3. **STOP.** Non eseguire l'apertura interattiva di `start` né alcun lavoro della nuova
   sessione in questa chat. Il ciclo termina.

### §3-bis — PERSISTENZA MODELLO CARD (swe-model, Passo 4 S166, BINDING)

Ogni handoff che scrive `SESSION_BRIEFINGS/S<n+1>_OPEN.md` DEVE includere il blocco fenced ```swe-model {json}``` con il modello **completo e ricco** (freeze) dei dati della prossima apertura. È l'SSOT che l'hook `session-start.js` legge per pre-renderizzare l'opening-card in modo deterministico.
- **Shape**: `skills/start/assets/render-card.README.md` (scalari + ecosystem + checklist + priorities coi 10 campi).
- **Freeze**: mai impoverire; recupera i contenuti da SESSION_LOG appena aggiornato, `EMPIRE_PROJECTS_REGISTRY.md` / `_PROJECTS_INDEX.yaml`, roadmap/checklist del progetto, carryover priorità. Provenienza reale, mai inventata (LL-011).
- **Per progetto**: hub/predator → `hub/steelwolf-empire-hub/SESSION_BRIEFINGS`; ta-* → il loro repo (path-set §0-ter). Bot-Alliance/domini autonomi (`swe_writes:false`) → NON scritti da swe: restano fallback ricco costruito dall'istanza, che deve comunque rispettare la stessa struttura piena.
- **Le card NON si toccano**: closing-card e handoff-card restano lo stile S165 (freeze), come opening-card. Questo passo è SOLO additivo (scrive un file).

Nella chat nuova, `/swe:start` ricostruirà il briefing e **ritroverà** lo snapshot
persistito in `SESSION_BRIEFINGS/S<n+1>_OPEN.md`.

---

## §4 — STEP FINALE: ATTENDI GO nella chat nuova (LL-Empire-002)

Il GO per il lavoro della nuova sessione si dà **nella chat nuova**, dopo `/swe:start`.
In questa chat il ciclo si limita a chiudere + handoff. Default = WAIT.

---

## §5 — NOTE OPERATIVE

- **Un comando, due skill**: `cycle` non reimplementa `end`/`start`, le richiama (FASE 1 = `end` intera incl. closing-card; FASE 2 = persistenza-briefing di `start` §5-ter + **handoff-card**). I bugfix a quelle skill si propagano.
- **Perché handoff e non apertura**: LL-Empire-050. La riapertura in-chat violerebbe il confine di sessione e confonderebbe i contesti.
- **Cowork vs CLI**: chiusura interattiva usa la Enriched Visual View (`closing-card`, card HTML custom via `show_widget`) in Cowork; in CLI stesso contenuto in testo strutturato (fallback). MAI AskUserQuestion / elicitation nativo (prefill non si accende, S161).
- **Delega Luke**: commit atomici, push V1-parity e reinstall plugin restano lato Windows (LL-Empire-019/031).
- **Handoff Tipo D/K**: se cross-PC, `end` §7 governa titolo handoff + snapshot obbligatorio; lo snapshot `S<n+1>_OPEN.md` indica il PC di destinazione.

---

## RIFERIMENTI

- Chiusura: skill `end`
- Apertura: skill `start` (§5-ter persistenza briefing)
- Compact mid-session: skill `compact`
- Asset handoff: `skills/cycle/assets/handoff-card.template.html` + `handoff-card.README.md`
- Workflow completo: `hub/SESSION_PROTOCOL.md`
- LL critiche binding: 002, 018, 019, 021, 023, 024, 050
