import { expect, test } from '@playwright/test';

test('captures the full dashboard for the README', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.getByText('More assumptions').click();
  await expect(page.getByRole('spinbutton', { name: 'Market GDP · United States dollars (USD), trillions' }).first()).toBeVisible();
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
  await expect(page.getByRole('spinbutton', { name: 'GDP at purchasing power parity (PPP), international dollars, trillions' }).first()).toBeVisible();
  const widths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
  expect(pageErrors).toEqual([]);
});

test('updates economic charts as soon as a numeric spinner changes a value', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.getByText('More assumptions').click();

  const pppGdp = page.getByRole('spinbutton', { name: 'GDP at purchasing power parity (PPP), international dollars, trillions' }).first();
  const graph = page.getByRole('img', { name: 'GDP projection' });
  const graphPath = graph.locator('path').first();
  const originalPath = await graphPath.getAttribute('d');
  const originalHash = await page.evaluate(() => window.location.hash);

  await pppGdp.focus();
  await page.keyboard.press('ArrowUp');

  await expect(pppGdp).toHaveValue('1.1');
  await expect.poll(() => page.evaluate(() => window.location.hash)).not.toBe(originalHash);
  await expect.poll(() => graphPath.getAttribute('d')).not.toBe(originalPath);
});
