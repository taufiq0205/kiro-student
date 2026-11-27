import { useEffect, useState } from 'react'
import { openOwnerCv, signInOwner } from './owner'

async function loadEditor() {
  try {
    const cv = await openOwnerCv()
    return cv ? { kind: 'ready', cv } : { kind: 'signin' }
  } catch (error) {
    return { kind: 'error', message: error.message }
  }
}

const buttonClass = 'rounded-lg bg-indigo-700 px-4 py-2 font-semibold text-white hover:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:opacity-60'
const inputClass = 'mt-1 block w-full rounded-lg border border-slate-400 px-3 py-2'

export function CvEditor() {
  const [state, setState] = useState({ kind: 'loading' })

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
        <section aria-label="Your CV">
          <h2 className="text-xl font-semibold">Your CV</h2>
          <p className="mt-2" role="status">{state.cv.published ? 'Published' : 'Private draft'}</p>
          <p className="mt-2 break-all text-sm text-slate-600">CV ID: {state.cv.id}</p>
        </section>
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
