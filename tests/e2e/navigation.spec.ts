import { test, expect, type Page } from '@playwright/test';

const localeHome = '/fr';

async function mockSession(page: Page, role: 'OWNER' | 'TENANT' | 'SUPERADMIN') {
  await page.route('**/api/auth/session**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'test-user',
          name: 'Test User',
          email: 'user@example.com',
          role,
          onboardingCompleted: true,
        },
        expires: new Date(Date.now() + 60_000).toISOString(),
      }),
    });
  });
}

test.describe('Navigation header', () => {
  test('shows public links when signed out', async ({ page }) => {
    await page.goto(localeHome);
    await expect(page.getByRole('link', { name: 'Portfolio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Se connecter' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Créer un compte' })).toBeVisible();
    await expect(page.getByText('Tableau de bord')).toHaveCount(0);
  });

  test('shows owner dashboard links after login', async ({ page }) => {
    await mockSession(page, 'OWNER');
    await page.goto(localeHome);
    await expect(page.getByRole('link', { name: 'Tableau de bord' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se déconnecter' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Créer un compte' })).toHaveCount(0);
  });

  test('mobile menu toggles correctly', async ({ page, browserName }) => {
    await mockSession(page, 'TENANT');
    await page.goto(localeHome);
    const toggle = page.getByRole('button', { name: 'Ouvrir le menu' });
    await toggle.click();
    await expect(page.getByRole('link', { name: 'Tableau de bord' })).toBeVisible();
  });

  test('superadmin sees console link', async ({ page }) => {
    await mockSession(page, 'SUPERADMIN');
    await page.goto(localeHome);
    await expect(page.getByRole('link', { name: 'Console SuperAdmin' })).toBeVisible();
  });
});
