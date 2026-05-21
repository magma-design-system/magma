The `<mds-button>` web component represents an interactive button or hyperlink within the Magma Design System. It encapsulates states, styling, accessibility behavior, and icons inside a Shadow DOM, exposing styling hooks via CSS Custom Properties.

## Semantic Behavior

- **Button vs. Link**: By default, `<mds-button>` renders as an interactive button (`role="button"`). If the `href` property is provided, it acts as a link redirecting the browser window, utilizing the `target` property (`self` or `blank`) to determine target window context.
- **Form Association**: Fully form-associated (`formAssociated: true`), allowing it to natively trigger form submission (`type="submit"`) or resets (`type="reset"`) when enclosed inside a `<form>` element.
- **Active State**: Tracks visual pressed state natively via the `active` attribute.
- **Disabled State**: Setting the `disabled` property disables interactions, prevents click events, and removes it from the tab sequence.
- **Await State**: Triggers a loading spinner (`<mds-spinner>`) and intercepts mouse/keyboard click events while preserving accessibility (automatically maps to `aria-busy="true"`).

## Properties & Visual Configurations

- **`variant`**: Defines the color role. Supports brand colors (`primary`, `secondary`, `ai`), luminance states (`dark`, `light`), status indicators (`success`, `warning`, `error`, `info`), and preset login identities (`google`, `apple`).
- **`tone`**: Controls the visual weight and styling archetype:
  - `strong`: Solid filled background (highest emphasis).
  - `weak`: Subtle background tint (medium emphasis).
  - `outline`: Bordered outline with no solid background (medium-low emphasis).
  - `text`: Borderless and background-less (lowest emphasis).
  - `box`: High-contrast, boxed container style.
- **`size`**: Controls overall sizing. Values: `sm`, `md`, `lg`, `xl` (default: `md`).
- **`icon`**: An SVG filename slug from the icon library.
- **`iconPosition`**: Positions the icon relative to the label: `left` (default) or `right`.
- **`truncate`**: Handles long label text overflow truncation. Values: `all`, `none`, `word` (default: `word`).
- **`animation`**: Text entry/rendering animation. Values: `none` (default), `yugop`.
