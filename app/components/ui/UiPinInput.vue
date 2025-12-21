<script setup lang="ts">
interface Props {
  modelValue?: string
  length?: number
  groupSize?: number
  disabled?: boolean
  autofocus?: boolean
  state?: 'default' | 'error' | 'success'
  label?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  length: 8,
  groupSize: 4,
  disabled: false,
  autofocus: false,
  state: 'default',
  label: '',
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'complete': [value: string]
}>()

const inputRefs = ref<(HTMLInputElement | null)[]>([])
const values = ref<string[]>(Array.from({ length: props.length }, () => ''))

const groups = computed(() => {
  const result: number[][] = []
  for (let i = 0; i < props.length; i += props.groupSize) {
    result.push(Array.from({ length: Math.min(props.groupSize, props.length - i) }, (_, j) => i + j))
  }
  return result
})

const stateClasses = computed(() => {
  const baseClasses = 'w-10 h-12 text-center text-lg font-medium rounded-lg border transition-all duration-200'
  const stateMap = {
    default: 'border-base-content/20 focus:border-primary focus:ring-2 focus:ring-primary/20',
    error: 'border-error focus:border-error focus:ring-2 focus:ring-error/20',
    success: 'border-success focus:border-success focus:ring-2 focus:ring-success/20',
  }
  return `${baseClasses} ${stateMap[props.state]}`
})

const syncFromModelValue = () => {
  const chars = props.modelValue.split('')
  values.value = Array.from({ length: props.length }, (_, i) => chars[i] || '')
}

const emitValue = () => {
  const value = values.value.join('')
  emit('update:modelValue', value)
  if (value.length === props.length) {
    emit('complete', value)
  }
}

const focusInput = (index: number) => {
  if (index >= 0 && index < props.length) {
    inputRefs.value[index]?.focus()
  }
}

const handleInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement
  const value = input.value.replace(/\D/g, '').slice(-1)

  values.value = values.value.map((v, i) => (i === index ? value : v))
  emitValue()

  if (value && index < props.length - 1) {
    focusInput(index + 1)
  }
}

const handleKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === 'Backspace') {
    if (!values.value[index] && index > 0) {
      focusInput(index - 1)
    }
    else {
      values.value = values.value.map((v, i) => (i === index ? '' : v))
      emitValue()
    }
  }
  else if (event.key === 'ArrowLeft' && index > 0) {
    focusInput(index - 1)
  }
  else if (event.key === 'ArrowRight' && index < props.length - 1) {
    focusInput(index + 1)
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  const pastedText = event.clipboardData?.getData('text') || ''
  const digits = pastedText.replace(/\D/g, '').slice(0, props.length)

  if (digits) {
    values.value = Array.from({ length: props.length }, (_, i) => digits[i] || '')
    emitValue()

    const nextIndex = Math.min(digits.length, props.length - 1)
    focusInput(nextIndex)
  }
}

const focus = () => {
  const firstEmpty = values.value.findIndex(v => !v)
  focusInput(firstEmpty >= 0 ? firstEmpty : 0)
}

watch(() => props.modelValue, syncFromModelValue, { immediate: true })

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
      :required="required"
    >
      {{ label }}
    </UiLabel>
    <div
      class="flex items-center justify-center gap-2"
      @paste="handlePaste"
    >
      <template
        v-for="(group, groupIndex) in groups"
        :key="groupIndex"
      >
        <div
          v-if="groupIndex > 0"
          class="w-3 h-0.5 bg-base-content/30 rounded-full"
        />
        <div class="flex gap-1.5">
          <input
            v-for="index in group"
            :key="index"
            :ref="(el) => inputRefs[index] = el as HTMLInputElement"
            type="text"
            inputmode="numeric"
            maxlength="1"
            :value="values[index]"
            :disabled="disabled"
            :class="stateClasses"
            :aria-label="`Цифра ${index + 1} из ${length}`"
            class="bg-base-100"
            @input="handleInput(index, $event)"
            @keydown="handleKeydown(index, $event)"
          >
        </div>
      </template>
    </div>
  </div>
</template>
