import {
  getUserContacts,
  postUserContactsAdd,
  postUserContactsByIdDelete,
  postUserContactsByIdVerify,
} from '~/api/sdk.gen'
import type { UserRequestContact } from '~/api/types.gen'

export const useContacts = () => {
  const { data: response, status: fetchStatus, refresh } = useAsyncData(
    'contacts',
    async () => {
      const result = await getUserContacts()
      if (result.error) {
        throw createError({ message: 'Failed to fetch contacts' })
      }
      return result.data
    },
  )

  const contacts = computed(() => response.value?.contacts ?? [])
  const loading = computed(() => fetchStatus.value === 'pending')

  const verifiedContacts = computed(() =>
    contacts.value.filter(c => c.verified === true),
  )

  const unverifiedContacts = computed(() =>
    contacts.value.filter(c => c.verified !== true),
  )

  const addContact = async (kind: UserRequestContact['kind'], value: string) => {
    const result = await postUserContactsAdd({
      body: { kind, value },
    })

    if (result.data?.contact) {
      await refresh()
    }

    return result
  }

  const deleteContact = async (id: string) => {
    const result = await postUserContactsByIdDelete({
      path: { id },
    })

    if (!result.error) {
      await refresh()
    }

    return result
  }

  const verifyContact = async (id: string, code: string) => {
    const result = await postUserContactsByIdVerify({
      path: { id },
      body: { code },
    })

    if (result.data?.contact) {
      await refresh()
    }

    return result
  }

  return {
    contacts,
    verifiedContacts,
    unverifiedContacts,
    loading,
    refresh,
    addContact,
    deleteContact,
    verifyContact,
  }
}
