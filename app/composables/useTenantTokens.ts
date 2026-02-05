import {
  getTenantsByIdTokens,
  postTenantsByIdTokensCreate,
  postTenantsByIdTokensDelete,
} from '~/api/sdk.gen'
import type { TenantResponseToken } from '~/api/types.gen'

type TokensCache = Record<string, ReadonlyArray<TenantResponseToken>>

export const useTenantTokens = (tenantId: Ref<string>) => {
  const tokensCache = useState<TokensCache>('tenant-tokens-cache', () => ({}))
  const tokens = computed({
    get: () => tokensCache.value[tenantId.value] ?? [],
    set: (value: ReadonlyArray<TenantResponseToken>) => {
      tokensCache.value = { ...tokensCache.value, [tenantId.value]: value }
    },
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTokens = async () => {
    loading.value = true
    error.value = null

    const response = await getTenantsByIdTokens({
      path: { id: tenantId.value },
    })

    loading.value = false

    if (response.data?.tokens) {
      tokens.value = response.data.tokens
    }
    else {
      error.value = 'Failed to fetch tokens'
    }

    return response
  }

  const createToken = async (name: string) => {
    loading.value = true
    error.value = null

    const response = await postTenantsByIdTokensCreate({
      path: { id: tenantId.value },
      body: { name },
    })

    loading.value = false

    if (response.data?.token) {
      tokens.value = [...tokens.value, response.data.token]
    }
    else {
      error.value = 'Failed to create token'
    }

    return response
  }

  const deleteToken = async (tokenId: string) => {
    loading.value = true
    error.value = null

    const response = await postTenantsByIdTokensDelete({
      path: { id: tenantId.value },
      body: { id: tokenId },
    })

    loading.value = false

    if (response.error) {
      error.value = 'Failed to delete token'
    }
    else {
      tokens.value = tokens.value.filter(t => t.id !== tokenId)
    }

    return response
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
