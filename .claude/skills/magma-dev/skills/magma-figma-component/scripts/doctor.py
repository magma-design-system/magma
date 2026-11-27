#!/usr/bin/env python3
"""Step 0: check that this machine can run the skill. Prints OK / FIX lines.

Usage: python3 scripts/doctor.py
Exit code 1 if something must be fixed before starting.
"""
import datetime, os, subprocess, sys
from magma_paths import find_stencil, load_config

cfg = load_config()
fail = False
print(f'Figma library : {cfg["figmaFileName"]} (file key {cfg["figmaFileKey"]})')

stencil, how = find_stencil()
if not stencil:
    fail = True
    print('FIX  Magma checkout not found. Tried:')
    for t in how:
        print('       ' + t)
    print('     Clone the Magma repo, then set MAGMA_STENCIL=<repo>/projects/stencil '
          'or "magmaStencil" in config.json.')
else:
    print(f'OK   Magma code: {stencil}  (found via {how})')
    repo = os.path.dirname(os.path.dirname(stencil))
    try:
        ts = subprocess.run(['git', '-C', repo, 'log', '-1', '--format=%ct|%h %s'],
                            capture_output=True, text=True, timeout=10).stdout.strip()
        when, subject = ts.split('|', 1)
        date = datetime.datetime.fromtimestamp(int(when))
        age = (datetime.datetime.now() - date).days
        branch = subprocess.run(['git', '-C', repo, 'rev-parse', '--abbrev-ref', 'HEAD'],
                                capture_output=True, text=True, timeout=10).stdout.strip()
        line = f'Magma checkout: branch {branch}, last commit {date:%Y-%m-%d} ({age} days ago): {subject}'
        if age > cfg.get('staleAfterDays', 14):
            print(f'WARN {line}\n     Older than {cfg["staleAfterDays"]} days: run `git pull` in {repo} '
                  'or tell the user the code may be out of date.')
        else:
            print(f'OK   {line}')
    except Exception as e:  # not a git checkout, git missing…
        print(f'WARN could not read the checkout date ({e})')

print('\nStill to check from Claude (not from this script):')
print('  - the Figma plugin tools are available (use_figma, get_screenshot) and the skills')
print('    figma-use + figma-generate-library load;')
print(f'  - whoami works and the user can edit file {cfg["figmaFileKey"]}.')
sys.exit(1 if fail else 0)
