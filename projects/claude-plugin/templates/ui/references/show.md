# Path 3: the person has to decide

A decision on an interface taken from words is taken blind: show it. This holds for a choice between options (a layout, where a message goes, which of two components), for the choice you make where no pattern covers the task, and for a prototype you propose (path 2), before you build on any of them. The procedure in full: `get_guide` mcp, section "Show the person what you mean".

1. **Render each option** with `render_preview`, as the product would write it: the real components, the real texts, the layout around them. A modal, a drawer or a toast sits on the viewport: give a `height`.
2. **Read the report before the image.** When it is not representative, it names what is wrong, element by element: fix your markup and render again. Show an image with a problem only with the problem said next to it.
3. **Send the image files.** Claude Code passes the images to you and may not show them to the person: attach each file the tool returns, never copy the image data by hand.
4. **Ask.** Each option with its image, a name and one line on what it means, the one you recommend first and marked as such. Let the person flag an image, and keep an empty field for an answer of their own.
5. **Render a free answer before acting on it**: show what you understood and act only once the person confirms it.

Then go back to the path you came from.
