---
description: Apertura sessione Empire SteelWolf — pull-first 11 repo + CLAUDE.md hierarchy + SESSION_LOG ultime 20 righe + LESSONS_LEARNED indice + memory snapshot + briefing + ATTENDI GO esplicito Luke (LL-Empire-002)
argument-hint: [progetto-opzionale]
allowed-tools: Read Bash Grep Glob
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

## SWE CARD CONTRACT — BINDING (CARD-01, S187)

> Blocco normativo, presente in `commands/start.md`, `commands/end.md`, `commands/cycle.md`.
> Sta qui, e non solo in `SKILL.md`, perché in Cowork cloud né gli hook né il corpo della
> skill raggiungono l'istanza (misurato S187). Questa è l'unica superficie che arriva sempre.

**La card SWE non si disegna. Si renderizza.**

Prima di produrre qualunque output visuale di apertura, chiusura o handoff:

1. **Individua il renderer canonico.**
   `${CLAUDE_PLUGIN_ROOT}/skills/start/assets/render-card.mjs`
   Template: `skills/start/assets/opening-card.template.html` ·
   `skills/end/assets/closing-card.template.html` ·
   `skills/cycle/assets/handoff-card.template.html`

2. **Costruisci il modello JSON** secondo `skills/start/assets/render-card.README.md`.
   Campo `kind`: `opening` per start · `closing` per end · `handoff` per cycle.
   Riempi i campi coi dati reali del progetto risolto. Provenienza reale, mai
   inventata (LL-Empire-011).

3. **Esegui** `node <percorso>/render-card.mjs <model.json>` → HTML completo su stdout.

4. **Mostra esclusivamente quell'HTML** con `show_widget`, senza modificarlo.

**Cowork cloud / sessione remota.** Il renderer non è raggiungibile via
`${CLAUDE_PLUGIN_ROOT}`: i file stanno sulla macchina dell'utente. Copiali nella
sandbox conservando il layout relativo — `skills/start/assets/`, `skills/end/assets/`,
`skills/cycle/assets/` — ed esegui lì. Misurato funzionante in S187: RC=0, zero
placeholder residui.

**Due vie legittime, una vietata.**

- *Livello 1* — l'hook ha già reso la card (`card_ready: <path>`): leggi quel file e
  mostralo. Non ricostruire nulla.
- *Livello 2* — nessun modello `swe-model` disponibile: **costruisci tu il modello** ed
  esegui il renderer. Pienamente legittimo. L'assenza del modello è un degrado del
  percorso, non una violazione del contratto.
- *Livello 3* — card composta a mano: **VIETATO**. È la violazione.

**Se il renderer non è raggiungibile: STOP.**
Non produrre una card alternativa, non approssimare il layout, non ripiegare su
`AskUserQuestion` né sul widget elicitation nativo. Ferma il comando ed emetti
esattamente questa riga, e nient'altro:

    SWE CARD BLOCKED — renderer canonico non raggiungibile: <cosa manca>. Nessuna card alternativa prodotta.

**Dove `show_widget` non esiste** (Claude Code CLI, Chat): **non viene prodotta alcuna
visual card SWE.** È ammesso soltanto un output testuale etichettato esplicitamente
`SWE TEXT FALLBACK`, derivato dagli stessi dati del modello. Non è una card canonica,
non soddisfa il CARD FREEZE visuale, e non va presentato come equivalente.

**Template congelato (CARD FREEZE S166).** I tre template non si modificano, non si
semplificano, non si arricchiscono. Cambia il modello, mai l'interfaccia. Vale per
l'hub e per ogni progetto SteelWolf: **un solo renderer, molti modelli**.

**In più, per `end` e `cycle`:** persisti il blocco fenced `swe-model` nel briefing
canonico della PROSSIMA sessione, risolto secondo il progetto/dominio corrente e la
sua catena di sessione. Non inventare nomi, prefissi o percorsi: usa il resolver di
progetto già previsto da SWE. È ciò che riabilita il livello 1 all'apertura successiva.
Misurato S187 sulla catena hub: modello assente in 11 aperture su 21, e in 10
consecutive a partire da S178.

