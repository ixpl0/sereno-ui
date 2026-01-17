<script setup lang="ts">
import type { UserResponseUser } from '~/api/types.gen'

defineProps<{
  user: UserResponseUser | null
}>()

const emit = defineEmits<{
  toggleMobileSidebar: []
  logout: []
}>()
</script>

<template>
  <LayoutBaseHeader
    :user="user"
    logo-link="/dashboard"
    @toggle-mobile-menu="emit('toggleMobileSidebar')"
    @logout="emit('logout')"
  />
</template>
