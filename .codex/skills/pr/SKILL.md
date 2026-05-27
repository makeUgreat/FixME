---
name: pr
description: Use this project skill for pull request planning, PR unit decisions, PR description drafting, squash-merge history writing, and coordinating PR preparation with the cm skill.
metadata:
  short-description: Prepare history-focused pull requests
---

# pr

Use this skill when the user asks for `pr`, pull request preparation, PR unit
decisions, PR description drafting, PR review readiness, or squash-merge history
cleanup.

## Core Behavior

- Treat each PR as a permanent history record because this project uses squash
  merge by default.
- Optimize PR title and body for future readers who need to understand which PR
  introduced a change and why it was made.
- Prefer reviewable, history-meaningful PR units over file-count or commit-count
  boundaries.
- Write PR titles and descriptions in English.
- Use `cm` before PR finalization when the working tree contains uncommitted
  changes or the PR boundary is unclear.
- Never fabricate verification. Clearly report tests that were run, skipped, or
  could not be run.
- Never revert, overwrite, or discard user changes unless explicitly instructed.

## PR Unit Definition

A PR is one squash-merge history event. It should remain understandable when the
branch history contains only the squash commit title and the PR body.

Each PR candidate must pass this checklist:

- **Single history event**: The change can be explained as one problem,
  requirement, decision, or cleanup.
- **Clear reason**: A future reader can understand why the change happened
  without reconstructing the entire diff.
- **Reviewable boundary**: A reviewer can approve or reject the PR as one
  coherent decision.
- **Revertable intent**: Reverting the squash commit would remove one coherent
  change, not unrelated work.
- **Coherent verification**: The test or inspection evidence maps to the PR's
  stated intent.
- **No hidden bundle**: The PR does not hide unrelated refactors, dependency
  upgrades, documentation changes, or cleanup under a feature or fix.

If a candidate fails the checklist, propose splitting the PR. If splitting would
make the history less understandable or create broken intermediate states,
explain why the larger PR is acceptable.

## Split Rules

Keep together:

- A feature, fix, or refactor with tests that directly verify it.
- Types, configuration, migrations, lockfiles, or documentation required to make
  the same change understandable and working.
- Small supporting cleanup when it only exists to make the main change possible
  and would be misleading as a separate PR.

Split by default:

- Feature work and unrelated refactoring.
- Bug fixes and opportunistic cleanup.
- Dependency upgrades and behavior changes that merely use the upgraded
  dependency.
- Test infrastructure changes and tests for a product change.
- Documentation-only changes and runtime behavior changes.
- Changes that need different reviewers or different rollback decisions.

Ask the user before finalizing the PR plan when:

- The PR boundary is a product decision rather than a code-structure decision.
- Review boundaries and history boundaries conflict.
- Part of the diff appears to be unfinished user work.

## cm Skill Coordination

Use `cm` as the commit-level preparation step and `pr` as the PR-level history
step.

- If there are uncommitted changes, inspect the diff and use `cm` rules to form
  atomic commit candidates before drafting the PR.
- The PR unit is not automatically the same as one commit. A PR can contain
  multiple atomic commits when they form one squash-merge history event.
- Use each commit's `Why:` body as input for the PR-level `Why`, but do not
  paste commit messages as a changelog.
- Move verification reported during `cm` work into the PR `Verification`
  section.
- If `cm` suggests multiple unrelated commit groups, propose multiple PRs unless
  the user explicitly wants one combined PR.

## PR Title Rules

The title is the default squash-merge commit subject, so make it useful in
`git log`.

Subject format:

```text
<type>: <imperative summary>
```

Examples:

```text
feat: add health check endpoint
fix: reject invalid registration payloads
docs: document PR history rules
```

Rules:

- Follow Conventional Commit style when it fits the change.
- Start the summary with an imperative verb.
- Prefer intent over implementation detail.
- Use a scope only when it adds clear value.
- Do not end the title with a period.
- Avoid vague titles such as `fix bug`, `update code`, or `refactor stuff`.

## PR Body Rules

Use this structure by default:

```markdown
## Summary

- ...

## Why

...

## Changes

- ...

## Verification

- ...

## Risk / Notes

- ...
```

Section rules:

- `Summary`: State what the PR accomplishes in one to three bullets.
- `Why`: Preserve the durable context: the problem, requirement, decision,
  tradeoff, constraint, or alternative that explains why this PR exists.
- `Changes`: List the meaningful behavior or structure changes. Do not produce a
  file-by-file diff summary unless the file boundary is the point.
- `Verification`: List exact commands, tests, manual checks, or inspections that
  were performed. Include skipped or unavailable verification when relevant.
- `Risk / Notes`: Call out migrations, compatibility concerns, rollout notes,
  follow-up work, reviewer focus areas, or state `None` when there is nothing
  notable.

Do not include:

- A long commit-by-commit changelog.
- Generic checklist filler.
- Claims that tests passed unless they were actually run.
- Review instructions that belong in the user response rather than the PR body.

## Workflow

1. Inspect `git status --short`, recent commits, and the relevant diff or branch
   comparison.
2. If the working tree is not already commit-ready, apply `cm` rules first to
   identify atomic commit candidates.
3. Decide whether the change belongs in one PR or multiple PRs using the PR unit
   checklist.
4. Draft the PR title as the future squash-merge commit subject.
5. Draft the PR body using the default sections, emphasizing durable `Why`
   context.
6. Report any verification gaps separately if they need user attention before the
   PR is opened.
7. If the user asks to open or update the PR with a tool, confirm the exact title
   and body first unless they already approved them.
