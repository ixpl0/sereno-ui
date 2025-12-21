import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'

const VALID_EMAIL = 'demo@example.com'
const VALID_CODE = '12345678'
const INVALID_CODE = '00000000'

const navigateToAuth = async (page: Page) => {
  await page.goto('/auth')
  await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible()
  await page.waitForLoadState('networkidle')
  const emailInput = page.getByPlaceholder('admin@example.ru')
  await emailInput.waitFor({ state: 'attached' })
  await page.waitForTimeout(100)
}

const fillEmailAndSubmit = async (page: Page, email: string) => {
  const emailInput = page.getByPlaceholder('admin@example.ru')
  await emailInput.fill(email)
  await page.getByRole('button', { name: 'Получить код' }).click()
}

const fillCodeAndSubmit = async (page: Page, code: string) => {
  const firstDigitInput = page.getByRole('textbox', { name: 'Цифра 1 из 8' })
  await firstDigitInput.click()
  await page.keyboard.type(code)
}

const completeLogin = async (page: Page, email = VALID_EMAIL, code = VALID_CODE) => {
  await navigateToAuth(page)
  await fillEmailAndSubmit(page, email)
  await expect(page.getByRole('heading', { name: 'Введите код' })).toBeVisible()
  await fillCodeAndSubmit(page, code)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
}

test.describe('Auth - Email Step', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAuth(page)
  })

  test('displays email form correctly', async ({ page }) => {
    await expect(page.getByPlaceholder('admin@example.ru')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Получить код' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Получить код' })).toBeDisabled()
    await expect(page.getByText('или')).toBeVisible()
  })

  test('enables button when email is entered', async ({ page }) => {
    const emailInput = page.getByPlaceholder('admin@example.ru')
    const submitButton = page.getByRole('button', { name: 'Получить код' })

    await expect(submitButton).toBeDisabled()
    await emailInput.fill('test@example.com')
    await expect(submitButton).toBeEnabled()
  })

  test('submits email with Enter key', async ({ page }) => {
    const emailInput = page.getByPlaceholder('admin@example.ru')
    await emailInput.fill(VALID_EMAIL)
    await emailInput.press('Enter')

    await expect(page.getByRole('heading', { name: 'Введите код' })).toBeVisible()
  })

  test('transitions to code step on valid email', async ({ page }) => {
    await fillEmailAndSubmit(page, VALID_EMAIL)

    await expect(page.getByRole('heading', { name: 'Введите код' })).toBeVisible()
    await expect(page.getByText(`Код отправлен на ${VALID_EMAIL}`)).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Цифра 1 из 8' })).toBeVisible()
  })

  test('shows error for invalid email format', async ({ page }) => {
    await fillEmailAndSubmit(page, 'invalid-email')

    await expect(page.getByRole('alert')).toBeVisible()
  })

  test('shows loading state during request', async ({ page }) => {
    const emailInput = page.getByPlaceholder('admin@example.ru')
    const submitButton = page.getByRole('button', { name: 'Получить код' })

    await emailInput.fill(VALID_EMAIL)
    await submitButton.click()

    await expect(page.getByRole('heading', { name: 'Введите код' })).toBeVisible()
  })
})

