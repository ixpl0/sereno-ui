import { getHeader, setHeader } from 'h3'

const CLIENT_HINT = 'Sec-CH-Prefers-Color-Scheme'

const appendVary = (current: string | undefined, value: string): string => {
  const existing = current
    ? current.split(',').map(part => part.trim()).filter(Boolean)
    : []

  if (!existing.includes(value)) {
    existing.push(value)
  }

  return existing.join(', ')
}

export default defineEventHandler((event) => {
  setHeader(event, 'Accept-CH', CLIENT_HINT)
  setHeader(event, 'Critical-CH', CLIENT_HINT)
  setHeader(event, 'Vary', appendVary(getHeader(event, 'Vary'), CLIENT_HINT))
})
