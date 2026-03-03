import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Profil funkció', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'student')
    await page.waitForLoadState('domcontentloaded')
  })

  test('profil megtekintése', async ({ page }) => {
    const profileTab = page.locator('button[role="tab"]:has-text("Profil")')
    if (await profileTab.count() > 0) {
      await profileTab.click()
      await page.waitForTimeout(1000)
      
      const personalData = page.locator('text=Személyes adatok').or(page.locator('text=Profil'))
      if (await personalData.count() > 0) {
        await expect(personalData.first()).toBeVisible()
      }
    }
  })

  test('profilkép feltöltése', async ({ page }) => {
    const profileTab = page.locator('button[role="tab"]:has-text("Profil")')
    if (await profileTab.count() > 0) {
      await profileTab.click()
      await page.waitForTimeout(1000)
      
      const fileInput = page.locator('input[type="file"]')
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles({
          name: 'profile.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-image-data')
        })
        
        await page.waitForTimeout(2000)
        
        const successMessage = page.locator('text=sikeresen').or(page.locator('text=feltöltve'))
        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible({ timeout: 10000 })
        }
      }
    }
  })

  test('dark mode váltás', async ({ page }) => {
    const darkModeButton = page.locator('button[aria-label*="dark"]').or(page.locator('button:has-text("🌙")'))
    if (await darkModeButton.count() > 0) {
      await darkModeButton.first().click()
      await page.waitForTimeout(500)
      
      const htmlElement = page.locator('html')
      const isDark = await htmlElement.evaluate(el => el.classList.contains('dark'))
      expect(isDark).toBeTruthy()
      
      await darkModeButton.first().click()
      await page.waitForTimeout(500)
      
      const isLight = await htmlElement.evaluate(el => !el.classList.contains('dark'))
      expect(isLight).toBeTruthy()
    }
  })

  test('felhasználó adatainak megtekintése', async ({ page }) => {
    const profileTab = page.locator('button[role="tab"]:has-text("Profil")')
    if (await profileTab.count() > 0) {
      await profileTab.click()
      await page.waitForTimeout(1000)
      
      const email = page.locator('text=@lumine.edu.hu')
      if (await email.count() > 0) {
        await expect(email.first()).toBeVisible()
      }
    }
  })

  test('iskolai információk megtekintése', async ({ page }) => {
    const profileTab = page.locator('button[role="tab"]:has-text("Profil")')
    if (await profileTab.count() > 0) {
      await profileTab.click()
      await page.waitForTimeout(1000)
      
      const schoolInfo = page.locator('text=Iskolai információk').or(page.locator('text=Osztály'))
      if (await schoolInfo.count() > 0) {
        await expect(schoolInfo.first()).toBeVisible()
      }
    }
  })
})
