#!/usr/bin/env bash
# SteelWolf Empire — Pre-commit validation hook
# Copyright © 2026 Luke SteelWolf — All Rights Reserved
#
# Run before every commit to validate schema. Setup as Git hook:
#   git config core.hooksPath scripts/git-hooks
# OR run manually: bash scripts/pre-commit-validate.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "=== SteelWolf Empire — Pre-commit Schema Validation ==="
echo ""

# Check Python + jsonschema available
if ! command -v python3 >/dev/null 2>&1; then
    echo "ERROR: python3 not found. Install Python 3.11+ to run validation."
    exit 1
fi

python3 -c "import yaml, json, jsonschema" 2>/dev/null || {
    echo "WARNING: pyyaml or jsonschema not installed."
    echo "Install: pip install pyyaml jsonschema --break-system-packages"
    exit 0  # don't block commit, just warn
}

ERRORS=0

# Validate SKILL.md
echo "1/3 Validating SKILL.md frontmatter..."
SKILL_FILES=$(find plugins -path '*/skills/*/SKILL.md' 2>/dev/null || true)
if [ -n "$SKILL_FILES" ]; then
    for f in $SKILL_FILES; do
        python3 << PYEOF || ERRORS=$((ERRORS + 1))
import yaml, json, sys
from jsonschema import validate, ValidationError

schema = json.load(open('schemas/skill-schema.json'))
content = open('$f').read()
if not content.startswith('---'):
    print(f"  FAIL $f: no frontmatter")
    sys.exit(1)
parts = content.split('---', 2)
if len(parts) < 3:
    print(f"  FAIL $f: malformed frontmatter")
    sys.exit(1)
fm = yaml.safe_load(parts[1])
if 'name' in fm:
    print(f"  FAIL $f: 'name' field forbidden (Issue #22063)")
    sys.exit(1)
try:
    validate(instance=fm, schema=schema)
    print(f"  OK   $f")
except ValidationError as e:
    print(f"  FAIL $f: {e.message}")
    sys.exit(1)
PYEOF
    done
fi

# Validate plugin.json
echo ""
echo "2/3 Validating plugin.json..."
PLUGIN_JSONS=$(find plugins -path '*/.claude-plugin/plugin.json' 2>/dev/null || true)
if [ -n "$PLUGIN_JSONS" ]; then
    for f in $PLUGIN_JSONS; do
        python3 -c "
import json
from jsonschema import validate, ValidationError
schema = json.load(open('schemas/plugin-schema.json'))
data = json.load(open('$f'))
try:
    validate(instance=data, schema=schema)
    print('  OK   $f')
except ValidationError as e:
    print(f'  FAIL $f: {e.message}')
    exit(1)
" || ERRORS=$((ERRORS + 1))
    done
fi

# Validate marketplace.json
echo ""
echo "3/3 Validating marketplace.json..."
if [ -f .claude-plugin/marketplace.json ]; then
    python3 -c "
import json
from jsonschema import validate, ValidationError
schema = json.load(open('schemas/marketplace-schema.json'))
data = json.load(open('.claude-plugin/marketplace.json'))
try:
    validate(instance=data, schema=schema)
    print('  OK   .claude-plugin/marketplace.json')
except ValidationError as e:
    print(f'  FAIL: {e.message}')
    exit(1)
" || ERRORS=$((ERRORS + 1))
fi

echo ""
if [ "$ERRORS" -gt 0 ]; then
    echo "=== VALIDATION FAILED ($ERRORS errors) ==="
    exit 1
fi
echo "=== ALL VALIDATIONS PASSED ==="
exit 0
