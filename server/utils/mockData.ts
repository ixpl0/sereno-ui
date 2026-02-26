export interface User {
  id: string
  firstName: string
  lastName: string
  timezone: string
  language: string
}

export interface MockComment {
  id: string
  text: string
  since: number
  deleted: boolean
}

export interface MockLabel {
  key: string
  value: string
  since: number
  deleted: boolean
  creator?: string
}

export interface MockStatus {
  status: string
  since: number
}

export interface MockAnnotation {
  key: string
  value: string
  since: number
  deleted: boolean
}

export interface MockAlert {
  id: string
  source: string
  time: number
  tenantId: string
  annotations: MockAnnotation[]
  labels: MockLabel[]
  comments: MockComment[]
  statuses: MockStatus[]
}

export interface MockIncident {
  id: string
  title: string
  description: string
  time: number
  tenantId: string
  alertIds: string[]
  labels: MockLabel[]
  comments: MockComment[]
  statuses: MockStatus[]
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

export interface MockEscalationStep {
  delay: number
  member?: string
  description?: string
  schedule?: {
    id: string
    position: 'current' | 'next' | 'previous' | 'all'
  }
}

export interface MockEscalationRule {
  event?: 'alert' | 'incident'
  labels?: Record<string, string>
  description?: string
}

export interface MockEscalation {
  id: string
  name: string
  enabled: boolean
  steps: MockEscalationStep[]
  rules: MockEscalationRule[]
}

export interface MockShift {
  member: string
  since: number
  until: number
}

export interface MockRotation {
  name: string
  number: number
  duration: number
  since: number
  members: string[]
  days: number[]
  created: number
  creator: string
  shifts: MockShift[]
}

export interface MockOverride {
  name: string
  number: number
  duration: number
  since: number
  member: string
  rotation: number
  created: number
  creator: string
  shift: MockShift
}

export interface MockSchedule {
  id: string
  name: string
  since: number
  until?: number
  created: number
  creator: string
  rotations: MockRotation[]
  overrides: MockOverride[]
}

interface MockState {
  user: User
  sessions: Session[]
  contacts: Contact[]
  tenants: Tenant[]
  tenantMembers: Map<string, TenantMember[]>
  tenantTokens: Map<string, TenantToken[]>
  tenantEscalations: Map<string, MockEscalation[]>
  tenantSchedules: Map<string, MockSchedule[]>
  alerts: MockAlert[]
  incidents: MockIncident[]
}

const generateId = (prefix: string = 'id'): string => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const isDayActive = (date: Date, days: number[]): boolean => {
  const dayOfWeek = date.getDay()
  const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek
  return days.includes(normalizedDay)
}

const generateShifts = (
  days: number[],
  duration: number,
  since: number,
  members: string[],
): MockShift[] => {
  if (members.length === 0) {
    return []
  }

  const shifts: MockShift[] = []
  const rangeEnd = Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60

  let currentTime = since
  let memberIndex = 0

  while (currentTime < rangeEnd) {
    const currentDate = new Date(currentTime * 1000)
    const member = members[memberIndex % members.length]

    if (member && isDayActive(currentDate, days)) {
      shifts.push({
        member,
        since: currentTime,
        until: currentTime + duration,
      })
    }

    currentTime = currentTime + duration
    memberIndex = memberIndex + 1
  }

  return shifts
}

const generateOverrideShift = (
  since: number,
  duration: number,
  member: string,
): MockShift => ({
  member,
  since,
  until: since + duration,
})

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
      name: 'DevOps&SRE',
      since: Math.floor(Date.now() / 1000) - 2592000,
      adminUserIds: ['user-1'],
    },
    {
      id: 'tenant-2',
      name: 'Отдел обеспечения надежности и доступности внешних сервисов',
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
  tenantEscalations: new Map([
    ['tenant-1', [
      {
        id: 'escalation-1',
        name: 'Критические алерты',
        enabled: true,
        steps: [
          { delay: 0, member: 'user-1', description: 'Первичное уведомление' },
          { delay: 300, member: 'user-3', description: 'Эскалация на дежурного' },
          { delay: 900, description: 'Эскалация на всю команду' },
        ],
        rules: [
          { event: 'alert', labels: { severity: 'critical' } },
        ],
      },
      {
        id: 'escalation-2',
        name: 'Инциденты',
        enabled: true,
        steps: [
          { delay: 0, description: 'Уведомить текущего дежурного' },
          { delay: 600, description: 'Уведомить следующего дежурного' },
        ],
        rules: [
          { event: 'incident' },
        ],
      },
      {
        id: 'escalation-3',
        name: 'Тестовая (отключена)',
        enabled: false,
        steps: [
          { delay: 0, member: 'user-1' },
        ],
        rules: [],
      },
    ]],
    ['tenant-2', [
      {
        id: 'escalation-4',
        name: 'Стандартная эскалация',
        enabled: true,
        steps: [
          { delay: 0, member: 'user-2' },
          { delay: 600, member: 'user-1' },
        ],
        rules: [],
      },
    ]],
  ]),
  tenantSchedules: new Map([
    ['tenant-1', [
      {
        id: 'schedule-1',
        name: 'Основное дежурство',
        since: Math.floor(Date.now() / 1000) - 86400 * 30,
        created: Math.floor(Date.now() / 1000) - 86400 * 30,
        creator: 'user-1',
        rotations: [
          {
            name: 'Дневная смена',
            number: 0,
            duration: 43200,
            since: Math.floor(Date.now() / 1000) - 86400 * 30,
            members: ['user-1', 'user-3'],
            days: [1, 2, 3, 4, 5],
            created: Math.floor(Date.now() / 1000) - 86400 * 30,
            creator: 'user-1',
            shifts: generateShifts([1, 2, 3, 4, 5], 43200, Math.floor(Date.now() / 1000) - 86400 * 30, ['user-1', 'user-3']),
          },
          {
            name: 'Ночная смена',
            number: 1,
            duration: 43200,
            since: Math.floor(Date.now() / 1000) - 86400 * 30 + 43200,
            members: ['user-3', 'user-1'],
            days: [1, 2, 3, 4, 5],
            created: Math.floor(Date.now() / 1000) - 86400 * 30,
            creator: 'user-1',
            shifts: generateShifts([1, 2, 3, 4, 5], 43200, Math.floor(Date.now() / 1000) - 86400 * 30 + 43200, ['user-3', 'user-1']),
          },
        ],
        overrides: [
          {
            name: 'Отпуск Василия',
            number: 0,
            duration: 86400 * 3,
            since: Math.floor(Date.now() / 1000) + 86400 * 2,
            member: 'user-3',
            rotation: 0,
            created: Math.floor(Date.now() / 1000) - 86400,
            creator: 'user-1',
            shift: generateOverrideShift(Math.floor(Date.now() / 1000) + 86400 * 2, 86400 * 3, 'user-3'),
          },
        ],
      },
      {
        id: 'schedule-2',
        name: 'Выходные',
        since: Math.floor(Date.now() / 1000) - 86400 * 30,
        created: Math.floor(Date.now() / 1000) - 86400 * 30,
        creator: 'user-1',
        rotations: [
          {
            name: 'Круглосуточно',
            number: 0,
            duration: 86400,
            since: Math.floor(Date.now() / 1000) - 86400 * 30,
            members: ['user-1', 'user-3'],
            days: [6, 7],
            created: Math.floor(Date.now() / 1000) - 86400 * 30,
            creator: 'user-1',
            shifts: generateShifts([6, 7], 86400, Math.floor(Date.now() / 1000) - 86400 * 30, ['user-1', 'user-3']),
          },
        ],
        overrides: [],
      },
    ]],
    ['tenant-2', [
      {
        id: 'schedule-3',
        name: '24/7 дежурство',
        since: Math.floor(Date.now() / 1000) - 86400 * 14,
        created: Math.floor(Date.now() / 1000) - 86400 * 14,
        creator: 'user-2',
        rotations: [
          {
            name: 'Основная ротация',
            number: 0,
            duration: 86400,
            since: Math.floor(Date.now() / 1000) - 86400 * 14,
            members: ['user-2', 'user-1'],
            days: [1, 2, 3, 4, 5, 6, 7],
            created: Math.floor(Date.now() / 1000) - 86400 * 14,
            creator: 'user-2',
            shifts: generateShifts([1, 2, 3, 4, 5, 6, 7], 86400, Math.floor(Date.now() / 1000) - 86400 * 14, ['user-2', 'user-1']),
          },
        ],
        overrides: [],
      },
    ]],
  ]),
  alerts: [
    {
      id: 'alert-1',
      source: 'prometheus',
      time: Math.floor(Date.now() / 1000) - 86400,
      tenantId: 'tenant-1',
      annotations: [
        { key: 'description', value: 'CPU usage is above 90% for 5 minutes', since: Math.floor(Date.now() / 1000) - 86400, deleted: false },
        { key: 'summary', value: 'High CPU usage on server-1', since: Math.floor(Date.now() / 1000) - 86400, deleted: false },
      ],
      labels: [
        { key: 'alertname', value: 'HighCpuUsage', since: Math.floor(Date.now() / 1000) - 86400, deleted: false },
        { key: 'severity', value: 'critical', since: Math.floor(Date.now() / 1000) - 86400, deleted: false },
        { key: 'instance', value: 'server-1:9090', since: Math.floor(Date.now() / 1000) - 86400, deleted: false },
      ],
      comments: [
        { id: 'comment-1', text: 'Investigating the issue', since: Math.floor(Date.now() / 1000) - 79200, deleted: false },
      ],
      statuses: [
        { status: 'created', since: Math.floor(Date.now() / 1000) - 86400 },
        { status: 'acknowledged', since: Math.floor(Date.now() / 1000) - 79200 },
        { status: 'resolved', since: Math.floor(Date.now() / 1000) - 64800 },
      ],
    },
    {
      id: 'alert-2',
      source: 'alertmanager',
      time: Math.floor(Date.now() / 1000) - 72000,
      tenantId: 'tenant-1',
      annotations: [
        { key: 'description', value: 'Memory usage is above 85%', since: Math.floor(Date.now() / 1000) - 72000, deleted: false },
      ],
      labels: [
        { key: 'alertname', value: 'HighMemoryUsage', since: Math.floor(Date.now() / 1000) - 72000, deleted: false },
        { key: 'severity', value: 'warning', since: Math.floor(Date.now() / 1000) - 72000, deleted: false },
      ],
      comments: [],
      statuses: [
        { status: 'created', since: Math.floor(Date.now() / 1000) - 72000 },
        { status: 'acknowledged', since: Math.floor(Date.now() / 1000) - 57600 },
      ],
    },
    {
      id: 'alert-3',
      source: 'grafana',
      time: Math.floor(Date.now() / 1000) - 108000,
      tenantId: 'tenant-2',
      annotations: [
        { key: 'description', value: 'Disk space is running low', since: Math.floor(Date.now() / 1000) - 108000, deleted: false },
      ],
      labels: [
        { key: 'alertname', value: 'LowDiskSpace', since: Math.floor(Date.now() / 1000) - 108000, deleted: false },
        { key: 'severity', value: 'warning', since: Math.floor(Date.now() / 1000) - 108000, deleted: false },
      ],
      comments: [],
      statuses: [
        { status: 'created', since: Math.floor(Date.now() / 1000) - 108000 },
        { status: 'resolved', since: Math.floor(Date.now() / 1000) - 104400 },
      ],
    },
  ],
  incidents: [
    {
      id: 'incident-1',
      title: 'Production server performance degradation',
      description: 'Multiple alerts indicate performance issues on production servers',
      time: Math.floor(Date.now() / 1000) - 3600,
      tenantId: 'tenant-1',
      alertIds: ['alert-1', 'alert-2'],
      labels: [
        { key: 'priority', value: 'high', since: Math.floor(Date.now() / 1000) - 3600, deleted: false },
        { key: 'team', value: 'infrastructure', since: Math.floor(Date.now() / 1000) - 3600, deleted: false },
      ],
      comments: [
        { id: 'incident-comment-1', text: 'Created incident to track related alerts', since: Math.floor(Date.now() / 1000) - 3600, deleted: false },
        { id: 'incident-comment-2', text: 'Team is investigating', since: Math.floor(Date.now() / 1000) - 1800, deleted: false },
      ],
      statuses: [
        { status: 'created', since: Math.floor(Date.now() / 1000) - 3600 },
        { status: 'acknowledged', since: Math.floor(Date.now() / 1000) - 1800 },
      ],
    },
    {
      id: 'incident-3',
      title: 'Database connection pool saturation',
      description: 'Application reports intermittent DB timeout errors',
      time: Math.floor(Date.now() / 1000) - 5400,
      tenantId: 'tenant-1',
      alertIds: ['alert-1'],
      labels: [
        { key: 'priority', value: 'high', since: Math.floor(Date.now() / 1000) - 5400, deleted: false },
      ],
      comments: [],
      statuses: [
        { status: 'created', since: Math.floor(Date.now() / 1000) - 5400 },
      ],
    },
    {
      id: 'incident-4',
      title: 'Background worker queue delay',
      description: 'Queue processing delay exceeded threshold',
      time: Math.floor(Date.now() / 1000) - 10800,
      tenantId: 'tenant-2',
      alertIds: [],
      labels: [
        { key: 'priority', value: 'medium', since: Math.floor(Date.now() / 1000) - 10800, deleted: false },
      ],
      comments: [],
      statuses: [
        { status: 'created', since: Math.floor(Date.now() / 1000) - 10800 },
      ],
    },
    {
      id: 'incident-5',
      title: 'API latency spike on public endpoint',
      description: 'P95 latency increased above SLO',
      time: Math.floor(Date.now() / 1000) - 21600,
      tenantId: 'tenant-1',
      alertIds: ['alert-2'],
      labels: [
        { key: 'priority', value: 'high', since: Math.floor(Date.now() / 1000) - 21600, deleted: false },
      ],
      comments: [],
      statuses: [
        { status: 'created', since: Math.floor(Date.now() / 1000) - 21600 },
        { status: 'acknowledged', since: Math.floor(Date.now() / 1000) - 18000 },
      ],
    },
    {
      id: 'incident-2',
      title: 'Storage capacity issue',
      description: 'Disk space alerts on multiple servers',
      time: Math.floor(Date.now() / 1000) - 172800,
      tenantId: 'tenant-2',
      alertIds: ['alert-3'],
      labels: [
        { key: 'priority', value: 'medium', since: Math.floor(Date.now() / 1000) - 172800, deleted: false },
      ],
      comments: [],
      statuses: [
        { status: 'created', since: Math.floor(Date.now() / 1000) - 172800 },
        { status: 'resolved', since: Math.floor(Date.now() / 1000) - 86400 },
      ],
    },
  ],
}

