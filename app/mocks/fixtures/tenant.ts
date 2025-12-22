import type { Tenant, TenantMember, TenantToken } from '~/mocks/types'

export const mockTenants: ReadonlyArray<Tenant> = [
  {
    id: 'tenant-1',
    name: 'Acme Corporation',
    role: 'admin',
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'tenant-2',
    name: 'Beta Labs',
    role: 'member',
    createdAt: '2024-02-15T12:00:00Z',
  },
  {
    id: 'tenant-3',
    name: 'Gamma Inc',
    role: 'member',
    createdAt: '2024-03-20T16:00:00Z',
  },
]

export const mockTenantMembers: ReadonlyArray<TenantMember> = [
  {
    id: 'member-1',
    userId: 'user-1',
    email: 'ivan.petrov@example.com',
    name: 'Иван Петров',
    role: 'admin',
  },
  {
    id: 'member-2',
    userId: 'user-2',
    email: 'maria.ivanova@example.com',
    name: 'Мария Иванова',
    role: 'member',
  },
  {
    id: 'member-3',
    userId: 'user-3',
    email: 'alexey.smirnov@example.com',
    name: 'Алексей Смирнов',
    role: 'member',
  },
]

export const mockTenantTokens: ReadonlyArray<TenantToken> = [
  {
    id: 'token-1',
    name: 'Grafana Integration',
    token: 'tok_a1b2c3d4e5f6g7h8i9j0',
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'token-2',
    name: 'Prometheus Alerting',
    token: 'tok_k1l2m3n4o5p6q7r8s9t0',
    createdAt: '2024-02-25T14:00:00Z',
  },
]
