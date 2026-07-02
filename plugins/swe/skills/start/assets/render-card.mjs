#!/usr/bin/env node
/* SteelWolf Empire - renderer DETERMINISTICO opening card (Fase 1, S166).
 * Legge opening-card.template.html (INVARIATO) + un modello JSON e produce l'HTML IDENTICO.
 * Pattern (ricerca UI-da-LLM): ragionamento (modello JSON) separato dal rendering (template+classi fisse).
 * NON cambia la visual view: riusa lo scheletro, il CSS e le classi esistenti del template.
 * Uso:  node render-card.mjs <model.json>   (oppure modello su stdin)  -> HTML su stdout.
 * Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
"use strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const TPL = join(HERE, "opening-card.template.html");

function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
// alcune stringhe del modello contengono gia' markup inline voluto (es. <code>) -> per i campi "rich" non escapiamo.
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
function priorities(m){
  if(!m.priorities || !m.priorities.length) return "";
  const dotFor = r => r==="high"?"dhigh":(r==="med"?"dmed":"dlow");
  const riskLbl = r => r==="high"?"alto":(r==="med"?"medio":"basso");
  let out=""; let lastWf=null;
  for(const p of m.priorities){
    if(p.workflow && p.workflow!==lastWf){ out+=`\n    <div class="wfh"><i class="ti ti-topology-ring"></i> ${esc(p.workflow)}</div>`; lastWf=p.workflow; }
    const on = p.on?" on":"";
    const badgeCls = "badge"+(p.on?" b1":"");
    const meta = `<span class="meta">`+
      `<span class="chip tipo"><i class="ti ti-tag"></i> Tipo: ${esc(p.tipo||"")}</span>`+
      `<span class="chip"><span class="dot ${dotFor(p.risk)}"></span>${riskLbl(p.risk)}</span>`+
      (p.stima?`<span class="chip"><i class="ti ti-clock"></i> ${esc(p.stima)}</span>`:"")+
      `<span class="chip"><i class="ti ti-square"></i> ${esc(p.stato||"Da fare")}</span>`+
      (p.moscow?`<span class="chip">${esc(p.moscow)}</span>`:"")+`</span>`;
    out+=`\n    <div class="prio${on}">\n`+
      `      <button class="pbtn" data-v="${esc(p.badge+" "+p.title)}" type="button">\n`+
      `        <span class="${badgeCls}">${esc(p.badge)}</span>\n`+
      `        <span class="ptext"><span class="ptitle">${esc(p.title)}</span><span class="pfai">Fai: ${raw(p.fai||"")}</span>\n`+
      `          ${meta}</span>\n`+
      `        <i class="ti ti-check chk2"></i>\n`+
      `      </button>\n`+
      `      <details><summary>Dettagli</summary>${prioDetails(p.details)}\n`+
      `      </details>\n`+
      `    </div>`;
  }
  return out;
}

function render(model){
  let t = readFileSync(TPL,"utf8");
  // rimuovi i commenti-guida <!-- ... --> del template (istruzioni per l'istanza), non parte della card
  t = t.replace(/<!--[\s\S]*?-->/g,"");
  const sc = Object.assign({}, model.scalars||{});
  // preselezioni pill
  sc.PC_PREDATOR_SEL = model.pc==="PREDATOR"?"sel":"";
  sc.PC_ACE_SEL      = model.pc==="ACE"?"sel":"";
  sc.PULL_VER_SEL    = model.pull==="Da verificare"?"sel":"";
  sc.PULL_OK_SEL     = model.pull==="Fatto"?"sel":"";
  sc.PULL_TODO_SEL   = model.pull==="Da fare"?"sel":"";
  // blocchi
  sc.ECOSYSTEM_BLOCK = ecosystemBlock(model);
  sc.CHECKLIST_MILESTONES = milestones(model);
  sc.PRIORITIES = priorities(model);
  // sostituzione scalari {{KEY}}
  t = t.replace(/\{\{([A-Z_0-9]+)\}\}/g,(mt,k)=> (k in sc)? String(sc[k]) : "");
  return t;
}

let input="";
try {
  const arg = process.argv[2];
  input = arg ? readFileSync(arg,"utf8") : readFileSync(0,"utf8");
} catch(e){ process.stderr.write("modello mancante: "+e.message+"\n"); process.exit(1); }
let model; try { model = JSON.parse(input); } catch(e){ process.stderr.write("JSON modello non valido: "+e.message+"\n"); process.exit(1); }
process.stdout.write(render(model));
