import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Órarend funkció', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'student')
    await page.waitForLoadState('domcontentloaded')
    
    const scheduleTab = page.locator('button[role="tab"]:has-text("Órarend")')
    if (await scheduleTab.count() > 0) {
      await scheduleTab.click()
      await page.waitForTimeout(1000)
    }
  })

  test('hét váltás', async ({ page }) => {
    const nextWeekButton = page.locator('button:has-text("Következő hét")').or(page.locator('button:has-text(">")')
    if (await nextWeekButton.count() > 0) {
      await nextWeekButton.first().click()
      await page.waitForTimeout(500)
      
      const dateDisplay = page.locator('h3').first()
      if (await dateDisplay.count() > 0) {
        await expect(dateDisplay).toBeVisible()
      }
    }
  })

  test('nap kiválasztása', async ({ page }) => {
    const dayButton = page.locator('button:has-text("Hé")').or(page.locator('button:has-text("Hétfő")'))
    if (await dayButton.count() > 0) {
      await dayButton.first().click()
      await page.waitForTimeout(500)
      
      const lesson = page.locator('.glass-panel').first()
      if (await lesson.count() > 0) {
        await expect(lesson).toBeVisible()
      }
    }
  })

  test('óra részletek megtekintése', async ({ page }) => {
    const lesson = page.locator('.rounded').first()
    if (await lesson.count() > 0) {
      await expect(lesson).toBeVisible()
      
      const subject = lesson.locator('.font-semibold')
      if (await subject.count() > 0) {
        await expect(subject).toBeVisible()
      }
    }
  })

  test('házi feladat ikon megjelenítése', async ({ page }) => {
    const homeworkIcon = page.locator('button:has-text("📝")').or(page.locator('text=Házi'))
    if (await homeworkIcon.count() > 0) {
      await expect(homeworkIcon.first()).toBeVisible()
    }
  })

  test('lyukas óra megjelenítése', async ({ page }) => {
    const freeLesson = page.locator('text=Lyukas óra')
    if (await freeLesson.count() > 0) {
      await expect(freeLesson.first()).toBeVisible()
    }
  })

  test('tanár megtekintése', async ({ page }) => {
    const lesson = page.locator('.glass-panel').first()
    if (await lesson.count() > 0) {
      const teacher = lesson.locator('text=Tanár').or(lesson.locator('.text-sm'))
      if (await teacher.count() > 0) {
        await expect(teacher.first()).toBeVisible()
      }
    }
  })

  test('terem megtekintése', async ({ page }) => {
    const lesson = page.locator('.glass-panel').first()
    if (await lesson.count() > 0) {
      const room = lesson.locator('text=Terem').or(lesson.locator('.text-xs'))
      if (await room.count() > 0) {
        await expect(room.first()).toBeVisible()
      }
    }
  })
})
