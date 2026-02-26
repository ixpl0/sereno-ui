interface MockEscalationStepLike {
  delay: number
  member?: string
  description?: string
  schedule?: {
    id: string
    position?: 'current' | 'next' | 'previous' | 'all'
  }
}

interface MockEscalationRuleLike {
  event?: string
  labels?: Record<string, string>
  description?: string
}

interface MockEscalationLike {
  id: string
  name: string
  enabled: boolean
  steps: Array<MockEscalationStepLike>
  rules?: Array<MockEscalationRuleLike>
}

export const toEscalationResponse = (escalation: MockEscalationLike) => {
  const now = Math.floor(Date.now() / 1000)

  return {
    id: escalation.id,
    name: escalation.name,
    enabled: escalation.enabled,
    created: now,
    creator: 'user-1',
    steps: escalation.steps.map((step, index) => ({
      number: index,
      delay: step.delay,
      member: step.member,
      name: step.description,
      created: now,
      creator: 'user-1',
      schedule: step.schedule
        ? {
            id: step.schedule.id,
            name: step.schedule.id,
            position: step.schedule.position,
          }
        : undefined,
    })),
    conditions: (escalation.rules ?? []).map((rule, index) => ({
      number: index,
      event: rule.event,
      labels: rule.labels,
      name: rule.description,
      created: now,
      creator: 'user-1',
    })),
  }
}
