<script setup lang="ts">
import type { UserResponseUser } from '~/api/types.gen'

const emit = defineEmits<{
  toggleMobileSidebar: []
}>()

const { data: user } = await useFetch<UserResponseUser>('/api/v1/user')

const userOrNull = computed(() => user.value ?? null)

const publicNavigation = [
  { name: 'Блог', to: '/blog' },
  { name: 'Документация', to: '/docs' },
  { name: 'Цены', to: '/pricing' },
]
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

    <nav class="hidden lg:flex items-center gap-6">
      <NuxtLink
        v-for="item in publicNavigation"
        :key="item.to"
        :to="item.to"
        class="text-sm text-base-content/70 hover:text-base-content transition-colors"
      >
        {{ item.name }}
      </NuxtLink>
    </nav>

    <div class="flex items-center gap-3 self-center">
      <LayoutUserDropdown :user="userOrNull" />

      <LayoutThemeSwitcher />
    </div>
  </header>
</template>
