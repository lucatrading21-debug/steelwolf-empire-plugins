---
description: "Apertura sessione Empire SteelWolf. Pull-first 11 repo (LL-Empire-023) + leggi CLAUDE.md hierarchy + ultime 20 righe SESSION_LOG + LESSONS_LEARNED indice + memory snapshot piu' recente + briefing stato + persisti scheda apertura in SESSION_BRIEFINGS (§5-ter) + ATTENDI GO esplicito Luke (LL-Empire-002). Token saving target 3-5K. Trigger: /swe:start <progetto-opzionale>."
allowed-tools: Read Bash Grep Glob
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

# EMPIRE START v1.6

Apertura sessione Empire — Cowork, Code o Chat. Token-saving target: 3-5K read iniziale.

> Creata 2026-04-26 in `hub/steelwolf-empire-hub/.claude/skills/`. Split da empire-session §2 (deprecato).
> v1.1 (S161): tabella tipi canonica condivisa con `end` + §5-ter persistenza scheda apertura in SESSION_BRIEFINGS.
> v1.2 (S161 addendum): regole di pre-selezione deterministiche (PC/pull/numero/priorità) in §5-bis.
> v1.3 (S164): §5-bis.1 formato priorità obbligatorio (descrizione Cosa/Perché/Output/Rischio + ordine consigliato + ordine workflow).
> v1.4 (S164/A5): §5-bis.2 Enriched Visual View base ufficiale (card HTML custom pre-accesa + asset template + fallback testo).
> v1.5 (S166): §5-bis.4 hook pre-render PRIMARIO (l'hook genera la card, l'istanza fa solo show_widget del file); fix template commento annidato.
> v1.5 (S165): Ecosistema (hub-only) + checklist drill-down per milestone + chip Continuità/Parità-PC + commit data-ora forzata + lingua italiana binding.
> v1.6 (S165): simmetria con `end` — glosse "in parole povere" (`.qglo`) su PC/Pull + principio tracciabilità (termine tecnico + parole povere + provenienza) condiviso con la closing card.
> Binding: LL-Empire-002 (PROTOCOLLO GO), LL-Empire-008 (verifica empirica), LL-Empire-023 (pull-first), LL-Empire-024 (sandbox stale), LL-Empire-050 (session boundary), LL-Empire-063 (bash-write hub).

---

## §0-lang — LINGUA (binding Luke)

