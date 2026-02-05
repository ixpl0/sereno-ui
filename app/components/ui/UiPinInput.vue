<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

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

const setInputRef = (index: number, el: Element | ComponentPublicInstance | null) => {
  if (el instanceof HTMLInputElement) {
    inputRefs.value[index] = el
  }
}

const groups = computed(() => {
  const result: number[][] = []
  for (let i = 0; i < props.length; i += props.groupSize) {
    result.push(Array.from({ length: Math.min(props.groupSize, props.length - i) }, (_, j) => i + j))
  }
  return result
})

const stateClasses = computed(() => {
  const baseClasses = 'input input-bordered w-8 h-10 sm:w-10 sm:h-12 text-center text-base sm:text-lg font-medium px-0'
  const stateMap = {
    default: '',
    error: 'input-error',
    success: 'input-success',
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
  if (!(event.target instanceof HTMLInputElement)) {
    return
  }
  const value = event.target.value.replace(/\D/g, '').slice(-1)

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
      class="flex items-center justify-center gap-1 sm:gap-2"
      @paste="handlePaste"
    >
      <template
        v-for="(group, groupIndex) in groups"
        :key="groupIndex"
      >
        <div
          v-if="groupIndex > 0"
          class="w-2 sm:w-3 h-0.5 bg-base-content/30 rounded-full"
        />
        <div class="flex gap-1 sm:gap-1.5">
          <input
            v-for="index in group"
            :key="index"
            :ref="(el) => setInputRef(index, el)"
            type="text"
            inputmode="numeric"
            maxlength="1"
            :value="values[index]"
            :disabled="disabled"
            :class="stateClasses"
            :aria-label="`Цифра ${index + 1} из ${length}`"
            @input="handleInput(index, $event)"
            @keydown="handleKeydown(index, $event)"
          >
        </div>
      </template>
    </div>
  </div>
</template>
