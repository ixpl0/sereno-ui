import {
  getTenantsByIdEscalations,
  postTenantsByIdEscalationsCreate,
  postTenantsByIdEscalationsDelete,
  postTenantsByIdEscalationsUpdate,
} from '~/api/sdk.gen'
import type {
  TenantResponseEscalation,
  TenantRequestEscalation,
  TenantRequestEscalationStep,
  TenantRequestEscalationRule,
} from '~/api/types.gen'

type EscalationsCache = Record<string, ReadonlyArray<TenantResponseEscalation>>

type StepPosition = TenantRequestEscalationStep['position']
type RuleEvent = TenantRequestEscalationRule['event']

const VALID_POSITIONS: ReadonlyArray<NonNullable<StepPosition>> = ['current', 'next', 'previous', 'all']
const VALID_EVENTS: ReadonlyArray<NonNullable<RuleEvent>> = ['alert', 'incident']

const isValidPosition = (value: string | undefined): value is StepPosition =>
  value === undefined || VALID_POSITIONS.includes(value as NonNullable<StepPosition>)

const isValidEvent = (value: string | undefined): value is RuleEvent =>
  value === undefined || VALID_EVENTS.includes(value as NonNullable<RuleEvent>)

export const useEscalations = (tenantId: Ref<string>) => {
  const escalationsCache = useState<EscalationsCache>('escalations-cache', () => ({}))
  const escalations = computed({
    get: () => escalationsCache.value[tenantId.value] ?? [],
    set: (value: ReadonlyArray<TenantResponseEscalation>) => {
      escalationsCache.value = { ...escalationsCache.value, [tenantId.value]: value }
    },
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchEscalations = async () => {
    if (!tenantId.value) {
      return null
    }

    loading.value = true
    error.value = null

    const response = await getTenantsByIdEscalations({
      path: { id: tenantId.value },
    })

    loading.value = false

    if (response.data?.escalations) {
      escalations.value = response.data.escalations
    }
    else {
      error.value = 'Failed to fetch escalations'
    }

    return response
  }

  const createEscalation = async (escalation: TenantRequestEscalation) => {
    loading.value = true
    error.value = null

    const response = await postTenantsByIdEscalationsCreate({
      path: { id: tenantId.value },
      body: escalation,
    })

    loading.value = false

    if (response.data?.escalation) {
      escalations.value = [...escalations.value, response.data.escalation]
    }
    else {
      error.value = 'Failed to create escalation'
    }

    return response
  }

  const updateEscalation = async (escalation: TenantRequestEscalation) => {
    loading.value = true
    error.value = null

    const response = await postTenantsByIdEscalationsUpdate({
      path: { id: tenantId.value },
      body: escalation,
    })

    loading.value = false

    if (response.data?.escalation) {
      escalations.value = escalations.value.map(e =>
        e.name === escalation.name ? response.data.escalation : e,
      )
    }
    else {
      error.value = 'Failed to update escalation'
    }

    return response
  }

  const deleteEscalation = async (escalationId: string) => {
    loading.value = true
    error.value = null

    const response = await postTenantsByIdEscalationsDelete({
      path: { id: tenantId.value },
      body: { id: escalationId },
    })

    loading.value = false

    if (response.error) {
      error.value = 'Failed to delete escalation'
    }
    else {
      escalations.value = escalations.value.filter(e => e.id !== escalationId)
    }

    return response
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
        description: step.description,
        member: step.member,
        position: isValidPosition(step.position) ? step.position : undefined,
        schedule: step.schedule,
      })),
      rules: escalation.rules.map(rule => ({
        description: rule.description,
        event: isValidEvent(rule.event) ? rule.event : undefined,
        labels: rule.labels ? { ...rule.labels } : undefined,
      })),
    }

    return updateEscalation(updated)
  }

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
