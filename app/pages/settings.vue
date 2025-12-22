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

const userLoading = computed(() => userStatus.value === 'pending')
const sessionsLoading = computed(() => sessionsStatus.value === 'pending')

const currentSession = computed(() =>
  sessionsData.value?.sessions?.find(s => s.current === true),
)

const otherSessions = computed(() =>
  sessionsData.value?.sessions?.filter(s => s.current !== true) ?? [],
)

const { updateFirstName, updateLastName, updateTimezone } = useUser()
const { closeAllSessions } = useSessions()
const { logout } = useAuth()
const router = useRouter()
const toast = useToast()

const isEditing = ref<'first_name' | 'last_name' | 'timezone' | null>(null)
const editValue = ref('')
const editInputRef = ref<{ focus: () => void, select: () => void } | null>(null)
const editSelectRef = ref<HTMLSelectElement | null>(null)

const timezones = [
  'Europe/Moscow',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Shanghai',
]

const startEdit = (field: 'first_name' | 'last_name' | 'timezone') => {
  isEditing.value = field
  if (field === 'first_name') {
    editValue.value = user.value?.first_name ?? ''
  }
  else if (field === 'last_name') {
    editValue.value = user.value?.last_name ?? ''
  }
  else {
    editValue.value = user.value?.timezone ?? 'Europe/Moscow'
  }

  nextTick(() => {
    if (field === 'timezone') {
      editSelectRef.value?.focus()
    }
    else if (editInputRef.value) {
      editInputRef.value.focus()
      editInputRef.value.select()
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

  if (isEditing.value === 'first_name') {
    await updateFirstName(editValue.value)
  }
  else if (isEditing.value === 'last_name') {
    await updateLastName(editValue.value)
  }
  else {
    await updateTimezone(editValue.value)
  }

  await refreshUser()
  toast.success('Сохранено')
  isEditing.value = null
  editValue.value = ''
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
</script>

<template>
  <main class="min-h-screen bg-base-200 p-8">
    <div class="max-w-3xl mx-auto space-y-6">
      <header class="flex justify-between items-center">
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

      <UiCard title="Профиль">
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
              <select
                v-else
                ref="editSelectRef"
                v-model="editValue"
                class="select select-bordered mt-1"
              >
                <option
                  v-for="tz in timezones"
                  :key="tz"
                  :value="tz"
                >
                  {{ tz }}
                </option>
              </select>
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
        </div>
      </UiCard>

      <UiCard title="Активные сессии">
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
