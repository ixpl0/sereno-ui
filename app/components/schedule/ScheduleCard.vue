<script setup lang="ts">
import type { TenantResponseMember, TenantResponseRotation, TenantResponseOverride } from '~/api/types.gen'
import type { RotationSlot } from '~/utils/schedule'

interface ScheduleData {
  id: string
  name: string
  since: number
  until?: number
  rotations?: ReadonlyArray<TenantResponseRotation>
  overrides?: ReadonlyArray<TenantResponseOverride>
}

interface Props {
  schedule: ScheduleData
  expanded: boolean
  tenantId: string
  members: ReadonlyArray<TenantResponseMember>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  delete: []
  expand: []
  collapse: []
  addRotation: [data: {
    description: string
    duration: number
    since: number
    members: string[]
    days: number[]
  }]
  deleteRotation: [index: number]
  addOverride: [data: {
    description: string
    duration: number
    since: number
    member: string
  }]
  deleteOverride: [index: number]
}>()

const showRotationForm = ref(false)
const showOverrideForm = ref(false)
const prefillOverride = ref<{ since: Date, duration: number } | null>(null)

const memberNames = computed(() =>
  props.members.reduce(
    (map, member) => map.set(member.id, member.id),
    new Map<string, string>(),
  ),
)

const rotations = computed(() => props.schedule.rotations ?? [])

const rotationsSummary = computed(() => {
  const count = rotations.value.length
  if (count === 0) {
    return 'Нет ротаций'
  }
  if (count === 1) {
    return '1 ротация'
  }
  if (count < 5) {
    return `${count} ротации`
  }
  return `${count} ротаций`
})

const handleAddRotation = (data: {
  description: string
  duration: number
  since: number
  members: string[]
  days: number[]
}) => {
  emit('addRotation', data)
  showRotationForm.value = false
}

const handleAddOverride = (data: {
  description: string
  duration: number
  since: number
  member: string
}) => {
  emit('addOverride', data)
  showOverrideForm.value = false
  prefillOverride.value = null
}

const handleDeleteRotation = (index: number) => {
  emit('deleteRotation', index)
}

const handleDeleteOverride = (index: number) => {
  emit('deleteOverride', index)
}

const handleCreateOverrideFromSlot = (slot: RotationSlot) => {
  const durationMs = slot.end.getTime() - slot.start.getTime()
  prefillOverride.value = {
    since: slot.start,
    duration: Math.floor(durationMs / 1000),
  }
  showOverrideForm.value = true
}
</script>

<template>
  <UiCard class="animate-slide-up">
    <div class="flex items-start justify-between gap-4">
      <div
        class="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
        @click="expanded ? emit('collapse') : emit('expand')"
      >
        <div class="w-10 h-10 flex items-center justify-center rounded-lg shrink-0 bg-primary/10">
          <Icon
            name="lucide:calendar-clock"
            class="w-5 h-5 text-primary"
          />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="font-semibold truncate">
            {{ schedule.name }}
          </h3>
          <div class="text-sm text-base-content/60">
            {{ rotationsSummary }}
          </div>
        </div>
        <Icon
          :name="expanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
          class="w-4 h-4 text-base-content/40 shrink-0"
        />
      </div>

      <div class="shrink-0 self-center">
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
      v-if="expanded"
      class="mt-6 space-y-4"
    >
      <ScheduleTimeline
        :schedule="schedule"
        :member-names="memberNames"
        @delete-rotation="handleDeleteRotation"
        @delete-override="handleDeleteOverride"
        @create-override-from-slot="handleCreateOverrideFromSlot"
      />

      <div class="flex gap-2">
        <UiButton
          variant="ghost"
          size="sm"
          @click="showRotationForm = true"
        >
          <Icon
            name="lucide:plus"
            class="w-4 h-4 mr-1"
          />
          Добавить ротацию
        </UiButton>
        <UiButton
          variant="ghost"
          size="sm"
          @click="showOverrideForm = true"
        >
          <Icon
            name="lucide:user-check"
            class="w-4 h-4 mr-1"
          />
          Добавить замену
        </UiButton>
      </div>

      <div
        v-if="showRotationForm"
        class="p-4 bg-base-200/50 rounded-lg"
      >
        <h4 class="font-medium mb-4">
          Новая ротация
        </h4>
        <ScheduleRotationForm
          :members="members"
          @submit="handleAddRotation"
          @cancel="showRotationForm = false"
        />
      </div>

      <div
        v-if="showOverrideForm"
        class="p-4 bg-base-200/50 rounded-lg"
      >
        <h4 class="font-medium mb-4">
          Новая замена
        </h4>
        <ScheduleOverrideForm
          :members="members"
          :prefill="prefillOverride"
          @submit="handleAddOverride"
          @cancel="showOverrideForm = false; prefillOverride = null"
        />
      </div>
    </div>
  </UiCard>
</template>
