<script setup lang="ts">
import type { RotationSlot } from '~/utils/schedule'
import { getCalendarCells, isToday, getUserColor } from '~/utils/schedule'

interface Props {
  currentDate: Date
  slots: RotationSlot[]
  memberColorMap: Map<string, number>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  selectDay: [date: Date]
}>()

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const calendarCells = computed(() => {
  return getCalendarCells(props.currentDate, props.slots)
})

const getColorIndex = (memberId: string): number => {
  return props.memberColorMap.get(memberId) ?? 0
}

const getDayAriaLabel = (date: Date): string => {
  return `Открыть день ${date.toLocaleDateString('ru-RU')}`
}
</script>

<template>
  <div class="grid grid-cols-7 gap-px bg-base-content/10 rounded-lg overflow-hidden">
    <div
      v-for="day in weekDays"
      :key="day"
      class="p-2 text-center text-xs font-medium bg-base-200"
    >
      {{ day }}
    </div>

    <button
      v-for="cell in calendarCells"
      :key="cell.date.toISOString()"
      type="button"
      class="w-full min-h-24 p-1 bg-base-100 cursor-pointer hover:bg-base-200/50 transition-colors text-left align-top focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-0"
      :class="{
        'bg-primary/5 hover:bg-primary/10': isToday(cell.date),
        'opacity-40': !cell.isCurrentMonth,
      }"
      :aria-label="getDayAriaLabel(cell.date)"
      @click="emit('selectDay', cell.date)"
    >
      <div
        class="text-sm font-medium mb-1"
        :class="isToday(cell.date) ? 'text-primary' : ''"
      >
        {{ cell.date.getDate() }}
      </div>
      <div class="space-y-0.5">
        <div
          v-for="(slot, slotIndex) in cell.slots.slice(0, 3)"
          :key="`${slot.memberId}-${slot.start.getTime()}-${slotIndex}`"
          class="text-xs px-1 py-0.5 rounded truncate text-white"
          :class="[getUserColor(getColorIndex(slot.memberId)), slot.isOverride ? 'ring-1 ring-warning' : '']"
        >
          {{ slot.memberName }}
        </div>
        <div
          v-if="cell.slots.length > 3"
          class="text-xs text-base-content/50 px-1"
        >
          +{{ cell.slots.length - 3 }}
        </div>
      </div>
    </button>
  </div>
</template>
