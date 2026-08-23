#!/usr/bin/env node
/* SteelWolf Empire — VERIFY-CARD (CARD-04 generalizzato, S192/R3). GATE FAIL-CLOSED.
 *
 * Una sola implementazione per opening | handoff | closing. Prima di S192 il gate esisteva
 * solo per la chiusura (`verify-close-card.mjs`, --kind closing|handoff): l'apertura non
 * aveva alcun verificatore, ed e' una delle ragioni per cui una card d'apertura poteva
 * mancare o divergere senza che nulla lo rilevasse.
 *
 * COSA PROVA, tutto o niente:
 *   1. argomenti di scope presenti: --project, --session, --kind
 *   2. il modello esiste, e' JSON valido e dichiara il proprio progetto
 *   3. l'artefatto card esiste
 *   4. il RENDERER accetta quel modello con i flag di scope CARD-05 (se rifiuta, falliamo con lui)
 *   5. il ri-render coincide BYTE PER BYTE con l'artefatto -> la card viene DAVVERO da quel
 *      modello e da questo renderer, non da un HTML scritto a mano o ritoccato dopo il render
 *   6. non banalita' SEMANTICA: la card contiene la sessione dichiarata. Non si usa la
 *      lunghezza: in S189 un modello vuoto produceva 15.544 B e superava `len>200`.
 *
 * COSA NON PROVA — dichiarato, non implicito (correzione owner S192):
 *   - NON prova che `show_widget` sia stato chiamato;
 *   - NON prova che la card sia stata il primo output visibile;
 *   - NON prova che nessun recap testuale l'abbia preceduta;
 *   - NON prova che l'owner l'abbia vista e confermata.
 *   Questo e' artifact enforcement. La consegna resta un criterio di acceptance LIVE, e nessun
 *   PASS di questo script va presentato come prova di consegna.
 *
 * LIMITE DEL TOKEN (dichiarato, S189, invariato): `.swe-card-ok.<kind>.<project>.<session>` e'
 * EVIDENCE DEL PASS, non un sigillo d'integrita'. Se dopo il PASS qualcuno modifica il modello o
 * la card, il token resta li'. Token presente != card ancora identica a quella verificata.
 * Legare un digest a modello+renderer+shell+artefatto e' provenance temporale: CARD-02/03.
 *
 * LIMITE DELL'ENFORCEMENT (dichiarato, invariato): il gate e' fail-closed nel suo esito, ma la
 * sua obbligatorieta' e' PROCEDURALE — vive nella prosa dei command. Non e' dimostrato che
 * un'istanza non possa ignorarlo. Enforcement non aggirabile = hook git pre-commit, dopo CARD-02/03.
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
"use strict";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const RENDERER = join(HERE, "render-card.mjs");
const KINDS = ["opening", "handoff", "closing"];

const STOP = {
  opening: "Non mostrare la card, non scrivere il briefing, non proseguire l'apertura.",
  handoff: "Non mostrare la card di handoff, non scrivere lo snapshot della prossima sessione.",
  closing: "Non scrivere SESSION_LOG, non scrivere il briefing successivo, non dichiarare CLOSED, non committare."
};

function fail(code, msg, kind) {
  process.stderr.write("CARD BLOCCATA (CARD-04): " + msg + "\n" + (STOP[kind] || STOP.closing) + "\n");
  process.exit(code);
}
const arg = n => { const p = "--" + n + "="; const a = process.argv.slice(2).find(x => x.startsWith(p)); return a ? a.slice(p.length) : null; };
const flag = n => process.argv.slice(2).includes("--" + n);

const project = arg("project"), session = arg("session"), kind = arg("kind");
const modelPath = arg("model"), cardPath = arg("card");
const allowLegacy = flag("allow-legacy-model");

if (!kind) fail(2, "manca --kind=opening|handoff|closing. Nessun default: un kind implicito e' il modo in cui una card finisce nel posto sbagliato.", "closing");
if (!KINDS.includes(kind)) fail(2, "--kind sconosciuto: `" + kind + "`. Ammessi: " + KINDS.join(", ") + ".", "closing");
if (!project) fail(2, "manca --project=<slug>. Una card senza progetto non e' verificabile.", kind);
if (!session) fail(2, "manca --session=<S<n>>.", kind);
if (!modelPath) fail(2, "manca --model=<path del modello JSON>.", kind);
if (!cardPath) fail(2, "manca --card=<path dell'HTML reso>.", kind);
if (!existsSync(modelPath)) fail(3, "modello non trovato: " + modelPath, kind);
if (!existsSync(cardPath)) fail(3, "artefatto card non trovato: " + cardPath + " — la card non e' mai stata resa.", kind);
if (!existsSync(RENDERER)) fail(3, "renderer non trovato: " + RENDERER, kind);

let modelTxt, model;
try { modelTxt = readFileSync(modelPath, "utf8"); } catch (e) { fail(3, "modello illeggibile: " + e.message, kind); }
try { model = JSON.parse(modelTxt); } catch (e) { fail(3, "modello non e' JSON valido: " + e.message, kind); }

/* Il modello deve dichiarare il proprio progetto: il ri-render da solo NON lo distingue, perche'
 * il progetto non compare nell'HTML — un modello che non si dichiara produce lo stesso output
 * sotto qualsiasi --scope-project (misurato S189).
 * Deroga per i modelli `opening` STORICI, nati prima di CARD-05 e quindi senza `scope`: va chiesta
 * esplicitamente con --allow-legacy-model e viene STAMPATA nel PASS. Mai silenziosa. */
