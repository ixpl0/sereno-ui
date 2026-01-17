<script setup lang="ts">
import type { UserResponseUser } from '~/api/types.gen'

useSeoMeta({
  titleTemplate: '%s | Sereno UI',
  ogSiteName: 'Sereno UI',
  ogType: 'website',
})

const { logout } = useAuth()
const router = useRouter()

const { data: user } = await useFetch<UserResponseUser>('/api/v1/user')
const userOrNull = computed(() => user.value ?? null)

const sidebarCollapsed = ref(false)
const { sidebarOpen, toggleSidebar, closeSidebar } = useMobileMenus()

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
        :user="userOrNull"
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
