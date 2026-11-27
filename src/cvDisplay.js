export function validHttpUrl(value) {
  const candidate = value.trim()
  if (!/^https?:\/\/[^/\\\s][^\\\s]*$/i.test(candidate)) return false
  try {
    const url = new URL(candidate)
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname) && Boolean(url.host)
  } catch {
    return false
  }
}

export function commaSeparatedValues(value) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

export function projectUrl(project) {
  return project.project_url && validHttpUrl(project.project_url) ? project.project_url.trim() : ''
}

export function projectTags(project) {
  return commaSeparatedValues(project.tech_stack)
}
