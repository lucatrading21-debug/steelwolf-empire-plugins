#!/usr/bin/env node
/* SteelWolf Empire - GIT GUARD (PreToolUse, Bash|PowerShell). S214, DA_PROGETTI §4.1, LL-S56.
 *
 * Rifiuta (exit 2) ai soli agenti i comandi git che SALTANO gli hook del repo (gitleaks, pre-commit, pre-push):
 *   git commit --no-verify | -n (anche in gruppo: -an, -anm; NON -mn, dove n e' il messaggio)
 *   git push|merge|am|rebase|cherry-pick|revert|pull ... --no-verify (anche abbreviato: --no-veri)
 *   git -c core.hooksPath[=...] ... | --config-env con hooksPath | GIT_CONFIG_KEY_<n>/GIT_CONFIG_PARAMETERS con hooksPath
 *   git config core.hooksPath <valore> | --unset/--add/--replace-all | set/unset (la sola lettura e' ammessa)
 *   git config alias.<x> '... --no-verify ...'
 * Analizza anche i comandi annidati in bash/sh/pwsh/powershell/cmd (-c, -Command, /c), le righe spezzate
 * (\ e ` a fine riga) e le sottoshell ( ), $( ), { }.
 *
 * Tokenizer: le virgolette si tolgono e il contenuto resta UN argomento. Il confronto e' per argomento intero:
 * il messaggio "blocca --no-verify" non e' mai uguale a --no-verify, mentre "--no-verify" da solo lo e'.
 * Gli heredoc (corpo dei messaggi lunghi) non si analizzano.
 *
 * LIMITI NOTI (scritti, non coperti): HUSKY=0, SKIP=<hook> del framework pre-commit, cancellare .git/hooks,
 * git commit-tree + update-ref, alias definiti prima di questa versione. In Cowork l'hook e' no-op (CARD-06B):
 * li' vale la regola scritta (LL-Empire-096, SKILL).
 * FAIL-OPEN su tutto tranne il riscontro positivo. Copyright (c) 2026 Luke SteelWolf - All Rights Reserved. */
"use strict";
const NOVERIFY_SUBS = new Set(["commit", "push", "merge", "am", "rebase", "cherry-pick", "revert", "pull"]);
const SHELLS = /^(bash|sh|zsh|dash|pwsh|powershell|cmd)(\.exe)?$/i;
const COMMIT_VALUE_OPTS = new Set(["-m", "-F", "-C", "-c", "-t", "--message", "--file", "--reuse-message", "--reedit-message",
  "--template", "--author", "--date", "--fixup", "--squash", "--trailer", "--cleanup", "--pathspec-from-file"]);
