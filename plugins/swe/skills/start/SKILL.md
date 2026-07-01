---
description: "Apertura sessione Empire SteelWolf. Pull-first 11 repo (LL-Empire-023) + leggi CLAUDE.md hierarchy + ultime 20 righe SESSION_LOG + LESSONS_LEARNED indice + memory snapshot piu' recente + briefing stato + persisti scheda apertura in SESSION_BRIEFINGS (§5-ter) + ATTENDI GO esplicito Luke (LL-Empire-002). Token saving target 3-5K. Trigger: /swe:start <progetto-opzionale>."
allowed-tools: Read Bash Grep Glob
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

# EMPIRE START v1.2

Apertura sessione Empire — Cowork, Code o Chat. Token-saving target: 3-5K read iniziale.

> Creata 2026-04-26 in `hub/steelwolf-empire-hub/.claude/skills/`. Split da empire-session §2 (deprecato).
> v1.1 (S161): tabella tipi canonica condivisa con `end` + §5-ter persistenza scheda apertura in SESSION_BRIEFINGS.
> v1.2 (S161 addendum): regole di pre-selezione deterministiche (PC/pull/numero/priorità) in §5-bis.
> Binding: LL-Empire-002 (PROTOCOLLO GO), LL-Empire-008 (verifica empirica), LL-Empire-023 (pull-first), LL-Empire-024 (sandbox stale), LL-Empire-050 (session boundary), LL-Empire-063 (bash-write hub).

---

## §0 — STEP 0: DICHIARA PC + PULL (apertura interattiva)

**Prima di qualsiasi altra azione:**
- Dichiara il PC attivo (**PREDATOR / ACE**). Se non lo rilevi, **chiedilo a Luke**.
- Fai o chiedi `git pull` sui repo attivi (pull-first, dettaglio §2). Riporta esito: fatto / da fare.

Fonte unica interna SteelWolf (dominio separato N4). Binding: LL-Empire-023 (pull-first), LL-Empire-002 (GO).

---

## §0-ter — RISOLUZIONE PROGETTO (session-governance per-progetto, S163)

`/swe:start <slug>` e' **project-aware**. Resolver legge `hub/steelwolf-empire-hub/_status/_PROJECTS_INDEX.yaml`:

