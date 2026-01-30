<script setup lang="ts">
import type { TimelineView, TimelineRange, RotationSlot } from '~/utils/schedule'
import { getTimelineDays, getTimelineHours, isToday } from '~/utils/schedule'

interface Props {
  label: string
  slots: RotationSlot[]
  view: TimelineView
  range: TimelineRange
  memberColorMap: Map<string, number>
  isOverrideLayer?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOverrideLayer: false,
})

const emit = defineEmits<{
  delete: []
  createOverride: [slot: RotationSlot]
  deleteOverride: [slot: RotationSlot]
}>()

const gridItems = computed(() => {
  if (props.view === 'day') {
    return getTimelineHours(props.range)
  }
  return getTimelineDays(props.range)
})

const gridStyle = computed(() => {
  const count = gridItems.value.length
  return { gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }
})

const getColorIndex = (memberId: string): number => {
  return props.memberColorMap.get(memberId) ?? 0
}
</script>

<template>
  <div class="flex border-b border-base-content/10 last:border-b-0">
    <div class="w-32 shrink-0 px-2 py-2 flex items-center justify-between border-r border-base-content/10 bg-base-200/30">
      <div class="min-w-0">
        <div class="text-sm font-medium truncate">
          {{ label }}
        </div>
        <div
          v-if="isOverrideLayer"
          class="text-xs text-warning"
        >
          Замена
        </div>
      </div>
      <UiButton
        v-if="!isOverrideLayer"
        variant="ghost"
        size="sm"
        class="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        @click="emit('delete')"
      >
        <Icon
          name="lucide:trash-2"
          class="w-3 h-3"
        />
      </UiButton>
    </div>
    <div
      class="flex-1 grid relative min-h-12"
      :style="gridStyle"
    >
      <div
        v-for="item in gridItems"
        :key="item.getTime()"
        class="border-l border-base-content/10 first:border-l-0"
        :class="isToday(item) ? 'bg-primary/5' : ''"
      />
      <ScheduleTimelineSlot
        v-for="(slotItem, index) in slots"
        :key="`${slotItem.memberId}-${slotItem.start.getTime()}-${index}`"
        :slot-data="slotItem"
        :range="range"
        :color-index="getColorIndex(slotItem.memberId)"
        @create-override="emit('createOverride', $event)"
        @delete-override="emit('deleteOverride', $event)"
      />
    </div>
  </div>
</template>
