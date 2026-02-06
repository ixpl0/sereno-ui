<script setup lang="ts">
import type { TimelineView } from '~/utils/schedule'
import { getWeekStart, formatWeekRange, formatMonthYear, formatDayFull } from '~/utils/schedule'

interface Props {
  view: TimelineView
  currentDate: Date
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:view': [value: TimelineView]
  'update:currentDate': [value: Date]
}>()

const viewLabels: Record<TimelineView, string> = {
  day: 'День',
  week: 'Неделя',
  month: 'Месяц',
}

const currentLabel = computed(() => {
  const date = props.currentDate

  if (props.view === 'day') {
    return formatDayFull(date)
  }

  if (props.view === 'week') {
    const weekStart = getWeekStart(date)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return formatWeekRange(weekStart, weekEnd)
  }

  return formatMonthYear(date)
})

const goToToday = () => {
  emit('update:currentDate', new Date())
}

const goToPrev = () => {
  const newDate = new Date(props.currentDate)
  if (props.view === 'day') {
    newDate.setDate(newDate.getDate() - 1)
  }
  else if (props.view === 'week') {
    newDate.setDate(newDate.getDate() - 7)
  }
  else {
    newDate.setDate(1)
    newDate.setMonth(newDate.getMonth() - 1)
  }
  emit('update:currentDate', newDate)
}

const goToNext = () => {
  const newDate = new Date(props.currentDate)
  if (props.view === 'day') {
    newDate.setDate(newDate.getDate() + 1)
  }
  else if (props.view === 'week') {
    newDate.setDate(newDate.getDate() + 7)
  }
  else {
    newDate.setDate(1)
    newDate.setMonth(newDate.getMonth() + 1)
  }
  emit('update:currentDate', newDate)
}
</script>

<template>
  <div class="flex items-center justify-between gap-4 py-3 px-2">
    <div class="flex items-center gap-2">
      <UiButton
        variant="ghost"
        size="sm"
        @click="goToToday"
      >
        Сегодня
      </UiButton>
      <div class="flex items-center">
        <UiButton
          variant="ghost"
          size="sm"
          aria-label="Предыдущий период"
          @click="goToPrev"
        >
          <Icon
            name="lucide:chevron-left"
            class="w-4 h-4"
          />
        </UiButton>
        <UiButton
          variant="ghost"
          size="sm"
          aria-label="Следующий период"
          @click="goToNext"
        >
          <Icon
            name="lucide:chevron-right"
            class="w-4 h-4"
          />
        </UiButton>
      </div>
      <span class="font-medium text-sm min-w-40">
        {{ currentLabel }}
      </span>
    </div>

    <div class="flex items-center gap-1 bg-base-200 rounded-lg p-1">
      <button
        v-for="viewOption in (['day', 'week', 'month'] as const)"
        :key="viewOption"
        class="px-3 py-1 text-sm rounded-md transition-colors"
        :class="view === viewOption ? 'bg-base-100 shadow-sm' : 'hover:bg-base-300'"
        @click="emit('update:view', viewOption)"
      >
        {{ viewLabels[viewOption] }}
      </button>
    </div>
  </div>
</template>
