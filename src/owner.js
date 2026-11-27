import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

let client

function getClient() {
  if (!URL.canParse(url) || !url.startsWith('https://') || !key?.startsWith('sb_publishable_')) {
    throw new Error('Set the Supabase HTTPS URL and publishable key in .env.local, then restart the dev server.')
  }

  client ??= createClient(url, key)
  return client
}

export async function signInOwner(credentials) {
  const { data, error } = await getClient().auth.signInWithPassword(credentials)
  if (error) throw error
  if (!data.session) throw new Error('Supabase did not return a session. Try again.')
}

export async function openOwnerCv() {
  const client = getClient()
  const { data: { session }, error } = await client.auth.getSession()
  if (error) throw error
  if (!session || session.user.is_anonymous) return null

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
