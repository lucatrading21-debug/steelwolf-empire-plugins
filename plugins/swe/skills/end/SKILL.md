---
description: "Chiusura sessione Empire SteelWolf protocollo D6. Step 0 chiusura interattiva (widget elicitation Cowork / testo CLI) raccoglie i dati D6 in un colpo. Poi update SESSION_LOG (5 righe + DIRTY + Timestamp) + LESSONS_LEARNED se nuove LL emerse + EMPIRE_DASHBOARD se status cambiato + commit FEAT/FIX/DOCS atomic (LL-Empire-018, no git add -A). GATE binding: git status DEVE essere clean su CMD Windows prima di dichiarare sessione chiusa (LL-Empire-024). NO push automatico (delegato Luke V1 parity verify). Trigger: /swe:end."
allowed-tools: Read Edit Write Bash Grep
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

# EMPIRE END v1.1

Chiusura sessione Empire — protocollo D6. Massimo 7 righe output finale.

> Creata 2026-04-26 in `hub/steelwolf-empire-hub/.claude/skills/`. Split da empire-session §4 (deprecato).
> v1.1 (S160): aggiunta §0-bis chiusura interattiva simmetrica all'apertura `/swe:start`.
> Binding: LL-Empire-018 (atomic commit), LL-Empire-019 (V1 parity), LL-Empire-021 (mai checkout --ours/--theirs su append-only), LL-Empire-024 (sandbox stale → CMD Windows autoritativo).

---

## §0-bis — STEP 0: CHIUSURA INTERATTIVA (raccolta dati D6)

Simmetrica all'apertura interattiva di `/swe:start` (§5-bis). **Prima di scrivere qualsiasi file**, raccogli in un colpo solo i dati della entry D6:

- **PC attivo**: PREDATOR / ACE.
- **Tipo sessione** (tabella canonica §1): A=architettura/governance/ricerca · B=sviluppo/docs/fix · C=operations · D=analisi · E=closure post-recovery · K=TIER/handoff cross-PC. (Se `/swe:end $1` passa un tipo, pre-selezionalo.)
- **Obiettivo** della sessione + **Completato** (con commit/hash reali dove disponibili).
- **DIRTY** da propagare (D7)? Cosa resta pending Luke-side.
- Nuove **LL** emerse da formalizzare? (indice + body LESSONS_LEARNED).
- **Prossimo passo** / carryover per la sessione successiva.
- **Backup V6** pre-destructive necessario (prossima sessione filesystem-destructive)?