**Limite dichiarato.** CARD-01 è una convenzione, non una prova: nulla qui verifica che
il renderer sia stato davvero eseguito. La provenienza verificabile arriva con CARD-02
e CARD-03. Finché non sono in vigore, il finding **CARD-DRIFT-001 resta OPEN**.

Esegui workflow apertura sessione Empire SteelWolf seguendo skill `start` plugin swe
in `skills/start/SKILL.md`. Riferimento completo body: vedi SKILL.md.

## Sequenza obbligatoria

0. **Step 0 — Dichiara PC + Pull** (guida apertura interattiva SteelWolf, dominio SteelWolf N4):
   - Dichiara il PC attivo (**PREDATOR / ACE**). Se non lo rilevi, **chiedilo a Luke**.
   - Fai o chiedi `git pull` sui repo attivi (pull-first, dettaglio al punto 1). Riporta esito: fatto / da fare.

1. **Pull-first protocol 11 repo** (LL-Empire-023 binding) — CMD da Luke Windows. Sequenza completa in `hub/SESSION_PROTOCOL.md` §2.2.

2. **CLAUDE.md hierarchy** Anthropic 2026:
   - `~/.claude/CLAUDE.md` (USER, M1 Action 1.1)
   - `hub/steelwolf-empire-hub/CLAUDE.md` (PROJECT)
   - `config/luke-empire-config/CLAUDE.md` (governance V1-V6)
   - `<repo>/CLAUDE.md` se sessione su repo specifico

3. **SESSION_LOG.md** ultime 20 righe + **LESSONS_LEARNED.md** indice (24 LL v1.8 binding)

4. **Memory snapshot** più recente in `hub/_memory-snapshot/`

5. **Verifica empirica** sandbox vs CMD Windows (LL-Empire-024): se delta sandbox non confermato Windows-side, chiedi a Luke verifica `findstr` PRIMA di proporre azioni recovery

6. **Briefing stato** (max 10 righe):
   - Tipo ultima sessione + obiettivo + completato
   - DIRTY flag attivo? Cosa propagare (D7)?
   - Prossimo passo previsto
   - Blocchi attivi (PROTOCOLLO GO pending, drift, ecc.)
   - TIER status corrente

6-bis. **Apertura interattiva** (PC · pull · priorità + colpo d'occhio):
   - **Conferma stato**: PC · esito `git pull` (fatto / da fare) · priorità sessione.
   - **Colpo d'occhio**: sintesi `CHECKLIST` + `ROADMAP` (o `EMPIRE_DASHBOARD`) del progetto attivo, letti a runtime.
   - **Cowork**: widget di conferma (modulo elicitation, generato a runtime dall'assistente). **Claude Code CLI**: stesso contenuto in testo — il widget cliccabile esiste solo in Cowork.

6-ter. **Persisti scheda apertura** (SKILL `start` §5-ter): scrivi lo snapshot
   `hub/SESSION_BRIEFINGS/S<n>_OPEN.md` (PC · pull · briefing · carryover · priorita
   pre-compilate) via bash-write (LL-Empire-063), cosi la predisposizione persiste
   anche a chat chiusa. Scrittura non distruttiva, ammessa prima del GO (bookkeeping).

7. **ATTENDI GO esplicito Luke** (LL-Empire-002 NON DEROGABILE)
   - Default state = WAIT
   - Leggere/capire/vedere ≠ permesso eseguire
   - Solo "GO" o approvazione esplicita = procedere

Argomento opzionale `$1`: nome progetto target (es. `trading-alliance-bots`, `ironx-ecosystem`).

LL critiche binding: 002, 008, 011, 014, 018, 019, 021, 023, 024, 050, 063
