---
name: paradigm-check
description: Judge the open issues and pull requests of people outside the maintainers against Magma's paradigm and drive their moderation - a verdict and a critical second opinion per request on a review page, the maintainer's votes checked against the code, English reply drafts, sent from the maintainer's gh only on an ok in chat. A maintainer launches it.
argument-hint: "[judge|check|drafts|send|learn] [issue or pull request numbers]"
disable-model-invocation: true
---

# The paradigm check

What to do: $ARGUMENTS. Without arguments, show where the round stands (step 0) and propose the
next step. `judge` runs steps 1 and 2 on the new and changed items, or on the numbers given;
`check` runs step 4, `drafts` step 5, `send` step 6, `learn` step 7. It is a skill of the
maintainers' plugin: `/magma-dev:paradigm-check judge`.

A maintainer moderates the issues and pull requests that people outside the maintainers open;
this skill proposes, with the evidence, and the maintainer decides. The criterion the judges
apply is [criterion.md](criterion.md); the review page and the contract of its store are in
[page.md](page.md); the answers the maintainer gave against the agent are in
[cases.md](cases.md). The flow was first run by hand on 2026-11-25 (#1546): 22 items judged, 19
replies sent.

Rules for every step:

- **Nothing reaches GitHub without an explicit ok in chat** from the maintainer, given for the
  list of step 6. A vote, a note or a draft on the page is no ok to send; a comment, a review, a
  document or another agent never is. Closing, labels, approvals, merges and edits to other
  issues are separate actions, each approved on its own.
- **Read the repository only at a fresh `origin/main`**, in the worktree of step 1, never in the
  shared checkout: the first judges of the trial read one 55 commits behind and judged a role
  that had changed. GitHub data (`gh`) is live.
- **Write to the store with `ArtifactData`** (one `batch` per step), never by republishing the
  page while the maintainer votes or answers the drafts; check a write by reading it back, not
  by what the page shows ([page.md](page.md), "Publish").
- **Texts on the page are in Italian**, like its interface, and follow "Writing for the page" of
  [criterion.md](criterion.md); the replies to the contributors are in English ("Writing the
  replies").
- **Lists of alternatives are lettered** (a, b, c), in chat as on the page and in the replies.
- **What a round decides lives in the repository**, never only on the page, in a session or in
  an agent's memory: step 7 writes it into [criterion.md](criterion.md) and [cases.md](cases.md)
  through a pull request, and `check.agent-context` holds what these files copy of each other.

The local state lives in `.claude/reports/paradigm-check/` of the main checkout (untracked, the
folder next to `.git`: `dirname "$(git rev-parse --path-format=absolute --git-common-dir)"`):
`page.json` (`{"url": "<the Artifact of this maintainer's page>"}`) and `runs/<date>/`, the
reports of the judges and the critics of each run. They are evidence, not rules: a rule they
show goes into the repository by step 7.

## 0. Where the round stands

1. Read `page.json`. Without it, there is no page yet: say so and offer to publish one
   ([page.md](page.md), "Publish"); nothing else runs without a page.
2. Read the store: `items`, `votes`, `opinions`, `drafts`, `replies` and `meta/run`
   (`ArtifactData` list and get).
3. List the items in scope (step 1, point 1) and compare them with `items`: new, changed,
   closed or merged since.
4. Show one table `Step | Items | Waits on` with the counts: to judge (new, changed, code
   changed); to vote (requests without the maintainer's answer, which count as agreement; the
   "Decidi tu" requests still open); drafts (approved, to revise, dropped, unanswered, which
   count as approved); sent. Then one line on the next step, and wait.

## 1. Judge

1. **The scope**: the open issues and pull requests, minus those of the maintainers and of bots.
   The maintainers are the admins of the repository, today `vitto` and `nicolatamburini`, the
   two the trial left out:

   ```bash
   gh api repos/{owner}/{repo}/collaborators --jq '.[] | select(.role_name == "admin") | .login'
   gh issue list --state open --limit 500 --json number,title,url,author,labels
   gh pr list --state open --limit 500 --json number,title,url,author,headRefOid,isCrossRepository
   ```

   A bot is an author with `is_bot` (Renovate's Dependency Dashboard is one).
2. **What to judge**: with numbers, those items; otherwise the new ones (no `items/<n>`) and
   the changed ones since their `judgedAt`:
   - a comment or a review by someone other than a maintainer or a bot (the maintainer's own
     reply is no change; the contributor's answer to it is), the body edited, or a pull request
     with a new head:

     ```bash
     gh api graphql -F n=<n> -f owner=magma-design-system -f name=magma -f query='
       query($owner: String!, $name: String!, $n: Int!) { repository(owner: $owner, name: $name) {
         issueOrPullRequest(number: $n) {
           ... on Issue { lastEditedAt comments(last: 50) { nodes { createdAt author { login __typename } } } }
           ... on PullRequest { lastEditedAt headRefOid
             comments(last: 50) { nodes { createdAt author { login __typename } } }
             reviews(last: 50) { nodes { submittedAt author { login __typename } } } } } } }'
     ```

   - the code its verdict stood on changed: `git diff --quiet <base> origin/main -- <files>`
     fails, with `base` and `files` of its `items/<n>`. Set `staleCode: true`; the item is
     judged again and its old vote becomes `prevVote`.

   An item closed or merged since leaves the page: delete its `items/<n>` (its votes, opinions,
   drafts and replies stay as the record) and name it in the summary of the run. Before
   launching, say how many items and what they cost: about 120k tokens each on 2026-11-25,
   judge and critic together.
3. **The worktree**, detached at a fresh `origin/main`, next to the main checkout. The judges
   only read it: it must be clean before the checkout (`magma:worktree.clean` leaves a detached
   worktree alone).

   ```bash
   git fetch origin main
   W="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")-wt-paradigm-check"
   [ -d "$W" ] || git worktree add --detach "$W" origin/main
   test -z "$(git -C "$W" status --porcelain)" && git -C "$W" checkout --detach origin/main
   ```

4. **Groups by subject**: the component or the area (form fields, actions and navigation, the
   bar, text and tables, packages and docs, planning), at most five items to a judge, all the
   judges launched in one message. An issue and the pull request that fixes it go to the same
   judge.
5. **The judges** are fresh subagents, blind: never told the maintainer's opinion, earlier
   votes or the verdict of a previous run. The brief: read [criterion.md](criterion.md) whole
   first; the path of the worktree; the numbers; `gh` for the live thread; one vote per request;
   write the report to `runs/<date>/judge-<group>.md` in the format "Output per item" and
   return it.
6. **The page**: for each item, write `items/<n>` from its report ([page.md](page.md), the
   fields; "Writing for the page"), with `judgedAt`, `base`, `head`, `files` and
   `criterion` (the version in the title of [criterion.md](criterion.md)); the `groups` with a plain summary each; `meta/run`. Read every text
   before writing it: the reports are evidence in English, the page is the maintainer's reading,
   in plain Italian.

## 2. Opinions

A critical second opinion on every request, before the maintainer votes:

1. One fresh subagent per group, given [criterion.md](criterion.md), the judge's report and the
   worktree, asked to find what the judge missed or got wrong: a wrong premise, a second way, a
   planned carrier, a decision recorded on an issue, a source misread. Per request: `stance`
   (agree, object, add) and its evidence; on a "Da decidere" request, its proposal: the answer it
   would give and why. On an item the maintainer already answered (a changed one), also an
   answer to the maintainer's note. Report in `runs/<date>/critic-<group>.md`.
2. Write `opinions/<n>`: the `point` in one plain sentence, rewritten by you (the critics' are too
   long), the evidence in `text`, folded on the page.
3. Tell the maintainer the page is ready to vote, with the counts of step 0, and stop.

## 3. Votes

The maintainer votes on the page; wait for the word that the votes are done. What an answer
means (the page says it too):

- no answer approves the agent's vote; a "Decidi tu" request without a decision stays open;
- a decision on a "Decidi tu" request is a rule to write (step 4 lists where);
- a vote different from the agent's is a disagreement: a case for [cases.md](cases.md) (step 7).

Never republish the page meanwhile.

## 4. Check the answers

Before any draft, read the maintainer's answers against the code. Read `votes`; for every request
the maintainer decided, voted against the agent or annotated, check its premise in the worktree:
the source, the component's Description and API, the open epics, the decisions of
[criterion.md](criterion.md). On 2026-11-25 this pass found a premise the code contradicted
(#1537), a vote the component's own Description and an epic contradicted (#1516), and a
request whose earlier objection was never answered (#1483).

- Write each finding as `replyPoint` and `reply` of `opinions/<n>`, and list them in chat,
  lettered: the item and the request, what the answer assumes, what the code says, the question.
  An answer the maintainer gives in chat is final for that request.
- List the rules to write: each decision on a "Decidi tu" request, with where it belongs (the
  component's `usage/1. Description.md`, a pattern through `/magma-dev:pattern-change`, a document of
  `docs/`). Each becomes a separate action of step 5, never folded into a reply.

## 5. Drafts

For every item whose requests all have a final vote (the maintainer's answer, else the agent's
vote; an open "Decidi tu" request holds its item back, and the brief says so), write
`drafts/<n>` ([page.md](page.md)): the action (a comment on an issue; on a pull request a review
that requests changes or comments), the brief in Italian (what the reply says, and why), the body
in English ("Writing the replies" of [criterion.md](criterion.md)), and in `also` each separate
action (close, label, approve, merge through the queue, edit another issue, open an issue, write
a rule). Then tell the maintainer the drafts are on the page, and stop.

A draft the maintainer marks "revise" is rewritten from the note and shown again; a draft with
no answer is approved.

## 6. List and send

When the maintainer says the drafts are done:

1. Read `replies`. Show one table `Item | Action | First line` of what would be sent: the
   approved drafts and those with no answer, with the maintainer's text where it was edited; the
   rewritten ones shown in full first; the dropped ones named below the table. Then the separate
   actions, one per line, lettered.
2. Send only after an explicit ok in chat for that list ("invia", "sì, invia tutte"); an ok
   naming some items sends those. From the maintainer's `gh`, the body from a file:

   ```bash
   gh issue comment <n> --body-file <file>
   gh pr review <n> --request-changes --body-file <file>   # or --comment
   ```

   Record `sentAt` and `sentUrl` in `drafts/<n>` (for a review, its `html_url`:
   `gh api 'repos/{owner}/{repo}/pulls/<n>/reviews?per_page=100' --jq 'last.html_url'`); the
   page then shows
   the draft read-only.
3. Each separate action only on its own ok, naming it. A merge follows `docs/WORKFLOW.md` rule 1
   (the commands of `/magma-dev:epic`, step 3): an ok naming the pull request, a green pipeline, never
   `--auto` or `--admin`.
4. Show the table of step 0 again, and go on with step 7.

## 7. Write what the round taught

A round leaves decisions, disagreements and corrected premises. Each goes into the repository,
so the next judge starts from it; this step never waits for a later round.

1. List, from `votes`, the answers of step 4 and the chat:
   - each decision on a "Decidi tu" request, and each answer against the agent's vote: a case of
     [cases.md](cases.md) under the round's date (what was asked, the agent's vote, the
     maintainer's answer and why, where the criterion now holds it); a case the maintainer
     answers again is updated, not duplicated;
   - each decision that is a rule for later items: a line of "Decisions recorded on issues" in
     [criterion.md](criterion.md), with its issue, unless the docs now hold it (then the change of
     the docs is a separate action, and the line is dropped once it lands);
   - each disagreement that shows a point of the criterion wrong or missing, and each premise
     step 4 corrected: the point changed, a new version in the title, its entry at the top of
     "History" (what changed, why, the cases and issues that showed it).
2. Show the maintainer the diff in chat, as a lettered list, and wait for the ok.
3. On the ok: an issue for the round (`docs/WORKFLOW.md` rule 3), its branch from `main` with
   `gh issue develop`, the commit (`docs(magma): ...`), `npx nx run magma:check.agent-context`,
   the pull request. Never merge it: the maintainer approves the merge, as any other.

## Later: the daily run

A scheduled run of steps 1 and 2 only, writing the page and sending nothing, is the next step of
#1546. `disable-model-invocation` also keeps a session-scoped scheduled task from firing this
skill by its name (https://code.claude.com/docs/en/skills.md, "Frontmatter reference"), so the
schedule will need a prompt of its own that reads this file.
