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

const cvColumns = 'id, owner_id, published, full_name, headline, summary, university, degree, location, skills, github_url, linkedin_url'

export async function openOwnerCv() {
  const client = getClient()
  const { data: { session }, error } = await client.auth.getSession()
  if (error) throw error
  if (!session || session.user.is_anonymous) return null

  const read = () =>
    client.from('cvs').select(cvColumns).eq('owner_id', session.user.id).maybeSingle()

  const existing = await read()
  if (existing.error) throw existing.error
  if (existing.data) return existing.data

  const created = await client.from('cvs').insert({}).select(cvColumns).single()
  if (created.error?.code === '23505') {
    const concurrent = await read()
    if (concurrent.error) throw concurrent.error
    if (concurrent.data) return concurrent.data
  }
  if (created.error) throw created.error
  return created.data
}

const projectColumns = 'id, cv_id, owner_id, title, description, tech_stack, project_url, created_at'

export async function listOwnerProjects(cvId) {
  const { data, error } = await getClient()
    .from('projects')
    .select(projectColumns)
    .eq('cv_id', cvId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function saveOwnerProfile(cv, fields) {
  const { data, error } = await getClient()
    .from('cvs')
    .update(fields)
    .eq('id', cv.id)
    .eq('owner_id', cv.owner_id)
    .select(cvColumns)
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error('Your CV was not updated. Reload and try again.')
  return data
}

export async function createOwnerProject(cv, fields) {
  const { data, error } = await getClient()
    .from('projects')
    .insert({ ...fields, cv_id: cv.id })
    .select(projectColumns)
    .single()
  if (error) throw error
  return data
}

export async function updateOwnerProject(project, fields) {
  const { data, error } = await getClient()
    .from('projects')
    .update(fields)
    .eq('id', project.id)
    .eq('cv_id', project.cv_id)
    .eq('owner_id', project.owner_id)
    .select(projectColumns)
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error('This project was not updated. Reload and try again.')
  return data
}

export async function deleteOwnerProject(project) {
  const { data, error } = await getClient()
    .from('projects')
    .delete()
    .eq('id', project.id)
    .eq('cv_id', project.cv_id)
    .eq('owner_id', project.owner_id)
    .select('id')
    .maybeSingle()
  if (error) throw error
  if (!data) throw new Error('This project was not deleted. Reload and try again.')
}
