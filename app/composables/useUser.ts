import { getUser, postUserUpdate } from '~/api/sdk.gen'
import type { UserRequestParameter } from '~/api/types.gen'

export const useUser = () => {
  const { data: response, status: fetchStatus, refresh } = useAsyncData(
    'user',
    async () => {
      const result = await getUser()
      if (result.error) {
        throw createError({ message: 'Failed to fetch user' })
      }
      return result.data
    },
  )

  const user = computed(() => response.value?.user ?? null)
  const loading = computed(() => fetchStatus.value === 'pending')

  const updateUserParameter = async (
    kind: UserRequestParameter['kind'],
    value: string,
  ) => {
    const result = await postUserUpdate({ body: { kind, value } })

    if (result.data?.user) {
      await refresh()
    }

    return result
  }

  const updateFirstName = (value: string) => updateUserParameter('first_name', value)
  const updateLastName = (value: string) => updateUserParameter('last_name', value)
  const updateTimezone = (value: string) => updateUserParameter('timezone', value)
  const updateLanguage = (value: string) => updateUserParameter('language', value)

  return {
    user,
    loading,
    refresh,
    updateFirstName,
    updateLastName,
    updateTimezone,
    updateLanguage,
  }
}
