---
description: Chiusura sessione Empire SteelWolf protocollo D6 — chiusura interattiva (widget) + SESSION_LOG + LESSONS_LEARNED + EMPIRE_DASHBOARD + memory snapshot + commit atomic LL-018 + GATE git status clean LL-024 + push delegato Luke V1 parity
argument-hint: [progetto-opzionale]
allowed-tools: Read Edit Write Bash Grep
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

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
