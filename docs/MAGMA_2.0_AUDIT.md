# Magma 2.0 Pre-Publish Audit

This report covers two review passes over the Magma component library ahead of the 2.0 publish: (1) named slots that should become label-style props, and (2) component behaviors that modern baseline native CSS/HTML features could now own. All items below are RECOMMENDATIONS; no component code was changed during this review.

## 1. Useless slots that should be props

The following default slots carry only plain text and duplicate (or could be replaced by) a label-style prop. Each row is one slot finding.

| Component | Slot | Issue | Recommendation |
| --- | --- | --- | --- |
| mds-badge | default | The default slot only carries a plain text string and is already deprecated by the component's own JSDoc in favor of the `label` prop. It exists purely as a legacy fallback. | Remove the slot entirely once the deprecation period ends; `label` is already the correct API and the component reads slotted text into `label` anyway. |
| mds-benchmark-bar | default | The default slot carries plain text only and is already marked deprecated in the JSDoc in favour of the label prop. It serves no purpose a prop cannot cover. | Remove the default slot entirely in a future major release. The label prop is already the supported path and is reflected as an attribute. |
| mds-breadcrumb | default (on mds-breadcrumb-item) | The default slot on mds-breadcrumb-item is documented as text-only and explicitly warns against HTML elements. The component already has a `label` prop (reflected) that is the preferred and fully supported mechanism for setting the item text. The slot provides no capability beyond what the prop offers. | Deprecate the default slot on mds-breadcrumb-item in favour of the existing `label` prop, which is already the idiomatic form shown in all examples and enforced in the usage docs. |
| mds-breadcrumb-item | default | The default slot only ever carries a plain text string - the same content the `label` prop already accepts. The component's own JSDoc warns against placing HTML or components there. With `label` as the preferred and fully equivalent alternative, this slot provides no additional capability and is a pure fallback. | Deprecate the default slot and require the `label` prop for all text content. Consumers already using the default slot can migrate trivially: `<mds-breadcrumb-item>Testo</mds-breadcrumb-item>` becomes `<mds-breadcrumb-item label="Testo"></mds-breadcrumb-item>`. |
| mds-help | default | The default slot only ever carries a plain text string (the JSDoc comment explicitly prohibits HTML elements or components, and the content is passed directly into mds-tooltip as tooltip body text). A label-style prop would be simpler and more explicit - e.g. `<mds-help label="...">` - matching the convention used by mds-button and other Magma components. | Introduce a `label` prop as the preferred way to pass the tooltip text; keep the slot for backwards compatibility but deprecate it in favour of the prop. |
| mds-input-date-range-preselection | default | The default slot carries only a single plain-text label that is projected into an internal mds-button. A label prop would be simpler and consistent with how mds-button and most other Magma components expose their text. | Replace the default slot with a required label prop passed directly to the internal mds-button, making the API more explicit and eliminating the slot projection indirection. |
| mds-input-range | default | The default slot accepts only plain text and is used solely as the field label. There is no label prop; every consumer must use the slot for a single string. A label prop would be consistent with other Magma input components and allow the same accessible-name derivation without requiring a slot. | Add a label prop (reflected, used for aria-label and the header text) as the preferred path, keeping the default slot as a convenience fallback - matching the pattern used by mds-button and most other interactive Magma components. |
| mds-input-switch | default | The default slot is used exclusively as a plain-text label rendered beside the control. Every example in stories, the description, and the patterns passes a single text string. The component already hides the label region when the slot is empty, which is label-prop behavior. A `label` prop would be more consistent with the rest of the system (e.g. mds-button) and would allow derived `aria-label`/`title` without extra wiring. | Replace the default slot with a `label` prop (string). The component can continue to collapse the label region when `label` is empty or undefined, matching the current slot-empty behavior. |
| mds-label | default | The @slot default JSDoc comment documents a default slot, but the component's render() method contains no `<slot>` element - slotted content is never rendered. The label prop is the only way to set visible text. | Remove the @slot default JSDoc annotation and clarify in documentation that label prop is the sole content mechanism; or add a `<slot>` fallback in render() if plain-text slotting is genuinely intended. |
| mds-list-item | default | The default slot is documented as accepting plain text strings only (HTML elements and components are explicitly discouraged in the JSDoc). It is functionally equivalent to a label prop - every item in real usage passes a single text string. The current API forces consumers to use slot syntax where a simpler label prop (matching mds-button's pattern) would be clearer and less error-prone. | Add a label prop (string, reflects to attribute) as the preferred way to pass item text, mirroring mds-button. Keep the default slot as a convenience fallback but deprecate it for future removal. |
| mds-tab-bar | default (on mds-tab-bar-item) | The default slot accepts plain text only (the component explicitly warns against HTML elements). It renders the text inside mds-text, so there is no structural reason to prefer a slot over a label prop - a label prop would be more consistent with mds-button and other Magma components and would double as aria-label. | Add a label prop to mds-tab-bar-item and keep the slot as a deprecated fallback, matching the mds-button pattern. |
| mds-tab-bar-item | default | The default slot is documented to accept only a plain text string (the tab label). The JSDoc and readme both warn against placing HTML elements there. A label-style prop would make the API more explicit, consistent with mds-button's label prop, and eliminate the possibility of accidentally slotting non-text content. | Replace the default slot with a label prop (e.g. label: string). The prop value would be passed to the inner mds-text, and aria/title derivation would work the same way it does in mds-button. |

### Themes

- Text-only slots duplicating a label prop: most findings are default slots documented as plain-text-only that either already have a `label` prop (mds-badge, mds-benchmark-bar, mds-breadcrumb-item) or should gain one (mds-input-range, mds-input-switch, mds-list-item, mds-tab-bar-item). The slot adds no capability over a string prop.
- mds-button is the reference pattern: nearly every recommendation points at mds-button's `label` prop as the idiomatic Magma convention to converge on, including derived aria-label/title behavior.
- Compound children are the worst offenders: breadcrumb, tab-bar, and list items all push label text through a slot on a sub-part that explicitly warns against HTML - exactly the case a prop handles more safely.
- Documentation drift: mds-label documents a slot that does not exist in render(), showing the JSDoc @slot annotations have diverged from the actual templates and should be audited alongside the API change.

## 2. Native CSS/HTML modernization opportunities

The findings below group component behaviors by the modern baseline native feature that could now own them.

### Native `<details>/<summary>` disclosure

- `mds-accordion` - hand-rolls a button with role=button, aria-expanded, a CSS-animated region, and three custom events to replicate native disclosure; recommendation: delegate the per-item disclosure mechanism to a native `<details>/<summary>` host, keeping only the compound single/multiple/closable coordination layer in JS.
- `mds-accordion-item` - hand-rolls a button with aria-expanded/aria-controls driving a grid-row 0fr-to-1fr animation and reflected `selected` state; recommendation: native `<details>/<summary>` (with ::details-content animation) covers the single-panel case, but the compound orchestration (parent-driven mode, non-closable, sibling events) cannot be replicated natively, so the current approach is justified as a compound sub-part.
- `mds-accordion-timer-item` - hand-rolled button with aria-expanded/aria-controls and a grid-template-rows 0fr-to-1fr animated div; recommendation: delegate disclosure and keyboard toggle to native `<details>/<summary>`, keeping the timer progress bar and auto-advance logic in JS - matching mds-accordion-item.
- `mds-details` - hand-rolls expand/collapse via grid-template-rows transition, a KeyboardManager for Enter/Space, an @State isOpened flag and an @Watch on `opened`; the header is a div with tabindex=0 rather than `<summary>`; recommendation: delegate open/close and keyboard handling to native `<details>/<summary>` (now supporting the name attribute and animatable display), layering Magma theming via ::part() or custom properties and using the native toggle event instead of manual sync.
- `mds-tree` - hand-rolls expand/collapse by toggling CSS classes and listening for transitionend; recommendation: the per-item disclosure maps to `<details>/<summary>`, removing the manual animation wiring, though tree-specific complexity (async expand(), prop cascading, depth tracking, custom toggle icon) must be retained on top.
- `mds-tree-item` - expand/collapse is hand-rolled with class toggles, a transitionend listener, and a setTimeout reading duration from a custom property before emitting mdsTreeItemCollapse; recommendation: delegate the disclosure mechanic to `<details>/<summary>`, but because the compound tree needs coordinated multi-level expand, async loading, icon-swapping, and event emission, a full replacement is not realistic - simplify the animation/hidden-state plumbing via ::details-content (Chrome 131+) once baseline.

### Popover attribute + CSS anchor positioning

- `mds-button-dropdown` - uses a custom mds-dropdown for the menu overlay with its own positioning and open/close logic; recommendation: implement the panel with the native popover attribute and CSS anchor positioning for free top-layer rendering, light-dismiss, and keyboard-dismiss, simplifying the mds-dropdown dependency.
- `mds-dropdown` - uses a FloatingController (Floating UI) computing coordinates in JS on every change/scroll, plus its own outside-click and Escape handlers via KeyboardManager; recommendation: native popover (Baseline 2024) provides top-layer rendering, outside-click dismissal, and Escape handling for free, and CSS Anchor Positioning (Baseline 2025) replaces the JS coordinate math - eliminating FloatingController, KeyboardManager wiring, and the absolute-vs-fixed strategy prop.
- `mds-help` - hand-composes mds-tooltip (Floating UI, strategy=absolute) and manages hover/focus show-hide internally; recommendation: replace with a native `<button popovertarget>` triggering a [popover] element positioned via CSS Anchor Positioning, though Floating UI still offers broader support and autoPlacement collision detection not yet matched by native overflow helpers.
- `mds-input-date` - hand-rolls a calendar overlay using mds-dropdown positioned at placement=bottom-end, toggling dropdownRef.visible in a setTimeout; recommendation: wrap the calendar in a native popover (popover attribute + CSS anchor positioning) for built-in light-dismiss, focus management, and top-layer rendering without the custom dropdown.
- `mds-input-date-range` - calendar dropdown via custom mds-dropdown, visibility toggled by setting dropdownRef.visible in a setTimeout, hard-coded placement; recommendation: native popover + CSS anchor() owns float/placement and show-hide, replacing the mds-dropdown wrapper and the timed visible=false with a popover=auto element and hidePopover().
- `mds-pref-language` - manually manages a showDropdown boolean, toggle handler, and onMdsDropdownHide light-dismiss callback feeding mds-dropdown (interaction=none); recommendation: native popover (Baseline 2024) owns show/hide, light-dismiss, and top-layer stacking, removing the showDropdown state, toggle handler, and hide callback.
- `mds-pref-theme-variant` - hand-rolls show/hide by toggling a showDropdown boolean driving `visible` on mds-dropdown (interaction=none) plus manual toggle and blur/hide handlers; recommendation: express the trigger/visibility with the native popover attribute and CSS anchor positioning, removing the manual toggle state and the mds-dropdown wrapper.
- `mds-radial-menu-item` - conditionally renders an mds-tooltip child (target=.button) for hover labels; recommendation: native popover + CSS anchor positioning could replace mds-tooltip for hover labels, but since mds-tooltip also forwards aria-label and consistent styling, the current approach is reasonable - low priority until anchor positioning is fully baseline.
- `mds-tooltip` - uses a FloatingController (Floating UI) computing position in JS and mouseenter/mouseleave listeners to toggle visibility; recommendation: native anchor() positioning plus the popover attribute and :popover-open could express placement/flip/shift in CSS, and :hover + @starting-style / transition-behavior:allow-discrete could drive the hover trigger, eliminating the JS listeners and Floating UI dependency.

### Native `<dialog>` + `::backdrop`

- `mds-header` - wraps its mobile menu in a hand-rolled mds-modal (position=right) which replicates dialog semantics in JS; recommendation: refactor the mobile side-panel to a native `<dialog>` with position:fixed + inset and a CSS slide-in, letting the browser own focus trapping, Escape handling, and ::backdrop - removing the mds-modal dependency.
- `mds-modal` - implemented as a fixed-position host with a CSS-painted rgba overlay; open/close, animation sequencing, body-scroll lock, and focus management are all hand-rolled in TypeScript; recommendation: migrate the shadow root to a native `<dialog>` (baseline) for top-layer stacking, ::backdrop, focus-trap, Escape dismissal, and showModal()/close(), reducing the animation surface to CSS transitions on the dialog and ::backdrop.
- `mds-radial-menu` - the `backdrop` prop drives a custom Backdrop controller that imperatively attaches/detaches a DOM overlay node; recommendation: a native `<dialog>` (or popover-attributed host) provides ::backdrop natively plus browser focus-trap and dismiss semantics, eliminating the custom DOM insertion.

### Popover attribute (top-layer, no anchor positioning)

- `mds-push-notification` - panel manages its own top-layer placement via position:fixed, a hardcoded z-index token, and a transform toggle keyed on [visible]; recommendation: popover=manual (Baseline 2024) places the panel in the native top layer, removing manual z-index management and stacking-context fragility, with show()/hide() mapping to showPopover()/hidePopover().
- `mds-push-notification-item` - parent manages visibility/stacking via hand-rolled CSS (pointer-events, fixed positioning, z-index); recommendation: promote the notification stack to a top-layer popover, eliminating manual z-index/pointer-events management; user-dismissable items map to popover=manual with the invoker/close-target pattern.
- `mds-status-bar` - internally wraps mds-modal (backdrop=undefined) to get show/hide and positioning for a non-modal pattern, using modal infrastructure for a non-blocking surface; recommendation: replace the mds-modal dependency with a host carrying popover=manual plus position:fixed, removing the dialog-layer indirection and the need to null out backdrop, and making the non-blocking intent explicit.
- `mds-toast` - uses position:fixed on :host with JS-driven visibility (a CSS class toggle), pointer-events toggling, and a timer-managed lifecycle; recommendation: the popover attribute (Baseline 2024) promotes the element to the top layer automatically, popover=manual + showPopover()/hidePopover() drives visibility, and @starting-style replaces the class toggle for entry/exit, removing the JS animation-duration read.

### CSS Anchor Positioning

- `mds-input-tip` - uses position:absolute with hardcoded offsets driven by custom properties plus a transform for the slide animation, relying on a position:relative parent; recommendation: declare anchor-name on the parent input and use anchor() for offsets to make attachment declarative; low priority since the parent already owns layout.
- `mds-notification` - imports @floating-ui/dom and calls computePosition + autoUpdate to apply left/top offsets, tracking the target through scroll/resize in JS; recommendation: CSS Anchor Positioning (anchor(), position-anchor, @position-try) handles this without JS, eliminating the @floating-ui/dom dependency and the autoUpdate overhead.
- `mds-table-row` - uses a ResizeObserver to measure the actions panel and applies inline minWidth/maxWidth and marginRight in JS for sticky-right positioning; recommendation: once CSS Anchor Positioning is fully baseline, replace the sizer+observer pattern with anchor() functions, removing the ResizeObserver and inline style updates.

### CSS Scroll-Driven Animations

- `mds-horizontal-scroll` - translateNavigationDot() listens to scroll in JS and recalculates a translateX on every tick; recommendation: drive the dot via animation-timeline: scroll(inline) in CSS, eliminating the JS scroll listener and the translateNavigationDot/addNavigationDots methods (baseline: Chrome 115+, Firefox 110+, Safari 15.4+).
- `mds-kpi` - mds-kpi-item uses a manual IntersectionObserver to set an isIntersecting flag and conditionally render the yugop animation on viewport entry; recommendation: replace the trigger with a @keyframes animation bound to animation-timeline: view() and animation-range, removing the IntersectionObserver, the @State flag, conditional render branches, and the SSR window check.
- `mds-kpi-item` - manually creates an IntersectionObserver in componentWillLoad and toggles isIntersecting to trigger the yugop animation; recommendation: declare the entrance animation entirely in CSS with @keyframes + animation-timeline: view() (baseline Chrome 115+, Firefox 110+, Safari 18+), mapping the threshold prop to animation-range: entry, removing the observer, the @State flag, and the conditional branches.

### @starting-style and transition-behavior: allow-discrete

- `mds-input-field` - the .message area is always in the DOM, toggling height 0-to-auto (interpolate-size) and opacity via :empty selectors and transitions; recommendation: use @starting-style to declare the entry state declaratively (baseline), keeping the :empty trick only for the exit path.
- `mds-push-notification` - introItem()/outroItem() use nested setTimeout (hardcoded 15ms) to set inline styles and read custom properties at runtime; recommendation: replace JS-driven enter/exit with @starting-style (Baseline 2024) for intro and transition-behavior:allow-discrete for outro - exactly the flicker problem the 15ms setTimeout works around.

### Native `<input>` features

- `mds-input-switch` - the switch type renders a fully custom CSS sliding toggle driven by a hidden checkbox, linked via sibling selectors; recommendation: native `<input type=checkbox role=switch>` now has baseline support and matches the semantics, though full parity with the animated knob still needs custom properties and keyframes.
- `mds-input-otp` - renders N separate mds-input cells and manages focus advancement, paste distribution, and numeric filtering in JS; recommendation: add an opt-in single-field mode rendering one `<input inputmode=numeric autocomplete=one-time-code>` for SMS flows (native OTP autofill, no custom paste/focus management), keeping the multi-cell layout for other contexts.
- `mds-input` - already uses native `field-sizing` for the auto-grow textarea (no change needed); separately, it hides native number spin buttons and hand-rolls steppers with mds-button calling stepUp()/stepDown() - recommendation: if design allows, re-enable native spin buttons styled via ::part(field), removing the custom steppers and the controlsLayout/controlsIcon props (significant API change, recommendation-only).
- `mds-file` - the Host renders as a div with tabindex=0 and an onClick handler, so keyboard activation relies on a click handler on a non-interactive element; recommendation: render inside a `<button>` (or use role=button with a keydown handler) for native Enter/Space activation, aria semantics, and focus management without tabindex wiring.
- `mds-url-view` - declares a `loading` prop (lazy/eager) reflected as an attribute but never passes it to the internal `<iframe>`, so it has no effect; recommendation: pass it through (`<iframe loading={this.loading} />`); the iframe loading attribute is baseline.

### Native table layout

- `mds-price-table-features-row` - componentWillRender() queries cell children and imperatively sets each el.style.width to 100/n%; recommendation: a native `<tr>/<td>` layout distributes columns equally without JS; migrating the row to light-DOM cells, or using CSS grid (grid-template-columns: repeat(auto-fit, 1fr)) on the row host, eliminates the JS width calculation.
- `mds-table-footer` - renders as display:table-row with role=row, recreating what native `<tfoot>` provides plus a border transition; recommendation: native `<tfoot>` could own the role with a single CSS rule, but the component legitimately participates in the Magma private CSS token cascade (--private-cell-border-*); surfacing those tokens via mds-table custom properties would let `<tfoot>` own the role directly.

### Container query font units

- `mds-avatar` - installs the fitty library plus a ResizeObserver to scale initials/count text via JS on every resize; recommendation: the host already sets container-type/container-name, so the .initials-text span could use font-size: cqmin (or a cqi-based clamp()) instead, replacing the JS resize loop with a pure CSS layout pass, removing the fitty dependency, and fixing the known fitty re-init bug.

### prefers-reduced-motion media query

- `mds-pref-animation` - applies pref-animation-* classes to `<html>` and sets a custom property via JS/localStorage, with the system branch deferring to the OS via JS; recommendation: let the system default path rely on @media (prefers-reduced-motion: reduce) in CSS instead of a class toggle, dropping the localStorage read for the default case; the explicit reduce/no-preference override classes must stay.

### radiogroup / role=radio

- `mds-pref-consumption` - renders three consumption options as mds-tab-item children with a click-driven selected boolean (custom mutual exclusion); recommendation: a role=radiogroup container with each item carrying role=radio and aria-checked gives screen readers correct group-and-selection announcement; progressive-enhancement only, since the tab widget is intentional brand styling.

### View Transitions API

- `mds-pref-theme` - injects a full-screen div into document.body, drives its background-color via two nested setTimeout calls, and manages three timers to coordinate the theme-class swap; recommendation: replace with document.startViewTransition(() => setTheme(mode)) (baseline Chrome 111+, Safari 18+, Firefox 130+), which cross-fades the repaint atomically with no injected element or timers, customizable via ::view-transition-old/new(root).

### CSS @property transition (replacing RAF)

- `mds-radial-progress` - runs a requestAnimationFrame loop (easeOutExpo, ~500ms) to drive a registered @property custom property. NOT a defect: the RAF loop is intentional, giving a frame-accurate easeOutExpo curve on progress change that the CSS `transition` on `--mds-radial-progress` alone does not reproduce. Left as-is by design; no change recommended.

### KeyboardManager cleanup (native button equivalence)

- `mds-breadcrumb-item` - componentDidLoad attaches a KeyboardManager to a `.text` element that lives inside the nested mds-button shadow DOM and is inaccessible from the outer component, making it a no-op; the inner mds-button already handles Enter/Space natively; recommendation: remove the KeyboardManager setup entirely as dead code.

### Suggested priority

1. `<dialog>` + `::backdrop` (mds-modal, mds-header, mds-radial-menu) - highest impact: mds-modal is depended on by other components, and native dialog removes the most hand-rolled accessibility code (focus-trap, Escape, scroll-lock) at moderate effort.
2. Popover + CSS anchor positioning (mds-dropdown and its dependents) - high impact: mds-dropdown underpins button-dropdown, input-date, input-date-range, pref-language, and pref-theme-variant, so modernizing it cascades broadly and removes Floating UI; effort is moderate but anchor-positioning baseline timing should be confirmed.
3. Quick correctness/dead-code fixes (mds-url-view loading passthrough, mds-breadcrumb-item KeyboardManager removal) - low effort, immediate wins that also fix real bugs/no-ops. (mds-radial-progress RAF was reviewed and kept - intentional eased animation, not a defect.)
4. Scroll-driven animations and @starting-style (mds-kpi, mds-horizontal-scroll, mds-input-field, mds-push-notification) - medium impact, low-to-moderate effort: removes IntersectionObservers, scroll listeners, and setTimeout hacks with localized CSS changes.
5. Native input semantics (mds-input-switch, mds-input-otp, mds-file, mds-input spin buttons) - mixed: mds-file is a low-effort a11y fix; otp/switch/spin-buttons are larger API changes deferred unless design signs off.
6. View Transitions, container query units, table layout, prefers-reduced-motion, radiogroup, anchor-only refactors (mds-pref-theme, mds-avatar, mds-price-table-features-row, mds-table-footer/row, mds-table-row, mds-input-tip, mds-notification, mds-radial-menu-item, mds-pref-consumption) - localized, lower-priority cleanups to schedule opportunistically.

## 3. Description corrections applied

The following factual corrections were applied to component description docs during the review (slot/native passes also surfaced inline doc fixes, captured here where they were edits to descriptions).

| Component | What was corrected |
| --- | --- |
| mds-button-dropdown | `autoFocus` was missing from the "Shared configuration" bullet - the tsx forwards it to both internal mds-button elements but it was omitted from the list. Added it to match the source. |
| mds-card-content | The description implied mds-card-content exposes --mds-card-gap / --mds-card-padding, but it has no CSS custom properties of its own (gap/padding are hardcoded via --spacing(400)). Changed "responsive behavior, gap, padding" to "responsive behavior, grid layout" to remove the misleading implication. |
| mds-input-upload | The `sort` prop behavior was inverted. The real isSortTabShown() logic is `!!this.sort && this.files.length > 1`, so the tab bar shows only when `sort` IS set and more than one file is present; when omitted, no tab bar shows and the last localStorage preference is applied silently. Corrected to match the implementation. |
| mds-radial-progress | (1) "Icon slot" bullet heading renamed to "Icon prop" - the component has no slots; `icon` is a prop. (2) En-dash in "0-1 ratio" replaced with " - " to comply with the ASCII-only rule. |
| mds-text | The truncate prop description had `word` and `all` swapped. Corrected to: "word forces single-line truncation (no wrapping), all clamps to a multi-line block whose line count is controlled by --mds-text-line-clamp". |

Note: the mds-input pass also recorded a factual inaccuracy for the report only (no file change, as the todo marker was absent): the description and readme JSDoc say the `icon` renders at the trailing/right edge, but the CSS positions it at the leading (left) edge via `left: --spacing(300)` with a corresponding `padding-left` on the input.
