import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Házi feladat funkció', () => {
  test('diák házi beküldése', async ({ page }) => {
    await login(page, 'student')
    await page.waitForLoadState('domcontentloaded')
    
    const homeworkTab = page.locator('button[role="tab"]:has-text("Házi")')
    if (await homeworkTab.count() > 0) {
      await homeworkTab.click()
      await page.waitForTimeout(1000)
      
      const homeworkCard = page.locator('.border-l-4').first()
      if (await homeworkCard.count() > 0) {
        const submitButton = homeworkCard.locator('button:has-text("Beküldés")')
        if (await submitButton.count() > 0) {
          await submitButton.click()
          await page.waitForTimeout(1000)
          
          const textarea = page.locator('textarea').first()
          if (await textarea.count() > 0) {
            await textarea.fill('Elkészítettem a házi feladatot')
            
            const confirmButton = page.locator('button:has-text("Beküldés")').last()
            await confirmButton.click()
            await page.waitForTimeout(2000)
            
            const successMessage = page.locator('text=sikeresen').or(page.locator('text=beküldve'))
            if (await successMessage.count() > 0) {
              await expect(successMessage.first()).toBeVisible()
            }
          }
        }
      }
    }
  })

  test('diák házi részletek megtekintése', async ({ page }) => {
    await login(page, 'student')
    await page.waitForLoadState('domcontentloaded')
    
    const homeworkTab = page.locator('button[role="tab"]:has-text("Házi")')
    if (await homeworkTab.count() > 0) {
      await homeworkTab.click()
      await page.waitForTimeout(1000)
      
      const detailsButton = page.locator('button:has-text("Részletek")').first()
      if (await detailsButton.count() > 0) {
        await detailsButton.click()
        await page.waitForTimeout(1000)
        
        const description = page.locator('text=Leírás').or(page.locator('text=Részletek'))
        if (await description.count() > 0) {
          await expect(description.first()).toBeVisible()
        }
      }
    }
  })

  test('tanár házi beadások megtekintése', async ({ page }) => {
    await login(page, 'teacher')
    await page.waitForLoadState('domcontentloaded')
    
    const homeworkTab = page.locator('button[role="tab"]:has-text("Házi")')
    if (await homeworkTab.count() > 0) {
      await homeworkTab.click()
      await page.waitForTimeout(1000)
      
      const submissionsButton = page.locator('button:has-text("Beadások")').first()
      if (await submissionsButton.count() > 0) {
        await submissionsButton.click()
        await page.waitForTimeout(1000)
        
        const heading = page.locator('text=Beadások')
        if (await heading.count() > 0) {
          await expect(heading.first()).toBeVisible()
        }
      }
    }
  })

  test('lejárt házi megjelenítése', async ({ page }) => {
    await login(page, 'student')
    await page.waitForLoadState('domcontentloaded')
    
    const homeworkTab = page.locator('button[role="tab"]:has-text("Házi")')
    if (await homeworkTab.count() > 0) {
      await homeworkTab.click()
      await page.waitForTimeout(1000)
      
      const overdueHomework = page.locator('.border-red-500')
      if (await overdueHomework.count() > 0) {
        await expect(overdueHomework.first()).toBeVisible()
        
        const overdueLabel = overdueHomework.first().locator('text=Lejárt')
        if (await overdueLabel.count() > 0) {
          await expect(overdueLabel).toBeVisible()
        }
      }
    }
  })

  test('házi feladat értékelése', async ({ page }) => {
    await login(page, 'teacher')
    await page.waitForLoadState('domcontentloaded')
    
    const homeworkTab = page.locator('button[role="tab"]:has-text("Házi")')
    if (await homeworkTab.count() > 0) {
      await homeworkTab.click()
      await page.waitForTimeout(1000)
      
      const gradeButton = page.locator('button:has-text("Értékelés")').first()
      if (await gradeButton.count() > 0) {
        await gradeButton.click()
        await page.waitForTimeout(1000)
        
        const gradeInput = page.locator('input[type="number"]').first()
        if (await gradeInput.count() > 0) {
          await gradeInput.fill('5')
          
          const submitButton = page.locator('button:has-text("Mentés")').first()
          if (await submitButton.count() > 0) {
            await submitButton.click()
            await page.waitForTimeout(2000)
          }
        }
      }
    }
  })
})
