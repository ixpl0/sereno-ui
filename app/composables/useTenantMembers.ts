import { client } from '~/api/client.gen'
import type {
  TenantResponseMember,
  TenantResponseMemberList,
  TenantResponseSingleMember,
  TenantRequestMember,
  TenantRequestId,
} from '~/api/types.gen'
import type { ApiResponse } from '~/types/api'
import { getApiData } from '~/utils/api'

export const useTenantMembers = (tenantId: Ref<string>) => {
  const members = ref<ReadonlyArray<TenantResponseMember>>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const adminMembers = computed(() =>
    members.value.filter(m => m.admin === true),
  )

  const regularMembers = computed(() =>
    members.value.filter(m => m.admin !== true),
  )

  const fetchMembers = async (): Promise<ApiResponse<TenantResponseMemberList> | null> => {
    loading.value = true
    error.value = null

    const response = await client.get({
      url: '/tenants/{id}/members',
      path: { id: tenantId.value },
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<TenantResponseMemberList>)
    if (data?.members) {
      members.value = data.members
    }
    else {
      error.value = 'Failed to fetch members'
    }

    return response as ApiResponse<TenantResponseMemberList>
  }

  const updateMember = async (memberId: string, admin: boolean): Promise<ApiResponse<TenantResponseSingleMember>> => {
    loading.value = true
    error.value = null

    const body: TenantRequestMember = { id: memberId, admin }
    const response = await client.post({
      url: '/tenants/{id}/members/update',
      path: { id: tenantId.value },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<TenantResponseSingleMember>)
    if (data?.member) {
      const existingMember = members.value.find(m => m.id === memberId)
      if (existingMember) {
        members.value = members.value.map(m => m.id === memberId ? data.member : m)
      }
      else {
        members.value = [...members.value, data.member]
      }
    }
    else {
      error.value = 'Failed to update member'
    }

    return response as ApiResponse<TenantResponseSingleMember>
  }

  const deleteMember = async (memberId: string): Promise<ApiResponse<void>> => {
    loading.value = true
    error.value = null

    const body: TenantRequestId = { id: memberId }
    const response = await client.post({
      url: '/tenants/{id}/members/delete',
      path: { id: tenantId.value },
      body,
    })

    loading.value = false

    if ('error' in response && response.error) {
      error.value = 'Failed to delete member'
    }
    else {
      members.value = members.value.filter(m => m.id !== memberId)
    }

    return response as ApiResponse<void>
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
