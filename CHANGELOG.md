# Changelog

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

All notable changes to SteelWolf Empire plugins marketplace.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) • [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

---

## [1.11.0] — 2026-07-03

### Added
- **swe 1.9.0 — Guardia di coerenza scrivania↔progetto (S166, Opzione B).** La sessione aperta deve combaciare con la scrivania Cowork corrente (rilevata dal basename radice mount → `desk_mount` nell'index). Scrivania-progetto X + apri Y (o hub default) → rifiuta; Hub = lanciatore (apre predator o qualsiasi progetto); FAIL-OPEN se scrivania non riconosciuta. Enforcement: hook `domain-guard.js` deterministico su CLI (exit 2, ricerca Anthropic hooks: `cwd`+`prompt`), prosa-resolver in Cowork (hook no-op, S159). Self-test 6/6.

### Changed
- **`bot-alliance` riclassificato** (fix design): da dominio autonomo `swe_writes:false` a progetto SteelWolf `swe_writes:true` (repo reale `trading-alliance-bots`, catena `BA-S` nel SUO SESSION_LOG). Ora `/swe:start bot-alliance` apre la stessa Enriched Visual View. `swe_writes:false` resta solo per domini ESTERNI `repo:null` (Nexus, WorkDASH).
- `hooks/domain-guard.js`: rimosso `bot-alliance` dagli esterni + aggiunto check coerenza cwd↔slug.
- `start/end/cycle/SKILL.md` §0-ter: guard esterni + guardia coerenza (Opzione B, fail-open).
- Marketplace `1.10.0`→`1.11.0`; plugin `swe` `1.8.0`→`1.9.0`.
- Hub `_PROJECTS_INDEX.yaml`: `bot-alliance` swe_writes true + campo `desk_mount` per ogni progetto (commit separato hub-repo).

### Rationale
- Chiude la contraddizione "ogni progetto SteelWolf apre con la stessa base" vs guardia che rifiutava BA. Fonti: Anthropic Hooks (cwd/CLAUDE_PROJECT_DIR/UserPromptSubmit exit 2), pattern monorepo "custom CLI valida il contesto" (Marco Lancini 2026), direnv per-directory, sfida root-vs-subdir.

---

## [1.10.0] — 2026-07-02

### Added
- **swe 1.8.0 — Handoff card (Cycle FASE 2).** Terza card della famiglia (apertura/chiusura/handoff). Ponte S(n)→S(n+1): recap sessione chiusa + comando `/swe:start` da lanciare in CHAT NUOVA (SOLO testo, LL-050) + preview S(n+1) (PC/pull/priorità/carryover dallo snapshot `S(n+1)_OPEN.md`).
  - NEW asset `plugins/swe/skills/cycle/assets/handoff-card.template.html` + `handoff-card.README.md`, **ricco come opening-card**: meta con data+ora ciclo/branch/HEAD/ultimo commit/Continuità/Parità PC + LL richiamate; sezione **Cosa si è fatto in S(n)** e **Cosa si farà in S(n+1)** con **priorità a Dettagli-tendina identici all'opening-card** (L2 a 10 campi: In parole semplici · Piano · Prima→Dopo · Serve/Dipende · Dati richiesti · Analisi&consultazione/ricerche+link · Skill da usare · Rischi · DoD · Consiglio); **Checklist & Roadmap** drill-down per milestone (barra %, voci `.new`); glosse in parole povere.
- `plugins/swe/skills/cycle/SKILL.md` v1.2→v1.3: §3 FASE 2 rende la handoff card (BINDING LL-050: comando solo testo, mai `sendPrompt` di avvio in-chat); fallback testo Code CLI.
- Marketplace `1.9.0`→`1.10.0`; plugin `swe` `1.7.0`→`1.8.0`.

---

## [1.9.0] — 2026-07-02

### Added
- **swe 1.7.0 — Enriched Visual View di CHIUSURA (End & Cycle).** Simmetria apertura/chiusura: la chiusura interattiva (`/swe:end`, `/swe:cycle` FASE 1) si rende ora con una card HTML custom gemella dell'opening-card, via `show_widget`.
  - NEW asset `plugins/swe/skills/end/assets/closing-card.template.html` + `closing-card.README.md`: header brandizzato, meta (data+ora chiusura · branch/HEAD · Handoff S→S · Parità PC · ultimo commit), **Sintesi D6** (Obiettivo · Scoperto/candidati-LL · Blocco attivo), PC/Tipo/Backup-V6 + **Memory snapshot (ADR-005)** + **Aggiorna EMPIRE_DASHBOARD** pre-accesi, Cosa fatto (voci+hash), Commit generati (push delegato Luke), Checklist aggiornata drill-down (spunte di sessione `.new`, barra %), DIRTY (D7), Nuove LL, **Anteprima entry SESSION_LOG (D6)** (pre WYSIWYG del testo che verrà scritto), GATE git clean (LL-024), handoff S(n+1), Note + nuove voci checklist/roadmap, Conferma via `sendPrompt`.

### Added
- **Simmetria apertura↔chiusura + durata/file (S165).** Opening card (start v1.6): glosse `.qglo` "in parole povere" su PC/Pull + principio tracciabilità condiviso. Closing card: chip `Durata · File toccati` nel meta. `end` §2 reso BINDING: emette automaticamente il blocco commit pronto-incolla coi file reali toccati per repo (push delegato Luke).
- **Strato tracciabilità (S165).** Ogni voce `Cosa fatto` e i toggle/campi della closing card portano 3 livelli: termine tecnico + in parole povere + provenienza (skill/ricerca/fonte web con LINK reale, mai inventato — LL-Empire-011; se assente "asset interno") + problemi trovati e risolti. Glosse `.qglo`/`.d6glo` su toggle (Backup/Snapshot/Dashboard) e campi D6; voci `Cosa fatto` come `.dit` con `<details>` a 3 sezioni.

### Changed
- `plugins/swe/skills/end/SKILL.md` v1.1→v1.2: §0-bis.2 Enriched Visual View di chiusura BINDING (sostituisce il widget elicitation nativo); + §0-lang lingua italiana; degradazione dati mancanti; fallback testo CLI.
- `plugins/swe/skills/cycle/SKILL.md` v1.1→v1.2: FASE 1 e §5 puntano alla closing card (no AskUserQuestion / elicitation nativo).
- Marketplace `1.8.6`→`1.9.0`; plugin `swe` `1.6.6`→`1.7.0`.

### Rationale
- Chiude il carryover FOCUS S165: portare la Enriched Visual View (base S164) anche alla chiusura, per simmetria apertura↔chiusura e zero perdita di contesto nel passaggio di consegne. Il widget elicitation nativo non accende il prefill (S161) → card HTML custom obbligatoria.

---

## [1.8.6] — 2026-07-02

### Added
- **`swe` v1.6.6 — dettagli priorità: "Skill da usare" (S165)**: nuovo campo L2 (con chiosa) su ogni priorità che indica quali skill/plugin attivare in base al contesto analizzato (es. empire-research, empire-quality, data/build-dashboard, xlsx/docx, figma…), così ogni nuova sessione sa già cosa attivare. Asset + §5-bis.2 aggiornati. Schema L2 ora 10 campi.

---

## [1.8.5] — 2026-07-02

### Added
- **`swe` v1.6.5 — dettagli priorità: Dati richiesti + Analisi & consultazione (S165)**: due nuovi campi L2 (con chiosa in parole semplici) su ogni priorità — **Dati richiesti** (input/dati necessari in base al contesto: cosa chiedere a Luke e cosa cercare) e **Analisi & consultazione** (analizza tutto + deep research Anthropic/GitHub/web ingegneristico e forum AI, dashboard/UI/WEB-AI/gestionale/pagamenti automatici, confronto opzioni, Pre-Mortem, soluzione migliore per priorità/workflow nel rispetto di checklist+roadmap). Asset + §5-bis.2 aggiornati.

---

## [1.8.4] — 2026-07-02

### Added
- **`swe` v1.6.4 — chiose "in parole semplici" su ogni campo dettagli (S165)**: ogni etichetta tecnica dei Dettagli porta accanto una chiosa non-tecnica che ne spiega il senso — Piano (·cosa si fa passo per passo), Prima→Dopo (·com'è ora vs come sarà), Serve/Dipende (·cosa serve prima), Rischi&mitig (·cosa può andare storto e come si evita), Come sarà completato (·quando è finito davvero), Consiglio (·suggerimento). Completa la sezione "In parole semplici" introdotta in v1.6.3. Asset + §5-bis.2 aggiornati.

---

## [1.8.3] — 2026-07-02

### Added
- **`swe` v1.6.3 — dettagli priorità: "In parole semplici" (S165)**: i Dettagli di ogni priorità ora aprono con una sezione discorsiva NON tecnica che spiega cos'è l'upgrade, che funzioni/benefici porta e cosa si potrà fare dopo — poi seguono i campi tecnici (Piano/Prima→Dopo/Serve·Dipende/Rischi/Come sarà completato/Consiglio). Asset + §5-bis.2 aggiornati.

---

## [1.8.2] — 2026-07-02

### Added
- **`swe` v1.6.2 — dettagli priorità: Tipo di lavoro + Come sarà completato (S165)**: ogni priorità (tutti i workflow) ora ha nel meta L1 un chip **Tipo di lavoro** (Documentazione/Codice/Ricerca/Infra/Design/Governance) e in L2 una sezione **"Come sarà completato (DoD)"** = risultato finito concreto + criteri di accettazione (fusa/rinominata da "Verifica (DoD)"). Nessun campo precedente rimosso (Piano/Prima→Dopo/Serve·Dipende/Rischi·mitig/Consiglio invariati). Asset + §5-bis.2 aggiornati.

---

## [1.8.1] — 2026-07-02

### Changed
- **`swe` v1.6.1 — Ecosistema: data ultima modifica per progetto (S165)**: ogni riga Ecosistema mostra "ultima mod: YYYY-MM-DD" (= ultimo commit del repo, `git log -1 --date=format:"%Y-%m-%d"`). Ribadito nello schema che OGNI priorità (tutti i workflow) porta i dettagli L2 completi (Piano/Prima→Dopo/Serve·Dipende/Rischi·mitig/Verifica·DoD/Consiglio) — non solo alcune.

---

## [1.8.0] — 2026-07-02

### Added
- **`swe` v1.6.0 — Enriched Visual View v6 (S165, decisione delegata + ricerca 2026)**: (1) sezione **Ecosistema SteelWolf** collassabile (SOLO apertura hub/predator) — progetti dal registry con badge stato RAG+testo (attivo/freeze/parcheggiato/gemello) + apri-rapido; (2) **Checklist & Roadmap a drill-down per milestone** — ogni milestone espandibile alle voci esatte con flag outline (full on-demand, no overload); (3) chip header **Continuità** (S###→S###) e **Parità PC** (PREDATOR↔ACE). Coerente con best-practice dashboard 2026 (overview scannabile ≤6 card + progressive disclosure, badge non-solo-colore). Asset `opening-card.template.html` + §5-bis.2 aggiornati. Rimandati per evitare overload: chip Backup/Token/Scheduled (opzionali futuri).

---

## [1.7.8] — 2026-07-02

### Fixed
- **`swe` v1.5.8 — ultimo commit con data/ora forzata (S165)**: `{{LAST_COMMIT}}` spezzato in 3 placeholder separati `{{LAST_COMMIT_HASH}}` · `{{LAST_COMMIT_DATE}}` · `{{LAST_COMMIT_MSG}}` in template/README/SKILL, così la data/ora non è più omettibile dall'istanza (residuo estetico S165).

---

## [1.7.7] — 2026-07-02

### Fixed
- **`swe` v1.5.7 — rimossa contraddizione che faceva improvvisare l'apertura (S165)**: §5-bis diceva ancora "Cowork: widget di conferma (modulo elicitation)", in conflitto con §5-bis.2 (Enriched Visual View asset). Alcune istanze in chat nuove seguivano la riga sbagliata e renderizzavano una card elicitation povera invece dell'asset ricco. Riconciliato: §5-bis ora rimanda a §5-bis.2 (rendi l'asset via `show_widget`), aggiunto divieto IMPERATIVO (no AskUserQuestion / no elicitation nativo / no card improvvisate / no priorità a testo) in SKILL e nell'hook `session-start.js`. Nessun file/asset rimosso — solo riconciliazione istruzioni.

---

## [1.7.6] — 2026-07-02

### Fixed
- **`swe` v1.5.6 — apertura: timestamp con ORA + lingua italiana (S165 collaudo)**: (1) la card d'apertura ora richiede DATA+ORA obbligatorie — `{{DATE_TIME}}` = `YYYY-MM-DD · HH:MM TZ` (via shell `date`), `{{LAST_COMMIT}}` = `<hash> · YYYY-MM-DD HH:MM · <messaggio>` (via `git log -1 --date=format`). Header etichetta "Apertura:". (2) Binding LINGUA ITALIANA in `start/SKILL.md` (§0-lang + §5-bis.2) e nell'hook `session-start.js`: risposte/preamboli/ragionamento sempre in italiano, mai inglese (fix preambolo EN emerso al collaudo S165).

---

## [1.7.5] — 2026-07-02

### Added
- **`swe` v1.5.5 — Enriched Visual View: base ufficiale card d'apertura (S164/A5)**: nuova §5-bis.2 in `start/SKILL.md` + asset `skills/start/assets/opening-card.template.html` + `opening-card.README.md`. L'apertura di OGNI sessione e OGNI progetto usa una card HTML custom (via `show_widget`) pre-accesa (valori dedotti già selezionati; il widget elicitation nativo non accende il prefill — S161). Header brandizzato (SW + N sessione + data/ora + branch/HEAD + ultimo commit), LL richiamate, PC+Pull, Riferimenti rapidi, tendina Checklist&Roadmap con flag outline (verde=fatto / da fare; MAI `-filled`) + barra progresso, priorità per workflow con mini-brief L2 (Piano · Prima→Dopo · Serve/Dipende · Rischi&mitig · Verifica/DoD · Consiglio), Prossimo passo, Note di sessione, +Nuova voce Checklist, +Nuova voce Roadmap. Degradazione dati mancanti (S1 / — / sezione nascosta). **Fallback testo** per Code CLI/Chat. Ricerca UX + fonti in `hub/designs/S164_ENRICHED_VISUAL_VIEW.md`. Schema riusato da end/cycle e blueprint Nexus.

---

## [1.7.4] — 2026-07-02

### Added
- **`swe` v1.5.4 — hook deterministico domain-isolation guard (S164/A3)**: nuovo `hooks/domain-guard.js` cablato su `UserPromptSubmit` in `hooks.json`. Blocca `/swe:start|end|cycle <slug-dominio-autonomo>` (`bot-alliance`/`nexus`/`workdash`, == `swe_writes:false` in `_PROJECTS_INDEX.yaml`). Design Cowork-safe (ricerca hooks Anthropic + LL-060/S159): in **Cowork** (`CLAUDE_CODE_IS_COWORK==="1"`) NON legge stdin → exit 0 no-op (copre il guard-prosa hard-stop); su **Code CLI** legge il `prompt` da stdin e su match → **exit 2** (rifiuta il prompt + stderr di rimando al dominio). Fail-open su qualsiasi errore/stdin vuoto (mai bloccare sessioni legittime). Test locali 4/4 (bot-alliance→2, ta-analysis→0, nudo→0, Cowork→0). Ricerca in `hub/designs/S164_HOOK_GUARD_RESEARCH.md`.

---

## [1.7.3] — 2026-07-02

### Changed
- **`swe` v1.5.3 — formato priorità obbligatorio nella card apertura (S164, fix Luke)**: la card "Apertura sessione S<n> details" non deve elencare solo i titoli delle priorità. Nuova §5-bis.1 in `start/SKILL.md`: ogni voce va presentata con formato descrittivo canonico *Cosa · Perché · Output · Rischio*, più due ordinamenti espliciti — **ordine consigliato** (valore/urgenza) e **ordine workflow** (dipendenze). Sezione "Cross-cutting" sempre presente per i vincoli permanenti (parità ACE, handoff). Obiettivo: Luke capisce su cosa lavorare senza aprire altri file.
- **`swe` v1.5.3 — index project-aware esteso ai ta-\* (S164/A2)**: aggiunti a `_PROJECTS_INDEX.yaml` (hub) `ta-analysis` (ST-Analyst), `ta-academy` (ST-Academy), `ta-knowledge` (ST-Knowledge), `ta-content` (ST-Content) — dominio `steelwolf`, `swe_writes: true`, `bootstrap: on-demand` (SESSION_LOG creato alla 1a sessione; i repo hanno gia' PROJECT_STATE/ROADMAP/CHECKLIST). Nuovo passo resolver **§0-ter.4-bis** in `start/SKILL.md` + nota bootstrap in `end/SKILL.md`: SESSION_LOG mancante = sessione `S1`, non errore; colpo d'occhio da PROJECT_ROADMAP/CHECKLIST.

---

## [1.7.2] — 2026-07-01

### Fixed
- **`swe` v1.5.2 — guard domain-isolation HARD-STOP (S163 collaudo, Test 4)**: al test live `/swe:start bot-alliance` l'istanza apriva comunque il dominio in lettura + briefing + WAIT invece di rifiutare. Il guard §0-ter era troppo soft (advisory "non apre ne' scrive"). Ora e' un **hard-stop**: su `swe_writes: false` la SKILL si ferma subito, NON legge doc / NON briefa / NON attende GO, ed emette SOLO un rifiuto esplicito con rimando al dominio proprietario (scrivania Bot-Alliance / plugin nexus). Nota: guard advisory in prosa; enforcement deterministico = hook `UserPromptSubmit` (candidato follow-up).

---

## [1.7.1] — 2026-07-01

### Changed
- **`swe` v1.5.1 — numerazione nativa per-progetto (S163 collaudo)**: dopo il test live del pilota, il contatore per-progetto usa la **numerazione nativa** del progetto (journal -> `Sn`, non `JOURNAL-Sn`). `_PROJECTS_INDEX.yaml`: `steelwolf-trading-journal.session_prefix` -> `""`. SKILL `start` §0-ter punto 4 chiarito: prefisso solo per catene che lo usano nativamente (es. `BA-S`), altrimenti vuoto -> `Sn`. Nessun cambio di comportamento del resolver (già nativo al test).

---

## [1.7.0] — 2026-07-01

### Added
- **`swe` v1.5.0 — session-governance per-progetto (S163, focus)**: `/swe:start|cycle|end <slug>` ora **project-aware**. Nuovo indice `hub/steelwolf-empire-hub/_status/_PROJECTS_INDEX.yaml` (proiezione machine-readable del registry): `slug -> repo . session_log . roadmap . session_prefix . branch . desk . domain . swe_writes`. Le 3 SKILL guadagnano §0-ter "Risoluzione progetto" (resolver condiviso): con `$1` risolve i path DEL PROGETTO (contatore per-progetto es. `JOURNAL-Sn`), senza argomento resta il default `predator`/hub (retro-compat, zero regressione). Roll-up all'hub via ADR-029 (`_status/<slug>.yaml` -> `EMPIRE_STATE.md`): la catena hub non e' piu' inquinata dal lavoro di progetto. **GUARD domain-isolation**: `swe_writes: false` sui domini autonomi (`bot-alliance`, `nexus`, `workdash`) -> swe non scrive le loro catene. `end.md` argument-hint -> `[progetto-opzionale]`. PILOTA: `steelwolf-trading-journal`.

---

## [1.6.1] — 2026-07-01

### Changed
- **`swe` v1.4.1 — pre-selezione apertura deterministica (S161 addendum)**: `skills/start/SKILL.md` §5-bis ora definisce regole di pre-selezione riproducibili tra istanze diverse — PC ereditato dall'ultima entry SESSION_LOG; **pull** = `già aggiornati` solo con evidenza di push in pari data/PC nel SESSION_LOG, altrimenti `da verificare` (niente più guess `da fare`/`già fatto`); numero sessione = ultima +1; priorità = carryover ereditato. Risolve la divergenza osservata al collaudo S162 (istanze diverse pre-selezionavano pull diverso). SKILL `start` v1.2.

---

## [1.6.0] — 2026-07-01

### Changed

#### Plugin `swe` v1.4.0 — /swe:cycle handoff (LL-050) + tipi sessione canonici + persistenza briefing (S161)
- **`/swe:cycle` FASE 2 rifatta (fix LL-Empire-050)**: non apre più la sessione successiva nella stessa chat (mescolava i contesti). Ora **prepara l'handoff** — persiste lo snapshot in `SESSION_BRIEFINGS/S<n+1>_OPEN.md` ed emette l'istruzione di aprire una CHAT NUOVA con `/swe:start`. `commands/cycle.md` + `skills/cycle/SKILL.md` v1.1.
- **Tipi sessione riconciliati (T6)**: `skills/start/SKILL.md` §1 e `skills/end/SKILL.md` §1 ora condividono un'UNICA tabella canonica A/B/C/D/E/K per *tipo di lavoro* (prima `end` usava A=apertura/B=closure, in conflitto). `end` §7 handoff chiarito a Tipo K.

### Added
- **Persistenza scheda apertura (§5-ter, richiesta Luke S161)**: `/swe:start` scrive lo snapshot d'apertura in `hub/SESSION_BRIEFINGS/S<n>_OPEN.md` (PC · pull · briefing · carryover · priorità pre-compilate) via bash-write, così la predisposizione persiste anche a chat chiusa. `start` §5-ter + step 6-ter in `commands/start.md`. `start`/`end` SKILL bump a v1.1.

### Notes
- Scrittura snapshot = bookkeeping non distruttivo, ammessa prima del GO (il GATE GO protegge il lavoro, non la registrazione stato).
- Commit/push V1-parity e reinstall plugin restano lato Luke Windows (LL-Empire-019/031).

---

## [1.5.0] — 2026-07-01

### Added

#### Plugin `swe` v1.3.0 — Chiusura interattiva + ciclo end+start (S160)
- `commands/end.md` + `skills/end/SKILL.md` (v1.1): aggiunto **Step 0 / §0-bis Chiusura interattiva** simmetrica all'apertura `/swe:start`. Raccoglie in un colpo i dati della entry D6 (PC · tipo sessione A/B/C/D/E/K · obiettivo+completato · DIRTY da propagare · LL emerse · prossimo passo · backup V6) prima di scrivere i file. Cowork: widget elicitation a runtime; Claude Code CLI: stesse domande in testo. `argument-hint: [tipo-sessione-opzionale]`.
- **Nuovo comando `/swe:cycle`** (`commands/cycle.md` + `skills/cycle/SKILL.md` v1.0): chiude la sessione corrente (skill `end`, D6 completo con GATE git clean LL-Empire-024) e — **solo a closure confermata** (checkpoint working-tree clean Windows-side) — riapre la successiva (skill `start`, apertura interattiva + ATTENDI GO LL-Empire-002). Orchestrazione delle skill esistenti, non reimplementazione: i bugfix a `end`/`start` si propagano al ciclo. `argument-hint: [progetto-opzionale]`.

### Notes
- Dominio SteelWolf N4 (Nexus escluso — ecosistema separato).
- Commit/push V1-parity e reinstall plugin restano lato Luke Windows (LL-Empire-019/031).
- Attivazione in Cowork: disinstalla+reinstalla `swe` + nuova sessione (hook/commands fotografati all'avvio).

---

## [1.4.0] — 2026-07-01

### Fixed
- **swe hook non partivano in Cowork/Windows (causa radice)**: gli hook erano `command` shell-form `bash ...`; su questo host Git Bash non è installato, quindi Claude Code ripiega su PowerShell che non sa lanciare `bash` -> hook muti (SessionStart/SessionEnd/UserPromptSubmit tutti inattivi). Verificato su docs.claude.com/hooks (Exec form vs Shell form) + `where bash` (assente) / `where node` (presente).

### Changed
- Convertiti gli hook a **Node exec form** (`command:node`,`args:[script.js]`) — cross-platform, raccomandato dalla doc Anthropic. SessionStart->`session-start.js`, SessionEnd->`session-end.js`.
- Aggiunto **domain-guard** `_swe-domain.js`: gli hook agiscono solo nel dominio SteelWolf (Cowork: `CLAUDE_CODE_WORKSPACE_HOST_PATHS`; CLI: `CLAUDE_PROJECT_DIR`/cwd). Evita contaminazione tra ecosistemi (es. Nexus).
- `UserPromptSubmit`/forced-eval **rimosso da hooks.json** (era bash morto); disponibile come `forced-eval.js` non cablato, da abilitare su scelta.

### Removed
- Vecchi hook bash `session-start.sh`, `session-end.sh`, `forced-eval.sh`.

---

## [1.3.1] — 2026-07-01

### Fixed
- **swe hook SessionStart non caricato in Cowork**: `hooks.json` era in `plugins/swe/.claude-plugin/` (posizione non valida per la spec Claude Code). Spostato in `plugins/swe/hooks/hooks.json` (canonico). Root cause verificata su docs.claude.com/plugins-reference. Banner STEELWOLF ora si registra all'apertura sessione.

---

## [1.3.0] — 2026-07-01

### Added

#### Plugin `swe` v1.1.0 — Apertura interattiva sessione (S158)
- `hooks/session-start.sh`: riscritto come echo statico ASCII puro (no MCP/rete/secret, no file-read) che inietta l'apertura interattiva SteelWolf: Step 0 (dichiara PC PREDATOR/ACE + git pull), doc L0, conferma stato (PC · pull · priorita) + colpo d'occhio CHECKLIST/ROADMAP, ATTENDI GO (LL-Empire-002).
- `commands/start.md`: aggiunti Step 0 (dichiara PC + pull) e step 6-bis Apertura interattiva prima di ATTENDI GO; pull-first 11 repo e CLAUDE.md hierarchy invariati.
- `skills/start/SKILL.md`: aggiunte §0 (STEP 0 dichiara PC + pull) e §5-bis (apertura interattiva — Cowork widget elicitation / Claude Code CLI testo).
- Pattern replicato da Nexus_Empire nel dominio SteelWolf (N4 dominio separato, fonte unica interna), governance LL-Empire.

#### Marketplace
- Plugin `swe` version 1.0.0 -> 1.1.0 (`plugin.json` + entry `marketplace.json`)
- `marketplace.json` metadata.version 1.2.0 -> 1.3.0

---

## [1.2.0] — 2026-06-30

### Added

#### Plugin `ironx-suite` v1.0.0 (NEW)
- `.claude-plugin/plugin.json` manifest
- README.md con tabella 15 skill + governance freeze V5
- 15 skill `ironx-*` (model-invocation, frontmatter `name` stripped per Issue #22063, CRLF→LF normalizzato):
  - `ironx-prime`, `ironx-ecosystem`, `ironx-platform-matrix`
  - `ironx-nt8`, `ironx-mql5`, `ironx-pinescript`
  - `ironx-signals`, `ironx-bar-types`, `ironx-alerts`, `ironx-confluence`
  - `ironx-research`, `ironx-engineer`, `ironx-quality`, `ironx-docs`, `ironx-session`

#### Marketplace
- `marketplace.json` metadata.version 1.1.0 → 1.2.0 + entry `ironx-suite`
- Layer 3 ADR-033: skill IronX da cache Desktop → marketplace versionato (cross-PC replicabile, NON copia cache)

---

## [1.0.0] — 2026-04-27

### Added — Initial release

#### Marketplace
- `.claude-plugin/marketplace.json` — multi-plugin marketplace definition
- LICENSE (UNLICENSED proprietary)
- README.md root con quick start
- docs/INSTALL.md per Cowork + Code CLI + Web
- docs/DEVELOPMENT.md guide for plugin authors
- docs/ARCHITECTURE.md design decisions
- CHANGELOG.md (this file)
- .github/workflows/ CI schema validation

#### Plugin `swe` v1.0.0
- `.claude-plugin/plugin.json` manifest
- `.claude-plugin/hooks.json` lifecycle hooks
- Skills auto-discovery (model invocation):
  - `skills/start/SKILL.md` — apertura sessione Empire
  - `skills/end/SKILL.md` — chiusura D6
  - `skills/compact/SKILL.md` — compact mid-session
- Commands slash explicit (user invocation):
  - `commands/start.md` — `/swe:start`
  - `commands/end.md` — `/swe:end`
  - `commands/compact.md` — `/swe:compact`
- Hooks lifecycle scripts:
  - `hooks/session-start.sh` — reminder LL-Empire binding
  - `hooks/session-end.sh` — V1 parity checklist
  - `hooks/forced-eval.sh` — 84-100% skill activation pattern (Gap 10)

### Architecture decisions
- Plugin name `swe` (3 char namespace, slash `/swe:<command>`)
- Skill `name:` field OMITTED (Issue #22063 fix)
- Dual pattern skills/+commands/ (Anthropic 2026 native)
- License UNLICENSED proprietary, repo pubblico per marketplace install
- Hooks bash cross-platform via `${CLAUDE_PLUGIN_ROOT}`

### Empire LL binding referenced
LL-Empire-002, 003, 008, 011, 014, 018, 019, 021, 023, 024 (28+ lessons total)

### Compatibility
- ✅ Claude Code CLI
- ✅ Claude Cowork desktop ≥ 2026.04
- ⚠️ Claude.ai web (skills only, slash limited)

### Known issues
- Issue #27398: plugin hooks Cowork potrebbe non firere — fallback `~/.claude/settings.json`
- Issue #26951: marketplace install HTTP 404 occasional — retry pattern

---

## Future releases (planned)

### [1.1.0] — TBD
- Plugin `empire-research` — WebFetch + verifica spec esterno automatica
- Migration empire-quality, empire-pattern-detector, empire-docs da legacy core repo

### [1.2.0] — TBD
- Plugin `ironx-helpers` — IronX MT5/TV/NT8 cross-platform tools
- Plugin `ta-tools` — Trading Alliance bot operations
