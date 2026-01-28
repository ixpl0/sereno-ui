<script setup lang="ts">
interface Props {
  title: string
  icon?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  icon: 'lucide:construction',
  description: 'Раздел в разработке',
})
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-5xl mx-auto">
      <UiCard padding="lg">
        <div class="text-center py-12">
          <Icon
            :name="icon"
            class="w-16 h-16 mx-auto text-base-content/20 mb-4"
          />
          <h1 class="text-2xl font-bold mb-2">
            {{ title }}
          </h1>
          <p class="text-base-content/60">
            {{ description }}
          </p>
        </div>
      </UiCard>
    </div>
  </div>
</template>
