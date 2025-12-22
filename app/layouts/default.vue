<script setup lang="ts">
useSeoMeta({
  titleTemplate: '%s | Sereno UI',
  ogSiteName: 'Sereno UI',
  ogType: 'website',
})
</script>

<template>
  <div class="min-h-screen auth-gradient relative overflow-hidden">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -bottom-[60rem] -right-[60rem] w-[85rem] h-[85rem] rounded-full blur-[180px] bg-[var(--glow-1)] transition-colors duration-500" />
      <div class="absolute -bottom-[60rem] -left-[60rem] w-[85rem] h-[85rem] rounded-full blur-[180px] bg-[var(--glow-2)] transition-colors duration-500" />
      <div class="absolute top-1/2 -left-[40rem] w-[60rem] h-[60rem] rounded-full blur-[180px] bg-[var(--glow-3)] transition-colors duration-500" />
      <div class="absolute -bottom-[40rem] right-1/4 w-[50rem] h-[50rem] rounded-full blur-[150px] bg-[var(--glow-4)] transition-colors duration-500" />
      <div class="absolute inset-0 opacity-60 noise-overlay" />
    </div>
    <div class="relative z-10 min-h-screen">
      <slot />
    </div>
    <UiToast />
  </div>
</template>
