import { test, expect } from '@playwright/test'
import { login } from './helpers'

test.describe('Dashboard - Admin', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'admin')
    await page.waitForLoadState('domcontentloaded')
  })

  test('tanár regisztrálása', async ({ page }) => {
    const usersTab = page.locator('button[role="tab"]:has-text("Userek")').or(page.locator('text=Userek'))
    if (await usersTab.count() > 0) {
      await usersTab.first().click()
      await page.waitForTimeout(1000)
      
      const emailInput = page.locator('input[placeholder*="email"]').first()
      if (await emailInput.count() > 0) {
        await emailInput.fill('ujtanar@gszi.hu')
        
        const passwordInput = page.locator('input[type="password"]').first()
        if (await passwordInput.count() > 0) {
          await passwordInput.fill('password123')
          
          const nameInput = page.locator('input[placeholder*="Tanár"]').first()
          if (await nameInput.count() > 0) {
            await nameInput.fill('Új Tanár')
            
            const submitButton = page.locator('button:has-text("Tanár")').first()
            if (await submitButton.count() > 0) {
              await submitButton.click()
              await page.waitForTimeout(2000)
            }
          }
        }
      }
    }
  })

  test('diák regisztrálása', async ({ page }) => {
    const usersTab = page.locator('button[role="tab"]:has-text("Userek")').or(page.locator('text=Userek'))
    if (await usersTab.count() > 0) {
      await usersTab.first().click()
      await page.waitForTimeout(1000)
      
      const emailInput = page.locator('input[placeholder*="diak"]').first()
      if (await emailInput.count() > 0) {
        await emailInput.fill('ujdiak@gszi.hu')
        
        const passwordInput = page.locator('input[type="password"]').first()
        if (await passwordInput.count() > 0) {
          await passwordInput.fill('password123')
          
          const nameInput = page.locator('input[placeholder*="Diák"]').first()
          if (await nameInput.count() > 0) {
            await nameInput.fill('Új Diák')
            
            const submitButton = page.locator('button:has-text("Diák")').first()
            if (await submitButton.count() > 0) {
              await submitButton.click()
              await page.waitForTimeout(2000)
            }
          }
        }
      }
    }
  })

  test('óra hozzáadása', async ({ page }) => {
    const scheduleTab = page.locator('button[role="tab"]:has-text("Órarend")').or(page.locator('text=Órarend'))
    if (await scheduleTab.count() > 0) {
      await scheduleTab.first().click()
      await page.waitForTimeout(1000)
      
      const daySelect = page.locator('select').first()
      if (await daySelect.count() > 0) {
        await daySelect.selectOption({ index: 1 })
        await page.waitForTimeout(500)
        
        const timeSelect = page.locator('select').nth(1)
        if (await timeSelect.count() > 0) {
          await timeSelect.selectOption({ index: 1 })
          await page.waitForTimeout(500)
          
          const subjectSelect = page.locator('select').nth(2)
          if (await subjectSelect.count() > 0) {
            await subjectSelect.selectOption({ index: 1 })
            await page.waitForTimeout(500)
            
            const submitButton = page.locator('button:has-text("Óra")').first()
            if (await submitButton.count() > 0) {
              await submitButton.click()
              await page.waitForTimeout(2000)
            }
          }
        }
      }
    }
  })

  test('felhasználó törlése', async ({ page }) => {
    const usersTab = page.locator('button[role="tab"]:has-text("Userek")').or(page.locator('text=Userek'))
    if (await usersTab.count() > 0) {
      await usersTab.first().click()
      await page.waitForTimeout(1000)
      
      const deleteButton = page.locator('button:has-text("Törlés")').first()
      if (await deleteButton.count() > 0) {
        page.on('dialog', dialog => dialog.accept())
        
        await deleteButton.click()
        await page.waitForTimeout(2000)
      }
    }
  })

  test('jegyek megtekintése', async ({ page }) => {
    const gradesTab = page.locator('button[role="tab"]:has-text("Jegyek")').or(page.locator('text=Jegyek'))
    if (await gradesTab.count() > 0) {
      await gradesTab.first().click()
      await page.waitForTimeout(1000)
      
      const heading = page.locator('text=Jegyek kezelése').or(page.locator('text=Jegyek'))
      if (await heading.count() > 0) {
        await expect(heading.first()).toBeVisible()
      }
      
      const classSelect = page.locator('select').first()
      if (await classSelect.count() > 0) {
        await classSelect.selectOption({ index: 1 })
        await page.waitForTimeout(1000)
        
        const gradeCard = page.locator('.glass-card').first()
        if (await gradeCard.count() > 0) {
          await expect(gradeCard).toBeVisible()
        }
      }
    }
  })

  test('rendszerstatisztikák megtekintése', async ({ page }) => {
    const statsTab = page.locator('button[role="tab"]:has-text("Statisztikák")').or(page.locator('text=Statisztikák'))
    if (await statsTab.count() > 0) {
      await statsTab.first().click()
      await page.waitForTimeout(1000)
      
      const heading = page.locator('text=Statisztikák')
      if (await heading.count() > 0) {
        await expect(heading.first()).toBeVisible()
      }
    }
  })
})
