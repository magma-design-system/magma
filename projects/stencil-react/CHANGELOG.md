# Changelog

Every release of `@maggioli-design-system/magma-react`, newest first. Each section is the body of the GitHub
release with the same tag, written by git-cliff from the conventional commits of the
package.

It is released together with `magma`, at the same version: the sections are the
releases of `magma`.

## [magma@2.3.0] - 2026-10-15

### Bug Fixes

- *(mds-text)* Read the animation custom properties when the reveal starts
- *(mds-text)* Paint the revealed text as text, never as html
- *(magma)* Keep the HTMLElement shim of the loader in consumer bundles
- *(mds-input-switch)* Give the off knob of a switch a light colour in dark mode
- *(mds-input-select)* Keep the hover and focus ring in dark mode and with more contrast
- *(magma)* Keep the icon lists of the story controls out of the published collection
- *(mds-table)* Paint the scroll area of an interactive table like its rows while hovered
- *(mds-pref-theme-item)* Show the color preview next to the label
- *(mds-pref-theme)* Show the label of the selected item in the trigger
- *(mds-tab,mds-input-switch)* Animate the slider and the knob only on a change of state
- *(mds-button)* Give back the icon slug title when another element names the button
- *(mds-pref)* Keep the document flag and the listeners across a move in the DOM
- *(mds-button)* Leave a button with an icon given as markup without a role again
- *(magma)* Lay out the label and the tab of every mds-pref-* control alike
- *(magma)* Cap the radius of buttons, tabs and fields at a part of their height
- *(mds-file)* Show the downloaded indicator again and drop crypto-js
- *(magma)* Name the icon-only buttons inside the components and give every mds-button its role
- *(mds-filter,mds-filter-item)* Announce the selected state and the count, name the reset button
- *(mds-filter)* Follow the selection the application sets on the items
- *(mds-list-item)* Take the text colour of the container instead of painting the items muted

### Build

- *(magma)* Prepend the release notes to each package's CHANGELOG.md in the release commit
- *(design-tokens,identity,styles,svg-icons,icons,magma)* Ship CHANGELOG.md in every package

### Documentation

- *(magma)* Say in the agent guides that hydrated.css keeps the box of the components
- *(magma)* Point the no-bundler loader example of the readme at a real file
- *(magma)* Document icon routes that serve every slug where mds-icon fetches it
- *(mds-text)* Regenerate the readme with the usage docs of the yugop fix
- *(magma)* Set up editor autocomplete in the agent guides, tokens and classes
- *(magma)* Link the shipped component docs from the agent guides, never plain text
- *(magma)* Say in the agent guides what the semantic utilities paint without semantic.css
- *(stencil)* Drop the hand-written sections of the component readmes
- *(magma)* Lead the icon path setup with IconsSetService and link the mds-icon pattern
- *(magma)* Have a reporting agent propose the origin label its project lacks
- *(magma)* Point the agent guides to the identity manifest
- *(stencil)* Say every mds-pref-* control also works on its own
- *(magma)* Point to the changelogs in AGENTS.md and in the commit convention
- *(mds-tab,mds-input-switch)* Regenerate the readmes from the usage docs

### Features

- *(mds-input,mds-input-select,mds-input-date,mds-input-date-range)* Add size (sm, md, lg)
- *(mds-tooltip)* Name the caller with relation="label"
- *(mds-usage)* Give each variant its own header icon and add an icon prop
- *(mds-table,mds-table-header-cell)* Emit mdsTableHeaderCellSort, let the back end sort the rows

### Performance

- *(mds-button)* Render the spinner only to await, the label without mds-text
- *(mds-button)* Write each tone once, over the tokens each variant names
- *(magma)* Prefix the component CSS for the supported browsers, not for IE 11
- *(magma)* Drop the fallback links that can never resolve

## [magma@2.2.0] - 2026-10-14

### Bug Fixes

- *(mds-table-row)* Show the actions of rows revealed by a streamed ssr boundary

