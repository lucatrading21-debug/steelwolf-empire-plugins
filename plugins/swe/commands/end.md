---
description: Chiusura sessione Empire SteelWolf protocollo D6 — chiusura interattiva (widget) + SESSION_LOG + LESSONS_LEARNED + EMPIRE_DASHBOARD + memory snapshot + commit atomic LL-018 + GATE git status clean LL-024 + push delegato Luke V1 parity
argument-hint: [progetto-opzionale]
allowed-tools: Read Edit Write Bash Grep
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

Esegui workflow chiusura sessione Empire SteelWolf seguendo skill `end` plugin swe
in `skills/end/SKILL.md`. Riferimento completo body: vedi SKILL.md.

## Sequenza obbligatoria

0. **Step 0 — Chiusura interattiva** (simmetrica all'apertura `/swe:start`, dominio SteelWolf N4):
   - Raccogli i dati della entry D6 con un colpo solo, PRIMA di scrivere i file:
     PC attivo (**PREDATOR / ACE**) · **tipo sessione** (A/B/C/D/E/K) · obiettivo + completato (commit/hash reali) · **DIRTY** da propagare (D7)? · nuove **LL** emerse? · prossimo passo (carryover) · **backup V6** pre-destructive necessario?
   - **Cowork**: la card canonica di chiusura via `show_widget`, PRIMA di qualsiasi recap testuale.
     **VIETATO** `AskUserQuestion` e il widget elicitation nativo (prefill non si accende, S161).
     **Claude Code CLI / Chat**: nessuna card visuale, solo `SWE TEXT FALLBACK` dagli stessi dati.
   - Se `$1` è passato (tipo sessione), pre-seleziona quel tipo nel widget.
   - Questi dati alimentano gli Step 1-4. NON scrivere nulla prima di aver reso la card,
     superato il gate CARD-04 e ottenuto la conferma dell'owner.

1. **Update SESSION_LOG.md** entry formato D6:
   ```
   ## YYYY-MM-DD | Tipo X | <Titolo>
   **Obiettivo:** ...
   **Completato:** <commit hash reali> ...
   **Scoperto:** ...
   **Blocco attivo:** ...
   **Prossimo passo:** ...
   DIRTY: YYYY-MM-DD - ...
   Timestamp: YYYY-MM-DD sessione <env> Tipo X ~HH:MM CEST.
   ```

2. **Update LESSONS_LEARNED.md** se nuove LL emerse:
   - Aggiungi entry indice (riga tabella, severità CRITICA/ALTA/MEDIA)
   - Aggiungi entry body (Contesto/Pattern/Lezione/Why/How to apply/Validato/File master/Memorie correlate/Data)
   - Bump Versione + Lezioni totali + Ultima modifica footer

3. **Update EMPIRE_DASHBOARD.md** se status cambiato (header timestamp, M0.x/TIER status, conformità Anthropic %)

4. **Memory snapshot ADR-005 FALLBACK 2** per closure critica:
   `hub/_memory-snapshot/<YYYY-MM-DD>-<scope>.md`

5. **Commit atomic** (LL-Empire-018 binding):
   - File specifici, MAI `git add -A`
   - Convention D8: `FEAT` / `FIX` / `DOCS` / `REFACTOR` / `TEST` / `SECURITY` / `TIER0/1/2` / `M0.x/M1/M2`

6. **GATE BINDING (LL-Empire-024):** `git status` DEVE essere clean su **CMD Windows** prima di dichiarare closure. Sandbox bash NON è autoritativo.

7. **Push delegato Luke** (V1 parity verify diretta):
   ```cmd
   git push origin <branch>
   git rev-parse HEAD == git rev-parse origin/<branch>
   ```

8. **V6 backup** se prossima sessione è filesystem-destructive:
   `powershell -File hub/scripts/empire-backup.ps1 -Tag "pre-<descrittivo>"`

9. **Conferma chiusura** max 7 righe (Tipo, Obiettivo, Completato, Prossimo, WT clean, Push pending Luke, Backup hash)

Argomento opzionale `$1`: tipo sessione da pre-selezionare (A/B/C/D/E/K).

LL critiche binding: 002, 008, 011, 018, 019, 021, 023, 024
