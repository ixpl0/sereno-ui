<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
}>()
</script>

<template>
  <div class="p-6 bg-base-200/50 hover:bg-base-200 transition-colors rounded-xl">
    <div
      v-if="icon"
      class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"
    >
      <Icon
        :name="icon"
        class="w-6 h-6 text-primary"
      />
    </div>
    <h3 class="text-lg font-semibold mb-2">
      {{ title }}
    </h3>
    <div class="text-base-content/70">
      <slot />
    </div>
  </div>
</template>
