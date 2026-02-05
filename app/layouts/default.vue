<script setup lang="ts">
useSeoMeta({
  titleTemplate: '%s | Sereno UI',
  ogSiteName: 'Sereno UI',
  ogType: 'website',
})

const { logout } = useAuth()
const { user } = useUser()
const router = useRouter()

const sidebarCollapsedCookie = useCookie<boolean>('sidebar_collapsed', {
  default: () => false,
  sameSite: 'lax',
})
const sidebarCollapsed = ref(sidebarCollapsedCookie.value)
const { sidebarOpen, toggleSidebar, closeSidebar } = useMobileMenus()

const breakpoints = useBreakpoints({
  lg: 1024,
})
const isLargeScreen = breakpoints.greater('lg')

watch(sidebarCollapsed, (collapsed) => {
  if (isLargeScreen.value) {
    sidebarCollapsedCookie.value = collapsed
  }
})

watch(isLargeScreen, (large) => {
  if (!large) {
    sidebarCollapsed.value = true
  }
  else {
    sidebarCollapsed.value = sidebarCollapsedCookie.value
  }
})

const handleLogout = async () => {
  await logout()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen auth-gradient relative overflow-x-hidden">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -bottom-[60rem] -right-[60rem] w-[85rem] h-[85rem] rounded-full blur-[180px] bg-[var(--glow-1)] transition-colors duration-500" />
      <div class="absolute -bottom-[60rem] -left-[60rem] w-[85rem] h-[85rem] rounded-full blur-[180px] bg-[var(--glow-2)] transition-colors duration-500" />
      <div class="absolute inset-0 opacity-60 noise-overlay" />
    </div>

    <div class="relative z-10 min-h-screen flex flex-col pt-16">
      <LayoutAppHeader
        :user="user"
        @toggle-mobile-sidebar="toggleSidebar"
        @logout="handleLogout"
      />

      <div class="flex-1 flex">
        <LayoutAppSidebar
          v-model:collapsed="sidebarCollapsed"
          :mobile-open="sidebarOpen"
          @update:mobile-open="closeSidebar"
        />

        <main
          class="flex-1 overflow-y-auto transition-all duration-300"
          :class="sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'"
        >
          <slot />
        </main>
      </div>
    </div>

    <UiToast />
  </div>
</template>
