<script setup lang="ts">
definePageMeta({
  layout: 'public',
})

const route = useRoute()
const path = `/docs/${(route.params.slug as string[]).join('/')}`

const { data: page } = await useAsyncData(`docs-${path}`, () => {
  return queryCollection('content').path(path).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Страница не найдена' })
}

useSeoMeta({
  title: page.value?.title,
  description: page.value?.description,
})
</script>

<template>
  <div class="container mx-auto px-4 py-16">
    <NuxtLink
      to="/docs"
      class="inline-flex items-center gap-2 text-base-content/70 hover:text-base-content mb-8"
    >
      <Icon name="lucide:arrow-left" />
      Назад к документации
    </NuxtLink>

    <ContentRenderer
      v-if="page"
      :value="page"
      class="prose prose-lg max-w-none"
    />
  </div>
</template>
