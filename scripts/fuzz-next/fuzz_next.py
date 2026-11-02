"""Confronto differenziale: readNext() del session-gate contro PyYAML safe_load (il parser del roll-up empire_rollup.py).

uso:
  python fuzz_next.py synth  --gate <session-gate.mjs> --seed 701 --n 20000
  python fuzz_next.py status --gate <session-gate.mjs> --seed 201 --n 10000 --status-dir <hub>/_status

synth  = file generati attorno al campo `next`;
status = i file _status reali alterati a caso (1-4 modifiche ciascuno).
Esito atteso (riferimento): PyYAML legge il file come mappa, una sola chiave `next`, stringa che cita S46 a parola intera.
FALSO PASS = il gate dice ok+S46 e il riferimento no; VALORE DIVERSO = entrambi ok ma testo diverso. Exit 1 se ce n'e' anche uno; exit 3 se PyYAML non e' la 6.0.3.
Il workflow del roll-up fissa pyyaml==6.0.3: usare la stessa versione. (c) 2026 Luke SteelWolf. S215, L9.17.
"""
import argparse, collections, glob, json, os, random, re, subprocess, sys, tempfile
import yaml

ap = argparse.ArgumentParser()
ap.add_argument("mode", choices=["synth", "status"])
ap.add_argument("--gate", required=True); ap.add_argument("--seed", type=int, required=True); ap.add_argument("--n", type=int, default=10000)
ap.add_argument("--status-dir"); ap.add_argument("--show", type=int, default=5)
A = ap.parse_args()
if yaml.__version__ != "6.0.3":   # l'oracolo deve essere la versione del roll-up, altrimenti la concordanza non dimostra nulla
    print(f"STOP: PyYAML {yaml.__version__}, il roll-up usa 6.0.3 (pip install pyyaml==6.0.3)", file=sys.stderr)
    sys.exit(3)
random.seed(A.seed)
HERE = os.path.dirname(os.path.abspath(__file__))

ATOMS = ['\\\n  ', '\n  ', '\\\n', 'S46', 'S45', 'S460', 'BA-S46', 'S46a', 'S46-bis', 'prossimo', 'passo', '#', '# S46', ' #x', ':', ': ',
         '"', "'", '\\', '\\x53', '\\"', '\\n', '\\q', '>', '|', '-', '- ', '? ', '*', '&', '[', '{', '%', '@', '  ', '\t', 'é',
         "dell'owner", '""', "''", 'S46:', '#S46', 'S46,', '(S46)', '`', '\x00', '\x01', '\x1b', '\x7f', '\x85', '\x9f', '\ufeff', '\ufffe', '\ud800', '\u2028', '\u2029']
PRE = ['a: "x', "a: 'x", 'a: [x,', 'a: {b: 1,', 'a: "x"', 'a: [x]', 'a: |', 'a: >-', 'a:\n  "x', 'a: x', 'a: b: c', 'a: "x\n  y"', '- a',
       '? a', '---', '...', 'a: &r', 'a: *r', 'a:\n  - "x', 'a: "x" y', 'a: x # "', 'a:\n- x', 'a:\n  b: "x\n y"']

def synth():
    k = random.choice(['plain', 'dq', 'sq', 'blk', 'multi', 'dup', 'nokey', 'after', 'firstcomment', 'prev', 'prev', 'prev'])
    body = ''.join(random.choice(ATOMS) + random.choice(['', ' ']) for _ in range(random.randint(1, 6)))
    if k == 'prev':
        return (random.choice(PRE) + '\n' + random.choice(['', '  z\n', '  "\n']) + 'next: ' +
                ''.join(random.choice(ATOMS) + random.choice(['', ' ']) for _ in range(random.randint(1, 4))) +
                random.choice(['', '"', "'", ']', '}']) + '\n' + random.choice(['', 'b: 1\n', '"\n', ']\n']))
    if k == 'plain': return 'next: ' + body
    if k == 'dq': return 'next: "' + body + '"' + random.choice(['', ' # c', ' x'])
    if k == 'sq': return "next: '" + body + "'" + random.choice(['', ' # c'])
    if k == 'blk': return 'next: ' + random.choice(['>', '|', '>-', '|+', '>2', '|0', '>+-', '> # c']) + '\n' + random.choice(['  ', '   ', ' ']) + body + '\n  ' + random.choice(ATOMS) + '\nblockers: []'
    if k == 'multi': return 'next: ' + body + '\n  ' + random.choice(ATOMS) + ' S46\nblockers: []'
    if k == 'dup': return 'next: S46\nnext: ' + body
    if k == 'after': return 'project: x\nnext: ' + body + '\nstatus: green'
    if k == 'firstcomment': return 'next: # c\n  ' + body + '\nblockers: []'
    return 'project: x\nblockers: []'

