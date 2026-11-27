# MyCV Studio

## Project overview

MyCV Studio is a workshop app for creating a CV and publishing a shareable link. The frontend uses React, Vite, and Tailwind CSS v4. Supabase provides email/password authentication and row-level security. Netlify hosts the static build.

Read the [requirements](.kiro/specs/mycv-studio/requirements.md), [design](.kiro/specs/mycv-studio/design.md), and [task checklist](.kiro/specs/mycv-studio/tasks.md) before changing behavior. Mark a task complete after its required checks pass.

Run `npm ci` to install dependencies, `npm run dev` to start the app, and `npm run build` to verify the static build. Use fictional CV data. Keep the Supabase URL and publishable key in the ignored `.env.local`. Keep secret and service-role keys out of frontend code and Git.

## Git workflow

1. Update the baseline with `git switch main` and `git pull --ff-only origin main`.
2. Create one branch per task item, using `task/<number>-<short-name>`, such as `task/2-save-profiles-and-projects`.
3. Keep commits scoped to the task. Review `git diff --cached` before committing and leave local credentials and generated output out of Git.
4. Run the build and the task's acceptance checks. Record live and mocked results separately in the pull request.
5. Push the task branch and open a pull request against `main`. Merge after review and passing checks. Keep direct pushes to `main` for explicitly approved work.

## Local skills

Open `.agents/skills/<name>/SKILL.md` before doing matching work. These skills are checked into the workshop repository.

| Work | Skills |
| --- | --- |
| Supabase Auth, API, and database | `supabase`, `supabase-postgres-best-practices` |
| Netlify deployment and hosting | `netlify-deploy`, `netlify-config`, `netlify-frameworks`, `netlify-caching`, `netlify-image-cdn` |
| Netlify services | `netlify-functions`, `netlify-edge-functions`, `netlify-server`, `netlify-forms`, `netlify-blobs`, `netlify-database` |
| Netlify access and integrations | `netlify-access-control`, `netlify-identity`, `netlify-agent-runner`, `netlify-ai-gateway`, `netlify-mcp-servers` |
| Better Auth, if a task explicitly uses it | `better-auth-best-practices`, `better-auth-security-best-practices`, `create-auth`, `email-and-password-best-practices`, `organization-best-practices`, `two-factor-authentication-best-practices` |
