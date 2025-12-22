import type { User, Contact, Session } from '~/mocks/types'

export const mockCurrentUser: User = {
  id: 'user-1',
  email: 'ivan.petrov@example.com',
  name: 'Иван Петров',
  createdAt: '2024-01-15T10:00:00Z',
}

export const mockUserContacts: ReadonlyArray<Contact> = [
  {
    id: 'contact-1',
    kind: 'email',
    value: 'ivan.petrov@example.com',
    verified: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'contact-2',
    kind: 'telegram',
    value: '@ivanpetrov',
    verified: false,
    createdAt: '2024-02-20T14:30:00Z',
  },
]

export const mockUserSessions: ReadonlyArray<Session> = [
  {
    id: 'session-1',
    device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    since: 1703152800,
    current: true,
  },
  {
    id: 'session-2',
    device: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/605.1.15',
    since: 1702548000,
    current: false,
  },
  {
    id: 'session-3',
    device: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Firefox/121.0',
    since: 1701943200,
    current: false,
  },
]
