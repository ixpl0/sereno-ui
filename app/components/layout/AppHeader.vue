<script setup lang="ts">
import type { UserResponseUser } from '~/api/types.gen'

defineProps<{
  sidebarCollapsed: boolean
}>()

const emit = defineEmits<{
  toggleMobileSidebar: []
}>()

const route = useRoute()

const { data: user } = await useFetch<UserResponseUser>('/api/v1/user')

const userOrNull = computed(() => user.value ?? null)

const pageTitle = computed(() => {
  const meta = route.meta as { title?: string }
  return meta.title ?? 'Главная'
})

const breadcrumbs = computed(() => {
  const crumbs: Array<{ label: string, to?: string }> = []

  if (route.path.startsWith('/settings')) {
    crumbs.push({ label: 'Настройки', to: '/settings' })

    if (route.path === '/settings/sessions') {
      crumbs.push({ label: 'Сессии' })
    }
    else if (route.path === '/settings/contacts') {
      crumbs.push({ label: 'Контакты' })
    }
    else if (route.path === '/settings') {
      crumbs.push({ label: 'Профиль' })
    }
  }

  return crumbs
})
</script>

<template>
  <header
    class="sticky top-0 z-20 flex items-center justify-between h-16 px-4 lg:px-6 bg-base-100/35 backdrop-blur-xl border-b border-base-content/5"
  >
    <div class="flex items-center gap-4">
      <button
        class="lg:hidden p-2 -ml-2 rounded-lg hover:bg-base-content/5 transition-colors"
        @click="emit('toggleMobileSidebar')"
      >
        <Icon
          name="lucide:menu"
          class="w-5 h-5"
        />
      </button>

      <div class="flex items-center gap-2 text-sm">
        <template
          v-for="(crumb, index) in breadcrumbs"
          :key="index"
        >
          <NuxtLink
            v-if="crumb.to && index < breadcrumbs.length - 1"
            :to="crumb.to"
            class="text-base-content/60 hover:text-base-content transition-colors"
          >
            {{ crumb.label }}
          </NuxtLink>
          <span
            v-else
            class="text-base-content font-medium"
          >
            {{ crumb.label }}
          </span>
          <Icon
            v-if="index < breadcrumbs.length - 1"
            name="lucide:chevron-right"
            class="w-4 h-4 text-base-content/40"
          />
        </template>
        <h1
          v-if="breadcrumbs.length === 0"
          class="text-lg font-semibold"
        >
          {{ pageTitle }}
        </h1>
      </div>
    </div>

    <div class="flex items-center gap-3 self-center">
      <LayoutUserDropdown :user="userOrNull" />

      <LayoutThemeSwitcher />
    </div>
  </header>
</template>
