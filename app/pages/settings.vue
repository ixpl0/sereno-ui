<script setup lang="ts">
import type { UserResponseUser, UserResponseSessions } from '~/api/types.gen'

definePageMeta({
  middleware: 'auth',
})

useSeoMeta({
  title: 'Настройки',
  description: 'Настройки профиля пользователя',
})

const { data: user, status: userStatus, refresh: refreshUser } = await useFetch<UserResponseUser>('/api/v1/user')
const { data: sessionsData, status: sessionsStatus, refresh: refreshSessions } = await useFetch<UserResponseSessions>('/api/v1/user/sessions')

const userLoading = computed(() => userStatus.value === 'pending' && !user.value)
const sessionsLoading = computed(() => sessionsStatus.value === 'pending' && !sessionsData.value)

const currentSession = computed(() =>
  sessionsData.value?.sessions?.find(s => s.current === true),
)

const otherSessions = computed(() =>
  sessionsData.value?.sessions?.filter(s => s.current !== true) ?? [],
)

const { updateFirstName, updateLastName, updateTimezone, updateLanguage } = useUser()
const { closeAllSessions } = useSessions()
const { logout } = useAuth()
const router = useRouter()
const toast = useToast()

const isEditing = ref<'first_name' | 'last_name' | 'timezone' | 'language' | null>(null)
const editValue = ref('')
const editInputRef = ref<{ focus: () => void, select: () => void } | null>(null)

const timezoneOptions = Intl.supportedValuesOf('timeZone').map(tz => ({
  value: tz,
  label: tz,
}))

const languageOptions = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
]

const startEdit = (field: 'first_name' | 'last_name' | 'timezone' | 'language') => {
  isEditing.value = field
  if (field === 'first_name') {
    editValue.value = user.value?.first_name ?? ''
  }
  else if (field === 'last_name') {
    editValue.value = user.value?.last_name ?? ''
  }
  else if (field === 'timezone') {
    editValue.value = user.value?.timezone ?? 'Europe/Moscow'
  }
  else {
    // TODO: remove type assertion when language field is added to API types
    editValue.value = (user.value as { language?: string } | null)?.language ?? 'ru'
  }

  nextTick(() => {
    if (field === 'first_name' || field === 'last_name') {
      editInputRef.value?.focus()
      editInputRef.value?.select()
    }
  })
}

const cancelEdit = () => {
  isEditing.value = null
  editValue.value = ''
}

const saveEdit = async () => {
  if (!isEditing.value) {
    return
  }

  try {
    if (isEditing.value === 'first_name') {
      await updateFirstName(editValue.value)
    }
    else if (isEditing.value === 'last_name') {
      await updateLastName(editValue.value)
    }
    else if (isEditing.value === 'timezone') {
      await updateTimezone(editValue.value)
    }
    else {
      await updateLanguage(editValue.value)
    }

    await refreshUser()
    toast.success('Сохранено')
    isEditing.value = null
    editValue.value = ''
  }
  catch {
    toast.error('Не удалось сохранить')
  }
}

const handleCloseAllSessions = async () => {
  await closeAllSessions()
  await refreshSessions()
  toast.success('Все сессии закрыты')
}

const handleLogout = async () => {
  await logout()
  router.push('/auth')
}

const formatDevice = (device: string | undefined): string => {
  if (!device) {
    return 'Неизвестное устройство'
  }
  if (device.includes('Windows')) {
    return 'Windows'
  }
  if (device.includes('Mac')) {
    return 'macOS'
  }
  if (device.includes('iPhone')) {
    return 'iPhone'
  }
  if (device.includes('Android')) {
    return 'Android'
  }
  if (device.includes('Linux')) {
    return 'Linux'
  }
  return 'Браузер'
}