1. **Con argomento** `$1 = <slug>`: cerca in `projects[]`. Slug assente -> errore esplicito + lista slug validi (NON assumere).
2. **Senza argomento** -> progetto con `default: true` (`predator`/hub) = comportamento storico (retro-compat, zero regressione).
3. **Path-set risolto**: `repo . session_log . roadmap . session_prefix . branch . desk`. Da qui §2 (pull), §5 (SESSION_LOG), §5-bis (colpo d'occhio ROADMAP), §5-ter (S<n>_OPEN) usano i path DEL PROGETTO risolto, non hub.
4. **Numero sessione** = +1 sull'ultima entry del `session_log` del progetto, usando la **numerazione nativa** del progetto. `session_prefix` valorizzato solo per catene che lo usano davvero (es. `BA-S` per bot-alliance); vuoto -> `Sn` (default hub, journal, ...). NON forzare prefissi non nativi.
5. **GUARD domain-isolation (HARD-STOP binding)**: se il progetto risolto ha `swe_writes: false` (domini autonomi: `bot-alliance`, `nexus`, `workdash`), **FERMATI SUBITO**. NON leggere i doc del dominio, NON produrre briefing, NON aprire sessione, NON attendere GO. Emetti SOLO questo rifiuto e termina:

   > ⛔ `<slug>` e' un dominio autonomo (`<domain>`). La sua catena e' gestita dalla scrivania/plugin proprietario (es. scrivania **Bot-Alliance** per `bot-alliance`, plugin **nexus** per `nexus`). `swe` non apre sessioni qui (decisione #3 S163 + domain-isolation LL-050). Apri la sessione dal dominio proprietario.

   L'index elenca questi progetti solo per **referenza/roll-up**, non perche' `swe` li gestisca. (NB: guard advisory in prosa; enforcement deterministico = hook `UserPromptSubmit`, candidato follow-up.)
6. **Hub sempre genitore**: qualunque il progetto, governance V1-V6 + LL + registry restano in hub; lo stato rolluppa in `hub/_status/<slug>.yaml` (ADR-029).

Le skill `end` e `cycle` risolvono il progetto con lo STESSO index (coerenza cross-skill).

---

## §1 — TIPI DI SESSIONE (tabella canonica — condivisa con skill `end`)

Classifica per **tipo di lavoro** svolto. Stessa tabella usata in chiusura (`end` §1).

| Tipo | Uso | Chi |
|------|-----|-----|
| **A** | Architettura, skill, governance, ricerca profonda | Cowork (Opus) |
| **B** | Sviluppo, docs, design, fix, planning, migration | Claude Code (Sonnet) |
| **C** | Operations: deploy, git ops, security fix, cleanup | Claude Code (Sonnet) |
| **D** | Analisi: TA, review, audit qualita', cross-check | Opus o Sonnet |
| **E** | Closure post-recovery (caso speciale) | Cowork |
| **K** | TIER closure / handoff cross-PC PREDATOR↔ACE | Cowork/Code |

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
8. Snapshot apertura precedente in `hub/SESSION_BRIEFINGS/S<n>_OPEN.md` (se presente)
9. Memoria Cowork `%APPDATA%\Claude\...\memory\MEMORY.md`

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

## §5-bis — APERTURA INTERATTIVA (PC · pull · priorita + colpo d'occhio)

Dopo il briefing, presenta l'apertura interattiva:
- **Conferma stato**: PC · esito `git pull` (fatto / da fare) · priorita sessione.
- **Colpo d'occhio**: sintesi `CHECKLIST` + `ROADMAP` (o `EMPIRE_DASHBOARD`) del progetto attivo, letti a runtime.
- **Pre-compilazione (preferenza Luke)**: compila TUTTI i campi con i valori dedotti dal contesto; Luke approva o corregge, non riempie da zero. NB: la `<textarea>` del widget elicitation non rende il prefill → presenta la bozza compilata anche come TESTO in chat.
- **Regole di pre-selezione DETERMINISTICHE** (stesso stato ⇒ stesso default tra istanze diverse):
  - **PC**: eredita il PC dell'ultima entry `SESSION_LOG` (fallback: chiedi).
  - **Pull**: default **`già aggiornati`** SOLO se l'ultima entry `SESSION_LOG` registra un push completato in pari data sullo stesso PC (closure appena avvenuta → repo allineati); **altrimenti `da verificare`**. Mai indovinare `da fare`/`già fatto` senza questa evidenza.
  - **Numero sessione**: ultima entry `SESSION_LOG` + 1 (mai riusare un numero già chiuso).
  - **Priorità**: eredita il carryover "Prossimo passo" dell'ultima entry; pre-selezionala.
- **Cowork**: widget di conferma (modulo elicitation, generato a runtime dall'assistente).
- **Claude Code CLI**: stesso contenuto in testo. Il widget cliccabile esiste solo in Cowork.

Il rendering ricco (checklist/roadmap) si costruisce leggendo i file a runtime: non duplicare quei dati qui.

---

## §5-ter — PERSISTI SCHEDA APERTURA (SESSION_BRIEFINGS)

**Scopo:** la scheda d'apertura (predisposizioni) deve persistere anche a chat chiusa,
non solo vivere nella conversazione (osservazione Luke S161).

Ad ogni apertura, scrivi lo snapshot su disco:

```
hub/SESSION_BRIEFINGS/S<n>_OPEN.md
```

dove `<n>` = numero della sessione corrente (ricavato da +1 sull'ultima entry SESSION_LOG).
Contenuto (markdown, conciso): PC · esito pull · briefing stato (§5) · carryover · priorita proposte pre-compilate. Scrivi **via bash-write** (LL-Empire-063; MAI Edit Cowork su hub). Il file resta su disco anche dopo la chiusura chat → la predisposizione e' recuperabile.

Note:
- Scrittura NON distruttiva (nuovo file) → ammessa in apertura anche prima del GO (bookkeeping, non lavoro di sessione). Il GATE GO §6 protegge il LAVORO, non la registrazione dello stato.
- File untracked finche' Luke non committa; la persistenza su disco e' immediata e sufficiente allo scopo.
- Usato anche da skill `cycle` FASE 2 (handoff) per pre-scrivere lo snapshot della sessione successiva.

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
- Chiusura: skill `end`
- Ciclo end+handoff: skill `cycle`
- Compact mid-session: skill `compact`
- Snapshot apertura persistiti: `hub/SESSION_BRIEFINGS/S<n>_OPEN.md`
- Roadmap M1: `hub/ROADMAP_M1_M2_ANTHROPIC_2026_ALIGN.md` Action 1.2
- LL critiche binding: 002, 008, 011, 014, 018, 019, 021, 023, 024, 050, 063
