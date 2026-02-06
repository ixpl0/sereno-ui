<script setup lang="ts">
type ThemeOption = 'light' | 'system' | 'dark'

const { preference, setPreference } = useTheme()

const options: Array<{ value: ThemeOption, icon: string, label: string }> = [
  { value: 'light', icon: 'lucide:sun', label: 'Светлая тема' },
  { value: 'system', icon: 'lucide:monitor', label: 'Системная тема' },
  { value: 'dark', icon: 'lucide:moon', label: 'Тёмная тема' },
]
</script>

<template>
  <div
    class="inline-flex items-center p-0 bg-base-content/5 border border-base-content/10 rounded-sm"
    role="radiogroup"
    aria-label="Выбор темы"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="preference === option.value"
      :aria-label="option.label"
      :title="option.label"
      class="relative w-6 h-6 flex items-center justify-center rounded-sm transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      :class="[
        preference === option.value
          ? 'bg-base-content/10 text-base-content'
          : 'text-base-content/50 hover:text-base-content/80 hover:bg-base-content/5',
      ]"
      @click="setPreference(option.value)"
    >
      <Icon
        :name="option.icon"
        class="w-4 h-4"
      />
    </button>
  </div>
</template>
