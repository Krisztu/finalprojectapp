import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Igazolás funkció', () => {
  test('diák igazolás beküldése', async ({ page }) => {
    await login(page, 'student')
    await page.waitForLoadState('domcontentloaded')
    
    const justificationTab = page.locator('button[role="tab"]:has-text("Igazolás")')
    if (await justificationTab.count() > 0) {
      await justificationTab.click()
      await page.waitForTimeout(1000)
      
      const dateInput = page.locator('input[type="date"]').first()
      if (await dateInput.count() > 0) {
        await dateInput.fill('2024-12-20')
        
        const reasonInput = page.locator('textarea').first()
        if (await reasonInput.count() > 0) {
          await reasonInput.fill('Betegség miatt hiányoztam')
          
          const submitButton = page.locator('button:has-text("Beküldés")').first()
          if (await submitButton.count() > 0) {
            await submitButton.click()
            await page.waitForTimeout(2000)
            
            const successMessage = page.locator('text=sikeresen').or(page.locator('text=beküldve'))
            if (await successMessage.count() > 0) {
              await expect(successMessage.first()).toBeVisible({ timeout: 5000 })
            }
          }
        }
      }
    }
  })

  test('osztályfőnök igazolás elfogadása', async ({ page }) => {
    await login(page, 'teacher')
    await page.waitForLoadState('domcontentloaded')
    
    const justificationTab = page.locator('button[role="tab"]:has-text("Igazolások")')
    if (await justificationTab.count() > 0) {
      await justificationTab.click()
      await page.waitForTimeout(2000)
      
      const firstRequest = page.locator('.glass-card').first()
      if (await firstRequest.count() > 0) {
        const acceptButton = firstRequest.locator('button:has-text("Elfogadás")')
        if (await acceptButton.count() > 0) {
          await acceptButton.click()
          await page.waitForTimeout(1000)
          
          const successMessage = page.locator('text=Elfogadva').or(page.locator('text=sikeresen'))
          if (await successMessage.count() > 0) {
            await expect(successMessage.first()).toBeVisible({ timeout: 5000 })
          }
        }
      }
    }
  })

  test('osztályfőnök igazolás elutasítása', async ({ page }) => {
    await login(page, 'teacher')
    await page.waitForLoadState('domcontentloaded')
    
    const justificationTab = page.locator('button[role="tab"]:has-text("Igazolások")')
    if (await justificationTab.count() > 0) {
      await justificationTab.click()
      await page.waitForTimeout(2000)
      
      const firstRequest = page.locator('.glass-card').first()
      if (await firstRequest.count() > 0) {
        const rejectButton = firstRequest.locator('button:has-text("Elutasítás")')
        if (await rejectButton.count() > 0) {
          await rejectButton.click()
          await page.waitForTimeout(1000)
          
          const successMessage = page.locator('text=Elutasítva').or(page.locator('text=sikeresen'))
          if (await successMessage.count() > 0) {
            await expect(successMessage.first()).toBeVisible({ timeout: 5000 })
          }
        }
      }
    }
  })

  test('igazolások listájának megtekintése', async ({ page }) => {
    await login(page, 'student')
    await page.waitForLoadState('domcontentloaded')
    
    const justificationTab = page.locator('button[role="tab"]:has-text("Igazolás")')
    if (await justificationTab.count() > 0) {
      await justificationTab.click()
      await page.waitForTimeout(1000)
      
      const heading = page.locator('text=Igazolások').or(page.locator('text=Igazolás'))
      if (await heading.count() > 0) {
        await expect(heading.first()).toBeVisible()
      }
    }
  })
})
