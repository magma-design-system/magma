# Path 1: build or change an interface with what Magma has

The order: the flow first, then the components, then how they stand together, then colour and icons. Each step asks the magma server.

## 1. The flow

When the interface tells the person something or makes them wait or decide (a message, a confirmation, an empty, a loading or a failed part): `get_pattern` with the need in words, then with the pattern and the values of its variables you know. It returns the case to follow, the same in every product, with the rules of the design language it relies on (`rules`) and the pattern's "Always true" rules.

- Compose the case from the parts its `use` names, each with its role when the answer gives one, in the order of its preview; a value in angle brackets is the text your application writes there.
- Read the stage of the preview as context only: its elements marked `data-stage` are the page around the case, not part of it. Then add what your situation needs.
- Before composing a part by hand, find the components that hold its role (`find_component` with the need in words) and render them in your context. One that does the job is used as it is. One that holds the role but does not fit, or none that holds it, is path 2.
- No pattern covers the task, or only a candidate: tell the person, and which choice you made instead; show that choice rendered before you build on it (path 3). The missing pattern is reported as path 2 says.
- An open choice of the pattern that the product wants fixed for good goes in its layer, not in the code: `/magma:pattern-layer`.

## 2. The components

Pick the component by the need, before you search: read the table of each category your need belongs to. A row gives what answers a need: a component, a pattern (`get_pattern` with its id) or `gap`, when Magma has nothing for it yet (path 2). Each category says which components its table holds so far:

{{componentCategories}}

No row takes your need, or the component it needs is not in a table yet: `find_component` with the need in words. Then, for the one you pick:

- `get_component`: its API (props and their values, events, slots, parts) and the rules of the design language that govern it (`rules`): what it draws by itself, such as the inset of `mds-banner`, you do not add again;
- `get_usage`: how the project's framework writes it (the import, the element or wrapper, each prop and event).

## 3. The composition

How the parts stand together is decided by the domains of the design language, which `get_pattern` lists first (kind `design-language`; `foundation` with magma 2.11 and before). Read the one you need with `get_guide` by its id, and follow the `rules` the answers above give:

- `rhythm`: the space between two elements is the step of their relation, never one picked by eye;
- a section of a page that Magma ships as a building block (kind `block`, such as `page-header`, the head of a page) is laid out from `get_pattern` with its id and the values of its variables: the regions it returns, in that order.

## 4. Colour, spacing, classes

`list_tokens` finds the role for a need, `suggest_role` the role for a colour you were given. Magma spacing steps are hundredths of a rem (`p-400` is 16px, `p-4` is 0.16px): `explain_class` on any class you are not sure of.

## 5. Icons

`find_icon` for a slug that exists in the sets the project serves; check every slug before writing it in `icon="..."`.

Then "When you are done", in SKILL.md.
