<script setup lang="ts">
import type {
  TenantResponseCondition,
  TenantResponseStep,
} from '~/api/types.gen'

interface EscalationData {
  id: string
  name: string
  enabled: boolean
  steps: ReadonlyArray<TenantResponseStep>
  conditions: ReadonlyArray<TenantResponseCondition>
}

interface Props {
  escalation: EscalationData
  formatDelay: (seconds: number) => string
  getStepTarget: (step: TenantResponseStep) => string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: []
  delete: []
}>()

const sortedSteps = computed(() =>
  [...props.escalation.steps].sort((a, b) => a.delay - b.delay),
)

const sortedConditions = computed(() =>
  [...props.escalation.conditions].sort((a, b) => a.number - b.number),
)

const formatCondition = (condition: TenantResponseCondition): string => {
  const parts: string[] = []

  if (condition.event) {
    parts.push(condition.event === 'alert' ? 'Алерт' : 'Инцидент')
  }

  if (condition.labels) {
    const labels = Object.entries(condition.labels).map(([key, value]) => `${key}=${value}`)
    if (labels.length > 0) {
      parts.push(labels.join(', '))
    }
  }

  if (condition.name) {
    parts.push(condition.name)
  }

  if (parts.length === 0) {
    return 'Без условий'
  }

  return parts.join(' • ')
}
</script>

<template>
  <UiCard class="animate-slide-up">
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="w-10 h-10 flex items-center justify-center rounded-lg shrink-0"
          :class="escalation.enabled ? 'bg-primary/10' : 'bg-base-300'"
        >
          <Icon
            name="lucide:git-branch"
            class="w-5 h-5"
            :class="escalation.enabled ? 'text-primary' : 'text-base-content/40'"
          />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold truncate">
              {{ escalation.name }}
            </h3>
            <span
              class="badge badge-sm"
              :class="escalation.enabled ? 'badge-success' : 'badge-ghost'"
            >
              {{ escalation.enabled ? 'Активна' : 'Отключена' }}
            </span>
          </div>
          <div class="text-sm text-base-content/60">
            {{ escalation.steps.length }} {{ escalation.steps.length === 1 ? 'шаг' : 'шага' }}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <UiButton
          variant="ghost"
          size="sm"
          :aria-label="escalation.enabled ? 'Отключить эскалацию' : 'Включить эскалацию'"
          @click="emit('toggle')"
        >
          <Icon
            :name="escalation.enabled ? 'lucide:pause' : 'lucide:play'"
            class="w-4 h-4"
          />
        </UiButton>
        <UiButton
          variant="ghost"
          size="sm"
          aria-label="Удалить эскалацию"
          @click="emit('delete')"
        >
          <Icon
            name="lucide:trash-2"
            class="w-4 h-4"
          />
        </UiButton>
      </div>
    </div>

    <div
      v-if="sortedSteps.length > 0"
      class="mt-6"
    >
      <div
        v-for="(step, index) in sortedSteps"
        :key="`${escalation.id}-${step.number}-${index}`"
        class="flex gap-3"
      >
        <div class="relative flex flex-col items-center w-3">
          <div class="w-3 h-3 rounded-full bg-base-100 border-2 border-primary shrink-0 z-10" />
          <div
            v-if="index < sortedSteps.length - 1"
            class="absolute top-3 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-base-content/15"
          />
        </div>
        <div class="pb-6 -mt-0.5">
          <div class="flex items-center gap-2 text-sm">
            <span class="font-medium text-primary">
              {{ formatDelay(step.delay) }}
            </span>
            <Icon
              name="lucide:arrow-right"
              class="w-4 h-4 text-base-content/40"
            />
            <span class="text-base-content/70">
              {{ getStepTarget(step) }}
            </span>
          </div>
          <div
            v-if="step.name"
            class="text-xs text-base-content/50 mt-1"
          >
            {{ step.name }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="sortedConditions.length > 0"
      class="mt-4 pt-4 border-t border-base-content/10"
    >
      <div class="text-xs text-base-content/50 mb-2">
        Условия срабатывания
      </div>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="condition in sortedConditions"
          :key="`${escalation.id}-condition-${condition.number}`"
          class="badge badge-ghost badge-sm"
        >
          {{ formatCondition(condition) }}
        </span>
      </div>
    </div>
  </UiCard>
</template>
