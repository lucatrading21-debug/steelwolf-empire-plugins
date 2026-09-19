<#
.SYNOPSIS
  swe-publish.ps1 v2.0.1 - pubblicazione di sessione per OGNI progetto SteelWolf (D13 Empire-wide, ADR-037): UN comando, owner-side.
.DESCRIPTION
  Risolve il progetto PER SLUG dall'index dell'Hub (_status/_PROJECTS_INDEX.yaml: repo, branch, session_prefix, swe_writes),
  stagia SOLO i file elencati nel manifest, mostra lo stat, chiede conferma, committa, integra il remoto (fetch + merge:
  i bot pubblicano sullo stesso branch), pusha senza force, verifica ls-remote = HEAD e - con -Kind close - scrive la
  ricevuta _session/receipts/<slug>_<Session>_CLOSE.json e la PUBBLICA in un secondo commit (D-S210-1: la prova viaggia
  col repo, parita' dual-PC). Qualunque passo fallisca: si ferma, non forza.
  Vive nel plugin swe (assets/session/, coperto dal MANIFEST); l'owner lo lancia dal checkout del repo plugin sul PC,
  da qualunque cwd. Compatibile Windows PowerShell 5.1. Solo ASCII. (c) 2026 Luke SteelWolf - All Rights Reserved.
.EXAMPLE
  & "$env:USERPROFILE\SteelWolf_Empire\plugin\steelwolf-empire-plugins\plugins\swe\assets\session\swe-publish.ps1" -Slug predator -Session S211 -Kind close -Manifest _session\publish\S211-close.files.txt -Message "DOCS(s211): chiusura D6 - ..." -DryRun
.EXAMPLE
  & "...\swe-publish.ps1" -Slug steelwolf-trading-journal -Session S46 -Kind work -Manifest _session\publish\S46-open.files.txt -Message "DOCS(s46): apertura S46"
.NOTES
  -Kind work  = pubblicazione intermedia: stessi controlli, NESSUNA ricevuta.
  -Kind close = (default) pubblicazione di chiusura: ricevuta scritta e poi committata+pushata (2 pubblicazioni).
  -Root       = radice SteelWolf_Empire; se omessa si risale da $PSScriptRoot finche' esiste l'index (max 8 livelli).
  -Manifest   = path relativo AL REPO del progetto o assoluto; default <repo>\_session\publish\<Session>-<Kind>.files.txt,
                poi <Session>.files.txt. Nei comandi emessi da swe:end/start e' SEMPRE esplicito (design 7-ter F5).
  Exit: 0 pubblicato - 1 annullato dall'owner - 2 STOP (precondizione, git, parziale) - 3 uso errato.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][ValidatePattern('^[A-Za-z0-9][A-Za-z0-9-]*$')][string]$Slug,
  [Parameter(Mandatory = $true)][ValidatePattern('^[A-Za-z-]*S\d+$')][string]$Session,
  [Parameter(Mandatory = $true)][ValidateLength(10, 200)][string]$Message,
  [string]$Manifest = '',
  [ValidateSet('close','work')][string]$Kind = 'close',
  [string]$Root = '',
  [switch]$DryRun,
  [switch]$Yes
)
$ErrorActionPreference = 'Stop'
$SwVersion = 'swe-publish.ps1 2.0.1'
$script:SwPhase = 'main'
$script:SwReceiptPath = ''
$script:SwCallerDir = (Get-Location).Path   # la shell dell'owner torna qui a ogni uscita (T-JOURNAL S210: Set-Location restava)

function Restore-SwLocation { if ($script:SwCallerDir) { Set-Location $script:SwCallerDir } }

