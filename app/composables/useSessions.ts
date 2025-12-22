import { client } from '~/api/client.gen'
import type {
  UserResponseSession,
  UserResponseSessions,
} from '~/api/types.gen'
import type { ApiResponse } from '~/types/api'
import { getApiData } from '~/utils/api'

export const useSessions = () => {
  const sessions = useState<ReadonlyArray<UserResponseSession>>('sessions', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentSession = computed(() =>
    sessions.value.find(s => s.current === true),
  )

  const otherSessions = computed(() =>
    sessions.value.filter(s => s.current !== true),
  )

  const fetchSessions = async (): Promise<ApiResponse<UserResponseSessions> | null> => {
    loading.value = true
    error.value = null

    const response = await client.get({
      url: '/user/sessions',
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<UserResponseSessions>)
    if (data?.sessions) {
      sessions.value = data.sessions
    }
    else {
      error.value = 'Failed to fetch sessions'
    }

    return response as ApiResponse<UserResponseSessions>
  }

  const closeAllSessions = async (): Promise<ApiResponse<void> | null> => {
    loading.value = true
    error.value = null

    const response = await client.post({
      url: '/user/sessions/close',
    })

    loading.value = false

    if ('error' in response && response.error) {
      error.value = 'Failed to close sessions'
    }
    else {
      sessions.value = sessions.value.filter(s => s.current === true)
    }

    return response as ApiResponse<void>
  }

  return {
    sessions: readonly(sessions),
    currentSession,
    otherSessions,
    loading: readonly(loading),
    error: readonly(error),
    fetchSessions,
    closeAllSessions,
  }
}
