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

Esegui workflow chiusura sessione Empire SteelWolf seguendo skill `end` plugin swe
in `skills/end/SKILL.md`. Riferimento completo body: vedi SKILL.md.

## Sequenza obbligatoria

0. **Step 0 — Chiusura interattiva** (simmetrica all'apertura `/swe:start`, dominio SteelWolf N4):
   - Raccogli i dati della entry D6 con un colpo solo, PRIMA di scrivere i file:
     PC attivo (**PREDATOR / ACE**) · **tipo sessione** (A/B/C/D/E/K) · obiettivo + completato (commit/hash reali) · **DIRTY** da propagare (D7)? · nuove **LL** emerse? · prossimo passo (carryover) · **backup V6** pre-destructive necessario?
   - **Cowork**: widget di conferma (modulo elicitation, generato a runtime dall'assistente). **Claude Code CLI**: stesse domande in testo — il widget cliccabile esiste solo in Cowork.
   - Se `$1` è passato (tipo sessione), pre-seleziona quel tipo nel widget.
   - Questi dati alimentano gli Step 1-4. NON scrivere nulla prima di aver raccolto/confermato.

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
