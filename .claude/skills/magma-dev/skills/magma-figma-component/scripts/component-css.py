#!/usr/bin/env python3
"""Print a Magma component's CSS state by state: <tag>.css and every file it @imports,
nesting resolved, so `:host([variant='red']) + :host([tone='weak'])` shows its own values.

Usage: python3 scripts/component-css.py <mds-tag> [--vars]
  --vars   only the custom properties (--mds-*, --private-*): the colour/size table per state
The Magma checkout is found automatically (see scripts/doctor.py).
"""
import sys
from magma_paths import find_stencil
from magma_css import component_css, literal_lengths, rules, token_exprs

args = [a for a in sys.argv[1:] if not a.startswith('--')]
only_vars = '--vars' in sys.argv
if not args:
    sys.exit(__doc__)
stencil, _ = find_stencil()
if not stencil:
    sys.exit('Magma checkout not found: run scripts/doctor.py')
tag = args[0]
files = component_css(stencil, tag)
if not files:
    sys.exit(f'no CSS for {tag} in {stencil}/src/components/{tag}')
allrules = []
for name, text in files:
    rs = rules(text)
    allrules += rs
    shown = [r for r in rs if not only_vars or r[1].startswith('--')]
    if not shown:
        continue
    print(f'== {name}')
    last = None
    for sel, prop, value in shown:
        if sel != last:
            print(f'  {sel}')
            last = sel
        print(f'      {prop}: {value}')
print('\n== library tokens used (look them up with `figma-script.py tokens`)')
for e in token_exprs(allrules):
    print(f'  {e}')
lens = literal_lengths(allrules)
if lens:
    print('\n== borders/outlines written as numbers, not tokens (bind to the Size variable with that value, say so in the description)')
    for prop, n in lens:
        print(f'  {prop}: {n}px')
