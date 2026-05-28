The `<mds-button>` web component is the primary interactive action control of the Magma Design System. It renders as a button by default and switches to a hyperlink when `href` is set, handling form association, accessibility, loading state, and iconography natively.

## Semantic Behavior

- **Button vs. link**: Renders with `role="button"` by default. Providing `href` switches the element to anchor behavior and honors `target` (`self` | `blank`) for window context.
- **Form association**: `formAssociated: true`. Inside a `<form>` the component natively triggers submission (`type="submit"`) or reset (`type="reset"`) with no extra wiring.
- **Active state**: Mirrors a visual pressed state through the `active` attribute, safe to drive from CSS attribute selectors.
- **Disabled state**: Setting `disabled` blocks pointer and keyboard activation and removes the host from the tab sequence.
- **Await state**: Setting `await` renders an inline `<mds-spinner>`, intercepts click and key activation, and reflects `aria-busy="true"` for assistive tech.
- **Accessibility**: Derives `aria-label` and `title` from the `label` prop or slotted text. Icon-only buttons require an explicit `aria-label` because no text source is available.

## Properties & Visual Configurations

- **`variant`**: Color role the button communicates. Pick by meaning, not by aesthetic.
  - Brand (`primary`, `secondary`, `ai`): main calls to action and AI-driven affordances.
  - Status (`success`, `warning`, `error`, `info`): outcome and validation communication.
  - Luminance (`dark`, `light`): neutral chrome for use over light or dark surfaces.
  - Identity (`google`, `apple`): SSO entry points only.
- **`tone`**: Visual weight, independent of `variant`. Express importance by combining the same `variant` with a different `tone` rather than overriding colors.
  - `strong`: solid filled background - highest emphasis.
  - `weak`: subtle tinted background - medium emphasis.
  - `outline`: bordered, no fill - medium-low emphasis.
  - `text`: no border, no background - lowest emphasis, fits inside running text.
  - `box`: high-contrast boxed container for chrome-like placements.
- **`size`**: Drives padding, font size, and minimum hit area. One of `sm`, `md` (default), `lg`, `xl`. Do not override sizing via inline `width` / `height`.
- **`icon`** / **`iconPosition`**: `icon` is an SVG filename slug from the Magma icon library; `iconPosition` (`left` default, `right`) places the glyph relative to the label.
- **`truncate`**: Long-label overflow strategy. `word` (default) breaks on word boundaries, `all` breaks on any character, `none` disables truncation and lets the label overflow.
- **`animation`**: Text entry animation. `none` (default) renders immediately; `yugop` progressively reveals characters.
- **`type`**: Native form button type. Defaults to `submit`; set to `button` for non-submitting actions inside a `<form>`, or `reset` for native form reset.
- **`target`**: Effective only when `href` is set. `self` (default) navigates the current window; `blank` opens a new tab.
