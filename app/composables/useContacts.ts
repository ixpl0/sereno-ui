import { client } from '~/api/client.gen'
import type {
  UserResponseContact,
  UserResponseContactsList,
  UserResponseSingleContact,
  UserRequestContact,
  UserRequestCode,
} from '~/api/types.gen'
import type { ApiResponse } from '~/types/api'
import { getApiData } from '~/utils/api'

export const useContacts = () => {
  const contacts = useState<ReadonlyArray<UserResponseContact>>('contacts', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const verifiedContacts = computed(() =>
    contacts.value.filter(c => c.verified === true),
  )

  const unverifiedContacts = computed(() =>
    contacts.value.filter(c => c.verified !== true),
  )

  const fetchContacts = async (): Promise<ApiResponse<UserResponseContactsList> | null> => {
    loading.value = true
    error.value = null

    const response = await client.get({
      url: '/user/contacts',
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<UserResponseContactsList>)
    if (data?.contacts) {
      contacts.value = data.contacts
    }
    else {
      error.value = 'Failed to fetch contacts'
    }

    return response as ApiResponse<UserResponseContactsList>
  }

  const addContact = async (kind: UserRequestContact['kind'], value: string): Promise<ApiResponse<UserResponseSingleContact>> => {
    loading.value = true
    error.value = null

    const body: UserRequestContact = { kind, value }
    const response = await client.post({
      url: '/user/contacts/add',
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<UserResponseSingleContact>)
    if (data?.contact) {
      contacts.value = [...contacts.value, data.contact]
    }
    else {
      error.value = 'Failed to add contact'
    }

    return response as ApiResponse<UserResponseSingleContact>
  }

  const deleteContact = async (id: string): Promise<ApiResponse<void>> => {
    loading.value = true
    error.value = null

    const response = await client.post({
      url: '/user/contacts/{id}/delete',
      path: { id },
    })

    loading.value = false

    if ('error' in response && response.error) {
      error.value = 'Failed to delete contact'
    }
    else {
      contacts.value = contacts.value.filter(c => c.id !== id)
    }

    return response as ApiResponse<void>
  }

  const verifyContact = async (id: string, code: string): Promise<ApiResponse<UserResponseSingleContact>> => {
    loading.value = true
    error.value = null

    const body: UserRequestCode = { code }
    const response = await client.post({
      url: '/user/contacts/{id}/verify',
      path: { id },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<UserResponseSingleContact>)
    const verifiedContact = data?.contact
    if (verifiedContact) {
      contacts.value = contacts.value.map(c => c.id === id ? verifiedContact : c)
    }
    else {
      error.value = 'Failed to verify contact'
    }

    return response as ApiResponse<UserResponseSingleContact>
  }

  return {
    contacts: readonly(contacts),
    verifiedContacts,
    unverifiedContacts,
    loading: readonly(loading),
    error: readonly(error),
    fetchContacts,
    addContact,
    deleteContact,
    verifyContact,
  }
}
