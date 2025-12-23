export interface User {
  id: string
  email: string
  name: string
  firstName?: string
  lastName?: string
  timezone?: string
  createdAt: string
}

export interface Contact {
  id: string
  kind: 'email' | 'telegram'
  value: string
  verified: boolean
  createdAt: string
}

export interface Tenant {
  id: string
  name: string
  admin: boolean
  createdAt: string
}

export interface TenantMember {
  id: string
  userId: string
  email: string
  name: string
  admin: boolean
}

export interface TenantToken {
  id: string
  name: string
  token: string
  createdAt: string
}

export interface Session {
  id: string
  device: string
  since: number
  current: boolean
}
