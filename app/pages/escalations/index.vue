<script setup lang="ts">
import type { TenantResponseTenantList, TenantResponseEscalationList, TenantRequestEscalation } from '~/api/types.gen'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Эскалации',
})

useSeoMeta({
  title: 'Эскалации',
  description: 'Управление политиками эскалаций',
})

const toast = useToast()

const { data: tenantsData } = await useFetch<TenantResponseTenantList>('/api/v1/tenants')
const tenants = computed(() => tenantsData.value?.tenants ?? [])
const firstTenant = tenants.value[0]
const selectedTenantId = ref(firstTenant?.id ?? '')

watch(tenants, (value) => {
  const first = value[0]
  if (value.length > 0 && !selectedTenantId.value && first) {
    selectedTenantId.value = first.id
  }
}, { immediate: true })

const { data: escalationsData, status: escalationsStatus, refresh: refreshEscalations } = await useFetch<TenantResponseEscalationList>(
  () => `/api/v1/tenants/${selectedTenantId.value}/escalations`,
  { watch: [selectedTenantId] },
)
const escalations = computed(() => escalationsData.value?.escalations ?? [])
const loading = computed(() => escalationsStatus.value === 'pending')

const {
  createEscalation,
  deleteEscalation,
  toggleEscalation,
} = useEscalations(selectedTenantId)

const isCreating = ref(false)
const editingId = ref<string | null>(null)

const newEscalationName = ref('')
const newEscalationInputRef = ref<{ focus: () => void } | null>(null)

const startCreate = () => {
  isCreating.value = true
  newEscalationName.value = ''
  nextTick(() => {
    newEscalationInputRef.value?.focus()
  })
}

const cancelCreate = () => {
  isCreating.value = false
  newEscalationName.value = ''
}

const handleCreate = async () => {
  const name = newEscalationName.value.trim()
  if (!name) {
    return
  }

  const escalation: TenantRequestEscalation = {
    name,
    enabled: true,
    steps: [{ delay: 0 }],
  }

  const response = await createEscalation(escalation)

  if ('error' in response && response.error) {
    toast.error('Не удалось создать эскалацию')
    return
  }

  toast.success('Эскалация создана')
  cancelCreate()
  await refreshEscalations()

  const created = 'data' in response ? response.data?.escalation : null
  if (created) {
    editingId.value = created.id
  }
}

const handleDelete = async (id: string) => {
  const response = await deleteEscalation(id)

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить эскалацию')
    return
  }

  toast.success('Эскалация удалена')
  await refreshEscalations()
}

const handleToggle = async (escalation: typeof escalations.value[number]) => {
  const mutableEscalation = {
    ...escalation,
    steps: [...escalation.steps],
    rules: [...escalation.rules],
  }
  const response = await toggleEscalation(mutableEscalation)

  if ('error' in response && response.error) {
    toast.error('Не удалось изменить статус')
    return
  }

  toast.success(escalation.enabled ? 'Эскалация отключена' : 'Эскалация включена')
  await refreshEscalations()
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
  if (step.schedule && step.position) {
    const positions: Record<string, string> = {
      current: 'текущий дежурный',
      next: 'следующий дежурный',
      previous: 'предыдущий дежурный',
      all: 'все дежурные',
    }
    return positions[step.position] ?? step.position
  }
  return 'Не указан'
}
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold">
          Эскалации
        </h1>
        <div class="flex items-center gap-3">
          <select
            v-if="tenants.length > 1"
            v-model="selectedTenantId"
            class="select select-bordered select-sm max-w-64"
          >
            <option
              v-for="tenant in tenants"
              :key="tenant.id"
              :value="tenant.id"
            >
              {{ tenant.name }}
            </option>
          </select>
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

      <div
        v-if="!selectedTenantId"
        class="text-center py-12"
      >
        <Icon
          name="lucide:building-2"
          class="w-16 h-16 mx-auto text-base-content/20 mb-4"
        />
        <p class="text-base-content/60 mb-4">
          Сначала создайте команду
        </p>
        <UiButton
          variant="primary"
          @click="navigateTo('/teams')"
        >
          Перейти к командам
        </UiButton>
      </div>

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
              placeholder="Название эскалации"
              @keyup.enter="handleCreate"
              @keyup.escape="cancelCreate"
            />
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

          <div
            v-if="escalations.length === 0 && !isCreating"
            class="text-center py-12"
          >
            <Icon
              name="lucide:git-branch"
              class="w-16 h-16 mx-auto text-base-content/20 mb-4"
            />
            <p class="text-base-content/60 mb-4">
              Нет эскалаций
            </p>
            <UiButton
              variant="primary"
              @click="startCreate"
            >
              Создать первую эскалацию
            </UiButton>
          </div>

          <EscalationCard
            v-for="escalation in escalations"
            :key="escalation.id"
            :escalation="escalation"
            :editing="editingId === escalation.id"
            :tenant-id="selectedTenantId"
            :format-delay="formatDelay"
            :get-step-target="getStepTarget"
            @toggle="handleToggle(escalation)"
            @delete="handleDelete(escalation.id)"
            @edit="editingId = escalation.id"
            @close="editingId = null"
            @updated="refreshEscalations"
          />
        </div>
      </template>
    </div>
  </div>
</template>
