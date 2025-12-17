import type { User, Contact } from '~/mocks/types'

export const mockCurrentUser: User = {
  id: 'user-1',
  email: 'ivan.petrov@example.com',
  name: 'Иван Петров',
  createdAt: '2024-01-15T10:00:00Z',
}

export const mockUserContacts: ReadonlyArray<Contact> = [
  {
    id: 'contact-1',
    kind: 'email',
    value: 'ivan.petrov@example.com',
    verified: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'contact-2',
    kind: 'telegram',
    value: '@ivanpetrov',
    verified: false,
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: 'contact-3',
    kind: 'phone',
    value: '+79991234567',
    verified: true,
    createdAt: '2024-03-10T09:15:00Z',
  },
]
