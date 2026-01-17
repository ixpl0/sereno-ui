<script setup lang="ts">
import type { UserResponseUser } from '~/api/types.gen'

interface Props {
  user: UserResponseUser | null
  logoLink?: string
}

const props = withDefaults(defineProps<Props>(), {
  logoLink: '/',
})

const emit = defineEmits<{
  toggleMobileMenu: []
  logout: []
}>()
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 lg:px-6 bg-base-100/35 backdrop-blur-xl border-b border-base-content/5"
  >
    <div class="flex items-center gap-4">
      <button
        class="lg:hidden p-2 -ml-2 hover:bg-base-content/5 transition-colors rounded-sm"
        aria-label="Открыть меню"
        @click="emit('toggleMobileMenu')"
      >
        <slot name="menu-icon">
          <Icon
            name="lucide:menu"
            class="w-5 h-5"
            aria-hidden="true"
          />
        </slot>
      </button>

      <NuxtLink
        :to="props.logoLink"
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

    <slot name="navigation" />

    <div class="flex items-center gap-3">
      <LayoutUserDropdown
        :user="props.user"
        @logout="emit('logout')"
      />

      <LayoutThemeSwitcher />
    </div>
  </header>
</template>
