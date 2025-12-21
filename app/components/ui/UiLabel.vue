<script setup lang="ts">
interface Props {
  for?: string
  required?: boolean
}

withDefaults(defineProps<Props>(), {
  for: '',
  required: false,
})
</script>

<template>
  <label
    :for="$props.for"
    class="label text-base-content/60 pb-1"
  >
    <slot />
    <span
      v-if="required"
      class="text-error"
    >*</span>
  </label>
</template>
