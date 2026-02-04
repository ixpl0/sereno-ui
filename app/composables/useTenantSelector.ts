import type { TenantResponseTenantList } from '~/api/types.gen'

export const useTenantSelector = async () => {
  const { data: tenantsData } = await useFetch<TenantResponseTenantList>('/api/v1/tenants')
  const tenants = computed(() => tenantsData.value?.tenants ?? [])
  const firstTenant = tenants.value[0]
  const selectedTenantId = ref(firstTenant?.id ?? '')

  watch(tenants, (value) => {
    const first = value[0]
    if (value.length > 0 && !selectedTenantId.value && first) {
      selectedTenantId.value = first.id
    }
  }, { immediate: true })

  const selectedTenant = computed(() =>
    tenants.value.find(t => t.id === selectedTenantId.value),
  )

  return {
    tenants,
    selectedTenantId,
    selectedTenant,
  }
}
