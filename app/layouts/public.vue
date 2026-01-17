<script setup lang="ts">
import type { UserResponseUser } from '~/api/types.gen'

useSeoMeta({
  titleTemplate: '%s | Sereno',
  ogSiteName: 'Sereno',
  ogType: 'website',
})

const { logout } = useAuth()
const router = useRouter()

const { data: user } = await useFetch<UserResponseUser>('/api/v1/user')
const userOrNull = computed(() => user.value ?? null)

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

    <LayoutPublicHeader
      :user="userOrNull"
      @logout="handleLogout"
    />

    <main class="relative z-10 min-h-screen pt-16">
      <slot />
    </main>

    <UiToast />
  </div>
</template>
