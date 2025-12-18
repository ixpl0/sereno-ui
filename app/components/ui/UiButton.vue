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
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
  block: false,
  outline: false,
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
    'btn-disabled': props.disabled,
  },
])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    class="transition-all duration-200 ease-out active:scale-95"
  >
    <span
      v-if="loading"
      class="loading loading-spinner"
    />
    <slot />
  </button>
</template>
