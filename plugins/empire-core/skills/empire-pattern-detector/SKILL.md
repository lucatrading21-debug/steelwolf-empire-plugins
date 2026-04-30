---
description: "Sistema rilevamento pattern v4.0 per empire-core plugin. Attivo in background ogni sessione Empire (qualsiasi repo). Monitora correzioni ripetute T1, bug non documentati T2, regole mancanti T3, pattern ricorrenti T4, limiti piattaforma T5, incongruenze cross-skill T6, workflow improvements T7. Context-aware: identifica progetto attivo da CLAUDE.md locale. Pattern backlog via SESSION_LOG con promozione urgency automatica. Auto-priorita T2>T6>T3>T1>T5>T4>T7. Pre-Mortem Q1-Q5 binding LL-Empire-004 obbligatorio per nuove proposte. IronX firewall §11 prevale (solo segnalare). Trigger: sempre attivo background OR /empire-core:detector. Backward compat workspace empire-pattern-detector."
allowed-tools: Read Bash Grep Glob
---

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

# EMPIRE PATTERN DETECTOR v4.0

> Migrata da workspace `hub/steelwolf-empire-core/skills/empire-pattern-detector/` (M2 P2 Fase 1 closure 2026-04-30 continuation S4). Body §1-§8 identico bit-per-bit al workspace originale v4.0, frontmatter adattato schema Empire plugin (no `name:` field per Issue #22063 namespace bypass enforcement).

Skill attiva in background in ogni sessione Empire.
Mai interrompere mid-task. Massimo 3 proposte per sessione, scelte per urgenza.
Governance a tre: Luke decide, zero azioni autonome.

> Migrata da Trading-Alliance-Bots v3.0 a empire-core v4.0 (16/04/2026).
> Astratta da TA-specifico a cross-repo. Ereditata da tutti i repo Empire.

---

## §1 — SCOPE E RELAZIONI

Opera su TUTTI i progetti Empire che ereditano da steelwolf-empire-core:
- **TA** — bot Telegram, guida PDF, marketing, community
- **IronX** — indicatori MT5/TV/NT8, NinZa reverse engineering
- **TA-Knowledge / TA-Academy / TA-Analysis / TA-Content** — contenuti educativi e ricerca
- **Empire infra** — skill globali, memory, sync, governance

**IronX firewall:** quando opera su IronX, ironx-prime §11 PREVALE. Il detector SEGNALA il pattern a Luke — non propone destinazioni, non modifica file. Le skill IronX sono CHIUSE.

**Governance:** Luke (decisore), Sonnet (validator), Opus/Cowork (executor). Il detector propone — Luke decide — nessuna modifica senza GO esplicito.

---

## §2 — CONTEXT AWARENESS + MAPPA DESTINAZIONI

### Prima azione in ogni sessione
Identificare il progetto attivo leggendo `CLAUDE.md` nella root del repo corrente.

### Struttura file per repo (schema generico Empire)

Ogni repo Empire segue questa struttura standard. I nomi esatti dei file rules/ e docs/ variano per repo — il detector LEGGE quelli presenti, non assume nomi fissi.

| Tipo file | Dove cercarlo | Quando destinare qui |
|-----------|---------------|---------------------|
| `CLAUDE.md` (root repo) | Root | Regole universali, governance, nuove sezioni |
| `.claude/rules/*.md` | Rules dir | Regole scope-specifiche (architettura, bug, config, deploy) |
| `docs/LESSONS_LEARNED.md` | Docs dir | Pattern generici, lezioni cross-sessione |
| `docs/SESSION_LOG.md` | Docs dir | Riepilogo fine sessione + pattern rimandati |
| `docs/SESSION_COMPACT.md` | Docs dir | Stato sessione corrente (se presente) |

### File contesto per progetto

| Progetto | File da leggere | Destinazioni pattern |
|----------|----------------|---------------------|
| Qualsiasi repo | `CLAUDE.md` (root) + `docs/LESSONS_LEARNED.md` | Scegliere per tipo dalla tabella sopra |
| IronX | `IronX_Ecosystem/CLAUDE.md` | SOLO segnalare a Luke |
| Empire infra | `CLAUDE.md` empire-core + skill globali | Skill globali o CLAUDE.md |

### Brand/voice awareness
Se esiste un file brand o voice/tone nel progetto attivo (es. PMC, style guide), leggerlo PRIMA di monitorare. Pattern che violano voice/tone/brand = CRITICAL.

---

## §3 — TRIGGER TYPES CON ESEMPI

### T1 — Correzione ripetuta
Luke corregge lo stesso comportamento 2+ volte.
Frasi segnale: "ricordati che", "come abbiamo detto", "sempre", "mai", "te lo avevo detto", "ancora questo problema".

Esempi reali:
- Git eseguito dalla root sbagliata invece che dalla root repo — corretto 2 volte
- Skill salvata in un solo path invece di due — corretto 2 volte prima di codificare regola

### T2 — Bug non documentato
Bug risolto che non appare in rules/ o LESSONS_LEARNED.

Esempi reali:
- Token/secret finito in file committabile su Git, intercettato solo in review
- Sandbox Cowork ha index.lock su git — scoperto solo al primo fallimento

### T3 — Regola mancante
Una regola che avrebbe prevenuto un errore se fosse stata documentata.

Esempi reali:
- Limite righe per file governance — non documentato, file cresciuto oltre soglia
- Regola business-critical non formalizzata — cruciale ma nota solo oralmente

### T4 — Pattern ricorrente
Stesso approccio usato 3+ volte senza essere codificato.

Esempi reali:
- Pattern staging: creare in cartella temp, copiare manualmente — usato 3+ volte
- Governance a tre: usata in 4 sessioni prima di formalizzarla

### T5 — Limitazione piattaforma
Limite tecnico scoperto e non documentato.

Esempi reali:
- Libreria X non renderizza feature Y — workaround necessario
- Sandbox non supporta operazione Z — solo alternative funzionano

### T6 — Incongruenza cross-skill
Due skill o documenti che si contraddicono.

Esempi reali:
- Skill A dice "usa X", CLAUDE.md dice "usa Y" — 4 file incoerenti, CRITICAL
- Skill riferisce file rinominato — path stale dopo refactoring

### T7 — Workflow improvement
Approccio che ha prodotto risultati migliori e dovrebbe diventare standard.

Esempi reali:
- Ricerca con 2 agenti paralleli — risultati migliori e piu veloci
- Ordine migrazione safe: .gitignore → rules → CLAUDE.md → verifica → rinomina

---

## §4 — CLASSIFICAZIONE + AUTO-PRIORITA

### Campi obbligatori per ogni pattern

| Campo | Valori |
|-------|--------|
| Type | T1-T7 |
| Urgency | CRITICAL / IMPORTANT / USEFUL |
| Impact | File/skill coinvolti |
| Project | Nome repo o CROSS |

### Auto-priorita baseline

Quando due pattern competono per le 3 proposte disponibili, usare questo ordine:

```
T2 (bug) > T6 (incongruenza) > T3 (regola mancante) > T1 (correzione ripetuta) > T5 (limite piattaforma) > T4 (pattern ricorrente) > T7 (workflow)
```

Eccezioni: CRITICAL sovrascrive sempre l'ordine. Cross-project = minimo IMPORTANT.

---

## §5 — PROCEDURA PROPOSTA

Quando rilevi un pattern, ASPETTA la fine del task corrente poi scrivi:

```
PATTERN RILEVATO [T{N}] — {urgenza}
Progetto: {nome repo}
Ho notato: {descrizione concreta, max 2 righe}
Destinazione: {file specifico dalla mappa §2}
Contenuto: {riga esatta da aggiungere}
```

**Se progetto = repo specifico:** proponi destinazione specifica dalla mappa §2, aspetta GO Luke.
**Se progetto = IronX:** segnala con classificazione. Scrivi: "Pattern IronX — ironx-prime governa. Segnalo per tua valutazione." NON proporre destinazioni.
**Se progetto = Empire infra / CROSS:** proponi destinazione in skill globale o CLAUDE.md empire-core. Se cross-project: indica file in ENTRAMBI i repo.

**Se destinazione = skill specifica:** NON editare la skill immediatamente. Scrivere l'entry in `docs/SKILL_UPDATES_PENDING.md` (se presente) sotto la sezione della skill giusta. Formato: `- [DATA] §sezione | testo esatto da aggiungere`. L'update viene applicato a inizio sessione successiva (contesto fresco, meno errori).

---

## §5B — PRE-MORTEM ANALYSIS (gate obbligatorio)

**Applicabile a Sonnet (Claude Code/Chat) e Opus (Cowork) indifferentemente.** Chiunque formula una proposta — in qualsiasi modalita Claude — DEVE eseguire il Pre-Mortem prima di presentarla a Luke.

Ogni proposta che introduce qualcosa di NUOVO nell'Empire — file, skill, tool, dipendenza, workflow, integrazione — DEVE passare questo gate PRIMA di raggiungere Luke.

**Trigger meccanico (binario, non interpretabile):** la proposta crea qualcosa che prima non esisteva? Se SI → Pre-Mortem obbligatorio. Se NO → non serve.

### 5 domande obbligatorie

**Q1 — IL PROBLEMA ESISTE?** Misura con dati reali (bash: wc -l, grep -c, token count). Stime a memoria VIETATE. Se non puoi misurarlo → problema ipotetico → FERMATI.

**Q2 — QUANTO COSTA NON FARE NULLA?** Descrivi cosa succede ignorando il problema per 10 sessioni. Se "nulla di grave" → FERMATI.

**Q3 — EFFETTI COLLATERALI?** Elenca almeno 2 modi in cui la soluzione peggiora le cose. Se non ne trovi → non hai pensato abbastanza.

**Q4 — ALTERNATIVA PIU SEMPLICE?** Confronta con "non fare nulla". Se il delta di beneficio e marginale → FERMATI.

**Q5 — TEST DEI NUMERI?** Inserisci numeri reali misurati (righe, token, secondi, percentuali). Se i numeri invalidano la proposta → FERMATI.

### Formato output nella proposta

    ### Pre-Mortem Analysis
    Q1 (problema esiste?): [dati misurati da bash]
    Q2 (costo inazione): [scenario 10 sessioni]
    Q3 (effetti collaterali): [minimo 2]
    Q4 (alternativa semplice): [confronto con "non fare nulla"]
    Q5 (test numeri): [numeri reali misurati]
    VERDETTO: PROCEDI / FERMATI

### Regole enforcement

- **PROCEDI** → presenta a Luke con Pre-Mortem incluso
- **FERMATI** → NON presentare, MA notifica Luke: "Ho valutato [X]. Pre-Mortem negativo: [motivo 1 riga]. Non procedo." — Luke puo overridare
- **Numeri Q1 e Q5:** DEVONO venire da comandi bash eseguiti, MAI da stime a memoria — stesso bias che genera la proposta genera stime ottimistiche
- **Massimo 3 minuti** per completare Q1-Q5 — se serve di piu, il problema e mal definito

### Cosa NON attiva il Pre-Mortem

- Fix puntuali a file esistenti
- Ripristini da git
- D6 session close
- Aggiornamenti documentazione di routine
- Risposte a domande dirette di Luke
- Pattern detection §5 standard (T1-T7 hanno gia il loro flusso)

---

## §6 — CROSS-SKILL DETECTION ATTIVA

### Checklist confronto (eseguire a inizio sessione se tempo lo permette)

**Per qualsiasi repo — file da confrontare per incongruenze:**
- `CLAUDE.md` (root) vs `.claude/rules/*.md` — stesse regole? stessi path?
- Rules bug-fix vs `LESSONS_LEARNED.md` — bug presenti in entrambi?
- Config rules vs config reale su server/ambiente — stessi parametri?
- Skill in `.claude/skills/` vs skill nel repo `skills/` — stessa versione?

**Empire — file da confrontare:**
- Skill in empire-core vs copie locali nei repo figli — versioni allineate?
- Protocolli (D6/D7/D8) vs comportamento effettivo sessione — rispettati?

### Procedura
Se trovi incongruenza: classificare come T6, urgency minimo IMPORTANT. Indicare ENTRAMBI i file e la riga specifica che diverge.

---

## §7 — PATTERN BACKLOG

Quando Luke dice "ignora per ora" o "rimanda" a un pattern proposto:
1. Scrivilo nel riepilogo fine sessione (§8) con stato `rimandato`
2. Alla sessione successiva: leggi ultimi riepiloghi in SESSION_LOG
3. Se lo stesso pattern riemerge: riproponi con nota `riproposto — gia segnalato il [data]`
4. Urgency automaticamente promossa di un livello (USEFUL→IMPORTANT, IMPORTANT→CRITICAL)

Zero file extra. Zero tracking separato. Usa solo SESSION_LOG.

---

## §8 — FINE SESSIONE

Prima di chiudere la sessione scrivi:

```
PATTERN DETECTOR v4.0 — RIEPILOGO [{data} {ora} CEST]
Progetto attivo: {nome repo}
Proposti:
  1. [T{N}] {urgency} — {breve} → {esito: approvato/ignorato/rimandato}
Non proposti (bassa priorita):
  - {lista con tipo e urgency}
Rimandati da sessioni precedenti: {lista o "nessuno"}
Incongruenze rilevate: {lista o "nessuna"}
```
