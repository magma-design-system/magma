"""Parse Magma's magma.api.txt (lines like `mds-tag prop name: type = default`).

Contract: projects/stencil/SPEC.md, "Public API snapshot" (entry `magma.api.txt` in docs/CONTRACTS.md).
"""
import os, re, sys
from magma_paths import find_stencil


def _classify(typ):
    values = re.findall(r'"([^"]+)"', typ)
    if values:
        return 'enum', values
    base = typ.replace('| undefined', '').strip()
    if base == 'boolean':
        return 'boolean', ['false', 'true']
    if base == 'number':
        return 'number', None
    return 'string', None


def load_api():
    stencil, tried = find_stencil()
    if not stencil:
        sys.exit('Magma checkout not found — run scripts/doctor.py. Tried: ' + '; '.join(tried))
    api_file = os.path.join(stencil, 'magma.api.txt')
    comps = {}
    for line in open(api_file, encoding='utf-8'):
        if line.startswith('#') or not line.strip():
            continue
        m = re.match(r'(mds-[\w-]+) (\w+) (.*)', line.rstrip())
        if not m:
            continue
        tag, kind, rest = m.groups()
        d = comps.setdefault(tag, {'props': {}, 'slots': [], 'events': [], 'css': []})
        if kind == 'prop':
            pm = re.match(r'(\w+)(?: \(attr [\w-]+\))?(?: \[[^\]]*\])?: (.*?)(?: = (.*))?$', rest)
            if pm:
                name, typ, default = pm.groups()
                k, values = _classify(typ)
                d['props'][name] = {'type': typ, 'kind': k, 'values': values,
                                    'default': default.strip().strip("'\"") if default else None}
        elif kind in ('slot', 'event', 'css'):
            d[kind + 's' if kind != 'css' else 'css'].append(rest)
    return comps, api_file


def api_for(tag):
    """The compact block qa-check needs: {"tag", "props": {name: {kind, values, default}}}."""
    comps, api_file = load_api()
    if tag not in comps:
        near = [t for t in comps if tag.replace('mds-', '') in t]
        sys.exit(f'{tag} is not in {api_file}. Similar: {", ".join(near) or "none"}')
    return {'tag': tag, 'props': {n: {k: p[k] for k in ('kind', 'values', 'default')}
                                  for n, p in comps[tag]['props'].items()}}
