# Figma Plugin API gotchas seen in this library

- **`description` reads back HTML-escaped** (components and variables): a stored `<` or `"` reads as `&lt;`/`&quot;`. That is not a bug in the text. Text that really stores an entity reads as `&amp;quot;`. Check for stored entities with `/&amp;(amp|quot|lt|gt|#39|apos|nbsp);/`, or read `descriptionMarkdown`. Write descriptions as plain text; never pre-escape.
- **`setPluginData` is not supported** in the MCP runtime: use `setSharedPluginData('magma.qa', key, value)`.
- **Renaming keeps instances**: `set.editComponentProperty(key, {name})` for any property (variant properties too). To rename a variant **value**, rename the variant children (`controlsIcon=operator` → `controlsIcon=arithmetic` in each child's name). Instance values survive both. Deleting and recreating a set detaches every instance in consumer files: never do it on a published set.
- **`setProperties` with a non-existent combination throws** `Unable to find a variant with those property values`. That is how sparse matrices show up in QA.
- **Fonts**: load every font a text node uses before touching it, including `appendChild`. Library text uses the families behind the text styles (Titillium Web, Karla, Merriweather, Roboto, Roboto Mono…); collect them with `getRangeAllFontNames`.
- **`figma.createAutoLayout()` frames clip by default**: set `clipsContent = false`, or focus rings and shadows look cut.
- **Render-hash comparisons give false KOs** when the same component renders at a different width (Input alone 320 vs inside Input Field 360). Compare resolved colours / bound variables instead of pixels.
- **Radius Round mode**: corner smoothing cannot be bound to a variable, so Round corners stay smoothed and look softer than the CSS `border-radius`. Known, not a KO.
- **Primary = secondary** on some actions and Toast `primary/ai/dark` falling back to the dark default match the code. Not KOs.
- **Search pollution**: `search_design_system` also returns old Magma libraries. Scope it with `includeLibraryKeys` (from `get_libraries`) on the Magma Design System 2 key.
- **Page context resets every call**: `await figma.setCurrentPageAsync(page)` once per script; reach other pages' nodes with `getNodeByIdAsync`.
- **Big loops across all pages** (every variant of the library) take ~20 s; keep them read-only and return compact strings.
- **`resize()` resets sizing to FIXED**: after resizing an auto-layout frame (or a component set), set `primaryAxisSizingMode`/`counterAxisSizingMode = 'AUTO'` again, or it stays at the height you passed (a set ended up 10 px tall).
- **`swapComponent` keeps the old overrides** (fills, sizes, nested positions) of the previous main component: call `resetOverrides()` afterwards, re-apply only the content (text, nested props), then `resize()` to the new main component's width/height.
- **`combineAsVariants` can offset children** inside each variant (a nested avatar moved to 26,26): check `x`/`y` of the children of the new variants and put them back.
- **Tab `item 4` is on by default** in the library Tab: turn it off when the code shows fewer items.
- **Deleting library components** is blocked by Claude Code's auto mode as a destructive action: ask the user, then delete.
- **Text copied from other components** may carry bound font variables but no text style: apply the text style (`setRangeTextStyleIdAsync` for mixed label + value).
