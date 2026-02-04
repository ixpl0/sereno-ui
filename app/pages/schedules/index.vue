<script setup lang="ts">
import type { TenantResponseScheduleList, TenantRequestNewSchedule, TenantRequestRotation, TenantRequestOverride } from '~/api/types.gen'
import { formatDateTimeLocal } from '~/utils/formatters'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Расписания',
})

useSeoMeta({
  title: 'Расписания',
  description: 'Управление расписаниями дежурств',
})

const toast = useToast()

const { tenants, selectedTenantId } = await useTenantSelector()

const { data: schedulesData, status: schedulesStatus, refresh: refreshSchedules } = await useFetch<TenantResponseScheduleList>(
  () => `/api/v1/tenants/${selectedTenantId.value}/schedules`,
  { watch: [selectedTenantId] },
)
const schedules = computed(() => schedulesData.value?.schedules ?? [])
const loading = computed(() => schedulesStatus.value === 'pending')

const {
  createSchedule,
  deleteSchedule,
  createRotation,
  deleteRotation,
  createOverride,
  deleteOverride,
} = useSchedules(selectedTenantId)

const { members, fetchMembers } = useTenantMembers(selectedTenantId)

const isCreating = ref(false)
const expandedId = ref<string | null>(null)

const newScheduleName = ref('')
const newScheduleSince = ref('')
const newScheduleInputRef = ref<{ focus: () => void } | null>(null)

const startCreate = () => {
  isCreating.value = true
  newScheduleName.value = ''
  newScheduleSince.value = formatDateTimeLocal(new Date())
  nextTick(() => {
    newScheduleInputRef.value?.focus()
  })
}

const cancelCreate = () => {
  isCreating.value = false
  newScheduleName.value = ''
  newScheduleSince.value = ''
}

const handleCreate = async () => {
  const name = newScheduleName.value.trim()
  if (!name) {
    return
  }

  const sinceDate = newScheduleSince.value ? new Date(newScheduleSince.value) : new Date()
  const sinceTimestamp = Math.floor(sinceDate.getTime() / 1000)

  const schedule: TenantRequestNewSchedule = {
    name,
    since: sinceTimestamp,
  }

  const response = await createSchedule(schedule)

  if ('error' in response && response.error) {
    toast.error('Не удалось создать расписание')
    return
  }

  toast.success('Расписание создано')
  cancelCreate()
  await refreshSchedules()

  const created = 'data' in response ? response.data?.schedule : null
  if (created) {
    expandedId.value = created.id
  }
}

const handleDelete = async (id: string) => {
  const response = await deleteSchedule(id)

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить расписание')
    return
  }

  toast.success('Расписание удалено')
  await refreshSchedules()
  if (expandedId.value === id) {
    expandedId.value = null
  }
}

const handleAddRotation = async (scheduleId: string, data: {
  description: string
  duration: number
  since: number
  members: string[]
  days: number[]
}) => {
  const rotation: TenantRequestRotation = {
    description: data.description,
    duration: data.duration,
    since: data.since,
    members: data.members,
    days: data.days,
  }

  const response = await createRotation(scheduleId, rotation)

  if ('error' in response && response.error) {
    toast.error('Не удалось добавить ротацию')
    return
  }

  toast.success('Ротация добавлена')
  await refreshSchedules()
}

const handleDeleteRotation = async (scheduleId: string, index: number) => {
  const response = await deleteRotation(scheduleId, index)

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить ротацию')
    return
  }

  toast.success('Ротация удалена')
  await refreshSchedules()
}

const handleAddOverride = async (scheduleId: string, data: {
  description: string
  duration: number
  since: number
  member: string
}) => {
  const override: TenantRequestOverride = {
    description: data.description,
    duration: data.duration,
    since: data.since,
    member: data.member,
  }

  const response = await createOverride(scheduleId, override)

  if ('error' in response && response.error) {
    toast.error('Не удалось добавить замену')
    return
  }

  toast.success('Замена добавлена')
  await refreshSchedules()
}

const handleDeleteOverride = async (scheduleId: string, index: number) => {
  const response = await deleteOverride(scheduleId, index)

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить замену')
    return
  }

  toast.success('Замена удалена')
  await refreshSchedules()
}

onMounted(() => {
  if (selectedTenantId.value) {
    fetchMembers()
  }
})

watch(selectedTenantId, () => {
  if (selectedTenantId.value) {
    fetchMembers()
  }
})
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold">
          Расписания
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

      <UiEmptyState
        v-if="!selectedTenantId"
        icon="lucide:building-2"
        title="Сначала создайте команду"
        action-text="Перейти к командам"
        @action="navigateTo('/teams')"
      />

      <template v-else>
        <div
          v-if="loading && schedules.length === 0"
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
              ref="newScheduleInputRef"
              v-model="newScheduleName"
              placeholder="Название расписания"
              @keyup.enter="handleCreate"
              @keyup.escape="cancelCreate"
            />
            <div>
              <UiLabel>Дата начала</UiLabel>
              <input
                v-model="newScheduleSince"
                type="datetime-local"
                step="600"
                class="input input-bordered w-full"
              >
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
            v-if="schedules.length === 0 && !isCreating"
            icon="lucide:calendar-clock"
            title="Нет расписаний"
            action-text="Создать первое расписание"
            @action="startCreate"
          />

          <ScheduleCard
            v-for="schedule in schedules"
            :key="schedule.id"
            :schedule="schedule"
            :expanded="expandedId === schedule.id"
            :tenant-id="selectedTenantId"
            :members="members"
            @delete="handleDelete(schedule.id)"
            @expand="expandedId = schedule.id"
            @collapse="expandedId = null"
            @add-rotation="handleAddRotation(schedule.id, $event)"
            @delete-rotation="handleDeleteRotation(schedule.id, $event)"
            @add-override="handleAddOverride(schedule.id, $event)"
            @delete-override="handleDeleteOverride(schedule.id, $event)"
          />
        </div>
      </template>
    </div>
  </div>
</template>
