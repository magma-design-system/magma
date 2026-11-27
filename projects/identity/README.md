# Maggioli Design System

#### identity


This repo holds Maggioli identity assets in various formats: **SVG**, **PNG**, **WebP** and **PDF**.
The rasters come in several widths (`-256w`, `-512w`, `-1024w`); the WebP files are lossless,
so they show the same pixels as the PNG files at about half the size. `dist/directory-tree.json`
lists every file.

##### Architecture

The artworks and the facts written next to them (`identity.meta.json`) make the build: the
rasters, the PDF and the catalogue, with checks that every file belongs to a family. The stencil
build takes the Magma mark from it, as the icon of the MCP server.

```mermaid
flowchart LR
  subgraph id["identity"]
    RES["resources/<br/>the SVG artworks, per owner"]
    META["identity.meta.json<br/>owners, families, lines"]
    BUILD["scripts/<br/>manifest, assets, check.signatures, dir-tree"]
    RES --> BUILD
    META --> BUILD
  end
  BUILD -->|"dist/internal/magma-design-system/logo-magma.svg"| WC["stencil<br/>build-lint.ts: the icon of the MCP server"]
  BUILD -->|"logo-magma.svg, logo-magma-white.svg: the logo of the bar"| STU["studio"]
  BUILD -.->|"SVG, PNG, WebP, PDF"| APP(["products and sites"])
  BUILD -.->|"dist/identity.json, dist/directory-tree.json"| TOOLS(["tools that list the artworks"])
  class RES,META,BUILD assets
  class STU visual
  class WC components
  class APP,TOOLS outside
  class id area
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
npm install @maggioli-design-system/identity@latest
```

##### License and trademarks

The files of this package are MIT, like the rest of the repository, except as each family
declares in the `rights` field of `dist/identity.json`:

- `trademark`: the logos and avatars of Gruppo Maggioli, Maggioli Editore and Maggioli Academy,
  and the logo of iLibro intelligente, are trademarks of Maggioli S.p.A. (Gruppo Maggioli,
  Maggioli Editore and Maggioli Academy are registered). The MIT License covers the files, not
  the marks.
- `proprietary`: the illustration Contenuti aggiuntivi belongs to Maggioli S.p.A., all rights
  reserved.
- `mit`: the marks of Magma and of R&D, internal graphics, like the code.

The companies of the Maggioli Group, and those working for them, may use the first two in the
products, sites and materials of the Group; any other use needs the permission of Maggioli
S.p.A. The text that applies: [LICENSE](LICENSE).

##### What each artwork is: `dist/identity.json`

The file names lose accents, case and punctuation, and say nothing about which files belong
together. `dist/identity.json` says it, with one entry per family of artworks (all the variants
of one brand):

```json
{
  "assets": [
    {
      "id": "ilibro-intelligente",
      "name": "iLibro intelligente",
      "kind": "logo",
      "group": "products",
      "owner": { "id": "maggioli-editore", "name": "Maggioli Editore" },
      "rights": "trademark",
      "variants": [
        {
          "path": "products/maggioli-editore/ilibro/logo-intelligente-white",
          "form": "logo",
          "color": "white",
          "background": "dark",
          "width": 220,
          "height": 77
        }
      ],
      "formats": { "svg": true, "pdf": true, "png": [256, 512, 1024], "webp": [256, 512, 1024] }
    }
  ]
}
```

- `name`: as the artwork writes it (`iLibro intelligente`, `R&D Days`).
- `kind`: `logo`, `avatar` or `illustration`. `group` is the folder of `dist/`.
- `line`: the product line, when the family belongs to one (`{ "id": "...", "name": "..." }`);
  no family has one today.
- `rights`: `trademark`, `proprietary` or `mit`, as the [License](#license-and-trademarks)
  section above says.
- `variants[].path`: the file in `dist/` without its extension: add `.svg`, `.pdf`,
  `-<width>w.png` or `-<width>w.webp` with a width of `formats`.
- `variants[].form`, for logos only: `logo`, `bordered` or `symbol` (without the name).
- `variants[].background`: the background the variant is drawn for, `light`, `dark` or `any`.
- `variants[].width` / `height`: from the `viewBox`, to reserve the space before the image loads.

Descriptions and usage rules (clear space, minimum size) are not in it yet: they have to come
from the brand guidelines.

##### Adding an artwork

The facts no file name carries are written by hand next to the artworks, one
`identity.meta.json` per owner folder of `resources/` (and one in `resources/avatar/`): the
owner, the families with their names, rights and files, the product lines. Add the new SVG to
the `files` of its family, or a new family, in the meta file of its folder. A file whose name
does not say its form, colour or background can be listed as
`{ "file": "...", "form": "...", "color": "...", "background": "..." }`. A new family declares
its `rights`, as Maggioli decides them: a mark of the Group is `trademark`, an artwork that is
not open source `proprietary`; name it in the [License](#license-and-trademarks) section above
too.

The build (`nx run identity:build`) fails on an SVG that no family lists, on a listed file that
does not exist, on a family id used twice, on an owner or a line nobody defines, and on a family
without `rights`.

