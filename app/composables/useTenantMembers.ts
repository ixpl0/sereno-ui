import {
  getTenantsByIdMembers,
  postTenantsByIdMembersUpdate,
  postTenantsByIdMembersDelete,
} from '~/api/sdk.gen'

export const useTenantMembers = (tenantId: Ref<string>) => {
  const { data: response, status: fetchStatus, refresh } = useAsyncData(
    () => `tenant-members-${tenantId.value}`,
    async () => {
      if (!tenantId.value) {
        return null
      }
      const result = await getTenantsByIdMembers({
        path: { id: tenantId.value },
      })
      if (result.error) {
        throw createError({ message: 'Failed to fetch members' })
      }
      return result.data
    },
    { watch: [tenantId] },
  )

  const members = computed(() => response.value?.members ?? [])
  const loading = computed(() => fetchStatus.value === 'pending')

  const adminMembers = computed(() =>
    members.value.filter(m => m.role === 'admin'),
  )

  const regularMembers = computed(() =>
    members.value.filter(m => m.role !== 'admin'),
  )

  const updateMember = async (memberId: string, role: 'watcher' | 'member' | 'admin') => {
    const result = await postTenantsByIdMembersUpdate({
      path: { id: tenantId.value },
      body: { id: memberId, role },
    })

    if (result.data?.member) {
      await refresh()
    }

    return result
  }

  const deleteMember = async (memberId: string) => {
    const result = await postTenantsByIdMembersDelete({
      path: { id: tenantId.value },
      body: { id: memberId },
    })

    if (!result.error) {
      await refresh()
    }

    return result
  }

  return {
    members,
    adminMembers,
    regularMembers,
    loading,
    refresh,
    updateMember,
    deleteMember,
  }
}
