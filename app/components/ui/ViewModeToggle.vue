<script setup lang="ts">
type ViewMode = 'cards' | 'table'

interface Props {
  modelValue: ViewMode
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: ViewMode]
}>()
</script>

<template>
  <div class="flex items-center bg-base-200 rounded p-1">
    <button
      type="button"
      class="flex items-center justify-center w-10 h-10 rounded transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      :class="modelValue === 'cards' ? 'bg-base-100 shadow-sm' : 'hover:bg-base-content/5'"
      aria-label="Карточки"
      :aria-pressed="modelValue === 'cards'"
      title="Карточки"
      @click="emit('update:modelValue', 'cards')"
    >
      <Icon
        name="lucide:layout-grid"
        class="w-4 h-4"
        :class="modelValue === 'cards' ? 'text-primary' : 'text-base-content/60'"
      />
    </button>
    <button
      type="button"
      class="flex items-center justify-center w-10 h-10 rounded transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      :class="modelValue === 'table' ? 'bg-base-100 shadow-sm' : 'hover:bg-base-content/5'"
      aria-label="Таблица"
      :aria-pressed="modelValue === 'table'"
      title="Таблица"
      @click="emit('update:modelValue', 'table')"
    >
      <Icon
        name="lucide:list"
        class="w-4 h-4"
        :class="modelValue === 'table' ? 'text-primary' : 'text-base-content/60'"
      />
    </button>
  </div>
</template>
