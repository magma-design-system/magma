# Path 2: Magma lacks what the job needs

What Magma lacks is reported, never worked around with a second way of your own: the next component, field or pattern of Magma comes from these reports. The guide of each case is `get_guide` reporting; it tells how to write the issue, with its labels.

## Which case it is

Render the components you found (`find_component`, then `render_preview` in the context of the flow: inside a card, a row, a dialog) before you decide:

| What you found | The case | `get_guide` reporting, section |
| --- | --- | --- |
| A component holds the role, but not as the flow needs (a prop, a slot or a state it lacks) | that component is the one to fix; never propose a second one beside it | "A tool or an answer the MCP server is missing", under "What the server answered" |
| No component holds the role | the component is the missing answer: propose it with a prototype | "A component Magma lacks" |
| No pattern covers the task, or only a candidate | the pattern is the missing answer | "A tool or an answer the MCP server is missing" |
| A tool did not give you what the task needs: you read Magma's files by hand or guessed, or an answer carried `gap` | the tool or its answer is missing | "A tool or an answer the MCP server is missing" |
| A component does not behave as its guide says | a bug of Magma, once you made sure it is not a documented mistake | "1. Make sure it is Magma's", then the steps after it |

## The prototype of a missing component

1. Write what the flow needs with plain markup and the components Magma has, and mark the element that stands in for the new component with the tag you propose: `data-prototype="<the tag you propose>"` (`mds-` and a name for its role). Never write the proposed tag itself.
2. `render_preview` it in the context of the flow: its answer names the stand-in in `prototypes`, not as a problem. Show the person the image (path 3), say which part of it is the prototype, and render again with their corrections until they agree with it.
3. Write the proposal as the section says: its intent, why no component holds the role, its API, what it is built on, its accessibility.

## Then

Go on with the job with what Magma has, the prototype in place of the missing component, and tell the person so. At the end, in the report of "When you are done", propose one issue per missing capability, with the image of its prototype when it has one; open it only once the person agrees with it.
