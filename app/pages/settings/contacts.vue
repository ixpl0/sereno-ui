<script setup lang="ts">
import type { UserResponseContactsList, UserRequestContact } from '~/api/types.gen'

definePageMeta({
  middleware: 'auth',
  layout: 'settings',
  title: 'Контакты',
})

useSeoMeta({
  title: 'Контакты для уведомлений',
  description: 'Управление контактами для уведомлений',
})

const { data: contactsData, status: contactsStatus, refresh: refreshContacts } = await useFetch<UserResponseContactsList>('/api/v1/user/contacts')

const contactsLoading = computed(() => contactsStatus.value === 'pending' && !contactsData.value)

const { addContact, deleteContact, verifyContact } = useContacts()
const toast = useToast()

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
</script>

<template>
  <div class="space-y-6">
    <UiCard class="animate-slide-up">
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
              class="badge"
              :class="contact.verified ? 'badge-success' : 'badge-warning'"
            >
              {{ contact.verified ? 'Подтверждён' : 'Не подтверждён' }}
            </div>
            <div>
              <div class="font-medium">
                {{ contact.value }}
              </div>
              <div class="text-sm text-base-content/60">
                {{ formatContactKind(contact.kind) }}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <template v-if="!contact.verified && verifyingContactId !== contact.id">
              <UiButton
                variant="ghost"
                size="sm"
                @click="startVerifyContact(contact.id!)"
              >
                Подтвердить
              </UiButton>
            </template>
            <template v-if="verifyingContactId === contact.id">
              <UiInput
                v-model="verificationCode"
                placeholder="Код"
                class="w-24"
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
                Отмена
              </UiButton>
            </template>
            <UiButton
              v-if="verifyingContactId !== contact.id"
              variant="ghost"
              size="sm"
              @click="handleDeleteContact(contact.id!)"
            >
              Удалить
            </UiButton>
          </div>
        </div>

        <div
          v-if="!contactsData?.contacts?.length && !isAddingContact"
          class="text-center text-base-content/60 py-4"
        >
          Нет контактов
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
          class="pt-2"
        >
          <UiButton
            variant="ghost"
            class="w-full"
            @click="startAddContact"
          >
            + Добавить контакт
          </UiButton>
        </div>
      </div>
    </UiCard>
  </div>
</template>
