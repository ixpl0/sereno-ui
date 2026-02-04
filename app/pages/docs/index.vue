<script setup lang="ts">
definePageMeta({
  layout: 'public',
})

const { data: page } = await useAsyncData('docs-index', () => {
  return queryCollection('content').path('/docs').first()
})

useSeoMeta({
  title: 'Документация',
  description: 'Руководство по использованию Sereno',
})
</script>

<template>
  <div class="container mx-auto px-4 py-16">
    <h1 class="text-5xl font-normal mb-8">
      Документация
    </h1>
    <ContentRenderer
      v-if="page"
      :value="page"
      class="prose prose-lg max-w-none"
    />
  </div>
</template>
