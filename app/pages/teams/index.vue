<script setup lang="ts">
import type { TenantResponseTenantsList } from '~/api/types.gen'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Команды',
})

useSeoMeta({
  title: 'Команды',
  description: 'Управление командами',
})

const { data: tenantsData, status, refresh } = await useFetch<TenantResponseTenantsList>('/api/v1/tenants')

const loading = computed(() => status.value === 'pending' && !tenantsData.value)

const { createTenant } = useTenants()
const toast = useToast()

const isCreating = ref(false)
const newTenantName = ref('')
const newTenantInputRef = ref<{ focus: () => void } | null>(null)

const startCreate = () => {
  isCreating.value = true
  newTenantName.value = ''
  nextTick(() => {
    newTenantInputRef.value?.focus()
  })
}

const cancelCreate = () => {
  isCreating.value = false
  newTenantName.value = ''
}

const handleCreate = async () => {
  const name = newTenantName.value.trim()
  if (!name) {
    return
  }

  const response = await createTenant(name)

  if ('error' in response && response.error) {
    toast.error('Не удалось создать команду')
    return
  }

  await refresh()
  toast.success('Команда создана')
  cancelCreate()
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
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-xl font-semibold">
            Команды
          </h1>
          <UiButton
            v-if="!isCreating"
            variant="primary"
            size="sm"
            @click="startCreate"
          >
            <Icon
              name="lucide:plus"
              class="w-4 h-4 mr-1"
            />
            Создать
          </UiButton>
        </div>

        <div
          v-if="loading"
          class="flex justify-center py-8"
        >
          <span class="loading loading-spinner loading-lg" />
        </div>

        <div
          v-else
          class="space-y-4"
        >
          <div
            v-if="isCreating"
            class="p-4 bg-base-200 space-y-3"
          >
            <UiInput
              ref="newTenantInputRef"
              v-model="newTenantName"
              placeholder="Название команды"
              @keyup.enter="handleCreate"
              @keyup.escape="cancelCreate"
            />
            <div class="flex gap-2 justify-end">
              <UiButton
                variant="primary"
                size="sm"
                @click="handleCreate"
              >
                Создать
              </UiButton>
              <UiButton
                variant="ghost"
                size="sm"
                @click="cancelCreate"
              >
                Отмена
              </UiButton>
            </div>
          </div>

          <div
            v-if="!tenantsData?.tenants?.length && !isCreating"
            class="text-center py-12"
          >
            <Icon
              name="lucide:building-2"
              class="w-16 h-16 mx-auto text-base-content/20 mb-4"
            />
            <p class="text-base-content/60 mb-4">
              У вас пока нет команд
            </p>
            <UiButton
              variant="primary"
              @click="startCreate"
            >
              Создать первую команду
            </UiButton>
          </div>

          <NuxtLink
            v-for="tenant in tenantsData?.tenants"
            :key="tenant.id"
            :to="`/teams/${tenant.id}`"
            class="flex items-center justify-between p-4 bg-base-200/50 hover:bg-base-200 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary/10 flex items-center justify-center">
                <Icon
                  name="lucide:building-2"
                  class="w-5 h-5 text-primary"
                />
              </div>
              <div>
                <div class="font-medium">
                  {{ tenant.name }}
                </div>
                <div class="text-sm text-base-content/60">
                  {{ formatDate(tenant.since) }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <div
                v-if="tenant.admin"
                class="badge badge-primary badge-sm"
              >
                Админ
              </div>
              <Icon
                name="lucide:chevron-right"
                class="w-5 h-5 text-base-content/40"
              />
            </div>
          </NuxtLink>
        </div>
      </UiCard>
    </div>
  </div>
</template>
