<script setup lang="ts">
import type { UserResponseUser } from '~/api/types.gen'

const { data: user } = await useFetch<UserResponseUser>('/api/v1/user', {
  server: false,
  lazy: true,
})

const userOrNull = computed(() => user.value ?? null)

const mobileMenuOpen = ref(false)

const navigation = [
  { name: 'Документация', to: '/docs', icon: 'lucide:book-open' },
  { name: 'Блог', to: '/blog', icon: 'lucide:newspaper' },
  { name: 'Цены', to: '/pricing', icon: 'lucide:credit-card' },
  { name: 'О компании', to: '/about', icon: 'lucide:building-2' },
]

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 lg:px-6 bg-base-100/35 backdrop-blur-xl border-b border-base-content/5"
  >
    <div class="flex items-center gap-4">
      <button
        class="lg:hidden p-2 -ml-2 hover:bg-base-content/5 transition-colors rounded-sm"
        @click="toggleMobileMenu"
      >
        <Icon
          :name="mobileMenuOpen ? 'lucide:x' : 'lucide:menu'"
          class="w-5 h-5"
        />
      </button>

      <NuxtLink
        to="/"
        class="flex items-center gap-3"
      >
        <div class="w-10 h-10 bg-primary flex items-center justify-center shrink-0 rounded-sm">
          <span class="text-primary-content font-bold text-sm">S</span>
        </div>
        <span class="font-bold text-lg whitespace-nowrap hidden sm:block">
          Sereno Systems
        </span>
      </NuxtLink>
    </div>

    <nav class="hidden lg:flex items-center gap-6">
      <NuxtLink
        v-for="item in navigation"
        :key="item.to"
        :to="item.to"
        class="text-sm text-base-content/70 hover:text-base-content transition-colors"
      >
        {{ item.name }}
      </NuxtLink>
    </nav>

    <div class="flex items-center gap-3">
      <LayoutUserDropdown :user="userOrNull" />

      <LayoutThemeSwitcher />
    </div>
  </header>

  <aside
    class="fixed top-16 bottom-0 left-0 z-40 w-64 flex flex-col bg-base-200 border-r border-base-content/5 transition-transform duration-300 lg:hidden"
    :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <nav class="flex-1 flex flex-col overflow-y-auto py-4 px-2">
      <ul class="space-y-1">
        <li>
          <NuxtLink
            to="/"
            class="flex items-center h-10 px-3 gap-3 hover:bg-base-content/5 text-base-content/70 hover:text-base-content transition-colors rounded-sm"
            @click="closeMobileMenu"
          >
            <Icon
              name="lucide:home"
              class="w-5 h-5 shrink-0"
            />
            <span>Главная</span>
          </NuxtLink>
        </li>
        <li
          v-for="item in navigation"
          :key="item.to"
        >
          <NuxtLink
            :to="item.to"
            class="flex items-center h-10 px-3 gap-3 hover:bg-base-content/5 text-base-content/70 hover:text-base-content transition-colors rounded-sm"
            @click="closeMobileMenu"
          >
            <Icon
              :name="item.icon"
              class="w-5 h-5 shrink-0"
            />
            <span>{{ item.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>

  <div
    v-if="mobileMenuOpen"
    class="fixed top-16 inset-x-0 bottom-0 z-30 bg-black/50 lg:hidden"
    @click="closeMobileMenu"
  />
</template>
