import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'

const VALID_EMAIL = 'demo@example.com'
const VALID_CODE = '12345678'

const uniqueId = () => Math.random().toString(36).slice(2, 8)

const login = async (page: Page) => {
  await page.goto('/auth')
  await expect(page.getByRole('heading', { name: 'Вход в систему' })).toBeVisible()
  await page.waitForLoadState('networkidle')

  const emailInput = page.getByPlaceholder('admin@example.ru')
  await emailInput.waitFor({ state: 'attached' })
  await emailInput.fill(VALID_EMAIL)
  await page.getByRole('button', { name: 'Получить код' }).click()

  await expect(page.getByRole('heading', { name: 'Введите код' })).toBeVisible()
  const firstDigitInput = page.getByRole('textbox', { name: 'Цифра 1 из 8' })
  await firstDigitInput.click()
  await page.keyboard.type(VALID_CODE)

  await expect(page.getByText('Добро пожаловать!')).toBeVisible()
}

const navigateToContacts = async (page: Page) => {
  await page.goto('/settings/contacts')
  await expect(page.getByRole('button', { name: '+ Добавить контакт' })).toBeVisible()
  await page.waitForLoadState('networkidle')
}

const addContact = async (page: Page, kind: 'email' | 'telegram', value: string) => {
  await page.getByRole('button', { name: '+ Добавить контакт' }).click()

  if (kind === 'telegram') {
    await page.getByRole('combobox').selectOption('telegram')
  }

  const placeholder = kind === 'email' ? 'user@example.com' : '@username'
  await page.getByPlaceholder(placeholder).fill(value)
  await page.getByRole('button', { name: 'Добавить' }).click()

  await expect(page.getByText('Контакт добавлен')).toBeVisible()
}

test.describe('Contacts - Display', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateToContacts(page)
  })

  test('displays contacts section', async ({ page }) => {
    await expect(page.getByText('Контакты для уведомлений')).toBeVisible()
    await expect(page.getByRole('button', { name: '+ Добавить контакт' })).toBeVisible()
  })

  test('displays verified contact from mock data', async ({ page }) => {
    await expect(page.getByText('user@example.com')).toBeVisible()
    const verifiedContact = page.locator('.rounded-lg', { hasText: 'user@example.com' })
    await expect(verifiedContact.getByText('Подтверждён')).toBeVisible()
  })
})

test.describe('Contacts - Add', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateToContacts(page)
  })

  test('opens add contact form', async ({ page }) => {
    await page.getByRole('button', { name: '+ Добавить контакт' }).click()

    await expect(page.getByRole('combobox')).toBeVisible()
    await expect(page.getByPlaceholder('user@example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Добавить' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Отмена' })).toBeVisible()
  })

  test('cancels add contact form', async ({ page }) => {
    await page.getByRole('button', { name: '+ Добавить контакт' }).click()
    await page.getByRole('button', { name: 'Отмена' }).click()

    await expect(page.getByRole('button', { name: '+ Добавить контакт' })).toBeVisible()
    await expect(page.getByPlaceholder('user@example.com')).not.toBeVisible()
  })

  test('adds new email contact', async ({ page }) => {
    const email = `newemail${uniqueId()}@test.com`
    await page.getByRole('button', { name: '+ Добавить контакт' }).click()

    await page.getByPlaceholder('user@example.com').fill(email)
    await page.getByRole('button', { name: 'Добавить' }).click()

    await expect(page.getByText('Контакт добавлен')).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()
  })

  test('adds new telegram contact', async ({ page }) => {
    const username = `newtg${uniqueId()}`
    await page.getByRole('button', { name: '+ Добавить контакт' }).click()

    await page.getByRole('combobox').selectOption('telegram')
    await expect(page.getByPlaceholder('@username')).toBeVisible()

    await page.getByPlaceholder('@username').fill(username)
    await page.getByRole('button', { name: 'Добавить' }).click()

    await expect(page.getByText('Контакт добавлен')).toBeVisible()
    await expect(page.getByText(`@${username}`)).toBeVisible()
  })

  test('auto-adds @ to telegram username', async ({ page }) => {
    const username = `autoat${uniqueId()}`
    await page.getByRole('button', { name: '+ Добавить контакт' }).click()

    await page.getByRole('combobox').selectOption('telegram')
    await page.getByPlaceholder('@username').fill(username)
    await page.getByRole('button', { name: 'Добавить' }).click()

    await expect(page.getByText(`@${username}`)).toBeVisible()
  })

  test('shows error for invalid email', async ({ page }) => {
    await page.getByRole('button', { name: '+ Добавить контакт' }).click()

    await page.getByPlaceholder('user@example.com').fill('invalid-email')
    await page.getByRole('button', { name: 'Добавить' }).click()

    await expect(page.getByText('Некорректный email')).toBeVisible()
  })

  test('shows error for invalid telegram username', async ({ page }) => {
    await page.getByRole('button', { name: '+ Добавить контакт' }).click()

    await page.getByRole('combobox').selectOption('telegram')
    await page.getByPlaceholder('@username').fill('ab')
    await page.getByRole('button', { name: 'Добавить' }).click()

    await expect(page.getByText('Некорректный Telegram username')).toBeVisible()
  })

  test('shows error for duplicate contact', async ({ page }) => {
    await page.getByRole('button', { name: '+ Добавить контакт' }).click()

    await page.getByPlaceholder('user@example.com').fill('user@example.com')
    await page.getByRole('button', { name: 'Добавить' }).click()

    await expect(page.getByText('Такой контакт уже существует')).toBeVisible()
  })
})

