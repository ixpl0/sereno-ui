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

export interface Tenant {
  id: string
  name: string
  since: number
  adminUserIds: string[]
}

export interface TenantMember {
  id: string
  name: string
  admin: boolean
  since: number
}

export interface TenantToken {
  id: string
  name: string
  since: number
  value: string
}

interface MockState {
  user: User
  sessions: Session[]
  contacts: Contact[]
  tenants: Tenant[]
  tenantMembers: Map<string, TenantMember[]>
  tenantTokens: Map<string, TenantToken[]>
}

const generateId = (prefix: string = 'id'): string => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const generateVerificationCode = (): string => '12345678'

const generateTokenValue = (): string => `tok_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`

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
  tenants: [
    {
      id: 'tenant-1',
      name: 'Lorem Ipsum Inc.',
      since: Math.floor(Date.now() / 1000) - 2592000,
      adminUserIds: ['user-1'],
    },
    {
      id: 'tenant-2',
      name: 'Acme Corp',
      since: Math.floor(Date.now() / 1000) - 604800,
      adminUserIds: ['user-2'],
    },
  ],
  tenantMembers: new Map([
    ['tenant-1', [
      { id: 'user-1', name: 'Василий Пупкин', admin: true, since: Math.floor(Date.now() / 1000) - 2592000 },
      { id: 'user-3', name: 'Иван Иванов', admin: false, since: Math.floor(Date.now() / 1000) - 86400 },
    ]],
    ['tenant-2', [
      { id: 'user-2', name: 'Пётр Петров', admin: true, since: Math.floor(Date.now() / 1000) - 604800 },
      { id: 'user-1', name: 'Василий Пупкин', admin: false, since: Math.floor(Date.now() / 1000) - 172800 },
    ]],
  ]),
  tenantTokens: new Map([
    ['tenant-1', [
      { id: 'token-1', name: 'Prometheus', since: Math.floor(Date.now() / 1000) - 86400, value: 'tok_hidden' },
      { id: 'token-2', name: 'Grafana', since: Math.floor(Date.now() / 1000) - 43200, value: 'tok_hidden' },
    ]],
    ['tenant-2', []],
  ]),
}

