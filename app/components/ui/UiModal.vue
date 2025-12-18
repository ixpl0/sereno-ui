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
  if (event.key === 'Escape' && props.closeOnEscape && props.modelValue) {
    close()
  }
}

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
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
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
                  aria-label="Close"
                  @click="close"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
