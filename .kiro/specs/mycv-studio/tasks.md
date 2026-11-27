# Implementation Plan

Draft for review after [requirements](requirements.md) and [design](design.md). Run one task at a time in Kiro. Leave each checkbox open until its required verification passes. The estimates target 60 minutes of guided coding, assuming Node and Supabase are ready, with a separate 10-minute Netlify block as in the [workshop lab](../../../../01_Hands_On_Lab.md).

- [x] 1. Set up the app and private CV session (18 min)
  - **Scaffold React/Vite and Tailwind (8 min)**
    - Scaffold in `kiro-student/` and preserve the existing spec, `.env.local` and `.gitignore`. Add Tailwind v4 with `@tailwindcss/vite` and `@import "tailwindcss"`.
    - Verify `npm run dev` loads the app and renders a Tailwind utility style.
    - _Requirements: 6.1, 6.3_
  - **Connect Supabase and restore the owner session (10 min)**
    - Create a confirmed workshop account. Use the project URL and publishable key. Wire email/password sign-in and restore the owner session to load or create the private draft.
    - Verify an initial visit makes no sign-in request. Sign in and check that one private CV loads. Hard-refresh and sign in from a fresh browser to verify both open the same CV. Diagnose connection errors through public config, Auth settings and API responses before editing code.
    - _Requirements: 1.1–1.4, 5.4, 6.2_

- [x] 2. Save profiles and manage projects (20 min)
  - **Save the profile (8 min)**
    - Add the **Profile** fields, schema-aligned limits, URL validation and request feedback.
    - Verify a changed name and skills persist after hard refresh and a malformed link is rejected before saving.
    - _Requirements: 2.1–2.3, 5.3, 6.2_
  - **Manage projects (12 min)**
    - Add newest-first list, create, edit and confirmed delete. Apply title, text and link validation.
    - Verify with two projects. Reload after creation and editing, cancel a delete once, then confirm it and reload again.
    - _Requirements: 3.1–3.5, 5.3, 6.2_

- [x] 3. Publish the public CV and verify the production build (22 min)
  - **Publish and open the public CV (10 min, P0)**
    - Add status, publish/unpublish, the copyable link and the sessionless `/?cv=<uuid>` view. Render profile, project tags and safe links.
    - Verify a draft is unavailable in both a private window and the owner's browser. Check blank-name publish, then publish a valid CV and verify public rendering with no editor controls or sign-up request. Unpublish and reload to verify unavailability. Check malformed and missing IDs.
    - _Requirements: 4.1–4.4, 5.3, 6.2_
  - **Finish the UI and verify the build (12 min, P1 polish and P0 checks)**
    - Check mobile and desktop layouts, keyboard controls, labels and request feedback. Use Tailwind utilities and accessible icons if added.
    - Use two lab identities and a sessionless reader to confirm database grants and RLS via the Data API. Check that the reader can read only published data and cannot write to either table. Check that the second user cannot read a draft, change another owner's rows or add a project to the other owner's CV. Confirm denied writes left the fixture rows intact.
    - Run `npm run build`, confirm `dist/index.html` exists and verify the build used only the public Supabase configuration. Fix the smallest failing check and repeat it before uploading.
    - **Verification (2026-11-27).** Live Chrome verified publish, copy, sessionless viewing, and unpublish with a fictional CV. The live Data API denied sessionless writes to both tables. Local Chrome checks covered mobile, desktop, and keyboard controls. The production bundle contained only public Supabase configuration. The workshop owner waived the two-account check. Cross-owner access remains unverified.
    - _Requirements: 5.1–5.4, 6.1–6.3_

- [ ] 4. Deploy and verify on Netlify (10 min)
  - **Verify the manual deployment (10 min, P0, after build)**
    - Upload `kiro-student/dist/` manually in Netlify. Open the HTTPS site and sign in with the workshop account on the hosted origin and use fictional CV data. Save a project and publish.
    - Verify the editor restores the hosted CV after reload. Open and reload the copied link in a private window, then unpublish and verify it is unavailable. Record the hosted test result independently of the local build.
    - _Requirements: 1.3–1.4, 4.1–4.4, 6.3_
  - **Add browser Print/Save PDF (optional, after the lab)**
    - Add a print action for the public CV and check its output in browser print preview.
    - _Related requirement: 4.3_