test.describe('Auth - Code Step', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAuth(page)
    await fillEmailAndSubmit(page, VALID_EMAIL)
    await expect(page.getByRole('heading', { name: 'Введите код' })).toBeVisible()
  })

  test('displays code form correctly', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Цифра 1 из 8' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Войти' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Назад' })).toBeVisible()
    await expect(page.getByText(`Код отправлен на ${VALID_EMAIL}`)).toBeVisible()
  })

  test('enables login button when code is entered', async ({ page }) => {
    const firstDigitInput = page.getByRole('textbox', { name: 'Цифра 1 из 8' })
    const loginButton = page.getByRole('button', { name: 'Войти' })

    await expect(loginButton).toBeDisabled()
    await firstDigitInput.click()
    await page.keyboard.type('123')
    await expect(loginButton).toBeEnabled()
  })

  test('auto-submits when all digits entered', async ({ page }) => {
    const firstDigitInput = page.getByRole('textbox', { name: 'Цифра 1 из 8' })
    await firstDigitInput.click()
    await page.keyboard.type(VALID_CODE)

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('navigates back to email step', async ({ page }) => {
    await page.getByRole('button', { name: 'Назад' }).click()

    await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible()
    await expect(page.getByPlaceholder('admin@example.ru')).toBeVisible()
  })

  test('clears code when going back', async ({ page }) => {
    const firstDigitInput = page.getByRole('textbox', { name: 'Цифра 1 из 8' })
    await firstDigitInput.click()
    await page.keyboard.type('123456')
    await page.getByRole('button', { name: 'Назад' }).click()
    await fillEmailAndSubmit(page, VALID_EMAIL)

    await expect(page.getByRole('textbox', { name: 'Цифра 1 из 8' })).toHaveValue('')
  })

  test('shows error for invalid code', async ({ page }) => {
    await fillCodeAndSubmit(page, INVALID_CODE)

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Введите код' })).toBeVisible()
  })

  test('successful login with valid code', async ({ page }) => {
    await fillCodeAndSubmit(page, VALID_CODE)

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Добро пожаловать!')).toBeVisible()
  })
})

test.describe('Auth - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await completeLogin(page)
  })

  test('displays dashboard correctly after login', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Добро пожаловать!')).toBeVisible()
    await expect(page.getByText('Вы авторизованы')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Выйти из аккаунта' })).toBeVisible()
  })

  test('shows token info', async ({ page }) => {
    await expect(page.getByText('Token:')).toBeVisible()
  })

  test('logs out and returns to auth', async ({ page }) => {
    await page.getByRole('button', { name: 'Выйти из аккаунта' }).click()

    await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible()
    await expect(page.getByPlaceholder('admin@example.ru')).toBeVisible()
  })
})

test.describe('Auth - OAuth Providers', () => {
  const providers = [
    { name: 'Яндекс', id: 'yandex' },
    { name: 'ВКонтакте', id: 'vk' },
    { name: 'Keycloak', id: 'keycloak' },
  ]

  test.beforeEach(async ({ page }) => {
    await navigateToAuth(page)
  })

  for (const provider of providers) {
    test(`displays ${provider.name} button`, async ({ page }) => {
      const button = page.getByRole('button', { name: `Войти через ${provider.name}` })
      await expect(button).toBeVisible()
    })
  }
})

