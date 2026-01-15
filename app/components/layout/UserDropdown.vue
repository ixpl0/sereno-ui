<script setup lang="ts">
import type { UserResponseUser } from '~/api/types.gen'

const props = defineProps<{
  user: UserResponseUser | null
}>()

const { logout } = useAuth()
const router = useRouter()

const dropdownOpen = ref(false)

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
  dropdownOpen.value = false
  await logout()
  router.push('/auth')
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-dropdown')) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative user-dropdown">
    <button
      v-if="user"
      class="flex items-center gap-2 p-1.5 hover:bg-base-content/5 transition-colors rounded-sm"
      @click="dropdownOpen = !dropdownOpen"
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
        :class="{ 'rotate-180': dropdownOpen }"
      />
    </button>

    <NuxtLink
      v-else
      to="/auth"
      class="flex items-center gap-2 p-1.5 hover:bg-base-content/5 transition-colors rounded-sm"
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
        v-if="dropdownOpen && user"
        class="absolute right-0 mt-2 w-56 bg-base-200 shadow-lg ring-1 ring-base-content/5 py-1 rounded"
      >
        <div class="py-1">
          <NuxtLink
            to="/dashboard"
            class="flex items-center gap-3 px-4 py-2 text-sm hover:bg-base-content/5 transition-colors rounded-sm"
            @click="closeDropdown"
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
            @click="closeDropdown"
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
  </div>
</template>
