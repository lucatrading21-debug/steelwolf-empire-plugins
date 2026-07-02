---
description: "Chiusura sessione Empire SteelWolf protocollo D6. Step 0 chiusura interattiva con Enriched Visual View (card HTML custom via show_widget in Cowork / testo strutturato in CLI) raccoglie i dati D6 in un colpo. Poi update SESSION_LOG (5 righe + DIRTY + Timestamp) + LESSONS_LEARNED se nuove LL emerse + EMPIRE_DASHBOARD se status cambiato + commit FEAT/FIX/DOCS atomic (LL-Empire-018, no git add -A). GATE binding: git status DEVE essere clean su CMD Windows prima di dichiarare sessione chiusa (LL-Empire-024). NO push automatico (delegato Luke V1 parity verify). Trigger: /swe:end."
allowed-tools: Read Edit Write Bash Grep
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

# EMPIRE END v1.2

Chiusura sessione Empire — protocollo D6. Massimo 7 righe output finale.

> Creata 2026-04-26 in `hub/steelwolf-empire-hub/.claude/skills/`. Split da empire-session §4 (deprecato).
> v1.1 (S160): aggiunta §0-bis chiusura interattiva simmetrica all'apertura `/swe:start`.
> v1.2 (S165): §0-bis.2 Enriched Visual View di CHIUSURA base ufficiale (asset `closing-card.template.html`, gemella dell'opening) — sostituisce il widget elicitation nativo; + §0-lang lingua italiana binding.
> Binding: LL-Empire-002 (GO), LL-Empire-018 (atomic commit), LL-Empire-019 (V1 parity), LL-Empire-021 (mai checkout --ours/--theirs su append-only), LL-Empire-024 (sandbox stale → CMD Windows autoritativo), LL-Empire-050 (session boundary), LL-Empire-063 (bash-write hub).

---

## §0-lang — LINGUA (binding Luke)

**Italiano SEMPRE**: risposte, preamboli e ragionamento in italiano corretto. Nessuna narrazione in inglese in nessuna fase.

---

## §0-bis — STEP 0: CHIUSURA INTERATTIVA (raccolta dati D6)

Simmetrica all'apertura interattiva di `/swe:start` (§5-bis). **Prima di scrivere qualsiasi file**, raccogli in un colpo solo i dati della entry D6:

- **PC attivo**: PREDATOR / ACE.
- **Tipo sessione** (tabella canonica §1): A=architettura/governance/ricerca · B=sviluppo/docs/fix · C=operations · D=analisi · E=closure post-recovery · K=TIER/handoff cross-PC. (Se `/swe:end $1` passa un tipo, pre-selezionalo.)
- **Obiettivo** della sessione + **Completato** (con commit/hash reali dove disponibili).
- **Scoperto** (candidati-LL / pattern, distinto dalle LL formali) + **Blocco attivo** (D6).
- **Commit generati** in sessione (hash · tipo · messaggio) — push delegato Luke.
- **Checklist aggiornata**: voci spuntate nella sessione (drill-down per milestone).
- **DIRTY** da propagare (D7)? Cosa resta pending Luke-side.
- Nuove **LL** emerse da formalizzare? (indice + body LESSONS_LEARNED).
- **Prossimo passo** / carryover per la sessione successiva (handoff S<n+1>).
- **Durata** sessione (indicativa) + **file toccati** (conteggio da `git diff --stat`/status dei repo interessati).
- **Backup V6** pre-destructive necessario (prossima sessione filesystem-destructive)? · **Memory snapshot** ADR-005 (closure critica)? · **Aggiorna EMPIRE_DASHBOARD** (status cambiato)?

Il rendering è la **Enriched Visual View di chiusura** (§0-bis.2). I valori raccolti alimentano direttamente §1 (SESSION_LOG/LESSONS/DASHBOARD) e §5 (backup). Non duplicare qui i contenuti: si compilano a runtime dalle risposte. Conferma con Luke prima di scrivere (LL-Empire-002).

### §0-bis.2 — ENRICHED VISUAL VIEW · CHIUSURA (base ufficiale, BINDING S165)

La chiusura interattiva si rende SEMPRE con la **Enriched Visual View** — card HTML custom via `show_widget`, gemella della card d'apertura (`start` §5-bis.2). È lo STESSO schema con dati di CHIUSURA (cosa fatto, commit generati, checklist aggiornata, DIRTY, nuove LL, handoff prossima sessione).

**IMPERATIVO (no divergenza tra istanze):** l'unica chiusura interattiva ammessa è rendere QUESTO asset. È VIETATO costruire card alternative, usare AskUserQuestion o il widget elicitation nativo, o elencare i dati D6 come semplice testo (in Cowork). Se l'asset non è leggibile → fallback TESTO strutturato (sotto), mai una card improvvisata.

**Asset (non riscrivere da zero — token-saving):**
- Template: `${CLAUDE_PLUGIN_ROOT}/skills/end/assets/closing-card.template.html`
- Regole+placeholder+schema: `${CLAUDE_PLUGIN_ROOT}/skills/end/assets/closing-card.README.md`

**Procedura:** clona il template → sostituisci i `{{PLACEHOLDER}}` coi dati del progetto risolto
(§0-ter: {{SESSION}} {{DATE_TIME}} {{BRANCH_HEAD}} {{LAST_COMMIT_*}} {{DONE_ITEMS}} {{COMMITS}}
checklist/roadmap parsate con flag, {{DIRTY}} {{NEW_LL}} {{NEXT_STEP}}) → rendi con `show_widget`.

**Vincoli BINDING (speculari a start §5-bis.2):**
- **Mai** AskUserQuestion o widget elicitation nativo per la chiusura (prefill non si accende, S161).
- **Pre-acceso**: applica `sel` a PC (ultima entry SESSION_LOG), Tipo sessione (dedotto dal lavoro svolto) e Backup V6 (default `No`; `Sì` solo se la prossima è filesystem-destructive) + marcatore "● dedotto".
- **Flag checklist**: icone outline `ti-square-check` (verde=fatto) / `ti-square` (da fare). MAI `-filled`. Voci spuntate NELLA sessione: classe `.new`.
- **TRACCIABILITÀ (binding S165)**: ogni voce **Cosa fatto** e i toggle/campi portano 3 livelli — (1) **termine tecnico**, (2) **in parole povere** (senza gergo), (3) **provenienza**: cosa ho usato (skill / ricerca / fonte web con **LINK REALE**, mai inventato — LL-Empire-011; se nessuna fonte esterna → "asset interno, nessuna fonte esterna") + **problemi trovati e risolti** (+rif LL/commit). Toggle e campi D6 hanno la glossa in parole povere; ogni voce `Cosa fatto` è un `.dit` con `<details>` a 3 sezioni.
- **Timestamp OBBLIGATORI (con ORA)**: `{{DATE_TIME}}` = data+ora chiusura `YYYY-MM-DD · HH:MM TZ` (leggi l'ora reale via shell `date`). Ultimo commit in 3 campi separati (`git log -1 --date=format:"%Y-%m-%d %H:%M" --format="%h|%ad|%s"`).
- **Degradazione**: nessun commit ancora → `—`; checklist assente → nascondi la tendina; nessuna LL nuova → "nessuna". Nessun errore per dato mancante.
- **LINGUA: ITALIANO SEMPRE**.
- **Sezioni obbligatorie**: header (SW + N sessione + "chiusura") · meta (data+ora chiusura, branch/HEAD, **Handoff S###→S###**, **Parità PC**, ultimo commit `hash·data ora·msg`, **Durata · File toccati**) · LL richiamate · PC + Tipo + Backup V6 + **Memory snapshot (ADR-005)** + **Aggiorna EMPIRE_DASHBOARD** (pill pre-accese) · Riferimenti rapidi · **Sintesi D6** (Obiettivo · Scoperto/candidati-LL · Blocco attivo) · **Cosa fatto** (voci + hash) · **Commit generati** (hash·tipo·msg, push delegato Luke) · **Checklist aggiornata** drill-down per milestone (voci `.new` per le spunte di sessione, barra %) · **DIRTY** (D7) · **Nuove LL** · **Anteprima entry SESSION_LOG (D6)** (pre WYSIWYG del testo che verrà scritto, approva prima) · **GATE git clean** (LL-024) · **Prossimo passo / handoff S(n+1)** · Note di chiusura · +Nuova voce Checklist · +Nuova voce Roadmap · Cross-cutting · Conferma.
- **Conferma** (`sendPrompt`): PC · Tipo · Backup V6 · Memory snapshot · Dashboard (+ Note / Nuova checklist / Nuova roadmap se compilate). Alla ricezione, dopo conferma Luke, procedi a §1 (scrittura file) e §2-§6.

**Fallback testo (Code CLI / Chat, no `show_widget`):** rendi le STESSE informazioni in testo
strutturato (header sessione/PC/Tipo/data-ora/commit, Cosa fatto con hash, Commit generati,
Checklist con [x]/[ ] e nuove spunte, DIRTY, Nuove LL, prossimo passo/handoff) e poi attendi
conferma D6 + GATE git clean (LL-002/024). L'esperienza resta coerente cross-tool.

---

## §0-ter — RISOLUZIONE PROGETTO (session-governance per-progetto, S163)

`/swe:end <progetto>` risolve via `hub/steelwolf-empire-hub/_status/_PROJECTS_INDEX.yaml` (stesso resolver di `start` §0-ter):
- **Con `$1 = <slug>`** -> usa `session_log`/`roadmap`/`session_prefix` del progetto. Senza argomento -> `default` (`predator`/hub).
- **§1 SESSION_LOG** si scrive nel `session_log` DEL PROGETTO (es. `steelwolf-trading-journal/docs/SESSION_LOG.md`, entry `JOURNAL-Sn`), NON nella catena hub.
- **Roll-up ADR-029**: sovrascrivi `hub/_status/<slug>.yaml` (one-file-per-desk) -> `empire_rollup.py` -> `EMPIRE_STATE.md`. E' il canale con cui il lavoro di progetto risale all'hub SENZA scrivere la catena hub.
- **GUARD dominio ESTERNO**: `swe_writes: false` (repo:null: `nexus`/`workdash`) -> rifiuta, rimanda al suo strumento. (`bot-alliance` da S166 e' SteelWolf `swe_writes:true`, catena `BA-S`.)
- **COERENZA SCRIVANIA↔PROGETTO (S166, Opzione B)**: la chiusura deve combaciare con la scrivania corrente (basename radice mount -> `desk_mount`). Scrivania-progetto X + chiudi Y (o hub default) -> RIFIUTA; Hub = lanciatore; FAIL-OPEN se scrivania non riconosciuta. Deterministico su CLI (hook exit 2), prosa in Cowork. Vedi `start` §0-ter.5-6.
- **Bootstrap on-demand** (`bootstrap: on-demand`, es. `ta-*`): se il `session_log` del progetto non esiste ancora, la chiusura lo **crea** (bash-write, LL-063) con la prima entry `S1`. SESSION_LOG mancante = prima sessione, non errore.
- Il **tipo sessione** resta raccolto interattivamente (§0-bis); `$1` e' il progetto.

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

**BINDING (S165):** al termine, `end` EMETTE AUTOMATICAMENTE il blocco commit **pronto-incolla** coi **file REALI toccati** (calcolati da `git status`/`git diff --stat`), **un blocco per ogni repo interessato** (hub e/o repo di progetto e/o plugin). NON un template generico: i path sono quelli effettivamente modificati nella sessione. Luke esegue il commit e **pusha lui** (V1 parity, §3). Il blocco va in chat come CMD copia-incolla (mai "apri il file e segui").

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
(skill `cycle`): esegue questa chiusura D6 completa (incl. §0-bis.2 Enriched Visual View +
GATE git clean) e — solo a closure confermata — PREPARA l'apertura interattiva di `/swe:start`
in una CHAT NUOVA (handoff, LL-050).

---

## RIFERIMENTI

- Workflow completo: `hub/SESSION_PROTOCOL.md` §6
- Apertura: skill `start` (§5-bis.2 opening-card, schema gemello)
- Ciclo end+start: skill `cycle`
- Compact mid-session: skill `compact`
- Asset chiusura: `skills/end/assets/closing-card.template.html` + `closing-card.README.md`
- LL critiche binding: 002, 008, 011, 018, 019, 021, 024, 050, 063
- ADR-005 cross-PC memory strategy
