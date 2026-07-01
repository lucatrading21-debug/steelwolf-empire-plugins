# Changelog

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

All notable changes to SteelWolf Empire plugins marketplace.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) • [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

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
