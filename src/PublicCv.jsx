import { useEffect, useState } from 'react'
import { openPublicCv } from './owner'
import { commaSeparatedValues, projectTags, projectUrl, validHttpUrl } from './cvDisplay'

const secondaryButtonClass = 'rounded-lg border border-slate-400 px-4 py-2 font-semibold hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:opacity-60'
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function loadPublicCv(id) {
  if (!uuidPattern.test(id)) return Promise.resolve({ kind: 'unavailable' })
  return openPublicCv(id)
    .then((cv) => cv ? { kind: 'ready', cv } : { kind: 'unavailable' })
    .catch((error) => ({ kind: 'error', message: error.message }))
}

function PublicProject({ project }) {
  const url = projectUrl(project)
  const tags = projectTags(project)

  return (
    <article className="rounded-xl border border-slate-200 p-4">
      <h4 className="break-words text-lg font-semibold">{project.title}</h4>
      {project.description && <p className="mt-3 whitespace-pre-wrap break-words text-sm">{project.description}</p>}
      {tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label={`${project.title} technology stack`}>
          {tags.map((tag, index) => <li key={`${tag}-${index}`} className="wrap-anywhere rounded-full bg-indigo-50 px-3 py-1 text-sm">{tag}</li>)}
        </ul>
      )}
      {url && <a className="mt-3 inline-block break-all text-indigo-800 underline" href={url} target="_blank" rel="noopener noreferrer">Project link</a>}
    </article>
  )
}

function PublicCvContent({ cv }) {
  const skills = commaSeparatedValues(cv.skills)
  const links = [
    { label: 'GitHub', url: cv.github_url },
    { label: 'LinkedIn', url: cv.linkedin_url },
  ].filter(({ url }) => url && validHttpUrl(url))

  return (
    <div className="mt-6 space-y-8">
      <header>
        <h2 className="break-words text-3xl font-bold tracking-tight">{cv.full_name}</h2>
        {cv.headline && <p className="mt-2 break-words text-lg text-slate-700">{cv.headline}</p>}
        {(cv.degree || cv.university || cv.location) && (
          <p className="mt-3 break-words text-sm text-slate-600">{[cv.degree, cv.university, cv.location].filter(Boolean).join(' · ')}</p>
        )}
        {links.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-4">
            {links.map(({ label, url }) => <li key={label}><a className="text-indigo-800 underline" href={url.trim()} target="_blank" rel="noopener noreferrer">{label}</a></li>)}
          </ul>
        )}
      </header>
      {cv.summary && <section aria-labelledby="summary-heading">
        <h3 id="summary-heading" className="text-xl font-semibold">About</h3>
        <p className="mt-3 whitespace-pre-wrap break-words">{cv.summary}</p>
      </section>}
      {skills.length > 0 && <section aria-labelledby="skills-heading">
        <h3 id="skills-heading" className="text-xl font-semibold">Skills</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {skills.map((skill, index) => <li key={`${skill}-${index}`} className="wrap-anywhere rounded-full bg-indigo-50 px-3 py-1 text-sm">{skill}</li>)}
        </ul>
      </section>}
      <section aria-labelledby="public-projects-heading">
        <h3 id="public-projects-heading" className="text-xl font-semibold">Projects</h3>
        {cv.projects.length === 0 ? <p className="mt-3">No projects yet.</p> : (
          <div className="mt-4 space-y-3">
            {cv.projects.map((project) => <PublicProject key={project.id} project={project} />)}
          </div>
        )}
      </section>
    </div>
  )
}

export function PublicCv({ id }) {
  const [state, setState] = useState({ kind: 'loading' })
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let active = true
    setState({ kind: uuidPattern.test(id) ? 'loading' : 'unavailable' })
    loadPublicCv(id).then((next) => {
      if (active) setState(next)
    })
    return () => { active = false }
  }, [id, retryCount])

  return (
    <div className="mt-6">
      {state.kind === 'loading' && <p role="status">Loading CV…</p>}
      {state.kind === 'unavailable' && <p role="status">CV unavailable</p>}
      {state.kind === 'error' && <div role="alert">
        <p>CV could not be loaded. {state.message}</p>
        <button type="button" className={`${secondaryButtonClass} mt-3`} onClick={() => setRetryCount(retryCount + 1)}>Try again</button>
      </div>}
      {state.kind === 'ready' && <PublicCvContent cv={state.cv} />}
    </div>
  )
}
