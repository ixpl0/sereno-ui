<script setup lang="ts">
useSeoMeta({
  titleTemplate: '%s | Настройки | Sereno UI',
  ogSiteName: 'Sereno UI',
  ogType: 'website',
})

const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)

const breakpoints = useBreakpoints({
  lg: 1024,
})
const isLargeScreen = breakpoints.greater('lg')

watch(isLargeScreen, (large) => {
  if (!large) {
    sidebarCollapsed.value = true
  }
})

onMounted(() => {
  if (!isLargeScreen.value) {
    sidebarCollapsed.value = true
  }
})

const toggleMobileSidebar = () => {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}
</script>

<template>
  <div class="min-h-screen auth-gradient relative overflow-hidden">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -bottom-[60rem] -right-[60rem] w-[85rem] h-[85rem] rounded-full blur-[180px] bg-[var(--glow-1)] transition-colors duration-500" />
      <div class="absolute -bottom-[60rem] -left-[60rem] w-[85rem] h-[85rem] rounded-full blur-[180px] bg-[var(--glow-2)] transition-colors duration-500" />
      <div class="absolute inset-0 opacity-60 noise-overlay" />
    </div>

    <div class="relative z-10 min-h-screen flex">
      <LayoutAppSidebar
        v-model:collapsed="sidebarCollapsed"
        v-model:mobile-open="mobileSidebarOpen"
      />

      <div
        class="flex-1 flex flex-col transition-all duration-300"
        :class="sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'"
      >
        <LayoutAppHeader
          :sidebar-collapsed="sidebarCollapsed"
          @toggle-mobile-sidebar="toggleMobileSidebar"
        />

        <main class="flex-1 p-4 lg:p-6">
          <div class="max-w-3xl mx-auto">
            <slot />
          </div>
        </main>
      </div>
    </div>

    <UiToast />
  </div>
</template>
