#!/usr/bin/env node
/* SteelWolf Empire - renderer DETERMINISTICO card (Fase 1 S166 · esteso S167 Passo 6).
 * Legge un template (opening|closing|handoff) + un modello JSON e produce l'HTML IDENTICO.
 * Pattern (ricerca UI-da-LLM): ragionamento (modello JSON) separato dal rendering (template+classi fisse).
 * NON cambia le visual view: riusa scheletro, CSS e classi esistenti dei template (CARD FREEZE S166).
 * kind: model.kind = "opening" (default, retrocompatibile) | "closing" | "handoff".
 * Uso:  node render-card.mjs <model.json>   (oppure modello su stdin)  -> HTML su stdout.
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
"use strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const TPL = join(HERE, "opening-card.template.html");
const TPL_CLOSING = join(HERE, "..", "..", "end", "assets", "closing-card.template.html");
const TPL_HANDOFF = join(HERE, "..", "..", "cycle", "assets", "handoff-card.template.html");

function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function raw(s){ return String(s==null?"":s); }

function ecosystemBlock(m){
  if(!m.ecosystem || !m.ecosystem.length) return "";
  const rows = m.ecosystem.map(e=>{
    const badgeCls = "ebadge" + (e.badgeClass?(" "+e.badgeClass):"");
    const dot = e.dotClass ? `<span class="dot ${e.dotClass}"></span>` : "";
    return `<div class="er"><span class="ename">${esc(e.name)}</span>`+
      `<span class="${badgeCls}">${dot}${esc(e.state)}</span>`+
      `<span class="emeta">${esc(e.meta||"")}</span>`+
      `<span class="edate"><i class="ti ti-clock"></i> ${esc(e.date||"")}</span></div>`;
  }).join("\n      ");
  return `<details class="cklist"><summary><i class="ti ti-hierarchy-2"></i> Ecosistema SteelWolf — ${esc(m.ECO_SUMMARY||"")}</summary>\n`+
    `    <div class="eco">\n      ${rows}\n    </div>\n  </details>`;
}

function ckItem(it){
  const cls = it.done ? ("ck done"+(it.new?" new":"")) : "ck todo";
  const ic = it.done ? "ti-square-check" : "ti-square";
  return `<div class="${cls}"><i class="ti ${ic}"></i> ${raw(it.text)}</div>`;
}
function milestones(m){
  if(!m.checklist || !m.checklist.length) return "";
  return m.checklist.map(ms=>{
    const badge = ms.doneAll ? `<span class="msdone">${esc(ms.code)}</span>` : `<span class="mstodo">${esc(ms.code)}</span>`;
    const open = ms.open ? " open" : "";
    const items = (ms.items||[]).map(ckItem).join("\n        ");
    return `<details class="ms"${open}><summary>${badge} ${esc(ms.title)} <span class="mscount">${esc(ms.count||"")}</span></summary>\n        ${items}\n      </details>`;
  }).join("\n      ");
}

function prioDetails(d){
  if(!d) return "";
  const sec=(lab,glo,body)=>`\n        <div class="sec"><span class="lab">${esc(lab)}${glo?` <span class="glo">${esc(glo)}</span>`:""}</span>${body}</div>`;
  let out="";
  if(d.plain) out+=sec("In parole semplici","",`<div class="dd plain">${raw(d.plain)}</div>`);
  if(d.piano) out+=sec("Piano","· cosa si fa passo per passo",`<ul>${(Array.isArray(d.piano)?d.piano:[d.piano]).map(x=>`<li>${raw(x)}</li>`).join("")}</ul>`);
  if(d.prima||d.dopo) out+=sec("Prima → Dopo","· com'è ora vs come sarà",`<div class="ba"><span class="bef"><b>Prima:</b> ${raw(d.prima||"")}</span><i class="ti ti-arrow-right"></i><span class="aft"><b>Dopo:</b> ${raw(d.dopo||"")}</span></div>`);
  if(d.serve) out+=sec("Serve / Dipende da","· cosa serve prima",`<div class="dd">${raw(d.serve)}</div>`);
  if(d.dati) out+=sec("Dati richiesti","· cosa chiederti/cercare",`<div class="dd">${raw(d.dati)}</div>`);
  if(d.analisi) out+=sec("Analisi & consultazione","· ricerche e verifica",`<div class="dd">${raw(d.analisi)}</div>`);
  if(d.skill) out+=sec("Skill da usare","· skill/plugin da attivare",`<div class="dd">${raw(d.skill)}</div>`);
  if(d.rischi) out+=sec("Rischi & mitigazione","· cosa può andare storto",`<div class="dd">${raw(d.rischi)}</div>`);
  if(d.dod) out+=sec("Come sarà completato","· quando è finito (DoD)",`<div class="dd">${raw(d.dod)}</div>`);
  if(d.consiglio) out+=sec("Consiglio","· il mio suggerimento",`<div class="dd">${raw(d.consiglio)}</div>`);
  return out;
}
function prioMeta(p){
  const dotFor = r => r==="high"?"dhigh":(r==="med"?"dmed":"dlow");
  const riskLbl = r => r==="high"?"alto":(r==="med"?"medio":"basso");
  return `<span class="meta">`+
    `<span class="chip tipo"><i class="ti ti-tag"></i> Tipo: ${esc(p.tipo||"")}</span>`+
    `<span class="chip"><span class="dot ${dotFor(p.risk)}"></span>${riskLbl(p.risk)}</span>`+
    (p.stima?`<span class="chip"><i class="ti ti-clock"></i> ${esc(p.stima)}</span>`:"")+
    `<span class="chip"><i class="ti ti-square"></i> ${esc(p.stato||"Da fare")}</span>`+
    (p.moscow?`<span class="chip">${esc(p.moscow)}</span>`:"")+`</span>`;
}
function priorities(m){
  if(!m.priorities || !m.priorities.length) return "";
  let out=""; let lastWf=null;
  for(const p of m.priorities){
    if(p.workflow && p.workflow!==lastWf){ out+=`\n    <div class="wfh"><i class="ti ti-topology-ring"></i> ${esc(p.workflow)}</div>`; lastWf=p.workflow; }
    const on = p.on?" on":"";
    const badgeCls = "badge"+(p.on?" b1":"");
    out+=`\n    <div class="prio${on}">\n`+
      `      <button class="pbtn" data-v="${esc(p.badge+" "+p.title)}" type="button">\n`+
      `        <span class="${badgeCls}">${esc(p.badge)}</span>\n`+
      `        <span class="ptext"><span class="ptitle">${esc(p.title)}</span><span class="pfai">Fai: ${raw(p.fai||"")}</span>\n`+
      `          ${prioMeta(p)}</span>\n`+
      `        <i class="ti ti-check chk2"></i>\n`+
      `      </button>\n`+
      `      <details><summary>Dettagli</summary>${prioDetails(p.details)}\n`+
      `      </details>\n`+
      `    </div>`;
  }
  return out;
}

/* --- blocchi CLOSING --- */
function doneItems(list){
  if(!Array.isArray(list) || !list.length) return "";
  return list.map(it=>{
    return `<div class="dit">\n`+
      `        <div class="ditbtn"><i class="ti ti-square-check"></i> <span class="dtitle">${raw(it.title)}</span></div>\n`+
      `        <details><summary>Dettagli · parole povere + tracciabilità</summary>\n`+
      `          <div class="sec"><span class="lab">In parole povere</span><div class="dd">${raw(it.plain||"")}</div></div>\n`+
      `          <div class="sec"><span class="lab">Cosa ho usato <span class="glo">· skill / ricerca / fonte web + LINK reale</span></span><div class="dd">${raw(it.used||"asset interno, nessuna fonte esterna")}</div></div>\n`+
      `          <div class="sec"><span class="lab">Problemi trovati e risolti</span><div class="dd">${raw(it.fixed||"—")}</div></div>\n`+
      `        </details>\n`+
      `      </div>`;
  }).join("\n      ");
}
function commitsBlock(list){
  if(!Array.isArray(list) || !list.length) return "";
  return list.map(c=>`<div class="commit"><span class="hcode">${esc(c.hash||"—")}</span> <span class="ctype">${esc(c.type||"")}</span> <span>${raw(c.msg||"")}</span></div>`).join("\n      ");
}

