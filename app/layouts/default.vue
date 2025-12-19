<script setup lang="ts">
useSeoMeta({
  titleTemplate: '%s | Sereno UI',
  ogSiteName: 'Sereno UI',
  ogType: 'website',
})
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <slot />
  </div>
</template>
