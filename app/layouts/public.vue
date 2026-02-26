<script setup lang="ts">
useSeoMeta({
  titleTemplate: '%s | Sereno',
  ogSiteName: 'Sereno',
  ogType: 'website',
})

const { logout } = useAuth()
const { user } = useUser()
const router = useRouter()

const handleLogout = async () => {
  await logout()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-base-100 relative overflow-x-hidden">
    <LayoutPublicHeader
      :user="user"
      @logout="handleLogout"
    />

    <main class="relative z-10 min-h-screen pt-16">
      <slot />
    </main>

    <UiToast />
  </div>
</template>
