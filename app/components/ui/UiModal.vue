<script setup lang="ts">
import UiCard from './UiCard.vue'
import UiTransition from './UiTransition.vue'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface Props {
  modelValue: boolean
  title?: string
  size?: ModalSize
  closable?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'md',
  closable: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const modalRef = ref<HTMLElement | null>(null)
const previousActiveElement = ref<HTMLElement | null>(null)

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

const close = () => {
  if (!props.closable) {
    return
  }
  emit('update:modelValue', false)
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!props.modelValue) {
    return
  }

  if (event.key === 'Escape' && props.closeOnEscape) {
    close()
    return
  }

  if (event.key === 'Tab') {
    trapFocus(event)
  }
}

const getFocusableElements = (): HTMLElement[] => {
  if (!modalRef.value) {
    return []
  }

  const selector = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  return Array.from(modalRef.value.querySelectorAll<HTMLElement>(selector))
}

const trapFocus = (event: KeyboardEvent) => {
  const focusableElements = getFocusableElements()

  if (focusableElements.length === 0) {
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (!firstElement || !lastElement) {
    return
  }

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  }
  else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

const focusFirstElement = () => {
  nextTick(() => {
    const focusableElements = getFocusableElements()
    const firstElement = focusableElements[0]
    if (firstElement) {
      firstElement.focus()
    }
  })
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    previousActiveElement.value = document.activeElement as HTMLElement
    focusFirstElement()
  }
  else if (previousActiveElement.value) {
    previousActiveElement.value.focus()
    previousActiveElement.value = null
  }
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <UiTransition
      preset="fade"
      :duration="150"
    >
      <div
        v-if="modelValue"
        ref="modalRef"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'modal-title' : undefined"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
          @click="handleBackdropClick"
        />

        <UiTransition
          preset="scale-bounce"
          :duration="250"
          appear
        >
          <UiCard
            v-if="modelValue"
            :title="title"
            padding="md"
            class="relative w-full"
            :class="sizeClasses[size]"
          >
            <template
              v-if="title || closable"
              #header
            >
              <div class="flex items-center justify-between">
                <h3
                  v-if="title"
                  id="modal-title"
                  class="text-lg font-semibold"
                >
                  {{ title }}
                </h3>
                <div
                  v-else
                  class="flex-1"
                />
                <button
                  v-if="closable"
                  type="button"
                  class="btn btn-ghost btn-sm btn-circle transition-transform duration-200 hover:scale-110 hover:rotate-90"
                  aria-label="Закрыть"
                  @click="close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </template>

            <slot />

            <template
              v-if="$slots.footer"
              #footer
            >
              <slot name="footer" />
            </template>
          </UiCard>
        </UiTransition>
      </div>
    </UiTransition>
  </Teleport>
</template>
