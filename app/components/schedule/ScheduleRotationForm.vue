<script setup lang="ts">
import type { TenantResponseMember } from '~/api/types.gen'

interface Props {
  members: ReadonlyArray<TenantResponseMember>
}

defineProps<Props>()

const emit = defineEmits<{
  submit: [data: {
    description: string
    duration: number
    since: number
    members: string[]
    days: number[]
  }]
  cancel: []
}>()

const description = ref('')
const durationValue = ref(24)
const durationUnit = ref<'hours' | 'days'>('hours')
const since = ref(new Date().toISOString().slice(0, 16))
const selectedMembers = ref<string[]>([])
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

const toggleDay = (day: number) => {
  if (selectedDays.value.includes(day)) {
    selectedDays.value = selectedDays.value.filter(d => d !== day)
  }
  else {
    selectedDays.value = [...selectedDays.value, day].sort((a, b) => a - b)
  }
}

const toggleMember = (memberId: string) => {
  if (selectedMembers.value.includes(memberId)) {
    selectedMembers.value = selectedMembers.value.filter(m => m !== memberId)
  }
  else {
    selectedMembers.value = [...selectedMembers.value, memberId]
  }
}

const isValid = computed(() => {
  return description.value.trim() !== ''
    && durationValue.value > 0
    && selectedMembers.value.length > 0
    && selectedDays.value.length > 0
})

const handleSubmit = () => {
  if (!isValid.value) {
    return
  }

  const durationSeconds = durationUnit.value === 'days'
    ? durationValue.value * 86400
    : durationValue.value * 3600

  const sinceTimestamp = Math.floor(new Date(since.value).getTime() / 1000)

  emit('submit', {
    description: description.value.trim(),
    duration: durationSeconds,
    since: sinceTimestamp,
    members: selectedMembers.value,
    days: selectedDays.value,
  })
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <UiLabel>Название ротации</UiLabel>
      <UiInput
        v-model="description"
        placeholder="Например: Дневная смена"
      />
    </div>

    <div>
      <UiLabel>Длительность смены</UiLabel>
      <div class="flex gap-2">
        <input
          v-model.number="durationValue"
          type="number"
          min="1"
          class="input input-bordered w-24"
        >
        <select
          v-model="durationUnit"
          class="select select-bordered"
        >
          <option value="hours">
            часов
          </option>
          <option value="days">
            дней
          </option>
        </select>
      </div>
    </div>

    <div>
      <UiLabel>Дата начала</UiLabel>
      <input
        v-model="since"
        type="datetime-local"
        class="input input-bordered w-full"
      >
    </div>

    <div>
      <UiLabel>Дни недели</UiLabel>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="day in dayLabels"
          :key="day.value"
          type="button"
          class="btn btn-sm"
          :class="selectedDays.includes(day.value) ? 'btn-primary' : 'btn-ghost'"
          @click="toggleDay(day.value)"
        >
          {{ day.label }}
        </button>
      </div>
    </div>

    <div>
      <UiLabel>Участники</UiLabel>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <label
          v-for="member in members"
          :key="member.id"
          class="flex items-center gap-2 p-2 rounded hover:bg-base-200 cursor-pointer"
        >
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            :checked="selectedMembers.includes(member.id)"
            @change="toggleMember(member.id)"
          >
          <span class="text-sm">{{ member.id }}</span>
        </label>
      </div>
      <div
        v-if="members.length === 0"
        class="text-sm text-base-content/50 py-2"
      >
        Нет участников команды
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
