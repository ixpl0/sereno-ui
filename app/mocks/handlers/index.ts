import { authHandlers } from './auth'
import { userHandlers } from './user'
import { tenantsHandlers } from './tenants'
import { tokensHandlers } from './tokens'

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...tenantsHandlers,
  ...tokensHandlers,
]
