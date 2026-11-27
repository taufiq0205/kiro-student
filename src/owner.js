import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

let client

export async function openOwnerCv({ start }) {
  if (!URL.canParse(url) || !url.startsWith('https://') || !key?.startsWith('sb_publishable_')) {
    throw new Error('Set the Supabase HTTPS URL and publishable key in .env.local, then restart the dev server.')
  }

  client ??= createClient(url, key)
  const restored = await client.auth.getSession()
  if (restored.error) throw restored.error

  let session = restored.data.session
  if (!session && start) {
    const signedIn = await client.auth.signInAnonymously()
    if (signedIn.error?.code === 'anonymous_provider_disabled') {
      throw new Error('Enable anonymous sign-ins in Supabase Authentication settings, then try again.')
    }
    if (signedIn.error) throw signedIn.error
    session = signedIn.data.session
    if (!session) throw new Error('Supabase did not return a session. Try again.')
  }
  if (!session) return null

  const columns = 'id, published'
  const read = () =>
    client.from('cvs').select(columns).eq('owner_id', session.user.id).maybeSingle()

  const existing = await read()
  if (existing.error) throw existing.error
  if (existing.data) return existing.data

  const created = await client.from('cvs').insert({}).select(columns).single()
  if (created.error?.code === '23505') {
    const concurrent = await read()
    if (concurrent.error) throw concurrent.error
    if (concurrent.data) return concurrent.data
  }
  if (created.error) throw created.error
  return created.data
}
