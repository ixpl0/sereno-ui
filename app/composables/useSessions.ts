import { getUserSessions, postUserSessionsClose } from '~/api/sdk.gen'
import type { UserResponseSession } from '~/api/types.gen'

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

  const fetchSessions = async () => {
    loading.value = true
    error.value = null

    const response = await getUserSessions()

    loading.value = false

    if (response.data?.sessions) {
      sessions.value = response.data.sessions
    }
    else {
      error.value = 'Failed to fetch sessions'
    }

    return response
  }

  const closeAllSessions = async () => {
    loading.value = true
    error.value = null

    const response = await postUserSessionsClose()

    loading.value = false

    if (response.error) {
      error.value = 'Failed to close sessions'
    }
    else {
      sessions.value = sessions.value.filter(s => s.current === true)
    }

    return response
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
