<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'link' | 'neutral'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  outline?: boolean
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
  block: false,
  outline: false,
  ariaLabel: undefined,
})

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost: 'btn-ghost',
  link: 'btn-link',
  neutral: 'btn-neutral',
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
}

const buttonClasses = computed(() => [
  'btn',
  variantClasses[props.variant],
  sizeClasses[props.size],
  {
    'btn-outline': props.outline,
    'btn-block': props.block,
  },
])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    :aria-label="ariaLabel"
    :aria-busy="loading"
    class="transition-all duration-200 ease-out active:scale-[0.98] hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
  >
    <span
      v-if="loading"
      class="loading loading-spinner"
      aria-hidden="true"
    />
    <slot />
  </button>
</template>