### Build

- *(magma)* Pin typescript to 5.8.3, the version the lockfile installs
- *(magma)* Move to typescript 5.9.3 with typescript-eslint 8.71.2

### Documentation

- *(magma)* Label issues by the project they come from
- *(magma)* Never merge a branch with a red pipeline into dev
- *(magma)* Tell consumer-project agents how to report a Magma problem

### Features

- *(magma)* Render href as a real link and route it through NavigationService

### Refactor

- *(mds-table-row)* Compare sizerWidth with undefined for the actions margin

## [magma@2.1.0] - 2026-10-10

### Bug Fixes

- *(styles,magma)* Require internal dependencies as caret ranges
- *(magma)* Ship the agent docs in the magma and magma-react tarballs
- *(stencil)* Apply the mds-pref-* preference once on load, then mirror the shared store
- *(mds-pref)* Keep data-magma-pref on <html> until the last instance unmounts
- *(mds-input)* Rebuild the validators when a rule changes after load
- *(mds-input-date)* Validate again when required, min or max change after load
- *(mds-input-select)* Show the required tip red when the value is null
- *(mds-input)* Report the validity to the form, so that required stops the submit
- *(mds-input-date)* Report the validity to the form
- *(mds-input-select)* Report a required select left empty to the form
- *(mds-input-upload)* Submit the files to the form, like a native file input
- *(mds-input)* Bring back the value of load on a form reset
- *(mds-input)* Check pattern like a native input, and stop overwriting it
- *(mds-input)* Emit mdsInputKeydown on keydown, with the KeyboardEvent
- *(mds-input)* Keep the value when the browser has no Speech API
- *(mds-input)* Check the format of email and url like the native types
- *(mds-input)* Check the format of piva and cc
- *(mds-input-date)* Honour readonly, load pristine and bring back the value on reset
- *(mds-input-select)* Make multiple work, bring back the selection on reset
- *(mds-input-switch)* Keep one value per radio group, bring back checked on reset
- *(mds-input-otp)* Fill the cells from value, bring back the code on reset
- *(mds-input-range)* Fall back to step 1 like a native input, bring back the value on reset
- *(mds-input-date-range)* Bound the slotted fields, keep presets in order and in sync at load
- *(mds-input)* Disable it in a disabled fieldset, like a native input
- *(mds-input-date)* Disable it in a disabled fieldset, like a native date input
- *(mds-input-range)* Disable it in a disabled fieldset, like a native range input
- *(mds-input-select)* Disable it in a disabled fieldset, like a native select
- *(mds-input-switch)* Disable it in a disabled fieldset, like a native checkbox
- *(mds-input)* Stop the mic and the steppers on a field the user cannot change
- *(mds-button-dropdown,mds-button)* Disable the buttons in a disabled fieldset

### Build

- *(magma)* Pin internal dependencies as caret ranges
- *(stencil)* Write the public API snapshot magma.api.txt from the docs JSON
- *(stencil)* Compute the review level and the release check of a PR
- *(stencil)* Rate an event detail that extends the old one as minor
- *(stencil)* Record the disabled prop of three form inputs in magma.api.txt
- *(stencil)* Record the API changes of the button family in magma.api.txt
- *(stencil)* Declare a break no consumer can tell apart with API-Compatible

### Documentation

