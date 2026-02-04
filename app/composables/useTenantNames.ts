interface TenantData {
  tenants?: ReadonlyArray<{ id: string, name: string }>
}

export const useTenantNames = () => {
  const { data: tenantsData } = useFetch<TenantData>('/api/v1/tenants')

  const getTenantName = (tenantId: string): string => {
    const tenants = tenantsData.value?.tenants ?? []
    return tenants.find(t => t.id === tenantId)?.name ?? tenantId
  }

  return { getTenantName }
}
