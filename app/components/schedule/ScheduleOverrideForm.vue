<script setup lang="ts">
import type { TenantResponseMember, TenantResponseRotation } from '~/api/types.gen'
import { formatDateTimeLocal, roundDateToMinuteStep } from '~/utils/formatters'

interface Props {
  members: ReadonlyArray<TenantResponseMember>
  rotations: ReadonlyArray<TenantResponseRotation>
  prefill?: { since: Date, duration: number, rotation: number } | null
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
    rotation: number
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
const since = ref(
  props.prefill
    ? formatDateTimeLocal(props.prefill.since)
    : formatDateTimeLocal(roundDateToMinuteStep(new Date(), 10)),
)
const selectedMember = ref('')
const selectedRotation = ref(
  props.prefill ? String(props.prefill.rotation) : (props.rotations[0]?.number !== undefined ? String(props.rotations[0].number) : ''),
)

const isValid = computed(() => {
  return name.value.trim() !== ''
    && durationValue.value > 0
    && selectedMember.value !== ''
    && selectedRotation.value !== ''
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
    rotation: Number.parseInt(selectedRotation.value, 10),
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
      <UiLabel>Ротация</UiLabel>
      <select
        v-model="selectedRotation"
        class="select select-bordered w-full"
      >
        <option value="">
          Выберите ротацию
        </option>
        <option
          v-for="rotation in rotations"
          :key="rotation.number"
          :value="String(rotation.number)"
        >
          {{ rotation.name }}
        </option>
      </select>
      <div
        v-if="rotations.length === 0"
        class="text-sm text-base-content/50 pt-1"
      >
        Сначала добавьте хотя бы одну ротацию
      </div>
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
      <div class="relative">
        <input
          v-model="since"
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
