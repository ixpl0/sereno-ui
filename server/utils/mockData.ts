export interface User {
  id: string
  firstName: string
  lastName: string
  timezone: string
}

export interface Session {
  id: string
  device: string
  since: number
  current: boolean
}

interface MockState {
  user: User
  sessions: Session[]
}

const defaultState: MockState = {
  user: {
    id: 'user-1',
    firstName: 'Иван',
    lastName: 'Петров',
    timezone: 'Europe/Moscow',
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
}

const state: MockState = { ...defaultState, sessions: [...defaultState.sessions] }

export const getMockUser = (): User => state.user

export const updateMockUser = (updates: Partial<User>): User => {
  state.user = { ...state.user, ...updates }
  return state.user
}

export const getMockSessions = (): ReadonlyArray<Session> => state.sessions

export const closeOtherMockSessions = (): void => {
  state.sessions = state.sessions.filter(s => s.current)
}

export const isValidToken = (token: string | undefined): boolean => {
  return token !== undefined && token !== null && token.length > 0
}