let legacyNote = "";
const declaredProject = (model && ((model.scope && model.scope.project) || model.project)) || null;
if (!declaredProject) {
  if (kind === "opening" && allowLegacy) {
    legacyNote = "  DEROGA:  modello legacy senza `scope.project` (--allow-legacy-model).\n" +
                 "           L'attribuzione al progetto NON e' provata dal ri-render: vale solo la parola di chi invoca.\n";
  } else {
    fail(4, "il modello non dichiara il proprio progetto.\n" +
            "  Aggiungi `\"scope\": {\"kind\": \"" + kind + "\", \"project\": \"" + project + "\", \"session\": \"" + session + "\"}`.\n" +
            "  Senza, la card non e' attribuibile a un progetto e il confronto col ri-render non lo rileva." +
            (kind === "opening" ? "\n  Per un briefing storico anteriore a CARD-05: --allow-legacy-model (la deroga viene stampata)." : ""), kind);
  }
} else if (String(declaredProject).toLowerCase() !== String(project).toLowerCase()) {
  fail(4, "il modello dichiara il progetto `" + declaredProject + "` ma stai verificando `" + project + "`.", kind);
}

const sc = model && model.scalars ? model.scalars : {};
if (String(sc.SESSION || "").trim().toLowerCase() !== String(session).trim().toLowerCase())
  fail(4, "il modello e' della sessione `" + (sc.SESSION || "(vuota)") + "` ma stai verificando `" + session + "`.", kind);

/* 4+5: il renderer deve ACCETTARE lo scope e riprodurre esattamente l'artefatto. */
let fresh;
try {
  fresh = execFileSync(process.execPath,
    [RENDERER, modelPath, "--scope-kind=" + kind, "--scope-project=" + project, "--scope-session=" + session],
    { encoding: "utf8", timeout: 15000, maxBuffer: 16 * 1024 * 1024 });
} catch (e) {
  const why = e && e.stderr ? String(e.stderr).trim() : (e && e.message) || String(e);
  fail(5, "il renderer RIFIUTA questo modello con lo scope dichiarato:\n  " + why, kind);
}
let card;
try { card = readFileSync(cardPath, "utf8"); } catch (e) { fail(3, "card illeggibile: " + e.message, kind); }
if (card !== fresh)
  fail(6, "la card su disco NON coincide col ri-render del modello (" + card.length + " B vs " + fresh.length + " B).\n" +
          "  Si modifica il MODELLO e si rirende: mai l'HTML gia' reso.", kind);
if (card.indexOf(String(sc.SESSION)) === -1)
  fail(7, "la card non contiene nemmeno la sessione `" + sc.SESSION + "`: e' vuota o non pertinente.", kind);

const token = join(dirname(cardPath), ".swe-card-ok." + kind + "." + project + "." + session);
try { writeFileSync(token, new Date().toISOString() + "\n" + kind + "\n" + cardPath + "\n", "utf8"); }
catch (e) { fail(8, "impossibile scrivere il token di PASS: " + e.message, kind); }

process.stdout.write("VERIFY-CARD: PASS (artefatto)\n" +
  "  project: " + project + "\n  session: " + session + "\n  kind:    " + kind + "\n" +
  "  card:    " + cardPath + " (" + card.length + " B, identica al ri-render)\n" +
  "  token:   " + token + "\n" + legacyNote +
  "  NOTA:    questo PASS riguarda l'ARTEFATTO. Non prova show_widget, ne' l'ordine dell'output,\n" +
  "           ne' la conferma dell'owner: quelli restano criteri di acceptance LIVE.\n");
