<script setup lang="ts">
type TransitionPreset = 'fade' | 'scale' | 'scale-bounce' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'

interface Props {
  preset?: TransitionPreset
  duration?: number
  appear?: boolean
  mode?: 'in-out' | 'out-in' | 'default'
}

const props = withDefaults(defineProps<Props>(), {
  preset: 'fade',
  duration: 200,
  appear: false,
  mode: 'default',
})

const transitionName = computed(() => `ui-${props.preset}`)

const transitionStyle = computed(() => ({
  '--ui-transition-duration': `${props.duration}ms`,
}))
</script>

<template>
  <Transition
    :name="transitionName"
    :appear="appear"
    :mode="mode === 'default' ? undefined : mode"
    :style="transitionStyle"
  >
    <slot />
  </Transition>
</template>

<style>
:root {
  --ui-transition-duration: 200ms;
}

.ui-fade-enter-active,
.ui-fade-leave-active {
  transition: opacity var(--ui-transition-duration) ease;
}

.ui-fade-enter-from,
.ui-fade-leave-to {
  opacity: 0;
}

.ui-scale-enter-active {
  transition:
    opacity var(--ui-transition-duration) ease-out,
    transform var(--ui-transition-duration) ease-out;
}

.ui-scale-leave-active {
  transition:
    opacity calc(var(--ui-transition-duration) * 0.75) ease-in,
    transform calc(var(--ui-transition-duration) * 0.75) ease-in;
}

.ui-scale-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-8px);
}

.ui-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-8px);
}

.ui-scale-bounce-enter-active {
  transition:
    opacity var(--ui-transition-duration) ease-out,
    transform var(--ui-transition-duration) cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ui-scale-bounce-leave-active {
  transition:
    opacity calc(var(--ui-transition-duration) * 0.75) ease-in,
    transform calc(var(--ui-transition-duration) * 0.75) ease-in;
}

.ui-scale-bounce-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.ui-scale-bounce-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.ui-slide-up-enter-active,
.ui-slide-up-leave-active {
  transition:
    opacity var(--ui-transition-duration) ease,
    transform var(--ui-transition-duration) ease;
}

.ui-slide-up-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.ui-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}

.ui-slide-down-enter-active,
.ui-slide-down-leave-active {
  transition:
    opacity var(--ui-transition-duration) ease,
    transform var(--ui-transition-duration) ease;
}

.ui-slide-down-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}

.ui-slide-down-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

.ui-slide-left-enter-active,
.ui-slide-left-leave-active {
  transition:
    opacity var(--ui-transition-duration) ease,
    transform var(--ui-transition-duration) ease;
}

.ui-slide-left-enter-from {
  opacity: 0;
  transform: translateX(16px);
}

.ui-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.ui-slide-right-enter-active,
.ui-slide-right-leave-active {
  transition:
    opacity var(--ui-transition-duration) ease,
    transform var(--ui-transition-duration) ease;
}

.ui-slide-right-enter-from {
  opacity: 0;
  transform: translateX(-16px);
}

.ui-slide-right-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
