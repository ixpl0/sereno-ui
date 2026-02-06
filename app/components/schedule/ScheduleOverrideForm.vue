<script setup lang="ts">
import type { TenantResponseMember } from '~/api/types.gen'
import { formatDateTimeLocal } from '~/utils/formatters'

interface Props {
  members: ReadonlyArray<TenantResponseMember>
  prefill?: { since: Date, duration: number } | null
}

const props = withDefaults(defineProps<Props>(), {
  prefill: null,
})

const emit = defineEmits<{
  submit: [data: {
    name: string
    duration: number
    since: number
    member: string
  }]
  cancel: []
}>()

const getInitialDuration = (): { value: number, unit: 'hours' | 'days' } => {
  if (!props.prefill) {
    return { value: 24, unit: 'hours' }
  }
  const hours = props.prefill.duration / 3600
  if (hours >= 24 && hours % 24 === 0) {
    return { value: hours / 24, unit: 'days' }
  }
  return { value: hours, unit: 'hours' }
}

const initialDuration = getInitialDuration()

const name = ref('')
const durationValue = ref(initialDuration.value)
const durationUnit = ref<'hours' | 'days'>(initialDuration.unit)
const since = ref(props.prefill ? formatDateTimeLocal(props.prefill.since) : new Date().toISOString().slice(0, 16))
const selectedMember = ref('')

const isValid = computed(() => {
  return name.value.trim() !== ''
    && durationValue.value > 0
    && selectedMember.value !== ''
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
    name: name.value.trim(),
    duration: durationSeconds,
    since: sinceTimestamp,
    member: selectedMember.value,
  })
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <UiLabel>Название замены</UiLabel>
      <UiInput
        v-model="name"
        placeholder="Например: Отпуск Ивана"
      />
    </div>

    <div>
      <UiLabel>Дежурный</UiLabel>
      <select
        v-model="selectedMember"
        class="select select-bordered w-full"
      >
        <option value="">
          Выберите участника
        </option>
        <option
          v-for="member in members"
          :key="member.id"
          :value="member.id"
        >
          {{ member.id }}
        </option>
      </select>
    </div>

    <div>
      <UiLabel>Начало</UiLabel>
      <input
        v-model="since"
        type="datetime-local"
        class="input input-bordered w-full"
      >
    </div>

    <div>
      <UiLabel>Длительность</UiLabel>
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
