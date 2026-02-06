<script setup lang="ts">
import type {
  TenantResponseEscalationStep,
  TenantRequestEscalation,
  TenantRequestEscalationStep,
  TenantRequestEscalationRule,
} from '~/api/types.gen'

type RuleEvent = TenantRequestEscalationRule['event']
const VALID_EVENTS: ReadonlyArray<NonNullable<RuleEvent>> = ['alert', 'incident']
const isValidEvent = (value: string | undefined): value is RuleEvent =>
  value === undefined || VALID_EVENTS.includes(value as NonNullable<RuleEvent>)

interface EscalationData {
  id: string
  name: string
  enabled: boolean
  steps: ReadonlyArray<TenantResponseEscalationStep>
  rules: ReadonlyArray<{
    description?: string
    event?: string
    labels?: Record<string, string>
  }>
}

interface Props {
  escalation: EscalationData
  editing: boolean
  tenantId: string
  formatDelay: (seconds: number) => string
  getStepTarget: (step: TenantResponseEscalationStep) => string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: []
  delete: []
  edit: []
  close: []
  updated: []
}>()

const toast = useToast()
const { updateEscalation } = useEscalations(ref(props.tenantId))

const editName = ref(props.escalation.name)
const editSteps = ref<Array<{
  delay: number
  delayMinutes: number
  member: string
  name: string
}>>([])

const sortedSteps = computed(() =>
  [...props.escalation.steps].sort((a, b) => a.delay - b.delay),
)

const initEditSteps = () => {
  editSteps.value = [...props.escalation.steps]
    .sort((a, b) => a.delay - b.delay)
    .map(step => ({
      delay: step.delay,
      delayMinutes: Math.floor(step.delay / 60),
      member: step.member ?? '',
      name: step.description ?? '',
    }))
}

watch(() => props.editing, (value) => {
  if (value) {
    editName.value = props.escalation.name
    initEditSteps()
  }
})

const addStep = () => {
  const lastStep = editSteps.value[editSteps.value.length - 1]
  const lastDelay = lastStep?.delayMinutes ?? 0
  editSteps.value = [
    ...editSteps.value,
    { delay: (lastDelay + 5) * 60, delayMinutes: lastDelay + 5, member: '', name: '' },
  ]
}

const removeStep = (index: number) => {
  editSteps.value = editSteps.value.filter((_, i) => i !== index)
}

const handleSave = async () => {
  const name = editName.value.trim()
  if (!name) {
    toast.error('Введите название')
    return
  }

  if (editSteps.value.length === 0) {
    toast.error('Добавьте хотя бы один шаг')
    return
  }

  const steps: Array<TenantRequestEscalationStep> = editSteps.value.map(step => ({
    delay: step.delayMinutes * 60,
    member: step.member || undefined,
    name: step.name || undefined,
  }))

  const escalation: TenantRequestEscalation = {
    name,
    enabled: props.escalation.enabled,
    steps,
    rules: props.escalation.rules.map(rule => ({
      name: rule.description,
      event: isValidEvent(rule.event) ? rule.event : undefined,
      labels: rule.labels,
    })),
  }

  const response = await updateEscalation(escalation)

  if ('error' in response && response.error) {
    toast.error('Не удалось сохранить')
    return
  }

  toast.success('Сохранено')
  emit('close')
  emit('updated')
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
          @click="emit('edit')"
        >
          <Icon
            name="lucide:pencil"
            class="w-4 h-4"
          />
        </UiButton>
        <UiButton
          variant="ghost"
          size="sm"
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
      v-if="!editing"
      class="mt-6"
    >
      <div
        v-for="(step, index) in sortedSteps"
        :key="index"
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
            v-if="step.description"
            class="text-xs text-base-content/50 mt-1"
          >
            {{ step.description }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="mt-6 space-y-4"
    >
      <UiInput
        v-model="editName"
        placeholder="Название эскалации"
      />

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="font-medium text-sm">
            Шаги эскалации
          </h4>
          <UiButton
            variant="ghost"
            size="sm"
            @click="addStep"
          >
            <Icon
              name="lucide:plus"
              class="w-4 h-4 mr-1"
            />
            Добавить шаг
          </UiButton>
        </div>

        <div
          v-for="(step, index) in editSteps"
          :key="index"
          class="flex items-center gap-3 p-3 bg-base-200/50 rounded-lg"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-base-content/60 whitespace-nowrap">Через</span>
            <input
              v-model.number="step.delayMinutes"
              type="number"
              min="0"
              class="input input-bordered input-sm w-20"
            >
            <span class="text-sm text-base-content/60">мин</span>
          </div>
          <Icon
            name="lucide:arrow-right"
            class="w-4 h-4 text-base-content/40 shrink-0"
          />
          <UiInput
            v-model="step.member"
            placeholder="ID участника"
            class="flex-1"
          />
          <UiButton
            variant="ghost"
            size="sm"
            @click="removeStep(index)"
          >
            <Icon
              name="lucide:x"
              class="w-4 h-4"
            />
          </UiButton>
        </div>

        <div
          v-if="editSteps.length === 0"
          class="text-center py-4 text-base-content/50 text-sm"
        >
          Добавьте хотя бы один шаг
        </div>
      </div>

      <div class="flex gap-2 justify-end pt-2">
        <UiButton
          variant="primary"
          size="sm"
          @click="handleSave"
        >
          Сохранить
        </UiButton>
        <UiButton
          variant="ghost"
          size="sm"
          @click="emit('close')"
        >
          Отмена
        </UiButton>
      </div>
    </div>

    <div
      v-if="escalation.rules.length > 0 && !editing"
      class="mt-4 pt-4 border-t border-base-content/10"
    >
      <div class="text-xs text-base-content/50 mb-2">
        Правила срабатывания
      </div>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(rule, index) in escalation.rules"
          :key="index"
          class="badge badge-ghost badge-sm"
        >
          <span v-if="rule.event">{{ rule.event === 'alert' ? 'Алерт' : 'Инцидент' }}</span>
          <template v-if="rule.labels">
            <span
              v-for="(value, key) in rule.labels"
              :key="String(key)"
              class="ml-1"
            >
              {{ key }}={{ value }}
            </span>
          </template>
        </div>
      </div>
    </div>
  </UiCard>
</template>
