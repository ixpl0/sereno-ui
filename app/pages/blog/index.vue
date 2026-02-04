<script setup lang="ts">
definePageMeta({
  layout: 'public',
})

const { data: posts } = await useAsyncData('blog-posts', () => {
  return queryCollection('content')
    .where('path', 'LIKE', '/blog/%')
    .all()
})

useSeoMeta({
  title: 'Блог',
  description: 'Новости и статьи о Sereno',
})
</script>

<template>
  <div class="container mx-auto px-4 py-16">
    <h1 class="text-5xl font-normal mb-8">
      Блог
    </h1>

    <div
      v-if="posts?.length"
      class="grid gap-6"
    >
      <NuxtLink
        v-for="post in posts"
        :key="post.path"
        :to="post.path"
        class="block p-6 bg-base-200/50 hover:bg-base-200 transition-colors rounded"
      >
        <h2 class="text-xl font-semibold mb-2">
          {{ post.title }}
        </h2>
        <p
          v-if="post.description"
          class="text-base-content/70"
        >
          {{ post.description }}
        </p>
      </NuxtLink>
    </div>

    <p
      v-else
      class="text-base-content/60"
    >
      Пока нет статей
    </p>
  </div>
</template>
