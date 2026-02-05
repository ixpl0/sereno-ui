<script setup lang="ts">
import type { FormFieldVariant, FormFieldSize, FormFieldState } from '~/types/ui'
import { createVariantClasses, createSizeClasses, createStateClasses, HINT_COLOR_CLASSES } from '~/types/ui'

interface SelectOption {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  options: ReadonlyArray<SelectOption>
  placeholder?: string
  label?: string
  hint?: string
  variant?: FormFieldVariant
  size?: FormFieldSize
  state?: FormFieldState
  disabled?: boolean
  required?: boolean
  autofocus?: boolean
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
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
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectId = computed(() => props.name || `select-${useId()}`)
const hintId = computed(() => props.hint ? `${selectId.value}-hint` : undefined)

const variantClasses = createVariantClasses('select')
const sizeClasses = createSizeClasses('select')
const stateClasses = createStateClasses('select')

const selectClasses = computed(() => [
  'select',
  'w-full',
  variantClasses[props.variant],
  sizeClasses[props.size],
  stateClasses[props.state],
])

const selectRef = ref<HTMLSelectElement | null>(null)

const handleChange = (event: Event) => {
  if (!(event.target instanceof HTMLSelectElement)) {
    return
  }
  emit('update:modelValue', event.target.value)
}

const focus = () => {
  selectRef.value?.focus()
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
      :for="selectId"
      :required="required"
    >
      {{ label }}
    </UiLabel>
    <div class="select-wrapper">
      <select
        :id="selectId"
        ref="selectRef"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :name="name"
        :aria-describedby="hintId"
        :aria-invalid="state === 'error'"
        :class="selectClasses"
        @change="handleChange"
      >
        <option
          v-if="placeholder"
          value=""
          disabled
        >
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
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
