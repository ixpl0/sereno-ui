import { client } from '~/api/client.gen'
import type {
  TenantResponseTenant,
  TenantResponseTenantList,
  TenantResponseSingleTenant,
  TenantRequestName,
} from '~/api/types.gen'
import type { ApiResponse } from '~/types/api'
import { getApiData } from '~/utils/api'

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

    const { data } = await useFetch<TenantResponseTenantList>('/api/v1/tenants')
    if (data.value?.tenants) {
      tenants.value = data.value.tenants
      const first = data.value.tenants[0]
      if (first && !selectedTenantId.value) {
        selectedTenantId.value = first.id
      }
    }
  }

  const fetchTenants = async (): Promise<ApiResponse<TenantResponseTenantList> | null> => {
    loading.value = true
    error.value = null

    const response = await client.get({
      url: '/tenants',
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<TenantResponseTenantList>)
    if (data?.tenants) {
      tenants.value = data.tenants
      const first = data.tenants[0]
      if (first && !selectedTenantId.value) {
        selectedTenantId.value = first.id
      }
    }
    else {
      error.value = 'Failed to fetch tenants'
    }

    return response as ApiResponse<TenantResponseTenantList>
  }

  const createTenant = async (name: string): Promise<ApiResponse<TenantResponseSingleTenant>> => {
    loading.value = true
    error.value = null

    const body: TenantRequestName = { name }
    const response = await client.post({
      url: '/tenants/create',
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<TenantResponseSingleTenant>)
    if (data?.tenant) {
      tenants.value = [...tenants.value, data.tenant]
    }
    else {
      error.value = 'Failed to create tenant'
    }

    return response as ApiResponse<TenantResponseSingleTenant>
  }

  const updateTenant = async (id: string, name: string): Promise<ApiResponse<TenantResponseSingleTenant>> => {
    loading.value = true
    error.value = null

    const body: TenantRequestName = { name }
    const response = await client.post({
      url: '/tenants/{id}/update',
      path: { id },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<TenantResponseSingleTenant>)
    if (data?.tenant) {
      tenants.value = tenants.value.map(t => t.id === id ? data.tenant : t)
    }
    else {
      error.value = 'Failed to update tenant'
    }

    return response as ApiResponse<TenantResponseSingleTenant>
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
