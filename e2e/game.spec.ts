import { expect, test } from '@playwright/test';

const email = process.env.E2E_SUPABASE_EMAIL ?? '';
const password = process.env.E2E_SUPABASE_PASSWORD ?? '';
const hasCredentials = email.length > 0 && password.length > 0;

test('starts, controls and restarts a match', async ({ page }) => {
  test.skip(
    !hasCredentials,
    'Set E2E_SUPABASE_EMAIL and E2E_SUPABASE_PASSWORD to run this test.',
  );

  await page.goto('/');

  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('button', { name: 'Play' })
    .click();

  await expect(
    page.getByRole('heading', { name: 'Play a match' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Start match' }).click();
  await expect(page.getByRole('status')).toContainText('Live');

  const ball = page.getByTestId('ping-ball');
  const startingLeft = await ball.evaluate((element) =>
    Number.parseFloat((element as HTMLElement).style.left),
  );

  await expect
    .poll(async () =>
      ball.evaluate((element) =>
        Number.parseFloat((element as HTMLElement).style.left),
      ),
    )
    .not.toBe(startingLeft);

  const paddle = page.getByTestId('human-paddle');
  const startingTop = await paddle.evaluate((element) =>
    Number.parseFloat((element as HTMLElement).style.top),
  );

  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(150);
  await page.keyboard.up('ArrowUp');

  const movedTop = await paddle.evaluate((element) =>
    Number.parseFloat((element as HTMLElement).style.top),
  );
  expect(movedTop).toBeLessThan(startingTop);

  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('status')).toContainText('Paused');

  await page.getByRole('button', { name: 'Restart' }).click();
  await expect(page.getByRole('status')).toContainText('Ready');

  const scoreLabels = page.locator('[aria-label$="score"]');
  await expect(scoreLabels.nth(0)).toHaveText('0');
  await expect(scoreLabels.nth(1)).toHaveText('0');
});
