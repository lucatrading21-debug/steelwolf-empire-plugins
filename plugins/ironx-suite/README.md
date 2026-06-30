# ironx-suite

**SteelWolf Empire — IronX Ecosystem skill suite** (15 skill di dominio).

Bundle delle skill `ironx-*` per lo sviluppo di indicatori, EA e bot cross-platform su **NinjaTrader 8** (NinjaScript C#), **MetaTrader 5** (MQL5) e **TradingView** (PineScript v6).

## Skill incluse (15)

| Skill | Ruolo |
|---|---|
| `ironx-prime` | Direttiva operativa root (HOW: reasoning, output, workflow, anti-hallucination) |
| `ironx-ecosystem` | Contesto base permanente (WHAT: prodotti, architettura, standard) |
| `ironx-platform-matrix` | Mappa equivalenze cross-platform NT8/MT5/TV |
| `ironx-nt8` | Deep-dive NinjaTrader 8 / NinjaScript C# |
| `ironx-mql5` | Deep-dive MetaTrader 5 / MQL5 |
| `ironx-pinescript` | Deep-dive TradingView / PineScript v6 |
| `ironx-signals` | Logica segnali, buffer output, anti-repaint |
| `ironx-bar-types` | Renko / NinZaRenko / KingRenko$ |
| `ironx-alerts` | Sistema alert cross-platform |
| `ironx-confluence` | Comunicazione inter-prodotti, ComBus, Captain IronX |
| `ironx-research` | Metodologia ricerca / reverse engineering |
| `ironx-engineer` | Suite ingegneristica (review, reverse, architect, math, perf, security) |
| `ironx-quality` | Checklist qualità + testing (zero-ghost/repaint/warning) |
| `ironx-docs` | Standard documentazione IronX |
| `ironx-session` | Workflow apertura/chiusura sessioni |

## Governance

- **Freeze V5 (ADR-007):** queste skill sono knowledge base read-context. Lo sviluppo effettivo su `ironx-ecosystem` (code repo) resta in freeze — solo lettura.
- **Caricamento:** `ironx-prime` ha priorità BEFORE su tutte le altre skill IronX.
- Auto-discovery via `description` (Anthropic 2026). Namespaced `ironx-suite:<skill>`.

## Install

Marketplace privato Empire `steelwolf-empire-plugins`. Vedi `docs/INSTALL.md` nel repo marketplace.
