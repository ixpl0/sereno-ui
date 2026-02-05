<script setup lang="ts">
import { formatDate } from '~/utils/formatters'

const route = useRoute()
const tenantId = computed(() => route.params.id as string)

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Команда',
})

useSeoMeta({
  title: 'Команда',
  description: 'Настройки команды',
})

const { tenants, updateTenant } = useTenants()
const { members, loading: membersLoading, updateMember, deleteMember } = useTenantMembers(tenantId)
const { tokens, loading: tokensLoading, createToken, deleteToken } = useTenantTokens(tenantId)
const toast = useToast()

const tenant = computed(() => tenants.value.find(t => t.id === tenantId.value))
const isAdmin = computed(() => tenant.value?.role === 'admin')

const isEditingName = ref(false)
const editNameValue = ref('')
const editNameInputRef = ref<{ focus: () => void, select: () => void } | null>(null)

const startEditName = () => {
  isEditingName.value = true
  editNameValue.value = tenant.value?.name ?? ''
  nextTick(() => {
    editNameInputRef.value?.focus()
    editNameInputRef.value?.select()
  })
}

const cancelEditName = () => {
  isEditingName.value = false
  editNameValue.value = ''
}

const saveEditName = async () => {
  const name = editNameValue.value.trim()
  if (!name) {
    return
  }

  const response = await updateTenant(tenantId.value, name)

  if ('error' in response && response.error) {
    toast.error('Не удалось сохранить')
    return
  }

  toast.success('Сохранено')
  cancelEditName()
}

const isAddingMember = ref(false)
const newMemberId = ref('')
const newMemberRole = ref<'watcher' | 'member' | 'admin'>('member')
const newMemberInputRef = ref<{ focus: () => void } | null>(null)

const startAddMember = () => {
  isAddingMember.value = true
  newMemberId.value = ''
  newMemberRole.value = 'member'
  nextTick(() => {
    newMemberInputRef.value?.focus()
  })
}

const cancelAddMember = () => {
  isAddingMember.value = false
  newMemberId.value = ''
  newMemberRole.value = 'member'
}

const handleAddMember = async () => {
  const memberId = newMemberId.value.trim()
  if (!memberId) {
    return
  }

  const response = await updateMember(memberId, newMemberRole.value)

  if ('error' in response && response.error) {
    toast.error('Не удалось добавить участника')
    return
  }

  toast.success('Участник добавлен')
  cancelAddMember()
}

const handleToggleMemberRole = async (memberId: string, currentRole: string) => {
  const newRole = currentRole === 'admin' ? 'member' : 'admin'
  const response = await updateMember(memberId, newRole)

  if ('error' in response && response.error) {
    toast.error('Не удалось изменить права')
    return
  }

  toast.success('Права изменены')
}

const handleDeleteMember = async (memberId: string) => {
  const response = await deleteMember(memberId)

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить участника')
    return
  }

  toast.success('Участник удалён')
}

const isCreatingToken = ref(false)
const newTokenName = ref('')
const newTokenInputRef = ref<{ focus: () => void } | null>(null)
const createdTokenValue = ref<string | null>(null)

const startCreateToken = () => {
  isCreatingToken.value = true
  newTokenName.value = ''
  createdTokenValue.value = null
  nextTick(() => {
    newTokenInputRef.value?.focus()
  })
}

const cancelCreateToken = () => {
  isCreatingToken.value = false
  newTokenName.value = ''
  createdTokenValue.value = null
}

const handleCreateToken = async () => {
  const name = newTokenName.value.trim()
  if (!name) {
    return
  }

  const response = await createToken(name)

  if ('error' in response && response.error) {
    toast.error('Не удалось создать токен')
    return
  }

  const tokenValue = 'data' in response && response.data?.token?.value
  if (tokenValue) {
    createdTokenValue.value = tokenValue
    toast.success('Токен создан. Скопируйте его сейчас — он больше не будет показан.')
  }
  else {
    toast.success('Токен создан')
    cancelCreateToken()
  }
}

const handleCopyToken = async () => {
  if (!createdTokenValue.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(createdTokenValue.value)
    toast.success('Токен скопирован')
  }
  catch {
    toast.error('Не удалось скопировать токен')
  }
  cancelCreateToken()
}

