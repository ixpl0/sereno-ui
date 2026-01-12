<script setup lang="ts">
interface NavigationItem {
  label: string
  to: string
  icon: string
}

const props = defineProps<{
  collapsed: boolean
  mobileOpen: boolean
}>()

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  'update:mobileOpen': [value: boolean]
}>()

const route = useRoute()

const topNavigationItems: ReadonlyArray<NavigationItem> = [
  { label: 'Дашборд', to: '/dashboard', icon: 'lucide:home' },
  { label: 'Алерты', to: '/alerts', icon: 'lucide:bell' },
  { label: 'Инциденты', to: '/incidents', icon: 'lucide:alert-triangle' },
]

const bottomNavigationItems: ReadonlyArray<NavigationItem> = [
  { label: 'Тенанты', to: '/tenants', icon: 'lucide:building-2' },
  { label: 'Профиль', to: '/profile', icon: 'lucide:user' },
]

const toggleCollapse = () => {
  emit('update:collapsed', !props.collapsed)
}

const closeMobileMenu = () => {
  emit('update:mobileOpen', false)
}

const isActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`)
</script>

<template>
  <aside
    class="fixed top-16 bottom-0 left-0 z-40 flex flex-col bg-base-200 lg:bg-base-200/35 lg:backdrop-blur-xl border-r border-base-content/5 transition-all duration-300"
    :class="[
      collapsed ? 'w-64 lg:w-16' : 'w-64',
      mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <nav class="flex-1 flex flex-col overflow-hidden py-4 px-2">
      <ul class="space-y-1">
        <li
          v-for="item in topNavigationItems"
          :key="item.to"
        >
          <NuxtLink
            :to="item.to"
            class="flex items-center h-10 transition-colors gap-3 px-3"
            :class="[
              collapsed ? 'lg:justify-center lg:w-10 lg:mx-auto lg:gap-0 lg:px-0' : '',
              isActive(item.to)
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-base-content/5 text-base-content/70 hover:text-base-content',
            ]"
            @click="closeMobileMenu"
          >
            <Icon
              :name="item.icon"
              class="w-5 h-5 shrink-0"
            />
            <span
              class="whitespace-nowrap"
              :class="{ 'lg:hidden': collapsed }"
            >
              {{ item.label }}
            </span>
          </NuxtLink>
        </li>
      </ul>

      <div class="flex-1" />

      <ul class="space-y-1">
        <li
          v-for="item in bottomNavigationItems"
          :key="item.to"
        >
          <NuxtLink
            :to="item.to"
            class="flex items-center h-10 transition-colors gap-3 px-3"
            :class="[
              collapsed ? 'lg:justify-center lg:w-10 lg:mx-auto lg:gap-0 lg:px-0' : '',
              isActive(item.to)
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-base-content/5 text-base-content/70 hover:text-base-content',
            ]"
            @click="closeMobileMenu"
          >
            <Icon
              :name="item.icon"
              class="w-5 h-5 shrink-0"
            />
            <span
              class="whitespace-nowrap"
              :class="{ 'lg:hidden': collapsed }"
            >
              {{ item.label }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="p-2 border-t border-base-content/5">
      <button
        class="hidden lg:flex items-center h-10 hover:bg-base-content/5 text-base-content/60 transition-colors"
        :class="collapsed ? 'justify-center w-10 mx-auto' : 'w-full justify-center gap-2 px-3'"
        @click="toggleCollapse"
      >
        <Icon
          :name="collapsed ? 'lucide:chevrons-right' : 'lucide:chevrons-left'"
          class="w-5 h-5"
        />
        <span
          v-if="!collapsed"
          class="text-sm"
        >
          Свернуть
        </span>
      </button>
    </div>
  </aside>

  <div
    v-if="mobileOpen"
    class="fixed top-16 inset-x-0 bottom-0 z-30 bg-black/50 lg:hidden"
    @click="closeMobileMenu"
  />
</template>
