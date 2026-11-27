import { useEffect, useState } from 'react'
import { openOwnerCv } from './owner'

async function loadEditor({ start }) {
  try {
    const cv = await openOwnerCv({ start })
    return cv ? { kind: 'ready', cv } : { kind: 'welcome' }
  } catch (error) {
    return { kind: 'error', message: error.message, start }
  }
}

export function CvEditor() {
  const [state, setState] = useState({ kind: 'loading' })

  useEffect(() => {
    let active = true
    loadEditor({ start: false }).then((next) => {
      if (active) setState(next)
    })
    return () => { active = false }
  }, [])

  async function open(start) {
    setState({ kind: 'loading' })
    setState(await loadEditor({ start }))
  }

  return (
    <>
      <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Editing access depends on this browser's storage and this site address.
        Clearing site data or switching browsers or addresses can lose access.
        Start your final CV on your deployed Netlify URL.
      </p>

      <div className="mt-6">
        {state.kind === 'loading' && <p role="status">Opening your CV…</p>}
        {state.kind === 'ready' && (
          <section aria-label="Your CV">
            <h2 className="text-xl font-semibold">Your CV</h2>
            <p className="mt-2" role="status">{state.cv.published ? 'Published' : 'Private draft'}</p>
            <p className="mt-2 break-all text-sm text-slate-600">CV ID: {state.cv.id}</p>
          </section>
        )}
        {state.kind === 'error' && (
          <p className="mb-3 text-sm text-red-800" role="alert">{state.message}</p>
        )}
        {(state.kind === 'welcome' || state.kind === 'error') && (
          <button
            type="button"
            className="rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
            onClick={() => open(state.kind === 'welcome' || state.start)}
          >
            {state.kind === 'welcome' ? 'Start my CV' : 'Try again'}
          </button>
        )}
      </div>
    </>
  )
}
