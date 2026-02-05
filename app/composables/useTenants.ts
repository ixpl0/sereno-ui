import { getTenants, postTenantsCreate, postTenantsByIdUpdate } from '~/api/sdk.gen'
import type { TenantResponseTenant } from '~/api/types.gen'

export const useTenants = () => {
  const { data: response, status: fetchStatus, refresh } = useAsyncData(
    'tenants',
    async () => {
      const result = await getTenants()
      if (result.error) {
        throw createError({ message: 'Failed to fetch tenants' })
      }
      return result.data
    },
  )

  const tenants = computed(() => response.value?.tenants ?? [])
  const loading = computed(() => fetchStatus.value === 'pending')
  const selectedTenantId = useState<string>('selected-tenant-id', () => '')

  const adminTenants = computed(() =>
    tenants.value.filter(t => t.role === 'admin'),
  )

  const selectedTenant = computed(() =>
    tenants.value.find(t => t.id === selectedTenantId.value),
  )

  watch(tenants, (value) => {
    const first = value[0]
    if (first && !selectedTenantId.value) {
      selectedTenantId.value = first.id
    }
  }, { immediate: true })

  const createTenant = async (name: string) => {
    const result = await postTenantsCreate({
      body: { name },
    })

    if (result.data?.tenant) {
      await refresh()
    }

    return result
  }

  const updateTenant = async (id: string, name: string) => {
    const result = await postTenantsByIdUpdate({
      path: { id },
      body: { name },
    })

    if (result.data?.tenant) {
      await refresh()
    }

    return result
  }

  const getTenantById = (id: string): TenantResponseTenant | undefined => {
    return tenants.value.find(t => t.id === id)
  }

  const getTenantName = (tenantId: string): string => {
    return tenants.value.find(t => t.id === tenantId)?.name ?? tenantId
  }

  return {
    tenants,
    selectedTenantId,
    selectedTenant,
    adminTenants,
    loading,
    refresh,
    createTenant,
    updateTenant,
    getTenantById,
    getTenantName,
  }
}
