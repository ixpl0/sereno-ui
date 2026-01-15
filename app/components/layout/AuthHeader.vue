<script setup lang="ts">
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 lg:px-6 bg-base-100/35 backdrop-blur-xl border-b border-base-content/5"
  >
    <NuxtLink
      to="/"
      class="flex items-center gap-3"
    >
      <div class="w-10 h-10 bg-primary flex items-center justify-center shrink-0 rounded-sm">
        <span class="text-primary-content font-bold text-sm">S</span>
      </div>
      <span class="font-bold text-lg whitespace-nowrap">
        Sereno Systems
      </span>
    </NuxtLink>

    <LayoutThemeSwitcher />
  </header>
</template>
