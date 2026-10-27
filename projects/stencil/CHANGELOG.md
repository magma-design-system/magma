# Changelog

Every release of `@maggioli-design-system/magma`, newest first. Each section is the body of the GitHub
release with the same tag, written by git-cliff from the conventional commits of the
package.

## [magma@2.9.0] - 2026-10-27

### Bug Fixes

- *(mds-book)* Keep the publisher of a drawn cover inside its bottom edge

### Documentation

- *(magma)* The CI of a commit on main is its merge-group run
- *(mds-book)* Show the spine by its depth and the four ways of the publisher

### Features

- *(mds-book)* Print the author under the title where the spine has room
- *(mds-book)* Print the mark of the publisher with publisher-logo

### Styling

- *(mds-book)* Set the title of the book in the face of the titles

## [magma@2.8.0] - 2026-10-26

### Bug Fixes

- *(mds-emoji)* Give every part its transform origin once, so a blink leaves no offset
- *(mds-filter)* Leave the gap of a field under the label of a filter
- *(magma)* One full stop after a deprecation in the props of AGENTS.md
- *(mds-input-range)* In dark the thumb takes the ink of the progress, as a switch that is on
- *(mds-calendar-cell)* A weekend day inside a range takes the text of the selection
- *(mds-modal)* On a narrow screen a full window leaves a strip of backdrop with the close button
- *(mds-modal)* The built-in close button shows at every position, in a strip of backdrop

### Documentation

- *(mds-header)* A header without a menu slot needs no menu="none"
- *(stencil)* Open four Pattern files with the form that shows the component

### Features

- *(mds-table-row)* The background of the actions box as a public read-only property
- *(mds-toast,mds-banner)* Dismissible, with deletable as a deprecated name
- *(lint)* No-deprecated reports a deprecated prop, with what to use instead
- *(magma)* Say where each component is in the published Storybook
- *(mds-push-notification-item)* Dismissible, with deletable as a deprecated name

## [magma@2.7.0] - 2026-10-24

### Bug Fixes

- *(lint)* Spell multi-word Material slugs with hyphens, as iconsauce serves them
- *(lint)* Check_setup accepts every icon path and lint config its guides document
- *(lint)* Serialise every DTCG type of the token tools, keep the class of suggest_role
- *(lint)* No-internal-tokens reads the custom properties of Tailwind classes and @apply

### Build

- *(magma)* Keep test fixtures out of the release package map

### Documentation

- *(magma)* Write where each answer of the lint and the MCP server comes from
- *(magma)* Route agents to the data contracts, stop loading the consumer guides

### Features

- *(lint)* Ship the MCP tools as data, describe the Stylelint rules, link the release
- *(lint)* Lead the agent to propose an issue when the MCP server lacks a tool
- *(lint)* Read classes in clsx(), ternaries, [ngClass] and @apply, as the codemod does

## [magma@2.6.0] - 2026-10-24

### Bug Fixes

- *(mds-book)* Cut the caps of a rounded spine on the arc of its slats
- *(magma,lint)* Start magma-mcp with npx --no, never letting npx install it

### Changes

- *(mds-book)* Show the side-to-side drag with an ew-resize cursor

### Documentation

- *(magma)* Point the Copilot instructions to AGENTS.md
- *(mds-book)* Show the Catalogue story as a page of a bookshop
- *(magma,styles)* Allow dark: for a deliberate per-mode choice
- *(design-tokens,magma)* Document the Android, iOS and Flutter color files
- *(stencil)* Give an alt to the images of the usage examples, a name to the paginator arrows
- *(magma)* Set up the lint at bootstrap and run it after every change
- *(magma)* Set up the MCP server at bootstrap and say when to call each tool
- *(magma)* Get the Claude Code plugin at bootstrap, the MCP entry for the other clients
- *(magma,stencil)* Describe the component categories and group the reference by them
- *(storybook)* File the component stories under their categories, keeping their URLs
- *(magma,stencil)* Describe where a component page sits in Storybook
- *(magma)* Name only public CSS custom properties in the usage docs
- *(magma)* The contract of the component CSS custom properties

### Features

- *(mds-book)* Add a book drawn as a physical object in 3D from its front cover
- *(lint)* Add the ESLint and Stylelint rules that check consumer code against the installed Magma
- *(lint)* Point no-color-scheme-override to the dark variant for a per-mode choice
- *(magma,lint)* Ship the consumer lint inside magma as ./eslint and ./stylelint
- *(lint)* The MCP server, ten read-only tools on the data of the installed magma
- *(magma,lint)* Ship the MCP server in magma as the magma-mcp command
- *(lint)* Check_setup counts the Magma plugin as the MCP server of Claude Code
- *(stencil)* Sort the components into categories, their parts under their parent
- *(stencil)* Carry the public or internal mark of each CSS custom property
- *(magma)* Promise 184 CSS custom properties, the other 520 are internal
- *(lint)* Reject internal custom properties, let the static ones take a colour

