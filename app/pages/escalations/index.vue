<script setup lang="ts">
import type { TenantRequestEscalation } from '~/api/types.gen'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Политики эскалаций',
})

useSeoMeta({
  title: 'Политики эскалаций',
  description: 'Управление политиками эскалаций',
})

const toast = useToast()

const { tenants, selectedTenantId } = useTenants()

const {
  escalations,
  loading,
  createEscalation,
  deleteEscalation,
  toggleEscalation,
} = useEscalations(selectedTenantId)

const isCreating = ref(false)

const newEscalationName = ref('')
const newEscalationTenantId = ref('')
const newEscalationInputRef = ref<{ focus: () => void } | null>(null)

const startCreate = () => {
  isCreating.value = true
  newEscalationName.value = ''
  newEscalationTenantId.value = selectedTenantId.value || tenants.value[0]?.id || ''
  nextTick(() => {
    newEscalationInputRef.value?.focus()
  })
}

const cancelCreate = () => {
  isCreating.value = false
  newEscalationName.value = ''
  newEscalationTenantId.value = ''
}

const handleCreate = async () => {
  const name = newEscalationName.value.trim()
  const tenantId = newEscalationTenantId.value

  if (!name) {
    return
  }

  if (!tenantId) {
    toast.error('Выберите команду')
    return
  }

  selectedTenantId.value = tenantId

  const escalation: TenantRequestEscalation = {
    name,
    enabled: true,
  }

  const response = await createEscalation(escalation)

  if ('error' in response && response.error) {
    toast.error('Не удалось создать политику эскалации')
    return
  }

  toast.success('Политика эскалации создана')
  cancelCreate()
}

const handleDelete = async (id: string) => {
  const response = await deleteEscalation(id)

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить политику эскалации')
    return
  }

  toast.success('Политика эскалации удалена')
}

const handleToggle = async (escalation: typeof escalations.value[number]) => {
  const response = await toggleEscalation(escalation)

  if ('error' in response && response.error) {
    toast.error('Не удалось изменить статус')
    return
  }

  toast.success(escalation.enabled ? 'Политика эскалации отключена' : 'Политика эскалации включена')
}

const formatDelay = (seconds: number): string => {
  if (seconds === 0) {
    return 'Сразу'
  }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes} мин`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} ч`
  }
  return `${hours} ч ${remainingMinutes} мин`
}

const getStepTarget = (step: typeof escalations.value[0]['steps'][0]): string => {
  if (step.member) {
    return step.member
  }
  if (step.schedule && step.schedule.position) {
    const positions: Record<string, string> = {
      current: 'текущий дежурный',
      next: 'следующий дежурный',
      previous: 'предыдущий дежурный',
      all: 'все дежурные',
    }
    return positions[step.schedule.position] ?? step.schedule.position
  }
  return 'Не указан'
}
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-5xl mx-auto">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 class="text-2xl font-semibold">
          Политики эскалаций
        </h1>
        <div class="flex flex-wrap items-center gap-3">
          <UiButton
            v-if="!isCreating && selectedTenantId"
            variant="primary"
            size="sm"
            @click="startCreate"
          >
            <Icon
              name="lucide:plus"
              class="w-4 h-4 mr-1"
            />
            Создать
          </UiButton>
        </div>
      </div>

      <UiEmptyState
        v-if="!selectedTenantId"
        icon="lucide:building-2"
        title="Сначала создайте команду"
        action-text="Перейти к командам"
        @action="navigateTo('/teams')"
      />

      <template v-else>
        <div
          v-if="loading && escalations.length === 0"
          class="flex justify-center py-12"
        >
          <span class="loading loading-spinner loading-lg" />
        </div>

        <div
          v-else
          class="space-y-4"
        >
          <div
            v-if="isCreating"
            class="p-4 bg-base-200 rounded-lg space-y-3"
          >
            <UiInput
              ref="newEscalationInputRef"
              v-model="newEscalationName"
              placeholder="Название политики эскалации"
              @keyup.enter="handleCreate"
              @keyup.escape="cancelCreate"
            />
            <div>
              <UiLabel>Команда</UiLabel>
              <select
                v-model="newEscalationTenantId"
                class="select select-bordered w-full"
              >
                <option value="">
                  Выберите команду
                </option>
                <option
                  v-for="tenant in tenants"
                  :key="tenant.id"
                  :value="tenant.id"
                >
                  {{ tenant.name }}
                </option>
              </select>
            </div>
            <div class="flex gap-2 justify-end">
              <UiButton
                variant="primary"
                size="sm"
                @click="handleCreate"
              >
                Создать
              </UiButton>
              <UiButton
                variant="ghost"
                size="sm"
                @click="cancelCreate"
              >
                Отмена
              </UiButton>
            </div>
          </div>

          <UiEmptyState
            v-if="escalations.length === 0 && !isCreating"
            icon="lucide:git-branch"
            title="Нет политик эскалаций"
            action-text="Создать первую политику эскалации"
            @action="startCreate"
          />

          <EscalationCard
            v-for="escalation in escalations"
            :key="escalation.id"
            :escalation="escalation"
            :format-delay="formatDelay"
            :get-step-target="getStepTarget"
            @toggle="handleToggle(escalation)"
            @delete="handleDelete(escalation.id)"
          />
        </div>
      </template>
    </div>
  </div>
</template>