NEXTS = ['next: "S4\\\n  6 prossimo"', 'next: "S46\\\n  x"', 'next: "a \\\n  S46 b"', 'next: "S46: prossimo"', 'next: S46 prossimo',
         'next: >-\n  testo\n  S46 fine', "next: 'S46 dell''owner'", 'next:\n  S46 passo', 'next: |\n  S46\n  altro']
MATOMS = ['\\\n  ', '"', "'", '[', ']', '{', '}', '#', ' #', ': ', ':', '- ', '-', '\t', '  ', '\n', '\n  ', '\nnext: S46', '\n  next: S46',
          'S46', '*a', '&a', '!t', '? ', '|', '>', '---', '...', '\\', '\\x53', ',', '%', '\x00', '\x0b', '\x7f', '\x85', '\ud800']
def mutate(t):
    L = t.split('\n')
    for _ in range(random.randint(1, 4)):
        op = random.random(); i = random.randrange(len(L))
        if op < 0.55: p = random.randint(0, len(L[i])); L[i] = L[i][:p] + random.choice(MATOMS) + L[i][p:]
        elif op < 0.65 and L[i]: p = random.randrange(len(L[i])); L[i] = L[i][:p] + L[i][p + 1:]
        elif op < 0.75: L.insert(i, L[i])
        elif op < 0.85: L[i] = random.choice(['', ' ', '  ', '    ']) + L[i].lstrip(' ')
        elif op < 0.92: j = random.randrange(len(L)); L[i], L[j] = L[j], L[i]
        else: L.insert(i, random.choice(['a: "x', 'b: [1,', "c: 'y", '  - "z', 'd: |', 'e: x # "', 'f: *r', '  g: h: i']))
    return '\n'.join(L)

if A.mode == 'synth':
    cases = [synth() for _ in range(A.n)]
else:
    if not A.status_dir: sys.exit("--status-dir obbligatorio in modo status")
    seeds = [open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(A.status_dir, '*.yaml')))
             if not os.path.basename(f).startswith('_')]
    if not seeds: sys.exit("nessun file _status trovato")
    cases = []
    for _ in range(A.n):
        t = re.sub(r'(?m)^next:.*(\n[ \t].*)*', lambda m: random.choice(NEXTS), random.choice(seeds), count=1)
        cases.append(mutate(t) if random.random() < 0.9 else t)

with tempfile.NamedTemporaryFile('w', suffix='.json', delete=False, encoding='utf-8') as f:
    json.dump(cases, f); tmp = f.name
try:
    out = json.loads(subprocess.check_output(['node', os.path.join(HERE, 'read_next.mjs'), A.gate, tmp]))
finally:
    os.unlink(tmp)

norm = lambda x: ' '.join(str(x).split())
tok = re.compile(r'(?:^|[^A-Za-z0-9_-])S46(?![0-9A-Za-z_])')
dup = re.compile(r'(?m)^next[ \t]*:(?=[ \t]|$)')
c = collections.Counter(); bad = []
for t, r in zip(cases, out):
    ref, refpass = None, False
    try:
        y = yaml.safe_load(t)
        if isinstance(y, dict): ref = y.get('next')
        refpass = isinstance(ref, str) and bool(tok.search(' ' + norm(ref))) and len(dup.findall(t)) == 1
    except Exception:
        pass
    gp = r['kind'] == 'ok' and bool(tok.search(' ' + norm(r['value'])))
    if gp and not refpass: c['FALSO PASS'] += 1; bad.append(('FALSO PASS', t, r, ref))
    elif gp and refpass and norm(r['value']) != norm(ref): c['VALORE DIVERSO'] += 1; bad.append(('VALORE DIVERSO', t, r, ref))
    elif refpass and not gp: c['falso STOP'] += 1
    else: c['concordi'] += 1
print(f"{A.mode} seed {A.seed} casi {A.n}: " + ", ".join(f"{k} {c[k]}" for k in ['concordi', 'FALSO PASS', 'VALORE DIVERSO', 'falso STOP']))
for kind, t, r, ref in bad[:A.show]:
    print(f"--- {kind}\n{t}\n    gate: {r}\n    PyYAML next: {ref!r}")
sys.exit(1 if bad else 0)