test.describe('Contacts - Verify', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateToContacts(page)
  })

  test('does not show verify button for verified contact', async ({ page }) => {
    const verifiedContact = page.locator('.rounded-lg', { hasText: 'user@example.com' })
    await expect(verifiedContact.getByRole('button', { name: 'Подтвердить' })).not.toBeVisible()
  })

  test('shows verify button for new unverified contact', async ({ page }) => {
    const username = `vbtn${uniqueId()}`
    await addContact(page, 'telegram', username)

    const unverifiedContact = page.locator('.rounded-lg', { hasText: `@${username}` })
    await expect(unverifiedContact.getByRole('button', { name: 'Подтвердить' })).toBeVisible()
  })

  test('opens verification form', async ({ page }) => {
    const username = `vform${uniqueId()}`
    await addContact(page, 'telegram', username)

    const unverifiedContact = page.locator('.rounded-lg', { hasText: `@${username}` })
    await unverifiedContact.getByRole('button', { name: 'Подтвердить' }).click()

    await expect(page.getByPlaceholder('Код')).toBeVisible()
    await expect(page.getByRole('button', { name: 'OK' })).toBeVisible()
  })

  test('verifies contact with correct code', async ({ page }) => {
    const username = `vcode${uniqueId()}`
    await addContact(page, 'telegram', username)

    const unverifiedContact = page.locator('.rounded-lg', { hasText: `@${username}` })
    await unverifiedContact.getByRole('button', { name: 'Подтвердить' }).click()

    await page.getByPlaceholder('Код').fill(VALID_CODE)
    await page.getByRole('button', { name: 'OK' }).click()

    await expect(page.getByText('Контакт подтверждён')).toBeVisible()
  })

  test('shows error for invalid verification code', async ({ page }) => {
    const username = `vinv${uniqueId()}`
    await addContact(page, 'telegram', username)

    const unverifiedContact = page.locator('.rounded-lg', { hasText: `@${username}` })
    await unverifiedContact.getByRole('button', { name: 'Подтвердить' }).click()

    await page.getByPlaceholder('Код').fill('00000000')
    await page.getByRole('button', { name: 'OK' }).click()

    await expect(page.getByText('Неверный код')).toBeVisible()
  })

  test('cancels verification form', async ({ page }) => {
    const username = `vcancel${uniqueId()}`
    await addContact(page, 'telegram', username)

    const unverifiedContact = page.locator('.rounded-lg', { hasText: `@${username}` })
    await unverifiedContact.getByRole('button', { name: 'Подтвердить' }).click()

    await page.getByRole('button', { name: 'Отмена' }).click()

    await expect(page.getByPlaceholder('Код')).not.toBeVisible()
    await expect(unverifiedContact.getByRole('button', { name: 'Подтвердить' })).toBeVisible()
  })
})

test.describe('Contacts - Delete', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await navigateToContacts(page)
  })

  test('shows delete button for verified contact', async ({ page }) => {
    const verifiedContact = page.locator('.rounded-lg', { hasText: 'user@example.com' })
    await expect(verifiedContact.getByRole('button', { name: 'Удалить' })).toBeVisible()
  })

  test('shows delete button for unverified contact', async ({ page }) => {
    const username = `delbtn${uniqueId()}`
    await addContact(page, 'telegram', username)

    const unverifiedContact = page.locator('.rounded-lg', { hasText: `@${username}` })
    await expect(unverifiedContact.getByRole('button', { name: 'Удалить' })).toBeVisible()
  })

  test('deletes contact', async ({ page }) => {
    const email = `todelete${uniqueId()}@test.com`
    await addContact(page, 'email', email)
    await expect(page.getByText(email)).toBeVisible()

    const contactToDelete = page.locator('.rounded-lg', { hasText: email })
    await contactToDelete.getByRole('button', { name: 'Удалить' }).click()

    await expect(page.getByText('Контакт удалён')).toBeVisible()
    await expect(page.getByText(email)).not.toBeVisible()
  })
})
