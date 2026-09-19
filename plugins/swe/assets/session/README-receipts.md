# _session/receipts — ricevute del gate numero-sessione e di pubblicazione (plugin swe)

Qui il gate scrive il receipt di apertura `<slug>_<S>.json` (`session-gate --mode=commit`, un numero = un receipt) e il
publisher scrive e committa la ricevuta di chiusura `<slug>_<S>_CLOSE.json` (`swe-publish.ps1 -Kind close`, `head` = `remote`).
`swe:start` la verifica con `session-gate --mode=receipt`.

Questo file esiste per versionare la cartella: git non traccia directory vuote e senza di esso il gate `--mode=commit`
si fermerebbe sull'altro PC (parita' dual-PC, V1). NON rinominarlo, NON cancellarlo. Nessun altro file va scritto a mano qui.
