# Installation Guide

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

Procedure install plugin `swe` per ogni client Anthropic Claude.

---

## 1. Claude Cowork Desktop (Personal account)

### Prerequisites
- Cowork desktop ≥ 2026.04 (plugin marketplace support)
- GitHub account (per marketplace add)

### Steps
1. Open Cowork desktop
2. Customize → Plugins → "Add marketplace"
3. Enter source: `lucatrading21-debug/steelwolf-empire-plugins`
4. Confirm marketplace add
5. From plugin list: install `swe`
6. Reload session (or open new chat)

### Verify
In nuova chat, type `/swe` — should appear in slash command autocomplete dropdown:
- `/swe:start [progetto]`
- `/swe:end`
- `/swe:compact [istruzione]`

### Known issues
- **Issue #27398** plugin hooks may not fire — fallback: copy `hooks/` content to `~/.claude/settings.json`
- **Issue #26951** marketplace install HTTP 404 (occasional) — retry after 5 min or reinstall Cowork

---

## 2. Claude Code CLI

### Prerequisites
- Claude Code CLI installed
- Active session in any project

### Steps
```bash
# Add marketplace
claude plugin marketplace add lucatrading21-debug/steelwolf-empire-plugins

# Install plugin
claude plugin install swe@steelwolf-empire-plugins

# Verify
claude plugin list
```

### Verify
Inside CLI session:
```
/swe:start
```
Should trigger plugin command. Auto-discovery via description match also works.

### Local development install
For testing local changes before push:
```bash
claude --plugin-dir ./plugins/swe
```

---

## 3. Claude.ai Web

### Prerequisites
- Claude.ai web account with Projects support
- Project linked to GitHub repository

### Steps
1. Open Claude.ai web
2. Create/open Project
3. Skills auto-discovery from project files (no explicit install needed for skills)
4. ⚠️ Slash command support varies — use natural language fallback ("apri sessione Empire")

### Compatibility
- ✅ Skills auto-discovery (model invocation via description match)
- ⚠️ Slash command explicit (`/swe:start`) limited support
- ❌ Hooks not supported (no shell environment)

---

## 4. Cross-PC sync (PREDATOR ↔ ACE)

Per Empire dual-PC setup (LL-Empire-023 binding):

### On both PCs
1. Install plugin via marketplace (steps above)
2. Plugin auto-syncs across PCs since marketplace = same GitHub source

### After plugin update
```bash
# Pull latest plugin version
claude plugin update swe@steelwolf-empire-plugins

# Or full reinstall
claude plugin uninstall swe@steelwolf-empire-plugins
claude plugin install swe@steelwolf-empire-plugins
```

---

## Troubleshooting

### Plugin not appearing in slash dropdown (Cowork)
1. Verify install: Cowork → Customize → Plugins → check `swe` is listed
2. Reload session (close/reopen chat)
3. Check Cowork version ≥ 2026.04
4. Fallback: use natural language ("apri sessione Empire") for skills auto-discovery

### Hooks not firing
- Issue #27398 noted: workaround copy hook commands to `~/.claude/settings.json` user-level
- Verify scripts have execute permission (Linux/macOS): `chmod +x hooks/*.sh`

### Authentication errors (GitHub)
- Marketplace public, no auth required
- If errors: retry, check internet, verify GitHub.com accessibility

---

## Uninstall

```bash
claude plugin uninstall swe@steelwolf-empire-plugins
claude plugin marketplace remove steelwolf-empire-plugins
```

---

## Support

GitHub Issues: https://github.com/lucatrading21-debug/steelwolf-empire-plugins/issues
