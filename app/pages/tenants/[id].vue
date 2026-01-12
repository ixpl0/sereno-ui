<script setup lang="ts">
import type {
  TenantResponseTenantsList,
  TenantResponseMembersList,
  TenantResponseTokensList,
} from '~/api/types.gen'

const route = useRoute()
const tenantId = computed(() => route.params.id as string)

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Тенант',
})

useSeoMeta({
  title: 'Тенант',
  description: 'Настройки тенанта',
})

const { data: tenantsData, refresh: refreshTenants } = await useFetch<TenantResponseTenantsList>('/api/v1/tenants')
const { data: membersData, status: membersStatus, refresh: refreshMembers } = await useFetch<TenantResponseMembersList>(
  () => `/api/v1/tenants/${tenantId.value}/members`,
)
const { data: tokensData, status: tokensStatus, refresh: refreshTokens } = await useFetch<TenantResponseTokensList>(
  () => `/api/v1/tenants/${tenantId.value}/tokens`,
)

const tenant = computed(() => tenantsData.value?.tenants?.find(t => t.id === tenantId.value))
const isAdmin = computed(() => tenant.value?.admin === true)
const membersLoading = computed(() => membersStatus.value === 'pending' && !membersData.value)
const tokensLoading = computed(() => tokensStatus.value === 'pending' && !tokensData.value)

const { updateTenant } = useTenants()
const tenantIdRef = ref(tenantId.value)
watch(tenantId, (value) => {
  tenantIdRef.value = value
})
const { updateMember, deleteMember } = useTenantMembers(tenantIdRef)
const { createToken, deleteToken } = useTenantTokens(tenantIdRef)
const toast = useToast()

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

  await refreshTenants()
  toast.success('Сохранено')
  cancelEditName()
}

const isAddingMember = ref(false)
const newMemberId = ref('')
const newMemberAdmin = ref(false)
const newMemberInputRef = ref<{ focus: () => void } | null>(null)

const startAddMember = () => {
  isAddingMember.value = true
  newMemberId.value = ''
  newMemberAdmin.value = false
  nextTick(() => {
    newMemberInputRef.value?.focus()
  })
}

const cancelAddMember = () => {
  isAddingMember.value = false
  newMemberId.value = ''
  newMemberAdmin.value = false
}

const handleAddMember = async () => {
  const memberId = newMemberId.value.trim()
  if (!memberId) {
    return
  }

  const response = await updateMember(memberId, newMemberAdmin.value)

  if ('error' in response && response.error) {
    toast.error('Не удалось добавить участника')
    return
  }

  await refreshMembers()
  toast.success('Участник добавлен')
  cancelAddMember()
}

const handleToggleMemberAdmin = async (memberId: string, currentAdmin: boolean) => {
  const response = await updateMember(memberId, !currentAdmin)

  if ('error' in response && response.error) {
    toast.error('Не удалось изменить права')
    return
  }

  await refreshMembers()
  toast.success('Права изменены')
}

const handleDeleteMember = async (memberId: string) => {
  const response = await deleteMember(memberId)

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить участника')
    return
  }

  await refreshMembers()
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

  await refreshTokens()
}

const handleCopyToken = async () => {
  if (!createdTokenValue.value) {
    return
  }

  await navigator.clipboard.writeText(createdTokenValue.value)
  toast.success('Токен скопирован')
  cancelCreateToken()
}

const handleDeleteToken = async (tokenId: string) => {
  const response = await deleteToken(tokenId)

  if ('error' in response && response.error) {
    toast.error('Не удалось удалить токен')
    return
  }

  await refreshTokens()
  toast.success('Токен удалён')
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
      <div class="mb-4">
        <NuxtLink
          to="/tenants"
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
            Тенант не найден
          </p>
        </div>

        <template v-else>
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-primary/10 flex items-center justify-center">
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
                class="p-4 bg-base-200 space-y-3"
              >
                <UiInput
                  ref="newMemberInputRef"
                  v-model="newMemberId"
                  placeholder="ID пользователя"
                  @keyup.enter="handleAddMember"
                  @keyup.escape="cancelAddMember"
                />
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="newMemberAdmin"
                    type="checkbox"
                    class="checkbox checkbox-sm"
                  >
                  <span class="text-sm">Администратор</span>
                </label>
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
                v-for="member in membersData?.members"
                :key="member.id"
                class="flex items-center justify-between p-3 bg-base-100/50"
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
                      {{ member.name || member.id }}
                    </div>
                    <div class="text-sm text-base-content/60">
                      {{ formatDate(member.since) }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <div
                    v-if="member.admin"
                    class="badge badge-primary badge-sm"
                  >
                    Админ
                  </div>
                  <template v-if="isAdmin">
                    <UiButton
                      variant="ghost"
                      size="sm"
                      @click="handleToggleMemberAdmin(member.id, member.admin)"
                    >
                      <Icon
                        :name="member.admin ? 'lucide:shield-off' : 'lucide:shield'"
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

              <div
                v-if="!membersData?.members?.length && !isAddingMember"
                class="text-center py-8 text-base-content/60"
              >
                Нет участников
              </div>
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
                class="p-4 bg-base-200 space-y-3"
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
                class="p-4 bg-success/10 border border-success/30 space-y-3"
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
                v-for="token in tokensData?.tokens"
                :key="token.id"
                class="flex items-center justify-between p-3 bg-base-200/50"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-base-300 flex items-center justify-center">
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
                      {{ formatDate(token.since) }}
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

              <div
                v-if="!tokensData?.tokens?.length && !isCreatingToken"
                class="text-center py-8 text-base-content/60"
              >
                Нет токенов
              </div>
            </div>
          </div>
        </template>
      </UiCard>
    </div>
  </div>
</template>
