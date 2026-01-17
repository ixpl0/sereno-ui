<script setup lang="ts">
import type { UserResponseUser } from '~/api/types.gen'

defineProps<{
  user: UserResponseUser | null
}>()

const emit = defineEmits<{
  logout: []
}>()

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
  <LayoutBaseHeader
    :user="user"
    logo-link="/"
    @toggle-mobile-menu="toggleMobileMenu"
    @logout="emit('logout')"
  >
    <template #menu-icon>
      <Icon
        :name="mobileMenuOpen ? 'lucide:x' : 'lucide:menu'"
        class="w-5 h-5"
      />
    </template>

    <template #navigation>
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
    </template>
  </LayoutBaseHeader>

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
