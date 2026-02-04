export type FormFieldVariant = 'bordered' | 'ghost'
export type FormFieldSize = 'xs' | 'sm' | 'md' | 'lg'
export type FormFieldState = 'default' | 'error' | 'success' | 'warning'

export const createVariantClasses = (prefix: string): Record<FormFieldVariant, string> => ({
  bordered: `${prefix}-bordered`,
  ghost: `${prefix}-ghost`,
})

export const createSizeClasses = (prefix: string): Record<FormFieldSize, string> => ({
  xs: `${prefix}-xs`,
  sm: `${prefix}-sm`,
  md: '',
  lg: `${prefix}-lg`,
})

export const createStateClasses = (prefix: string): Record<FormFieldState, string> => ({
  default: '',
  error: `${prefix}-error`,
  success: `${prefix}-success`,
  warning: `${prefix}-warning`,
})

export const HINT_COLOR_CLASSES: Record<FormFieldState, string> = {
  default: 'text-base-content/60',
  error: 'text-error',
  success: 'text-success',
  warning: 'text-warning',
}
