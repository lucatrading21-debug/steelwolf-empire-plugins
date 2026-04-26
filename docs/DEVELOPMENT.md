# Development Guide

> Copyright © 2026 Luke SteelWolf — All Rights Reserved. See LICENSE.

Guide for Empire core team development of plugins in this marketplace.

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions and rationale.

## Plugin structure standard

Each plugin in `plugins/<name>/` follows Anthropic 2026 standard:

```
plugins/<plugin-name>/
├── .claude-plugin/
│   ├── plugin.json        ← manifest (REQUIRED): name, version, description, author
│   └── hooks.json         ← lifecycle hooks (OPTIONAL)
├── skills/                 ← auto-discovery via description matching
│   └── <skill-name>/
│       └── SKILL.md       ← YAML frontmatter + body
├── commands/               ← user-invocation slash commands
│   └── <command-name>.md  ← YAML frontmatter + prompt body
├── hooks/                  ← lifecycle scripts (referenced from hooks.json)
│   └── *.sh
└── README.md               ← plugin-specific docs
```

## Local development

### Setup
```bash
git clone https://github.com/lucatrading21-debug/steelwolf-empire-plugins.git
cd steelwolf-empire-plugins
```

### Test plugin locally (Claude Code CLI)
```bash
claude --plugin-dir ./plugins/swe
```

### Modify and reload
```bash
# Edit files in plugins/swe/
# In Claude Code session:
/reload-plugins
```

### Validate schema
```bash
# Run pre-commit validation manually
bash scripts/pre-commit-validate.sh
```

## Adding new plugins

1. Create folder: `plugins/<new-plugin-name>/`
2. Add manifest: `.claude-plugin/plugin.json` (name, version, description, author)
3. Add skills/commands/hooks as needed
4. Update root `.claude-plugin/marketplace.json` `plugins[]` array with new entry
5. Add plugin README.md
6. Run schema validation: `bash scripts/pre-commit-validate.sh`
7. Commit + push

## Schema reference

### plugin.json (REQUIRED)
```json
{
  "name": "kebab-case-name",
  "version": "X.Y.Z (semver)",
  "description": "...",
  "author": {"name": "Luke SteelWolf"},
  "homepage": "https://...",
  "repository": "https://...",
  "license": "UNLICENSED",
  "keywords": ["..."]
}
```

### SKILL.md frontmatter
```yaml
---
description: "Single-sentence description for Claude auto-discovery (REQUIRED)"
allowed-tools: Read Bash Grep Glob   # space-separated string, NOT array
disable-model-invocation: false      # default false (Claude can auto-invoke)
user-invocable: true                  # default true (user can invoke via /name)
---
```

**WARNING**: omit `name:` field per Issue #22063 — name field bypasses plugin namespace.

### commands/<name>.md frontmatter
```yaml
---
description: "..."
argument-hint: [optional-arg]
allowed-tools: Read Bash
---

> Copyright © 2026 Luke SteelWolf

Command body / prompt content here.
Reference $1 for first argument.
```

### hooks.json
```json
{
  "hooks": {
    "SessionStart": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "bash ${CLAUDE_PLUGIN_ROOT}/hooks/<script>.sh",
        "timeout": 30
      }]
    }],
    "SessionEnd": [...],
    "UserPromptSubmit": [...]
  }
}
```

## CI validation

GitHub Actions runs on every push:
- `.github/workflows/skill-schema-validate.yml` — validates SKILL.md frontmatter
- `.github/workflows/plugin-schema-validate.yml` — validates plugin.json + marketplace.json

## Naming conventions

- Plugin name: `kebab-case` (no spaces, lowercase)
- Skill folder: matches concept (e.g., `start`, not `swe-start` since plugin namespace adds `swe:`)
- Slash command: invocation `/<plugin>:<skill-or-command>`
- Hook scripts: `<event>-<purpose>.sh` (e.g., `session-start.sh`)

## LL-Empire binding

All Empire plugins must reference LL-Empire bindings where applicable:
- LL-002 PROTOCOLLO GO
- LL-008 Verifica empirica
- LL-018 Atomic commit
- LL-019 V1 parity verify
- LL-023 Pull-first
- LL-024 Sandbox stale → CMD Windows autoritativo

See `hub/steelwolf-empire-hub/LESSONS_LEARNED.md` (private repo) per full list.

## Versioning

Semver per plugin: MAJOR.MINOR.PATCH
- MAJOR: breaking changes (slash command rename, schema breaking)
- MINOR: new features (new skill, new command)
- PATCH: bug fixes, doc updates

Update `plugin.json` version + `CHANGELOG.md` entry per release.

## Contributing

This is an Empire-owned marketplace. External contributions NOT accepted (see LICENSE). Bug reports welcome via Issues.
