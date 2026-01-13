<script setup lang="ts">
definePageMeta({
  layout: 'public',
})

const { data: page } = await useAsyncData('pricing', () => {
  return queryCollection('content').path('/pricing').first()
})

useSeoMeta({
  title: page.value?.title,
  description: page.value?.description,
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
