import {
  getTenantsByIdEscalations,
  postEscalationsByIdUpdate,
  postTenantsByIdEscalationsCreate,
  postTenantsByIdEscalationsDelete,
} from '~/api/sdk.gen'
import type { TenantRequestEscalation } from '~/api/types.gen'

export const useEscalations = (tenantId: Ref<string>) => {
  const { data: response, status: fetchStatus, refresh } = useAsyncData(
    () => `escalations-${tenantId.value}`,
    async () => {
      if (!tenantId.value) {
        return null
      }
      const result = await getTenantsByIdEscalations({
        path: { id: tenantId.value },
      })
      if (result.error) {
        throw createError({ message: 'Failed to fetch escalations' })
      }
      return result.data
    },
    { watch: [tenantId] },
  )

  const escalations = computed(() => response.value?.escalations ?? [])
  const loading = computed(() => fetchStatus.value === 'pending')

  const createEscalation = async (escalation: TenantRequestEscalation) => {
    const result = await postTenantsByIdEscalationsCreate({
      path: { id: tenantId.value },
      body: escalation,
    })

    if (result.data?.escalation) {
      await refresh()
    }

    return result
  }

  const updateEscalation = async (escalationId: string, escalation: TenantRequestEscalation) => {
    const result = await postEscalationsByIdUpdate({
      path: { id: escalationId },
      body: escalation,
    })

    if (result.data?.escalation) {
      await refresh()
    }

    return result
  }

  const deleteEscalation = async (escalationId: string) => {
    const result = await postTenantsByIdEscalationsDelete({
      path: { id: tenantId.value },
      body: { id: escalationId },
    })

    if (!result.error) {
      await refresh()
    }

    return result
  }

  const toggleEscalation = async (escalation: {
    id: string
    name: string
    enabled: boolean
  }) => {
    const updated: TenantRequestEscalation = {
      name: escalation.name,
      enabled: !escalation.enabled,
    }

    return updateEscalation(escalation.id, updated)
  }

  return {
    escalations,
    loading,
    refresh,
    createEscalation,
    updateEscalation,
    deleteEscalation,
    toggleEscalation,
  }
}
