<!--
  Claude Code reads CLAUDE.md, and falls back to AGENTS.md only when no CLAUDE.md exists. This
  file loads the root AGENTS.md once, through the import below, and by existing it stops Claude
  Code from loading the AGENTS.md files the build generates for consumer projects (the install
  guides of projects/stencil, projects/stencil-react and projects/stencil-angular/magma-angular,
  and the per-component ones in dist) whenever it reads a file in their folders (#1135).
  The instructions live in AGENTS.md, for every agent: edit that file, not this one.
-->
@AGENTS.md
