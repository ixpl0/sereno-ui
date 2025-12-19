import type { User, Contact } from '~/mocks/types'

type UserOverrides = Partial<User>
type ContactOverrides = Partial<Contact>

let userIdCounter = 0
let contactIdCounter = 0

export const createUser = (overrides: UserOverrides = {}): User => {
  userIdCounter = userIdCounter + 1
  const id = `user-${userIdCounter}`

  return {
    id,
    email: `user${userIdCounter}@example.com`,
    name: `User ${userIdCounter}`,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

export const createContact = (overrides: ContactOverrides = {}): Contact => {
  contactIdCounter = contactIdCounter + 1
  const id = `contact-${contactIdCounter}`

  return {
    id,
    kind: 'email',
    value: `contact${contactIdCounter}@example.com`,
    verified: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

export const resetUserFactory = (): void => {
  userIdCounter = 0
  contactIdCounter = 0
}
