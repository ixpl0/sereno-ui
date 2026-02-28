<script setup lang="ts">
import type { RotationSlot, TimelineRange } from '~/utils/schedule'
import { getSlotPosition, formatTimeRange, getUserColor } from '~/utils/schedule'

interface Props {
  slotData: RotationSlot
  range: TimelineRange
  colorIndex: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  createOverride: [slot: RotationSlot]
  deleteOverride: [slot: RotationSlot]
}>()

const isOpen = ref(false)

const position = computed(() => getSlotPosition(props.slotData, props.range))

const style = computed(() => ({
  left: `${position.value.left}%`,
  width: `${position.value.width}%`,
}))

const colorClass = computed(() => getUserColor(props.colorIndex))

const timeLabel = computed(() => formatTimeRange(props.slotData.start, props.slotData.end))
const compactTimeLabel = computed(() => {
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  return `${formatTime(props.slotData.start)}-${formatTime(props.slotData.end)}`
})
const triggerAriaLabel = computed(() => `Открыть слот ${props.slotData.memberName} (${timeLabel.value})`)

const handleClick = () => {
  isOpen.value = !isOpen.value
}

const handleCreateOverride = () => {
  emit('createOverride', props.slotData)
  isOpen.value = false
}

const handleDeleteOverride = () => {
  emit('deleteOverride', props.slotData)
  isOpen.value = false
}
</script>

<template>
  <UiPopover
    v-model:open="isOpen"
    placement="bottom"
  >
    <template #trigger="{ triggerRef }">
      <button
        :ref="triggerRef"
        type="button"
        class="absolute top-1 bottom-1 rounded px-1 py-0.5 cursor-pointer hover:opacity-90 transition-opacity text-left border-0 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1"
        :class="[colorClass, slotData.isOverride ? 'ring-2 ring-warning ring-offset-1' : '']"
        :style="style"
        :aria-label="triggerAriaLabel"
        @click.stop="handleClick"
      >
        <div class="text-xs font-medium text-white truncate">
          {{ slotData.memberName }}
        </div>
        <div class="text-[9px] leading-none text-white/80 truncate">
          {{ compactTimeLabel }}
        </div>
      </button>
    </template>

    <div class="p-3 min-w-48 space-y-2">
      <div class="font-medium">
        {{ slotData.memberName }}
      </div>
      <div class="text-sm text-base-content/70">
        {{ timeLabel }}
      </div>
      <div
        v-if="slotData.name"
        class="text-sm text-base-content/50"
      >
        {{ slotData.name }}
      </div>
      <div
        v-if="slotData.isOverride"
        class="badge badge-warning badge-sm"
      >
        Замена
      </div>

      <div class="pt-2 border-t border-base-content/10">
        <button
          v-if="slotData.isOverride"
          class="btn btn-error btn-sm btn-block"
          @click="handleDeleteOverride"
        >
          Удалить замену
        </button>
        <button
          v-else
          class="btn btn-ghost btn-sm btn-block"
          @click="handleCreateOverride"
        >
          Создать замену
        </button>
      </div>
    </div>
  </UiPopover>
</template>
