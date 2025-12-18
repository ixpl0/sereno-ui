<script setup lang="ts">
type InputVariant = 'bordered' | 'ghost'
type InputSize = 'xs' | 'sm' | 'md' | 'lg'
type InputState = 'default' | 'error' | 'success' | 'warning'

interface Props {
  modelValue?: string
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  label?: string
  hint?: string
  variant?: InputVariant
  size?: InputSize
  state?: InputState
  disabled?: boolean
  required?: boolean
  name?: string
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  label: '',
  hint: '',
  variant: 'bordered',
  size: 'md',
  state: 'default',
  disabled: false,
  required: false,
  name: '',
  autocomplete: 'off',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = computed(() => props.name || `input-${Math.random().toString(36).slice(2, 9)}`)

const variantClasses: Record<InputVariant, string> = {
  bordered: 'input-bordered',
  ghost: 'input-ghost',
}

const sizeClasses: Record<InputSize, string> = {
  xs: 'input-xs',
  sm: 'input-sm',
  md: '',
  lg: 'input-lg',
}

const stateClasses: Record<InputState, string> = {
  default: '',
  error: 'input-error',
  success: 'input-success',
  warning: 'input-warning',
}

const hintColorClasses: Record<InputState, string> = {
  default: 'text-base-content/60',
  error: 'text-error',
  success: 'text-success',
  warning: 'text-warning',
}

const inputClasses = computed(() => [
  'input',
  'w-full',
  'transition-all',
  'duration-200',
  'ease-out',
  variantClasses[props.variant],
  sizeClasses[props.size],
  stateClasses[props.state],
])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="form-control w-full">
    <label
      v-if="label"
      :for="inputId"
      class="label"
    >
      <span class="label-text">
        {{ label }}
        <span
          v-if="required"
          class="text-error"
        >*</span>
      </span>
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :name="name"
      :autocomplete="autocomplete"
      :class="inputClasses"
      class="focus:scale-[1.01] focus:shadow-lg"
      @input="handleInput"
    >
    <label
      v-if="hint"
      class="label"
    >
      <span
        class="label-text-alt transition-colors duration-200"
        :class="hintColorClasses[state]"
      >
        {{ hint }}
      </span>
    </label>
  </div>
</template>
