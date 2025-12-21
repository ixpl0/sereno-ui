<script setup lang="ts">
type TransitionPreset = 'fade' | 'scale' | 'scale-bounce' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'
type TransitionDuration = 'fast' | 'normal' | 'slow' | 'slower'

interface Props {
  preset?: TransitionPreset
  duration?: TransitionDuration
  appear?: boolean
  mode?: 'in-out' | 'out-in' | 'default'
}

const props = withDefaults(defineProps<Props>(), {
  preset: 'fade',
  duration: 'normal',
  appear: false,
  mode: 'default',
})

const transitionName = computed(() => `ui-${props.preset}`)
const durationClass = computed(() => `ui-duration-${props.duration}`)
</script>

<template>
  <Transition
    :name="transitionName"
    :appear="appear"
    :mode="mode === 'default' ? undefined : mode"
    :class="durationClass"
  >
    <slot />
  </Transition>
</template>

<style>
.ui-duration-fast {
  --ui-transition-duration: 150ms;
}

.ui-duration-normal {
  --ui-transition-duration: 200ms;
}

.ui-duration-slow {
  --ui-transition-duration: 300ms;
}

.ui-duration-slower {
  --ui-transition-duration: 500ms;
}

.ui-fade-enter-active,
.ui-fade-leave-active,
.ui-fade-appear-active {
  transition: opacity var(--ui-transition-duration) ease;
}

.ui-fade-enter-from,
.ui-fade-leave-to,
.ui-fade-appear-from {
  opacity: 0;
}

.ui-scale-enter-active,
.ui-scale-appear-active {
  transition:
    opacity var(--ui-transition-duration) ease-out,
    transform var(--ui-transition-duration) ease-out;
}

.ui-scale-leave-active {
  transition:
    opacity calc(var(--ui-transition-duration) * 0.75) ease-in,
    transform calc(var(--ui-transition-duration) * 0.75) ease-in;
}

.ui-scale-enter-from,
.ui-scale-appear-from {
  opacity: 0;
  transform: scale(0.95) translateY(-8px);
}

.ui-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-8px);
}

.ui-scale-bounce-enter-active,
.ui-scale-bounce-appear-active {
  transition:
    opacity var(--ui-transition-duration) ease-out,
    transform var(--ui-transition-duration) cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ui-scale-bounce-leave-active {
  transition:
    opacity calc(var(--ui-transition-duration) * 0.75) ease-in,
    transform calc(var(--ui-transition-duration) * 0.75) ease-in;
}

.ui-scale-bounce-enter-from,
.ui-scale-bounce-appear-from {
  opacity: 0;
  transform: scale(0.9);
}

.ui-scale-bounce-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.ui-slide-up-enter-active,
.ui-slide-up-leave-active,
.ui-slide-up-appear-active {
  transition:
    opacity var(--ui-transition-duration) ease,
    transform var(--ui-transition-duration) ease;
}

.ui-slide-up-enter-from,
.ui-slide-up-appear-from {
  opacity: 0;
  transform: translateY(16px);
}

.ui-slide-up-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}

.ui-slide-down-enter-active,
.ui-slide-down-leave-active,
.ui-slide-down-appear-active {
  transition:
    opacity var(--ui-transition-duration) ease,
    transform var(--ui-transition-duration) ease;
}

.ui-slide-down-enter-from,
.ui-slide-down-appear-from {
  opacity: 0;
  transform: translateY(-16px);
}

.ui-slide-down-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

.ui-slide-left-enter-active,
.ui-slide-left-leave-active,
.ui-slide-left-appear-active {
  transition:
    opacity var(--ui-transition-duration) ease,
    transform var(--ui-transition-duration) ease;
}

.ui-slide-left-enter-from,
.ui-slide-left-appear-from {
  opacity: 0;
  transform: translateX(16px);
}

.ui-slide-left-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.ui-slide-right-enter-active,
.ui-slide-right-leave-active,
.ui-slide-right-appear-active {
  transition:
    opacity var(--ui-transition-duration) ease,
    transform var(--ui-transition-duration) ease;
}

.ui-slide-right-enter-from,
.ui-slide-right-appear-from {
  opacity: 0;
  transform: translateX(-16px);
}

.ui-slide-right-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
