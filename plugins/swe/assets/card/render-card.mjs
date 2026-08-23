#!/usr/bin/env node
/* SteelWolf Empire — RENDERER CARD CANONICO (infrastruttura CARD condivisa).
 *
 * S192 / R1: una sola card. La struttura visuale (shell), lo stile (card-core.css) e il
 * comportamento (card-behavior.js) sono CANONICI e di proprieta' del renderer. I kind
 * opening | handoff | closing forniscono SOLO contenuto: chip di intestazione, riga
 * introduttiva, controlli e sezioni. Non possono ridefinire header, identity/status,
 * riferimenti, azione/conferma, footer, ne' alcuna regola di stile.
 *
 * Prima di S192 esistevano tre template completi e indipendenti: le classi comuni erano
 * gia' divergenti (.lab 11px vs 10.5px, .sec 10px vs 8px, .dd margin-top perso, .pill
 * 14px vs 13.5px). Non era una possibilita' teorica: era deriva gia' avvenuta. Ora quei
 * punti di divergenza non esistono piu' perche' non esistono piu' tre posti dove scriverli.
 *
 * Uso:  node render-card.mjs <model.json> --scope-kind=<k> --scope-project=<slug> [--scope-session=S<n>]
 *       (oppure modello su stdin)  ->  HTML completo su stdout.
 *
 * CARD-05 (S189) invariato: lo scope e' obbligatorio, il renderer rifiuta con exit 3.
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
"use strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SHELL  = join(HERE, "card-shell.html");
const BLOCKS = join(HERE, "card-blocks.html");
const CORE   = join(HERE, "card-core.css");
const BEHAV  = join(HERE, "card-behavior.js");
const kindParts = k => join(HERE, "kinds", k + ".parts.html");

/* ─────────── specifica canonica dei kind ───────────
 * Questa tabella e' l'UNICO posto dove un kind differisce nella shell. Sono etichette e
 * interruttori, non struttura: nessun kind puo' introdurre un contenitore, un margine o
 * un blocco che gli altri non hanno. */
const KIND_SPEC = {
  opening: {
    subtitle: "Apertura sessione · {{PROJECT_LABEL}} · {{PC}} · Tipo {{TIPO}}",
    sessionValue: "{{SESSION}}", sessionTag: "sessione",
    references: true, inputs: true, action: true,
    notesLabel: "Note di sessione",
    notesPlaceholder: "Appunti, decisioni, promemoria…",
    confirmLabel: "Conferma apertura",
    confirmPrompt: "Conferma apertura {{SESSION}}",
    footerExtra: " &nbsp;·&nbsp; <b>DIRTY:</b> {{DIRTY}}"
  },
  closing: {
    subtitle: "Chiusura sessione · {{PROJECT_LABEL}} · {{PC}} · Tipo {{TIPO}}",
    sessionValue: "{{SESSION}}", sessionTag: "chiusura",
    references: true, inputs: true, action: true,
    notesLabel: "Note di chiusura",
    notesPlaceholder: "Decisioni finali, promemoria per la prossima…",
    confirmLabel: "Conferma chiusura",
    confirmPrompt: "Conferma chiusura {{SESSION}}",
    footerExtra: ""
  },
  handoff: {
    subtitle: "Ciclo sessione · handoff · {{PROJECT_LABEL}} · {{PC}} · Tipo {{TIPO}}",
    sessionValue: "{{SESSION}} → {{NEXT_SESSION}}", sessionTag: "chiusa → prossima",
    references: false, inputs: false, action: false,
    notesLabel: "", notesPlaceholder: "", confirmLabel: "", confirmPrompt: "",
    footerExtra: " &nbsp;·&nbsp; <b>Gate:</b> working tree clean verificato CMD Windows prima del ciclo (LL-024)."
  }
};

function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function raw(s){ return String(s==null?"":s); }
function stripComments(s){ return s.replace(/<!--[\s\S]*?-->/g,""); }

/* legge un file a blocchi marcati <!--#part:NOME--> / <!--#block:NOME--> */
function readMarked(file, tag){
  const txt = readFileSync(file,"utf8");
  const re = new RegExp("<!--#"+tag+":([a-z]+)-->","g");
  const marks=[]; let m;
  while((m=re.exec(txt))!==null) marks.push({name:m[1], start:m.index, after:m.index+m[0].length});
  const out={};
  for(let i=0;i<marks.length;i++){
    if(marks[i].name==="end") continue;
    const end = i+1<marks.length ? marks[i+1].start : txt.length;
    out[marks[i].name] = txt.slice(marks[i].after, end).replace(/^\n/,"").replace(/\n$/,"");
  }
  return out;
}

