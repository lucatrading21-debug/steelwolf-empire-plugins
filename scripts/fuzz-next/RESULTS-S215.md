# Risultati S215 (02/11/2026) — confronto readNext / PyYAML

Ambiente: Linux 6.8 (VM Cowork), Node v22.23.4, Python 3.10.12, PyYAML 6.0.3 (`yaml.safe_load`, come `empire_rollup.py`).
Gate: `plugins/swe/assets/session/session-gate.mjs` della versione swe 1.20.0 (prime 12 cifre sha256 `135aefe9c583`).
Dati `status`: i 5 file `_status/*.yaml` dei progetti nell'Hub (bot-alliance, predator, steelwolf-market-observatory,
steelwolf-strategy-lab, steelwolf-trading-journal; esclusi i file che iniziano con `_`) al 02/11/2026.

| Modo | Semi | Casi | Falsi PASS | Valori diversi | Falsi STOP |
|---|---|---|---|---|---|
| synth | 801, 802, 803 | 3 x 20.000 | 0 | 0 | 1.157 (1,9%) |
| status | 301-306 | 6 x 10.000 | 0 | 0 | 1.079 (1,8%) |

Comandi (dalla radice del repo):
```
python scripts/fuzz-next/fuzz_next.py synth  --gate plugins/swe/assets/session/session-gate.mjs --seed 801 --n 20000
python scripts/fuzz-next/fuzz_next.py status --gate plugins/swe/assets/session/session-gate.mjs --seed 301 --n 10000 --status-dir <Hub>/_status
```
I falsi STOP sono i casi in cui il gate e' piu' severo di PyYAML: tabulazioni, caratteri di controllo, ancore/alias/tag, forme rare.
Il gruppo `status` dipende dal contenuto dei file `_status` del giorno: rieseguito piu' tardi da' numeri diversi.
Storia: le versioni precedenti dei generatori non producevano `\` a fine riga (trovato da Codex al giro 4) ne' caratteri di
controllo e U+FEFF (trovati da Codex al giro 6 e dal generatore esteso): entrambi corretti nel gate e aggiunti qui.
Rieseguito dopo la correzione del giro 7 (anno 0000 in `date`, fuori da `readNext`): stessi numeri.
