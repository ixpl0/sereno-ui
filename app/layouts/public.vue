<script setup lang="ts">
useSeoMeta({
  titleTemplate: '%s | Sereno',
  ogSiteName: 'Sereno',
  ogType: 'website',
})
</script>

<template>
  <div class="min-h-screen auth-gradient relative overflow-hidden">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -bottom-[60rem] -right-[60rem] w-[85rem] h-[85rem] rounded-full blur-[180px] bg-[var(--glow-1)] transition-colors duration-500" />
      <div class="absolute -bottom-[60rem] -left-[60rem] w-[85rem] h-[85rem] rounded-full blur-[180px] bg-[var(--glow-2)] transition-colors duration-500" />
      <div class="absolute inset-0 opacity-60 noise-overlay" />
    </div>

    <LayoutPublicHeader />

    <main class="relative z-10 min-h-screen pt-16">
      <slot />
    </main>

    <UiToast />
  </div>
</template>
