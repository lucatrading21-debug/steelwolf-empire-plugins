# handoff-card.README — SUPERATO (S192/R1)

Questo documento descriveva un'architettura che non esiste piu': tre template completi e
indipendenti, ciascuno col proprio CSS, da clonare e riempire a mano. Quella struttura aveva
gia' prodotto deriva — sei regole CSS comuni divergenti, misurate in S192 — ed e' stata
sostituita da una card sola.

**Documentazione canonica, unica:**

    plugins/swe/assets/card/render-card.README.md

Li' trovi: architettura (shell · stile · comportamento · fragment per kind), shape del modello
JSON, uso di `render-card.mjs` e del gate `verify-card.mjs`, e i limiti dichiarati.

Nessuna descrizione tecnica e' ripetuta qui: due documenti che spiegano la stessa cosa sono il
modo in cui uno dei due diventa falso senza che nessuno se ne accorga.
