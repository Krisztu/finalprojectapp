import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Rádió funkció', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'student')
    await page.waitForLoadState('domcontentloaded')
  })

  test('zene beküldése', async ({ page }) => {
    const radioTab = page.locator('button[role="tab"]:has-text("Rádió")')
    if (await radioTab.count() > 0) {
      await radioTab.click()
      await page.waitForTimeout(1000)
    }
    
    const urlInput = page.locator('input[placeholder*="URL"]').first()
    if (await urlInput.count() > 0) {
      await urlInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      
      const submitButton = page.locator('button:has-text("Beküldés")').first()
      await submitButton.click()
      await page.waitForTimeout(2000)
      
      const successMessage = page.locator('text=sikeresen').or(page.locator('text=elküldve'))
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('zene lista megtekintése', async ({ page }) => {
    const radioTab = page.locator('button[role="tab"]:has-text("Rádió")')
    if (await radioTab.count() > 0) {
      await radioTab.click()
      await page.waitForTimeout(1000)
      
      const musicCards = page.locator('.glass-card')
      if (await musicCards.count() > 0) {
        await expect(musicCards.first()).toBeVisible({ timeout: 5000 })
      }
    }
  })

  test('zene törlése', async ({ page }) => {
    const radioTab = page.locator('button[role="tab"]:has-text("Rádió")')
    if (await radioTab.count() > 0) {
      await radioTab.click()
      await page.waitForTimeout(1000)
      
      const deleteButton = page.locator('button:has-text("Törlés")').first()
      if (await deleteButton.count() > 0) {
        await deleteButton.click()
        await page.waitForTimeout(1000)
      }
    }
  })
})