function Stop-Publish([string]$why, [int]$code = 2) {
  Write-Host ("SWE-PUBLISH: STOP - " + $why) -ForegroundColor Red
  if ($script:SwPhase -eq 'receipt' -and $script:SwReceiptPath) {
    Write-Host ("SWE-PUBLISH: PARZIALE - la chiusura E' pubblicata (ls-remote = HEAD verificato) ma la ricevuta " + $script:SwReceiptPath + " NON e' stata committata/pushata.") -ForegroundColor Yellow
    Write-Host ("Rimedio: ripeti con -Kind work e un manifest che elenca SOLO la ricevuta. start la segnalera' come 'non committata' finche' non lo fai.") -ForegroundColor Yellow
  }
  Restore-SwLocation
  exit $code
}
function Invoke-Git {
  # Esegue git, restituisce l'output, si ferma se exit != 0.
  # PS 5.1: con ErrorActionPreference=Stop lo stderr di un eseguibile nativo (git vi scrive il progresso) diventa
  # un errore terminante anche a exit 0 (misurato S208 sul PC owner). Qui si giudica SOLO l'exit code.
  $ErrorActionPreference = 'Continue'
  $out = & git @args 2>&1 | ForEach-Object { "$_" }
  if ($LASTEXITCODE -ne 0) { Stop-Publish ("git " + ($args -join ' ') + " -> exit " + $LASTEXITCODE + "`n" + ($out -join "`n")) }
  return $out
}
function Get-GitExit {
  # Solo exit code, per i comandi il cui "fallimento" e' una risposta (ls-files --error-unmatch, merge-base --is-ancestor).
  $ErrorActionPreference = 'Continue'
  $null = & git @args 2>&1 | ForEach-Object { "$_" }
  return $LASTEXITCODE
}
function Get-SwIndexPath([string]$dir) { return (Join-Path $dir 'hub\steelwolf-empire-hub\_status\_PROJECTS_INDEX.yaml') }

# 0. Radice SteelWolf_Empire: esplicita (-Root) o risalita da $PSScriptRoot finche' esiste l'index (max 8 livelli)
if ($Root) {
  if (-not (Test-Path (Get-SwIndexPath $Root))) { Stop-Publish ("-Root '" + $Root + "' non contiene l'index: " + (Get-SwIndexPath $Root)) 3 }
  $Root = (Resolve-Path $Root).Path
} else {
  $probe = $PSScriptRoot
  for ($i = 0; $i -lt 8 -and $probe -and -not $Root; $i++) {
    if (Test-Path (Get-SwIndexPath $probe)) { $Root = $probe } else { $probe = Split-Path -Parent $probe }
  }
  if (-not $Root) { Stop-Publish ("radice non trovata risalendo da " + $PSScriptRoot + " (8 livelli): passa -Root <SteelWolf_Empire>") 3 }
}
$idx = Get-SwIndexPath $Root

# 1. Index: parser minimale, stesse regex del gate (policy.mjs) + branch. Lettura UTF-8 esplicita (index senza BOM, PS 5.1).
$projects = @(); $cur = $null
foreach ($line in [System.IO.File]::ReadAllLines($idx, [System.Text.Encoding]::UTF8)) {
  if ($line -match '^\s*-\s*slug:\s*([^\s#]+)') { $cur = [ordered]@{ slug = $Matches[1]; repo = $null; branch = $null; prefix = ''; swe_writes = $null }; $projects += $cur; continue }
  if ($null -eq $cur) { continue }
  if     ($line -match '^\s*repo:\s*([^\s#]+)')            { if ($Matches[1] -ne 'null') { $cur.repo = $Matches[1] } }
  elseif ($line -match '^\s*branch:\s*([^\s#]+)')          { if ($Matches[1] -ne 'null') { $cur.branch = $Matches[1] } }
  elseif ($line -match '^\s*session_prefix:\s*"([^"]*)"')  { $cur.prefix = $Matches[1] }
  elseif ($line -match '^\s*swe_writes:\s*(true|false)')   { $cur.swe_writes = ($Matches[1] -eq 'true') }
}
if ($projects.Count -eq 0) { Stop-Publish ("index vuoto o illeggibile: " + $idx) 3 }
$P = $projects | Where-Object { $_.slug -ieq $Slug } | Select-Object -First 1
if ($null -eq $P) { Stop-Publish ("slug '" + $Slug + "' assente dall'index. Validi: " + (($projects | ForEach-Object { $_.slug }) -join ', ')) 3 }
if ($P.swe_writes -ne $true) { Stop-Publish ("'" + $P.slug + "' e' un dominio esterno (swe_writes: false): swe non pubblica qui") 3 }
if (-not $P.repo)   { Stop-Publish ("'" + $P.slug + "' senza repo nell'index") 3 }
if (-not $P.branch) { Stop-Publish ("'" + $P.slug + "' senza branch nell'index: il ramo di pubblicazione non e' una scelta al momento del push") 3 }
$Project = $P.slug
$Branch  = $P.branch
$Prefix  = $P.prefix; if (-not $Prefix) { $Prefix = 'S' }
if ($Session -notmatch ('^' + [regex]::Escape($Prefix) + '\d+$')) { Stop-Publish ("-Session '" + $Session + "' non rispetta il prefisso nativo '" + $Prefix + "' di '" + $Project + "' (es. " + $Prefix + "46)") 3 }

