<script setup lang="ts">
import type { UserResponseUser } from '~/api/types.gen'

const emit = defineEmits<{
  toggleMobileSidebar: []
}>()

const { data: user } = await useFetch<UserResponseUser>('/api/v1/user')

const userOrNull = computed(() => user.value ?? null)
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 lg:px-6 bg-base-100/35 backdrop-blur-xl border-b border-base-content/5"
  >
    <div class="flex items-center gap-4">
      <button
        class="lg:hidden p-2 -ml-2 hover:bg-base-content/5 transition-colors"
        @click="emit('toggleMobileSidebar')"
      >
        <Icon
          name="lucide:menu"
          class="w-5 h-5"
        />
      </button>

      <NuxtLink
        to="/dashboard"
        class="flex items-center gap-3"
      >
        <div class="w-10 h-10 bg-primary flex items-center justify-center shrink-0">
          <span class="text-primary-content font-bold text-sm">S</span>
        </div>
        <span class="font-bold text-lg whitespace-nowrap hidden sm:block">
          Sereno Systems
        </span>
      </NuxtLink>
    </div>

    <div class="flex items-center gap-3 self-center">
      <LayoutUserDropdown :user="userOrNull" />

      <LayoutThemeSwitcher />
    </div>
  </header>
</template>
