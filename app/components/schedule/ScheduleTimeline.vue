<script setup lang="ts">
import type { TimelineView, TimelineRange, RotationSlot } from '~/utils/schedule'
import { getTimelineRange, calculateRotationSlots, calculateOverrideSlots } from '~/utils/schedule'

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
  memberNames: Map<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deleteRotation: [index: number]
  deleteOverride: [index: number]
  createOverrideFromSlot: [slot: RotationSlot]
}>()

const view = ref<TimelineView>('week')
const currentDate = ref<Date | null>(null)
const isMounted = ref(false)

onMounted(() => {
  currentDate.value = new Date()
  isMounted.value = true
})

const range = computed<TimelineRange | null>(() => {
  if (!currentDate.value) {
    return null
  }
  return getTimelineRange(view.value, currentDate.value)
})

const memberColorMap = computed(() => {
  const map = new Map<string, number>()
  let colorIndex = 0

  props.schedule.rotations.forEach((rotation) => {
    rotation.members.forEach((memberId) => {
      if (!map.has(memberId)) {
        map.set(memberId, colorIndex++)
      }
    })
  })

  props.schedule.overrides.forEach((override) => {
    if (!map.has(override.member)) {
      map.set(override.member, colorIndex++)
    }
  })

  return map
})

const rotationLayers = computed(() => {
  const currentRange = range.value
  if (!currentRange) {
    return []
  }
  return props.schedule.rotations.map((rotation, index) => ({
    label: rotation.description,
    slots: calculateRotationSlots(rotation, currentRange, index, props.memberNames),
    index,
  }))
})

const overrideSlots = computed<RotationSlot[]>(() => {
  const currentRange = range.value
  if (!currentRange) {
    return []
  }
  return props.schedule.overrides.flatMap((override, index) =>
    calculateOverrideSlots(override, currentRange, index, props.memberNames),
  )
})

const hasOverrides = computed(() => overrideSlots.value.length > 0)

const handleDeleteOverrideFromSlot = (slot: RotationSlot) => {
  emit('deleteOverride', slot.rotationIndex)
}

const handleCreateOverrideFromSlot = (slot: RotationSlot) => {
  emit('createOverrideFromSlot', slot)
}
</script>

<template>
  <div class="border border-base-content/10 rounded-lg overflow-hidden">
    <div
      v-if="!isMounted || !currentDate || !range"
      class="flex items-center justify-center py-12"
    >
      <span class="loading loading-spinner loading-md" />
    </div>

    <template v-else>
      <ScheduleTimelineNav
        v-model:view="view"
        v-model:current-date="currentDate"
      />

      <div class="overflow-x-auto">
        <div class="min-w-[600px]">
          <div class="flex border-b border-base-content/10">
            <div class="w-32 shrink-0" />
            <div class="flex-1">
              <ScheduleTimelineHeader
                :view="view"
                :range="range"
              />
            </div>
          </div>

          <div class="group">
            <ScheduleTimelineLayer
              v-if="hasOverrides"
              label="Замены"
              :slots="overrideSlots"
              :view="view"
              :range="range"
              :member-color-map="memberColorMap"
              :is-override-layer="true"
              @delete-override="handleDeleteOverrideFromSlot"
            />

            <ScheduleTimelineLayer
              v-for="layer in rotationLayers"
              :key="layer.index"
              :label="layer.label"
              :slots="layer.slots"
              :view="view"
              :range="range"
              :member-color-map="memberColorMap"
              @delete="emit('deleteRotation', layer.index)"
              @create-override="handleCreateOverrideFromSlot"
            />
          </div>

          <div
            v-if="rotationLayers.length === 0 && !hasOverrides"
            class="text-center py-8 text-base-content/50"
          >
            Нет ротаций
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
