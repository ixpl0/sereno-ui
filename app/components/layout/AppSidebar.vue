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

const isSettingsPage = computed(() => route.path.startsWith('/settings'))

const mainNavigationItems: NavigationItem[] = [
  { label: 'Главная', to: '/dashboard', icon: 'lucide:home' },
]

const settingsNavigationItems: NavigationItem[] = [
  { label: 'Профиль', to: '/settings', icon: 'lucide:user' },
  { label: 'Сессии', to: '/settings/sessions', icon: 'lucide:monitor-smartphone' },
  { label: 'Контакты', to: '/settings/contacts', icon: 'lucide:mail' },
]

const navigationItems = computed(() =>
  isSettingsPage.value ? settingsNavigationItems : mainNavigationItems,
)

const toggleCollapse = () => {
  emit('update:collapsed', !props.collapsed)
}

const closeMobileMenu = () => {
  emit('update:mobileOpen', false)
}

const isActive = (path: string) => route.path === path
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex flex-col bg-base-200/35 backdrop-blur-xl border-r border-base-content/5 transition-all duration-300"
    :class="[
      collapsed ? 'w-16' : 'w-64',
      mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
    ]"
  >
    <div class="flex items-center h-16 px-4 border-b border-base-content/5">
      <NuxtLink
        v-if="!isSettingsPage"
        to="/dashboard"
        class="flex items-center gap-3 overflow-hidden"
        @click="closeMobileMenu"
      >
        <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <span class="text-primary-content font-bold text-sm">S</span>
        </div>
        <span
          v-if="!collapsed"
          class="font-bold text-lg whitespace-nowrap"
        >
          Sereno
        </span>
      </NuxtLink>

      <NuxtLink
        v-else
        to="/dashboard"
        class="flex items-center gap-3 overflow-hidden group"
        @click="closeMobileMenu"
      >
        <div class="w-8 h-8 rounded-lg bg-base-content/10 group-hover:bg-base-content/20 flex items-center justify-center shrink-0 transition-colors">
          <Icon
            name="lucide:arrow-left"
            class="w-5 h-5 text-base-content/70"
          />
        </div>
        <span
          v-if="!collapsed"
          class="font-semibold whitespace-nowrap"
        >
          Настройки
        </span>
      </NuxtLink>
    </div>

    <nav class="flex-1 overflow-hidden py-4 px-2">
      <ul class="space-y-1">
        <li
          v-for="item in navigationItems"
          :key="item.to"
        >
          <NuxtLink
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
            :class="[
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
              v-if="!collapsed"
              class="whitespace-nowrap"
            >
              {{ item.label }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <div class="p-2 border-t border-base-content/5">
      <button
        class="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-base-content/5 text-base-content/60 transition-colors"
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
    class="fixed inset-0 z-30 bg-black/50 lg:hidden"
    @click="closeMobileMenu"
  />
</template>
