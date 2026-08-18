#!/usr/bin/env node
/* SteelWolf Empire - verify-close-card (CARD-04, S189). GATE FAIL-CLOSED di chiusura.
 *
 * PROBLEMA MISURATO (S189): `closing-card-guard.js` e' un promemoria che esce 0 e, nell'ambiente
 * del container cloud, non stampa nulla (si autoesclude come session-start.js, CARD-06B). S188 e'
 * infatti arrivata a CLOSED senza closing card. Un cartello non e' un cancello.
 *
 * COSA VERIFICA, tutto o niente:
 *   1. argomenti di scope presenti: --project, --session, --kind
 *   2. il modello esiste, e' JSON valido e DICHIARA il proprio progetto (scope.project)
 *   3. l'artefatto card esiste
 *   4. il RENDERER accetta quel modello con i flag di scope CARD-05 (se rifiuta, esce 3 e noi con lui)
 *   5. il ri-render coincide BYTE PER BYTE con l'artefatto -> la card viene DAVVERO da quel modello
 *      e da questo renderer, non da un HTML scritto a mano o modificato dopo il rendering
 *   6. non banalita' SEMANTICA: la card contiene la sessione dichiarata. Non si usa la lunghezza:
 *      in S189 e' stato misurato che un modello vuoto produceva 15.544 byte e superava `len>200`.
 *
 * PASS -> scrive un token `.swe-close-ok.<project>.<session>` accanto alla card ed esce 0.
 * FAIL -> exit non-zero con motivo, nessun token. `end`/`cycle` devono FERMARSI qui, prima di
 *         qualsiasi scrittura di chiusura: SESSION_LOG, briefing successivo, stato CLOSED, commit.
 *
 * LIMITE DEL TOKEN (dichiarato, S189): `.swe-close-ok.<project>.<session>` e' EVIDENCE DEL PASS,
 * non un sigillo di integrita'. Se dopo il PASS qualcuno modifica il modello o la card, il token
 * resta li'. Quindi: **token presente != card ancora identica a quella verificata**. Legare un
 * digest a modello + renderer + template + artefatto, e verificare che nulla sia mutato DOPO il
 * PASS, e' provenance temporale: CARD-02/03, non qui.
 *
 * LIMITE DELL'ENFORCEMENT (dichiarato, S189): questo gate e' fail-closed nel suo esito, ma la sua
 * obbligatorieta' e' PROCEDURALE — vive nella prosa di `end`/`cycle` §0-quater. Non e' dimostrato
 * che un'istanza non possa ignorarlo. Enforcement non aggirabile = hook git pre-commit, dopo CARD-02/03.
 * Etichetta corretta: CARD-04 implementazione CLOSED, enforcement PARTIAL.
 *
 * PERIMETRO: il confronto del punto 5 copre gia' parte di cio' che CARD-03 dovra' fare. Non lo
 * chiamo CARD-03: quella dovra' aggiungere il manifest a tre artefatti e una provenance non
 * autoreferenziale. Qui si prova solo che la card corrisponde al modello e allo scope dichiarati.
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
"use strict";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const RENDERER = join(HERE, "..", "..", "start", "assets", "render-card.mjs");

function fail(code, msg) {
  process.stderr.write("CHIUSURA BLOCCATA (CARD-04): " + msg + "\n" +
    "Non scrivere SESSION_LOG, non scrivere il briefing successivo, non dichiarare CLOSED, non committare.\n");
  process.exit(code);
}
const arg = n => { const p = "--" + n + "="; const a = process.argv.slice(2).find(x => x.startsWith(p)); return a ? a.slice(p.length) : null; };

const project = arg("project"), session = arg("session"), kind = arg("kind") || "closing";
const modelPath = arg("model"), cardPath = arg("card");

if (!project) fail(2, "manca --project=<slug>. Una card senza progetto non e' verificabile.");
if (!session) fail(2, "manca --session=<S<n>>.");
if (!["closing", "handoff"].includes(kind)) fail(2, "--kind deve essere `closing` o `handoff`, ricevuto `" + kind + "`.");
if (!modelPath) fail(2, "manca --model=<path del modello JSON di chiusura>.");
if (!cardPath) fail(2, "manca --card=<path dell'HTML reso>.");
if (!existsSync(modelPath)) fail(3, "modello non trovato: " + modelPath);
if (!existsSync(cardPath)) fail(3, "artefatto card non trovato: " + cardPath + " — la card non e' mai stata resa.");
if (!existsSync(RENDERER)) fail(3, "renderer non trovato: " + RENDERER);

let modelTxt, model;
try { modelTxt = readFileSync(modelPath, "utf8"); } catch (e) { fail(3, "modello illeggibile: " + e.message); }
try { model = JSON.parse(modelTxt); } catch (e) { fail(3, "modello non e' JSON valido: " + e.message); }

/* Il modello di CHIUSURA deve dichiarare il proprio progetto. Non e' un requisito retroattivo:
 * i modelli closing/handoff nascono nuovi ad ogni chiusura. Serve perche' il ri-render da solo NON
 * distingue il progetto: il progetto non compare nell'HTML, quindi un modello che non si dichiara
 * produce lo stesso output sotto qualsiasi --scope-project (misurato in S189). */
