import { useEffect, useId, useState } from 'react'
import {
  createOwnerProject,
  deleteOwnerProject,
  listOwnerProjects,
  openOwnerCv,
  signInOwner,
  updateOwnerCv,
  updateOwnerProject,
} from './owner'
import { projectTags, projectUrl, validHttpUrl } from './cvDisplay'

const buttonClass = 'rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:opacity-60'
const secondaryButtonClass = 'rounded-lg border border-slate-400 px-4 py-2 font-semibold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:opacity-60'
const inputClass = 'mt-1 block w-full rounded-lg border border-slate-400 px-3 py-2'
const profileFields = [
  { name: 'full_name', label: 'Full name', limit: 100 },
  { name: 'headline', label: 'Headline', limit: 160 },
  { name: 'summary', label: 'Summary', limit: 1200, multiline: true },
  { name: 'university', label: 'University', limit: 150 },
  { name: 'degree', label: 'Degree', limit: 150 },
  { name: 'location', label: 'Location', limit: 100 },
  { name: 'skills', label: 'Skills (comma-separated)', limit: 500 },
  { name: 'github_url', label: 'GitHub URL', url: true },
  { name: 'linkedin_url', label: 'LinkedIn URL', url: true },
]
const projectFields = [
  { name: 'title', label: 'Title', limit: 120 },
  { name: 'description', label: 'Description', limit: 800, multiline: true },
  { name: 'tech_stack', label: 'Tech stack (comma-separated)', limit: 250 },
  { name: 'project_url', label: 'Project URL', url: true },
]
const emptyProject = { title: '', description: '', tech_stack: '', project_url: '' }

function loadEditor() {
  return openOwnerCv()
    .then((cv) => cv ? { kind: 'ready', cv } : { kind: 'signin' })
    .catch((error) => ({ kind: 'error', message: error.message }))
}

function characterCount(value) {
  return Array.from(value).length
}

function validateFields(fields, definitions, requiredNames = []) {
  const errors = {}
  for (const { name, label, limit, url } of definitions) {
    const value = fields[name] ?? ''
    const measured = name === 'title' ? value.trim() : value
    if (requiredNames.includes(name) && !measured.trim()) {
      errors[name] = `${label} is required.`
    } else if (limit && characterCount(measured) > limit) {
      errors[name] = `${label} must be ${limit} characters or fewer.`
    } else if (url && value && !validHttpUrl(value)) {
      errors[name] = 'Enter a valid HTTP or HTTPS URL.'
    }
  }
  return errors
}

function withTrimmedUrls(fields, definitions) {
  return Object.fromEntries(Object.entries(fields).map(([name, value]) => [
    name,
    definitions.find((field) => field.name === name)?.url ? value.trim() : value,
  ]))
}

function TextField({ field, value, error, onChange, disabled = false }) {
  const id = `${useId()}-${field.name}`
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const controlProps = {
    id,
    name: field.name,
    value,
    onChange,
    disabled,
    className: inputClass,
    'aria-invalid': Boolean(error),
    'aria-describedby': [field.limit && hintId, error && errorId].filter(Boolean).join(' ') || undefined,
  }

  return (
    <div className="min-w-0 text-sm">
      <label htmlFor={id} className="font-medium">{field.label}</label>
      {field.multiline ? <textarea {...controlProps} rows={4} /> : <input {...controlProps} type={field.url ? 'url' : 'text'} />}
      {field.limit && <span id={hintId} className="mt-1 block text-slate-600">Up to {field.limit} characters.</span>}
      {error && <span id={errorId} className="mt-1 block text-red-800">{error}</span>}
    </div>
  )
}

