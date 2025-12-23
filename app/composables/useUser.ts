import { client } from '~/api/client.gen'
import type {
  UserResponseUser,
  UserRequestParameter,
} from '~/api/types.gen'
import type { ApiResponse } from '~/types/api'
import { getApiData } from '~/utils/api'

export const useUser = () => {
  const user = useState<UserResponseUser | null>('user', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUser = async (): Promise<ApiResponse<UserResponseUser> | null> => {
    loading.value = true
    error.value = null

    const response = await client.get({
      url: '/user',
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<UserResponseUser>)
    if (data) {
      user.value = data
    }
    else {
      error.value = 'Failed to fetch user'
    }

    return response as ApiResponse<UserResponseUser>
  }

  const updateUserParameter = async (
    kind: UserRequestParameter['kind'],
    value: string,
  ): Promise<ApiResponse<UserResponseUser>> => {
    loading.value = true
    error.value = null

    const body: UserRequestParameter = { kind, value }
    const response = await client.post({
      url: '/user/update',
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<UserResponseUser>)
    if (data) {
      user.value = data
    }
    else {
      error.value = 'Failed to update user'
    }

    return response as ApiResponse<UserResponseUser>
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
