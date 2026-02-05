import {
  getTenantsByIdMembers,
  postTenantsByIdMembersUpdate,
  postTenantsByIdMembersDelete,
} from '~/api/sdk.gen'
import type { TenantResponseMember } from '~/api/types.gen'

type MembersCache = Record<string, ReadonlyArray<TenantResponseMember>>

export const useTenantMembers = (tenantId: Ref<string>) => {
  const membersCache = useState<MembersCache>('tenant-members-cache', () => ({}))
  const members = computed({
    get: () => membersCache.value[tenantId.value] ?? [],
    set: (value: ReadonlyArray<TenantResponseMember>) => {
      membersCache.value = { ...membersCache.value, [tenantId.value]: value }
    },
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const adminMembers = computed(() =>
    members.value.filter(m => m.role === 'admin'),
  )

  const regularMembers = computed(() =>
    members.value.filter(m => m.role !== 'admin'),
  )

  const fetchMembers = async () => {
    loading.value = true
    error.value = null

    const response = await getTenantsByIdMembers({
      path: { id: tenantId.value },
    })

    loading.value = false

    if (response.data?.members) {
      members.value = response.data.members
    }
    else {
      error.value = 'Failed to fetch members'
    }

    return response
  }

  const updateMember = async (memberId: string, role: 'watcher' | 'member' | 'admin') => {
    loading.value = true
    error.value = null

    const response = await postTenantsByIdMembersUpdate({
      path: { id: tenantId.value },
      body: { id: memberId, role },
    })

    loading.value = false

    if (response.data?.member) {
      const updatedMember = response.data.member
      const existingMember = members.value.find(m => m.id === memberId)
      if (existingMember) {
        members.value = members.value.map(m => m.id === memberId ? updatedMember : m)
      }
      else {
        members.value = [...members.value, updatedMember]
      }
    }
    else {
      error.value = 'Failed to update member'
    }

    return response
  }

  const deleteMember = async (memberId: string) => {
    loading.value = true
    error.value = null

    const response = await postTenantsByIdMembersDelete({
      path: { id: tenantId.value },
      body: { id: memberId },
    })

    loading.value = false

    if (response.error) {
      error.value = 'Failed to delete member'
    }
    else {
      members.value = members.value.filter(m => m.id !== memberId)
    }

    return response
  }

  return {
    members: readonly(members),
    adminMembers,
    regularMembers,
    loading: readonly(loading),
    error: readonly(error),
    fetchMembers,
    updateMember,
    deleteMember,
  }
}
