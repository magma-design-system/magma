"""Read a Magma component's CSS the way the browser sees it: <tag>.css plus every file it
@imports (css/<tag>-variant-*.css, css/<tag>-pref-*.css …), with nesting resolved.

  component_css(stencil, tag) -> [(relative file, css text)]
  rules(css) -> [(selector, property, value)]   comments stripped, nested `&` selectors joined
  declared_vars(rules) -> {custom properties the component itself defines}
  token_exprs(rules) -> library token expressions used as values, e.g. rgb(var(--label-red-04))
  literal_lengths(rules) -> [(property, '1px')] borders/outlines written as a number, not a token
"""
import os
import re

IMPORT = re.compile(r"@import\s+['\"]([^'\"]+)['\"]\s*;")


def component_css(stencil, tag):
    root = os.path.join(stencil, 'src', 'components', tag)
    out, seen = [], set()

    def visit(path):
        path = os.path.normpath(path)
        if path in seen or not os.path.isfile(path):
            return
        seen.add(path)
        text = open(path, encoding='utf-8').read()
        out.append((os.path.relpath(path, root), text))
        for rel in IMPORT.findall(text):
            visit(os.path.join(os.path.dirname(path), rel))

    visit(os.path.join(root, tag + '.css'))
    return out


def _join(parent, sel):
    sel = sel.strip()
    if not parent:
        return sel
    if '&' in sel:
        # `:host([v='x']) { &:host([t='y']) }` means both attributes on the host
        if parent.startswith(':host') and sel.startswith('&:host'):
            return parent + ' + ' + sel[1:]
        return sel.replace('&', parent)
    return parent + ' ' + sel


def rules(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = IMPORT.sub('', css)
    out, stack, buf = [], [], ''
    for ch in css:
        if ch == '{':
            stack.append(_join(stack[-1] if stack else '', buf))
            buf = ''
        elif ch == '}':
            _decl(buf, stack, out)
            buf = ''
            if stack:
                stack.pop()
        elif ch == ';':
            _decl(buf, stack, out)
            buf = ''
        else:
            buf += ch
    return out


def _decl(buf, stack, out):
    buf = buf.strip()
    if not stack or ':' not in buf or buf.startswith('@'):
        return
    prop, value = buf.split(':', 1)
    prop = prop.strip()
    if re.match(r'^[\w-]+$', prop):
        out.append((stack[-1], prop, ' '.join(value.split())))


def declared_vars(rs):
    return {p for _, p, _ in rs if p.startswith('--')}


TOKEN = re.compile(r'rgba?\(var\(--[\w-]+\)(?:\s*/\s*[\d.%]+)?\)|var\(--[\w-]+\)|--spacing\([^)]*\)')


def token_exprs(rs):
    own = declared_vars(rs)
    seen = []
    for _, _, value in rs:
        for e in TOKEN.findall(value):
            name = re.search(r'--[\w-]+', e).group(0)
            if name in own or name.startswith('--private-'):
                continue  # defined by the component itself: its own values are listed instead
            if e not in seen:
                seen.append(e)
    return seen


def literal_lengths(rs):
    out = []
    for _, prop, value in rs:
        is_width = re.search(r'border|outline|stroke', prop) and 'width' in prop
        if is_width or prop in ('border', 'outline'):
            for n in re.findall(r'(?<![\w(-])(\d+(?:\.\d+)?)px', value):
                if (prop, n) not in out:
                    out.append((prop, n))
    return out
