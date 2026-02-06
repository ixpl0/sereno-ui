<script setup lang="ts">
import type { FormFieldVariant, FormFieldSize, FormFieldState } from '~/types/ui'
import { createVariantClasses, createSizeClasses, createStateClasses, HINT_COLOR_CLASSES } from '~/types/ui'

interface Props {
  modelValue?: string
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  label?: string
  hint?: string
  variant?: FormFieldVariant
  size?: FormFieldSize
  state?: FormFieldState
  disabled?: boolean
  readonly?: boolean
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
  readonly: false,
  required: false,
  autofocus: false,
  name: '',
  autocomplete: undefined,
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

const variantClasses = createVariantClasses('input')
const sizeClasses = createSizeClasses('input')
const stateClasses = createStateClasses('input')

const inputClasses = computed(() => [
  'input',
  'w-full',
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

const inputAttrs = computed(() => {
  const attrs: Record<string, string | number | boolean | undefined> = {}
  if (props.autocomplete) {
    attrs.autocomplete = props.autocomplete
  }
  if (props.maxlength !== undefined) {
    attrs.maxlength = props.maxlength
  }
  if (props.minlength !== undefined) {
    attrs.minlength = props.minlength
  }
  if (props.pattern !== undefined) {
    attrs.pattern = props.pattern
  }
  return attrs
})

const inputRef = ref<HTMLInputElement | null>(null)

const handleInput = (event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) {
    return
  }
  emit('update:modelValue', event.target.value)
}

const focus = () => {
  inputRef.value?.focus()
}

const select = () => {
  inputRef.value?.select()
}

onMounted(() => {
  if (props.autofocus) {
    focus()
  }
})

defineExpose({ focus, select })
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
      :readonly="readonly"
      :required="required"
      :name="name"
      v-bind="inputAttrs"
      :aria-describedby="ariaDescribedbyComputed"
      :aria-invalid="state === 'error'"
      :class="inputClasses"
      @input="handleInput"
    >
    <p
      v-if="hint"
      :id="hintId"
      class="label"
      :class="HINT_COLOR_CLASSES[state]"
    >
      {{ hint }}
    </p>
  </div>
</template>
