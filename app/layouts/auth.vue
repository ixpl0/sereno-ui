<script setup lang="ts">
useSeoMeta({
  titleTemplate: '%s | Sereno UI',
  ogSiteName: 'Sereno UI',
  ogType: 'website',
})
</script>

<template>
  <div class="min-h-screen bg-base-100 relative overflow-hidden">
    <LayoutPublicHeader :user="null" />
    <main class="relative z-10 min-h-screen flex items-center justify-center p-4 pt-20">
      <slot />
    </main>
    <UiToast />
  </div>
</template>
