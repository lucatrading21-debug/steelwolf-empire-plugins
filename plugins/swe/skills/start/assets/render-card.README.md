# Renderer deterministico — opening card (Fase 1, S166)

Scopo: rendere la card d'apertura **sempre identica** su ogni progetto/PC, senza che l'istanza
la ridisegni a mano (fonte del delirio: card vuota/improvvisata/BA diversa). Pattern collaudato
(ricerca UI-da-LLM): **ragionamento separato dal rendering** — l'istanza produce un **modello JSON**,
lo `render-card.mjs` riempie il template **INVARIATO** con le **stesse classi/CSS**. La visual view
NON cambia: è lo stesso `opening-card.template.html`.

## Uso
```
node render-card.mjs <model.json>   # oppure modello su stdin
# -> HTML completo su stdout -> passare a show_widget
```

## Modello JSON (shape)
```jsonc
{
  "pc": "PREDATOR" | "ACE",                 // accende la pill PC
  "pull": "Da verificare" | "Fatto" | "Da fare",  // accende la pill Pull
  "scalars": {                              // {{PLACEHOLDER}} scalari del template
    "PROJECT_LABEL","PC","TIPO","SESSION","DATE_TIME","BRANCH_HEAD","CONTINUITY","PC_PARITY",
    "LAST_COMMIT_HASH","LAST_COMMIT_DATE","LAST_COMMIT_MSG","LL_LIST","ECO_SUMMARY",
    "CK_DONE","CK_TOTAL","PROGRESS_PCT","NEXT_STEP","CROSS_CUTTING","DIRTY"
  },
  "ecosystem": [                            // hub-only; ometti/[] per singolo progetto
    {"name","state","badgeClass":"|ew|ep|en","dotClass":"dlow|dmed|dhigh","meta","date"}
  ],
  "checklist": [                            // drill-down per milestone
    {"code":"NOW","title","count":"3/7","open":true,"doneAll":false,
     "items":[{"done":true,"text","new":false}, {"done":false,"text"}]}
  ],
  "priorities": [                           // L1 + L2 (10 campi)
    {"workflow":"Workflow N — …","badge":"P1","title","fai","tipo","risk":"low|med|high",
     "stima","stato","moscow","on":true,
     "details":{"plain","piano":[…],"prima","dopo","serve","dati","analisi","skill","rischi","dod","consiglio"}}
  ]
}
```
Note fedeltà: i campi testo possono contenere markup inline voluto (es. `<code>…</code>`) → resi grezzi;
`name`/`state`/`title` sono escapati. I commenti-guida `<!-- … -->` del template vengono rimossi in output.

## Flusso all'apertura (SKILL start §5-bis.3)
1. L'istanza raccoglie lo stato (git, SESSION_LOG, roadmap, indice) → costruisce il **modello JSON**.
2. Esegue `render-card.mjs` → HTML.
3. `show_widget(HTML)`. **La card è identica ogni volta** (zero improvvisazione strutturale).
Le priorità ragionate restano input dell'istanza (nel modello), ma incastrate in markup fisso.

## Runtime access (da verificare in collaudo)
Il renderer legge il template accanto a sé (`join(HERE, "opening-card.template.html")`). Se il bash
della scrivania non raggiunge `${CLAUDE_PLUGIN_ROOT}`, l'istanza copia `render-card.mjs`+template in
`outputs/` ed esegue lì (fallback). Fase 2: renderer gemelli per closing/handoff + BA delega a swe.