const handleDeleteToken = async (tokenId: string) => {
  const response = await deleteToken(tokenId)

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить токен')
    return
  }

  toast.success('Токен удалён')
}
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-5xl mx-auto">
      <div class="mb-4">
        <NuxtLink
          to="/teams"
          class="inline-flex items-center gap-1 text-sm text-base-content/60 hover:text-base-content transition-colors"
        >
          <Icon
            name="lucide:arrow-left"
            class="w-4 h-4"
          />
          Назад к списку
        </NuxtLink>
      </div>

      <UiCard class="animate-slide-up">
        <div
          v-if="!tenant"
          class="text-center py-12"
        >
          <Icon
            name="lucide:alert-circle"
            class="w-16 h-16 mx-auto text-base-content/20 mb-4"
          />
          <p class="text-base-content/60">
            Команда не найдена
          </p>
        </div>

        <template v-else>
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-sm">
                <Icon
                  name="lucide:building-2"
                  class="w-6 h-6 text-primary"
                />
              </div>
              <div v-if="!isEditingName">
                <h1 class="text-xl font-semibold">
                  {{ tenant.name }}
                </h1>
                <div class="text-sm text-base-content/60">
                  {{ formatDate(tenant.since) }}
                </div>
              </div>
              <div v-else>
                <UiInput
                  ref="editNameInputRef"
                  v-model="editNameValue"
                  class="text-lg font-semibold"
                  @keyup.enter="saveEditName"
                  @keyup.escape="cancelEditName"
                />
              </div>
            </div>
            <div class="flex items-center gap-2">
              <template v-if="isAdmin && !isEditingName">
                <UiButton
                  variant="ghost"
                  size="sm"
                  @click="startEditName"
                >
                  <Icon
                    name="lucide:pencil"
                    class="w-4 h-4"
                  />
                </UiButton>
              </template>
              <template v-if="isEditingName">
                <UiButton
                  variant="primary"
                  size="sm"
                  @click="saveEditName"
                >
                  Сохранить
                </UiButton>
                <UiButton
                  variant="ghost"
                  size="sm"
                  @click="cancelEditName"
                >
                  Отмена
                </UiButton>
              </template>
            </div>
          </div>

          <div class="mt-12 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-8 pb-6 bg-base-200/30">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold">
                Участники
              </h2>
              <UiButton
                v-if="isAdmin && !isAddingMember"
                variant="ghost"
                size="sm"
                @click="startAddMember"
              >
                <Icon
                  name="lucide:plus"
                  class="w-4 h-4 mr-1"
                />
                Добавить
              </UiButton>
            </div>

            <div
              v-if="membersLoading"
              class="flex justify-center py-8"
            >
              <span class="loading loading-spinner loading-lg" />
            </div>

            <div
              v-else
              class="space-y-3"
            >
              <div
                v-if="isAddingMember"
                class="p-4 bg-base-200 space-y-3 rounded"
              >
                <UiInput
                  ref="newMemberInputRef"
                  v-model="newMemberId"
                  placeholder="ID пользователя"
                  @keyup.enter="handleAddMember"
                  @keyup.escape="cancelAddMember"
                />
                <UiSelect
                  v-model="newMemberRole"
                  :options="[
                    { value: 'watcher', label: 'Наблюдатель' },
                    { value: 'member', label: 'Участник' },
                    { value: 'admin', label: 'Администратор' },
                  ]"
                />
                <div class="flex gap-2 justify-end">
                  <UiButton
                    variant="primary"
                    size="sm"
                    @click="handleAddMember"
                  >
                    Добавить
                  </UiButton>
                  <UiButton
                    variant="ghost"
                    size="sm"
                    @click="cancelAddMember"
                  >
                    Отмена
                  </UiButton>
                </div>
              </div>

              <div
                v-for="member in members"
                :key="member.id"
                class="flex items-center justify-between p-3 bg-base-100/50 rounded"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center">
                    <Icon
                      name="lucide:user"
                      class="w-4 h-4 text-base-content/60"
                    />
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium break-all">
                      {{ member.id }}
                    </div>
                    <div class="text-sm text-base-content/60">
                      {{ formatDate(member.since) }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <div
                    v-if="member.role === 'admin'"
                    class="badge badge-primary badge-sm"
                  >
                    Админ
                  </div>
                  <template v-if="isAdmin">
                    <UiButton
                      variant="ghost"
                      size="sm"
                      @click="handleToggleMemberRole(member.id, member.role)"
                    >
                      <Icon
                        :name="member.role === 'admin' ? 'lucide:shield-off' : 'lucide:shield'"
                        class="w-4 h-4"
                      />
                    </UiButton>
                    <UiButton
                      variant="ghost"
                      size="sm"
                      @click="handleDeleteMember(member.id)"
                    >
                      <Icon
                        name="lucide:trash-2"
                        class="w-4 h-4"
                      />
                    </UiButton>
                  </template>
                </div>
              </div>

              <UiEmptyState
                v-if="members.length === 0 && !isAddingMember"
                icon="lucide:users"
                title="Нет участников"
              />
            </div>
          </div>

          <div class="pt-12">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold">
                Токены
              </h2>
              <UiButton
                v-if="isAdmin && !isCreatingToken"
                variant="ghost"
                size="sm"
                @click="startCreateToken"
              >
                <Icon
                  name="lucide:plus"
                  class="w-4 h-4 mr-1"
                />
                Создать
              </UiButton>
            </div>

            <div
              v-if="tokensLoading"
              class="flex justify-center py-8"
            >
              <span class="loading loading-spinner loading-lg" />
            </div>

            <div
              v-else
              class="space-y-3"
            >
              <div
                v-if="isCreatingToken && !createdTokenValue"
                class="p-4 bg-base-200 space-y-3 rounded"
              >
                <UiInput
                  ref="newTokenInputRef"
                  v-model="newTokenName"
                  placeholder="Название токена"
                  @keyup.enter="handleCreateToken"
                  @keyup.escape="cancelCreateToken"
                />
                <div class="flex gap-2 justify-end">
                  <UiButton
                    variant="primary"
                    size="sm"
                    @click="handleCreateToken"
                  >
                    Создать
                  </UiButton>
                  <UiButton
                    variant="ghost"
                    size="sm"
                    @click="cancelCreateToken"
                  >
                    Отмена
                  </UiButton>
                </div>
              </div>

              <div
                v-if="createdTokenValue"
                class="p-4 bg-success/10 border border-success/30 space-y-3 rounded"
              >
                <div class="flex items-center gap-2 text-success">
                  <Icon
                    name="lucide:check-circle"
                    class="w-5 h-5"
                  />
                  <span class="font-medium">Токен создан</span>
                </div>
                <p class="text-sm text-base-content/60">
                  Скопируйте токен сейчас. Он больше не будет показан.
                </p>
                <div class="flex gap-2">
                  <UiInput
                    :model-value="createdTokenValue"
                    readonly
                    class="font-mono text-sm flex-1"
                  />
                  <UiButton
                    variant="primary"
                    @click="handleCopyToken"
                  >
                    <Icon
                      name="lucide:copy"
                      class="w-4 h-4 mr-1"
                    />
                    Скопировать
                  </UiButton>
                </div>
              </div>

              <div
                v-for="token in tokens"
                :key="token.id"
                class="flex items-center justify-between p-3 bg-base-200/50 rounded"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-base-300 flex items-center justify-center rounded-sm">
                    <Icon
                      name="lucide:key"
                      class="w-4 h-4 text-base-content/60"
                    />
                  </div>
                  <div class="min-w-0">
                    <div class="font-medium break-all">
                      {{ token.name }}
                    </div>
                    <div class="text-sm text-base-content/60">
                      {{ formatDate(token.created) }}
                    </div>
                  </div>
                </div>
                <div
                  v-if="isAdmin"
                  class="shrink-0"
                >
                  <UiButton
                    variant="ghost"
                    size="sm"
                    @click="handleDeleteToken(token.id)"
                  >
                    <Icon
                      name="lucide:trash-2"
                      class="w-4 h-4"
                    />
                  </UiButton>
                </div>
              </div>

              <UiEmptyState
                v-if="tokens.length === 0 && !isCreatingToken"
                icon="lucide:key"
                title="Нет токенов"
              />
            </div>
          </div>
        </template>
      </UiCard>
    </div>
  </div>
</template>
