import {
  getTenantsByIdTokens,
  postTenantsByIdTokensCreate,
  postTenantsByIdTokensDelete,
} from '~/api/sdk.gen'

export const useTenantTokens = (tenantId: Ref<string>) => {
  const { data: response, status: fetchStatus, refresh } = useAsyncData(
    () => `tenant-tokens-${tenantId.value}`,
    async () => {
      if (!tenantId.value) {
        return null
      }
      const result = await getTenantsByIdTokens({
        path: { id: tenantId.value },
      })
      if (result.error) {
        throw createError({ message: 'Failed to fetch tokens' })
      }
      return result.data
    },
    { watch: [tenantId] },
  )

  const tokens = computed(() => response.value?.tokens ?? [])
  const loading = computed(() => fetchStatus.value === 'pending')

  const createToken = async (name: string) => {
    const result = await postTenantsByIdTokensCreate({
      path: { id: tenantId.value },
      body: { name },
    })

    if (result.data?.token) {
      await refresh()
    }

    return result
  }

  const deleteToken = async (tokenId: string) => {
    const result = await postTenantsByIdTokensDelete({
      path: { id: tenantId.value },
      body: { id: tokenId },
    })

    if (!result.error) {
      await refresh()
    }

    return result
  }

  return {
    tokens,
    loading,
    refresh,
    createToken,
    deleteToken,
  }
}