const formatDate = (timestamp: number | undefined): string => {
  if (!timestamp) {
    return ''
  }
  return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const currentLanguageLabel = computed(() => {
  const code = (user.value as { language?: string } | null)?.language ?? 'ru'
  return languageOptions.find(l => l.value === code)?.label ?? 'Русский'
})
</script>

<template>
  <main class="min-h-screen p-8">
    <div class="max-w-3xl mx-auto space-y-6">
      <header class="flex justify-between items-center animate-fade-in">
        <h1 class="text-3xl font-bold">
          Настройки
        </h1>
        <div class="flex gap-2">
          <UiButton
            variant="ghost"
            @click="router.push('/dashboard')"
          >
            Назад
          </UiButton>
          <UiButton
            variant="ghost"
            @click="handleLogout"
          >
            Выйти
          </UiButton>
        </div>
      </header>

      <UiCard
        title="Профиль"
        class="animate-slide-up"
      >
        <div
          v-if="userLoading"
          class="flex justify-center py-8"
        >
          <span class="loading loading-spinner loading-lg" />
        </div>
        <div
          v-else
          class="space-y-4"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-base-content/60">
                Имя
              </div>
              <div
                v-if="isEditing !== 'first_name'"
                class="font-medium"
              >
                {{ user?.first_name || '—' }}
              </div>
              <UiInput
                v-else
                ref="editInputRef"
                v-model="editValue"
                class="mt-1"
                @keyup.enter="saveEdit"
                @keyup.escape="cancelEdit"
              />
            </div>
            <div v-if="isEditing !== 'first_name'">
              <UiButton
                variant="ghost"
                size="sm"
                @click="startEdit('first_name')"
              >
                Изменить
              </UiButton>
            </div>
            <div
              v-else
              class="flex gap-2"
            >
              <UiButton
                variant="primary"
                size="sm"
                @click="saveEdit"
              >
                Сохранить
              </UiButton>
              <UiButton
                variant="ghost"
                size="sm"
                @click="cancelEdit"
              >
                Отмена
              </UiButton>
            </div>
          </div>

          <div class="divider my-2" />

          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-base-content/60">
                Фамилия
              </div>
              <div
                v-if="isEditing !== 'last_name'"
                class="font-medium"
              >
                {{ user?.last_name || '—' }}
              </div>
              <UiInput
                v-else
                ref="editInputRef"
                v-model="editValue"
                class="mt-1"
                @keyup.enter="saveEdit"
                @keyup.escape="cancelEdit"
              />
            </div>
            <div v-if="isEditing !== 'last_name'">
              <UiButton
                variant="ghost"
                size="sm"
                @click="startEdit('last_name')"
              >
                Изменить
              </UiButton>
            </div>
            <div
              v-else
              class="flex gap-2"
            >
              <UiButton
                variant="primary"
                size="sm"
                @click="saveEdit"
              >
                Сохранить
              </UiButton>
              <UiButton
                variant="ghost"
                size="sm"
                @click="cancelEdit"
              >
                Отмена
              </UiButton>
            </div>
          </div>

          <div class="divider my-2" />

          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-base-content/60">
                Часовой пояс
              </div>
              <div
                v-if="isEditing !== 'timezone'"
                class="font-medium"
              >
                {{ user?.timezone || 'Europe/Moscow' }}
              </div>
              <UiSelect
                v-else
                v-model="editValue"
                :options="timezoneOptions"
                class="mt-1"
              />
            </div>
            <div v-if="isEditing !== 'timezone'">
              <UiButton
                variant="ghost"
                size="sm"
                @click="startEdit('timezone')"
              >
                Изменить
              </UiButton>
            </div>
            <div
              v-else
              class="flex gap-2"
            >
              <UiButton
                variant="primary"
                size="sm"
                @click="saveEdit"
              >
                Сохранить
              </UiButton>
              <UiButton
                variant="ghost"
                size="sm"
                @click="cancelEdit"
              >
                Отмена
              </UiButton>
            </div>
          </div>

          <div class="divider my-2" />

          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm text-base-content/60">
                Язык
              </div>
              <div
                v-if="isEditing !== 'language'"
                class="font-medium"
              >
                {{ currentLanguageLabel }}
              </div>
              <UiSelect
                v-else
                v-model="editValue"
                :options="languageOptions"
                class="mt-1"
              />
            </div>
            <div v-if="isEditing !== 'language'">
              <UiButton
                variant="ghost"
                size="sm"
                @click="startEdit('language')"
              >
                Изменить
              </UiButton>
            </div>
            <div
              v-else
              class="flex gap-2"
            >
              <UiButton
                variant="primary"
                size="sm"
                @click="saveEdit"
              >
                Сохранить
              </UiButton>
              <UiButton
                variant="ghost"
                size="sm"
                @click="cancelEdit"
              >
                Отмена
              </UiButton>
            </div>
          </div>
        </div>
      </UiCard>

      <UiCard
        title="Активные сессии"
        class="animate-slide-up"
        style="animation-delay: 100ms; animation-fill-mode: backwards"
      >
        <div
          v-if="sessionsLoading"
          class="flex justify-center py-8"
        >
          <span class="loading loading-spinner loading-lg" />
        </div>
        <div
          v-else
          class="space-y-4"
        >
          <div
            v-if="currentSession"
            class="flex items-center justify-between p-3 bg-success/10 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div class="badge badge-success">
                Текущая
              </div>
              <div>
                <div class="font-medium">
                  {{ formatDevice(currentSession.device) }}
                </div>
                <div class="text-sm text-base-content/60">
                  {{ formatDate(currentSession.since) }}
                </div>
              </div>
            </div>
          </div>

          <div
            v-for="session in otherSessions"
            :key="session.id"
            class="flex items-center justify-between p-3 bg-base-200 rounded-lg"
          >
            <div>
              <div class="font-medium">
                {{ formatDevice(session.device) }}
              </div>
              <div class="text-sm text-base-content/60">
                {{ formatDate(session.since) }}
              </div>
            </div>
          </div>

          <div
            v-if="otherSessions.length === 0 && !currentSession"
            class="text-center text-base-content/60 py-4"
          >
            Нет активных сессий
          </div>

          <div
            v-if="otherSessions.length > 0"
            class="pt-4"
          >
            <UiButton
              variant="error"
              class="w-full"
              @click="handleCloseAllSessions"
            >
              Завершить все другие сессии
            </UiButton>
          </div>
        </div>
      </UiCard>
    </div>
  </main>
</template>
