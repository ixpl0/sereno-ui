<script setup lang="ts">
type SelectVariant = 'bordered' | 'ghost'
type SelectSize = 'xs' | 'sm' | 'md' | 'lg'
type SelectState = 'default' | 'error' | 'success' | 'warning'

interface SelectOption {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  options: ReadonlyArray<SelectOption>
  placeholder?: string
  label?: string
  variant?: SelectVariant
  size?: SelectSize
  state?: SelectState
  disabled?: boolean
  required?: boolean
  autofocus?: boolean
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  label: '',
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

const variantClasses: Record<SelectVariant, string> = {
  bordered: 'select-bordered',
  ghost: 'select-ghost',
}

const sizeClasses: Record<SelectSize, string> = {
  xs: 'select-xs',
  sm: 'select-sm',
  md: '',
  lg: 'select-lg',
}

const stateClasses: Record<SelectState, string> = {
  default: '',
  error: 'select-error',
  success: 'select-success',
  warning: 'select-warning',
}

const selectClasses = computed(() => [
  'select',
  'w-full',
  variantClasses[props.variant],
  sizeClasses[props.size],
  stateClasses[props.state],
])

const selectRef = ref<HTMLSelectElement | null>(null)

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
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
  </div>
</template>