const state: MockState = {
  ...defaultState,
  sessions: [...defaultState.sessions],
  contacts: [...defaultState.contacts],
  tenants: [...defaultState.tenants],
  tenantMembers: new Map(defaultState.tenantMembers),
  tenantTokens: new Map(defaultState.tenantTokens),
  tenantEscalations: new Map(defaultState.tenantEscalations),
  tenantSchedules: new Map(defaultState.tenantSchedules),
  alerts: [...defaultState.alerts],
  incidents: [...defaultState.incidents],
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

const alertToResponse = (alert: MockAlert) => ({
  id: alert.id,
  source: alert.source,
  time: alert.time,
  tenant: { id: alert.tenantId },
  annotations: alert.annotations.filter(a => !a.deleted),
  labels: alert.labels.filter(l => !l.deleted).map(l => ({
    key: l.key,
    value: l.value,
    since: l.since,
    deleted: l.deleted,
    ...(l.creator ? { creator: l.creator } : {}),
  })),
  comments: alert.comments.filter(c => !c.deleted),
  statuses: alert.statuses,
})

const incidentToResponse = (incident: MockIncident) => ({
  id: incident.id,
  title: incident.title,
  description: incident.description,
  time: incident.time,
  tenant: { id: incident.tenantId },
  alerts: incident.alertIds
    .map(alertId => state.alerts.find(a => a.id === alertId))
    .filter((a): a is MockAlert => a !== undefined)
    .map(alertToResponse),
  labels: incident.labels.filter(l => !l.deleted),
  comments: incident.comments.filter(c => !c.deleted),
  statuses: incident.statuses,
})

export const getMockAlerts = (limit?: number, offset?: number): { alerts: ReturnType<typeof alertToResponse>[], total: number } => {
  const allAlerts = state.alerts
  const total = allAlerts.length
  const startIndex = offset ?? 0
  const endIndex = limit ? startIndex + limit : allAlerts.length
  const alerts = allAlerts.slice(startIndex, endIndex).map(alertToResponse)
  return { alerts, total }
}

export const getMockAlert = (id: string): ReturnType<typeof alertToResponse> | null => {
  const alert = state.alerts.find(a => a.id === id)
  if (!alert) {
    return null
  }
  return alertToResponse(alert)
}

export const addMockAlertComment = (alertId: string, text: string): ReturnType<typeof alertToResponse> | null => {
  const alert = state.alerts.find(a => a.id === alertId)
  if (!alert) {
    return null
  }
  const comment: MockComment = {
    id: generateId('comment'),
    text,
    since: Math.floor(Date.now() / 1000),
    deleted: false,
  }
  const updatedAlert: MockAlert = {
    ...alert,
    comments: [...alert.comments, comment],
  }
  state.alerts = state.alerts.map(a => a.id === alertId ? updatedAlert : a)
  return alertToResponse(updatedAlert)
}

export const deleteMockAlertComment = (alertId: string, commentId: string): ReturnType<typeof alertToResponse> | null => {
  const alert = state.alerts.find(a => a.id === alertId)
  if (!alert) {
    return null
  }
  const updatedAlert: MockAlert = {
    ...alert,
    comments: alert.comments.map(c => c.id === commentId ? { ...c, deleted: true } : c),
  }
  state.alerts = state.alerts.map(a => a.id === alertId ? updatedAlert : a)
  return alertToResponse(updatedAlert)
}

export const addMockAlertLabel = (alertId: string, key: string, value: string): ReturnType<typeof alertToResponse> | null => {
  const alert = state.alerts.find(a => a.id === alertId)
  if (!alert) {
    return null
  }
  const existingLabel = alert.labels.find(l => l.key === key && !l.deleted)
  if (existingLabel) {
    const updatedAlert: MockAlert = {
      ...alert,
      labels: alert.labels.map(l => l.key === key && !l.deleted ? { ...l, value, since: Math.floor(Date.now() / 1000), creator: currentUserId } : l),
    }
    state.alerts = state.alerts.map(a => a.id === alertId ? updatedAlert : a)
    return alertToResponse(updatedAlert)
  }
  const label: MockLabel = {
    key,
    value,
    since: Math.floor(Date.now() / 1000),
    deleted: false,
    creator: currentUserId,
  }
  const updatedAlert: MockAlert = {
    ...alert,
    labels: [...alert.labels, label],
  }
  state.alerts = state.alerts.map(a => a.id === alertId ? updatedAlert : a)
  return alertToResponse(updatedAlert)
}

export const deleteMockAlertLabel = (alertId: string, key: string): ReturnType<typeof alertToResponse> | null => {
  const alert = state.alerts.find(a => a.id === alertId)
  if (!alert) {
    return null
  }
  const updatedAlert: MockAlert = {
    ...alert,
    labels: alert.labels.map(l => l.key === key ? { ...l, deleted: true } : l),
  }
  state.alerts = state.alerts.map(a => a.id === alertId ? updatedAlert : a)
  return alertToResponse(updatedAlert)
}

export const setMockAlertStatus = (alertId: string, status: string): ReturnType<typeof alertToResponse> | null => {
  const alert = state.alerts.find(a => a.id === alertId)
  if (!alert) {
    return null
  }
  const newStatus: MockStatus = {
    status,
    since: Math.floor(Date.now() / 1000),
  }
  const updatedAlert: MockAlert = {
    ...alert,
    statuses: [...alert.statuses, newStatus],
  }
  state.alerts = state.alerts.map(a => a.id === alertId ? updatedAlert : a)
  return alertToResponse(updatedAlert)
}

export const addMockAlertAnnotation = (alertId: string, key: string, value: string): ReturnType<typeof alertToResponse> | null => {
  const alert = state.alerts.find(a => a.id === alertId)
  if (!alert) {
    return null
  }
  const existingAnnotation = alert.annotations.find(a => a.key === key && !a.deleted)
  if (existingAnnotation) {
    const updatedAlert: MockAlert = {
      ...alert,
      annotations: alert.annotations.map(a => a.key === key && !a.deleted ? { ...a, value, since: Math.floor(Date.now() / 1000) } : a),
    }
    state.alerts = state.alerts.map(a => a.id === alertId ? updatedAlert : a)
    return alertToResponse(updatedAlert)
  }
  const annotation: MockAnnotation = {
    key,
    value,
    since: Math.floor(Date.now() / 1000),
    deleted: false,
  }
  const updatedAlert: MockAlert = {
    ...alert,
    annotations: [...alert.annotations, annotation],
  }
  state.alerts = state.alerts.map(a => a.id === alertId ? updatedAlert : a)
  return alertToResponse(updatedAlert)
}

export const deleteMockAlertAnnotation = (alertId: string, key: string): ReturnType<typeof alertToResponse> | null => {
  const alert = state.alerts.find(a => a.id === alertId)
  if (!alert) {
    return null
  }
  const updatedAlert: MockAlert = {
    ...alert,
    annotations: alert.annotations.map(a => a.key === key ? { ...a, deleted: true } : a),
  }
  state.alerts = state.alerts.map(a => a.id === alertId ? updatedAlert : a)
  return alertToResponse(updatedAlert)
}

export const getMockIncidents = (limit?: number, offset?: number): { incidents: ReturnType<typeof incidentToResponse>[], total: number } => {
  const allIncidents = state.incidents
  const total = allIncidents.length
  const startIndex = offset ?? 0
  const endIndex = limit ? startIndex + limit : allIncidents.length
  const incidents = allIncidents.slice(startIndex, endIndex).map(incidentToResponse)
  return { incidents, total }
}

export const getMockIncident = (id: string): ReturnType<typeof incidentToResponse> | null => {
  const incident = state.incidents.find(i => i.id === id)
  if (!incident) {
    return null
  }
  return incidentToResponse(incident)
}

export const createMockIncident = (tenantId: string, title: string, description?: string): ReturnType<typeof incidentToResponse> => {
  const incident: MockIncident = {
    id: generateId('incident'),
    title,
    description: description ?? '',
    time: Math.floor(Date.now() / 1000),
    tenantId,
    alertIds: [],
    labels: [],
    comments: [],
    statuses: [{ status: 'created', since: Math.floor(Date.now() / 1000) }],
  }
  state.incidents = [...state.incidents, incident]
  return incidentToResponse(incident)
}

export const addMockIncidentComment = (incidentId: string, text: string): ReturnType<typeof incidentToResponse> | null => {
  const incident = state.incidents.find(i => i.id === incidentId)
  if (!incident) {
    return null
  }
  const comment: MockComment = {
    id: generateId('comment'),
    text,
    since: Math.floor(Date.now() / 1000),
    deleted: false,
  }
  const updatedIncident: MockIncident = {
    ...incident,
    comments: [...incident.comments, comment],
  }
  state.incidents = state.incidents.map(i => i.id === incidentId ? updatedIncident : i)
  return incidentToResponse(updatedIncident)
}

export const deleteMockIncidentComment = (incidentId: string, commentId: string): ReturnType<typeof incidentToResponse> | null => {
  const incident = state.incidents.find(i => i.id === incidentId)
  if (!incident) {
    return null
  }
  const updatedIncident: MockIncident = {
    ...incident,
    comments: incident.comments.map(c => c.id === commentId ? { ...c, deleted: true } : c),
  }
  state.incidents = state.incidents.map(i => i.id === incidentId ? updatedIncident : i)
  return incidentToResponse(updatedIncident)
}

export const addMockIncidentLabel = (incidentId: string, key: string, value: string): ReturnType<typeof incidentToResponse> | null => {
  const incident = state.incidents.find(i => i.id === incidentId)
  if (!incident) {
    return null
  }
  const existingLabel = incident.labels.find(l => l.key === key && !l.deleted)
  if (existingLabel) {
    const updatedIncident: MockIncident = {
      ...incident,
      labels: incident.labels.map(l => l.key === key && !l.deleted ? { ...l, value, since: Math.floor(Date.now() / 1000) } : l),
    }
    state.incidents = state.incidents.map(i => i.id === incidentId ? updatedIncident : i)
    return incidentToResponse(updatedIncident)
  }
  const label: MockLabel = {
    key,
    value,
    since: Math.floor(Date.now() / 1000),
    deleted: false,
  }
  const updatedIncident: MockIncident = {
    ...incident,
    labels: [...incident.labels, label],
  }
  state.incidents = state.incidents.map(i => i.id === incidentId ? updatedIncident : i)
  return incidentToResponse(updatedIncident)
}

export const deleteMockIncidentLabel = (incidentId: string, key: string): ReturnType<typeof incidentToResponse> | null => {
  const incident = state.incidents.find(i => i.id === incidentId)
  if (!incident) {
    return null
  }
  const updatedIncident: MockIncident = {
    ...incident,
    labels: incident.labels.map(l => l.key === key ? { ...l, deleted: true } : l),
  }
  state.incidents = state.incidents.map(i => i.id === incidentId ? updatedIncident : i)
  return incidentToResponse(updatedIncident)
}

export const setMockIncidentStatus = (incidentId: string, status: string): ReturnType<typeof incidentToResponse> | null => {
  const incident = state.incidents.find(i => i.id === incidentId)
  if (!incident) {
    return null
  }
  const newStatus: MockStatus = {
    status,
    since: Math.floor(Date.now() / 1000),
  }
  const updatedIncident: MockIncident = {
    ...incident,
    statuses: [...incident.statuses, newStatus],
  }
  state.incidents = state.incidents.map(i => i.id === incidentId ? updatedIncident : i)
  return incidentToResponse(updatedIncident)
}

export const addMockIncidentAlert = (incidentId: string, alertId: string): ReturnType<typeof incidentToResponse> | null => {
  const incident = state.incidents.find(i => i.id === incidentId)
  if (!incident) {
    return null
  }
  const alert = state.alerts.find(a => a.id === alertId)
  if (!alert) {
    return null
  }
  if (incident.alertIds.includes(alertId)) {
    return incidentToResponse(incident)
  }
  const updatedIncident: MockIncident = {
    ...incident,
    alertIds: [...incident.alertIds, alertId],
  }
  state.incidents = state.incidents.map(i => i.id === incidentId ? updatedIncident : i)
  return incidentToResponse(updatedIncident)
}

export const removeMockIncidentAlert = (incidentId: string, alertId: string): ReturnType<typeof incidentToResponse> | null => {
  const incident = state.incidents.find(i => i.id === incidentId)
  if (!incident) {
    return null
  }
  const updatedIncident: MockIncident = {
    ...incident,
    alertIds: incident.alertIds.filter(id => id !== alertId),
  }
  state.incidents = state.incidents.map(i => i.id === incidentId ? updatedIncident : i)
  return incidentToResponse(updatedIncident)
}

export const getMockEscalations = (tenantId: string): ReadonlyArray<MockEscalation> => {
  return state.tenantEscalations.get(tenantId) ?? []
}

export const createMockEscalation = (
  tenantId: string,
  data: { name: string, enabled: boolean, steps: MockEscalationStep[], rules?: MockEscalationRule[] },
): MockEscalation => {
  const escalation: MockEscalation = {
    id: generateId('escalation'),
    name: data.name,
    enabled: data.enabled,
    steps: data.steps,
    rules: data.rules ?? [],
  }
  const escalations = state.tenantEscalations.get(tenantId) ?? []
  state.tenantEscalations.set(tenantId, [...escalations, escalation])
  return escalation
}

export const updateMockEscalation = (
  tenantId: string,
  escalationId: string,
  data: { name: string, enabled: boolean, steps: MockEscalationStep[], rules?: MockEscalationRule[] },
): MockEscalation | null => {
  const escalations = state.tenantEscalations.get(tenantId) ?? []
  const existing = escalations.find(e => e.id === escalationId)
  if (!existing) {
    return null
  }
  const updated: MockEscalation = {
    ...existing,
    name: data.name,
    enabled: data.enabled,
    steps: data.steps,
    rules: data.rules ?? existing.rules,
  }
  state.tenantEscalations.set(tenantId, escalations.map(e => e.id === escalationId ? updated : e))
  return updated
}

export const deleteMockEscalation = (tenantId: string, escalationId: string): boolean => {
  const escalations = state.tenantEscalations.get(tenantId) ?? []
  const initialLength = escalations.length
  state.tenantEscalations.set(tenantId, escalations.filter(e => e.id !== escalationId))
  return (state.tenantEscalations.get(tenantId)?.length ?? 0) < initialLength
}

export const getMockSchedules = (tenantId: string): ReadonlyArray<MockSchedule> => {
  return state.tenantSchedules.get(tenantId) ?? []
}

export const getMockSchedule = (scheduleId: string): MockSchedule | null => {
  for (const schedules of state.tenantSchedules.values()) {
    const schedule = schedules.find(s => s.id === scheduleId)
    if (schedule) {
      return schedule
    }
  }
  return null
}

export const createMockSchedule = (
  tenantId: string,
  data: { name: string, since: number, until?: number },
): MockSchedule => {
  const now = Math.floor(Date.now() / 1000)
  const schedule: MockSchedule = {
    id: generateId('schedule'),
    name: data.name,
    since: data.since,
    until: data.until,
    created: now,
    creator: currentUserId,
    rotations: [],
    overrides: [],
  }
  const schedules = state.tenantSchedules.get(tenantId) ?? []
  state.tenantSchedules.set(tenantId, [...schedules, schedule])
  return schedule
}

export const deleteMockSchedule = (tenantId: string, scheduleId: string): boolean => {
  const schedules = state.tenantSchedules.get(tenantId) ?? []
  const initialLength = schedules.length
  state.tenantSchedules.set(tenantId, schedules.filter(s => s.id !== scheduleId))
  return (state.tenantSchedules.get(tenantId)?.length ?? 0) < initialLength
}

export const createMockRotation = (
  scheduleId: string,
  data: { name: string, duration: number, since: number, members: string[], days: number[] },
): MockSchedule | null => {
  const now = Math.floor(Date.now() / 1000)
  for (const [tenantId, schedules] of state.tenantSchedules.entries()) {
    const scheduleIndex = schedules.findIndex(s => s.id === scheduleId)
    if (scheduleIndex !== -1) {
      const schedule = schedules[scheduleIndex]
      if (!schedule) {
        return null
      }
      const rotation: MockRotation = {
        ...data,
        number: schedule.rotations.length,
        created: now,
        creator: currentUserId,
        shifts: generateShifts(data.days, data.duration, data.since, data.members),
      }
      const updatedSchedule: MockSchedule = {
        ...schedule,
        rotations: [...schedule.rotations, rotation],
      }
      state.tenantSchedules.set(tenantId, schedules.map(s => s.id === scheduleId ? updatedSchedule : s))
      return updatedSchedule
    }
  }
  return null
}

export const deleteMockRotation = (scheduleId: string, rotationIndex: number): MockSchedule | null => {
  for (const [tenantId, schedules] of state.tenantSchedules.entries()) {
    const scheduleIdx = schedules.findIndex(s => s.id === scheduleId)
    if (scheduleIdx !== -1) {
      const schedule = schedules[scheduleIdx]
      if (!schedule || rotationIndex < 0 || rotationIndex >= schedule.rotations.length) {
        return null
      }
      const updatedSchedule: MockSchedule = {
        ...schedule,
        rotations: schedule.rotations.filter((_, i) => i !== rotationIndex),
      }
      state.tenantSchedules.set(tenantId, schedules.map(s => s.id === scheduleId ? updatedSchedule : s))
      return updatedSchedule
    }
  }
  return null
}

export const createMockOverride = (
  scheduleId: string,
  data: { name: string, duration: number, since: number, member: string, rotation: number },
): MockSchedule | null => {
  const now = Math.floor(Date.now() / 1000)
  for (const [tenantId, schedules] of state.tenantSchedules.entries()) {
    const scheduleIndex = schedules.findIndex(s => s.id === scheduleId)
    if (scheduleIndex !== -1) {
      const schedule = schedules[scheduleIndex]
      if (!schedule) {
        return null
      }
      const override: MockOverride = {
        ...data,
        number: schedule.overrides.length,
        created: now,
        creator: currentUserId,
        shift: generateOverrideShift(data.since, data.duration, data.member),
      }
      const updatedSchedule: MockSchedule = {
        ...schedule,
        overrides: [...schedule.overrides, override],
      }
      state.tenantSchedules.set(tenantId, schedules.map(s => s.id === scheduleId ? updatedSchedule : s))
      return updatedSchedule
    }
  }
  return null
}

export const deleteMockOverride = (scheduleId: string, overrideIndex: number): MockSchedule | null => {
  for (const [tenantId, schedules] of state.tenantSchedules.entries()) {
    const scheduleIdx = schedules.findIndex(s => s.id === scheduleId)
    if (scheduleIdx !== -1) {
      const schedule = schedules[scheduleIdx]
      if (!schedule || overrideIndex < 0 || overrideIndex >= schedule.overrides.length) {
        return null
      }
      const updatedSchedule: MockSchedule = {
        ...schedule,
        overrides: schedule.overrides.filter((_, i) => i !== overrideIndex),
      }
      state.tenantSchedules.set(tenantId, schedules.map(s => s.id === scheduleId ? updatedSchedule : s))
      return updatedSchedule
    }
  }
  return null
}
