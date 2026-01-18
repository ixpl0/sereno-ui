<script setup lang="ts">
import type { TenantResponseTenantList } from '~/api/types.gen'

definePageMeta({
  middleware: 'auth',
  layout: 'default',
  title: 'Создание инцидента',
})

const router = useRouter()
const { createIncident } = useIncidents()
const toast = useToast()

const headers = useRequestHeaders(['cookie'])
const { data: tenantsData } = await useFetch<TenantResponseTenantList>('/api/v1/tenants', { headers })

const tenants = computed(() => tenantsData.value?.tenants ?? [])

const form = ref({
  tenantId: '',
  title: '',
  description: '',
})

const isSubmitting = ref(false)

const isFormValid = computed(() =>
  form.value.tenantId.trim() !== '' && form.value.title.trim() !== '',
)

const handleSubmit = async () => {
  if (!isFormValid.value) {
    return
  }

  isSubmitting.value = true
  const response = await createIncident(
    form.value.tenantId,
    form.value.title.trim(),
    form.value.description.trim() || undefined,
  )
  isSubmitting.value = false

  if ('error' in response && response.error) {
    toast.error('Не удалось создать инцидент')
    return
  }

  toast.success('Инцидент создан')

  const newIncident = 'data' in response ? response.data : null
  if (newIncident?.id) {
    router.push(`/incidents/${newIncident.id}`)
  }
  else {
    router.push('/incidents')
  }
}

const handleCancel = () => {
  router.push('/incidents')
}
</script>

<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-xl mx-auto">
      <div class="mb-4">
        <NuxtLink
          to="/incidents"
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
        <h1 class="text-xl font-semibold mb-6">
          Создание инцидента
        </h1>

        <form
          class="space-y-4"
          @submit.prevent="handleSubmit"
        >
          <div class="form-control">
            <label class="label">
              <span class="label-text">Команда</span>
            </label>
            <select
              v-model="form.tenantId"
              class="select select-bordered w-full"
              required
            >
              <option
                value=""
                disabled
              >
                Выберите команду
              </option>
              <option
                v-for="tenant in tenants"
                :key="tenant.id"
                :value="tenant.id"
              >
                {{ tenant.name }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Название</span>
            </label>
            <UiInput
              v-model="form.title"
              placeholder="Название инцидента"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Описание (опционально)</span>
            </label>
            <textarea
              v-model="form.description"
              class="textarea textarea-bordered w-full"
              placeholder="Описание инцидента"
              rows="3"
            />
          </div>

          <div class="flex gap-2 justify-end pt-4">
            <UiButton
              type="submit"
              variant="primary"
              :disabled="!isFormValid || isSubmitting"
            >
              <span
                v-if="isSubmitting"
                class="loading loading-spinner loading-sm mr-2"
              />
              Создать
            </UiButton>
            <UiButton
              type="button"
              variant="ghost"
              @click="handleCancel"
            >
              Отмена
            </UiButton>
          </div>
        </form>
      </UiCard>
    </div>
  </div>
</template>
