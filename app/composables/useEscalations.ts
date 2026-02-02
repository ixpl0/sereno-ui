import { client } from '~/api/client.gen'
import type {
  TenantResponseEscalation,
  TenantResponseEscalationList,
  TenantResponseSingleEscalation,
  TenantRequestEscalation,
  TenantRequestId,
} from '~/api/types.gen'
import type { ApiResponse } from '~/types/api'
import { getApiData } from '~/utils/api'

export const useEscalations = (tenantId: Ref<string>) => {
  const escalations = ref<ReadonlyArray<TenantResponseEscalation>>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchEscalations = async (): Promise<ApiResponse<TenantResponseEscalationList> | null> => {
    if (!tenantId.value) {
      return null
    }

    loading.value = true
    error.value = null

    const response = await client.get({
      url: '/tenants/{id}/escalations',
      path: { id: tenantId.value },
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<TenantResponseEscalationList>)
    if (data?.escalations) {
      escalations.value = data.escalations
    }
    else {
      error.value = 'Failed to fetch escalations'
    }

    return response as ApiResponse<TenantResponseEscalationList>
  }

  const createEscalation = async (escalation: TenantRequestEscalation): Promise<ApiResponse<TenantResponseSingleEscalation>> => {
    loading.value = true
    error.value = null

    const response = await client.post({
      url: '/tenants/{id}/escalation/create',
      path: { id: tenantId.value },
      body: escalation,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<TenantResponseSingleEscalation>)
    if (data?.escalation) {
      escalations.value = [...escalations.value, data.escalation]
    }
    else {
      error.value = 'Failed to create escalation'
    }

    return response as ApiResponse<TenantResponseSingleEscalation>
  }

  const updateEscalation = async (escalationId: string, escalation: TenantRequestEscalation): Promise<ApiResponse<TenantResponseSingleEscalation>> => {
    loading.value = true
    error.value = null

    const response = await client.post({
      url: '/tenants/{id}/escalation/update',
      path: { id: tenantId.value },
      query: { escalation: escalationId },
      body: escalation,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<TenantResponseSingleEscalation>)
    if (data?.escalation) {
      escalations.value = escalations.value.map(e => e.id === escalationId ? data.escalation : e)
    }
    else {
      error.value = 'Failed to update escalation'
    }

    return response as ApiResponse<TenantResponseSingleEscalation>
  }

  const deleteEscalation = async (escalationId: string): Promise<ApiResponse<void>> => {
    loading.value = true
    error.value = null

    const body: TenantRequestId = { id: escalationId }
    const response = await client.post({
      url: '/tenants/{id}/escalation/delete',
      path: { id: tenantId.value },
      body,
    })

    loading.value = false

    if ('error' in response && response.error) {
      error.value = 'Failed to delete escalation'
    }
    else {
      escalations.value = escalations.value.filter(e => e.id !== escalationId)
    }

    return response as ApiResponse<void>
  }

  const toggleEscalation = async (escalation: {
    id: string
    name: string
    enabled: boolean
    steps: ReadonlyArray<{ delay: number, description?: string, member?: string, position?: string, schedule?: string }>
    rules: ReadonlyArray<{ description?: string, event?: string, labels?: Record<string, string> }>
  }): Promise<ApiResponse<TenantResponseSingleEscalation>> => {
    const updated: TenantRequestEscalation = {
      name: escalation.name,
      enabled: !escalation.enabled,
      steps: escalation.steps.map(step => ({
        delay: step.delay,
        description: step.description,
        member: step.member,
        position: step.position as 'current' | 'next' | 'previous' | 'all' | undefined,
        schedule: step.schedule,
      })),
      rules: escalation.rules.map(rule => ({
        description: rule.description,
        event: rule.event as 'alert' | 'incident' | undefined,
        labels: rule.labels ? { ...rule.labels } : undefined,
      })),
    }

    return updateEscalation(escalation.id, updated)
  }

  watch(tenantId, () => {
    if (tenantId.value) {
      fetchEscalations()
    }
  })

  return {
    escalations: readonly(escalations),
    loading: readonly(loading),
    error: readonly(error),
    fetchEscalations,
    createEscalation,
    updateEscalation,
    deleteEscalation,
    toggleEscalation,
  }
}
