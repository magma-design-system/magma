"""Shared settings for the skill scripts: config.json + where the Magma checkout is."""
import json, os

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_config():
    with open(os.path.join(SKILL_DIR, 'config.json'), encoding='utf-8') as f:
        return json.load(f)


def _is_stencil(path):
    return bool(path) and os.path.isfile(os.path.join(path, 'magma.api.txt'))


def find_stencil():
    """Return (path, how) for Magma's projects/stencil, or (None, tried)."""
    cfg = load_config()
    tried = []
    candidates = [
        ('env MAGMA_STENCIL', os.environ.get('MAGMA_STENCIL') and os.path.expanduser(os.environ['MAGMA_STENCIL'])),
        ('config.json magmaStencil', cfg.get('magmaStencil') and os.path.expanduser(cfg['magmaStencil'])),
    ]
    # the skill may live inside the Magma repo (.claude/skills/...) or be run from inside it
    for start in (SKILL_DIR, os.getcwd()):
        d = start
        while d and d != os.path.dirname(d):
            candidates.append(('repo containing ' + start, os.path.join(d, 'projects', 'stencil')))
            d = os.path.dirname(d)
    candidates.append(('default ~/magma', os.path.expanduser('~/magma/projects/stencil')))
    for how, path in candidates:
        if not path:
            continue
        if _is_stencil(path):
            return os.path.abspath(path), how
        if how.startswith(('env', 'config', 'default')):
            tried.append(f'{how}: {path}')
    return None, tried
