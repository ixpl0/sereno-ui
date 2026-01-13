<script setup lang="ts">
const props = defineProps<{
  cols?: number | string
}>()

const colsNumber = computed(() => {
  if (!props.cols) {
    return 2
  }
  return typeof props.cols === 'string' ? parseInt(props.cols, 10) : props.cols
})
</script>

<template>
  <div
    class="grid gap-6"
    :class="{
      'md:grid-cols-2': colsNumber === 2,
      'md:grid-cols-3': colsNumber === 3,
      'md:grid-cols-2 lg:grid-cols-4': colsNumber === 4,
    }"
  >
    <slot />
  </div>
</template>
