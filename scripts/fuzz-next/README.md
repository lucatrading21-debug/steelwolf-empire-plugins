# fuzz-next — verifica differenziale del campo `next` (S215, L9.17)

Strumento di verifica, **non** fa parte del payload del plugin (non e' nel MANIFEST di `plugins/swe/assets/session`).
Confronta `readNext()` di `session-gate.mjs` con PyYAML `safe_load`, il parser del roll-up (`empire_rollup.py`, workflow con
`pyyaml==6.0.3`).

Requisiti: Node 22+, Python 3.10+, `pip install pyyaml==6.0.3`.

```
python scripts/fuzz-next/fuzz_next.py synth  --gate plugins/swe/assets/session/session-gate.mjs --seed 701 --n 20000
python scripts/fuzz-next/fuzz_next.py status --gate plugins/swe/assets/session/session-gate.mjs --seed 201 --n 10000 --status-dir <Hub>/_status
```

Esito: `FALSO PASS` e `VALORE DIVERSO` devono essere 0 (exit 0). I `falso STOP` sono voluti dove il gate e' piu' severo di
PyYAML (tabulazioni, ancore, alias, tag, forme rare): si correggono riscrivendo la riga indicata nella forma semplice.
Limite: prova solo i casi che i generatori producono; la revisione indipendente resta parte della verifica.
