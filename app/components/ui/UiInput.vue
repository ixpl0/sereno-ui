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
  autofocus?: boolean
  name?: string
  autocomplete?: string
  maxlength?: number
  minlength?: number
  pattern?: string
  ariaDescribedby?: string
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
  autofocus: false,
  name: '',
  autocomplete: 'off',
  maxlength: undefined,
  minlength: undefined,
  pattern: undefined,
  ariaDescribedby: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = computed(() => props.name || `input-${useId()}`)
const hintId = computed(() => props.hint ? `${inputId.value}-hint` : undefined)

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

const ariaDescribedbyComputed = computed(() => {
  const ids: string[] = []
  if (props.ariaDescribedby) {
    ids.push(props.ariaDescribedby)
  }
  if (hintId.value) {
    ids.push(hintId.value)
  }
  return ids.length > 0 ? ids.join(' ') : undefined
})

const inputRef = ref<HTMLInputElement | null>(null)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const focus = () => {
  inputRef.value?.focus()
}

onMounted(() => {
  if (props.autofocus) {
    focus()
  }
})

defineExpose({ focus })
</script>

<template>
  <div class="w-full">
    <UiLabel
      v-if="label"
      :for="inputId"
      :required="required"
    >
      {{ label }}
    </UiLabel>
    <input
      :id="inputId"
      ref="inputRef"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :name="name"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      :minlength="minlength"
      :pattern="pattern"
      :aria-describedby="ariaDescribedbyComputed"
      :aria-invalid="state === 'error'"
      :class="inputClasses"
      class="focus:scale-[1.01] focus:shadow-lg"
      @input="handleInput"
    >
    <p
      v-if="hint"
      :id="hintId"
      class="label"
      :class="hintColorClasses[state]"
    >
      {{ hint }}
    </p>
  </div>
</template>