**Italiano SEMPRE**: risposte, preamboli e ragionamento in italiano corretto. Nessuna narrazione in inglese in nessuna fase.

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
4-bis. **Bootstrap on-demand** (voci con `bootstrap: on-demand`, es. `ta-analysis`/`ta-academy`/`ta-knowledge`/`ta-content`): il `session_log` puo' NON esistere ancora (il repo ha PROJECT_STATE/ROADMAP/CHECKLIST ma non SESSION_LOG). In tal caso: sessione = **S1**, colpo d'occhio da `PROJECT_ROADMAP.md`+`PROJECT_CHECKLIST.md`, e **crea il SESSION_LOG** del progetto alla prima chiusura (`end`/`cycle`) via bash-write (LL-063). La creazione del file vuoto/scheletro in apertura e' bookkeeping non distruttivo (ammessa pre-GO, come §5-ter). NON trattare il SESSION_LOG mancante come errore.
5. **GUARD dominio ESTERNO (HARD-STOP binding)**: se il progetto risolto ha `swe_writes: false` (domini ESTERNI `repo: null`: `nexus`, `workdash`), **FERMATI SUBITO**. NON leggere doc, NON briefing, NON aprire, NON attendere GO. Emetti SOLO questo rifiuto e termina:

   > ⛔ `<slug>` e' un dominio ESTERNO (`<domain>`): ecosistema/piattaforma gestita altrove (plugin **nexus** per `nexus`, dominio **WorkDASH** per `workdash`). `swe` non apre sessioni qui. Apri dal suo strumento proprietario.

   (**Nota S166:** `bot-alliance` NON e' piu' qui — e' un progetto SteelWolf con repo reale, `swe_writes: true`, catena `BA-S`. Va aperto con `/swe:start bot-alliance` DALLA sua scrivania.) L'enforcement e' deterministico su **CLI** via hook `hooks/domain-guard.js` (exit 2); in Cowork l'hook e' no-op → vale questa prosa (LL-060/S159).
6. **COERENZA SCRIVANIA↔PROGETTO (Opzione B, S166 — HARD-STOP binding)**: la sessione aperta deve combaciare con la **scrivania Cowork corrente**. Rileva la scrivania dal **basename della radice del mount** (Cowork: `CLAUDE_CODE_WORKSPACE_HOST_PATHS`; CLI: `cwd`/`CLAUDE_PROJECT_DIR`) e mappala su `desk_mount` nell'index.
   - **INVARIANTE (owner directive S189, ADR-027 §4):** ogni progetto SteelWolf possiede la propria scrivania e la propria catena di sessioni. Una scrivania puo' aprire, ciclare e chiudere ESCLUSIVAMENTE sessioni del progetto che rappresenta. **L'Hub NON e' un lanciatore.**
   - **Scrivania Hub** (`SteelWolf_Empire`) = scrivania del progetto `predator`/hub, **NON un lanciatore**: apre SOLO `predator`. Qualsiasi altro progetto → **RIFIUTA**, anche se richiesto esplicitamente.
   - **Scrivania-progetto X** (es. `trading-alliance-bots` = `bot-alliance`): puoi aprire SOLO X. Se il progetto lanciato (o il default `predator`) ≠ X → **RIFIUTA** hard-stop:
     > ⛔ Sei nella scrivania del progetto `<X>`, ma stai aprendo `<Y>`. Qui apri solo `<X>` con `/swe:start <X>`. Per `<Y>` apri la sua scrivania (o l'Hub SteelWolf per i progetti senza scrivania).
   - **FAIL-CLOSED sull'identita' del progetto (S189, sostituisce il FAIL-OPEN precedente).** Il resolver raccoglie piu' segnali (radice mount Cowork + `cwd` CLI) e li mappa su `desk_mount`. Se **converge su un solo progetto** → procede. Se **non stabilisce il progetto**, o **due segnali si contraddicono** → **STOP**: nessuna card, nessuna scrittura, mai «non riconosco, allora assumo `predator`».
   - **Cosa PUO' degradare: solo il livello di rendering.** Risolti progetto e briefing senza ambiguita', se L1 non e' disponibile si degrada a **L2 canonico dichiarato** — sempre con briefing/checklist/roadmap **dello stesso progetto**. L'identita' non degrada mai; il rendering si'.
   - Su CLI l'enforcement e' deterministico (`hooks/domain-guard.js`, exit 2, legge `_PROJECTS_INDEX.yaml` — nessuna mappa hardcoded); in Cowork l'hook e' no-op (CARD-06B) → vale questa prosa.
7. **Hub sempre genitore**: qualunque il progetto, governance V1-V6 + LL + registry restano in hub; lo stato rolluppa in `hub/_status/<slug>.yaml` (ADR-029).

Le skill `end` e `cycle` risolvono il progetto con lo STESSO index + STESSA coerenza scrivania↔progetto (cross-skill).

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
- **Pre-compilazione (preferenza Luke)**: compila TUTTI i campi con i valori dedotti dal contesto; Luke approva o corregge, non riempie da zero. Il rendering è la card §5-bis.2 (asset), coi valori dedotti già **pre-accesi**.
- **Regole di pre-selezione DETERMINISTICHE** (stesso stato ⇒ stesso default tra istanze diverse):
  - **PC**: eredita il PC dell'ultima entry `SESSION_LOG` (fallback: chiedi).
  - **Pull**: default **`già aggiornati`** SOLO se l'ultima entry `SESSION_LOG` registra un push completato in pari data sullo stesso PC (closure appena avvenuta → repo allineati); **altrimenti `da verificare`**. Mai indovinare `da fare`/`già fatto` senza questa evidenza.
  - **Numero sessione**: ultima entry `SESSION_LOG` + 1 (mai riusare un numero già chiuso).
  - **Priorità**: eredita il carryover "Prossimo passo" dell'ultima entry; pre-selezionala. Ogni voce va presentata NON come solo titolo ma nel **formato descrittivo canonico** (vedi §5-bis.1): *Cosa · Perché · Output · Rischio* + **ordine consigliato** + **ordine workflow**.
- **Cowork**: rendi la card §5-bis.2 (Enriched Visual View, asset `opening-card.template.html`) via `show_widget`. **VIETATO** usare AskUserQuestion o widget elicitation nativo o card improvvisate.
- **Claude Code CLI / Chat**: stesso contenuto in **testo strutturato** (fallback §5-bis.2). Il widget cliccabile esiste solo in Cowork.

Il rendering ricco (checklist/roadmap) si costruisce leggendo i file a runtime: non duplicare quei dati qui.

### §5-bis.1 — FORMATO PRIORITÀ (descrizione + ordine) — FIX S164

**Regola (osservazione Luke S164):** nella card "Apertura sessione S<n> details" ogni
priorità deve dare a Luke abbastanza contesto da capire su cosa lavorare **senza aprire
altri file**. Vietato elencare solo i titoli. Per ogni voce, formato canonico:

- **Cosa**: cosa si farebbe in concreto (1-2 frasi).
- **Perché / posizione**: perché ha quella posizione nell'ordine (dipendenze, sblocca cosa).
- **Output**: deliverable atteso (file, patch, dossier…).
- **Rischio**: basso / medio / alto + se serve Pre-Mortem pieno o leggero.

Inoltre la card deve dichiarare DUE ordinamenti:
1. **Ordine di priorità consigliato** (giudizio Claude su valore/urgenza).
2. **Ordine per workflow** (sequenza per dipendenze: cosa va fatto prima per abilitare il resto).

Se i due ordini coincidono, dichiararlo esplicitamente. Template voce:

```
**N · <titolo> — consigliata: Nª (<motivo posizione>)**
Cosa: … · Perché: … · Output: … · Rischio: …
```

Le voci cross-cutting (vincoli permanenti Luke: parità ACE, dossier/handoff) vanno in una
sezione a parte "Cross-cutting", sempre presente.

### §5-bis.2 — ENRICHED VISUAL VIEW (base ufficiale, BINDING S164/A5)

**CARD FREEZE (S166, direttiva Luke — BINDING):** questa Enriched Visual View nella versione ricca collaudata in S166 è lo standard **INVARIABILE** per hub e OGNI progetto SteelWolf. Vietato impoverirla, semplificarla, improvvisarla o cambiarne stile/struttura. Riempirla SEMPRE completa coi dati reali del progetto.

L'apertura si rende SEMPRE con la **Enriched Visual View** — card HTML custom via `show_widget`,
base UNICA per ogni sessione e ogni progetto (e blueprint Nexus).

**IMPERATIVO (no divergenza tra istanze):** l'unica apertura ammessa è rendere QUESTO asset. È VIETATO costruire card alternative, usare AskUserQuestion o il widget elicitation nativo, o elencare le priorità come semplice testo. Se l'asset non è leggibile → fallback TESTO strutturato (sotto), mai una card improvvisata.

**Asset (non riscrivere da zero — token-saving):**
- Template: `${CLAUDE_PLUGIN_ROOT}/skills/start/assets/opening-card.template.html`
- Regole+placeholder+schema: `${CLAUDE_PLUGIN_ROOT}/skills/start/assets/opening-card.README.md`

**Procedura:** clona il template → sostituisci i `{{PLACEHOLDER}}` coi dati del progetto risolto
(§0-ter: {{SESSION}} {{DATE_TIME}} {{BRANCH_HEAD}} {{LAST_COMMIT}} {{LL_LIST}} checklist/roadmap
parsate con flag, {{PRIORITIES}} dal carryover) → rendi con `show_widget`.

**Vincoli BINDING:**
- **Mai** AskUserQuestion o widget elicitation nativo per l'apertura (prefill non si accende, S161).
- **Pre-acceso**: applica `sel` (pill PC/Pull) e `on` (prima .prio) al valore dedotto (§5-bis regole deterministiche) + marcatore "● dedotto".
- **Flag checklist**: icone outline `ti-square-check` (verde=fatto) / `ti-square` (da fare). MAI `-filled` (non caricate → vuoto).
- **PAROLE POVERE + TRACCIABILITÀ (simmetria con `end`, S165)**: i controlli (PC/Pull) portano una glossa `.qglo` (termine tecnico + spiegazione senza gergo); ogni priorità ha già `In parole semplici` + `Analisi & consultazione` + `Skill da usare` (= provenienza/come la farò). Stesso principio della closing card: termine tecnico + parole povere + provenienza (skill/ricerca/fonte con **LINK REALE**, mai inventato — LL-Empire-011).
- **Degradazione**: SESSION_LOG assente → `S1`; nessun commit → `—`; checklist assente → nascondi la tendina. Nessun errore per dato mancante.
- **Timestamp OBBLIGATORI (con ORA)**: `{{DATE_TIME}}` = data+ora apertura sessione `YYYY-MM-DD · HH:MM TZ` (leggi l'ora reale via shell `date`). Ultimo commit in 3 campi separati `{{LAST_COMMIT_HASH}}` · `{{LAST_COMMIT_DATE}}` (`YYYY-MM-DD HH:MM`) · `{{LAST_COMMIT_MSG}}` (via `git log -1 --date=format:"%Y-%m-%d %H:%M" --format="%h|%ad|%s"`). La DATA/ORA non è mai omettibile.
- **LINGUA: ITALIANO SEMPRE** — tutte le risposte, i preamboli e il ragionamento dell'istanza in italiano corretto (direttiva Luke). Vietato preambolo/narrazione in inglese.
- **Sezioni obbligatorie**: header brandizzato (SW + N sessione) · meta (**Apertura data+ora**, branch/HEAD, **Continuità S###→S###**, **Parità PC** PREDATOR↔ACE, ultimo commit `hash·data ora·msg`, pull) · LL richiamate · PC+Pull pre-accese · Riferimenti rapidi · **Ecosistema SteelWolf** (SOLO apertura hub/predator: progetti dal registry con badge stato RAG+testo + **data ultima modifica** = ultimo commit del repo `git log -1 --date=format:"%Y-%m-%d"`; ometti su sessione singolo-progetto) · tendina Checklist&Roadmap **a drill-down per milestone** (ogni milestone espandibile alle sue voci con flag outline; barra %) · priorità per workflow (L1 sempre, meta con **Tipo di lavoro** chip [Doc/Codice/Ricerca/Infra/Design/Governance] + Rischio/Stima/Stato/MoSCoW; L2 Dettagli: **In parole semplici** (discorsivo NON tecnico: cos'è l'upgrade, che funzioni/benefici porta) · poi i campi tecnici, OGNUNO con **chiosa in parole semplici** accanto al termine: Piano (·cosa si fa passo per passo) · Prima→Dopo (·com'è ora vs come sarà) · Serve·Dipende (·cosa serve prima) · **Dati richiesti** (·cosa serve chiederti/cercare in base al contesto) · **Analisi & consultazione** (·deep research Anthropic/GitHub/web ingegneristico+AI/dashboard/gestionale/pagamenti + confronto + Pre-Mortem, soluzione migliore per priorità/workflow nel rispetto di checklist+roadmap) · **Skill da usare** (·quali skill/plugin attivare in base al contesto: es. empire-research, empire-quality, data/build-dashboard, xlsx/docx, figma…) · Rischi·mitig (·cosa può andare storto e come si evita) · Come sarà completato (·quando è finito davvero) · Consiglio (·suggerimento)) · Prossimo passo consigliato · Note di sessione · +Nuova voce Checklist · +Nuova voce Roadmap · Cross-cutting/DIRTY · Conferma.
- **Checklist vs Roadmap** (per le due nuove-voci): Roadmap = milestone/obiettivo strategico (cosa/quando); Checklist = task eseguibile spuntabile sotto una milestone (come/fatto?).
- **Conferma** (`sendPrompt`): PC · Pull · Priorità (+ Note / Nuova checklist / Nuova roadmap se compilate). Alla ricezione, dopo GO, scrivi: Note→sessione, nuova voce→checklist/roadmap del progetto.

**Fallback testo (Code CLI / Chat, no `show_widget`):** rendi le STESSE informazioni in testo
strutturato (header, priorità numerate con i campi L1+L2, checklist con [x]/[ ], prossimo passo,
note) e poi ATTENDI GO (LL-002). L'ecosistema resta coerente cross-tool (Cowork/Code/Chat).

**Chiusura simmetrica:** `end`/`cycle` riusano lo STESSO schema/asset con dati di chiusura
(cosa fatto, commit generati, checklist aggiornata, handoff prossima sessione).

### §5-bis.3 — RENDERER DETERMINISTICO (preferito, S166 Fase 1)

Per eliminare l'improvvisazione (card vuota / diversa tra istanze o scrivanie — vedi delirio S166),
la card si genera in modo **deterministico** con `render-card.mjs`. L'istanza NON disegna l'HTML a mano:

1. Raccoglie lo stato (git, SESSION_LOG, roadmap, indice) e costruisce un **modello JSON** (shape in `${CLAUDE_PLUGIN_ROOT}/skills/start/assets/render-card.README.md`).
2. Esegue `node ${CLAUDE_PLUGIN_ROOT}/skills/start/assets/render-card.mjs <model.json>` → HTML completo su stdout.
   - **Fallback runtime**: se il bash della scrivania non raggiunge `${CLAUDE_PLUGIN_ROOT}`, copia `render-card.mjs` + `opening-card.template.html` in `outputs/` ed eseguilo lì.
3. `show_widget(<HTML>)`.

Il renderer riusa il template §5-bis.2 **INVARIATO** e le **stesse classi/CSS** → visual view **identica**,
solo prodotta da dati (separazione ragionamento↔rendering; pattern collaudato UI-da-LLM, fonti design S166).
Le priorità ragionate restano input dell'istanza (dentro il modello), ma incastrate in markup fisso.
§5-bis.2 resta valido come **descrizione della card e fallback** se il renderer non è disponibile.

### §5-bis.4 — HOOK PRE-RENDER (PRIMARIO, S166 Passo 2)

Meccanismo definitivo anti-improvvisazione: **è l'hook `SessionStart` che pre-renderizza la card**, non l'istanza. Ordine di precedenza a STEP 2:

1. **Card pre-generata dall'hook (DEFAULT).** All'apertura il hook stampa `=== SWE RUNTIME STATUS S166 ===`. Se dice `card_ready: <path>`, la card è **già pronta**: l'istanza legge quel file (in Cowork è `.swe-open-card.html` nella cartella `outputs`) e passa il **contenuto ESATTO** a `show_widget`. NON costruire il modello, NON disegnare, NON usare AskUserQuestion/elicitation.
2. **Renderer istanza (degradato).** Se `card_ready: no` (es. hub non montato sulla scrivania), l'istanza costruisce il modello JSON ed esegue `render-card.mjs` (§5-bis.3).
3. **Manuale (ultimo fallback).** Card §5-bis.2 / testo strutturato in CLI.

SSOT del modello: blocco fenced ```swe-model {json}``` dentro `SESSION_BRIEFINGS/S<n>_OPEN.md` (shape `render-card.README`), scritto alla chiusura da `end`/`cycle` — l'hook lo legge e rende. Fail-open: se il modello manca o il render fallisce, si degrada senza mai bloccare l'apertura.

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
