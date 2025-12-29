<script setup lang="ts">
import type { UserResponseUser, UserResponseContactsList, UserResponseSessions, UserRequestContact } from '~/api/types.gen'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Профиль',
})

useSeoMeta({
  title: 'Профиль',
  description: 'Настройки профиля пользователя',
})

const { data: user, status: userStatus, refresh: refreshUser } = await useFetch<UserResponseUser>('/api/v1/user')
const { data: contactsData, status: contactsStatus, refresh: refreshContacts } = await useFetch<UserResponseContactsList>('/api/v1/user/contacts')
const { data: sessionsData, status: sessionsStatus, refresh: refreshSessions } = await useFetch<UserResponseSessions>('/api/v1/user/sessions')

const userLoading = computed(() => userStatus.value === 'pending' && !user.value)
const contactsLoading = computed(() => contactsStatus.value === 'pending' && !contactsData.value)
const sessionsLoading = computed(() => sessionsStatus.value === 'pending' && !sessionsData.value)

const { updateFirstName, updateLastName, updateTimezone, updateLanguage } = useUser()
const { addContact, deleteContact, verifyContact } = useContacts()
const { closeAllSessions } = useSessions()
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

const currentLanguageLabel = computed(() => {
  const code = (user.value as { language?: string } | null)?.language ?? 'ru'
  return languageOptions.find(l => l.value === code)?.label ?? 'Русский'
})

const isAddingContact = ref(false)
const newContactKind = ref<UserRequestContact['kind']>('email')
const newContactValue = ref('')
const verifyingContactId = ref<string | null>(null)
const verificationCode = ref('')

const contactKindOptions = [
  { value: 'email', label: 'Email' },
  { value: 'telegram', label: 'Telegram' },
]

const startAddContact = () => {
  isAddingContact.value = true
  newContactKind.value = 'email'
  newContactValue.value = ''
}

const cancelAddContact = () => {
  isAddingContact.value = false
  newContactKind.value = 'email'
  newContactValue.value = ''
}

const handleAddContact = async () => {
  const rawValue = newContactValue.value.trim()
  if (!rawValue) {
    return
  }

  if (newContactKind.value === 'email' && !isValidEmail(rawValue)) {
    toast.error('Некорректный email')
    return
  }

  if (newContactKind.value === 'telegram' && !isValidTelegram(rawValue)) {
    toast.error('Некорректный Telegram username')
    return
  }

  const value = newContactKind.value === 'telegram' && !rawValue.startsWith('@')
    ? `@${rawValue}`
    : rawValue

  const isDuplicate = contactsData.value?.contacts?.some(
    c => c.value?.toLowerCase() === value.toLowerCase(),
  )

  if (isDuplicate) {
    toast.error('Такой контакт уже существует')
    return
  }

  try {
    await addContact(newContactKind.value, value)
    await refreshContacts()
    toast.success('Контакт добавлен')
    cancelAddContact()
  }
  catch {
    toast.error('Не удалось добавить контакт')
  }
}

const handleDeleteContact = async (id: string) => {
  try {
    await deleteContact(id)
    await refreshContacts()
    toast.success('Контакт удалён')
  }
  catch {
    toast.error('Не удалось удалить контакт')
  }
}

const startVerifyContact = (id: string) => {
  verifyingContactId.value = id
  verificationCode.value = ''
}

const cancelVerifyContact = () => {
  verifyingContactId.value = null
  verificationCode.value = ''
}

const handleVerifyContact = async () => {
  if (!verifyingContactId.value || !verificationCode.value.trim()) {
    return
  }

  const response = await verifyContact(verifyingContactId.value, verificationCode.value.trim())

  if ('error' in response && response.error) {
    toast.error('Неверный код')
    return
  }

  await refreshContacts()
  toast.success('Контакт подтверждён')
  cancelVerifyContact()
}

const formatContactKind = (kind: string | undefined): string => {
  if (kind === 'email') {
    return 'Email'
  }
  if (kind === 'telegram') {
    return 'Telegram'
  }
  return kind ?? ''
}

const currentSession = computed(() =>
  sessionsData.value?.sessions?.find(s => s.current === true),
)

const otherSessions = computed(() =>
  sessionsData.value?.sessions?.filter(s => s.current !== true) ?? [],
)

