import {
  getUserContacts,
  postUserContactsAdd,
  postUserContactsByIdDelete,
  postUserContactsByIdVerify,
} from '~/api/sdk.gen'
import type { UserResponseContact, UserRequestContact } from '~/api/types.gen'

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

  const fetchContacts = async () => {
    loading.value = true
    error.value = null

    const response = await getUserContacts()

    loading.value = false

    if (response.data?.contacts) {
      contacts.value = response.data.contacts
    }
    else {
      error.value = 'Failed to fetch contacts'
    }

    return response
  }

  const addContact = async (kind: UserRequestContact['kind'], value: string) => {
    loading.value = true
    error.value = null

    const response = await postUserContactsAdd({
      body: { kind, value },
    })

    loading.value = false

    if (response.data?.contact) {
      contacts.value = [...contacts.value, response.data.contact]
    }
    else {
      error.value = 'Failed to add contact'
    }

    return response
  }

  const deleteContact = async (id: string) => {
    loading.value = true
    error.value = null

    const response = await postUserContactsByIdDelete({
      path: { id },
    })

    loading.value = false

    if (response.error) {
      error.value = 'Failed to delete contact'
    }
    else {
      contacts.value = contacts.value.filter(c => c.id !== id)
    }

    return response
  }

  const verifyContact = async (id: string, code: string) => {
    loading.value = true
    error.value = null

    const response = await postUserContactsByIdVerify({
      path: { id },
      body: { code },
    })

    loading.value = false

    const verifiedContact = response.data?.contact
    if (verifiedContact) {
      contacts.value = contacts.value.map(c => c.id === id ? verifiedContact : c)
    }
    else {
      error.value = 'Failed to verify contact'
    }

    return response
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
