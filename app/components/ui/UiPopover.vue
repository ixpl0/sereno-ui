<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

type Placement = 'top' | 'bottom' | 'left' | 'right'

interface Props {
  open: boolean
  placement?: Placement
  offset?: number
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom',
  offset: 8,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const triggerRef = ref<HTMLElement | null>(null)
const popoverRef = ref<HTMLElement | null>(null)
const popoverStyle = ref<Record<string, string>>({})

const updatePosition = () => {
  if (!triggerRef.value || !popoverRef.value) {
    return
  }

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const popoverRect = popoverRef.value.getBoundingClientRect()

  let top = 0
  let left = 0

  switch (props.placement) {
    case 'bottom':
      top = triggerRect.bottom + props.offset
      left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2
      break
    case 'top':
      top = triggerRect.top - popoverRect.height - props.offset
      left = triggerRect.left + (triggerRect.width - popoverRect.width) / 2
      break
    case 'left':
      top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2
      left = triggerRect.left - popoverRect.width - props.offset
      break
    case 'right':
      top = triggerRect.top + (triggerRect.height - popoverRect.height) / 2
      left = triggerRect.right + props.offset
      break
  }

  const padding = 8
  const maxLeft = window.innerWidth - popoverRect.width - padding
  const maxTop = window.innerHeight - popoverRect.height - padding

  left = Math.max(padding, Math.min(left, maxLeft))
  top = Math.max(padding, Math.min(top, maxTop))

  popoverStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
  }
}

const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as Node

  const isInsideTrigger = triggerRef.value?.contains(target) ?? false
  const isInsidePopover = popoverRef.value?.contains(target) ?? false

  if (!isInsideTrigger && !isInsidePopover) {
    emit('update:open', false)
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('update:open', false)
  }
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      updatePosition()
    })
    document.addEventListener('click', handleDocumentClick, true)
    document.addEventListener('keydown', handleEscape)
  }
  else {
    document.removeEventListener('click', handleDocumentClick, true)
    document.removeEventListener('keydown', handleEscape)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick, true)
  document.removeEventListener('keydown', handleEscape)
})

type TriggerRefSetter = (el: Element | ComponentPublicInstance | null) => void

const setTriggerRef: TriggerRefSetter = (el) => {
  triggerRef.value = el as HTMLElement | null
}

defineExpose({
  triggerRef,
})
</script>

<template>
  <slot
    name="trigger"
    :trigger-ref="setTriggerRef"
  />

  <Teleport to="#app-root">
    <UiTransition
      preset="scale"
      duration="fast"
    >
      <div
        v-if="open"
        ref="popoverRef"
        class="fixed z-[9999] bg-base-100 text-base-content shadow-xl border border-base-300 rounded-lg"
        :style="popoverStyle"
      >
        <slot />
      </div>
    </UiTransition>
  </Teleport>
</template>
