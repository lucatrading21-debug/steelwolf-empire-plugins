# CARD canonica — renderer, shell, stile, comportamento (S192/R1)

Infrastruttura CARD **condivisa**: non appartiene a `start` ne' a `end`. Vive in
`plugins/swe/assets/card/` e serve i tre verbi.

    assets/card/
      card-shell.html          struttura UNICA (header · identity/status · slot · references · action · footer)
      card-core.css            stile UNICO (97 regole)
      card-behavior.js         comportamento UNICO
      card-blocks.html         blocchi canonici opzionali: references · inputs · action
      kinds/<kind>.parts.html  SOLO contenuto del kind: chips · intro · controls · sections
      render-card.mjs          assembla shell + blocchi + kind + modello -> HTML
      verify-card.mjs          gate CARD-04 fail-closed, per tutti e tre i kind

## Perche' una shell e non tre template

Prima di S192 c'erano tre template completi e indipendenti. Le classi comuni **erano gia'
divergenti**, misurato: `.lab` 11px vs 10.5px, `.sec` 10px vs 8px, `.dd` con `margin-top`
perso, `.pill` 14px vs 13.5px, piu' `.pbtn` e `.badge`. Sei conflitti su 97 regole. Non era
una possibilita' teorica: era deriva avvenuta. Condividere il solo CSS non l'avrebbe impedita
— restavano tre DOM capaci di divergere per conto loro.

Risoluzione dei sei conflitti: **vince la variante `opening`**, che e' la resa di riferimento
dell'owner (card S174). La variante accent che `handoff` aveva nel proprio `.badge` e' resa
dalla classe canonica `.badge.b1`, gia' esistente: stessa apparenza, zero regole in conflitto.

## Cosa puo' e cosa non puo' un kind

Un kind fornisce **contenuto**: le chip di intestazione, una riga introduttiva, i controlli e
le sezioni. Non puo' introdurre o ridefinire header, identity/status, riferimenti,
azione/conferma, footer, ne' una sola regola di stile. Le uniche differenze ammesse stanno in
`KIND_SPEC` dentro `render-card.mjs`: etichette e interruttori, non struttura.

## Uso

    node render-card.mjs <model.json> --scope-kind=opening|handoff|closing \
         --scope-project=<slug> [--scope-session=S<n>]        # -> HTML su stdout
    node verify-card.mjs --kind=<k> --project=<slug> --session=S<n> \
         --model=<model.json> --card=<card.html>              # gate, exit != 0 = STOP

Lo scope e' **obbligatorio** (CARD-05, S189): senza, il renderer esce 3. Un modello `{}` non
produce piu' una card. Misurato in S189: `{}` generava 15.544 B di HTML valido con rc=0 e zero
placeholder residui, e il controllo a valle (`niente {{` + `len>200`) lo superava.

## Modello JSON (shape)

```jsonc
{
  "scope": {"kind":"opening","project":"predator","session":"S192"},
  "pc": "PREDATOR" | "ACE",
  "pull": "Da verificare" | "Fatto" | "Da fare",
  "tipo": "A".."K",                          // closing
  "backup"|"snap"|"dash": "Sì" | "No",       // closing
  "scalars": { "SESSION","DATE_TIME","PROJECT_LABEL","PC","TIPO","BRANCH_HEAD","CONTINUITY",
               "PC_PARITY","LAST_COMMIT_HASH","LAST_COMMIT_DATE","LAST_COMMIT_MSG","LL_LIST",
               "ECO_SUMMARY","CK_DONE","CK_TOTAL","PROGRESS_PCT","NEXT_STEP","CROSS_CUTTING","DIRTY",
               "OBIETTIVO","SCOPERTO","BLOCCO","DURATION","FILES_TOUCHED",      // closing
               "NEXT_SESSION","PULL_NEXT","DONE_SUMMARY","WT_CLEAN","CARRYOVER","START_CMD","SNAPSHOT_PATH" },
  "ecosystem": [ {"name","state","badgeClass":"ew|ep|en","dotClass":"dlow|dmed|dhigh","meta","date"} ],
  "checklist": [ {"code","title","count","open","doneAll","items":[{"done","text","new"}]} ],
  "priorities":[ {"workflow","badge","title","fai","tipo","risk","stima","stato","moscow","on",
                  "details":{"plain","piano","prima","dopo","serve","dati","analisi","skill","rischi","dod","consiglio"}} ],
  "done":    [ {"title","plain","used","fixed"} ],   // closing
  "commits": [ {"hash","type","msg"} ]               // closing
}
```

Schema minimo imposto dal gate: `scalars` oggetto, `SESSION` non vuoto, e per `opening` anche
`DATE_TIME` non vuoto.

## Limiti dichiarati

`verify-card.mjs` prova l'**artefatto**: modello valido, scope, rendering deterministico,
ri-render identico, caso negativo respinto. **Non prova** che `show_widget` sia stato chiamato,
ne' che la card sia stata il primo output, ne' che l'owner l'abbia vista e confermata: quelli
restano criteri di acceptance LIVE. Il token `.swe-card-ok.*` e' evidence del PASS, non un
sigillo d'integrita': se dopo il PASS il modello o la card cambiano, il token resta.

Fallback runtime: se il bash della scrivania non raggiunge `${CLAUDE_PLUGIN_ROOT}`, copia
l'INTERA cartella `assets/card/` (con `kinds/`) altrove ed esegui li'.
