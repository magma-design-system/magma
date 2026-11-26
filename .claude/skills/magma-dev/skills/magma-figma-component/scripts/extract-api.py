#!/usr/bin/env python3
"""Print the public API of Magma components from magma.api.txt (props, values, defaults, slots).

Usage: python3 scripts/extract-api.py <mds-tag> [<mds-tag> ...]
The Magma checkout is found automatically (see scripts/doctor.py).
"""
import sys
from magma_api import load_api

if len(sys.argv) < 2:
    sys.exit(__doc__)
comps, api_file = load_api()
for tag in sys.argv[1:]:
    if tag not in comps:
        near = [t for t in comps if tag.replace('mds-', '') in t]
        print(f'!! {tag} not in {api_file}. Similar: {", ".join(near) or "none"}')
        continue
    d = comps[tag]
    print(f'== {tag}  ({len(d["props"])} props, {len(d["slots"])} slots, {len(d["events"])} events, {len(d["css"])} css props)')
    for name, p in d['props'].items():
        vals = '|'.join(p['values']) if p['values'] else p['type']
        print(f'  {name:<20} {p["kind"]:<8} {vals}' + (f'   default {p["default"]}' if p['default'] is not None else ''))
    for s in d['slots']:
        print(f'  slot  {s}')
    for c in d['css']:
        print(f'  css   {c}')
    print()
