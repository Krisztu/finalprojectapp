import { Page } from '@playwright/test'

export const TEST_USERS = {
  student: {
    email: 'csabaszilagyi1@lumine.edu.hu',
    password: 'diak123456',
  },
  teacher: {
    email: 'nagyp@lumine.edu.hu',
    password: 'tanar123456',
  },
  admin: {
    email: 'admin@lumine.edu.hu',
    password: 'admin123',
  },
  dj: {
    email: 'dj@lumine.edu.hu',
    password: 'dj123456',
  },
}

export async function login(page: Page, userType: keyof typeof TEST_USERS) {
  const user = TEST_USERS[userType]
  
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('domcontentloaded')
  
  const emailInput = page.locator('input[type="email"]')
  const passwordInput = page.locator('input[type="password"]')
  const loginButton = page.locator('button:has-text("Bejelentkezés")')
  
  if (await emailInput.count() > 0) {
    await emailInput.fill(user.email)
  }
  
  if (await passwordInput.count() > 0) {
    await passwordInput.fill(user.password)
  }
  
  if (await loginButton.count() > 0) {
    await loginButton.click()
  }
  
  await page.waitForURL('**/dashboard', { timeout: 60000 })
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1000)
}

export async function logout(page: Page) {
  const logoutButton = page.locator('button:has-text("Kilépés")').or(page.locator('button[aria-label*="logout"]'))
  
  if (await logoutButton.count() > 0) {
    await logoutButton.first().click()
    await page.waitForURL('/', { timeout: 30000 })
  }
}

export async function waitForElement(page: Page, selector: string, timeout: number = 5000) {
  const element = page.locator(selector)
  await element.waitFor({ timeout })
  return element
}

export async function clickIfExists(page: Page, selector: string) {
  const element = page.locator(selector)
  if (await element.count() > 0) {
    await element.first().click()
    return true
  }
  return false
}

export async function fillIfExists(page: Page, selector: string, value: string) {
  const element = page.locator(selector)
  if (await element.count() > 0) {
    await element.first().fill(value)
    return true
  }
  return false
}

export async function selectIfExists(page: Page, selector: string, value: string | { index: number }) {
  const element = page.locator(selector)
  if (await element.count() > 0) {
    await element.first().selectOption(value)
    return true
  }
  return false
}