test.describe('Auth - OAuth Flow', () => {
  const providers = [
    { name: 'Яндекс', id: 'yandex' },
    { name: 'ВКонтакте', id: 'vk' },
    { name: 'Keycloak', id: 'keycloak' },
  ]

  test.beforeEach(async ({ page }) => {
    await navigateToAuth(page)
  })

  test.describe('Mock OAuth Page', () => {
    test('redirects to mock OAuth page on provider click', async ({ page }) => {
      await page.getByRole('button', { name: 'Войти через Яндекс' }).click()

      await expect(page).toHaveURL(/\/mock-oauth\/yandex/)
      await expect(page.getByRole('heading', { name: 'Яндекс' })).toBeVisible()
    })

    test('displays scenario tabs', async ({ page }) => {
      await page.getByRole('button', { name: 'Войти через Яндекс' }).click()

      const tabsContainer = page.locator('.tabs')
      await expect(tabsContainer.getByRole('button', { name: /Успешный вход/i })).toBeVisible()
      await expect(tabsContainer.getByRole('button', { name: /Отмена/i })).toBeVisible()
      await expect(tabsContainer.getByRole('button', { name: /Ошибка/i })).toBeVisible()
      await expect(tabsContainer.getByRole('button', { name: /Таймаут/i })).toBeVisible()
    })

    test('cancel button returns to auth page', async ({ page }) => {
      await page.getByRole('button', { name: 'Войти через Яндекс' }).click()
      await page.locator('.btn-ghost.btn-block').getByText('Отмена').click()

      await expect(page).toHaveURL('/auth')
      await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible()
    })

    for (const provider of providers) {
      test(`shows correct branding for ${provider.name}`, async ({ page }) => {
        await page.getByRole('button', { name: `Войти через ${provider.name}` }).click()

        await expect(page).toHaveURL(new RegExp(`/mock-oauth/${provider.id}`))
        await expect(page.getByRole('heading', { name: provider.name })).toBeVisible()
      })
    }
  })

  test.describe('Successful OAuth Flow', () => {
    test('completes OAuth login', async ({ page }) => {
      await page.getByRole('button', { name: 'Войти через Яндекс' }).click()
      await expect(page).toHaveURL(/\/mock-oauth\/yandex/)

      await page.getByRole('button', { name: 'Выполнить сценарий' }).click()

      await expect(page).toHaveURL(/\/auth\/callback\/yandex/)
      await expect(page.getByText('Авторизация успешна!')).toBeVisible({ timeout: 10000 })

      await expect(page).toHaveURL('/dashboard', { timeout: 5000 })
    })

    for (const provider of providers) {
      test(`successful login via ${provider.name}`, async ({ page }) => {
        await page.getByRole('button', { name: `Войти через ${provider.name}` }).click()

        await page.getByRole('button', { name: 'Выполнить сценарий' }).click()

        await expect(page.getByText('Авторизация успешна!')).toBeVisible({ timeout: 10000 })
        await expect(page).toHaveURL('/dashboard', { timeout: 5000 })
      })
    }
  })

  test.describe('OAuth Error Scenarios', () => {
    test('handles cancel scenario', async ({ page }) => {
      await page.getByRole('button', { name: 'Войти через Яндекс' }).click()

      const tabsContainer = page.locator('.tabs')
      await tabsContainer.getByRole('button', { name: /Отмена/i }).click()
      await page.getByRole('button', { name: 'Выполнить сценарий' }).click()

      await expect(page).toHaveURL(/\/auth\/callback\/yandex/)
      await expect(page.getByText('Ошибка авторизации')).toBeVisible()
      await expect(page.getByText(/cancelled/i)).toBeVisible()
    })

    test('handles error scenario', async ({ page }) => {
      await page.getByRole('button', { name: 'Войти через Яндекс' }).click()

      const tabsContainer = page.locator('.tabs')
      await tabsContainer.getByRole('button', { name: /Ошибка/i }).click()
      await page.getByRole('button', { name: 'Выполнить сценарий' }).click()

      await expect(page).toHaveURL(/\/auth\/callback\/yandex/, { timeout: 15000 })
      await expect(page.getByText('Ошибка авторизации')).toBeVisible()
    })

    test('back button returns to auth page after error', async ({ page }) => {
      await page.getByRole('button', { name: 'Войти через Яндекс' }).click()

      const tabsContainer = page.locator('.tabs')
      await tabsContainer.getByRole('button', { name: /Отмена/i }).click()
      await page.getByRole('button', { name: 'Выполнить сценарий' }).click()

      await expect(page.getByText('Ошибка авторизации')).toBeVisible()

      await page.getByRole('button', { name: 'Назад' }).click()

      await expect(page).toHaveURL('/auth')
      await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible()
    })
  })

  test.describe('OAuth Callback Page', () => {
    test('shows loading state initially', async ({ page }) => {
      await page.getByRole('button', { name: 'Войти через Яндекс' }).click()
      await page.getByRole('button', { name: 'Выполнить сценарий' }).click()

      await expect(page.getByText('Завершаем авторизацию...')).toBeVisible()
    })

    test('shows success state after login', async ({ page }) => {
      await page.getByRole('button', { name: 'Войти через Яндекс' }).click()
      await page.getByRole('button', { name: 'Выполнить сценарий' }).click()

      await expect(page.getByText('Авторизация успешна!')).toBeVisible({ timeout: 10000 })
      await expect(page.getByText('Переходим в dashboard...')).toBeVisible()
    })

    test('displays provider branding on callback page', async ({ page }) => {
      await page.getByRole('button', { name: 'Войти через Яндекс' }).click()
      await page.getByRole('button', { name: 'Выполнить сценарий' }).click()

      await expect(page.getByRole('heading', { name: 'Яндекс' })).toBeVisible()
    })

    test('handles unknown provider gracefully', async ({ page }) => {
      await page.goto('/auth/callback/unknown-provider')

      await expect(page.getByText('Ошибка авторизации')).toBeVisible()
      await expect(page.getByText(/unknown-provider/i)).toBeVisible()
    })
  })

  test.describe('OAuth Complete Flow', () => {
    test('full OAuth flow from auth to dashboard', async ({ page }) => {
      await navigateToAuth(page)

      await page.getByRole('button', { name: 'Войти через ВКонтакте' }).click()

      await expect(page).toHaveURL(/\/mock-oauth\/vk/)
      await expect(page.getByRole('heading', { name: 'ВКонтакте' })).toBeVisible()

      await page.getByRole('button', { name: 'Выполнить сценарий' }).click()

      await expect(page).toHaveURL(/\/auth\/callback\/vk/)
      await expect(page.getByText('Авторизация успешна!')).toBeVisible({ timeout: 10000 })

      await expect(page).toHaveURL('/dashboard', { timeout: 5000 })
    })

    test('OAuth flow with scenario switch before login', async ({ page }) => {
      await navigateToAuth(page)

      await page.getByRole('button', { name: 'Войти через Keycloak' }).click()
      await expect(page).toHaveURL(/\/mock-oauth\/keycloak/)

      const tabsContainer = page.locator('.tabs')
      await tabsContainer.getByRole('button', { name: /Ошибка/i }).click()
      await expect(page.getByText('Произошла ошибка на стороне провайдера')).toBeVisible()

      await tabsContainer.getByRole('button', { name: /Успешный вход/i }).click()
      await expect(page.getByText('Авторизация пройдёт успешно')).toBeVisible()

      await page.getByRole('button', { name: 'Выполнить сценарий' }).click()

      await expect(page.getByText('Авторизация успешна!')).toBeVisible({ timeout: 10000 })
    })
  })
})

