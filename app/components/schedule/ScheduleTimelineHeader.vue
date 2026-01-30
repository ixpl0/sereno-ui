<script setup lang="ts">
import type { TimelineView, TimelineRange } from '~/utils/schedule'
import { getTimelineDays, getTimelineHours, formatDateShort, formatDayOfWeek, isToday } from '~/utils/schedule'

interface Props {
  view: TimelineView
  range: TimelineRange
}

const props = defineProps<Props>()

const items = computed(() => {
  if (props.view === 'day') {
    return getTimelineHours(props.range).map(hour => ({
      date: hour,
      label: `${hour.getHours().toString().padStart(2, '0')}:00`,
      sublabel: '',
      isToday: isToday(hour),
    }))
  }

  return getTimelineDays(props.range).map(day => ({
    date: day,
    label: formatDateShort(day),
    sublabel: formatDayOfWeek(day),
    isToday: isToday(day),
  }))
})

const gridStyle = computed(() => {
  const count = items.value.length
  return { gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }
})
</script>

<template>
  <div
    class="grid border-b border-base-content/10"
    :style="gridStyle"
  >
    <div
      v-for="item in items"
      :key="item.date.getTime()"
      class="px-1 py-2 text-center border-l border-base-content/10 first:border-l-0"
      :class="item.isToday ? 'bg-primary/5' : ''"
    >
      <div
        class="text-xs font-medium"
        :class="item.isToday ? 'text-primary' : 'text-base-content/70'"
      >
        {{ item.label }}
      </div>
      <div
        v-if="item.sublabel"
        class="text-xs"
        :class="item.isToday ? 'text-primary/70' : 'text-base-content/40'"
      >
        {{ item.sublabel }}
      </div>
    </div>
  </div>
</template>
