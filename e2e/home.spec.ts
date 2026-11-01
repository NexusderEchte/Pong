import { expect, test } from '@playwright/test';

test('renders the login page on the home route', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /willkommen zurück/i }),
  ).toBeVisible();
});
