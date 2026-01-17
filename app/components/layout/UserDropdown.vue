<script setup lang="ts">
import type { UserResponseUser } from '~/api/types.gen'

const props = defineProps<{
  user: UserResponseUser | null
}>()

const { logout } = useAuth()
const router = useRouter()
const { resolvedTheme } = useTheme()
const { userDropdownOpen, toggleUserDropdown, closeUserDropdown } = useMobileMenus()

const breakpoints = useBreakpoints({
  lg: 1024,
})
const isLargeScreen = breakpoints.greater('lg')

const userInitials = computed(() => {
  if (!props.user) {
    return '?'
  }
  const first = props.user.first_name?.charAt(0) ?? ''
  const last = props.user.last_name?.charAt(0) ?? ''
  return (first + last).toUpperCase() || '?'
})

const userName = computed(() => {
  if (!props.user) {
    return 'Гость'
  }
  const parts = [props.user.first_name, props.user.last_name].filter(Boolean)
  return parts.join(' ') || 'Пользователь'
})

const handleLogout = async () => {
  closeUserDropdown()
  await logout()
  router.push('/')
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-dropdown')) {
    closeUserDropdown()
  }
}

watch(userDropdownOpen, (open) => {
  if (open && !isLargeScreen.value) {
    document.body.style.overflow = 'hidden'
  }
  else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="relative user-dropdown">
    <button
      v-if="user"
      class="flex items-center gap-2 py-1.5 px-2.5 hover:bg-base-content/5 transition-colors rounded"
      @click="toggleUserDropdown"
    >
      <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        <span class="text-sm font-medium text-primary">{{ userInitials }}</span>
      </div>
      <span class="hidden sm:block text-sm font-medium max-w-32 truncate">
        {{ userName }}
      </span>
      <Icon
        name="lucide:chevron-down"
        class="w-4 h-4 text-base-content/60 transition-transform"
        :class="{ 'rotate-180': userDropdownOpen }"
      />
    </button>

    <NuxtLink
      v-else
      to="/auth"
      class="flex items-center gap-2 py-1.5 px-2.5 hover:bg-base-content/5 transition-colors rounded"
    >
      <div class="w-8 h-8 rounded-full bg-base-content/10 flex items-center justify-center">
        <Icon
          name="lucide:user"
          class="w-4 h-4 text-base-content/60"
        />
      </div>
      <span class="hidden sm:block text-sm font-medium whitespace-nowrap">
        Вход / Регистрация
      </span>
    </NuxtLink>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="userDropdownOpen && user && isLargeScreen"
        class="absolute right-0 mt-2 w-56 bg-base-200 shadow-lg ring-1 ring-base-content/5 py-1 rounded"
      >
        <div class="py-1">
          <NuxtLink
            to="/dashboard"
            class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-base-content/5 transition-colors rounded-sm"
            @click="closeUserDropdown"
          >
            <Icon
              name="lucide:layout-dashboard"
              class="w-4 h-4 text-base-content/60"
            />
            <span>Дашборд</span>
          </NuxtLink>
          <NuxtLink
            to="/profile"
            class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-base-content/5 transition-colors rounded-sm"
            @click="closeUserDropdown"
          >
            <Icon
              name="lucide:user"
              class="w-4 h-4 text-base-content/60"
            />
            <span>Профиль</span>
          </NuxtLink>
        </div>

        <div class="border-t border-base-content/5 py-1">
          <button
            class="flex items-center gap-3 w-full px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors cursor-pointer rounded-sm"
            @click="handleLogout"
          >
            <Icon
              name="lucide:log-out"
              class="w-4 h-4"
            />
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </Transition>

    <Teleport to="body">
      <aside
        v-if="user && !isLargeScreen"
        :data-theme="resolvedTheme"
        class="fixed top-16 bottom-0 right-0 z-40 w-64 flex flex-col bg-base-200 border-l border-base-content/5 transition-all duration-300"
        :class="userDropdownOpen ? 'translate-x-0' : 'translate-x-full'"
      >
        <div class="flex items-center gap-3 p-4 border-b border-base-content/5">
          <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span class="font-medium text-primary">{{ userInitials }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-medium truncate">
              {{ userName }}
            </div>
            <div class="text-sm text-base-content/60 truncate">
              {{ user?.email }}
            </div>
          </div>
        </div>

        <nav class="flex-1 flex flex-col overflow-y-auto py-4 px-2">
          <ul class="space-y-1">
            <li>
              <NuxtLink
                to="/dashboard"
                class="flex items-center h-10 transition-colors gap-3 px-3 rounded-sm hover:bg-base-content/5 text-base-content/70 hover:text-base-content"
                @click="closeUserDropdown"
              >
                <Icon
                  name="lucide:layout-dashboard"
                  class="w-5 h-5 shrink-0"
                />
                <span>Дашборд</span>
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/profile"
                class="flex items-center h-10 transition-colors gap-3 px-3 rounded-sm hover:bg-base-content/5 text-base-content/70 hover:text-base-content"
                @click="closeUserDropdown"
              >
                <Icon
                  name="lucide:user"
                  class="w-5 h-5 shrink-0"
                />
                <span>Профиль</span>
              </NuxtLink>
            </li>
          </ul>

          <div class="flex-1" />

          <div class="border-t border-base-content/10 my-4" />

          <button
            class="flex items-center h-10 transition-colors gap-3 px-3 rounded-sm text-error hover:bg-error/10 cursor-pointer"
            @click="handleLogout"
          >
            <Icon
              name="lucide:log-out"
              class="w-5 h-5 shrink-0"
            />
            <span>Выйти</span>
          </button>
        </nav>
      </aside>

      <div
        v-if="userDropdownOpen && user && !isLargeScreen"
        :data-theme="resolvedTheme"
        class="fixed top-16 inset-x-0 bottom-0 z-30 bg-black/50"
        @click="closeUserDropdown"
      />
    </Teleport>
  </div>
</template>