### Styling

- *(mds-push-notification)* Paint the light fade with --magma-surface-sunken

## [magma@2.5.1] - 2026-10-22

### Bug Fixes

- *(mds-stepper-bar-item)* Show the status of the step in its badge
- *(mds-input-range)* Draw a light thumb in dark, apart from the progress
- *(mds-input-range)* Keep the disabled colours in dark
- *(mds-input)* Show the validation messages in the language of the page
- *(mds-input-select)* Emit no change on load, before any selection
- *(mds-status-bar)* Keep the bar inside its area at 480px and less
- *(mds-keyboard)* Start the test with Enter without failing it at once
- *(mds-input)* Wait for the first blur to validate a required field
- *(mds-emoji)* Draw the emoji in Firefox, keep the inner svg flat
- *(mds-input)* Report maxlength and minlength under their own error keys
- *(stencil)* Give a page language with a region the texts of its base language

## [magma@2.5.0] - 2026-10-21

### Bug Fixes

- *(mds-card)* Keep the footer at the bottom of the card without a content

### Documentation

- *(magma,mds-button,mds-text)* Point links inside a sentence to mds-link
- *(stencil)* Require Magma tokens for the values of component sheets
- *(mds-input-switch)* Write the input tag and the type values as code
- *(mds-button,mds-link,mds-text)* Regenerate the readmes from the usage docs
- *(magma)* Write spacing with the numeric steps, a t-shirt size is a container size

### Features

- *(mds-link)* Add the inline link for running text
- *(mds-entity)* Expose the infos part, 2px between the name and the detail

### Refactor

- *(stencil)* Take the lengths and durations of the component sheets from the tokens

## [magma@2.4.1] - 2026-10-21

### Bug Fixes

- *(mds-emoji)* Read CSS custom properties once the emoji has a computed style
- *(mds-emoji)* Keep hearing the pointer when the host is moved
- *(mds-tree-item)* Count the first and the last child among the items
- *(mds-input-switch)* Keep the page still when clicked in a scrolled box

### Documentation

- *(magma)* Describe the single trunk main and the manual release

## [magma@2.4.0] - 2026-10-20

### Bug Fixes