const state: MockState = {
  ...defaultState,
  sessions: [...defaultState.sessions],
  contacts: [...defaultState.contacts],
  tenants: [...defaultState.tenants],
  tenantMembers: new Map(defaultState.tenantMembers),
  tenantTokens: new Map(defaultState.tenantTokens),
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

const currentUserId = 'user-1'

export const getMockTenants = (): ReadonlyArray<{ id: string, name: string, since: number, admin: boolean }> => {
  return state.tenants
    .filter(t => state.tenantMembers.get(t.id)?.some(m => m.id === currentUserId))
    .map(t => ({
      id: t.id,
      name: t.name,
      since: t.since,
      admin: t.adminUserIds.includes(currentUserId),
    }))
}

export const getMockTenant = (id: string): { id: string, name: string, since: number, admin: boolean } | null => {
  const tenant = state.tenants.find(t => t.id === id)
  if (!tenant) {
    return null
  }
  return {
    id: tenant.id,
    name: tenant.name,
    since: tenant.since,
    admin: tenant.adminUserIds.includes(currentUserId),
  }
}

export const createMockTenant = (name: string): { id: string, name: string, since: number, admin: boolean } => {
  const tenant: Tenant = {
    id: generateId('tenant'),
    name,
    since: Math.floor(Date.now() / 1000),
    adminUserIds: [currentUserId],
  }
  state.tenants = [...state.tenants, tenant]
  state.tenantMembers.set(tenant.id, [
    { id: currentUserId, name: 'Василий Пупкин', admin: true, since: tenant.since },
  ])
  state.tenantTokens.set(tenant.id, [])
  return {
    id: tenant.id,
    name: tenant.name,
    since: tenant.since,
    admin: true,
  }
}

export const updateMockTenant = (id: string, name: string): { id: string, name: string, since: number, admin: boolean } | null => {
  const tenantIndex = state.tenants.findIndex(t => t.id === id)
  if (tenantIndex === -1) {
    return null
  }
  const tenant = state.tenants[tenantIndex]
  if (!tenant) {
    return null
  }
  const updatedTenant: Tenant = { ...tenant, name }
  state.tenants = state.tenants.map(t => t.id === id ? updatedTenant : t)
  return {
    id: updatedTenant.id,
    name: updatedTenant.name,
    since: updatedTenant.since,
    admin: updatedTenant.adminUserIds.includes(currentUserId),
  }
}

export const getMockTenantMembers = (tenantId: string): ReadonlyArray<TenantMember> => {
  return state.tenantMembers.get(tenantId) ?? []
}

export const updateMockTenantMember = (tenantId: string, memberId: string, admin: boolean): TenantMember | null => {
  const members = state.tenantMembers.get(tenantId) ?? []
  const existingMember = members.find(m => m.id === memberId)
  if (existingMember) {
    const updatedMember: TenantMember = { ...existingMember, admin }
    state.tenantMembers.set(tenantId, members.map(m => m.id === memberId ? updatedMember : m))

    const tenant = state.tenants.find(t => t.id === tenantId)
    if (tenant) {
      if (admin && !tenant.adminUserIds.includes(memberId)) {
        const updatedTenant: Tenant = { ...tenant, adminUserIds: [...tenant.adminUserIds, memberId] }
        state.tenants = state.tenants.map(t => t.id === tenantId ? updatedTenant : t)
      }
      else if (!admin && tenant.adminUserIds.includes(memberId)) {
        const updatedTenant: Tenant = { ...tenant, adminUserIds: tenant.adminUserIds.filter(id => id !== memberId) }
        state.tenants = state.tenants.map(t => t.id === tenantId ? updatedTenant : t)
      }
    }
    return updatedMember
  }

  const newMember: TenantMember = {
    id: memberId,
    name: `Пользователь ${memberId}`,
    admin,
    since: Math.floor(Date.now() / 1000),
  }
  state.tenantMembers.set(tenantId, [...members, newMember])

  if (admin) {
    const tenant = state.tenants.find(t => t.id === tenantId)
    if (tenant && !tenant.adminUserIds.includes(memberId)) {
      const updatedTenant: Tenant = { ...tenant, adminUserIds: [...tenant.adminUserIds, memberId] }
      state.tenants = state.tenants.map(t => t.id === tenantId ? updatedTenant : t)
    }
  }
  return newMember
}

export const deleteMockTenantMember = (tenantId: string, memberId: string): boolean => {
  const members = state.tenantMembers.get(tenantId) ?? []
  const initialLength = members.length
  state.tenantMembers.set(tenantId, members.filter(m => m.id !== memberId))

  const tenant = state.tenants.find(t => t.id === tenantId)
  if (tenant && tenant.adminUserIds.includes(memberId)) {
    const updatedTenant: Tenant = { ...tenant, adminUserIds: tenant.adminUserIds.filter(id => id !== memberId) }
    state.tenants = state.tenants.map(t => t.id === tenantId ? updatedTenant : t)
  }
  return (state.tenantMembers.get(tenantId)?.length ?? 0) < initialLength
}

export const getMockTenantTokens = (tenantId: string): ReadonlyArray<Omit<TenantToken, 'value'>> => {
  return (state.tenantTokens.get(tenantId) ?? []).map(t => ({
    id: t.id,
    name: t.name,
    since: t.since,
  }))
}

export const createMockTenantToken = (tenantId: string, name: string): TenantToken => {
  const token: TenantToken = {
    id: generateId('token'),
    name,
    since: Math.floor(Date.now() / 1000),
    value: generateTokenValue(),
  }
  const tokens = state.tenantTokens.get(tenantId) ?? []
  state.tenantTokens.set(tenantId, [...tokens, token])
  return token
}

export const deleteMockTenantToken = (tenantId: string, tokenId: string): boolean => {
  const tokens = state.tenantTokens.get(tenantId) ?? []
  const initialLength = tokens.length
  state.tenantTokens.set(tenantId, tokens.filter(t => t.id !== tokenId))
  return (state.tenantTokens.get(tenantId)?.length ?? 0) < initialLength
}
