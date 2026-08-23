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

1. **Individua l'infrastruttura CARD canonica** — condivisa, non "di start" o "di end":
   renderer `${CLAUDE_PLUGIN_ROOT}/assets/card/render-card.mjs` ·
   verifier `${CLAUDE_PLUGIN_ROOT}/assets/card/verify-card.mjs`
   Struttura, stile e comportamento sono UNICI: `assets/card/card-shell.html` ·
   `card-core.css` · `card-behavior.js`. I kind forniscono solo contenuto:
   `assets/card/kinds/{opening,closing,handoff}.parts.html`.

2. **Costruisci il modello JSON** secondo `assets/card/render-card.README.md`.
   Campo `kind`: `opening` per start · `closing` per end · `handoff` per cycle.
   Riempi i campi coi dati reali del progetto risolto. Provenienza reale, mai
   inventata (LL-Empire-011).

3. **Esegui il renderer CON I FLAG DI SCOPE** (obbligatori da CARD-05: senza, esce 3):
   `node <percorso>/render-card.mjs <model.json> --scope-kind=<opening|handoff|closing> --scope-project=<slug> --scope-session=S<n> > <card.html>`

4. **Passa il gate CARD-04, fail-closed** — esegui e incolla l'esito:
   `node <percorso>/verify-card.mjs --kind=<k> --project=<slug> --session=S<n> --model=<model.json> --card=<card.html>`
   `exit != 0` → **STOP**: nessuna card, nessuna scrittura. Si corregge il **MODELLO** e si rirende, mai l'HTML.

5. **Mostra esclusivamente quell'HTML** con `show_widget`, senza modificarlo.

### Ordine del workflow — BINDING (S192/R2)

La card e' il **PRIMO OUTPUT VISIBILE** del comando. L'ordine non e' negoziabile:

    letture/misure necessarie → costruzione del modello → render → verify (CARD-04)
    → show_widget → CONFERMA DELL'OWNER → e solo allora: write / briefing / bookkeeping / recap / prosecuzione

- **Prima** della card sono consentite tutte le letture e le misure che servono a costruirla
  (git, SESSION_LOG, roadmap, index): senza, non ci sarebbe nulla da mostrare.
- **Prima** della card e della conferma sono VIETATI: qualunque output testuale visibile
  (briefing, recap, sintesi, elenco di priorita') e **qualunque scrittura su disco**, bookkeeping
  e briefing di apertura inclusi.
- Misurato in S192: l'apertura reale ha prodotto briefing testuale e `S192_OPEN.md` **prima** della
  card, e la card e' arrivata solo dopo un intervento esplicito dell'owner. Non era improvvisazione:
  era l'ordine che questa stessa sequenza prescriveva. Da qui non lo prescrive piu'.
- **Il gate non dipende da `SessionStart`**: quell'evento e' context-only e non puo' bloccare
  (doc Anthropic). La garanzia vive qui, nel corpo del comando.

**Cowork cloud / sessione remota.** Il renderer non è raggiungibile via
`${CLAUDE_PLUGIN_ROOT}`: i file stanno sulla macchina dell'utente. Copia l'intera cartella
`assets/card/` conservando il layout relativo (`card/`, `card/kinds/`) ed esegui lì.
Misurato funzionante in S187 e di nuovo in S192: RC=0, zero placeholder residui.

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

**Card congelata (CARD FREEZE S166, resa strutturale in S192/R1).** La struttura, lo stile e
il comportamento della card sono UNICI e di proprieta' del renderer: opening, handoff e closing
sono varianti di **contenuto** della stessa card, non tre template indipendenti. Non si
modificano, non si semplificano, non si arricchiscono. Cambia il modello, mai l'interfaccia.
Vale per l'hub e per ogni progetto SteelWolf: **una sola card, un solo renderer, molti modelli**.

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

> **L'ordine e' quello del contratto sopra: letture → modello → render → verify → card → conferma → tutto il resto.**
> I passi 1-6 sono LETTURE: servono a costruire la card e non producono output visibile ne' scritture.
> Il passo 6-bis (la card) e' il primo output. Il passo 6-ter (scrittura) viene DOPO la conferma.

0. **Step 0 — Dichiara PC + Pull** (guida apertura interattiva SteelWolf, dominio SteelWolf N4):
   - Rileva il PC attivo (**PREDATOR / ACE**) e lo stato del pull: sono **dati della card**, pre-accesi
     nei controlli. Si dichiarano NELLA card, non in un preambolo testuale che la precede.
   - Se il PC non e' deducibile, la card lo lascia da scegliere: si chiede a Luke **con** la card, non prima.

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

6-bis. **CARD — primo output visibile** (PC · pull · priorità + colpo d'occhio):
   - Costruisci il modello, rendi, **passa il gate CARD-04**, poi `show_widget`. Nient'altro prima.
   - **Contenuto**: PC · esito `git pull` · priorità pre-compilate · sintesi `CHECKLIST` + `ROADMAP`
     (o `EMPIRE_DASHBOARD`) del progetto attivo, letti a runtime.
   - **Cowork**: la card canonica via `show_widget`. **VIETATO** `AskUserQuestion` e il widget
     elicitation nativo: il prefill non si accende (S161) e la card non sarebbe quella canonica.
   - **Claude Code CLI / Chat** (nessun `show_widget`): nessuna card visuale. È ammesso solo un
     output testuale etichettato `SWE TEXT FALLBACK`, derivato dagli stessi dati del modello.

6-bis.1. **ATTENDI LA CONFERMA DELL'OWNER sulla card.** Finché non arriva: nessun briefing testuale,
   nessun recap, nessuna scrittura. Il passo successivo non parte da solo.

6-ter. **Persisti scheda apertura — SOLO DOPO la card e la conferma.** Destinazione e naming del
   briefing si derivano dalla project entry risolta; **regola canonica UNICA: skill `start` §5-ter**
   (qui non si duplica). Contenuto: PC · pull · briefing · carryover · priorita confermate, via
   bash-write (LL-Empire-063). Resta una scrittura non distruttiva e resta ammessa prima del **GO**
   di lavoro — ma **non** prima della card: il bookkeeping non e' una deroga all'ordine (S192/R2).
   Prima sessione di un progetto `bootstrap: on-demand`: vale la clausola SKILL `start` §0-ter.4-ter.

7. **ATTENDI GO esplicito Luke** (LL-Empire-002 NON DEROGABILE)
   - Default state = WAIT
   - Leggere/capire/vedere ≠ permesso eseguire
   - Solo "GO" o approvazione esplicita = procedere

Argomento opzionale `$1`: nome progetto target (es. `trading-alliance-bots`, `ironx-ecosystem`).

LL critiche binding: 002, 008, 011, 014, 018, 019, 021, 023, 024, 050, 063
