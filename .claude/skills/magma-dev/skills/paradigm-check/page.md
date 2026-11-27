# The review page

The maintainer reads the verdicts, votes and approves the replies on one page: an Artifact,
private to the maintainer, with a shared store (the `db` capability). [page.html](page.html) is
its source; the data never goes into the HTML, only into the store. The agent writes the
verdicts, the opinions and the drafts with `ArtifactData`; the page writes the maintainer's
votes and answers. Each maintainer has a page of their own: its address is in `page.json` of the
local state ([SKILL.md](SKILL.md)), never in the repository.

## What it shows

Its interface is in Italian. Two views of the same cards, grouped by subject, each group with its
summary: "Bozze di risposta" (the problem and the draft) and "Voti e pareri" (the requests, the
opinions and the votes). A card reads top to bottom:

- the number (a link to GitHub), issue or pull request, "codice cambiato" when `staleCode`, the
  agent's overall vote;
- the title as on GitHub, the issue or pull request it points at, the problem in plain words;
- each request: what it asks and its vote, "La questione", then "Nel dettaglio" (the example,
  the why, the lettered options, what follows), then Claude's opinion with its evidence folded,
  then the maintainer's vote and note on that request;
- the draft of the reply: the action, the brief, the English text the maintainer may edit, the
  separate actions, the maintainer's approval; once sent, a link to it and the text read-only.

Above the cards: what the votes are for, the last run (`meta/run`), a tally ("I tuoi voti: N su
M", agreements, disagreements, decisions, drafts by answer) and filters ("Decidi tu", "Senza il
tuo voto", "In disaccordo"). Below: the two scales.

The agent's "Da decidere" is shown as "Decidi tu", and is never an option of the maintainer's
menu: the maintainer's vote is always a decision.

## Publish

- **The first time** (no `page.json`): read [page.html](page.html) whole, publish it with the
  Artifact tool (`icon: "checklist"`), declaring the store, and write its address to
  `page.json`. Load the `artifact-capabilities` skill before passing `capabilities`. Every
  collection is read by whoever views the page and written by its owner, the maintainer, which
  is also who `ArtifactData` writes as:

  ```json
  {"db": {"rules": [
    {"path": "items", "read": "view", "write": "owner"},
    {"path": "groups", "read": "view", "write": "owner"},
    {"path": "meta", "read": "view", "write": "owner"},
    {"path": "votes", "read": "view", "write": "owner"},
    {"path": "opinions", "read": "view", "write": "owner"},
    {"path": "drafts", "read": "view", "write": "owner"},
    {"path": "replies", "read": "view", "write": "owner"}
  ]}}
  ```

  The page of 2026-11-25 declares the first four only; declare all seven when it is published
  again.
- **Again**, only when [page.html](page.html) changed, and only between rounds: before step 1,
  never while the maintainer votes or answers the drafts. On 2026-11-25 the writes of an open
  page stopped persisting while it was republished during the votes. Since then the page says
  "Salvato" only once the store confirms the write, and keeps the unsaved fields across a reload;
  still, check the maintainer's writes with `ArtifactData`, not from what the page shows.

## The store

The id of a document is the number of its item as a string (`"1518"`); issues and pull requests
share GitHub's numbering. Times are ISO strings. Texts may hold `code` in backticks: the page
renders them as code.

| Collection | Written by | Holds |
|---|---|---|
| `items/<n>` | agent | the verdict of an item |
| `groups/<id>` | agent | a subject and its summary |
| `meta/run` | agent | the last run |
| `opinions/<n>` | agent | the second opinion on each request, and the answers to the maintainer's notes |
| `drafts/<n>` | agent | the reply to send, and the record once sent |
| `votes/<n>` | page | the maintainer's votes and notes |
| `replies/<n>` | page | the maintainer's answers to the drafts |

The agent reads `votes` and `replies` and never writes them.

### `items/<n>`

| Field | Value |
|---|---|
| `n` | the number |
| `kind` | `"issue"` or `"pr"` |
| `group`, `order` | the id of its group, and its place in it |
| `url` | the address on GitHub |
| `title` | the title as written on GitHub |
| `summary` | the problem, in plain Italian, one or two sentences |
| `vote` | the overall vote: `"Da decidere"` when a request is, else the vote of the first request |
| `parts` | one entry per request, even for one: `{ask, vote, plain, why, example, options[], after}` ([criterion.md](criterion.md), "Writing for the page") |
| `related` | the items it points at: `[{id, n, kind, url, text}]`, `text` as "Correzione proposta:" or "Corregge la issue:" |
| `prevVote` | the overall vote before the item was judged again |
| `staleCode` | `true` when the code its verdict stood on changed after the judgment |
| `judgedAt`, `base`, `head`, `files`, `criterion` | for the next run, not shown: when it was judged, the commit of `origin/main` read, the head of a pull request, the paths the verdict stands on, the version in the title of [criterion.md](criterion.md) |

A vote is a value of the scales of [criterion.md](criterion.md), written exactly as there (in
Italian); the page colours these strings and offers them in its menus, and `check.agent-context`
holds the two equal.

### `groups/<id>`

`{order, title, summary}`: the subject in a few words, and in one or two plain sentences what
its items have in common and how they went. The id is a short slug of the subject.

### `meta/run`

`{runAt, base, scope, stale, staleNote}`: when the run ended, the short commit of `origin/main`
it read, the scope in words ("22 elementi: 19 issue e 3 PR, esclusi i maintainer e i bot"), and
`stale` with its note when the reading may be outdated (shown as a warning).

### `votes/<n>`

Written by the page. An item of one request: `{vote, note, at}`. An item of several:
`{parts: {"1": {vote, note}, ...}, at}`, and `before: {vote, note}` when the maintainer had voted
the whole item before votes were per request. An empty or missing `vote` is no answer. What each
answer means is step 3 of [SKILL.md](SKILL.md).

### `opinions/<n>`

`{parts: {"1": {stance, point, text, replyPoint, reply}, ...}, at}`:

- `stance`: `agree`, `object` or `add`, on the agent's vote; on a "Da decidere" request the page
  shows "La mia proposta" whatever the stance, and `point` is the proposal;
- `point`: the opinion in one plain sentence; `text`: the evidence, folded under it;
- `replyPoint` and `reply`: the answer to the maintainer's note (step 4 of [SKILL.md](SKILL.md)),
  shown as "Sulla tua risposta di prima".

### `drafts/<n>`

| Field | Value |
|---|---|
| `action` | `"comment"` (an issue), `"review-changes"` or `"review-comment"` (a pull request) |
| `actionLabel` | the action in Italian ("Commento sulla issue", "Review: modifiche richieste") |
| `brief` | in Italian: what the reply says, and why |
| `body` | the English text that would be sent ([criterion.md](criterion.md), "Writing the replies") |
| `also` | the separate actions, one string each, in Italian: each approved apart in chat |
| `at` | when it was written |
| `sentAt`, `sentUrl` | once sent: when, and the address of the comment or review; the page then shows it read-only |

### `replies/<n>`

Written by the page: `{status, note, body, at}`. `status` is `"ok"`, `"revise"` (rewrite it
from the note), `"drop"` (it is not sent) or empty (no answer: approved). `body` is the
maintainer's edited text, empty when the draft was not edited.
