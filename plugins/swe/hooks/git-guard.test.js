#!/usr/bin/env node
/* Test di git-guard.js (S214). uso: node hooks/git-guard.test.js */
"use strict";
const { findBypass } = require("./git-guard.js");
const cases = [
  ["git commit --no-verify -m x", true], ["git commit -n -m x", true], ["git commit -anm x", true],
  ["git -C repo commit --no-verify", true], ["cd a && git commit --no-verify", true],
  ["git push --no-verify origin main", true], ["git merge --no-verify feat", true],
  ["git -c core.hooksPath=/dev/null commit -m x", true], ["GIT_OPTIONAL_LOCKS=0 git commit -n", true],
  ["C:\\Program Files\\Git\\cmd\\git.exe commit --no-verify -m x", true],
  ["git commit -m \"blocca --no-verify negli agenti\"", false], ["git commit -m 'vietato -n'", false],
  ["git push -n origin main", false], ["git commit -m x", false], ["git status --short", false],
  ["echo --no-verify", false], ["git log -n 5", false], ["git commit -am x", false],
  ["git commit -F - <<'EOF'\nmessaggio con --no-verify\nEOF", false], ["npm test -- --no-verify", false],
  ["git commit --no-veri -m x", true], ["git push --no-verif", true], ["git config core.hooksPath /tmp/x", true],
  ["git config --local core.hooksPath .nohooks", true], ["git config --get core.hooksPath", false], ["git config user.name Luke", false],
  /* revisione indipendente S214 */
  ["git commit -m x \"--no-verify\"", true], ["git commit -m x '--no-verify'", true], ["git -c 'core.hooksPath=/dev/null' commit -m x", true],
  ["& 'C:\\Program Files\\Git\\cmd\\git.exe' commit --no-verify -m x", true], ["git commit -mnote", false], ["git commit -mrename x", false],
  ["git commit -Snkey -m x", false], ["git commit -anm x", true], ["powershell -c \"git commit --no-verify -m x\"", true],
  ["bash -c 'git push --no-verify'", true], ["cmd /c \"git commit -n -m x\"", true], ["git commit \\\n --no-verify -m x", true],
  ["git commit `\n --no-verify -m x", true], ["(git commit --no-verify -m x)", true], ["echo $(git commit --no-verify -m x)", true],
  ["git config alias.ci 'commit --no-verify'", true], ["git -c core.hooksPath commit -m x", true],
  ["GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=core.hooksPath GIT_CONFIG_VALUE_0=/x git commit -m x", true],
  ["git commit -m x -- -n", false], ["git config core.hooksPath", false], ["git config --show-origin core.hooksPath", false],
  ["git commit -m \"--no-verify\"", false], ["git revert -n HEAD", false], ["git cherry-pick -n abc", false], ["git merge -n feat", false],
  ["echo foo bar/git commit --no-verify", false], ["/usr/bin/git commit -n -m x", true],
  ["git config alias.st status", false], ["powershell -c \"git status\"", false], ["git commit -F msg.txt -n", true],
];
let fail = 0;
for (const [c, want] of cases) { const got = !!findBypass(c); if (got !== want) { fail++; console.log(`FAIL  ${JSON.stringify(c)} atteso ${want} ottenuto ${got}`); } else console.log(`PASS  ${JSON.stringify(c)}`); }
console.log(`\nRISULTATO: ${cases.length - fail} PASS / ${fail} FAIL su ${cases.length}`); process.exit(fail ? 1 : 0);
