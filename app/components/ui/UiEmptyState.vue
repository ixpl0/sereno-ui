<script setup lang="ts">
interface Props {
  icon: string
  title: string
  description?: string
  actionText?: string
  actionIcon?: string
}

withDefaults(defineProps<Props>(), {
  description: undefined,
  actionText: undefined,
  actionIcon: undefined,
})

const emit = defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="text-center py-12">
    <Icon
      :name="icon"
      class="w-16 h-16 mx-auto text-base-content/20 mb-4"
    />
    <p class="text-base-content/60 mb-4">
      {{ title }}
    </p>
    <p
      v-if="description"
      class="text-base-content/50 text-sm mb-4"
    >
      {{ description }}
    </p>
    <UiButton
      v-if="actionText"
      variant="primary"
      @click="emit('action')"
    >
      <Icon
        v-if="actionIcon"
        :name="actionIcon"
        class="w-4 h-4 mr-1"
      />
      {{ actionText }}
    </UiButton>
  </div>
</template>
