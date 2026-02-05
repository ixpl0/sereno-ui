import { getUser, postUserUpdate } from '~/api/sdk.gen'
import type { UserResponseUser, UserRequestParameter } from '~/api/types.gen'

export const useUser = () => {
  const user = useState<UserResponseUser | null>('user', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUser = async () => {
    loading.value = true
    error.value = null

    const response = await getUser()

    loading.value = false

    if (response.data?.user) {
      user.value = response.data.user
    }
    else {
      error.value = 'Failed to fetch user'
    }

    return response
  }

  const updateUserParameter = async (
    kind: UserRequestParameter['kind'],
    value: string,
  ) => {
    loading.value = true
    error.value = null

    const response = await postUserUpdate({ body: { kind, value } })

    loading.value = false

    if (response.data?.user) {
      user.value = response.data.user
    }
    else {
      error.value = 'Failed to update user'
    }

    return response
  }

  const updateFirstName = (value: string) => updateUserParameter('first_name', value)
  const updateLastName = (value: string) => updateUserParameter('last_name', value)
  const updateTimezone = (value: string) => updateUserParameter('timezone', value)
  const updateLanguage = (value: string) => updateUserParameter('language', value)

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    fetchUser,
    updateFirstName,
    updateLastName,
    updateTimezone,
    updateLanguage,
  }
}
