<script setup lang="ts">
import type { UserResponseUser } from '~/api/types.gen'

definePageMeta({
  middleware: 'auth',
  layout: 'settings',
  title: 'Профиль',
})

useSeoMeta({
  title: 'Профиль',
  description: 'Настройки профиля пользователя',
})

const { data: user, status: userStatus, refresh: refreshUser } = await useFetch<UserResponseUser>('/api/v1/user')

const userLoading = computed(() => userStatus.value === 'pending' && !user.value)

const { updateFirstName, updateLastName, updateTimezone, updateLanguage } = useUser()
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
</script>

<template>
  <div class="space-y-6">
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
    </UiCard>
  </div>
</template>
