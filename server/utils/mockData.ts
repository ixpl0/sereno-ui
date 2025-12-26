export interface User {
  id: string
  firstName: string
  lastName: string
  timezone: string
  language: string
}

export interface Session {
  id: string
  device: string
  since: number
  current: boolean
}

export interface Contact {
  id: string
  kind: 'email' | 'telegram'
  value: string
  verified: boolean
  verificationCode: string
}

interface MockState {
  user: User
  sessions: Session[]
  contacts: Contact[]
}

const generateId = (): string => `contact-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const generateVerificationCode = (): string => '12345678'

const defaultState: MockState = {
  user: {
    id: 'user-1',
    firstName: 'Василий',
    lastName: 'Пупкин',
    timezone: 'Europe/Moscow',
    language: 'ru',
  },
  sessions: [
    {
      id: 'session-1',
      device: 'Chrome on Windows',
      since: Math.floor(Date.now() / 1000) - 86400,
      current: true,
    },
    {
      id: 'session-2',
      device: 'Safari on Mac',
      since: Math.floor(Date.now() / 1000) - 172800,
      current: false,
    },
    {
      id: 'session-3',
      device: 'Firefox on Linux',
      since: Math.floor(Date.now() / 1000) - 259200,
      current: false,
    },
  ],
  contacts: [
    {
      id: 'contact-1',
      kind: 'email',
      value: 'user@example.com',
      verified: true,
      verificationCode: '12345678',
    },
    {
      id: 'contact-2',
      kind: 'telegram',
      value: '@vasya_pupkin',
      verified: false,
      verificationCode: '12345678',
    },
  ],
}

const state: MockState = {
  ...defaultState,
  sessions: [...defaultState.sessions],
  contacts: [...defaultState.contacts],
}

export const getMockUser = (): User => state.user

export const updateMockUser = (updates: Partial<User>): User => {
  state.user = { ...state.user, ...updates }
  return state.user
}

export const getMockSessions = (): ReadonlyArray<Session> => state.sessions

export const closeOtherMockSessions = (): void => {
  state.sessions = state.sessions.filter(s => s.current)
}

export const getMockContacts = (): ReadonlyArray<Contact> => state.contacts

export const addMockContact = (kind: 'email' | 'telegram', value: string): Contact => {
  const contact: Contact = {
    id: generateId(),
    kind,
    value,
    verified: false,
    verificationCode: generateVerificationCode(),
  }
  state.contacts = [...state.contacts, contact]
  return contact
}

export const deleteMockContact = (id: string): boolean => {
  const initialLength = state.contacts.length
  state.contacts = state.contacts.filter(c => c.id !== id)
  return state.contacts.length < initialLength
}

export const verifyMockContact = (id: string, code: string): Contact | null => {
  const contact = state.contacts.find(c => c.id === id)
  if (!contact) {
    return null
  }
  if (contact.verificationCode !== code) {
    return null
  }
  const verifiedContact: Contact = { ...contact, verified: true }
  state.contacts = state.contacts.map(c => c.id === id ? verifiedContact : c)
  return verifiedContact
}

export const isValidToken = (token: string | undefined): boolean => {
  return token !== undefined && token !== null && token.length > 0
}
