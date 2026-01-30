<script setup lang="ts">
import type { TenantResponseMember } from '~/api/types.gen'
import type { RotationSlot } from '~/utils/schedule'
import { formatDuration } from '~/utils/schedule'

interface RotationData {
  days: ReadonlyArray<number>
  description: string
  duration: number
  members: ReadonlyArray<string>
  since: number
}

interface OverrideData {
  description: string
  duration: number
  member: string
  since: number
}

interface ScheduleData {
  id: string
  name: string
  enabled: boolean
  since: number
  until?: number
  rotations: ReadonlyArray<RotationData>
  overrides: ReadonlyArray<OverrideData>
}

interface Props {
  schedule: ScheduleData
  expanded: boolean
  tenantId: string
  members: ReadonlyArray<TenantResponseMember>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: []
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

const toast = useToast()

const showRotationForm = ref(false)
const showOverrideForm = ref(false)
const prefillOverride = ref<{ since: Date, duration: number } | null>(null)

const memberNames = computed(() => {
  const map = new Map<string, string>()
  props.members.forEach((member) => {
    map.set(member.id, member.id)
  })
  return map
})

const rotationsSummary = computed(() => {
  const count = props.schedule.rotations.length
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
  toast.success('Ротация удалена')
}

const handleDeleteOverride = (index: number) => {
  emit('deleteOverride', index)
  toast.success('Замена удалена')
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
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="w-10 h-10 flex items-center justify-center rounded-lg shrink-0"
          :class="schedule.enabled ? 'bg-primary/10' : 'bg-base-300'"
        >
          <Icon
            name="lucide:calendar-clock"
            class="w-5 h-5"
            :class="schedule.enabled ? 'text-primary' : 'text-base-content/40'"
          />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-semibold truncate">
              {{ schedule.name }}
            </h3>
            <span
              class="badge badge-sm"
              :class="schedule.enabled ? 'badge-success' : 'badge-ghost'"
            >
              {{ schedule.enabled ? 'Активно' : 'Отключено' }}
            </span>
          </div>
          <div class="text-sm text-base-content/60">
            {{ rotationsSummary }}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-1 shrink-0">
        <UiButton
          variant="ghost"
          size="sm"
          @click="emit('toggle')"
        >
          <Icon
            :name="schedule.enabled ? 'lucide:pause' : 'lucide:play'"
            class="w-4 h-4"
          />
        </UiButton>
        <UiButton
          variant="ghost"
          size="sm"
          @click="expanded ? emit('collapse') : emit('expand')"
        >
          <Icon
            :name="expanded ? 'lucide:chevron-up' : 'lucide:chevron-down'"
            class="w-4 h-4"
          />
        </UiButton>
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

      <div
        v-if="schedule.rotations.length > 0"
        class="pt-4 border-t border-base-content/10"
      >
        <div class="text-xs text-base-content/50 mb-2">
          Ротации
        </div>
        <div class="space-y-2">
          <div
            v-for="(rotation, index) in schedule.rotations"
            :key="index"
            class="flex items-center justify-between text-sm p-2 bg-base-200/30 rounded"
          >
            <div>
              <span class="font-medium">{{ rotation.description }}</span>
              <span class="text-base-content/50 ml-2">
                {{ formatDuration(rotation.duration) }}, {{ rotation.members.length }} чел.
              </span>
            </div>
            <UiButton
              variant="ghost"
              size="sm"
              @click="handleDeleteRotation(index)"
            >
              <Icon
                name="lucide:x"
                class="w-3 h-3"
              />
            </UiButton>
          </div>
        </div>
      </div>

      <div
        v-if="schedule.overrides.length > 0"
        class="pt-4 border-t border-base-content/10"
      >
        <div class="text-xs text-base-content/50 mb-2">
          Замены
        </div>
        <div class="space-y-2">
          <div
            v-for="(override, index) in schedule.overrides"
            :key="index"
            class="flex items-center justify-between text-sm p-2 bg-warning/10 rounded"
          >
            <div>
              <span class="font-medium">{{ override.description }}</span>
              <span class="text-base-content/50 ml-2">
                {{ override.member }}, {{ formatDuration(override.duration) }}
              </span>
            </div>
            <UiButton
              variant="ghost"
              size="sm"
              @click="handleDeleteOverride(index)"
            >
              <Icon
                name="lucide:x"
                class="w-3 h-3"
              />
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </UiCard>
</template>