/* --- priorità HANDOFF (read-only: div.pbtn, no data-v/chk2/wfh) --- */
function prioritiesHandoff(m){
  if(!m.priorities || !m.priorities.length) return "";
  return m.priorities.map(p=>{
    return `<div class="prio">\n`+
      `      <div class="pbtn">\n`+
      `        <span class="badge">${esc(p.badge)}</span>\n`+
      `        <span class="ptext"><span class="ptitle">${esc(p.title)}</span><span class="pfai">Fai: ${raw(p.fai||"")}</span>\n`+
      `          ${prioMeta(p)}</span>\n`+
      `      </div>\n`+
      `      <details><summary>Dettagli · piano, skill, ricerche</summary>${prioDetails(p.details)}\n`+
      `      </details>\n`+
      `    </div>`;
  }).join("\n    ");
}

function render(model){
  const kind = model.kind || "opening";
  const tplPath = kind==="closing" ? TPL_CLOSING : (kind==="handoff" ? TPL_HANDOFF : TPL);
  let t = readFileSync(tplPath,"utf8");
  t = t.replace(/<!--[\s\S]*?-->/g,"");
  const sc = Object.assign({}, model.scalars||{});
  sc.PC_PREDATOR_SEL = model.pc==="PREDATOR"?"sel":"";
  sc.PC_ACE_SEL      = model.pc==="ACE"?"sel":"";
  sc.PULL_VER_SEL    = model.pull==="Da verificare"?"sel":"";
  sc.PULL_OK_SEL     = model.pull==="Fatto"?"sel":"";
  sc.PULL_TODO_SEL   = model.pull==="Da fare"?"sel":"";
  ["A","B","C","D","E","K"].forEach(x=> sc["TIPO_"+x+"_SEL"] = model.tipo===x ? "sel" : "");
  sc.BACKUP_YES_SEL = model.backup==="Sì"?"sel":""; sc.BACKUP_NO_SEL = model.backup==="Sì"?"":"sel";
  sc.SNAP_YES_SEL   = model.snap==="Sì"?"sel":"";   sc.SNAP_NO_SEL   = model.snap==="Sì"?"":"sel";
  sc.DASH_YES_SEL   = model.dash==="Sì"?"sel":"";   sc.DASH_NO_SEL   = model.dash==="Sì"?"":"sel";
  sc.ECOSYSTEM_BLOCK = ecosystemBlock(model);
  sc.CHECKLIST_MILESTONES = milestones(model);
  if(kind==="handoff") sc.NEXT_PRIORITIES = prioritiesHandoff(model);
  else sc.PRIORITIES = priorities(model);
  if(Array.isArray(model.done)) sc.DONE_ITEMS = doneItems(model.done);
  if(Array.isArray(model.commits)) sc.COMMITS = commitsBlock(model.commits);
  if(model.sessionLogPreview!=null) sc.SESSION_LOG_PREVIEW = esc(model.sessionLogPreview);
  t = t.replace(/\{\{([A-Z_0-9]+)\}\}/g,(mt,k)=> (k in sc)? String(sc[k]) : "");
  return t;
}

