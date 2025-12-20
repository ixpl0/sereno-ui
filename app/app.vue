<script setup lang="ts">
const theme = ref<'light' | 'dark'>('dark')

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.altKey && event.shiftKey && event.key === 'Enter') {
    event.preventDefault()
    toggleTheme()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div :data-theme="theme">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
