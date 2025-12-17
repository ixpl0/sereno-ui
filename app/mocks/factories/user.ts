import type { User, Contact } from '~/mocks/types'

type UserOverrides = Partial<User>
type ContactOverrides = Partial<Contact>

let userIdCounter = 1
let contactIdCounter = 1

export const createUser = (overrides: UserOverrides = {}): User => {
  const id = `user-${userIdCounter}`
  userIdCounter = userIdCounter + 1

  return {
    id,
    email: `user${userIdCounter}@example.com`,
    name: `User ${userIdCounter}`,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

export const createContact = (overrides: ContactOverrides = {}): Contact => {
  const id = `contact-${contactIdCounter}`
  contactIdCounter = contactIdCounter + 1

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
  userIdCounter = 1
  contactIdCounter = 1
}
