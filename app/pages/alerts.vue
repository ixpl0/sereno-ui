<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Алерты',
})
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-3xl mx-auto">
      <UiCard padding="lg">
        <div class="text-center py-12">
          <Icon
            name="lucide:bell"
            class="w-16 h-16 mx-auto text-base-content/20 mb-4"
          />
          <h1 class="text-2xl font-bold mb-2">
            Алерты
          </h1>
          <p class="text-base-content/60">
            Раздел в разработке
          </p>
        </div>
      </UiCard>
    </div>
  </div>
</template>
