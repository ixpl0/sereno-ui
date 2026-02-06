<script setup lang="ts">
import type { UserRequestContact } from '~/api/types.gen'
import { formatDate, formatDevice, formatContactKind } from '~/utils/formatters'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Профиль',
})

useSeoMeta({
  title: 'Профиль',
  description: 'Настройки профиля пользователя',
})

const { user, loading: userLoading, updateFirstName, updateLastName, updateTimezone, updateLanguage } = useUser()
const { contacts, loading: contactsLoading, addContact, deleteContact, verifyContact } = useContacts()
const { currentSession, otherSessions, loading: sessionsLoading, closeAllSessions } = useSessions()
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
    editValue.value = (user.value as Record<string, string> | null)?.language ?? 'ru'
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

    toast.success('Сохранено')
    isEditing.value = null
    editValue.value = ''
  }
  catch {
    toast.error('Не удалось сохранить')
  }
}

const currentLanguageLabel = computed(() => {
  const code = (user.value as Record<string, string> | null)?.language ?? 'ru'
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

  const isDuplicate = contacts.value.some(
    c => c.value?.toLowerCase() === value.toLowerCase(),
  )

  if (isDuplicate) {
    toast.error('Такой контакт уже существует')
    return
  }

  try {
    await addContact(newContactKind.value, value)
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

  toast.success('Контакт подтверждён')
  cancelVerifyContact()
}

const handleCloseAllSessions = async () => {
  try {
    await closeAllSessions()
    toast.success('Все сессии закрыты')
  }
  catch {
    toast.error('Не удалось закрыть сессии')
  }
}
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-5xl mx-auto">
      <UiCard class="animate-slide-up mb-3">
        <h2 class="text-lg font-medium mb-4">
          Личные данные
        </h2>
        <div
          v-if="userLoading"
          class="flex justify-center py-8"
        >
          <span class="loading loading-spinner loading-lg" />
        </div>
        <div
          v-else
          class="space-y-3"
        >
          <div class="flex items-center justify-between p-3 bg-base-200/50 rounded">
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

          <div class="flex items-center justify-between p-3 bg-base-200/50 rounded">
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

          <div class="flex items-center justify-between p-3 bg-base-200/50 rounded">
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

          <div class="flex items-center justify-between p-3 bg-base-200/50 rounded">
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

      <UiCard class="animate-slide-up mb-3">
        <h2 class="text-lg font-medium mb-4">
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
          class="space-y-3"
        >
          <div
            v-for="contact in contacts"
            :key="contact.id"
            class="flex items-center justify-between p-3 rounded"
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
                  v-if="contact.id"
                  variant="ghost"
                  size="sm"
                  aria-label="Подтвердить контакт"
                  @click="startVerifyContact(contact.id)"
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
                  aria-label="Отменить подтверждение"
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
                v-if="contact.id && verifyingContactId !== contact.id"
                variant="ghost"
                size="sm"
                aria-label="Удалить контакт"
                @click="handleDeleteContact(contact.id)"
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
            class="p-4 bg-base-200 space-y-3 rounded"
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
      </UiCard>

      <UiCard class="animate-slide-up">
        <h2 class="text-lg font-medium mb-4">
          Сессии
        </h2>

        <div
          v-if="sessionsLoading"
          class="flex justify-center py-8"
        >
          <span class="loading loading-spinner loading-lg" />
        </div>
        <div
          v-else
          class="space-y-3"
        >
          <div
            v-if="currentSession"
            class="flex items-center justify-between p-3 bg-success/10 rounded"
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
            class="flex items-center justify-between p-3 bg-base-200/50 rounded"
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
