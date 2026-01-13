<script setup lang="ts">
const props = defineProps<{
  title?: string
  subtitle?: string
  primaryAction?: string
  primaryLink?: string
  secondaryAction?: string
  secondaryLink?: string
}>()

const titleParts = computed(() => {
  if (!props.title) {
    return { first: '', rest: '' }
  }
  const words = props.title.split(' ')
  return {
    first: words[0] ?? '',
    rest: words.slice(1).join(' '),
  }
})
</script>

<template>
  <section class="min-h-[70vh] flex flex-col items-center justify-center text-center py-16 px-4">
    <h1 class="inline-block text-5xl lg:text-7xl mb-4 bg-gradient-to-r from-primary via-primary/80 to-[oklch(0.73_0.14_349.95)] bg-clip-text text-transparent leading-normal">
      <span class="font-bold">{{ titleParts.first }}</span>{{ ' ' }}<span
        v-if="titleParts.rest"
        class="font-normal"
      >{{ titleParts.rest }}</span>
    </h1>
    <p
      v-if="subtitle"
      class="text-xl lg:text-2xl text-base-content/70 max-w-2xl mx-auto mb-10"
    >
      {{ subtitle }}
    </p>
    <div class="flex flex-wrap justify-center gap-4">
      <NuxtLink
        v-if="primaryAction"
        :to="primaryLink || '/auth'"
        class="btn btn-primary btn-lg"
      >
        {{ primaryAction }}
      </NuxtLink>
      <NuxtLink
        v-if="secondaryAction"
        :to="secondaryLink || '/docs'"
        class="btn btn-ghost btn-lg"
      >
        {{ secondaryAction }}
      </NuxtLink>
    </div>
    <div class="mt-8">
      <slot />
    </div>
  </section>
</template>
