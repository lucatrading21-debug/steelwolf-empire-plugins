# _session/publish — manifest di pubblicazione (plugin swe)

Un manifest per pubblicazione: `<S>-open.files.txt`, `<S>-work.files.txt`, `<S>-close.files.txt`. Un path relativo al repo
per riga, `#` = commento, nessuna wildcard, nessun `..`; il manifest elenca anche se stesso. Lo legge SOLO `swe-publish.ps1`,
che stagia esattamente quei file e nient'altro (mai `git add -A`).

Questo file esiste per versionare la cartella (git non traccia directory vuote). NON rinominarlo, NON cancellarlo.