const declaredProject = (model && ((model.scope && model.scope.project) || model.project)) || null;
if (!declaredProject)
  fail(4, "il modello di chiusura non dichiara il proprio progetto.\n" +
          "  Aggiungi `\"scope\": {\"kind\": \"" + kind + "\", \"project\": \"" + project + "\", \"session\": \"" + session + "\"}` al modello.\n" +
          "  Senza, la card non e' attribuibile a un progetto e il confronto col ri-render non lo rileva.");
if (String(declaredProject).toLowerCase() !== String(project).toLowerCase())
  fail(4, "il modello dichiara il progetto `" + declaredProject + "` ma stai chiudendo `" + project + "`.");

const sc = model && model.scalars ? model.scalars : {};
if (String(sc.SESSION || "").trim().toLowerCase() !== String(session).trim().toLowerCase())
  fail(4, "il modello e' della sessione `" + (sc.SESSION || "(vuota)") + "` ma stai chiudendo `" + session + "`.");

/* 4+5: il renderer deve ACCETTARE lo scope e riprodurre esattamente l'artefatto. */
let fresh;
try {
  fresh = execFileSync(process.execPath,
    [RENDERER, modelPath, "--scope-kind=" + kind, "--scope-project=" + project, "--scope-session=" + session],
    { encoding: "utf8", timeout: 15000, maxBuffer: 16 * 1024 * 1024 });
} catch (e) {
  const why = e && e.stderr ? String(e.stderr).trim() : (e && e.message) || String(e);
  fail(5, "il renderer RIFIUTA questo modello con lo scope dichiarato:\n  " + why);
}
let card;
try { card = readFileSync(cardPath, "utf8"); } catch (e) { fail(3, "card illeggibile: " + e.message); }
if (card !== fresh) {
  fail(6, "la card su disco NON coincide col ri-render del modello (" + card.length + " B vs " + fresh.length + " B).\n" +
          "  Si modifica il MODELLO e si rirende: mai l'HTML gia' reso.");
}
if (card.indexOf(String(sc.SESSION)) === -1)
  fail(7, "la card non contiene nemmeno la sessione `" + sc.SESSION + "`: e' vuota o non pertinente.");

const token = join(dirname(cardPath), ".swe-close-ok." + project + "." + session);
try { writeFileSync(token, new Date().toISOString() + "\n" + kind + "\n" + cardPath + "\n", "utf8"); }
catch (e) { fail(8, "impossibile scrivere il token di PASS: " + e.message); }

process.stdout.write("VERIFY-CLOSE-CARD: PASS\n" +
  "  project: " + project + "\n  session: " + session + "\n  kind:    " + kind + "\n" +
  "  card:    " + cardPath + " (" + card.length + " B, identica al ri-render)\n" +
  "  token:   " + token + "\n" +
  "Ora `end`/`cycle` possono procedere alle scritture di chiusura.\n");
