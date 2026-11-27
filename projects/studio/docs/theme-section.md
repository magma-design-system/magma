# The Theme section

The theme on a scene of a product, the whole section, with the axes and the preview it is checked
under: outside the stages, a link of the bar.

Addresses: `#/theme`, `#/theme/<theme>` and `#/theme/<theme>/<light|dark|both>`. The code is
`src/theme-section.tsx` and `src/scene-prefs.tsx`, not moved into `features/` yet: the axes become
stages after the Exceptions (object model, section 5).

The Theme section shows the scene (`scene.html`) in an iframe, a document of its own: the theme is
set on its `<html>` (`data-theme-name`), and so are the preferences of the person, as the
`mds-pref-*` of Magma write them. Both move the scene and leave the studio alone (#695, "The
dogfooding constraint"). An axis of the bar opens its controls in an `mds-dropdown` from its
button, and the bar shows only the axes with controls: today the preferences, the others come back
with theirs (#696).
Their dropdown holds controls of the studio, not the `mds-pref-*` themselves, which would write on
the document of the studio: every choice is written on the `<html>` of every frame, the mode and
the contrast by `applyFrame`, the animations and the consumption by `applyPrefs`
(`src/scene-prefs.tsx`), as the components write them. The scene holds no `mds-pref-*` of its own:
it would keep its choice in the storage of the origin, which the frames share with the studio's own
preferences (#1336, [Languages](languages.md)). Their modes, words and defaults are those of the
components (`test/scene-prefs.test.mts` holds them to the sources).

The select offers the themes of the configuration being edited, the ones the stage
[Themes](themes.md) lists (each tint with a surface, the base first), and the frame paints them:
the studio writes into it, over the stylesheets of the installed Magma, the palette of the
configuration and the block of each theme, printed by the code that writes the files Magma ships
(`colors-rgb.css` and `themes.css`, `src/engine/scene-css.ts`). So `porcelain` is a theme of the
bundled configuration though Magma ships none by that name. The choices made in Themes, the name of
a theme, the accents it repoints and the colour modes it is used in, are the studio's
(`src/state/theme-choices.ts`): the frame paints the themes as the CSS of the themes exports them
([The preset in and out](preset.md)), and a
theme of one mode is seen in that mode only, the other modes of the preferences off and
`pref-theme-scheme-<mode>` on the frame, as mds-pref-theme writes it. They are kept in the
storage of the studio beside the draft, so a reload keeps them, until the configuration keeps the
themes itself (#694).

What the theme is checked under, not what is edited (#697), opens from the same bar, so the frame
takes the whole section (2026-11-06): the mode (light, dark, or both side by side, two frames that
scroll together) and the contrast head the dropdown of the preferences of the person; the ruler
opens the preview, the view (Scenes or Groups, below) and the width of the frame (the room of the
section, or a breakpoint of Magma, `--breakpoint-desktop`, `-tablet`, `-mobile`, where its layouts
change). The mode and the contrast are not exported: the studio writes them on the `<html>` of
each frame as the preferences of Magma do (`applyFrame`), and the panel of the scene has neither,
since a mode stored in the origin would bring the two frames to the same one.

The scene is a demo of the components, as the one of the daisyUI theme generator (#697, Scenes):
the desk of an office of a back office, one card per task side by side in columns, so a theme is
judged on most of Magma at once: a hue on a themed surface, text at every prominence, borders, a
disabled state, the solid fills of the main actions, the colours of the states. The steps of the
request in hand take the width of the page above the columns: `mds-stepper-bar` centres the
current step and would push the first out of a column. Its bar is the `inline` appearance of
`mds-header`, a box of the page under the bar of the studio, so the two never read as one; its
words are written in English and shown in the language of the studio ([Languages](languages.md)).

The Groups view of the preview (`groups.html`; the view [Groups](groups.md) is another) shows the
components by their role in the composition, the
vocabulary of the dimension axis, so the preview explains the controls beside it: `container`
(card, banner, accordion, table, dropdown, tooltip, the window of a dialog), `control` (button,
input, select, textarea, tab) and `marker` (checkbox, switch, badge, chip, label, avatar, dot).
The groups and their members are those of the draft of the axis (#691,
`projects/styles/draft/theme-dimension-design.md`, section 3, on `691-dimension-axis-draft`) until
the axis lands. Each component is shown at every variant, tone and state it publishes
(`magma.api.txt`), the brand buttons aside, with the surfaces, the text at every prominence and the
borders at every level. Two things it does not draw on load: the focus ring, since a frame that
took the focus would take it from the studio (Tab into the frame to see it), and an open modal,
which would cover the frame (its window stands for it). The avatars carry an icon: initials pick
the colour of the person and override the variant.