const isNoVerify = (x) => (x.length >= 8 && "--no-verify".startsWith(x)) || /^--no-verify=/.test(x);
function tokenize(cmd) {
  const s = String(cmd)
    .replace(/<<-?[ \t]*(['"]?)([A-Za-z_][\w]*)\1[^\n]*\n[\s\S]*?\n[ \t]*\2[ \t]*(?=\n|$)/g, " ")   // heredoc
    .replace(/\\\r?\n|`\r?\n/g, " ");                                                              // righe spezzate
  const segs = []; let seg = [], tok = null, i = 0;
  const end = () => { if (tok !== null) { seg.push(tok); tok = null; } };
  const cut = () => { end(); if (seg.length) segs.push(seg); seg = []; };
  while (i < s.length) {
    const c = s[i];
    if (c === "'") { const j = s.indexOf("'", i + 1); tok = (tok || "") + s.slice(i + 1, j < 0 ? s.length : j); i = j < 0 ? s.length : j + 1; continue; }
    if (c === '"') { let j = i + 1, v = ""; while (j < s.length && s[j] !== '"') { if (s[j] === "\\" && j + 1 < s.length) { v += s[j + 1]; j += 2; } else v += s[j++]; } tok = (tok || "") + v; i = j + 1; continue; }
    if (/\s/.test(c) && c !== "\n") { end(); i++; continue; }
    if (";|&\n(){}".includes(c)) { cut(); i++; continue; }
    if (c === "$" && s[i + 1] === "(") { cut(); i += 2; continue; }
    tok = (tok || "") + c; i++;
  }
  cut(); return segs;
}
function checkSeg(t, depth) {
  let i = 0;
  while (i < t.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(t[i]) || /^(sudo|env|command|exec|time|nohup)$/.test(t[i]))) i++;
  const head = (t[i] || "").split(/[\\/]/).pop();
  if (SHELLS.test(head) && depth < 3) {
    for (let k = i + 1; k < t.length; k++) if (/^(-c|-command|\/c|\/k)$/i.test(t[k]) && t[k + 1]) { const r = findBypass(t.slice(k + 1).join(" "), depth + 1); if (r) return r; break; }
    return null;
  }
  if (!/^git(\.exe)?$/i.test(head)) {
    /* percorso con spazi non quotato: C:\Program Files\Git\cmd\git.exe -> i pezzi prima del git hanno \ / o : */
    const k = t.findIndex((x, n) => n > i && /^git(\.exe)?$/i.test(x.split(/[\\/]/).pop()) && /[\\/]/.test(x));
    if (k < 0 || !/^([A-Za-z]:)?[\\/]/.test(t[i]) || !t.slice(i, k).every(x => /[\\/:]/.test(x) || /^[A-Za-z0-9 ._()-]+$/.test(x))) return null;
    i = k;
  }
  i++;
  while (i < t.length && t[i].startsWith("-")) {
    const o = t[i];
    if (o === "-c" && /^core\.hookspath(=|$)/i.test(t[i + 1] || "")) return "git -c core.hooksPath (hook disattivati)";
    if (/^-ccore\.hookspath(=|$)/i.test(o)) return "git -c core.hooksPath (hook disattivati)";
    if (/^--config-env/i.test(o) && /hookspath/i.test(o + " " + (t[i + 1] || ""))) return "git --config-env core.hooksPath (hook disattivati)";
    i += (["-c", "-C", "--git-dir", "--work-tree", "--namespace", "--config-env"].includes(o)) ? 2 : 1;
  }
  const sub = (t[i] || "").toLowerCase(), rest = t.slice(i + 1);
  if (sub === "config") {
    const ki = rest.findIndex(x => /^core\.hookspath$/i.test(x));
    if (ki >= 0) {
      const write = rest.some(x => /^(--unset|--unset-all|--add|--replace-all|set|unset)$/i.test(x)) || rest.slice(ki + 1).some(x => !x.startsWith("-"));
      if (write) return "git config core.hooksPath (hook spostati o spenti)";
    }
    if (rest.some(x => /^alias\./i.test(x)) && rest.some(x => /(^|\s)--no-veri/.test(x) || /^!?\s*commit\b.*\s-[a-z]*n/i.test(x))) return "git config alias con --no-verify";
    return null;
  }
  if (!NOVERIFY_SUBS.has(sub)) return null;
  for (let k = 0; k < rest.length; k++) {
    const x = rest[k];
    if (x === "--") break;
    if (sub === "commit" && COMMIT_VALUE_OPTS.has(x)) { k++; continue; }
    if (isNoVerify(x)) return `git ${sub} --no-verify`;
    if (sub === "commit" && /^-[A-Za-z]+$/.test(x)) {
      for (const ch of x.slice(1)) { if ("mFCctSu".includes(ch)) break; if (ch === "n") return "git commit -n (= --no-verify)"; }
    }
  }
  return null;
}
function findBypass(cmd, depth = 0) {
  const raw = String(cmd);
  if (/GIT_CONFIG_(KEY_\d+|PARAMETERS)[^\n]*hookspath/i.test(raw)) return "GIT_CONFIG_* con core.hooksPath (hook disattivati)";
  for (const seg of tokenize(raw)) { const r = checkSeg(seg, depth); if (r) return r; }
  return null;
}
module.exports = { findBypass, tokenize };
if (require.main === module) {
  try {
    if (process.env.CLAUDE_CODE_IS_COWORK === "1") process.exit(0);
    if (!require("./_swe-domain.js")()) process.exit(0);
    let raw = "";
    try { raw = require("fs").readFileSync(0, "utf8"); } catch (_) { process.exit(0); }
    let j = {}; try { j = JSON.parse(String(raw || "{}").replace(/^\uFEFF/, "")); } catch (_) { process.exit(0); }
    const cmd = (j.tool_input && j.tool_input.command) || "";
    const hit = cmd ? findBypass(cmd) : null;
    if (!hit) process.exit(0);
    process.stderr.write(`STOP git-guard (S214): "${hit}" salta gli hook del repo (gitleaks e controlli). Vietato agli agenti.\n` +
      `Rimedio: correggi cio' che l'hook segnala e ripeti il comando senza bypass. Se l'hook sbaglia, fermati e chiedi all'owner.\n`);
    process.exit(2);
  } catch (_) { process.exit(0); }
}