function ProfileForm({ cv, pending, onPendingChange, onSaved }) {
  const [values, setValues] = useState(() => Object.fromEntries(profileFields.map(({ name }) => [name, cv[name] ?? ''])))
  const [errors, setErrors] = useState({})
  const [validationMessage, setValidationMessage] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const fields = withTrimmedUrls(Object.fromEntries(new FormData(event.currentTarget)), profileFields)
    const nextErrors = validateFields(fields, profileFields)
    if (cv.published && !fields.full_name.trim()) {
      nextErrors.full_name = 'A published CV needs a saved full name.'
    }
    setErrors(nextErrors)
    setValidationMessage(Object.keys(nextErrors).length ? 'Please correct the highlighted fields.' : '')
    setMessage('')
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    onPendingChange(true)
    try {
      const saved = await updateOwnerCv(cv, fields)
      setValues(Object.fromEntries(profileFields.map(({ name }) => [name, saved[name] ?? ''])))
      onSaved(saved)
      setMessage('Profile saved.')
    } catch (error) {
      setMessage(`Profile was not saved. ${error.message}`)
    } finally {
      setSaving(false)
      onPendingChange(false)
    }
  }

  return (
    <section aria-labelledby="profile-heading">
      <h2 id="profile-heading" className="text-xl font-semibold">Profile</h2>
      <form className="mt-4 space-y-4" onSubmit={submit} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          {profileFields.map((field) => (
            <TextField
              key={field.name}
              field={field}
              value={values[field.name]}
              error={errors[field.name]}
              disabled={saving || pending}
              onChange={(event) => {
                setValues({ ...values, [field.name]: event.target.value })
                if (errors[field.name]) setErrors({ ...errors, [field.name]: '' })
              }}
            />
          ))}
        </div>
        <button type="submit" className={buttonClass} disabled={saving || pending}>
          {saving ? 'Saving profile…' : 'Save profile'}
        </button>
        {validationMessage && <p role="alert" className="text-red-800">{validationMessage}</p>}
        {message && <p role={message.startsWith('Profile was') ? 'alert' : 'status'}>{message}</p>}
      </form>
    </section>
  )
}

