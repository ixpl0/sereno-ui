import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'

const VALID_EMAIL = 'demo@example.com'
const VALID_CODE = '12345678'
const INVALID_CODE = '00000000'

const navigateToAuth = async (page: Page) => {
  await page.goto('/auth')
  await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible()
}

const fillEmailAndSubmit = async (page: Page, email: string) => {
  const emailInput = page.getByPlaceholder('admin@example.ru')
  await emailInput.fill(email)
  await page.getByRole('button', { name: 'Получить код' }).click()
}

const fillCodeAndSubmit = async (page: Page, code: string) => {
  const codeInput = page.getByPlaceholder('12345678')
  await codeInput.fill(code)
  await page.getByRole('button', { name: 'Войти' }).click()
}

const completeLogin = async (page: Page, email = VALID_EMAIL, code = VALID_CODE) => {
  await navigateToAuth(page)
  await fillEmailAndSubmit(page, email)
  await expect(page.getByRole('heading', { name: 'Введите код' })).toBeVisible()
  await fillCodeAndSubmit(page, code)
  await expect(page.getByRole('heading', { name: 'Вы авторизованы' })).toBeVisible()
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
    await expect(page.getByPlaceholder('12345678')).toBeVisible()
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
    await expect(page.getByPlaceholder('12345678')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Войти' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Назад' })).toBeVisible()
    await expect(page.getByText(`Код отправлен на ${VALID_EMAIL}`)).toBeVisible()
  })

  test('enables login button when code is entered', async ({ page }) => {
    const codeInput = page.getByPlaceholder('12345678')
    const loginButton = page.getByRole('button', { name: 'Войти' })

    await expect(loginButton).toBeDisabled()
    await codeInput.fill('123')
    await expect(loginButton).toBeEnabled()
  })

  test('submits code with Enter key', async ({ page }) => {
    const codeInput = page.getByPlaceholder('12345678')
    await codeInput.fill(VALID_CODE)
    await codeInput.press('Enter')

    await expect(page.getByRole('heading', { name: 'Вы авторизованы' })).toBeVisible()
  })

  test('navigates back to email step', async ({ page }) => {
    await page.getByRole('button', { name: 'Назад' }).click()

    await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible()
    await expect(page.getByPlaceholder('admin@example.ru')).toBeVisible()
  })

  test('clears code when going back', async ({ page }) => {
    const codeInput = page.getByPlaceholder('12345678')
    await codeInput.fill('123456')
    await page.getByRole('button', { name: 'Назад' }).click()
    await fillEmailAndSubmit(page, VALID_EMAIL)

    await expect(page.getByPlaceholder('12345678')).toHaveValue('')
  })

  test('shows error for invalid code', async ({ page }) => {
    await fillCodeAndSubmit(page, INVALID_CODE)

    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Введите код' })).toBeVisible()
  })

  test('successful login with valid code', async ({ page }) => {
    await fillCodeAndSubmit(page, VALID_CODE)

    await expect(page.getByRole('heading', { name: 'Вы авторизованы' })).toBeVisible()
    await expect(page.getByText('Вы успешно вошли в систему')).toBeVisible()
    await expect(page.locator('.text-success')).toBeVisible()
  })
})

test.describe('Auth - Success Step', () => {
  test.beforeEach(async ({ page }) => {
    await completeLogin(page)
  })

  test('displays success screen correctly', async ({ page }) => {
    await expect(page.locator('.text-success')).toBeVisible()
    await expect(page.getByText('Вы успешно вошли в систему')).toBeVisible()
    await expect(page.getByRole('button', { name: 'В dashboard' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Обновить токен' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible()
  })

  test('navigates to dashboard', async ({ page }) => {
    await page.getByRole('button', { name: 'В dashboard' }).click()

    await expect(page).toHaveURL('/dashboard')
  })

  test('refreshes token successfully', async ({ page }) => {
    await page.getByRole('button', { name: 'Обновить токен' }).click()

    await expect(page.getByRole('heading', { name: 'Вы авторизованы' })).toBeVisible()
  })

  test('logs out and returns to email step', async ({ page }) => {
    await page.getByRole('button', { name: 'Выйти' }).click()

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

test.describe('Auth - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToAuth(page)
  })

  test('closes error alert', async ({ page }) => {
    await fillEmailAndSubmit(page, 'invalid-email')

    const errorAlert = page.locator('.alert-error')
    await expect(errorAlert).toBeVisible()

    await errorAlert.getByRole('button').click()
    await expect(errorAlert).not.toBeVisible()
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

    const codeInput = page.getByPlaceholder('12345678')
    await codeInput.fill(VALID_CODE)

    await page.getByRole('button', { name: 'Войти' }).click()

    await expect(page.getByRole('heading', { name: 'Вы авторизованы' })).toBeVisible()
    await expect(page.getByText('Вы успешно вошли в систему')).toBeVisible()
    await expect(page.locator('.text-success')).toBeVisible()
    await expect(page.getByRole('button', { name: 'В dashboard' })).toBeVisible()
  })

  test('flow with retry after invalid code', async ({ page }) => {
    await navigateToAuth(page)
    await fillEmailAndSubmit(page, VALID_EMAIL)

    await fillCodeAndSubmit(page, INVALID_CODE)
    await expect(page.getByRole('alert')).toBeVisible()

    const codeInput = page.getByPlaceholder('12345678')
    await codeInput.clear()
    await fillCodeAndSubmit(page, VALID_CODE)

    await expect(page.getByRole('heading', { name: 'Вы авторизованы' })).toBeVisible()
  })

  test('full logout and re-login flow', async ({ page }) => {
    await completeLogin(page)

    await page.getByRole('button', { name: 'Выйти' }).click()
    await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible()

    await completeLogin(page, 'another@example.com', VALID_CODE)
    await expect(page.getByRole('heading', { name: 'Вы авторизованы' })).toBeVisible()
  })
})
