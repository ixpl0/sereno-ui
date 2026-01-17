<script setup lang="ts">
const { resolvedTheme } = useTheme()
</script>

<template>
  <div :data-theme="resolvedTheme">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <CookieConsent />
  </div>
</template>
