<script setup lang="ts">
import type { TenantResponseMember } from '~/api/types.gen'
import draggable from 'vuedraggable'
import { TIME_PICKER_MINUTE_STEP, TIME_PICKER_OPTIONS } from '~/utils/formatters'

interface Props {
  members: ReadonlyArray<TenantResponseMember>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  submit: [data: {
    name: string
    duration: number
    since: number
    members: string[]
    days: number[]
  }]
  cancel: []
}>()

const name = ref('')
const durationHours = ref(24)
const durationMinutes = ref(0)
const startTime = ref('09:00')
const selectedMembers = ref<Array<{ id: string }>>([])
const selectedDays = ref<number[]>([1, 2, 3, 4, 5])

const dayLabels = [
  { value: 1, label: 'Пн' },
  { value: 2, label: 'Вт' },
  { value: 3, label: 'Ср' },
  { value: 4, label: 'Чт' },
  { value: 5, label: 'Пт' },
  { value: 6, label: 'Сб' },
  { value: 7, label: 'Вс' },
]

const minuteOptions = Array.from({ length: 60 / TIME_PICKER_MINUTE_STEP }, (_, index) => index * TIME_PICKER_MINUTE_STEP)

const availableMembers = computed(() => {
  const selectedIds = selectedMembers.value.map(m => m.id)
  return props.members.filter(m => !selectedIds.includes(m.id))
})

const toggleDay = (day: number) => {
  if (selectedDays.value.includes(day)) {
    selectedDays.value = selectedDays.value.filter(d => d !== day)
  }
  else {
    selectedDays.value = [...selectedDays.value, day].sort((a, b) => a - b)
  }
}

const addMember = (event: Event) => {
  if (!(event.target instanceof HTMLSelectElement)) {
    return
  }
  const memberId = event.target.value
  if (memberId) {
    selectedMembers.value = [...selectedMembers.value, { id: memberId }]
    event.target.value = ''
  }
}

const removeMember = (memberId: string) => {
  selectedMembers.value = selectedMembers.value.filter(m => m.id !== memberId)
}

const isValid = computed(() => {
  return name.value.trim() !== ''
    && (durationHours.value > 0 || durationMinutes.value > 0)
    && selectedMembers.value.length > 0
    && selectedDays.value.length > 0
})

const handleSubmit = () => {
  if (!isValid.value) {
    return
  }

  const durationSeconds = (durationHours.value * 3600) + (durationMinutes.value * 60)

  const now = new Date()
  const timeParts = startTime.value.split(':')
  const hours = parseInt(timeParts[0] ?? '0', 10)
  const minutes = parseInt(timeParts[1] ?? '0', 10)
  now.setHours(hours, minutes, 0, 0)
  const sinceTimestamp = Math.floor(now.getTime() / 1000)

  emit('submit', {
    name: name.value.trim(),
    duration: durationSeconds,
    since: sinceTimestamp,
    members: selectedMembers.value.map(m => m.id),
    days: selectedDays.value,
  })
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <UiLabel>Название ротации</UiLabel>
      <UiInput
        v-model="name"
        placeholder="Например: Дневная смена"
      />
    </div>

    <div>
      <UiLabel>Участники (порядок = порядок ротации)</UiLabel>
      <div
        v-if="selectedMembers.length > 0"
        class="mb-2"
      >
        <draggable
          v-model="selectedMembers"
          item-key="id"
          handle=".drag-handle"
          class="space-y-2"
        >
          <template #item="{ element }">
            <div class="flex items-center gap-2 p-2 bg-base-200 rounded cursor-default">
              <Icon
                name="lucide:grip-vertical"
                class="w-4 h-4 text-base-content/40 drag-handle cursor-move"
              />
              <span class="flex-1 text-sm">{{ element.id }}</span>
              <button
                type="button"
                class="text-base-content/50 hover:text-error transition-colors"
                aria-label="Удалить участника из ротации"
                @click="removeMember(element.id)"
              >
                <Icon
                  name="lucide:x"
                  class="w-4 h-4"
                />
              </button>
            </div>
          </template>
        </draggable>
      </div>
      <select
        class="select select-bordered w-full"
        @change="addMember"
      >
        <option value="">
          Добавить участника...
        </option>
        <option
          v-for="member in availableMembers"
          :key="member.id"
          :value="member.id"
        >
          {{ member.id }}
        </option>
      </select>
      <div
        v-if="members.length === 0"
        class="text-sm text-base-content/50 py-2"
      >
        Нет участников команды
      </div>
    </div>

    <div class="flex items-end gap-4 flex-wrap">
      <div>
        <UiLabel>Дни недели</UiLabel>
        <div class="flex gap-1">
          <button
            v-for="day in dayLabels"
            :key="day.value"
            type="button"
            class="btn btn-sm btn-square"
            :class="selectedDays.includes(day.value) ? 'btn-primary' : 'btn-ghost'"
            @click="toggleDay(day.value)"
          >
            {{ day.label }}
          </button>
        </div>
      </div>

      <div>
        <UiLabel>Время начала</UiLabel>
        <select
          v-model="startTime"
          class="select select-bordered w-28"
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

      <div>
        <UiLabel>Длительность</UiLabel>
        <div class="flex items-center gap-1">
          <input
            v-model.number="durationHours"
            type="number"
            min="0"
            class="input input-bordered w-16"
          >
          <span class="text-sm text-base-content/60">ч</span>
          <select
            v-model.number="durationMinutes"
            class="select select-bordered w-20"
          >
            <option
              v-for="min in minuteOptions"
              :key="min"
              :value="min"
            >
              {{ min }}
            </option>
          </select>
          <span class="text-sm text-base-content/60">мин</span>
        </div>
      </div>
    </div>

    <div class="flex gap-2 justify-end pt-2">
      <UiButton
        variant="primary"
        size="sm"
        :disabled="!isValid"
        @click="handleSubmit"
      >
        Добавить
      </UiButton>
      <UiButton
        variant="ghost"
        size="sm"
        @click="emit('cancel')"
      >
        Отмена
      </UiButton>
    </div>
  </div>
</template>
