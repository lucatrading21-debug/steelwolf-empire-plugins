# Enriched Visual View — card di CHIUSURA sessione (base ufficiale S165)

Gemella della card d'apertura (`start/assets/opening-card.template.html`). Stessa estetica e
stesso schema, dati di CHIUSURA (protocollo D6). Rendering via `show_widget` (Cowork).
Su Code CLI / Chat puri -> **fallback testo** (vedi sotto). LINGUA: italiano SEMPRE.

## Regole (binding, speculari a start §5-bis.2)
- **Sempre questa card** in chiusura: niente AskUserQuestion, niente elicitation nativo
  (il prefill non si accende — verificato S161). Card HTML custom = pre-acceso reale.
- **Pre-acceso**: PC (ultima entry SESSION_LOG), Tipo sessione (dedotto dal lavoro svolto),
  Backup V6 (default `No`, `Sì` solo se la prossima sessione è filesystem-destructive) partono
  con classe `sel` + marcatore "● dedotto".
- **Dati a runtime** dal progetto risolto (§0-ter di `end`): sessione N, data+ora chiusura,
  branch/HEAD, ultimo commit, cosa fatto, commit generati, checklist parsata con flag, DIRTY,
  nuove LL, prossimo passo/handoff S(n+1).
- **Degradazione**: nessun commit ancora -> `—`; checklist assente -> nascondi tendina;
  nessuna LL nuova -> "nessuna". Mai errore per dato mancante.
- **Icone flag**: SOLO outline (`ti-square-check` verde = fatto, `ti-square` = da fare).
  MAI varianti `-filled` (non caricate -> riquadro vuoto).
- **Token-saving**: clona `closing-card.template.html`, sostituisci i `{{PLACEHOLDER}}`,
  NON riscrivere da zero.

## Placeholder
{{PROJECT_LABEL}} {{PC}} {{TIPO}} {{SESSION}} {{DATE_TIME}} {{BRANCH_HEAD}}
{{CONTINUITY}} (S<n> -> S<n+1>) {{PC_PARITY}} {{NEXT_SESSION}} {{NEXT_STEP}} {{DURATION}} {{FILES_TOUCHED}}
(con ORA: {{DATE_TIME}} = data+ora chiusura `YYYY-MM-DD · HH:MM TZ` via shell `date`;
 {{LAST_COMMIT_HASH}} / {{LAST_COMMIT_DATE}} (`YYYY-MM-DD HH:MM`) / {{LAST_COMMIT_MSG}}
 via `git log -1 --date=format:"%Y-%m-%d %H:%M" --format="%h|%ad|%s"`)
{{LL_LIST}} {{DONE_COUNT}} {{DONE_ITEMS}} {{COMMIT_COUNT}} {{COMMITS}}
{{CK_DONE}} {{CK_TOTAL}} {{PROGRESS_PCT}} {{CK_NEW_DONE}} {{CHECKLIST_MILESTONES}}
{{DIRTY}} {{NEW_LL}} {{CROSS_CUTTING}}
{{OBIETTIVO}} {{SCOPERTO}} {{BLOCCO}} (campi D6 readout) · {{SESSION_LOG_PREVIEW}} (blocco markdown D6 letterale nel <pre>)
Pre-selezione pill: {{PC_*_SEL}} {{TIPO_*_SEL}} {{BACKUP_*_SEL}} {{SNAP_*_SEL}} {{DASH_*_SEL}} = "sel" sul dedotto, "" sugli altri.

## Sezioni fisse
Header brandizzato (SW + N sessione + "chiusura") · meta (data+ora chiusura, branch/HEAD,
Handoff S<n>->S<n+1>, Parità PC, ultimo commit) · LL richiamate (018/019/021/024/050) ·
PC + Tipo + Backup V6 + **Memory snapshot (ADR-005)** + **Aggiorna EMPIRE_DASHBOARD** (pill pre-accese) · Riferimenti rapidi · **Sintesi D6** (Obiettivo · Scoperto/candidati-LL · Blocco attivo) · Cosa fatto (voci+hash) ·
Commit generati (hash·tipo·msg, push delegato Luke) · Checklist aggiornata (drill-down milestone,
voci spuntate nella sessione con `.new`, barra %) · DIRTY (D7) · Nuove LL · **Anteprima entry SESSION_LOG (D6)** (pre WYSIWYG del testo che verra' scritto) · GATE git clean (LL-024) ·
Prossimo passo / handoff S(n+1) · Note di chiusura · +Nuova voce Checklist · +Nuova voce Roadmap ·
Cross-cutting · Conferma (sendPrompt: PC · Tipo · Backup V6 · Memory snapshot · Dashboard · Note · nuove voci).

## Blocchi ripetibili (nei commenti del template)
- Cosa fatto:   <div class="ck done"><i class="ti ti-square-check"></i> voce <span class="hcode">hash</span></div>
- Commit:       <div class="commit"><span class="hcode">hash</span> <span class="ctype">FEAT|FIX|DOCS</span> <span>messaggio</span></div>
- Milestone:    <details class="ms"><summary><span class="msdone|mstodo">Mx</span> Titolo <span class="mscount">fatti/tot</span></summary> ... voci .ck done/.ck done new/.ck todo ...</details>

## Fallback testo (Code CLI / Chat, no show_widget)
Rendi le STESSE informazioni in testo strutturato: header (sessione/PC/Tipo/data-ora/commit),
Cosa fatto (- voce · hash), Commit generati (- hash tipo msg), Checklist con [x]/[ ] e nuove spunte,
DIRTY, Nuove LL, prossimo passo/handoff. Poi ATTENDI conferma D6 + GATE git clean (LL-002/024).

Il file `closing-card.template.html` contiene lo scheletro con `{{PLACEHOLDER}}`, CSS e JS statici,
+ i blocchi ripetibili d'esempio (cosa-fatto / commit / milestone) e le sezioni Note/nuove-voci.

## Tracciabilità (binding S165) — "termine tecnico + parole povere + provenienza"
Ogni azione/voce della card porta TRE livelli, cosi tutto e' quasi-auditabile:
1. **Termine tecnico** (L1): il nome formale (es. `asset closing-card.template.html`, `Backup V6`).
2. **In parole povere**: spiegazione senza gergo di cosa fa quell'azione.
3. **Cosa ho usato + Problemi risolti** (tracciabilita'):
   - `Cosa ho usato`: skill (es. `skill-creator`), ricerca (subagent/WebSearch), fonte web con **LINK REALE** (mai inventato); se nessuna fonte esterna -> "asset interno, nessuna fonte esterna".
   - `Problemi trovati e risolti`: problema -> soluzione (+ rif LL/commit se c'e').
Applicazione: i **toggle** (Backup/Snapshot/Dashboard) e i **campi D6** hanno la glossa `.qglo`/`.d6glo`
in parole povere; ogni voce **Cosa fatto** e' un `.dit` con `<details>` a 3 sezioni
(In parole povere · Cosa ho usato+link · Problemi trovati e risolti).
**Regola link:** SOLO link verificati/reali (LL-Empire-011 anti-confabulation). Nessuna URL inventata.
