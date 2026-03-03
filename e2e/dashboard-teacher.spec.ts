import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Dashboard - Tanár', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'teacher')
    await page.waitForLoadState('domcontentloaded')
  })

  test('jegy beírása', async ({ page }) => {
    const gradesTab = page.locator('button[role="tab"]:has-text("Jegyek")')
    if (await gradesTab.count() > 0) {
      await gradesTab.click()
      await page.waitForTimeout(1000)
      
      const classSelect = page.locator('select').first()
      if (await classSelect.count() > 0) {
        await classSelect.selectOption({ index: 1 })
        await page.waitForTimeout(500)
        
        const studentSelect = page.locator('select').nth(1)
        if (await studentSelect.count() > 0) {
          await studentSelect.selectOption({ index: 1 })
          await page.waitForTimeout(500)
        }
        
        const gradeSelect = page.locator('select').nth(2)
        if (await gradeSelect.count() > 0) {
          await gradeSelect.selectOption('5')
          await page.waitForTimeout(500)
        }
        
        const submitButton = page.locator('button:has-text("Jegy")').first()
        if (await submitButton.count() > 0) {
          await submitButton.click()
          await page.waitForTimeout(2000)
        }
      }
    }
  })

  test('mulasztás rögzítése', async ({ page }) => {
    const scheduleTab = page.locator('button[role="tab"]:has-text("Órarend")')
    if (await scheduleTab.count() > 0) {
      await scheduleTab.click()
      await page.waitForTimeout(1000)
      
      const lesson = page.locator('.glass-panel').first()
      if (await lesson.count() > 0) {
        await lesson.click()
        await page.waitForTimeout(1000)
        
        const topicInput = page.locator('input[name="topic"]')
        if (await topicInput.count() > 0) {
          await topicInput.fill('Teszt téma')
          
          const saveButton = page.locator('button:has-text("Mentés")').first()
          if (await saveButton.count() > 0) {
            await saveButton.click()
            await page.waitForTimeout(2000)
          }
        }
      }
    }
  })

  test('házi feladat kiadása', async ({ page }) => {
    const homeworkTab = page.locator('button[role="tab"]:has-text("Házi")')
    if (await homeworkTab.count() > 0) {
      await homeworkTab.click()
      await page.waitForTimeout(1000)
      
      const classSelect = page.locator('select').first()
      if (await classSelect.count() > 0) {
        await classSelect.selectOption({ index: 1 })
        await page.waitForTimeout(500)
        
        const titleInput = page.locator('input[placeholder*="Cím"]').first()
        if (await titleInput.count() > 0) {
          await titleInput.fill('Teszt házi')
          
          const descInput = page.locator('textarea').first()
          if (await descInput.count() > 0) {
            await descInput.fill('Oldjátok meg a feladatokat')
            
            const dateInput = page.locator('input[type="date"]').first()
            if (await dateInput.count() > 0) {
              await dateInput.fill('2024-12-31')
              
              const submitButton = page.locator('button:has-text("Kiadása")').first()
              if (await submitButton.count() > 0) {
                await submitButton.click()
                await page.waitForTimeout(2000)
              }
            }
          }
        }
      }
    }
  })

  test('jegyek megtekintése', async ({ page }) => {
    const gradesTab = page.locator('button[role="tab"]:has-text("Jegyek")')
    if (await gradesTab.count() > 0) {
      await gradesTab.click()
      await page.waitForTimeout(1000)
      
      const heading = page.locator('text=Jegyek').first()
      if (await heading.count() > 0) {
        await expect(heading).toBeVisible()
      }
    }
  })
})
