<script setup lang="ts">
import type { TenantResponseRotation, TenantResponseOverride } from '~/api/types.gen'
import type { TimelineView, TimelineRange, RotationSlot } from '~/utils/schedule'
import { getTimelineRange, convertShiftsToSlots } from '~/utils/schedule'

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
  memberNames: Map<string, string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  deleteRotation: [index: number]
  deleteOverride: [index: number]
  createOverrideFromSlot: [slot: RotationSlot]
  selectDay: [date: Date]
}>()

const view = ref<TimelineView>('week')
const currentDate = ref<Date | null>(null)
const isMounted = ref(false)
const currentTime = ref<Date>(new Date())

let timeInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  currentDate.value = new Date()
  isMounted.value = true
  timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 60000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

const range = computed<TimelineRange | null>(() => {
  if (!currentDate.value) {
    return null
  }
  return getTimelineRange(view.value, currentDate.value)
})

const rotations = computed(() => props.schedule.rotations ?? [])
const overrides = computed(() => props.schedule.overrides ?? [])

const memberColorMap = computed(() => {
  const rotationMembers = rotations.value.flatMap(rotation => rotation.members)
  const overrideMembers = overrides.value.flatMap(override => override.shifts.map(shift => shift.member))

  return [...rotationMembers, ...overrideMembers].reduce(
    (acc, memberId) => {
      if (!acc.map.has(memberId)) {
        acc.map.set(memberId, acc.index)
        return { map: acc.map, index: acc.index + 1 }
      }
      return acc
    },
    { map: new Map<string, number>(), index: 0 },
  ).map
})

const rotationLayers = computed(() => {
  const currentRange = range.value
  if (!currentRange) {
    return []
  }
  return rotations.value.map((rotation, index) => ({
    label: rotation.description,
    membersCount: rotation.members.length,
    slots: convertShiftsToSlots(
      rotation.shifts,
      rotation.description,
      index,
      false,
      props.memberNames,
      currentRange,
    ),
    index,
  }))
})

const overrideSlots = computed<RotationSlot[]>(() => {
  const currentRange = range.value
  if (!currentRange) {
    return []
  }
  return overrides.value.flatMap((override, index) =>
    convertShiftsToSlots(
      override.shifts,
      override.description,
      index,
      true,
      props.memberNames,
      currentRange,
    ),
  )
})

const allSlots = computed<RotationSlot[]>(() => {
  const currentRange = range.value
  if (!currentRange) {
    return []
  }

  const rotationSlots = rotations.value.flatMap((rotation, index) =>
    convertShiftsToSlots(
      rotation.shifts,
      rotation.description,
      index,
      false,
      props.memberNames,
      currentRange,
    ),
  )

  return [...rotationSlots, ...overrideSlots.value]
})

const hasOverrides = computed(() => overrideSlots.value.length > 0)

const nowPosition = computed(() => {
  const currentRange = range.value
  if (!currentRange) {
    return null
  }
  const now = currentTime.value
  if (now < currentRange.start || now > currentRange.end) {
    return null
  }
  const totalMs = currentRange.end.getTime() - currentRange.start.getTime()
  const currentOffset = now.getTime() - currentRange.start.getTime()
  return (currentOffset / totalMs) * 100
})

const handleDeleteOverrideFromSlot = (slot: RotationSlot) => {
  emit('deleteOverride', slot.rotationIndex)
}

const handleCreateOverrideFromSlot = (slot: RotationSlot) => {
  emit('createOverrideFromSlot', slot)
}

const handleSelectDay = (date: Date) => {
  currentDate.value = date
  view.value = 'day'
  emit('selectDay', date)
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

      <div
        v-if="view === 'month'"
        class="p-2"
      >
        <ScheduleTimelineCalendar
          :current-date="currentDate"
          :slots="allSlots"
          :member-color-map="memberColorMap"
          @select-day="handleSelectDay"
        />
      </div>

      <template v-else>
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

            <div>
              <ScheduleTimelineLayer
                v-for="layer in rotationLayers"
                :key="layer.index"
                :label="layer.label"
                :members-count="layer.membersCount"
                :slots="layer.slots"
                :view="view"
                :range="range"
                :member-color-map="memberColorMap"
                :now-position="nowPosition"
                @delete="emit('deleteRotation', layer.index)"
                @create-override="handleCreateOverrideFromSlot"
              />

              <ScheduleTimelineLayer
                v-if="hasOverrides"
                label="Замены"
                :slots="overrideSlots"
                :view="view"
                :range="range"
                :member-color-map="memberColorMap"
                :now-position="nowPosition"
                :is-override-layer="true"
                @delete-override="handleDeleteOverrideFromSlot"
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
    </template>
  </div>
</template>