const handleCloseAllSessions = async () => {
  await closeAllSessions()
  await refreshSessions()
  toast.success('Все сессии закрыты')
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
  <div class="p-4 lg:p-6">
    <div class="max-w-3xl mx-auto">
      <UiCard class="animate-slide-up">
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

        <div class="mt-16 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-12 pb-6 bg-base-200/30">
          <h2 class="text-xl font-semibold text-base-content mb-6">
            Контакты
          </h2>

          <div
            v-if="contactsLoading"
            class="flex justify-center py-8"
          >
            <span class="loading loading-spinner loading-lg" />
          </div>
          <div
            v-else
            class="space-y-4"
          >
            <div
              v-for="contact in contactsData?.contacts"
              :key="contact.id"
              class="flex items-center justify-between p-3 rounded-lg"
              :class="contact.verified ? 'bg-success/10' : 'bg-warning/10'"
            >
              <div class="flex items-center gap-3">
                <div
                  class="badge whitespace-nowrap shrink-0"
                  :class="contact.verified ? 'badge-success' : 'badge-warning'"
                >
                  {{ contact.verified ? 'Подтверждён' : 'Не подтверждён' }}
                </div>
                <div class="min-w-0">
                  <div class="font-medium break-all">
                    {{ contact.value }}
                  </div>
                  <div class="text-sm text-base-content/60">
                    {{ formatContactKind(contact.kind) }}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1 sm:gap-2 shrink-0">
                <template v-if="!contact.verified && verifyingContactId !== contact.id">
                  <UiButton
                    variant="ghost"
                    size="sm"
                    @click="startVerifyContact(contact.id!)"
                  >
                    <Icon
                      name="lucide:check"
                      class="w-4 h-4 sm:hidden"
                    />
                    <span class="hidden sm:inline">Подтвердить</span>
                  </UiButton>
                </template>
                <template v-if="verifyingContactId === contact.id">
                  <UiInput
                    v-model="verificationCode"
                    placeholder="Код"
                    class="w-20 sm:w-24"
                    @keyup.enter="handleVerifyContact"
                    @keyup.escape="cancelVerifyContact"
                  />
                  <UiButton
                    variant="primary"
                    size="sm"
                    @click="handleVerifyContact"
                  >
                    OK
                  </UiButton>
                  <UiButton
                    variant="ghost"
                    size="sm"
                    @click="cancelVerifyContact"
                  >
                    <Icon
                      name="lucide:x"
                      class="w-4 h-4 sm:hidden"
                    />
                    <span class="hidden sm:inline">Отмена</span>
                  </UiButton>
                </template>
                <UiButton
                  v-if="verifyingContactId !== contact.id"
                  variant="ghost"
                  size="sm"
                  @click="handleDeleteContact(contact.id!)"
                >
                  <Icon
                    name="lucide:trash-2"
                    class="w-4 h-4 sm:hidden"
                  />
                  <span class="hidden sm:inline">Удалить</span>
                </UiButton>
              </div>
            </div>

            <div
              v-if="isAddingContact"
              class="p-4 bg-base-200 rounded-lg space-y-3"
            >
              <div class="flex gap-3">
                <div class="w-32 shrink-0">
                  <UiSelect
                    v-model="newContactKind"
                    :options="contactKindOptions"
                  />
                </div>
                <UiInput
                  v-model="newContactValue"
                  :placeholder="newContactKind === 'email' ? 'user@example.com' : '@username'"
                  class="min-w-0 flex-1"
                  @keyup.enter="handleAddContact"
                  @keyup.escape="cancelAddContact"
                />
              </div>
              <div class="flex gap-2 justify-end">
                <UiButton
                  variant="primary"
                  size="sm"
                  @click="handleAddContact"
                >
                  Добавить
                </UiButton>
                <UiButton
                  variant="ghost"
                  size="sm"
                  @click="cancelAddContact"
                >
                  Отмена
                </UiButton>
              </div>
            </div>

            <div
              v-if="!isAddingContact"
              class="text-center"
            >
              <UiButton
                variant="ghost"
                @click="startAddContact"
              >
                + Добавить контакт
              </UiButton>
            </div>
          </div>
        </div>

        <div class="pt-12">
          <h2 class="text-xl font-semibold text-base-content mb-6">
            Сессии
          </h2>
        </div>

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
  </div>
</template>
