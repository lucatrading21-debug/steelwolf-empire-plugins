---
description: Empire pattern detector v4.0 esplicito. Attiva scan T1-T7 pattern detection (correzioni ripetute, bug non documentati, regole mancanti, pattern ricorrenti, limiti piattaforma, incongruenze cross-skill, workflow improvements) + Pre-Mortem Q1-Q5 gate LL-Empire-004 + cross-skill incongruenze §6 + IronX firewall §11. Auto-priorita T2>T6>T3>T1>T5>T4>T7. Skill empire-pattern-detector v4.0 binding.
argument-hint: [scope-opzionale]
allowed-tools: Read Bash Grep Glob
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

Esegui workflow pattern detection Empire seguendo skill `empire-pattern-detector` plugin empire-core
in `skills/empire-pattern-detector/SKILL.md`. Riferimento completo body: vedi SKILL.md.

## Sequenza esplicita

1. **Context awareness §2** — Identifica progetto attivo da `CLAUDE.md` root repo corrente. Mappa destinazioni per tipo file (CLAUDE.md root, `.claude/rules/*.md`, `docs/LESSONS_LEARNED.md`, `docs/SESSION_LOG.md`). IronX firewall: solo segnalare, NON proporre destinazioni (ironx-prime §11 prevale).

2. **Scan trigger types §3** — T1 correzioni ripetute (frasi "ricordati", "come abbiamo detto", "sempre", "mai"); T2 bug non documentati (risolti ma assenti rules/LESSONS); T3 regole mancanti (preventiva); T4 pattern ricorrente (3+ volte non codificato); T5 limite piattaforma (workaround necessario); T6 incongruenze cross-skill (skill A vs CLAUDE.md vs rules diverging); T7 workflow improvement (approccio migliore da standardizzare).

3. **Classificazione + auto-priorita §4** — Type T1-T7 + Urgency CRITICAL/IMPORTANT/USEFUL + Impact + Project. Priority order: `T2 > T6 > T3 > T1 > T5 > T4 > T7`. Eccezioni: CRITICAL sovrascrive sempre; cross-project = minimo IMPORTANT.

4. **Pre-Mortem §5B Q1-Q5 OBBLIGATORIO** per ogni proposta che introduce qualcosa di NUOVO (file, skill, tool, dipendenza, workflow, integrazione). Trigger meccanico binario: crea qualcosa che prima non esisteva? SI -> Pre-Mortem; NO -> non serve. Q1 misura dati reali bash, Q2 costo inazione 10 sess, Q3 effetti collaterali min 2, Q4 alternativa "non fare nulla", Q5 numeri reali misurati. VERDETTO: PROCEDI o FERMATI.

5. **Procedura proposta §5** — Quando rileva pattern, ASPETTA fine task corrente, poi:
   ```
   PATTERN RILEVATO [T{N}] — {urgency}
   Progetto: {nome repo}
   Ho notato: {descrizione max 2 righe}
   Destinazione: {file specifico §2}
   Contenuto: {riga esatta}
   ```

6. **Cross-skill detection §6** — Confronto attivo `CLAUDE.md` vs `.claude/rules/*.md` vs `LESSONS_LEARNED.md` per incongruenze T6 (urgency minimo IMPORTANT). Empire: skill empire-core vs copie locali repo figli (versioni allineate?), protocolli D6/D7/D8 vs comportamento effettivo.

7. **Pattern backlog §7** — Pattern rimandati Luke ("ignora per ora") -> riepilogo fine sessione SESSION_LOG con stato `rimandato`. Ripropone sessioni successive con `riproposto — gia segnalato il [data]` + urgency promossa di un livello (USEFUL→IMPORTANT→CRITICAL).

8. **Fine sessione §8** — Riepilogo PATTERN DETECTOR v4.0: progetto attivo, pattern proposti con esito (approvato/ignorato/rimandato), pattern non proposti (bassa priorita), pattern rimandati da sessioni precedenti, incongruenze rilevate.

Argomento opzionale `$1`: scope check (es. `cross-skill`, `pre-mortem`, `t6-incongruenze`).

## Regole binding

- Massimo 3 proposte per sessione (priorita auto)
- Mai interrompere mid-task
- Governance a tre: Luke decide, Sonnet validate, Opus/Cowork executor
- IronX firewall: solo segnalare, NON proporre destinazioni
- Pre-Mortem §5B applicabile A SONNET E OPUS indifferentemente (chiunque propone NUOVO)

LL critiche binding: 002 (PROTOCOLLO GO), 004 (Pre-Mortem Q1-Q5), 005 (bias ragionevolezza), 007 (conflict hierarchy), 008 (verifica empirica), 011 (anti-confabulation Sonnet)