# 2. Repo del progetto: deve esistere ed essere la radice di un repository git
$repo = Join-Path $Root ($P.repo -replace '/', '\')
if (-not (Test-Path $repo)) { Stop-Publish ("repo del progetto assente: " + $repo) 3 }
$repo = (Resolve-Path $repo).Path
if ((Get-GitExit -C $repo rev-parse --show-toplevel) -ne 0) { Stop-Publish ("'" + $repo + "' non e' un repository git") 3 }
$top = ((Invoke-Git -C $repo rev-parse --show-toplevel) | Select-Object -First 1) -replace '/', '\'
if ($top.TrimEnd('\') -ine $repo.TrimEnd('\')) { Stop-Publish ("'" + $repo + "' non e' la radice del repository (toplevel = " + $top + ")") 3 }
Set-Location $repo

# 3. Manifest: esplicito (relativo al repo o assoluto) oppure default <Session>-<Kind>, poi <Session>
if (-not $Manifest) {
  $m1 = Join-Path $repo ("_session\publish\" + $Session + "-" + $Kind + ".files.txt")
  $m2 = Join-Path $repo ("_session\publish\" + $Session + ".files.txt")
  if (Test-Path $m1) { $Manifest = $m1 } elseif (Test-Path $m2) { $Manifest = $m2 } else { Stop-Publish ("manifest assente: ne' " + $m1 + " ne' " + $m2 + ". Passa -Manifest.") 3 }
} elseif (-not [System.IO.Path]::IsPathRooted($Manifest)) { $Manifest = Join-Path $repo $Manifest }
if (-not (Test-Path $Manifest)) { Stop-Publish ("manifest assente: " + $Manifest) 3 }
$mabs = (Resolve-Path $Manifest).Path
if (-not $mabs.StartsWith($repo.TrimEnd('\'), [System.StringComparison]::OrdinalIgnoreCase)) { Stop-Publish ("il manifest deve stare dentro il repo del progetto: " + $mabs) 3 }
$ManifestRel = ($mabs.Substring($repo.TrimEnd('\').Length)).TrimStart('\') -replace '\\', '/'

# 4. Precondizioni
$curBranch = (Invoke-Git rev-parse --abbrev-ref HEAD) | Select-Object -First 1
if ($curBranch -ne $Branch) { Stop-Publish ("branch corrente '" + $curBranch + "', atteso '" + $Branch + "' (index: " + $Project + ")") }
$gitDir = (Invoke-Git rev-parse --git-dir) | Select-Object -First 1
if (Test-Path (Join-Path $gitDir 'index.lock')) { Stop-Publish "index.lock presente: non lo rimuovo (git lock safety). Verifica e riprova." }
$pre = @(Invoke-Git diff --cached --name-only)
if ($pre.Count -gt 0) { Stop-Publish ("ci sono gia' file in stage: " + ($pre -join ', ') + ". Svuota lo stage (git restore --staged) e riprova.") }

# 5. Manifest: solo path relativi espliciti
$files = @(Get-Content $Manifest | ForEach-Object { $_.Trim() } | Where-Object { $_ -and -not $_.StartsWith('#') } | ForEach-Object { $_ -replace '\\', '/' })
if ($files.Count -eq 0) { Stop-Publish "manifest vuoto" 3 }
foreach ($f in $files) {
  if ($f -match '[\*\?]' -or $f -eq '.' -or $f -match '(^|/)\.\.(/|$)' -or $f -match '^(/|[A-Za-z]:)' -or $f.StartsWith('-')) {
    Stop-Publish ("voce di manifest non ammessa (wildcard, '.', '..', assoluta o opzione): " + $f) 3
  }
  $tracked = ((Get-GitExit ls-files --error-unmatch -- $f) -eq 0)
  if (-not (Test-Path (Join-Path $repo $f)) -and -not $tracked) { Stop-Publish ("file del manifest inesistente e non tracciato: " + $f) 3 }
}

# 6. Stage esplicito e confronto stage = manifest
foreach ($f in $files) { Invoke-Git add -- $f | Out-Null }
$staged = @(Invoke-Git diff --cached --name-only | ForEach-Object { "$_" })
$extra = @($staged | Where-Object { $files -notcontains $_ })
if ($extra.Count -gt 0) {
  Invoke-Git restore --staged -- . | Out-Null
  Stop-Publish ("in stage ci sono file fuori manifest: " + ($extra -join ', ') + ". Stage svuotato.")
}
$unchanged = @($files | Where-Object { $staged -notcontains $_ })
Write-Host ""
Write-Host ("SWE-PUBLISH " + $SwVersion + " | " + $Project + " / " + $Session + " su " + $Branch + " | repo " + $repo) -ForegroundColor Cyan
Invoke-Git diff --cached --stat | ForEach-Object { Write-Host $_ }
if ($unchanged.Count -gt 0) { Write-Host ("Nel manifest ma senza modifiche (ignorati): " + ($unchanged -join ', ')) -ForegroundColor Yellow }
$resume = $false
if ($staged.Count -eq 0) {
  $ahead = (Invoke-Git rev-list --count ("origin/" + $Branch + "..HEAD")) | Select-Object -First 1
  if ([int]$ahead -eq 0) { Stop-Publish "nessuna modifica da pubblicare" }
  $resume = $true
  Write-Host ("Nessun file nuovo, ma " + $ahead + " commit locali non pubblicati: RIPRESA (solo fetch/merge/push).") -ForegroundColor Yellow
}
Write-Host ("Messaggio: " + $Message)

if ($DryRun) {
  Invoke-Git restore --staged -- . | Out-Null
  Write-Host "DRY RUN: stage svuotato, nulla committato." -ForegroundColor Yellow
  Restore-SwLocation
  exit 0
}
if (-not $Yes) {
  $ans = Read-Host "Scrivi PUBBLICA per committare e pushare (qualunque altra cosa annulla)"
  if ($ans -cne 'PUBBLICA') { Invoke-Git restore --staged -- . | Out-Null; Stop-Publish "annullato dall'owner. Stage svuotato." 1 }
}

# 7. Commit, integrazione del remoto, push (mai force, mai --no-verify), verifica ls-remote = HEAD
function Publish-SwHead([string]$why) {
  Invoke-Git fetch origin $Branch | Out-Null
  if ((Get-GitExit merge-base --is-ancestor ("origin/" + $Branch) HEAD) -ne 0) {
    Write-Host ("Il remoto ha commit nuovi (rollup del bot o altro PC): merge (" + $why + ").") -ForegroundColor Yellow
    $ErrorActionPreference = 'Continue'
    $m = & git merge --no-edit ("origin/" + $Branch) 2>&1 | ForEach-Object { "$_" }
    $ErrorActionPreference = 'Stop'
    if ($LASTEXITCODE -ne 0) { Stop-Publish ("merge con conflitti: risolvi a mano, NON usare --ours/--theirs sui log.`n" + ($m -join "`n")) }
  }
  Invoke-Git push origin $Branch | Select-Object -Last 1 | ForEach-Object { Write-Host $_ }
  $h = (Invoke-Git rev-parse HEAD) | Select-Object -First 1
  $r = ((Invoke-Git ls-remote origin ("refs/heads/" + $Branch)) | Select-Object -First 1) -split '\s+' | Select-Object -First 1
  if ($h -ne $r) { Stop-Publish ("ls-remote " + $r + " != HEAD " + $h + ": pubblicazione (" + $why + ") NON dimostrata.") }
  return $h
}
if (-not $resume) { Invoke-Git commit -m $Message | Select-Object -Last 2 | ForEach-Object { Write-Host $_ } }
$head = Publish-SwHead 'chiusura'

if ($Kind -eq 'work') {
  Write-Host ""
  Write-Host ("PUBBLICATO (lavoro intermedio, nessuna ricevuta): ls-remote = HEAD = " + $head) -ForegroundColor Green
  Restore-SwLocation
  exit 0
}

# 8. Ricevuta di chiusura (certifica $head) e sua pubblicazione in un secondo commit (D-S210-1)
$rdir = Join-Path $repo '_session\receipts'
if (-not (Test-Path $rdir)) { New-Item -ItemType Directory -Path $rdir | Out-Null }
$rname = $Project + "_" + $Session + "_CLOSE.json"
$rpath = Join-Path $rdir $rname
$rec = [ordered]@{
  kind = 'session-close'; project = $Project; session = $Session; branch = $Branch
  head = $head; remote = $head; message = $Message; files = $staged
  pc = $env:COMPUTERNAME; publishedAt = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ssK'); tool = $SwVersion
  root = $Root; repo = $P.repo; manifest = $ManifestRel
}
[System.IO.File]::WriteAllText($rpath, ($rec | ConvertTo-Json -Depth 4), (New-Object System.Text.UTF8Encoding($false)))
$script:SwPhase = 'receipt'; $script:SwReceiptPath = $rpath
Write-Host ""
Write-Host ("PUBBLICATO: ls-remote = HEAD = " + $head) -ForegroundColor Green
Write-Host ("Ricevuta scritta: " + $rpath + " - ora la pubblico (secondo commit).")
$rrel = '_session/receipts/' + $rname
$pre2 = @(Invoke-Git diff --cached --name-only)
if ($pre2.Count -gt 0) { Stop-Publish ("stage non vuoto prima del commit della ricevuta: " + ($pre2 -join ', ')) }
Invoke-Git add -- $rrel | Out-Null
$st2 = @(Invoke-Git diff --cached --name-only | ForEach-Object { "$_" })
if ($st2.Count -ne 1 -or $st2[0] -ne $rrel) { Invoke-Git restore --staged -- . | Out-Null; Stop-Publish ("stage del secondo commit inatteso: " + ($st2 -join ', ') + ". Stage svuotato.") }
Invoke-Git commit -m ("DOCS(" + $Session.ToLower() + "): ricevuta di pubblicazione " + $Session) | Select-Object -Last 1 | ForEach-Object { Write-Host $_ }
$head2 = Publish-SwHead 'ricevuta'
Write-Host ""
Write-Host ("PUBBLICATA ANCHE LA RICEVUTA: ls-remote = HEAD = " + $head2 + " (certifica la chiusura " + $head + ")") -ForegroundColor Green
Write-Host ("La ricevuta viaggia col repo: nessun file untracked da portare nella prossima sessione.")
Restore-SwLocation
exit 0
