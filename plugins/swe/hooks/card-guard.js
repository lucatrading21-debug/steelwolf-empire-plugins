#!/usr/bin/env node
/* SteelWolf Empire - CARD GUARD (UserPromptExpansion). S192/R2: copre START, CYCLE ed END.
 *
 * Prima di S192 esisteva solo per /swe:end e /swe:cycle (`closing-card-guard.js`): l'apertura
 * non aveva alcun guardiano, ed e' una delle ragioni per cui una card d'apertura poteva
 * arrivare dopo il briefing, o non arrivare affatto.
 *
 * COSA E' E COSA NON E'. `UserPromptExpansion` puo' aggiungere contesto; `SessionStart` e'
 * context-only e non puo' bloccare (doc Anthropic). Nessun hook puo' innescare una tool call:
 * non esiste un hook che "mostri la card". Quindi questo file e' un RINFORZO, non la garanzia.
 * La garanzia vive nel corpo dei comandi (blocco SWE CARD CONTRACT) e nel gate fail-closed
 * `verify-card.mjs`. Nel container Cowork cloud questo hook si autoesclude comunque (CARD-06B):
 * un contratto che dipendesse da lui non sarebbe un contratto.
 *
 * NON legge stdin (Cowork-safe, LL-060/S159): il runtime filtra col matcher, qui si inietta l'ordine.
 * Fail-open: qualsiasi errore -> exit 0, mai bloccare. Copyright (c) 2026 Luke SteelWolf. */
"use strict";
try {
  if (!require("./_swe-domain.js")()) process.exit(0);
  console.log(`=== SteelWolf Empire — CARD OBBLIGATORIA E PRIMA DI TUTTO (S192/R2) ===
Stai per eseguire /swe:start, /swe:cycle oppure /swe:end.

ORDINE NON NEGOZIABILE:
  letture/misure necessarie → costruzione del modello → render → verify → show_widget
  → CONFERMA DELL'OWNER → e solo allora write / briefing / bookkeeping / recap / prosecuzione.

STEP 0 — prima di QUALSIASI output visibile e di QUALSIASI scrittura:
  1. Costruisci il modello JSON con lo SCOPE dentro:
     "scope": {"kind":"opening|handoff|closing","project":"<slug>","session":"S<n>"}
  2. Rendi CON I FLAG DI SCOPE (obbligatori da CARD-05, senza escono con 3):
     node \${CLAUDE_PLUGIN_ROOT}/assets/card/render-card.mjs <model.json> \\
          --scope-kind=<k> --scope-project=<slug> --scope-session=S<n> > <card.html>
  3. GATE CARD-04, fail-closed — esegui e incolla l'esito:
     node \${CLAUDE_PLUGIN_ROOT}/assets/card/verify-card.mjs \\
          --kind=<k> --project=<slug> --session=S<n> --model=<model.json> --card=<card.html>
     exit != 0  ->  STOP: nessuna card, nessuna scrittura. Si corregge il MODELLO e si rirende,
     mai l'HTML gia' reso.
  4. show_widget con quell'HTML, invariato. E' il PRIMO output visibile in Cowork.
  5. ATTENDI la conferma dell'owner. Solo dopo: briefing, recap, scritture, prosecuzione.

Sono consentite PRIMA della card solo le letture e le misure che servono a costruirla
(git, SESSION_LOG, roadmap, index): senza, non ci sarebbe nulla da mostrare. Sono VIETATI
prima della card e della conferma ogni testo visibile e ogni write, bookkeeping incluso.

Il gate CARD-04 riguarda l'ARTEFATTO: non prova show_widget, ne' l'ordine, ne' la conferma.
Quelli restano criteri LIVE, verificati da chi guarda.

Su Code CLI/Chat puri (no show_widget): nessuna card visuale, solo output testuale etichettato
SWE TEXT FALLBACK derivato dagli stessi dati del modello.`);
  process.exit(0);
} catch (e) { process.exit(0); }
