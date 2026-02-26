<script setup lang="ts">
const { resolvedTheme } = useTheme()

useHead({
  htmlAttrs: {
    'data-theme': resolvedTheme,
  },
})
</script>

<template>
  <div
    id="app-root"
    :data-theme="resolvedTheme"
  >
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <CookieConsent />
  </div>
</template>
