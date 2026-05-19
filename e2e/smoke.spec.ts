import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('copperline.userId', '1'));
});

test('dashboard shows four summary cards', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId('dashboard-card')).toHaveCount(4);
});

test('my requests lists Ava’s requests', async ({ page }) => {
  await page.goto('/requests');
  const table = page.getByTestId('requests-table');
  await expect(table.getByRole('row').nth(1)).toContainText('Ava Patel');
});

test('a manager sees the webcam requests waiting for approval', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByLabel('Signed in as').selectOption('2');
  await page.getByRole('link', { name: 'Approvals' }).click();
  await expect(page.getByRole('button', { name: 'Approve' }).first()).toBeVisible();
  expect(await page.getByRole('row', { name: /HD Webcam/ }).count()).toBeGreaterThanOrEqual(2);
});
