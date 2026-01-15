<script setup lang="ts">
definePageMeta({
  layout: 'public',
})

const { data: page } = await useAsyncData('index', () => {
  return queryCollection('content').where('path', '=', '/').first()
})

useSeoMeta({
  title: page.value?.title ?? 'Sereno Systems',
  description: page.value?.description ?? 'Платформа для мониторинга и управления инцидентами',
})
</script>

<template>
  <div class="container mx-auto px-4 py-16">
    <ContentRenderer
      v-if="page"
      :value="page"
      class="prose prose-lg max-w-none"
    />
  </div>
</template>