/* ─────────── CARD-05 (S189): gate di SCOPE e SCHEMA, fail-closed ───────────
 * Misura OLD, S189: `{}` produceva 15.544 byte di HTML valido con rc=0 e ZERO placeholder
 * residui, perche' l'ultima replace() sostituisce ogni {{CHIAVE}} ignota con stringa vuota.
 * Il controllo a valle in session-start.js (`niente {{` + `len>200`) lo superava perfettamente:
 * un guardiano tarato su un sintomo che non si verifica mai. Un `kind` sconosciuto ripiegava
 * in silenzio sul template opening.
 *
 * Da qui il renderer RIFIUTA (exit 3) quando:
 *   - lo SCOPE non e' dichiarato: serve `kind` + `project`, via --scope-* o via model.scope;
 *   - scope dichiarato due volte e in disaccordo (CLI vs modello);
 *   - `kind` non e' fra opening|closing|handoff (nessun fallback silenzioso);
 *   - manca lo schema minimo: `scalars` oggetto, `scalars.SESSION` non vuoto,
 *     e per `opening` anche `scalars.DATE_TIME` non vuoto (timestamp binding §5-bis.2).
 * Lo scope NON deve stare per forza nel briefing: chi invoca (session-start.js) lo conosce dal
 * resolver e lo passa. Cosi' non si rende obbligatorio un campo retroattivo nei briefing esistenti. */
