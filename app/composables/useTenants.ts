import { getTenants, postTenantsCreate, postTenantsByIdUpdate } from '~/api/sdk.gen'
import type {
  TenantResponseTenant,
  TenantResponseTenantList,
} from '~/api/types.gen'

let initTenantsPromise: Promise<void> | null = null

export const useTenants = () => {
  const tenants = useState<ReadonlyArray<TenantResponseTenant>>('tenants', () => [])
  const selectedTenantId = useState<string>('selected-tenant-id', () => '')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const adminTenants = computed(() =>
    tenants.value.filter(t => t.role === 'admin'),
  )

  const selectedTenant = computed(() =>
    tenants.value.find(t => t.id === selectedTenantId.value),
  )

  const initTenants = async () => {
    if (tenants.value.length > 0) {
      return
    }

    if (initTenantsPromise) {
      return initTenantsPromise
    }

    initTenantsPromise = (async () => {
      const { data } = await useFetch<TenantResponseTenantList>('/api/v1/tenants')
      if (data.value?.tenants) {
        tenants.value = data.value.tenants
        const first = data.value.tenants[0]
        if (first && !selectedTenantId.value) {
          selectedTenantId.value = first.id
        }
      }
    })()

    try {
      await initTenantsPromise
    }
    finally {
      initTenantsPromise = null
    }
  }

  const fetchTenants = async () => {
    loading.value = true
    error.value = null

    const response = await getTenants()

    loading.value = false

    if (response.data?.tenants) {
      tenants.value = response.data.tenants
      const first = response.data.tenants[0]
      if (first && !selectedTenantId.value) {
        selectedTenantId.value = first.id
      }
    }
    else {
      error.value = 'Failed to fetch tenants'
    }

    return response
  }

  const createTenant = async (name: string) => {
    loading.value = true
    error.value = null

    const response = await postTenantsCreate({
      body: { name },
    })

    loading.value = false

    if (response.data?.tenant) {
      tenants.value = [...tenants.value, response.data.tenant]
    }
    else {
      error.value = 'Failed to create tenant'
    }

    return response
  }

  const updateTenant = async (id: string, name: string) => {
    loading.value = true
    error.value = null

    const response = await postTenantsByIdUpdate({
      path: { id },
      body: { name },
    })

    loading.value = false

    if (response.data?.tenant) {
      tenants.value = tenants.value.map(t => t.id === id ? response.data.tenant : t)
    }
    else {
      error.value = 'Failed to update tenant'
    }

    return response
  }

  const getTenantById = (id: string): TenantResponseTenant | undefined => {
    return tenants.value.find(t => t.id === id)
  }

  const getTenantName = (tenantId: string): string => {
    return tenants.value.find(t => t.id === tenantId)?.name ?? tenantId
  }

  return {
    tenants: readonly(tenants),
    selectedTenantId,
    selectedTenant,
    adminTenants,
    loading: readonly(loading),
    error: readonly(error),
    initTenants,
    fetchTenants,
    createTenant,
    updateTenant,
    getTenantById,
    getTenantName,
  }
}
