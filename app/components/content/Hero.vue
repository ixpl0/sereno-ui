<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  primaryAction?: string
  primaryLink?: string
  secondaryAction?: string
  secondaryLink?: string
}>()
</script>

<template>
  <section class="min-h-[70vh] flex flex-col items-center justify-center text-center py-16 px-4">
    <div
      class="mb-16"
      role="img"
      aria-label="Sereno Systems"
    >
      <LayoutAppLogoVertical
        aria-hidden="true"
        class="h-40 lg:h-52 w-auto block text-base-content"
      />
    </div>
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
