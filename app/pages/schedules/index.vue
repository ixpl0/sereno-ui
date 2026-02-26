<script setup lang="ts">
import type { TenantRequestNewSchedule, TenantRequestRotation, TenantRequestOverride } from '~/api/types.gen'
import { formatDateTimeLocal, roundDateToMinuteStep } from '~/utils/formatters'

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

const { tenants, selectedTenantId } = useTenants()

const {
  schedules,
  loading,
  createSchedule,
  deleteSchedule,
  createRotation,
  deleteRotation,
  createOverride,
  deleteOverride,
} = useSchedules(selectedTenantId)

const { members } = useTenantMembers(selectedTenantId)

const isCreating = ref(false)

const newScheduleName = ref('')
const newScheduleSince = ref('')
const newScheduleUntil = ref('')
const newScheduleTenantId = ref('')
const newScheduleInputRef = ref<{ focus: () => void } | null>(null)

const startCreate = () => {
  isCreating.value = true
  newScheduleName.value = ''
  newScheduleTenantId.value = selectedTenantId.value || tenants.value[0]?.id || ''
  newScheduleSince.value = formatDateTimeLocal(roundDateToMinuteStep(new Date(), 10))
  newScheduleUntil.value = ''
  nextTick(() => {
    newScheduleInputRef.value?.focus()
  })
}

const cancelCreate = () => {
  isCreating.value = false
  newScheduleName.value = ''
  newScheduleSince.value = ''
  newScheduleUntil.value = ''
  newScheduleTenantId.value = ''
}

const handleCreate = async () => {
  const name = newScheduleName.value.trim()
  const tenantId = newScheduleTenantId.value

  if (!name) {
    return
  }

  if (!tenantId) {
    toast.error('Выберите команду')
    return
  }

  const sinceDate = new Date(newScheduleSince.value)
  if (Number.isNaN(sinceDate.getTime())) {
    toast.error('Укажите корректное время начала')
    return
  }

  const sinceTimestamp = Math.floor(sinceDate.getTime() / 1000)

  let untilTimestamp: number | undefined
  if (newScheduleUntil.value) {
    const untilDate = new Date(newScheduleUntil.value)
    if (Number.isNaN(untilDate.getTime())) {
      toast.error('Укажите корректное время окончания')
      return
    }

    untilTimestamp = Math.floor(untilDate.getTime() / 1000)
    if (untilTimestamp <= sinceTimestamp) {
      toast.error('Окончание должно быть позже начала')
      return
    }
  }

  selectedTenantId.value = tenantId

  const schedule: TenantRequestNewSchedule = {
    name,
    since: sinceTimestamp,
    until: untilTimestamp,
  }

  const response = await createSchedule(schedule)

  if ('error' in response && response.error) {
    toast.error('Не удалось создать расписание')
    return
  }

  toast.success('Расписание создано')
  cancelCreate()
}

const handleDelete = async (id: string) => {
  const response = await deleteSchedule(id)

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить расписание')
    return
  }

  toast.success('Расписание удалено')
}

const handleAddRotation = async (scheduleId: string, data: {
  name: string
  duration: number
  since: number
  members: string[]
  days: number[]
}) => {
  const rotation: TenantRequestRotation = {
    name: data.name,
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
}

const handleDeleteRotation = async (scheduleId: string, index: number) => {
  const response = await deleteRotation(scheduleId, index)

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить ротацию')
    return
  }

  toast.success('Ротация удалена')
}

const handleAddOverride = async (scheduleId: string, data: {
  name: string
  duration: number
  since: number
  member: string
  rotation: number
}) => {
  const override: TenantRequestOverride = {
    name: data.name,
    duration: data.duration,
    since: data.since,
    member: data.member,
    rotation: data.rotation,
  }

  const response = await createOverride(scheduleId, override)

  if ('error' in response && response.error) {
    toast.error('Не удалось добавить замену')
    return
  }

  toast.success('Замена добавлена')
}

const handleDeleteOverride = async (scheduleId: string, index: number) => {
  const response = await deleteOverride(scheduleId, index)

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить замену')
    return
  }

  toast.success('Замена удалена')
}
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-5xl mx-auto">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 class="text-2xl font-semibold">
          Расписания
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
              <UiLabel>Команда</UiLabel>
              <select
                v-model="newScheduleTenantId"
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
            <div>
              <UiLabel>Начало</UiLabel>
              <div class="relative">
                <input
                  v-model="newScheduleSince"
                  type="datetime-local"
                  step="600"
                  class="input input-bordered w-full ui-picker-input"
                >
                <Icon
                  name="lucide:calendar-days"
                  class="ui-picker-icon text-base-content/60"
                  aria-hidden="true"
                />
              </div>
            </div>
            <div>
              <UiLabel>Конец (опционально)</UiLabel>
              <div class="relative">
                <input
                  v-model="newScheduleUntil"
                  type="datetime-local"
                  step="600"
                  class="input input-bordered w-full ui-picker-input"
                >
                <Icon
                  name="lucide:calendar-days"
                  class="ui-picker-icon text-base-content/60"
                  aria-hidden="true"
                />
              </div>
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
            :members="members"
            @delete="handleDelete(schedule.id)"
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
