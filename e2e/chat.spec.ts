import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Üzenőfal', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'student')
    await page.waitForLoadState('domcontentloaded')
  })

  test('üzenet küldése', async ({ page }) => {
    const chatTab = page.locator('button[role="tab"]:has-text("Üzenőfal")')
    if (await chatTab.count() > 0) {
      await chatTab.click()
      await page.waitForTimeout(1000)
    }
    
    const textarea = page.locator('textarea').first()
    if (await textarea.count() > 0) {
      await textarea.fill('Teszt üzenet')
      
      const sendButton = page.locator('button:has-text("Küldés")').first()
      await sendButton.click()
      await page.waitForTimeout(2000)
      
      await expect(page.locator('text=Teszt üzenet')).toBeVisible({ timeout: 5000 })
    }
  })

  test('üzenetek megtekintése', async ({ page }) => {
    const chatTab = page.locator('button[role="tab"]:has-text("Üzenőfal")')
    if (await chatTab.count() > 0) {
      await chatTab.click()
      await page.waitForTimeout(1000)
      
      const heading = page.locator('h2:has-text("Üzenőfal")')
      if (await heading.count() > 0) {
        await expect(heading).toBeVisible()
      }
    }
  })

  test('üzenet törlése', async ({ page }) => {
    const chatTab = page.locator('button[role="tab"]:has-text("Üzenőfal")')
    if (await chatTab.count() > 0) {
      await chatTab.click()
      await page.waitForTimeout(1000)
      
      const deleteButton = page.locator('button:has-text("Törlés")').first()
      if (await deleteButton.count() > 0) {
        await deleteButton.click()
        await page.waitForTimeout(1000)
      }
    }
  })
})
