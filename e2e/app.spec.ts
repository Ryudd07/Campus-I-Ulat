import { expect, test } from '@playwright/test';

test('opens on Home with the report categories', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Tap a category to start a report.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Maintenance' })).toBeVisible();
});