/* ─────────── blocchi di contenuto (invariati rispetto al renderer pre-S192) ─────────── */
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
/* priorita' HANDOFF: read-only (div.pbtn, niente data-v/chk2/wfh).
 * `badge b1` e non `badge`: la resa accent che handoff aveva nel suo CSS locale e' resa
 * dalla classe canonica gia' esistente. Stessa apparenza, zero regole in conflitto. */
function prioritiesHandoff(m){
  if(!m.priorities || !m.priorities.length) return "";
  return m.priorities.map(p=>{
    return `<div class="prio">\n`+
      `      <div class="pbtn">\n`+
      `        <span class="badge b1">${esc(p.badge)}</span>\n`+
      `        <span class="ptext"><span class="ptitle">${esc(p.title)}</span><span class="pfai">Fai: ${raw(p.fai||"")}</span>\n`+
      `          ${prioMeta(p)}</span>\n`+
      `      </div>\n`+
      `      <details><summary>Dettagli · piano, skill, ricerche</summary>${prioDetails(p.details)}\n`+
      `      </details>\n`+
      `    </div>`;
  }).join("\n    ");
}

/* ─────────── assemblaggio: shell canonica + contenuto del kind ─────────── */
function render(model){
  const kind = model.kind || "opening";
  const spec = KIND_SPEC[kind];
  const parts  = readMarked(kindParts(kind), "part");
  const blocks = readMarked(BLOCKS, "block");
  let shell = readFileSync(SHELL,"utf8");

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

  sc.SHELL_SUBTITLE    = spec.subtitle;
  sc.SHELL_SESSION_VAL = spec.sessionValue;
  sc.SHELL_SESSION_TAG = spec.sessionTag;
  sc.SHELL_META_CHIPS  = parts.chips || "";
  sc.SHELL_INTRO       = parts.intro || "";
  sc.SHELL_CONTROLS    = stripComments(parts.controls || "");
  sc.SHELL_SECTIONS    = stripComments(parts.sections || "");
  sc.SHELL_REFERENCES  = spec.references ? blocks.references : "";
  sc.SHELL_INPUTS      = spec.inputs     ? blocks.inputs     : "";
  sc.SHELL_ACTION      = spec.action     ? blocks.action     : "";
  sc.NOTES_LABEL       = spec.notesLabel;
  sc.NOTES_PLACEHOLDER = spec.notesPlaceholder;
  sc.CONFIRM_LABEL     = spec.confirmLabel;
  sc.CONFIRM_PROMPT    = spec.confirmPrompt;
  sc.SHELL_FOOTER_EXTRA= spec.footerExtra;

  let html = stripComments(shell);
  /* uno slot vuoto non lascia una riga fantasma: si toglie la riga intera prima di sostituire,
   * cosi' la shell resta identica a se stessa che il blocco ci sia o no. */
  for(const k of ["SHELL_INTRO","SHELL_CONTROLS","SHELL_REFERENCES","SHELL_SECTIONS","SHELL_INPUTS","SHELL_ACTION"]){
    if(!String(sc[k]||"").trim()) html = html.replace(new RegExp("^\\{\\{"+k+"\\}\\}\\n","m"), "");
  }
  /* due passate: gli slot della shell contengono a loro volta {{PLACEHOLDER}} del modello */
  for(let i=0;i<2;i++) html = html.replace(/\{\{([A-Z_0-9]+)\}\}/g,(mt,k)=> (k in sc)? String(sc[k]) : mt);
  html = html.replace(/\{\{([A-Z_0-9]+)\}\}/g,"");
  /* uno slot assente non deve lasciare una riga fantasma: la shell resta identica
   * a se stessa che il blocco ci sia o no. */
  html = html.replace(/\n{3,}/g,"\n\n").replace(/\s+$/,"");

  const css = readFileSync(CORE,"utf8");
  let js = readFileSync(BEHAV,"utf8").replace(/\{\{CONFIRM_PROMPT\}\}/g, spec.confirmPrompt.replace(/\{\{SESSION\}\}/g, sc.SESSION||""));
  return html + "\n<style>\n" + css + "</style>\n<script>\n" + js + "</script>\n";
}

/* ─────────── CARD-05 (S189): gate di SCOPE e SCHEMA, fail-closed — invariato ─────────── */
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