- *(storybook)* Render the usage docs in the components' Docs pages
- *(storybook)* Scroll the docs pages to the heading clicked in the table of contents (#834)
- *(storybook)* Move the Magma preferences to a toolbar menu
- *(magma,styles,design-tokens)* Rewrite the color docs on the semantic layer
- *(magma,styles,design-tokens)* Align the styles and design-tokens docs with the build
- *(magma,stencil)* Align the agent and component docs with the code
- *(magma,stencil)* Align the 342 component usage docs with the code
- *(stencil)* Tell how to place mds-table so it scrolls by itself
- *(magma)* Document how the form components report their validity
- *(magma)* Document how the form components submit, reset and report validity
- *(magma)* Say what disabled and a disabled fieldset do to the form components
- *(magma)* Every form input follows disabled and a disabled fieldset
- *(stencil)* Document the API snapshot in SPEC.md, AGENTS.md and the PR template
- *(magma)* Document the review levels and the release check
- *(stencil)* Put the form reset JSDoc back on formResetCallback
- *(mds-button)* Let the controls of the Await story drive it
- *(magma)* Say how the buttons submit a form and tell the actions apart

### Features

- *(magma)* Ship the agent docs as topic fragments and per-component docs
- *(mds-input-otp)* Add disabled, and disable it in a disabled fieldset
- *(mds-input-upload)* Add disabled, and disable it in a disabled fieldset
- *(mds-input-date-range)* Add disabled, and disable it in a disabled fieldset
- *(mds-input-upload,mds-input-select)* Record name and the selected values in magma.api.txt
- *(mds-button)* Send name and value to the form it submits, like a native submit button
- *(mds-button-dropdown,mds-button)* Submit a form from the primary action, with name and value
- *(mds-button-dropdown)* Emit mdsButtonDropdownClick from the primary action only

### Refactor

- *(magma)* Move the release scope matching to commit-scopes.mjs

## [magma@2.0.1] - 2026-10-05

### Bug Fixes

- *(mds-icon)* Bump idb-keyval to 6.3.0 so the icon cache reopens a closed IndexedDB connection
- *(mds-icon)* Keep the whole svg path instead of truncating it
- *(mds-icon)* Render nothing without a name and stop listening once removed from the page
- *(stencil)* Treat null and missing props as not set again

### Documentation

- *(storybook)* Resolve the story assets relative to the storybook base
- *(storybook)* Link the published storybook

### Performance

- *(mds-icon)* Check the memory cache before reading IndexedDB

## [magma@2.0.0] - 2026-09-30

### Bug Fixes

- *(mds-modal)* Fix bug animation display
- *(magma)* Generate agent docs before stencil build
- *(mds-keyboard,mds-filter-item,mds-paginator-item,mds-url-view)* Typo disconnectedCallback
- *(stencil)* Set private function
- *(stencil)* Resolve eslint doc warning
- *(mds-keyboard)* Remove redundant .bind on test button onClick
- *(stencil)* Remove .bind in JSX props flagged by react/jsx-no-bind
- *(stencil)* Resolve react/jsx-no-bind warnings
- *(stencil)* Avoid top-level call expression in mds-push-notification-item
- *(mds-icon)* Remove duplicated method
- *(storybook)* Use accordion disable-close in color-scale
- *(stencil)* Dedupe repeated @layer order statements in component CSS
- *(stencil)* Guard preference observer when MutationObserver is missing
- *(mds-modal)* Correct backdrop click-through selector
- *(mds-pref-language-item)* Tolerate unset code prop on first render
- *(mds-video-wall)* [**breaking**] Rename --mds-video-wall-noise-fitler to --mds-video-wall-noise-filter
- *(mds-file)* [**breaking**] Rename --mds-file-preview-icon-bacground to --mds-file-preview-icon-background
- *(mds-img)* Tolerate undefined src without crashing
- *(stencil)* Stop inline components stretching in grid/flex parents
- *(stencil)* Fall back to the default theme value, not the dark one
- *(mds-table)* Tolerate lifecycle races on slotted elements
- *(stencil)* Give the status icons a role, and the contrast that comes with it
- *(stencil)* Replace :scope selectors with SSR-safe direct-child queries
- *(stencil)* Guard browser-only APIs for the hydrate/SSR runtime
- *(stencil)* Declare pre-hydration host geometry
- *(mds-usage)* Paint the header with its own background token
- *(stencil)* Point the dead rings at the republished family, and the shadows at the role
- *(mds-text)* Guard unknown typography against the default variant
- *(mds-button)* Guard unknown size against the md typography
- *(stencil,styles)* Close the escape hatch of #624, and repair the registration snapshots
- *(mds-paginator)* Scroll on item focus only for keyboard navigation so clicks are not lost
- *(mds-calendar)* Keep the intrinsic width within --mds-calendar-max-width
- *(mds-input-date)* Give the dropdown calendar a definite width
- *(stencil)* Center the calendar day numbers and the input date icons
- *(mds-input-upload)* Widen the infos column and lay the main actions in a row
- *(mds-file-preview)* Show the extension fallback icon when the icon prop is unset
- *(mds-input-upload)* Move the width cap from the infos column to the progress bar
- *(stencil)* Correct the @Element types of three components
- *(mds-calendar)* Ignore invalid start-date and end-date instead of throwing
- *(mds-calendar)* Redraw the range and preview the hover without a parent
- *(mds-input)* Keep the password mask inside the rounded field
- *(stencil)* Wire the mds-chip selected state to the tokens the docs promise
- *(mds-emoji)* Keep the thinking pose centred and let expressions take the face over
- *(mds-emoji)* Keep the prerender out of the browser only pose restore
- *(mds-input-date-range)* Repair the :host() selector that voided the slotted color
- *(stencil)* Write the registered <number> opacities as numbers, not percentages
- *(stencil)* Delete the ten custom properties nothing ever reads
- *(stencil)* Drop the two dead properties the codemod manifest flagged
- *(mds-chip)* Expose the selected state to assistive technology
- *(stencil)* Remove the seven documented APIs that do not exist at all
- *(stencil)* Close the mechanical dead chains the full sweep found
- *(stencil)* Apply the two v1 renames we ship to consumers
- *(mds-table)* Raise the table background to the overlay surface
- *(mds-tooltip)* Describe the caller as a tooltip, not as a menu it controls
- *(mds-input-switch)* Make the native input the focusable, labelled control
- *(mds-tab-item)* Name icon-only tabs after the host title
- *(mds-keyboard)* Label the combination checker with aria-label
- *(mds-progress)* Expose the progress value and hide the nested radial gauge
- *(mds-details)* Expose the header as a disclosure button, not a banner
- *(mds-file-preview)* Drop the footer landmark from the infos row
- *(mds-input-field)* Validate the input that emitted inside the slotted element
- *(stencil)* Spell the pill one way, on the generated radius scale
- *(stencil)* Put the hand written radii back on the generated scale
- *(stencil)* Wire the button corner shape, drop the dead tab style queries
- *(mds-banner)* Show the actions slotted after the first render
- *(stencil)* Show the slotted content added after the first render
- *(mds-dropdown)* Leave the ARIA wiring off a caller that delegates its role
- *(mds-pref-theme-variant)* Drop the caption that never had a string
- *(mds-label)* Put the tag back on the pill it was drawn as
- *(mds-label)* Give the close button one state that shows
- *(storybook)* Emit the icons named only in the stories
- *(mds-modal)* Release the body scroll lock when the modal closes
- *(storybook)* Wrap the body tokens in rgb()
- *(mds-modal)* Let the page colour through the dialog
- *(mds-modal)* Measure the bars when the dialog becomes visible
- *(storybook)* Let the header do what it does on a page
- *(mds-button-group)* Decide the joined edges among the members of the group
- *(stencil)* Open a floating panel from its arrow, not from its middle
- *(mds-dropdown,mds-tooltip)* Place a panel that mounts already visible
- *(mds-filter)* Centre the selected item wherever the filter sits on the page
- *(mds-stepper-bar-item)* Number the steps by position, not by child node
- *(stencil)* Position a floating panel only once it has a box to measure
- *(mds-dropdown)* Give the panel its outro back
- *(mds-input-select)* Draw the arrow the way mds-input-date draws its icon
- *(mds-input-select)* Stop the dark block from repainting the arrow
- *(mds-mention)* Give the remove button a switch and an event
- *(mds-table)* Count the selected rows in the batch actions badge
- *(mds-table-header)* Resolve the select-all switch before ticking it
- *(storybook)* Key the lists the stories build, and lint for it
- *(mds-button)* Keep the box of an icon-only button while it awaits
- *(mds-kpi-item)* Hold the line open while the value is still to come
- *(stencil)* Animate the text at its full length, from the first frame
- *(stencil)* Paint the two label variants that four components were missing
- *(mds-toast)* Park a toast that is not visible outside the screen
- *(stencil)* Hold back every transition under the animation preference
- *(stencil)* Let the animations written in JS read the preference too
- *(mds-tree-item)* End the branch on the icon that covers it
- *(mds-tree-item)* Give the shorter branch to the first child only
- *(mds-tree)* Stack the items, not the whitespace between them
- *(stencil)* Give the entries of a dropdown menu the role of entries
- *(mds-policy-ai)* Declare the chip panel a group, not a menu
- *(mds-modal)* Name the dialog, and leave only one of them
- *(mds-dropdown)* Wire the caller and the panel with references that resolve
- *(mds-dropdown)* Name the entries of the menu from the panel that declares it
- *(mds-tooltip)* Let the text of the tip reach the caller it describes
- *(mds-tab-item)* Let the tab tell whether the popup it opens is showing
- *(mds-dropdown)* Let go of the caller the target no longer names
- *(stencil)* Take the escape listener off window when it is detached
- *(mds-pref-theme)* Write the mode as --magma-pref-theme
- *(stencil)* Inject the global token fallbacks instead of writing them by hand
- *(storybook)* Align the chrome and the preview on one color scheme
- *(mds-badge)* Never fill the outline tone
- *(mds-progress)* Fill the status bars with the hue, not its ink
- *(mds-modal)* Keep the close icon visible on the scrim in dark
- *(mds-file)* Split the name from the extension at the last dot

### Build

- *(magma)* Cache agent docs as stencil build outputs
- *(magma)* Add all target building every project in dependency order
- *(magma)* Exclude storybook stories and test files from the stencil build
- *(magma)* Replace yarn with npm as the package manager
- *(magma)* Drop the @mdi/svg override in favor of @iconsauce/mdi-svg 1.1.0
- *(magma)* Update dependencies to fix npm audit vulnerabilities
- *(magma)* Update nx to 23.1.3
- *(magma)* Make clean-modules remove all nested node_modules and lockfiles
- *(magma)* Add the root lint configs to the lint target inputs
- *(magma)* Add @stencil/vitest and align vitest to 4.1.11
- *(storybook)* Move to the vite builder and run the stories with the vitest addon
- *(magma)* Declare each dependency in the project that uses it
- *(magma)* Resolve svg-icons from the workspace and make the Nx graph analysis explicit
- *(magma)* Pin the remaining dependency ranges

### Changes

- *(stencil)* Name the mode mode and the named theme theme
- *(mds-pref-mode)* Drop theme from the visible label

### Documentation

- *(magma)* Add module install instructions for agents
- *(stencil)* Update property descriptions and types across multiple components
- *(magma)* Rename install->agents, add usage guide + component catalogue
- *(stencil)* Update components readme
- *(stencil)* Update components.d.ts
- *(mds-accordion-item)* Align docs with disableClose rename
- *(mds-card-content)* Regenerate component docs
- *(mds-card-media)* Regenerate component docs
- *(magma)* Enhance issue templates with new fields and labels
- *(magma)* Add agentic git governance rules and PR template
- *(magma)* Require linking work branches to their github issue
- *(stencil)* Clarify the quiet tone migration mapping
- *(magma)* Require merge commits when promoting dev into main
- *(magma)* Detail repo structure in README
- *(magma)* Require PRs to list every resolved issue with a closing keyword
- *(stencil)* Add the Semantic roles reference story
- *(stencil)* Allinea la reference story al ruolo inverse-surface
- *(mds-usage)* Restate why the dark header overrides stay removed
- *(mds-paginator)* Clarify that the focus auto-scroll follows keyboard navigation only
- *(mds-calendar)* Document and register --mds-calendar-max-width
- *(magma)* Point contributor docs at npm instead of yarn
- *(magma)* Document the lint gate in CI
- *(magma)* Document the vitest based stencil tests
- *(mds-input)* Recommend autocomplete tokens on login fields
- *(mds-chip)* Regenerate the readme after the selected-state rewiring
- *(mds-emoji)* Restore the css custom properties table dropped by the rewiring
- *(magma)* Require a covering test for every behaviour change
- *(magma)* Point the test docs at the vitest storybook project
- *(styles,magma)* Document the corner axis, and stop recommending the hatch
- *(mds-dropdown)* Write down the roles of the panel, and point the examples at an id
- *(magma)* Let agents open pull requests into dev, still never merge them
- *(stencil)* Customize the entity and tree stories with semantic roles
- *(mds-badge)* Regenerate the readme for the outline note
- *(magma)* Document the wrapper tests
- *(magma)* Document the tag-only beta releases
- *(styles,magma)* Update the compatibility table for magma 2 stable

### Features

- *(mds-modal)* Update component properties and styles for improved functionality and consistency
- *(mds-modal)* Refine animation styles and transitions for improved modal behavior
- *(magma)* Add .browserslistrc for modern CSS support and update package dependencies
- *(mds-icon)* Expose IconsSetService to set the SVG path without sessionStorage
- *(mds-calendar,mds-input-date,mds-input-date-range)* Port magma 1.12 from support/v1.x
- *(stencil)* Inline the semantic layer as var() fallbacks
- *(stencil)* Adopt --magma-surface-* in surface components
- *(mds-table)* Consume semantic surfaces and flip text with the theme
- *(stencil)* Add the semantic surfaces Storybook cheat-sheet
- *(stencil)* Wire named themes into storybook and fix the variant components
- *(stencil)* Coordinate lock-dark between the pref theme lanes
- *(design-tokens,stencil,styles)* Collapse accent roles to {accent, ai}
- *(stencil)* [**breaking**] Make the published packages tree-shakeable
- *(design-tokens,styles,stencil)* Publish the hue role scales and promote them under pref-contrast-more
- *(styles,stencil)* Register the component custom properties from globals.css
- *(design-tokens,styles,stencil)* Retint the raw ramp with the theme via --magma-scale-*
- *(stencil)* Enable SSR with declarative shadow DOM
- *(stencil)* Add check.ssr guard for SSR regressions
- *(design-tokens,styles,stencil)* Give the colored hues the emphasis band states
- *(design-tokens,styles,stencil)* A shadow ink role, the ring family back, and a guard
- *(stencil)* Add hide-today to mds-calendar and the date inputs
- *(styles,stencil)* Emit the corner axis, shape and scale in one block
- *(stencil)* Point the shaped components at the shape-aware scale
- *(stencil)* Let mds-pref-theme-variant drive the corner axis
- *(stencil)* Forward an accessible name to the native controls of the inputs
- *(mds-dropdown)* Walk the menu with the keyboard, and close it back on the caller

### Refactor

- *(mds-modal)* Replace @apply with direct gap property for consistency
- *(mds-avatar-stack)* Drive slotted item size from parent, drop :host-context
- *(stencil)* Drive slotted child styling from parent, drop :host-context
- *(stencil)* Drop precautionary safari :host-context in size container queries
- *(stencil)* Remove ineffective safari :host-context gates
- *(mds-tab)* Propagate direction/animation to items, drop :host-context
- *(mds-table)* Propagate selection to rows, drop :host-context
- *(mds-tree)* Propagate toggle-position/appearance to items, drop :host-context
- *(mds-tree)* Resolve effective actions in JS, drop last :host-context
- *(stencil)* Respect strict boolean condition
- *(mds-accordion)* Rename closable to disableClose
- *(mds-banner)* Rename cockade to hideCockade
- *(mds-breadcrumb)* Rename back to hideBack
- *(mds-card)* Rename autoGrid to disableAutoGrid
- *(mds-dropdown)* Rename arrow/autoPlacement/shift/smooth to negative props
- *(mds-file)* Rename showDownloadedIcon to hideDownloadedIcon
- *(mds-header)* Rename backdrop to hideBackdrop
- *(mds-help)* Rename autoPlacement to disableAutoPlacement
- *(mds-input-date)* Use disable-auto-placement on dropdown
- *(mds-input-date-range)* Use disable-auto-placement on dropdown
- *(mds-modal)* Rename backdrop to hideBackdrop
- *(mds-notification)* Rename visible to dismissed
- *(mds-pref-language)* Drop autoPlacement on dropdown
- *(mds-pref-theme-variant)* Drop autoPlacement on dropdown
- *(mds-push-notification-item)* Default deletable to false
- *(mds-radial-menu-item)* Use disableAutoPlacement on tooltip
- *(mds-status-bar)* Use hideBackdrop on modal
- *(mds-tooltip)* Rename arrow/autoPlacement/shift to negative props
- *(stencil)* Align floating controller with negative floating props
- *(stencil)* [**breaking**] Drive language and preferences through a shared reactive store
- *(storybook)* Sync preview preferences through the addon channel
- *(mds-pref-language-item)* Use explicit comparisons in code validation
- *(stencil,styles)* [**breaking**] Migrate --tone-*(bare) usages to --tone-*-seed (#572)
- *(magma)* Move semantic.config into design-tokens to break the build cycle
- *(mds-toast)* Consuma il ruolo --magma-surface-inverse
- *(stencil)* Replace stale bare tone utilities in stories
- *(stencil)* Read the staged semantic layer from styles build dir
- *(stencil)* Migrate accent variant partials to semantic accent roles
- *(design-tokens,styles,stencil)* Name the hue background levels wash-*, not surface-*
- *(stencil)* Adopt semantic color roles in components
- *(stencil)* Adopt the semantic status roles where the value is identical
- *(stencil)* Give the step-04 inks a role, split by what they sit on
- *(stencil)* Put the status fills on the emphasis band
- *(stencil)* Adopt the neutral wash band for the pill backgrounds
- *(stencil)* Give the step-02 inks a role, by what they sit on
- *(stencil)* Give the status borders a role, strong where the border is the affordance
- *(magma)* Move the react and angular wrappers out of projects/stencil
- *(stencil)* [**breaking**] Invert the mds-calendar boolean props to their negative form
- *(mds-stepper-bar)* Scroll the strip from the boxes
- *(stencil)* Move the neutral seed backgrounds onto the surface roles
- *(stencil)* Give the remaining neutral seed grounds a role
- *(stencil)* Let the contrast layer paint the paper ground
- *(mds-badge)* Drop the leftovers of the text tone
- *(stencil)* Move the accent residues onto the accent roles
- *(stencil)* Move the raw status steps onto the hue roles
- *(stencil)* Move the ramp-step borders onto the border roles
- *(stencil)* Retire the ramp steps from the *-pref-* sheets
- *(stencil)* Move the dark variants onto the inverse roles
- *(stencil)* Move the step 02 inks onto text-default
- *(stencil)* Move the step 06 inks onto the text and border roles
- *(stencil)* Move the step 07 inks onto the text and border roles
- *(stencil)* Move the step 06/07 grounds onto the wash and border roles
- *(mds-input)* Align the commented counter hover with wash-base
- *(stencil)* Move the --magma-scale-NN uses with an identical role onto it

### Styling

- *(stencil)* Update accessibility feature with supported browser specs
- *(stencil)* Move apply tokens to custom proerty based tokens
- *(stencil)* Replace pref :host-context with dedicated attributes
- *(stencil)* Replace pref :host-context in variant files with attributes
- *(stencil)* Various component styles fixes
- *(stencil)* Quieter unchecked switch track in dark
