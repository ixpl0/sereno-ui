import { test, expect } from '@playwright/test'

test.describe('Auth Flow Demo', () => {
  test('complete email authentication flow', async ({ page }) => {
    await page.goto('/auth')

    await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible()

    const emailInput = page.getByPlaceholder('your@email.com')
    await expect(emailInput).toBeVisible()
    await emailInput.fill('demo@example.com')

    const requestCodeButton = page.getByRole('button', { name: 'Получить код' })
    await requestCodeButton.click()

    await expect(page.getByRole('heading', { name: 'Введите код' })).toBeVisible()
    await expect(page.getByText('Код отправлен на demo@example.com')).toBeVisible()

    const codeInput = page.getByPlaceholder('12345678')
    await expect(codeInput).toBeVisible()
    await codeInput.fill('12345678')

    const loginButton = page.getByRole('button', { name: 'Войти' })
    await loginButton.click()

    await expect(page.getByRole('heading', { name: 'Вы авторизованы' })).toBeVisible()
    await expect(page.getByText('Вы успешно вошли в систему')).toBeVisible()
    await expect(page.locator('.text-success')).toBeVisible()

    const dashboardButton = page.getByRole('button', { name: 'В dashboard' })
    await expect(dashboardButton).toBeVisible()
  })
})
