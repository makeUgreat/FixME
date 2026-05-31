# Documentation Convention

Documentation rules help agents and contributors write project documents with
the same structure, tone, and maintenance expectations. Use this convention when
creating or changing README files, AGENTS instructions, project guides, and
cross-project conventions.

API-specific implementation rules belong in `apps/api/docs/{en,kr}`. Repository
wide documentation rules belong in `docs/{en,kr}`.

## Principles

- Write for the next contributor who must make a decision from the document.
- Explain intent, rules, exceptions, and verification steps before incidental
  implementation details.
- Keep documents close to the scope they govern.
- Prefer stable project facts over temporary context.
- Update the matching English or Korean document when changing a translated
  documentation pair.

## Structure

- Use a title that names the document's actual role.
- Start with a short paragraph that explains the problem, scope, and audience.
- For convention documents, use `Principles`, `Rules`, `Examples`, and
  `Testing` or `Verification` as the default flow.
- For simple guides, use `Purpose`, `Usage`, `Commands`, and `Notes` as the
  default flow.
- Keep sections focused. Split a section when it mixes unrelated decisions.
- Link to the most specific document that owns a rule instead of repeating the
  whole rule.

## Writing Style

- Use short, direct sentences.
- Use `must`, `must not`, and `should` when the strength of a rule matters.
- Avoid vague words such as "properly", "normally", "appropriate", and "as
  needed" unless the document also gives the decision rule.
- Prefer active voice when naming who or what performs an action.
- Keep code names, file names, commands, type names, and layer names exact.
- Do not document future systems as if they already exist.

## Language Pairs

- Keep English and Korean documents aligned in meaning.
- Do not require literal translation when natural technical Korean is clearer.
- Do not translate code, file paths, commands, package names, class names, type
  names, or domain terms that are already used in code.
- When only one language changes, update the paired document before finishing
  the task.
- If a document is intentionally available in one language only, state that near
  the top of the document.

## Examples

Use examples when a rule is abstract or easy to misread.

Good examples:

- Match the current repository structure and naming conventions.
- Show the smallest useful case.
- Use realistic names from the API or workspace when relevant.

Bad examples:

- Introduce large imaginary modules that do not exist.
- Hide the rule behind unrelated business logic.
- Use names that conflict with the naming convention.

## Maintenance

- Add a link from `AGENTS.md` when a new convention should guide agent behavior.
- Add a README pointer only when it helps humans discover the document.
- Keep repo-wide conventions under `docs/{en,kr}`.
- Keep API-only conventions under `apps/api/docs/{en,kr}`.
- Check relative links after moving or renaming documents.

## Verification

Before finishing a documentation change:

- Confirm links resolve from the file that contains them.
- Confirm the English and Korean versions describe the same rules.
- Confirm the document names its scope clearly.
- Confirm examples still match current project structure.
- Confirm any agent-facing convention is referenced from `AGENTS.md`.