- *(mds-accordion-timer,mds-accordion-timer-item)* Announce each selection once, keep the open one
- *(mds-accordion)* Announce every change of the open items, and only those
- *(mds-pref-mode,mds-pref-animation,mds-pref-consumption,mds-pref-contrast)* Announce a pick once
- *(mds-pref-theme)* Announce a theme or a corner shape once, not on every render
- *(mds-pref-language)* Select the item of a language set from code
- *(mds-toast)* Emit mdsToastClose once per dismissal and stop the countdown on hide
- *(mds-push-notification-item)* Send the id the close event declares
- *(mds-header)* Type the visibility detail as the string it carries
- *(mds-file)* Send the description the card shows
- *(mds-breadcrumb)* Name the item the back arrow selects as the caller
- *(mds-details)* Write the user's toggle into opened
- *(mds-calendar)* Put a backwards range in order
- *(mds-table,mds-table-row)* Follow a selection made from code, remove the scroll listener
- *(mds-notification)* Stop following the target when the badge leaves the page
- *(mds-label)* Wrap at the width the label is given with truncate none or all
- *(design-tokens,styles,magma)* The shadow ink stays dark in dark mode, no more light halo
- *(mds-dropdown)* A second click on the caller closes the panel
- *(mds-button-dropdown)* The link and the initial focus belong to the primary action
- *(mds-emoji)* The gaze follows the direction of the pointer, at any size
- *(mds-table)* Call setActions only on a header that has it
- *(mds-modal)* Open the dialog after the render that reflects position and animation
- *(mds-text)* Keep the accents of a truncated label or option text visible
- *(mds-chip)* Paint the ground with surface-overlay, not the grey wash
- *(mds-banner)* Paint the neutral ground with surface-overlay, not the card's surface-raised
- *(mds-input-otp,mds-pref-theme-item,mds-stepper-bar-item,stencil)* Import the FOUC sheets
- *(mds-text)* Import the animation preference sheet
- *(mds-tooltip)* Import the dark high-contrast shadow sheet
- *(mds-avatar,mds-avatar-stack)* Spell the pill on the corner axis
- *(mds-entity)* Take the radii and the shape of the corner axis
- *(mds-chip,mds-mention)* Spell the pills on the corner axis
- *(mds-hr,mds-separator)* Spell the rounded rule on the corner axis
- *(mds-input-switch,mds-input)* Spell the switch and the password dots as pills
- *(mds-notification,mds-radial-progress)* Spell the circles on the corner axis
- *(mds-paginator,mds-paginator-item)* Spell the pills on the corner axis
- *(mds-horizontal-scroll)* Spell the dots and the arrows as pills
- *(mds-breadcrumb-item)* Spell the pill of the button on the corner axis
- *(mds-filter,mds-filter-item)* Spell the pills on the corner axis
- *(mds-badge)* Spell the pill on the corner axis
- *(mds-stepper-bar-item)* Take the radii of the corner axis
- *(mds-push-notification-item)* Take the radii of the corner axis
- *(mds-tooltip,mds-text,mds-note)* Take the smallest step of the corner axis
- *(mds-accordion-item,mds-accordion-timer-item,mds-details)* Cap the corner of the header
- *(mds-bibliography)* Spell the pill of the link on the corner axis
- *(mds-price-table-list,mds-zero,mds-usage)* Take the radii of the corner axis
- *(mds-toast,mds-status-bar)* Take the radii of the corner axis
- *(mds-header)* Round the inline bar on the corner axis
- *(mds-policy-ai)* Take the radii of the corner axis
- *(mds-table-row)* Round the actions panel on the corner axis
- *(mds-url-view)* Round the window on the corner axis
- *(mds-tree,mds-tree-item)* Take the radii of the corner axis
- *(mds-button-dropdown)* Round the corners as mds-button does, on the corner axis
- *(mds-calendar,mds-calendar-cell)* Take the radii of the corner axis
- *(mds-input-select,mds-input-tip-item,mds-input-range,mds-input-upload)* Take the corner axis
- *(mds-keyboard,mds-keyboard-key)* Paint the keyboard with the washes of the active theme
- *(mds-pref-theme-item)* Take the wash of the active theme and the pill radius
- *(mds-input-select)* Take the radius of mds-input, on the host
- *(mds-accordion)* Keep the ids of the items
- *(mds-breadcrumb)* Keep the ids of the items
- *(mds-filter)* Keep the ids of the items
- *(mds-tab-bar)* Keep the ids of the items
- *(mds-tree,mds-tree-item)* The toggle takes its expanded colours and its gap
- *(mds-tab,mds-tab-item)* The items take the default and the hover shadow
- *(mds-progress,mds-stepper-bar-item)* --mds-progress-radius rounds the bar again
- *(mds-dropdown)* The backdrop takes the z-index and the duration set on the dropdown
- *(mds-label)* Name the delete button in Spanish
- *(mds-label)* Load a deletable label without an error
- *(mds-tab)* Leave a content panel past the last item hidden
- *(mds-pref-animation,mds-pref-consumption,mds-pref-contrast)* Ignore a mode outside the union
- *(mds-pref-language,mds-pref-language-item)* Take three-letter codes, ignore invalid ones
- *(mds-pref-theme,mds-pref-theme-item)* Ignore an invalid theme name, scheme or corner shape
- *(mds-emoji)* Ignore a name outside the dictionary
- *(mds-input-otp)* Submit a paste that fills the last cell instead of throwing
- *(mds-icon)* Decode a base64 icon with its padding, draw a saved SVG file inline
- *(mds-img)* Skip a srcset-consumption entry without its level
- *(mds-bibliography)* Describe author as a string, read an array per entry
- *(mds-avatar)* Give every pair of initials a variant
- *(mds-horizontal-scroll)* Measure the slotted elements, not the text between them
- *(mds-notification)* Describe the element the badge sits on with its count
- *(mds-kpi-item)* Build the accessible name from the parts that are there
- *(mds-price-table-list,mds-usage)* Drop the main landmark and the document-edit roles
- *(mds-progress,mds-benchmark-bar)* Keep the progressbar values valid and follow aria-hidden
- *(mds-toast)* Announce the toast as a status message
- *(mds-spinner,mds-video-wall,mds-emoji)* Follow the Magma animation preference
- *(mds-tree,mds-tree-item)* Give the tree a structure and the branches their state
- *(mds-button,mds-filter-item)* Click on Enter and Space as the pointer does, never while busy
- *(mds-input-otp)* Leave Tab, Backspace and the shortcuts to the keyboard
- *(mds-details)* Toggle on Space, and keep the closed content out of the tab order
- *(mds-file,mds-file-preview)* Make the download cards buttons the keyboard activates
- *(mds-tooltip,mds-help)* Show the tooltip on focus as on hover
- *(mds-tab-bar-item)* Reach and activate the items from the keyboard
- *(mds-paginator,mds-paginator-item)* Take the disabled arrows out of the tab order
- *(mds-breadcrumb,mds-breadcrumb-item)* Keep the current page selected under the keyboard
- *(mds-modal,mds-status-bar)* Let strict veto the swipe, and keep the status bar non-modal
- *(mds-radial-menu)* Close the open menu on an outside click and on Escape
- *(mds-details)* Keep an open details hidden inside a closed one
- *(mds-calendar,mds-calendar-cell)* The cell properties reach the cells, the day colour paints
- *(mds-price-table-list-item)* The supported icon takes its hover colour
- *(mds-table-cell,mds-table-row,mds-table)* The -alt colours paint the sorted column
- *(mds-header,mds-header-bar)* The icon colours of the header reach the hamburger
- *(mds-price-table-features,mds-price-table-features-cell)* The border colour reaches the cells
- *(mds-toast)* MdsToastClose waits for the exit transition, not for 1000 ms
- *(mds-tree-item)* MdsTreeItemCollapse waits for the branch transition, not for 1000 ms
- *(mds-keyboard-key)* The space key is wide again
- *(mds-paginator,mds-paginator-item)* The item properties reach the items from the paginator
- *(mds-push-notification-item)* Style only the tones its type accepts
- *(mds-card)* Read the layout from the slots, again when the content changes
- *(mds-table)* Show the batch bar for buttons added after load
- *(mds-price-table-list)* Show the items rendered after load
- *(mds-tree,mds-tree-item)* Open on load, hand the props to the items that arrive later
- *(mds-calendar)* Show the preselection area for the content of its slot
- *(mds-pref,mds-pref-language,mds-pref-theme)* Size on load, follow the items added later
- *(mds-avatar-stack)* Count the avatars added after load
- *(mds-img)* Follow the consumption preference the page applies
- *(storybook)* Turn off the boolean controls of the form-associated components
- *(mds-tree-item)* Round the corners of the folder toggle again
- *(mds-input-switch)* Round the focus ring of the checkbox and radio again
- *(mds-avatar)* Show the sources in one order, never an empty avatar
- *(mds-bibliography)* Keep every first name, link the title only with a url
- *(mds-button-dropdown)* Pass truncate to the label of the primary action
- *(mds-calendar-cell)* Paint selection none as no selection, deprecate weekend
- *(mds-input-date-range-preselection)* Keep the author's slot, let the click through
- *(mds-dropdown,mds-tooltip,mds-help)* Keep the placement while it has room
- *(mds-emoji)* Keep the mouse tracking off once stopFollowMouse is called
- *(mds-file,mds-file-preview)* Show no extension for a filename without one
- *(mds-header)* Hide the hamburger of the bar without a menu slot
- *(mds-header-bar)* Open and close the menu of the header with setOpened
- *(mds-notification)* Hide a dismissed badge with the disabled strategy too
- *(mds-pref)* Show the reload notice in the visible panel
- *(mds-pref-theme)* Keep a name, scheme or corner shape set after load
- *(mds-pref-contrast)* Stop querying the contrast of the system on each pick
- *(mds-push-notification)* Hide once the last item goes, label the clear button
- *(mds-stepper-bar)* Hide the other panels with the hidden attribute
- *(mds-keyboard)* Accept the keys of a shortcut in any order
- *(mds-note)* Turn Enter into a click only while the note is deletable
- *(mds-calendar-cell)* Let the start and end of a selection keep their colours
- *(mds-pref-mode)* Stop forcing Safari to light mode
- *(magma)* Export CHANGELOG.md from magma, magma-react and magma-angular
- *(mds-benchmark-bar)* Announce the value as shown when there is no alias
- *(mds-input-switch)* Cast the shadow of the knob again
- *(mds-file,mds-filter-item,mds-input-range,mds-input-switch,mds-input-upload)* Use magma eases
- *(magma)* Fix: .claude to .gitignore
- *(mds-table-header)* Paint the select-all cell with the header colour
- *(mds-table)* Paint every row with a full colour, and the scroll area with the sunken surface
- *(mds-table)* Draw the frame with border-muted, like the grid
- *(mds-modal)* Slide the window in when its content has a focusable element

