# Maggioli Design System

#### svg-icons

The SVG artwork of the Maggioli Design System. Consumed by
`@maggioli-design-system/magma` (the `mds-icon` web component reads these files at runtime) and by
`@maggioli-design-system/icons`, which turns a curated subset of them into an icon font.

##### Architecture

The file name of each SVG is its slug. The build optimises the files and lists the slugs; the
font, the components and the MCP server read them, and a consumer app serves the files to
`mds-icon`.

```mermaid
flowchart LR
  subgraph si["svg-icons"]
    SRC["svg/<br/>one file per slug"]
    SVGO["svgo<br/>dist/svg"]
    DICT["scripts/iconsauce.ts<br/>dist/iconsauce.json"]
    SRC --> SVGO
    SRC --> DICT
  end
  SVGO -->|"dist/svg, group maggioli"| IC["icons<br/>the font"]
  DICT -->|"dist/iconsauce.json"| WC["stencil<br/>build.icons, Storybook"]
  SVGO -.->|"dist/svg, served by the app at its icon path"| ICON["mds-icon<br/>fetches path + slug.svg"]
  SVGO -.->|"dist/svg"| MCP["mcp<br/>find_icon"]
  class MCP ai
  class SRC,SVGO,DICT,IC assets
  class WC,ICON components
  class si area
  classDef ai fill:#efe5ff,stroke:#8250df,color:#3e1f79
  classDef assets fill:#fff1d6,stroke:#bf8700,color:#5c3d00
  classDef visual fill:#dcf5ec,stroke:#1a7f64,color:#0b4a3a
  classDef components fill:#ddf0ff,stroke:#0969da,color:#0a3069
  classDef tooling fill:#eceff3,stroke:#57606a,color:#24292f
  classDef outside fill:#ffffff,stroke:#8c959f,color:#24292f
  classDef area fill:none,stroke:#8c959f
```

Rectangles: this repository; rounded boxes: outside it. Solid arrows: inside the repository;
dashed: where the package is installed. Labels: the file, export or command that crosses.
Colours: purple ai, amber assets, teal visual, blue components, grey tooling, white outside
([convention](../../docs/ARCHITECTURE.md#diagrams-of-the-projects)).

##### Installation

```
npm install @maggioli-design-system/svg-icons@latest
```

##### Adding an icon

Drop the optimised file into [`svg/`](svg). The filename is the public slug and must match
`^[a-z0-9-]+\.svg$` — the build fails otherwise.

An icon added here is **not** automatically part of the icon font: it also needs an entry in
`projects/icons/dictionary.json`. See [`projects/icons/SPEC.md`](../icons/SPEC.md) for the full
flow, and run `nx run icons:check.dictionary` to verify the two stay in sync.

##### Build

```
nx run svg-icons:build
```

Outputs optimised SVGs in `dist/svg/` and the slug dictionary `dist/iconsauce.json`.