function ProjectForm({ project, onSave, onSaved, onCancel, savingDisabled = false }) {
  const [values, setValues] = useState(() => project ? { ...project } : { ...emptyProject })
  const [errors, setErrors] = useState({})
  const [validationMessage, setValidationMessage] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    const fields = withTrimmedUrls(Object.fromEntries(new FormData(event.currentTarget)), projectFields)
    fields.title = fields.title.trim()
    const nextErrors = validateFields(fields, projectFields, ['title'])
    setErrors(nextErrors)
    setValidationMessage(Object.keys(nextErrors).length ? 'Please correct the highlighted fields.' : '')
    setMessage('')
    if (Object.keys(nextErrors).length) return

    setSaving(true)
    try {
      const saved = await onSave(fields)
      setValues({ ...emptyProject, ...saved })
      onSaved(saved)
    } catch (error) {
      setMessage(`Project was not saved. ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        {projectFields.map((field) => (
          <TextField
            key={field.name}
            field={field}
            value={values[field.name] ?? ''}
            error={errors[field.name]}
            disabled={saving || savingDisabled}
            onChange={(event) => {
              setValues({ ...values, [field.name]: event.target.value })
              if (errors[field.name]) setErrors({ ...errors, [field.name]: '' })
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="submit" className={buttonClass} disabled={saving || savingDisabled}>
          {saving ? 'Saving project…' : project ? 'Save changes' : 'Add project'}
        </button>
        {onCancel && <button type="button" className={secondaryButtonClass} onClick={onCancel} disabled={saving || savingDisabled}>Cancel</button>}
      </div>
      {validationMessage && <p role="alert" className="text-red-800">{validationMessage}</p>}
      {message && <p className="text-red-800" role="alert">{message}</p>}
    </form>
  )
}

function publicProfileUrl(cvId) {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('cv', cvId)
  return url.href
}

function PublicationPanel({ cv, pending, onPendingChange, onSaved }) {
  const [outcome, setOutcome] = useState(null)
  const [saving, setSaving] = useState(false)
  const shareUrl = publicProfileUrl(cv.id)

  async function togglePublished() {
    if (!cv.published && !cv.full_name.trim()) {
      setOutcome({ kind: 'error', message: 'Save a non-blank full name in your profile before publishing.' })
      return
    }

    setOutcome(null)
    setSaving(true)
    onPendingChange(true)
    try {
      const saved = await updateOwnerCv(cv, { published: !cv.published })
      onSaved(saved)
      setOutcome({ kind: 'status', message: saved.published ? 'CV published.' : 'CV unpublished.' })
    } catch (error) {
      setOutcome({ kind: 'error', message: `CV status was not updated. ${error.message}` })
    } finally {
      setSaving(false)
      onPendingChange(false)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setOutcome({ kind: 'status', message: 'Public link copied.' })
    } catch {
      setOutcome({ kind: 'error', message: 'The link could not be copied. Select and copy the link above.' })
    }
  }

  return (
    <section aria-labelledby="publish-heading">
      <h2 id="publish-heading" className="text-xl font-semibold">Publish &amp; Share</h2>
      <p className="mt-2" role="status">{cv.published ? 'Published' : 'Private draft'}</p>
      <button type="button" className={`${cv.published ? secondaryButtonClass : buttonClass} mt-3`} onClick={togglePublished} disabled={pending || saving}>
        {saving ? 'Updating…' : cv.published ? 'Unpublish CV' : 'Publish CV'}
      </button>
      {cv.published && (
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium">
            Public CV link
            <input className={inputClass} value={shareUrl} readOnly onFocus={(event) => event.target.select()} />
          </label>
          <button type="button" className={secondaryButtonClass} onClick={copyLink} disabled={pending || saving}>Copy link</button>
        </div>
      )}
      {outcome && <p className="mt-3" role={outcome.kind === 'error' ? 'alert' : 'status'}>{outcome.message}</p>}
    </section>
  )
}

function ProjectCard({ project, onSave, onDelete, deleting, deleteDisabled }) {
  const [editing, setEditing] = useState(false)
  const url = projectUrl(project)

  return (
    <article className="rounded-xl border border-slate-200 p-4">
      {editing ? (
        <ProjectForm
          project={project}
          onSave={onSave}
          onSaved={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="min-w-0 break-words text-lg font-semibold">{project.title}</h3>
            <div className="flex gap-2">
              <button type="button" className={secondaryButtonClass} onClick={() => setEditing(true)} disabled={deleting}>Edit</button>
              <button type="button" className={secondaryButtonClass} onClick={onDelete} disabled={deleting || deleteDisabled}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
          {project.description && <p className="mt-3 whitespace-pre-wrap break-words text-sm">{project.description}</p>}
          {projectTags(project).length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Technology stack">
              {projectTags(project).map((tag, index) => <li key={`${tag}-${index}`} className="wrap-anywhere rounded-full bg-indigo-50 px-3 py-1 text-sm">{tag}</li>)}
            </ul>
          )}
          {url && <a className="mt-3 inline-block break-all text-indigo-800 underline" href={url} target="_blank" rel="noopener noreferrer">Project link</a>}
        </>
      )}
    </article>
  )
}

function ProjectsSection({ cv }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError('')
    listOwnerProjects(cv.id).then((data) => {
      if (active) setProjects(data)
    }).catch((error) => {
      if (active) setLoadError(error.message)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [cv.id, reloadCount])

  async function addProject(fields) {
    const project = await createOwnerProject(cv, fields)
    setProjects((current) => [project, ...current])
    setMessage('Project added.')
    return project
  }

  async function saveProject(previous, fields) {
    const project = await updateOwnerProject(previous, fields)
    setProjects((current) => current.map((item) => item.id === project.id ? project : item))
    setMessage('Project updated.')
    return project
  }

  async function removeProject(project) {
    if (!window.confirm(`Delete “${project.title}”? This cannot be undone.`)) {
      setMessage('Project kept.')
      return
    }
    setDeletingId(project.id)
    setMessage('')
    try {
      await deleteOwnerProject(project)
      setProjects((current) => current.filter((item) => item.id !== project.id))
      setMessage('Project deleted.')
    } catch (error) {
      setMessage(`Project was not deleted. ${error.message}`)
    } finally {
      setDeletingId('')
    }
  }

  return (
    <section aria-labelledby="projects-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="projects-heading" className="text-xl font-semibold">Projects</h2>
        {!adding && <button type="button" className={buttonClass} onClick={() => setAdding(true)}>Add project</button>}
      </div>
      {message && <p className="mt-3" role="status">{message}</p>}
      {adding && <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <h3 className="mb-4 font-semibold">New project</h3>
        <ProjectForm
          onSave={addProject}
          onSaved={() => setAdding(false)}
          onCancel={() => setAdding(false)}
          savingDisabled={loading || Boolean(loadError)}
        />
      </div>}
      {loading && <p className="mt-4" role="status">Loading projects…</p>}
      {loadError && <div className="mt-4" role="alert">
        <p>Projects could not be loaded. {loadError}</p>
        <button type="button" className={`${secondaryButtonClass} mt-2`} onClick={() => setReloadCount(reloadCount + 1)}>Try again</button>
      </div>}
      {!loading && !loadError && projects.length === 0 && <p className="mt-4">No projects yet. Add one to get started.</p>}
      {!loading && !loadError && projects.length > 0 && (
        <div className="mt-4 space-y-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSave={(fields) => saveProject(project, fields)}
              onDelete={() => removeProject(project)}
              deleting={deletingId === project.id}
              deleteDisabled={Boolean(deletingId)}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export function CvEditor() {
  const [state, setState] = useState({ kind: 'loading' })
  const [cvSaving, setCvSaving] = useState(false)

  useEffect(() => {
    let active = true
    loadEditor().then((next) => {
      if (active) setState(next)
    })
    return () => { active = false }
  }, [])

  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const { email, password } = form.elements
    setState({ kind: 'signing-in' })

    try {
      await signInOwner({ email: email.value.trim(), password: password.value })
    } catch (error) {
      password.value = ''
      setState({ kind: 'signin', message: error.message })
      return
    }

    form.reset()
    setState(await loadEditor())
  }

  async function retry() {
    setState({ kind: 'loading' })
    setState(await loadEditor())
  }

  return (
    <div className="mt-6">
      {state.kind === 'loading' && <p role="status">Opening your CV…</p>}
      {(state.kind === 'signin' || state.kind === 'signing-in') && (
        <form className="space-y-4" onSubmit={submit}>
          <p>Sign in with your workshop account to open your private CV.</p>
          <label className="block">
            Email
            <input className={inputClass} name="email" type="email" autoComplete="username" required />
          </label>
          <label className="block">
            Password
            <input className={inputClass} name="password" type="password" autoComplete="current-password" required />
          </label>
          {state.message && <p className="text-red-800" role="alert">{state.message}</p>}
          <button type="submit" className={buttonClass} disabled={state.kind === 'signing-in'}>
            {state.kind === 'signing-in' ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      )}
      {state.kind === 'ready' && (
        <div className="space-y-8">
          <section aria-label="CV status">
            <h2 className="text-xl font-semibold">Your CV</h2>
            <p className="mt-2 break-all text-sm text-slate-600">CV ID: {state.cv.id}</p>
          </section>
          <PublicationPanel
            cv={state.cv}
            pending={cvSaving}
            onPendingChange={setCvSaving}
            onSaved={(cv) => setState({ kind: 'ready', cv })}
          />
          <ProfileForm
            cv={state.cv}
            pending={cvSaving}
            onPendingChange={setCvSaving}
            onSaved={(cv) => setState({ kind: 'ready', cv })}
          />
          <ProjectsSection cv={state.cv} />
        </div>
      )}
      {state.kind === 'error' && (
        <>
          <p className="mb-3 text-sm text-red-800" role="alert">{state.message}</p>
          <button type="button" className={buttonClass} onClick={retry}>Try again</button>
        </>
      )}
    </div>
  )
}