### Build

- *(magma)* Drop the unused changelog scripts and the deprecated conventional-changelog-cli
- *(magma)* Print the BREAKING CHANGE footer under breaking entries

### Documentation

- *(magma)* Merge every pull request into dev through the merge queue
- *(styles,magma)* A pill that casts a shadow takes surface-overlay, not a wash
- *(mds-accordion-timer-item)* Describe progress as the 0 to 1 the timer writes
- *(mds-breadcrumb-item)* Describe the button part
- *(mds-button)* Describe the label part
- *(mds-button-dropdown)* Describe the dropdown part
- *(mds-card-media)* Describe the content part
- *(mds-details)* Name the slots the content part wraps
- *(mds-emoji)* Put the description of the methods before their tags
- *(mds-file-preview)* Describe the card part
- *(mds-header-bar)* Describe the content part
- *(mds-help)* Describe the icon part
- *(mds-horizontal-scroll)* Describe the content part
- *(mds-img)* Describe the media part
- *(mds-input)* Attach the part docs to the class, put the icon on the left
- *(mds-input-date)* Describe the input-date part
- *(mds-input-date-range-preselection)* Say the slot takes the label text
- *(mds-input-field)* Name the controls the field validates, describe the content part
- *(mds-input-tip)* Say active moves the tip, not the items
- *(mds-input-tip-item)* List all ten variants in the Storybook controls
- *(mds-label)* Drop the doc of a slot the label does not render
- *(mds-list-item)* Describe the icon and text parts
- *(mds-mention)* Give size its own description
- *(mds-modal)* Say mdsModalOpen emits on open, describe the dialog part
- *(mds-notification)* Say a value of 0 shows an empty dot
- *(mds-pref)* List mds-pref-theme among the children
- *(mds-price-table-list-item)* Describe the icon part
- *(mds-push-notification)* Describe behavior as shipped
- *(mds-radial-menu)* Describe the radial-menu part
- *(mds-stepper-bar)* Describe itemsDone by what it sets, fix the slot tag name
- *(mds-stepper-bar-item)* Describe value without an event that does not exist
- *(mds-tab-item)* Describe the button part
- *(mds-table)* Say what mdsTableSelectionChange emits, describe the batch bar part
- *(mds-table-footer)* Say the footer takes cells
- *(mds-table-header)* Say the header takes header cells, describe the actions part
- *(mds-table-header-cell)* Describe the action and label parts
- *(mds-toast)* Say when mdsToastClose emits
- *(mds-tooltip)* Describe the text part
- *(mds-tree-item)* Describe async and the two events by what they do
- *(mds-url-view)* Give icon its own description
- *(mds-usage)* Describe the header, icon and label parts
- *(mds-button,mds-button-dropdown,mds-input-date)* Deprecate three properties nothing reads
- *(mds-button,mds-input,mds-input-field)* Three custom property descriptions match the code
- *(magma)* Explain that "false" turns on the booleans of form-associated components
- *(magma)* Describe when the preferences announce a change, and the hidden step panels
- *(magma)* Ask breaking commits to say what to change in their footer
- *(stencil)* Give an @example to the props whose value has a format
- *(magma)* List mds-toast-region and count 115 components
- *(magma)* Document the icons package and fix the scope lists

