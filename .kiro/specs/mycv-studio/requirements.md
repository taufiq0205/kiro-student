# Requirements Document

MyCV Studio is a student CV and portfolio builder for the 60-minute coding segment of the Kiro workshop. This is a Requirements-First Feature Spec. Review these requirements before approving the [design draft](design.md) and [task draft](tasks.md). The [workshop prompt pack](../../../../02_Kiro_Prompt_Pack.md) defines the MVP scope. [Kiro Requirements-First workflow](https://kiro.dev/docs/specs/feature-specs/requirements-first/)

## Requirement 1 — Start and resume a CV

**User story** — As a student, I want to start editing with one click and keep my work when I reload.

### Acceptance criteria

1.1 WHEN a student opens `/` without a saved session, THE SYSTEM SHALL show **Start my CV** and wait for a click before initiating anonymous sign-in.

1.2 WHEN anonymous sign-in succeeds or the system restores a valid session, THE SYSTEM SHALL load that owner's CV or create a single blank, private draft if one is missing.

1.3 WHEN a student returns on the same browser and site origin with a valid session, THE SYSTEM SHALL restore editing access to the same CV.

1.4 WHILE offering anonymous editing, THE SYSTEM SHALL explain that editing access depends on browser storage and the site address, and that students should start their final CV on their deployed Netlify URL.

## Requirement 2 — Edit the CV profile

**User story** — As a student, I want to save my profile so I can present my background and skills.

### Acceptance criteria

2.1 WHEN the owner opens **Profile**, THE SYSTEM SHALL show editable fields for full name, headline, summary, university, degree, location, comma-separated skills, GitHub URL and LinkedIn URL, prefilled from the saved CV.

2.2 WHEN the owner saves valid edits, THE SYSTEM SHALL persist them and show the saved values after refresh.

2.3 WHEN profile text exceeds the schema limits, THE SYSTEM SHALL explain the relevant field limit before sending a write.

## Requirement 3 — Manage portfolio projects

**User story** — As a student, I want to manage projects so my portfolio reflects my current work.

### Acceptance criteria

3.1 WHEN the owner opens **Projects**, THE SYSTEM SHALL show their CV's saved projects newest first, or an empty state if there are none.

3.2 WHEN the owner submits a valid project, THE SYSTEM SHALL save its title, description, tech stack and optional project URL under their CV and show it after refresh.

3.3 WHEN the owner saves valid changes to a project, THE SYSTEM SHALL show the updated card and retain the changes after refresh.

3.4 WHEN the owner requests deletion, THE SYSTEM SHALL ask for confirmation. WHEN the owner confirms, THE SYSTEM SHALL delete the project and keep it absent after refresh. WHEN the owner cancels, THE SYSTEM SHALL keep the project.

3.5 WHEN a project title is blank or text exceeds the schema limits, THE SYSTEM SHALL show field feedback before sending a write.

## Requirement 4 — Publish and view a CV

**User story** — As a student, I want to control when a shareable CV is visible. As a visitor, I want to open it without signing in.

### Acceptance criteria

4.1 WHEN the owner opens **Publish & Share**, THE SYSTEM SHALL show the saved Private or Published status and expose the copyable `/?cv=<uuid>` link only while published.

4.2 WHEN the owner publishes a CV with a saved non-blank name or unpublishes it, THE SYSTEM SHALL persist the new status. WHEN the owner tries to publish without a saved non-blank name, THE SYSTEM SHALL explain how to resolve it.

4.3 WHEN a visitor opens `/?cv=<uuid>` for a published CV, THE SYSTEM SHALL show its profile and projects in a read-only view, with technology tags and demo links where available, without initiating sign-in or using an owner session.

4.4 WHEN a public URL identifies a draft, an unpublished CV or a missing CV, or contains a malformed ID, THE SYSTEM SHALL display **CV unavailable** without rendering any private fields or projects. This applies to fresh loads and reloads, including in the owner's browser.

## Requirement 5 — Enforce access and validate links

**User story** — As a student, I want my draft and editing access protected even when requests reach the database outside the UI.

### Acceptance criteria

5.1 WHEN a visitor makes an unauthenticated request to the Supabase Data API, THE DATABASE SHALL allow reads of published CVs and their projects only and prevent writes.

5.2 WHEN a signed-in student requests another owner's data, THE DATABASE SHALL allow reads only for published CVs and their projects and prevent changes to the other owner's records, including adding a project under their CV.

5.3 WHEN the user enters a non-empty GitHub, LinkedIn or project link, THE SYSTEM SHALL accept only valid `http://` or `https://` URLs. WHEN rendering a valid external link, THE SYSTEM SHALL open it with `target="_blank"` and `rel="noopener noreferrer"` and omit invalid stored URLs.

5.4 WHEN building the site, THE BUILD SHALL use `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as public configuration and keep database passwords, Supabase secret keys and service-role credentials out of the source and bundle.

## Requirement 6 — Use and deploy the workshop app

**User story** — As a workshop student, I want a usable editor and a build I can upload to Netlify.

### Acceptance criteria

6.1 WHEN opening the editor or public CV at phone or desktop widths, THE SYSTEM SHALL present a responsive layout without horizontal overflow, with visible form labels and keyboard-operable controls.

6.2 WHILE a read or write is pending, THE SYSTEM SHALL show loading or saving feedback. WHEN a write succeeds or a request fails, THE SYSTEM SHALL show the outcome and preserve unsaved form values on failure.

6.3 WHEN `npm run build` completes using valid public configuration, THE BUILD SHALL produce `dist/` ready for manual Netlify upload. WHEN hosted on Netlify, THE SYSTEM SHALL load `/` and support opening and reloading `/?cv=<uuid>` directly over HTTPS.

## Workshop constraints

Use JavaScript, React functional components, Vite, Tailwind CSS v4 with `@tailwindcss/vite`, and `@supabase/supabase-js` v2. Use the supplied [Supabase schema and RLS policies](../../../../supabase/01_schema_rls.sql). The classroom UI captures the listed CV fields. Manual Netlify deployment requires only the built files. Defer durable auth, sensitive personal fields such as MyKad or home address, uploads, custom server code, routing libraries and UI component libraries. Browser Print/Save PDF is optional after the core flow passes.