Rendering:
- **Cowork**: widget di conferma (modulo elicitation, generato a runtime dall'assistente — pill per PC/tipo, free-text per obiettivo/completato/prossimo, toggle per DIRTY/LL/backup).
- **Claude Code CLI**: stesse domande in testo. Il widget cliccabile esiste solo in Cowork.

I valori raccolti alimentano direttamente §1 (SESSION_LOG/LESSONS/DASHBOARD) e §5 (backup). Non duplicare qui i contenuti: si compilano a runtime dalle risposte. Conferma con Luke prima di scrivere (LL-Empire-002).

---

## §1 — STEP 1: UPDATE DOCUMENTAZIONE OBBLIGATORIA

### SESSION_LOG.md (formato D6)

Aggiungi entry in fondo:

```markdown
## YYYY-MM-DD | Tipo X | <Titolo>

**Obiettivo:** ...
**Completato:** <commit hash reali> ...
**Scoperto:** ...
**Blocco attivo:** ...
**Prossimo passo:** ...

DIRTY: YYYY-MM-DD - ...
Timestamp: YYYY-MM-DD sessione <env> Tipo X ~HH:MM CEST.
```

**Tipo sessione (tabella canonica condivisa con skill `start` §1):** A=architettura/skill/governance/ricerca · B=sviluppo/docs/design/fix/planning/migration · C=operations (deploy/git/security/cleanup) · D=analisi/review/audit/cross-check · E=closure post-recovery · K=TIER closure / handoff cross-PC. Classifica per **tipo di lavoro** svolto (es. S158-S160 = Tipo A build governance).

### LESSONS_LEARNED.md (se nuove LL emerse)

- Aggiungi entry indice (riga tabella, severita': CRITICA/ALTA/MEDIA)
- Aggiungi entry body (Contesto / Pattern / Lezione / Why / How to apply / Validato / File master / Memorie correlate / Data)
- Bump Versione + Lezioni totali + Ultima modifica in footer

### EMPIRE_DASHBOARD.md (se status cambiato)

- Update header timestamp: `**YYYY-MM-DD ~HH:MM CEST — <closure scope>**`
- Update last commit hash, M0.x/TIER status, conformita' Anthropic % se M1+
- Repo table commit hash se push fatto

### Memory snapshot ADR-005 FALLBACK 2 (per closure critica)

`hub/_memory-snapshot/<YYYY-MM-DD>-<scope>.md` — garantisce recovery cross-PC anche se cloud-sync fallisce.

---

## §2 — STEP 2: COMMIT ATOMIC (LL-Empire-018 binding)

```cmd
cd /d %USERPROFILE%\SteelWolf_Empire\hub\steelwolf-empire-hub
git status
git add SESSION_LOG.md LESSONS_LEARNED.md EMPIRE_DASHBOARD.md _memory-snapshot\<file>
REM MAI git add -A — sempre file specifici
git commit -m "DOCS: <descrizione closure sessione YYYY-MM-DD>"
```

Convention message (D8): `FEAT` / `FIX` / `DOCS` / `REFACTOR` / `TEST` / `SECURITY` / `TIER0/1/2` / `M0.x/M1/M2`.

---

## §3 — STEP 3: PUSH DELEGATO LUKE (V1 binding)

**Cowork NON pusha automaticamente.** Luke esegue push da CMD Windows per V1 parity verify diretta:

```cmd
git push origin <branch>
git rev-parse HEAD
git rev-parse origin/<branch>
```

Devono essere identici (LL-Empire-019). Se hub repo: verificare anche `git config --get-all remote.origin.fetch == "+refs/heads/*:refs/remotes/origin/*"`.

---

## §4 — GATE OBBLIGATORIO: working tree clean (LL-Empire-024 binding)

**Cowork NON puo' dichiarare "sessione chiusa" se `git status` non e' clean su CMD Windows.**

Verifica ultima prima di pronunciare closure. **CHIEDI A LUKE** di eseguire da CMD Windows:

```cmd
cd /d %USERPROFILE%\SteelWolf_Empire\hub\steelwolf-empire-hub
git status
```

Atteso: `nothing to commit, working tree clean`.

Se non clean su Windows-side:
- File modified → committare (Step 2) o stash con motivazione documentata
- File untracked → aggiungere a commit o `.gitignore`
- Conflict → applicare LL-Empire-021 manual merge (mai `--ours/--theirs` su append-only)

**Sandbox bash puo' vedere stale (LL-Empire-024).** Per gate finale di closure: CMD Windows e' autoritativo, sandbox NON e'. Mai dichiarare closure basandosi solo su vista sandbox.

---

## §5 — STEP 4: V6 BACKUP SE PROSSIMA SESSIONE E' DESTRUCTIVE

```cmd
powershell -File hub\steelwolf-empire-hub\scripts\empire-backup.ps1 -Tag "pre-<descrittivo>"
```

V6 binding obbligatorio prima ops irreversibili (filesystem migration, schema change, mass rename, freeze unfreeze IronX).

---

## §6 — STEP 5: CONFERMA CHIUSURA (max 7 righe)

```
SESSIONE CHIUSA — Tipo X
Obiettivo: <breve>
Completato: <commit hash> <breve>
Prossimo passo: <breve>
Working tree: ✅ clean (verificato CMD Windows)
Push delegato Luke: pending
Backup: <hash zip se applicabile>
```

---

## §7 — HANDOFF DUAL-PC (Tipo K)

Se closure e' handoff PREDATOR ↔ ACE (Tipo K; D solo se e' anche una sessione di analisi):
- Entry SESSION_LOG include "handoff <PC src> → <PC dst>" nel titolo
- Prossimo passo specifico: "Su PC <dst>: pull-first 11 repo + bootstrap drill + resume <task>"
- Memory snapshot OBBLIGATORIO (ADR-005 FALLBACK 2)
- V6 backup OBBLIGATORIO pre-handoff

---

## §8 — CICLO END+START

Per chiudere e riaprire in un colpo (nuova sessione consecutiva) usa `/swe:cycle`
(skill `cycle`): esegue questa chiusura D6 completa (incl. GATE git clean) e — solo a
closure confermata — avvia l'apertura interattiva di `/swe:start`.

---

## RIFERIMENTI

- Workflow completo: `hub/SESSION_PROTOCOL.md` §6
- Apertura: skill `start`
- Ciclo end+start: skill `cycle`
- Compact mid-session: skill `compact`
- LL critiche binding: 002, 008, 011, 018, 019, 021, 023, 024
- ADR-005 cross-PC memory strategy
