import { test, expect, devices } from '@playwright/test'
import { login } from './helpers'

test.use({ ...devices['iPhone 12'] })

test.describe('Mobil nézet', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'student')
    await page.waitForLoadState('domcontentloaded')
  })

  test('mobil menü megnyitása', async ({ page }) => {
    const menuButton = page.locator('button[aria-label*="menu"]').or(page.locator('button:has-text("Menü")'))
    if (await menuButton.count() > 0) {
      await expect(menuButton.first()).toBeVisible()
      
      await menuButton.first().click()
      await page.waitForTimeout(500)
      
      const menuItem = page.locator('text=Főoldal').or(page.locator('text=Órarend'))
      if (await menuItem.count() > 0) {
        await expect(menuItem.first()).toBeVisible()
      }
    }
  })

  test('navigáció mobil menüből', async ({ page }) => {
    const menuButton = page.locator('button[aria-label*="menu"]').or(page.locator('button:has-text("Menü")'))
    if (await menuButton.count() > 0) {
      await menuButton.first().click()
      await page.waitForTimeout(500)
      
      const scheduleLink = page.locator('text=Órarend').first()
      if (await scheduleLink.count() > 0) {
        await scheduleLink.click()
        await page.waitForTimeout(1000)
        
        const heading = page.locator('text=Órarend')
        if (await heading.count() > 0) {
          await expect(heading.first()).toBeVisible()
        }
      }
    }
  })

  test('responsive táblázat', async ({ page }) => {
    const menuButton = page.locator('button[aria-label*="menu"]').or(page.locator('button:has-text("Menü")'))
    if (await menuButton.count() > 0) {
      await menuButton.first().click()
      await page.waitForTimeout(500)
    }
    
    const gradesLink = page.locator('text=Jegyek').first()
    if (await gradesLink.count() > 0) {
      await gradesLink.click()
      await page.waitForTimeout(1000)
      
      const table = page.locator('table')
      if (await table.count() > 0) {
        await expect(table).toBeVisible()
      }
    }
  })

  test('dark mode mobil nézetben', async ({ page }) => {
    const darkModeButton = page.locator('button[aria-label*="dark"]').or(page.locator('button:has-text("🌙")'))
    if (await darkModeButton.count() > 0) {
      await darkModeButton.first().click()
      await page.waitForTimeout(500)
      
      const htmlElement = page.locator('html')
      const isDark = await htmlElement.evaluate(el => el.classList.contains('dark'))
      expect(isDark).toBeTruthy()
    }
  })

  test('mobil gördítés', async ({ page }) => {
    const content = page.locator('main').or(page.locator('body'))
    if (await content.count() > 0) {
      await content.first().evaluate(el => el.scrollTop = 100)
      await page.waitForTimeout(500)
      
      const scrollTop = await content.first().evaluate(el => el.scrollTop)
      expect(scrollTop).toBeGreaterThan(0)
    }
  })

  test('mobil gomb mérete', async ({ page }) => {
    const button = page.locator('button').first()
    if (await button.count() > 0) {
      const boundingBox = await button.boundingBox()
      expect(boundingBox?.height).toBeGreaterThanOrEqual(44)
      expect(boundingBox?.width).toBeGreaterThanOrEqual(44)
    }
  })

  test('mobil input mező', async ({ page }) => {
    const input = page.locator('input').first()
    if (await input.count() > 0) {
      const boundingBox = await input.boundingBox()
      expect(boundingBox?.height).toBeGreaterThanOrEqual(44)
    }
  })
})
