import { expect, test } from '@playwright/test';

test('captures the full dashboard for the README', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.getByText('More assumptions').click();
  await expect(page.getByRole('spinbutton', { name: 'Market GDP · US$T' }).first()).toBeVisible();
  await expect(page.getByRole('img', { name: 'Population projection line chart' })).toBeVisible();
  expect(pageErrors).toEqual([]);
  await page.screenshot({ path: 'docs/dashboard-full.png', fullPage: true, animations: 'disabled' });
});

test('keeps the key controls usable at a mobile viewport', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('slider', { name: 'Selected year' })).toBeVisible();
  await page.getByText('More assumptions').click();
  await expect(page.getByRole('spinbutton', { name: 'PPP GDP · Intl$T' }).first()).toBeVisible();
  const widths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
  expect(pageErrors).toEqual([]);
});
