import { client } from '~/api/client.gen'
import type {
  TenantResponseTenant,
  TenantResponseTenantsList,
  TenantResponseSingleTenant,
  TenantRequestName,
} from '~/api/types.gen'
import type { ApiResponse } from '~/types/api'
import { getApiData } from '~/utils/api'

export const useTenants = () => {
  const tenants = useState<ReadonlyArray<TenantResponseTenant>>('tenants', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const adminTenants = computed(() =>
    tenants.value.filter(t => t.admin === true),
  )

  const fetchTenants = async (): Promise<ApiResponse<TenantResponseTenantsList> | null> => {
    loading.value = true
    error.value = null

    const response = await client.get({
      url: '/tenants',
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<TenantResponseTenantsList>)
    if (data?.tenants) {
      tenants.value = data.tenants
    }
    else {
      error.value = 'Failed to fetch tenants'
    }

    return response as ApiResponse<TenantResponseTenantsList>
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

  return {
    tenants: readonly(tenants),
    adminTenants,
    loading: readonly(loading),
    error: readonly(error),
    fetchTenants,
    createTenant,
    updateTenant,
    getTenantById,
  }
}
