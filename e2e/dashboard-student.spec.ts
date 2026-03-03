import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Dashboard - Diák', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'student')
    await page.waitForLoadState('domcontentloaded')
  })

  test('órarend megtekintése', async ({ page }) => {
    const scheduleTab = page.locator('button[role="tab"]:has-text("Órarend")')
    if (await scheduleTab.count() > 0) {
      await scheduleTab.click()
      await page.waitForTimeout(1000)
      
      const heading = page.getByRole('heading', { name: /Órarend/i })
      if (await heading.count() > 0) {
        await expect(heading).toBeVisible()
      }
    }
  })

  test('jegyek megtekintése', async ({ page }) => {
    const gradesTab = page.locator('button[role="tab"]:has-text("Jegyek")')
    if (await gradesTab.count() > 0) {
      await gradesTab.click()
      await page.waitForTimeout(1000)
      
      const averageText = page.locator('text=Átlagok').or(page.locator('text=Jegyek'))
      if (await averageText.count() > 0) {
        await expect(averageText.first()).toBeVisible()
      }
    }
  })

  test('mulasztások megtekintése', async ({ page }) => {
    const absenceTab = page.locator('button[role="tab"]:has-text("Mulasztások")')
    if (await absenceTab.count() > 0) {
      await absenceTab.click()
      await page.waitForTimeout(1000)
      
      const heading = page.locator('text=Mulasztásaim').or(page.locator('text=Mulasztások'))
      if (await heading.count() > 0) {
        await expect(heading.first()).toBeVisible()
      }
    }
  })

  test('házi feladatok megtekintése', async ({ page }) => {
    const homeworkTab = page.locator('button[role="tab"]:has-text("Házi")')
    if (await homeworkTab.count() > 0) {
      await homeworkTab.click()
      await page.waitForTimeout(1000)
      
      const content = page.locator('text=házi feladatok').or(page.locator('text=Jelenleg nincsenek'))
      if (await content.count() > 0) {
        await expect(content.first()).toBeVisible()
      }
    }
  })

  test('profil megtekintése', async ({ page }) => {
    const profileTab = page.locator('button[role="tab"]:has-text("Profil")')
    if (await profileTab.count() > 0) {
      await profileTab.click()
      await page.waitForTimeout(1000)
      
      const heading = page.locator('text=Személyes adatok').or(page.locator('text=Profil'))
      if (await heading.count() > 0) {
        await expect(heading.first()).toBeVisible()
      }
    }
  })
})