### Features

- *(mds-stepper-bar,mds-stepper-bar-item)* Let the user ask to go back to a done step
- *(mds-button)* --mds-button-label-transform keeps a label as written
- *(mds-table,mds-table-header,mds-table-row)* The Actions column follows rows added after load
- *(mds-policy-ai)* Part chip selects the chip, the wrapper gets part chip-wrapper
- *(mds-push-notification-item)* Document the avatar part, drop the icon part
- *(mds-tree)* Deprecate async, which the tree never reads
- *(mds-img)* Let an empty alt mark the image as decorative
- *(mds-chip)* Reflect disabled, which now blocks the keyboard as well as the pointer
- *(mds-breadcrumb)* The selected colours and the disabled back button take their properties
- *(mds-modal)* --mds-modal-transition-timing-function, the misspelled name kept as an alias
- *(mds-radial-progress,mds-pref-mode,mds-accordion,mds-note)* Document the properties they read
- *(mds-card)* --mds-card-background paints the card too
- *(mds-radial-menu)* A stylesheet can set the radius and the angles
- *(mds-img)* Set crossorigin and referrerpolicy on the image, with no default
- *(mds-table-footer,mds-table)* Line the footer cells up with the rows
- *(mds-usage)* Reflect variant, which the styles read from the host attribute
- *(mds-table)* Draw the lines inside the table with their own separator colour
- *(mds-toast)* Add a hide arrow and hold the countdown while the toast is in use
- *(mds-toast,mds-toast-region)* Line up the toasts shown at once in a region

### Refactor

- *(mds-mention)* Drop the .badge rules, which match no element

### Styling

- *(mds-dropdown)* A deeper drop shadow in dark, three times the light alphas

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
