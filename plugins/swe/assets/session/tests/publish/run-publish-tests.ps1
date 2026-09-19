<#
.SYNOPSIS
  run-publish-tests.ps1 v0.3 - test T1-T9 del publisher + T12/T13 gate win32 swe-publish.ps1 v2 su fixture git REALI in %TEMP% (S210/S211, D13 Empire-wide).
.DESCRIPTION
  Crea in $env:TEMP una finta radice SteelWolf_Empire (index minimo), un repo bare "origin", un clone "repo" (il progetto) e un
  secondo clone "bot" (che simula il rollup). Poi invoca il publisher con -Root e -Yes e confronta exit code, ls-remote, ricevute.
  NON tocca i repo reali. NON cancella nulla: gli artefatti restano in $env:TEMP\swe-pub-tests-<stamp> (li elimina l'owner).
  Windows PowerShell 5.1. Solo ASCII. (c) 2026 Luke SteelWolf - All Rights Reserved.
.EXAMPLE
  .\run-publish-tests.ps1 -Publisher ..\..\swe-publish.ps1      # dal plugin: assets\session\tests\publish
.EXAMPLE
  .\run-publish-tests.ps1 -Publisher .\swe-publish.ps1           # dai drafts dell'Hub (S210)
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$Publisher,
  [string]$GateDrafts = '',
  [string]$PluginSession = ''
)
$ErrorActionPreference = 'Stop'
$Publisher = (Resolve-Path $Publisher).Path
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$T = Join-Path $env:TEMP ("swe-pub-tests-" + $stamp)
New-Item -ItemType Directory -Path $T | Out-Null
$pass = 0; $fail = 0
function Sw-Git([string]$cwd, [string[]]$a) {
  $ErrorActionPreference = 'Continue'
  $env:GIT_OPTIONAL_LOCKS = '0'
  $out = & git -C $cwd @a 2>&1 | ForEach-Object { "$_" }
  $ErrorActionPreference = 'Stop'
  if ($LASTEXITCODE -ne 0) { throw ("git " + ($a -join ' ') + " -> " + $LASTEXITCODE + "`n" + ($out -join "`n")) }
  return $out
}
function Sw-Check([bool]$ok, [string]$id, [string]$desc, [string]$det) {
  if ($ok) { $script:pass++; Write-Host ("PASS  " + $id + "  " + $desc) -ForegroundColor Green } else { $script:fail++; Write-Host ("FAIL  " + $id + "  " + $desc) -ForegroundColor Red }
  if ($det) { Write-Host ("      " + $det) }
}
function Sw-Run([string[]]$a) {
  # esegue il publisher in un processo figlio: exit code pulito, nessun Set-Location che sfugge
  $ErrorActionPreference = 'Continue'
  $out = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $Publisher @a 2>&1 | ForEach-Object { "$_" }
  $code = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  return @{ code = $code; out = ($out -join "`n") }
}
function Sw-Fixture([string]$name, [string]$branch = 'dev') {
  # radice finta: <T>\<name>\root con index, origin bare, repo (clone), bot (clone)
  $R = Join-Path (Join-Path $T $name) 'root'
  New-Item -ItemType Directory -Path (Join-Path $R 'hub\steelwolf-empire-hub\_status') -Force | Out-Null
  $idx = @(
    'projects:',
    '  - slug: p-test',
    '    repo: p-test',
    '    session_log: SESSION_LOG.md',
    '    briefings: p-test/SESSION_BRIEFINGS',
    '    session_prefix: ""',
    ('    branch: ' + $branch),
    '    swe_writes: true',
    '    session_gate: enforce',
    '  - slug: p-ba',
    '    repo: p-ba',
    '    session_log: SESSION_LOG.md',
    '    briefings: p-ba/SESSION_BRIEFINGS',
    '    session_prefix: "BA-S"',
    ('    branch: ' + $branch),
    '    swe_writes: true',
    '    session_gate: enforce',
    '  - slug: p-ext',
    '    repo: null',
    '    swe_writes: false'
  )
  [System.IO.File]::WriteAllLines((Join-Path $R 'hub\steelwolf-empire-hub\_status\_PROJECTS_INDEX.yaml'), $idx, (New-Object System.Text.UTF8Encoding($false)))
  $bare = Join-Path (Join-Path $T $name) 'origin.git'
  Sw-Git $T @('init', '--bare', '-q', ('--initial-branch=' + $branch), $bare) | Out-Null
  $repo = Join-Path $R 'p-test'
  Sw-Git $T @('clone', '-q', $bare, $repo) | Out-Null
  Sw-Git $repo @('checkout', '-q', '-B', $branch) | Out-Null
  Sw-Git $repo @('config', 'user.name', 'test') | Out-Null
  Sw-Git $repo @('config', 'user.email', 'test@test') | Out-Null
  New-Item -ItemType Directory -Path (Join-Path $repo '_session\publish') -Force | Out-Null
  Set-Content -Path (Join-Path $repo 'SESSION_LOG.md') -Value "registro`r`n" -Encoding Ascii
  Sw-Git $repo @('add', 'SESSION_LOG.md') | Out-Null
  Sw-Git $repo @('commit', '-q', '-m', 'base') | Out-Null
  Sw-Git $repo @('push', '-q', '-u', 'origin', $branch) | Out-Null
  $bot = Join-Path (Join-Path $T $name) 'bot'
  Sw-Git $T @('clone', '-q', $bare, $bot) | Out-Null
  Sw-Git $bot @('config', 'user.name', 'bot') | Out-Null
  Sw-Git $bot @('config', 'user.email', 'bot@test') | Out-Null
  return @{ root = $R; repo = $repo; bare = $bare; bot = $bot; branch = $branch }
}
function Sw-Manifest([string]$repo, [string]$name, [string[]]$lines) {
  $p = Join-Path $repo ('_session\publish\' + $name)
  [System.IO.File]::WriteAllLines($p, $lines, (New-Object System.Text.UTF8Encoding($false)))
  return ('_session/publish/' + $name)
}
function Sw-Remote([hashtable]$F) { return ((Sw-Git $F.repo @('ls-remote', 'origin', ('refs/heads/' + $F.branch)) | Select-Object -First 1) -split '\s+' | Select-Object -First 1) }
function Sw-Head([hashtable]$F) { return (Sw-Git $F.repo @('rev-parse', 'HEAD') | Select-Object -First 1) }

Write-Host ("run-publish-tests v0.3 | publisher " + $Publisher + " | artefatti in " + $T) -ForegroundColor Cyan

# --- T1: DryRun con una modifica reale -> exit 0, stage vuoto, nessun commit
$F = Sw-Fixture 't1'
Set-Content (Join-Path $F.repo 'note.md') 'uno' -Encoding Ascii
$m = Sw-Manifest $F.repo 'S45-work.files.txt' @('# t1', 'note.md', '_session/publish/S45-work.files.txt')
$h0 = Sw-Head $F
$r = Sw-Run @('-Root', $F.root, '-Slug', 'p-test', '-Session', 'S45', '-Kind', 'work', '-Manifest', $m, '-Message', 'DOCS(s45): prova dry run', '-DryRun')
$staged = @(Sw-Git $F.repo @('diff', '--cached', '--name-only'))
Sw-Check (($r.code -eq 0) -and ($r.out -match 'DRY RUN') -and ($staged.Count -eq 0) -and ((Sw-Head $F) -eq $h0)) 'T1' 'DryRun: stat mostrato, stage svuotato, nessun commit' ("exit=" + $r.code)

# --- T2: manifest con wildcard -> exit 3
$m2 = Sw-Manifest $F.repo 'S45-bad.files.txt' @('*.md')
$r = Sw-Run @('-Root', $F.root, '-Slug', 'p-test', '-Session', 'S45', '-Kind', 'work', '-Manifest', $m2, '-Message', 'DOCS(s45): prova wildcard', '-DryRun')
Sw-Check (($r.code -eq 3) -and ($r.out -match 'non ammessa')) 'T2' 'manifest con wildcard: rifiutato (exit 3)' ("exit=" + $r.code)

# --- T3: slug esterno -> exit 3 (senza toccare git)
$r = Sw-Run @('-Root', $F.root, '-Slug', 'p-ext', '-Session', 'S45', '-Kind', 'work', '-Manifest', $m, '-Message', 'DOCS(s45): prova esterno', '-DryRun')
Sw-Check (($r.code -eq 3) -and ($r.out -match 'dominio esterno')) 'T3' 'slug swe_writes:false: rifiutato (exit 3)' ("exit=" + $r.code)
$r = Sw-Run @('-Root', $F.root, '-Slug', 'p-nessuno', '-Session', 'S45', '-Kind', 'work', '-Manifest', $m, '-Message', 'DOCS(s45): prova ignoto', '-DryRun')
Sw-Check (($r.code -eq 3) -and ($r.out -match 'Validi: p-test, p-ba, p-ext')) 'T3b' 'slug ignoto: elenco degli slug validi (exit 3)' ("exit=" + $r.code)

# --- T4: -Root senza index -> exit 3
$r = Sw-Run @('-Root', $T, '-Slug', 'p-test', '-Session', 'S45', '-Kind', 'work', '-Manifest', $m, '-Message', 'DOCS(s45): prova root', '-DryRun')
Sw-Check (($r.code -eq 3) -and ($r.out -match 'non contiene l.index')) 'T4' '-Root senza index: rifiutato (exit 3)' ("exit=" + $r.code)

# --- T5: prefisso nativo -> exit 3
$r = Sw-Run @('-Root', $F.root, '-Slug', 'p-ba', '-Session', 'S45', '-Kind', 'work', '-Manifest', $m, '-Message', 'DOCS(s45): prova prefisso', '-DryRun')
Sw-Check (($r.code -eq 3) -and ($r.out -match 'prefisso nativo')) 'T5' '-Session senza prefisso BA-S: rifiutato (exit 3)' ("exit=" + $r.code)

# --- T6: branch corrente diverso dall'index -> exit 2
$F6 = Sw-Fixture 't6'
Sw-Git $F6.repo @('checkout', '-q', '-b', 'altro') | Out-Null
Set-Content (Join-Path $F6.repo 'note.md') 'uno' -Encoding Ascii
$m6 = Sw-Manifest $F6.repo 'S45-work.files.txt' @('note.md', '_session/publish/S45-work.files.txt')
$r = Sw-Run @('-Root', $F6.root, '-Slug', 'p-test', '-Session', 'S45', '-Kind', 'work', '-Manifest', $m6, '-Message', 'DOCS(s45): prova branch', '-DryRun')
Sw-Check (($r.code -eq 2) -and ($r.out -match "branch corrente 'altro'")) 'T6' 'branch corrente != index: STOP (exit 2)' ("exit=" + $r.code)

# --- T7: stage gia sporco -> exit 2
$F7 = Sw-Fixture 't7'
Set-Content (Join-Path $F7.repo 'altro.md') 'x' -Encoding Ascii
Sw-Git $F7.repo @('add', 'altro.md') | Out-Null
Set-Content (Join-Path $F7.repo 'note.md') 'uno' -Encoding Ascii
$m7 = Sw-Manifest $F7.repo 'S45-work.files.txt' @('note.md', '_session/publish/S45-work.files.txt')
$r = Sw-Run @('-Root', $F7.root, '-Slug', 'p-test', '-Session', 'S45', '-Kind', 'work', '-Manifest', $m7, '-Message', 'DOCS(s45): prova stage', '-DryRun')
Sw-Check (($r.code -eq 2) -and ($r.out -match 'gia. file in stage')) 'T7' 'stage gia sporco: STOP (exit 2)' ("exit=" + $r.code)

# --- T9: -Kind work reale -> push, ls-remote = HEAD, NESSUNA ricevuta
$F9 = Sw-Fixture 't9'
Set-Content (Join-Path $F9.repo 'note.md') 'uno' -Encoding Ascii
$m9 = Sw-Manifest $F9.repo 'S45-work.files.txt' @('note.md', '_session/publish/S45-work.files.txt')
$r = Sw-Run @('-Root', $F9.root, '-Slug', 'p-test', '-Session', 'S45', '-Kind', 'work', '-Manifest', $m9, '-Message', 'DOCS(s45): lavoro intermedio', '-Yes')
$okRemote = ((Sw-Remote $F9) -eq (Sw-Head $F9))
$noRec = -not (Test-Path (Join-Path $F9.repo '_session\receipts\p-test_S45_CLOSE.json'))
Sw-Check (($r.code -eq 0) -and ($r.out -match 'nessuna ricevuta') -and $okRemote -and $noRec) 'T9' '-Kind work: pubblicato, ls-remote = HEAD, nessuna ricevuta' ("exit=" + $r.code + " remote=head=" + $okRemote)

# --- T8: -Kind close con il bot avanti di 1 commit -> merge, push, ricevuta tool 2.0.x, SECONDO commit con la sola ricevuta, ls-remote = HEAD2
$F8 = Sw-Fixture 't8'
Set-Content (Join-Path $F8.bot 'STATE.md') 'rollup' -Encoding Ascii
Sw-Git $F8.bot @('add', 'STATE.md') | Out-Null
Sw-Git $F8.bot @('commit', '-q', '-m', 'bot rollup') | Out-Null
Sw-Git $F8.bot @('push', '-q', 'origin', $F8.branch) | Out-Null
Set-Content (Join-Path $F8.repo 'SESSION_LOG.md') "registro`r`nchiusura`r`n" -Encoding Ascii
$m8 = Sw-Manifest $F8.repo 'S45-close.files.txt' @('SESSION_LOG.md', '_session/publish/S45-close.files.txt')
$r = Sw-Run @('-Root', $F8.root, '-Slug', 'p-test', '-Session', 'S45', '-Kind', 'close', '-Manifest', $m8, '-Message', 'DOCS(s45): chiusura D6 - prova', '-Yes')
$rp = Join-Path $F8.repo '_session\receipts\p-test_S45_CLOSE.json'
$rec = $null; if (Test-Path $rp) { $rec = Get-Content $rp -Raw | ConvertFrom-Json }
$head2 = Sw-Head $F8
$last = (Sw-Git $F8.repo @('log', '-1', '--format=%s') | Select-Object -First 1)
$lastFiles = @(Sw-Git $F8.repo @('show', '--name-only', '--format=', 'HEAD'))
$tracked = $true; try { Sw-Git $F8.repo @('ls-files', '--error-unmatch', '--', '_session/receipts/p-test_S45_CLOSE.json') | Out-Null } catch { $tracked = $false }
$anc = $true; if ($rec) { try { Sw-Git $F8.repo @('merge-base', '--is-ancestor', $rec.head, 'HEAD') | Out-Null } catch { $anc = $false } } else { $anc = $false }
$hasBot = (Test-Path (Join-Path $F8.repo 'STATE.md'))
$ok8 = ($r.code -eq 0) -and ($null -ne $rec) -and ($rec.kind -eq 'session-close') -and ($rec.head -eq $rec.remote) -and ($rec.tool -like 'swe-publish.ps1 2.0.*') -and ($rec.manifest -eq '_session/publish/S45-close.files.txt') -and ($last -eq 'DOCS(s45): ricevuta di pubblicazione S45') -and ($lastFiles.Count -eq 1) -and ($lastFiles[0] -eq '_session/receipts/p-test_S45_CLOSE.json') -and $tracked -and $anc -and ((Sw-Remote $F8) -eq $head2) -and $hasBot -and ($r.out -match 'PUBBLICATA ANCHE LA RICEVUTA')
Sw-Check $ok8 'T8' '-Kind close con bot avanti: merge, push, ricevuta v2, secondo commit = sola ricevuta, tracciata, head antenato, ls-remote = HEAD2' ("exit=" + $r.code + " rec=" + ($null -ne $rec) + " last='" + $last + "' files=" + $lastFiles.Count + " tracked=" + $tracked + " ancestor=" + $anc + " bot=" + $hasBot)
if (-not $ok8) { Write-Host $r.out }

# --- T8b: -Kind close su p-ba con designatore BA-S45 -> ricevuta p-ba_BA-S45_CLOSE.json
$Fb = Sw-Fixture 't8b'
$repoBa = Join-Path $Fb.root 'p-ba'
Sw-Git $T @('clone', '-q', $Fb.bare, $repoBa) | Out-Null
Sw-Git $repoBa @('checkout', '-q', '-B', $Fb.branch) | Out-Null
Sw-Git $repoBa @('config', 'user.name', 'test') | Out-Null
Sw-Git $repoBa @('config', 'user.email', 'test@test') | Out-Null
New-Item -ItemType Directory -Path (Join-Path $repoBa '_session\publish') -Force | Out-Null
Set-Content (Join-Path $repoBa 'SESSION_LOG.md') "registro`r`nchiusura ba`r`n" -Encoding Ascii
$mb = Sw-Manifest $repoBa 'BA-S45-close.files.txt' @('SESSION_LOG.md', '_session/publish/BA-S45-close.files.txt')
$r = Sw-Run @('-Root', $Fb.root, '-Slug', 'p-ba', '-Session', 'BA-S45', '-Kind', 'close', '-Manifest', $mb, '-Message', 'DOCS(ba-s45): chiusura D6 - prova prefisso', '-Yes')
$rpb = Join-Path $repoBa '_session\receipts\p-ba_BA-S45_CLOSE.json'
Sw-Check (($r.code -eq 0) -and (Test-Path $rpb)) 'T8b' 'prefisso nativo: ricevuta p-ba_BA-S45_CLOSE.json scritta e pubblicata' ("exit=" + $r.code)

# --- T12/T13: gate patchato (drafts/gate) su win32 - integrazione publisher -> --mode=receipt, poi suite run-tests.mjs con --runs
# Posizione: dentro il plugin (assets/session/tests/publish) il gate e' gia' in ..\.. ; nei drafts dell'Hub e' in .\gate + plugin 6 livelli sopra
$inPlugin = Test-Path (Join-Path $PSScriptRoot '..\..\session-gate.mjs')
if (-not $PluginSession) { if ($inPlugin) { $PluginSession = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path } else { $PluginSession = Join-Path $PSScriptRoot '..\..\..\..\..\..\plugin\steelwolf-empire-plugins\plugins\swe\assets\session' } }
if (-not $GateDrafts) { if ($inPlugin) { $GateDrafts = $PluginSession } else { $GateDrafts = Join-Path $PSScriptRoot 'gate' } }
$nodeOk = $null -ne (Get-Command node -ErrorAction SilentlyContinue)
if (-not $nodeOk -or -not (Test-Path (Join-Path $GateDrafts 'session-gate.mjs')) -or -not (Test-Path (Join-Path $PluginSession 'swe-next-session.mjs'))) {
  Write-Host ("SKIP  T12/T13  gate: node=" + $nodeOk + " drafts=" + (Test-Path (Join-Path $GateDrafts 'session-gate.mjs')) + " plugin=" + (Test-Path (Join-Path $PluginSession 'swe-next-session.mjs'))) -ForegroundColor Yellow
} else {
  $G = Join-Path $T 'gate'
  Copy-Item -Path $PluginSession -Destination $G -Recurse
  if (-not $inPlugin) {
    # overlay dei drafts sulla copia del plugin 1.17.0 (solo fuori dal plugin: dentro, i file sono gia' quelli)
    Copy-Item (Join-Path $GateDrafts 'session-gate.mjs') $G -Force
    Copy-Item (Join-Path $GateDrafts 'policy.mjs') $G -Force
    Copy-Item (Join-Path $GateDrafts 'run-tests.mjs') (Join-Path $G 'tests') -Force
    New-Item -ItemType Directory -Path (Join-Path $G 'tests\fixtures\receipt\r-boot') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $G 'tests\fixtures\receipt\r-hold\brief') -Force | Out-Null
    Copy-Item (Join-Path $GateDrafts 'fixtures-receipt\idx.yaml') (Join-Path $G 'tests\fixtures\receipt') -Force
    Copy-Item (Join-Path $GateDrafts 'fixtures-receipt\r-hold\reg.md') (Join-Path $G 'tests\fixtures\receipt\r-hold') -Force
  }
  # T12: la ricevuta scritta da T8 letta dal gate. Il registro della fixture riceve un blocco (S45 chiusa) e il briefing S45.
  $blk = "<!-- STATO NUMERAZIONE -->`r`nULTIMO NUMERO OCCUPATO : S45`r`nULTIMA SESSIONE CHIUSA : S45`r`nPROSSIMO NUMERO LIBERO : S46`r`n`r`n## 2026-01-02 | Tipo A | S45 - chiusa`r`n`r`ntesto`r`n"
  Set-Content (Join-Path $F8.repo 'SESSION_LOG.md') $blk -Encoding Ascii
  New-Item -ItemType Directory -Path (Join-Path $F8.repo 'SESSION_BRIEFINGS') -Force | Out-Null
  Set-Content (Join-Path $F8.repo 'SESSION_BRIEFINGS\S45_OPEN.md') '' -Encoding Ascii
  $ErrorActionPreference = 'Continue'
  $o = & node (Join-Path $G 'session-gate.mjs') ('--root=' + $F8.root) '--slug=p-test' '--mode=receipt' 2>&1 | ForEach-Object { "$_" }
  $c = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  $oo = ($o -join "`n")
  Sw-Check (($c -eq 0) -and ($oo -match 'RECEIPT PASS S45') -and ($oo -match '"tracked":true') -and ($oo -match '"ancestor":true')) 'T12' 'integrazione win32: la ricevuta pubblicata da T8 e letta dal gate --mode=receipt -> PASS S45' ("exit=" + $c)
  if ($c -ne 0) { Write-Host $oo }
  # T12b: ricevuta v1 (untracked) -> NOT_PUBLISHED "non committata" (scenario transizione / secondo push mancato)
  $Fu = Sw-Fixture 't12b'
  Set-Content (Join-Path $Fu.repo 'SESSION_LOG.md') $blk -Encoding Ascii
  New-Item -ItemType Directory -Path (Join-Path $Fu.repo '_session\receipts') -Force | Out-Null
  $hU = Sw-Head $Fu
  $recU = [ordered]@{ kind='session-close'; project='p-test'; session='S45'; branch=$Fu.branch; head=$hU; remote=$hU; message='m'; files=@(); pc='T'; publishedAt='2026-01-02T00:00:00+00:00'; tool='test' }
  [System.IO.File]::WriteAllText((Join-Path $Fu.repo '_session\receipts\p-test_S45_CLOSE.json'), ($recU | ConvertTo-Json -Depth 4), (New-Object System.Text.UTF8Encoding($false)))
  $ErrorActionPreference = 'Continue'
  $o = & node (Join-Path $G 'session-gate.mjs') ('--root=' + $Fu.root) '--slug=p-test' '--mode=receipt' 2>&1 | ForEach-Object { "$_" }
  $c = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  $oo = ($o -join "`n")
  Sw-Check (($c -eq 2) -and ($oo -match 'NOT_PUBLISHED S45') -and ($oo -match 'NON committata')) 'T12b' 'win32: ricevuta coerente ma untracked -> NOT_PUBLISHED "non committata" (F2)' ("exit=" + $c)
  # T13: suite completa del gate su win32 con --runs (attesi 60 PASS / 0 FAIL / 2 SKIP; i 2 SKIP sono i casi [LIVE])
  $runs = Join-Path $T 'gate-runs'
  New-Item -ItemType Directory -Path $runs -Force | Out-Null
  $ErrorActionPreference = 'Continue'
  $o = & node (Join-Path $G 'tests\run-tests.mjs') ('--root=' + $F8.root) ('--runs=' + $runs) 2>&1 | ForEach-Object { "$_" }
  $c = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  $res = ($o | Where-Object { $_ -match '^RISULTATO' } | Select-Object -First 1)
  Sw-Check (($c -eq 0) -and ($res -match '60 PASS / 0 FAIL / 2 SKIP')) 'T13' 'suite gate completa su win32 (--runs): 60 PASS / 0 FAIL / 2 SKIP' ("exit=" + $c + " " + $res)
  if ($c -ne 0) { $o | Where-Object { $_ -match '^FAIL' -or $_ -match 'MANCANO|VIETATI|ERRORE' } | ForEach-Object { Write-Host $_ } }
}

Write-Host ""
Write-Host ("RISULTATO: " + $pass + " PASS / " + $fail + " FAIL  -  artefatti conservati in " + $T) -ForegroundColor Cyan
if ($fail -gt 0) { exit 1 } else { exit 0 }
