import type { Tenant, TenantMember, TenantToken } from '~/mocks/types'

type TenantOverrides = Partial<Tenant>
type MemberOverrides = Partial<TenantMember>
type TokenOverrides = Partial<TenantToken>

let tenantIdCounter = 1
let memberIdCounter = 1
let tokenIdCounter = 1

export const createTenant = (overrides: TenantOverrides = {}): Tenant => {
  const id = `tenant-${tenantIdCounter}`
  tenantIdCounter = tenantIdCounter + 1

  return {
    id,
    name: `Tenant ${tenantIdCounter}`,
    admin: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

export const createTenantMember = (overrides: MemberOverrides = {}): TenantMember => {
  const id = `member-${memberIdCounter}`
  memberIdCounter = memberIdCounter + 1

  return {
    id,
    userId: `user-${memberIdCounter}`,
    email: `member${memberIdCounter}@example.com`,
    name: `Member ${memberIdCounter}`,
    admin: false,
    ...overrides,
  }
}

export const createTenantToken = (overrides: TokenOverrides = {}): TenantToken => {
  const id = `token-${tokenIdCounter}`
  tokenIdCounter = tokenIdCounter + 1

  return {
    id,
    name: `API Token ${tokenIdCounter}`,
    token: `tok_${crypto.randomUUID().replace(/-/g, '')}`,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

export const resetTenantFactories = (): void => {
  tenantIdCounter = 1
  memberIdCounter = 1
  tokenIdCounter = 1
}
