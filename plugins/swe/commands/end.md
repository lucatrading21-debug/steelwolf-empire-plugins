---
description: Chiusura sessione Empire SteelWolf protocollo D6 — SESSION_LOG + LESSONS_LEARNED + EMPIRE_DASHBOARD + memory snapshot + commit atomic LL-018 + GATE git status clean LL-024 + push delegato Luke V1 parity
allowed-tools: Read Edit Write Bash Grep
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

Esegui workflow chiusura sessione Empire SteelWolf seguendo skill `end` plugin swe
in `skills/end/SKILL.md`. Riferimento completo body: vedi SKILL.md.

## Sequenza obbligatoria

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

LL critiche binding: 002, 008, 011, 018, 019, 021, 023, 024
