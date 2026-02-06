<script setup lang="ts">
import type { ToastType } from '~/composables/useToast'

const TOAST_CLASSES: Record<ToastType, string> = {
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
  info: 'alert-info',
}

const { toasts, removeToast } = useToast()

const getAlertClass = (type: ToastType): string => {
  return TOAST_CLASSES[type]
}
</script>

<template>
  <div
    class="toast toast-top toast-end z-[99999]"
    role="region"
    aria-label="Уведомления"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <button
        v-for="toast in toasts"
        :key="toast.id"
        type="button"
        :class="getAlertClass(toast.type)"
        :data-testid="`toast-${toast.type}`"
        :role="toast.type === 'error' ? 'alert' : 'status'"
        aria-label="Закрыть уведомление"
        class="alert shadow-lg cursor-pointer text-left w-full"
        @click="removeToast(toast.id)"
      >
        <span>{{ toast.message }}</span>
      </button>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
