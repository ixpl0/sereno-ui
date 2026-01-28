<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Эскалации',
})

useSeoMeta({
  title: 'Эскалации',
  description: 'Управление политиками эскалаций',
})
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-5xl mx-auto">
      <UiCard class="animate-slide-up">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-xl font-semibold">
            Эскалации
          </h1>
        </div>

        <div class="text-center py-12">
          <Icon
            name="lucide:git-branch"
            class="w-16 h-16 mx-auto text-base-content/20 mb-4"
          />
          <p class="text-base-content/60 mb-2">
            Раздел в разработке
          </p>
          <p class="text-sm text-base-content/40">
            Здесь будет управление политиками эскалаций
          </p>
        </div>
      </UiCard>
    </div>
  </div>
</template>
