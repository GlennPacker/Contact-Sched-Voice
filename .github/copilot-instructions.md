# Copilot / AI agent instructions — Contact Sched Voice

Purpose: short, actionable guidance to help AI coding agents be productive in this codebase.

- Quick start
  - Dev server: `npm run dev` (Next.js). Tests: `npm test` (runs jest in-band).
  - Environment required for runtime features:
    - NOTE: code expects `NEXT_PUBLIC__SUPABASE_URL` and `NEXT_PUBLIC__SUPABASE_ANON_KEY` (double underscore) in `lib/supabaseClient.js` — verify env names when running locally.
    - Optional rate variables read by the form: `NEXT_PUBLIC_RATE_FULL_DAY`, `NEXT_PUBLIC_RATE_HALF_DAY`, `NEXT_PUBLIC_RATE_TWO_HOUR`, `NEXT_PUBLIC_RATE_HOUR`, `NEXT_PUBLIC_RATE_JOB`.

- Big-picture architecture
  - Next.js app with server-rendered pages for list pages and client React forms for creation/edit flows.
  - `pages/contacts/index.jsx` uses `getServerSideProps` and `lib/contactService.listContacts()` to fetch data server-side.
  - Database access is encapsulated in `lib/*Service.js` and uses the Supabase client from `lib/supabaseClient.js`.
  - UI components live in `components/` and smaller page-specific styles live under `pages/...` (e.g., `pages/contacts/CreateContact.module.scss`).
  - DB migrations are in `db/migrations/` and reveal table shapes and recent schema changes.

- Key patterns & conventions (project-specific)
  - Supabase client import: `import { supabase } from '../../lib/supabaseClient'` (use the central client, don't create new clients).
  - Service functions return either `{ data, error }` (insert helpers) or throw (some list helpers). Check the function signature before calling.
  - Contact form uses `react-hook-form` and stores `contactTypes` as an object in the form, then converts to an array before sending to the service (see `components/Contact/Contact.jsx`).
  - Data shape for a contact (important):
    ```json
    {
      "name": "Full Name",
      "contactTypes": [ { "contactType": "email", "metadata": "name@example.com" } ],
      "addresses": [ { "address": "...", "visits": [ { "date":"YYYY-MM-DD", "time":"full day" } ] } ]
    }
    ```
  - Watch for two notable inconsistencies/typos that are important for automated edits:
    - Env var names: README uses `NEXT_PUBLIC_SUPABASE_*` but `lib/supabaseClient.js` reads `NEXT_PUBLIC__SUPABASE_*` (double underscore). Confirm which to use when touching envs.
    - Visit row property typo: code references `isFlexilbe` (misspelling) in `lib/contactService.insertVisitRow` and migrations. Search/replace should preserve intent and update migrations/tests if renaming.

- Data flow & integration points to be careful with
  - Server-side fetches: `pages/*` use service functions directly inside `getServerSideProps` — changes to services impact SSR responses.
  - Calendar link creation is pure frontend helpers in `lib/calendarService.js` (no external API keys). Use `contactCreateAppointment()` to generate Google Calendar links.
  - Creating contacts is multi-step: `addContact` builds a flat contact row, inserts contact, inserts addresses, then inserts visits. Each DB insert returns `{data,error}`; callers often check `error` and propagate it.

- Tests & dev workflow notes
  - Tests use Jest + React Testing Library. Run with `npm test` (script: `jest --runInBand`).
  - Snapshot-like tests exist for components and services under `components/*/*.test.js` and `lib/*.test.js`.

- Helpful file references (examples)
  - Server-side list: `pages/contacts/index.jsx`
  - Contact form and conversion logic: `components/Contact/Contact.jsx`
  - Supabase client: `lib/supabaseClient.js`
  - Contact DB operations: `lib/contactService.js`
  - Calendar helpers: `lib/calendarService.js`
  - DB migrations: `db/migrations/`

- When making edits, prefer:
  - Updating or extending `lib/*Service.js` for data changes, then minimally touching pages/components.
  - Running `npm test` after changes that affect logic; run `npm run dev` for UI checks.

If anything here is unclear or you want me to expand sections (e.g., add quick code snippets for common edits), tell me which part to iterate on.

**Policies & Assistant Rules**

- Always follow the repository's assistant and policy files when making changes or suggestions. Key files to read and respect:
  - `ASSISTANT_RULES.md`
  - `NO_COMMENTS_POLICY.md`

- Enforcement guidance for AI agents:
  - Do not add or remove code that violates the rules in `ASSISTANT_RULES.md`.
  - Avoid inserting comments or content that contravenes `NO_COMMENTS_POLICY.md`.
  - If a requested change would conflict with these policies, explain the conflict briefly and propose an alternative that complies.

These policy references are intentionally brief — ask if you want the exact policy snippets copied into this file for offline reference.
