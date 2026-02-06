import {
  getTenantsByIdEscalations,
  postTenantsByIdEscalationsCreate,
  postTenantsByIdEscalationsDelete,
  postTenantsByIdEscalationsUpdate,
} from '~/api/sdk.gen'
import type {
  TenantRequestEscalation,
  TenantRequestEscalationStep,
  TenantRequestEscalationRule,
} from '~/api/types.gen'

type StepPosition = TenantRequestEscalationStep['position']
type RuleEvent = TenantRequestEscalationRule['event']

const VALID_POSITIONS: ReadonlyArray<NonNullable<StepPosition>> = ['current', 'next', 'previous', 'all']
const VALID_EVENTS: ReadonlyArray<NonNullable<RuleEvent>> = ['alert', 'incident']

const isValidPosition = (value: string | undefined): value is StepPosition =>
  value === undefined || VALID_POSITIONS.includes(value as NonNullable<StepPosition>)

const isValidEvent = (value: string | undefined): value is RuleEvent =>
  value === undefined || VALID_EVENTS.includes(value as NonNullable<RuleEvent>)

export const useEscalations = (tenantId: Ref<string>) => {
  const { data: response, status: fetchStatus, refresh } = useAsyncData(
    () => `escalations-${tenantId.value}`,
    async () => {
      if (!tenantId.value) {
        await waitForRef(tenantId)
      }
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

  const updateEscalation = async (escalation: TenantRequestEscalation) => {
    const result = await postTenantsByIdEscalationsUpdate({
      path: { id: tenantId.value },
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
    steps: ReadonlyArray<{ delay: number, description?: string, member?: string, position?: string, schedule?: string }>
    rules: ReadonlyArray<{ description?: string, event?: string, labels?: Record<string, string> }>
  }) => {
    const updated: TenantRequestEscalation = {
      name: escalation.name,
      enabled: !escalation.enabled,
      steps: escalation.steps.map(step => ({
        delay: step.delay,
        name: step.description,
        member: step.member,
        position: isValidPosition(step.position) ? step.position : undefined,
        schedule: step.schedule,
      })),
      rules: escalation.rules.map(rule => ({
        name: rule.description,
        event: isValidEvent(rule.event) ? rule.event : undefined,
        labels: rule.labels ? { ...rule.labels } : undefined,
      })),
    }

    return updateEscalation(updated)
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
