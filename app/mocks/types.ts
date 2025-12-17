export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Contact {
  id: string
  kind: 'email' | 'telegram' | 'phone'
  value: string
  verified: boolean
  createdAt: string
}

export interface Tenant {
  id: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
  createdAt: string
}

export interface TenantMember {
  id: string
  userId: string
  email: string
  name: string
  role: 'admin' | 'editor' | 'viewer'
}

export interface TenantToken {
  id: string
  name: string
  token: string
  createdAt: string
}
