interface FocusableElement {
  focus: () => void
}

export const useInlineAdd = <T extends Record<string, string>>(
  initialValues: T,
  inputRefGetter?: () => FocusableElement | null,
) => {
  const isAdding = ref(false)
  const values = ref<T>({ ...initialValues }) as Ref<T>

  const startAdding = () => {
    isAdding.value = true
    values.value = { ...initialValues }
    nextTick(() => inputRefGetter?.()?.focus())
  }

  const cancelAdding = () => {
    isAdding.value = false
    values.value = { ...initialValues }
  }

  return {
    isAdding: readonly(isAdding),
    values,
    startAdding,
    cancelAdding,
  }
}
