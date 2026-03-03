import { test, expect } from '@playwright/test'
import { login, TEST_USERS } from './helpers'

test.describe('Bejelentkezés', () => {
  test('sikeres bejelentkezés diákként', async ({ page }) => {
    await login(page, 'student')
    await expect(page.locator('text=Főoldal')).toBeVisible({ timeout: 10000 })
  })

  test('sikertelen bejelentkezés hibás jelszóval', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')
    
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    const loginButton = page.locator('button:has-text("Bejelentkezés")')
    
    await emailInput.fill(TEST_USERS.student.email)
    await passwordInput.fill('rossz-jelszo')
    await loginButton.click()
    
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL('/')
  })

  test('bejelentkezés tanárként', async ({ page }) => {
    await login(page, 'teacher')
    await expect(page.locator('text=Főoldal')).toBeVisible({ timeout: 10000 })
  })

  test('bejelentkezés adminként', async ({ page }) => {
    await login(page, 'admin')
    await expect(page.locator('text=Főoldal')).toBeVisible({ timeout: 10000 })
  })
})
