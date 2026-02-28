<script setup lang="ts">
import type { TenantRequestNewSchedule, TenantRequestRotation, TenantRequestOverride } from '~/api/types.gen'
import { combineDateTimeLocal, formatDateLocal, formatTimeLocal, roundDateToMinuteStep, TIME_PICKER_MINUTE_STEP, TIME_PICKER_OPTIONS } from '~/utils/formatters'

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
const defaultTimeOption = TIME_PICKER_OPTIONS[0]?.value ?? '00:00'
const selectTenantMessage = '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043a\u043e\u043c\u0430\u043d\u0434\u0443'
const invalidSinceMessage = '\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f \u043d\u0430\u0447\u0430\u043b\u0430'
const invalidUntilMessage = '\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f \u043e\u043a\u043e\u043d\u0447\u0430\u043d\u0438\u044f'
const untilAfterSinceMessage = '\u041e\u043a\u043e\u043d\u0447\u0430\u043d\u0438\u0435 \u0434\u043e\u043b\u0436\u043d\u043e \u0431\u044b\u0442\u044c \u043f\u043e\u0437\u0436\u0435 \u043d\u0430\u0447\u0430\u043b\u0430'
const createScheduleFailedMessage = '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0437\u0434\u0430\u0442\u044c \u0440\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435'
const createScheduleSuccessMessage = '\u0420\u0430\u0441\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0441\u043e\u0437\u0434\u0430\u043d\u043e'

const showInvalidUntilMessage = (): void => {
  toast.error(invalidUntilMessage)
}

const newScheduleName = ref('')
const newScheduleSinceDate = ref('')
const newScheduleSinceTime = ref(defaultTimeOption)
const newScheduleUntilDate = ref('')
const newScheduleUntilTime = ref('')
const newScheduleTenantId = ref('')
const newScheduleInputRef = ref<{ focus: () => void } | null>(null)

const startCreate = () => {
  const roundedNow = roundDateToMinuteStep(new Date(), TIME_PICKER_MINUTE_STEP)

  isCreating.value = true
  newScheduleName.value = ''
  newScheduleTenantId.value = selectedTenantId.value || tenants.value[0]?.id || ''
  newScheduleSinceDate.value = formatDateLocal(roundedNow)
  newScheduleSinceTime.value = formatTimeLocal(roundedNow)
  newScheduleUntilDate.value = ''
  newScheduleUntilTime.value = ''

  nextTick(() => {
    newScheduleInputRef.value?.focus()
  })
}

const cancelCreate = () => {
  isCreating.value = false
  newScheduleName.value = ''
  newScheduleSinceDate.value = ''
  newScheduleSinceTime.value = defaultTimeOption
  newScheduleUntilDate.value = ''
  newScheduleUntilTime.value = ''
  newScheduleTenantId.value = ''
}

const handleCreate = async () => {
  const name = newScheduleName.value.trim()
  const tenantId = newScheduleTenantId.value

  if (!name) {
    return
  }

  if (!tenantId) {
    toast.error(selectTenantMessage)
    return
  }

  const sinceValue = combineDateTimeLocal(newScheduleSinceDate.value, newScheduleSinceTime.value)
  const sinceDate = new Date(sinceValue)

  if (Number.isNaN(sinceDate.getTime())) {
    toast.error(invalidSinceMessage)
    return
  }

  const sinceTimestamp = Math.floor(sinceDate.getTime() / 1000)

  let untilTimestamp: number | undefined
  const hasUntilDate = newScheduleUntilDate.value !== ''
  const hasUntilTime = newScheduleUntilTime.value !== ''

  if (hasUntilDate || hasUntilTime) {
    if (!hasUntilDate || !hasUntilTime) {
      showInvalidUntilMessage()
      return
    }

    const untilValue = combineDateTimeLocal(newScheduleUntilDate.value, newScheduleUntilTime.value)
    const untilDate = new Date(untilValue)

    if (Number.isNaN(untilDate.getTime())) {
      showInvalidUntilMessage()
      return
    }

    untilTimestamp = Math.floor(untilDate.getTime() / 1000)

    if (untilTimestamp <= sinceTimestamp) {
      toast.error(untilAfterSinceMessage)
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
    toast.error(createScheduleFailedMessage)
    return
  }

  toast.success(createScheduleSuccessMessage)
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
              <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7rem]">
                <div class="relative">
                  <input
                    v-model="newScheduleSinceDate"
                    type="date"
                    class="input input-bordered w-full ui-picker-input"
                  >
                  <Icon
                    name="lucide:calendar-days"
                    class="ui-picker-icon text-base-content/60"
                    aria-hidden="true"
                  />
                </div>
                <select
                  v-model="newScheduleSinceTime"
                  class="select select-bordered w-full"
                >
                  <option
                    v-for="option in TIME_PICKER_OPTIONS"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>
            <div>
              <UiLabel>Конец (опционально)</UiLabel>
              <div class="grid gap-2 sm:grid-cols-[minmax(0,1fr)_7rem]">
                <div class="relative">
                  <input
                    v-model="newScheduleUntilDate"
                    type="date"
                    class="input input-bordered w-full ui-picker-input"
                  >
                  <Icon
                    name="lucide:calendar-days"
                    class="ui-picker-icon text-base-content/60"
                    aria-hidden="true"
                  />
                </div>
                <select
                  v-model="newScheduleUntilTime"
                  class="select select-bordered w-full"
                >
                  <option value="">
                    --:--
                  </option>
                  <option
                    v-for="option in TIME_PICKER_OPTIONS"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
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
