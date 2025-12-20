<script setup lang="ts">
const { isAuthenticated } = useAuth()

await navigateTo(isAuthenticated.value ? '/dashboard' : '/auth', { replace: true })
</script>

<template>
  <div />
</template>
