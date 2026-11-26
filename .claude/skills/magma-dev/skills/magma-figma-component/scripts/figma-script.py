#!/usr/bin/env python3
"""Print a ready-to-run use_figma script. Pass the output as `code` to use_figma, unchanged,
with fileKey = figmaFileKey from config.json.

  python3 scripts/figma-script.py check <set-id>=<mds-tag> [<set-id>=<mds-tag> …]
      read-only QA: props vs code, token binding (linter), overflow, description
  python3 scripts/figma-script.py card <set-id> [<set-id> …]
      (re)build the QA cards on the QA page and re-count the summary
  python3 scripts/figma-script.py tokens <mds-tag> [extra CSS expression …]
      read-only: Figma variables / text styles for every token the component's CSS uses

Set ids look like 2448:3705 (a component set, or a standalone component).
"""
import json, os, re, sys
from magma_paths import SKILL_DIR, find_stencil, load_config
from magma_api import api_for, load_api
from magma_css import component_css, literal_lengths, rules, token_exprs

TEMPLATES = os.path.join(SKILL_DIR, 'scripts', 'templates')
ID = re.compile(r'^\d+:\d+$')


def render(name, config_js):
    with open(os.path.join(TEMPLATES, name), encoding='utf-8') as f:
        src = f.read()
    return src.replace('/*__CONFIG__*/', config_js, 1)


def fail(msg):
    sys.exit(f'error: {msg}\n\n{__doc__}')


def main(argv):
    if len(argv) < 2:
        fail('missing command or arguments')
    cmd, args = argv[0], argv[1:]
    cfg = load_config()

    if cmd == 'check':
        runs = []
        for a in args:
            if '=' not in a:
                fail(f'"{a}": use <set-id>=<mds-tag>, e.g. 2448:276=mds-card-media')
            sid, tag = a.split('=', 1)
            if not ID.match(sid):
                fail(f'"{sid}" is not a node id like 2448:276')
            runs.append({'id': sid, 'api': api_for(tag)})
        print(render('qa-check.js', 'const RUNS = ' + json.dumps(runs, ensure_ascii=False) + ';'))

    elif cmd == 'card':
        bad = [a for a in args if not ID.match(a)]
        if bad:
            fail(f'not node ids: {bad}')
        print(render('qa-card.js', f'const SET_IDS = {json.dumps(args)};\nconst QA_PAGE = {json.dumps(cfg["qaPage"], ensure_ascii=False)};'))

    elif cmd == 'tokens':
        tag, extra = args[0], args[1:]
        stencil, _ = find_stencil()
        files = component_css(stencil, tag) if stencil else []
        exprs, lengths = [], []
        if files:
            # <tag>.css and every file it @imports (variant, tone, pref sheets)
            rs = [r for _, text in files for r in rules(text)]
            exprs = token_exprs(rs)
            lengths = sorted({float(n) for _, n in literal_lengths(rs)})
        else:
            print(f'// note: no CSS for {tag} in the Magma checkout — only the extra expressions are looked up', file=sys.stderr)
        exprs += extra
        exprs = list(dict.fromkeys(exprs))  # unique, in order
        comps, _ = load_api()
        typo = comps.get(tag, {}).get('props', {}).get('typography', {}).get('values') or []
        print(render('token-lookup.js', f'const CSS = {json.dumps(exprs)};\nconst LENGTHS = {json.dumps(lengths)};\nconst TYPOGRAPHY = {json.dumps(typo)};'))

    else:
        fail(f'unknown command "{cmd}"')


main(sys.argv[1:])