const KINDS = ["opening","closing","handoff"];
function die(msg){ process.stderr.write("SCOPE/SCHEMA RIFIUTATO (CARD-05): "+msg+"\n"); process.exit(3); }

function cliScope(argv){
  const o = {};
  for (const a of argv){
    let m;
    if ((m = a.match(/^--scope-kind=(.*)$/)))    o.kind = m[1];
    else if ((m = a.match(/^--scope-project=(.*)$/))) o.project = m[1];
    else if ((m = a.match(/^--scope-session=(.*)$/))) o.session = m[1];
  }
  return o;
}
function assertScope(model, argv){
  const cli = cliScope(argv);
  const mod = (model && typeof model.scope === "object" && model.scope) ? model.scope : {};
  const pick = (k) => {
    const a = cli[k], b = mod[k];
    if (a && b && String(a).toLowerCase() !== String(b).toLowerCase()) {
      die("scope in disaccordo su `"+k+"`: CLI dice `"+a+"`, il modello dice `"+b+"`. Non indovino quale valga.");
    }
    return a || b || null;
  };
  const kind = pick("kind") || (model && model.kind) || null;
  const project = pick("project");
  const session = pick("session");

  if (!kind)    die("`kind` non dichiarato. Passa --scope-kind=opening|closing|handoff (o model.scope.kind).");
  if (!KINDS.includes(String(kind))) die("`kind` sconosciuto: `"+kind+"`. Ammessi: "+KINDS.join(", ")+". Nessun fallback silenzioso.");
  if (!project) die("`project` non dichiarato. Una card senza progetto e' un falso verde in attesa: passa --scope-project=<slug> (o model.scope.project).");

  const sc = (model && typeof model.scalars === "object" && model.scalars) ? model.scalars : null;
  if (!sc) die("schema minimo assente: il modello non ha un oggetto `scalars`.");
  if (!String(sc.SESSION || "").trim()) die("schema minimo: `scalars.SESSION` mancante o vuoto.");
  if (kind === "opening" && !String(sc.DATE_TIME || "").trim())
    die("schema minimo: `scalars.DATE_TIME` mancante o vuoto (timestamp obbligatorio, SKILL start §5-bis.2).");

  if (session && String(sc.SESSION).trim().toLowerCase() !== String(session).trim().toLowerCase())
    die("il modello e' della sessione `"+sc.SESSION+"` ma lo scope chiede `"+session+"`.");

  const declaredProj = mod.project || model.project;
  if (declaredProj && String(declaredProj).toLowerCase() !== String(project).toLowerCase())
    die("il modello dichiara il progetto `"+declaredProj+"` ma lo scope e' `"+project+"`.");

  return { kind: String(kind), project: String(project) };
}

let input="";
try {
  const arg = process.argv.slice(2).find(a => !a.startsWith("--"));
  input = arg ? readFileSync(arg,"utf8") : readFileSync(0,"utf8");
} catch(e){ process.stderr.write("modello mancante: "+e.message+"\n"); process.exit(1); }
let model; try { model = JSON.parse(input); } catch(e){ process.stderr.write("JSON modello non valido: "+e.message+"\n"); process.exit(1); }
const scope = assertScope(model, process.argv.slice(2));
model.kind = scope.kind;   /* lo scope validato vince sul campo del modello */
process.stdout.write(render(model));
