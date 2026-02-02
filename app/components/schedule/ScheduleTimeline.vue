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

const rotations = computed(() => props.schedule.rotations ?? [])
const overrides = computed(() => props.schedule.overrides ?? [])

const memberColorMap = computed(() => {
  const map = new Map<string, number>()
  let colorIndex = 0

  rotations.value.forEach((rotation) => {
    rotation.members.forEach((memberId) => {
      if (!map.has(memberId)) {
        map.set(memberId, colorIndex++)
      }
    })
  })

  overrides.value.forEach((override) => {
    override.shifts.forEach((shift) => {
      if (!map.has(shift.member)) {
        map.set(shift.member, colorIndex++)
      }
    })
  })

  return map
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

            <div class="group">
              <ScheduleTimelineLayer
                v-for="layer in rotationLayers"
                :key="layer.index"
                :label="layer.label"
                :members-count="layer.membersCount"
                :slots="layer.slots"
                :view="view"
                :range="range"
                :member-color-map="memberColorMap"
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
