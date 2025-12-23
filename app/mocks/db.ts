import type { User, Contact, Tenant, TenantMember, TenantToken, Session } from './types'
import { mockCurrentUser, mockUserContacts, mockUserSessions } from './fixtures/user'
import { mockTenants, mockTenantMembers, mockTenantTokens } from './fixtures/tenant'

interface MockDatabase {
  currentUser: User
  contacts: Array<Contact>
  sessions: Array<Session>
  tenants: Array<Tenant>
  tenantMembers: Map<string, Array<TenantMember>>
  tenantTokens: Map<string, Array<TenantToken>>
  authToken: string | null
}

const copyMembers = (members: ReadonlyArray<TenantMember>): Array<TenantMember> =>
  members.map(m => ({ ...m }))

const copyTokens = (tokens: ReadonlyArray<TenantToken>): Array<TenantToken> =>
  tokens.map(t => ({ ...t }))

const copyContacts = (contacts: ReadonlyArray<Contact>): Array<Contact> =>
  contacts.map(c => ({ ...c }))

const copySessions = (sessions: ReadonlyArray<Session>): Array<Session> =>
  sessions.map(s => ({ ...s }))

const createInitialState = (): MockDatabase => ({
  currentUser: { ...mockCurrentUser },
  contacts: copyContacts(mockUserContacts),
  sessions: copySessions(mockUserSessions),
  tenants: mockTenants.map(t => ({ ...t })),
  tenantMembers: new Map<string, Array<TenantMember>>([
    ['tenant-1', copyMembers(mockTenantMembers)],
    ['tenant-2', copyMembers(mockTenantMembers.slice(0, 2))],
    ['tenant-3', copyMembers(mockTenantMembers.slice(0, 1))],
  ]),
  tenantTokens: new Map<string, Array<TenantToken>>([
    ['tenant-1', copyTokens(mockTenantTokens)],
    ['tenant-2', copyTokens(mockTenantTokens.slice(0, 1))],
    ['tenant-3', []],
  ]),
  authToken: null,
})

let db: MockDatabase = createInitialState()

export const getDb = (): MockDatabase => db

export const resetDb = (): void => {
  db = createInitialState()
}

export const isAuthenticated = (): boolean => db.authToken !== null

export const setAuthToken = (token: string | null): void => {
  db.authToken = token
}

export const getCurrentUser = (): User => db.currentUser

export const setCurrentUserFromOAuth = (data: {
  id: string
  email: string
  name: string
  provider: string
}): void => {
  db.currentUser = {
    id: data.id,
    email: data.email,
    name: data.name,
    createdAt: new Date().toISOString(),
  }
}

export const updateCurrentUser = (updates: Partial<User>): User => {
  db.currentUser = { ...db.currentUser, ...updates }
  return db.currentUser
}

export const getContacts = (): ReadonlyArray<Contact> => db.contacts

export const addContact = (contact: Contact): void => {
  db.contacts = [...db.contacts, contact]
}

export const updateContact = (contactId: string, updates: Partial<Contact>): Contact | undefined => {
  const index = db.contacts.findIndex(c => c.id === contactId)
  if (index === -1) {
    return undefined
  }
  const existingContact = db.contacts[index]
  if (!existingContact) {
    return undefined
  }
  const updated: Contact = { ...existingContact, ...updates }
  db.contacts = [...db.contacts.slice(0, index), updated, ...db.contacts.slice(index + 1)]
  return updated
}

export const removeContact = (contactId: string): boolean => {
  const initialLength = db.contacts.length
  db.contacts = db.contacts.filter(c => c.id !== contactId)
  return db.contacts.length < initialLength
}

export const getTenants = (): ReadonlyArray<Tenant> => db.tenants

export const getTenantById = (id: string): Tenant | undefined =>
  db.tenants.find(t => t.id === id)

export const addTenant = (tenant: Tenant): void => {
  db.tenants = [...db.tenants, tenant]
  db.tenantMembers.set(tenant.id, [])
  db.tenantTokens.set(tenant.id, [])
}

export const getTenantMembers = (tenantId: string): ReadonlyArray<TenantMember> =>
  db.tenantMembers.get(tenantId) ?? []

export const updateTenantMember = (
  tenantId: string,
  memberId: string,
  admin: boolean,
): TenantMember | undefined => {
  const members = db.tenantMembers.get(tenantId)
  if (!members) {
    return undefined
  }
  const index = members.findIndex(m => m.id === memberId)
  if (index === -1) {
    return undefined
  }
  const existingMember = members[index]
  if (!existingMember) {
    return undefined
  }
  const updated: TenantMember = { ...existingMember, admin }
  db.tenantMembers.set(tenantId, [
    ...members.slice(0, index),
    updated,
    ...members.slice(index + 1),
  ])
  return updated
}

export const removeTenantMember = (tenantId: string, memberId: string): boolean => {
  const members = db.tenantMembers.get(tenantId)
  if (!members) {
    return false
  }
  const filtered = members.filter(m => m.id !== memberId)
  if (filtered.length === members.length) {
    return false
  }
  db.tenantMembers.set(tenantId, filtered)
  return true
}

export const getTenantTokens = (tenantId: string): ReadonlyArray<TenantToken> =>
  db.tenantTokens.get(tenantId) ?? []

export const addTenantToken = (tenantId: string, token: TenantToken): void => {
  const existing = db.tenantTokens.get(tenantId) ?? []
  db.tenantTokens.set(tenantId, [...existing, token])
}

export const removeTenantToken = (tenantId: string, tokenId: string): boolean => {
  const tokens = db.tenantTokens.get(tenantId)
  if (!tokens) {
    return false
  }
  const filtered = tokens.filter(t => t.id !== tokenId)
  if (filtered.length === tokens.length) {
    return false
  }
  db.tenantTokens.set(tenantId, filtered)
  return true
}

export const getSessions = (): ReadonlyArray<Session> => db.sessions

export const closeOtherSessions = (): void => {
  db.sessions = db.sessions.filter(s => s.current === true)
}