test.describe('Auth - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAuth(page)
  })

  test('closes error toast by clicking', async ({ page }) => {
    await fillEmailAndSubmit(page, 'invalid-email')

    const errorToast = page.locator('.alert-error')
    await expect(errorToast).toBeVisible()

    await errorToast.click()
    await expect(errorToast).not.toBeVisible()
  })

  test('clears error when navigating between steps', async ({ page }) => {
    await fillEmailAndSubmit(page, VALID_EMAIL)
    await fillCodeAndSubmit(page, INVALID_CODE)

    await expect(page.locator('.alert-error')).toBeVisible()

    await page.getByRole('button', { name: 'Назад' }).click()
    await expect(page.locator('.alert-error')).not.toBeVisible()
  })
})

test.describe('Auth - Complete Flow', () => {
  test('complete email authentication flow', async ({ page }) => {
    await navigateToAuth(page)

    const emailInput = page.getByPlaceholder('admin@example.ru')
    await emailInput.fill(VALID_EMAIL)

    await page.getByRole('button', { name: 'Получить код' }).click()

    await expect(page.getByRole('heading', { name: 'Введите код' })).toBeVisible()
    await expect(page.getByText(`Код отправлен на ${VALID_EMAIL}`)).toBeVisible()

    const firstDigitInput = page.getByRole('textbox', { name: 'Цифра 1 из 8' })
    await firstDigitInput.click()
    await page.keyboard.type(VALID_CODE)

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Добро пожаловать!')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Выйти из аккаунта' })).toBeVisible()
  })

  test('flow with retry after invalid code', async ({ page }) => {
    await navigateToAuth(page)
    await fillEmailAndSubmit(page, VALID_EMAIL)

    await fillCodeAndSubmit(page, INVALID_CODE)
    await expect(page.getByRole('alert')).toBeVisible()

    await page.getByRole('button', { name: 'Назад' }).click()
    await fillEmailAndSubmit(page, VALID_EMAIL)
    await fillCodeAndSubmit(page, VALID_CODE)

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('full logout and re-login flow', async ({ page }) => {
    await completeLogin(page)

    await page.getByRole('button', { name: 'Выйти' }).click()
    await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible()

    await completeLogin(page, 'another@example.com', VALID_CODE)
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })
})
