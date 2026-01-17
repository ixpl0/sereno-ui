import { client } from '~/api/client.gen'
import type {
  TenantResponseToken,
  TenantResponseTokenList,
  TenantResponseSingleToken,
  TenantRequestName,
  TenantRequestId,
} from '~/api/types.gen'
import type { ApiResponse } from '~/types/api'
import { getApiData } from '~/utils/api'

export const useTenantTokens = (tenantId: Ref<string>) => {
  const tokens = ref<ReadonlyArray<TenantResponseToken>>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTokens = async (): Promise<ApiResponse<TenantResponseTokenList> | null> => {
    loading.value = true
    error.value = null

    const response = await client.get({
      url: '/tenants/{id}/tokens',
      path: { id: tenantId.value },
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<TenantResponseTokenList>)
    if (data?.tokens) {
      tokens.value = data.tokens
    }
    else {
      error.value = 'Failed to fetch tokens'
    }

    return response as ApiResponse<TenantResponseTokenList>
  }

  const createToken = async (name: string): Promise<ApiResponse<TenantResponseSingleToken>> => {
    loading.value = true
    error.value = null

    const body: TenantRequestName = { name }
    const response = await client.post({
      url: '/tenants/{id}/tokens/create',
      path: { id: tenantId.value },
      body,
    })

    loading.value = false

    const data = getApiData(response as ApiResponse<TenantResponseSingleToken>)
    if (data?.token) {
      tokens.value = [...tokens.value, data.token]
    }
    else {
      error.value = 'Failed to create token'
    }

    return response as ApiResponse<TenantResponseSingleToken>
  }

  const deleteToken = async (tokenId: string): Promise<ApiResponse<void>> => {
    loading.value = true
    error.value = null

    const body: TenantRequestId = { id: tokenId }
    const response = await client.post({
      url: '/tenants/{id}/tokens/delete',
      path: { id: tenantId.value },
      body,
    })

    loading.value = false

    if ('error' in response && response.error) {
      error.value = 'Failed to delete token'
    }
    else {
      tokens.value = tokens.value.filter(t => t.id !== tokenId)
    }

    return response as ApiResponse<void>
  }

  return {
    tokens: readonly(tokens),
    loading: readonly(loading),
    error: readonly(error),
    fetchTokens,
    createToken,
    deleteToken,
  }
}
