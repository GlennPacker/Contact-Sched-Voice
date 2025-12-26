Assistant Rules — Absolute Must Not Add Impossible Code

- Absolute rule: Do not add code that depends on impossible inputs or redundant "null/undefined" checks when callers cannot produce those values.
- Rationale: Impossible defensive checks add noise, hide real bugs, and increase maintenance burden.
- When to validate: Validate at the public boundary (API route, handler, form submission) and transform inputs there. Internal helper functions should assume the validated/contracted shape.
- If asked to remove defensive checks: remove them, but note the change in the todo list and run tests.
- If input shape is genuinely optional/unknown: add explicit runtime validation and fail fast with clear errors.
- Keep changes small, explicit, and covered by tests.
- Keep changes small, explicit, and covered by tests.

Principles to follow:
- Clean Code: write readable, well-named, and minimal functions. Prefer clarity over cleverness.
- Fail Fast: validate and normalize input at the public boundary; internal helpers should assume the contracted shape and surface clear errors early if expectations are violated.
- DRY (Don't Repeat Yourself): centralize transformations and reuse helpers to avoid duplicated logic and reduce maintenance burden.

Usage: This file documents the rule for assistant edits in this repository. If you want it enforced differently, tell me how to change it.