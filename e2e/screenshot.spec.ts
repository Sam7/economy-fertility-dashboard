import { expect, test } from '@playwright/test';

test('captures the full dashboard for the README', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  for (const label of ['Australia vs Japan', 'Australia · migration on/off', 'United States vs China', 'China vs India']) {
    await expect(page.getByRole('button', { name: label })).toBeVisible();
  }
  await page.getByRole('button', { name: 'United States vs China' }).click();
  await expect(page.getByRole('button', { name: 'United States vs China' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '1.8 vs 1.4' }).click();
  await page.getByText('More assumptions').click();
  await expect(page.getByRole('spinbutton', { name: 'Market GDP · United States dollars (USD), trillions' }).first()).toBeVisible();
  await expect(page.getByRole('img', { name: 'Population projection line chart' })).toBeVisible();
  expect(pageErrors).toEqual([]);
  await page.addStyleTag({ content: '.sticky-scenarios { position:relative !important; top:auto !important; }' });
  await page.screenshot({ path: 'docs/dashboard-full.png', fullPage: true, animations: 'disabled' });
});

test('keeps the key controls usable at a mobile viewport', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Australia vs Japan' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Australia · migration on/off' })).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Selected year' })).toBeVisible();
  const tabA = page.getByRole('tab', { name: /Scenario A/ });
  const tabB = page.getByRole('tab', { name: /Scenario B/ });
  await expect(tabA).toHaveAttribute('aria-selected', 'true');
  await tabB.click();
  await expect(tabB).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByLabel('Scenario B country')).toBeVisible();
  await tabB.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(tabA).toHaveAttribute('aria-selected', 'true');
  await tabB.click();
  const touchTargets = [
    tabA,
    tabB,
    page.getByLabel('Scenario B country'),
    page.getByRole('button', { name: /Reset Scenario B/ }),
    page.getByRole('spinbutton', { name: 'Scenario B total fertility rate (TFR)' }),
    page.getByRole('button', { name: 'Swap scenarios' }),
  ];
  for (const target of touchTargets) {
    const box = await target.boundingBox();
    const label = await target.getAttribute('aria-label') ?? await target.textContent() ?? 'control';
    expect(box?.height ?? 0, `${label.trim()} touch height`).toBeGreaterThanOrEqual(44);
  }
  await page.getByText('More assumptions').click();
  await expect(page.getByRole('spinbutton', { name: 'GDP at purchasing power parity (PPP), international dollars, trillions' }).first()).toBeVisible();
  await page.getByText('More assumptions').click();
  await tabA.click();
  const widths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
  for (const scrollY of [900, 2200]) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await expect.poll(() => page.locator('.sticky-scenarios').boundingBox().then((box) => box?.y ?? 1000)).toBeLessThan(1);
  }
  const populationChart = page.getByRole('img', { name: 'Population projection line chart' });
  const chartBox = await populationChart.boundingBox();
  const chartViewBoxWidth = Number((await populationChart.getAttribute('viewBox'))?.split(' ')[2]);
  expect(Math.abs((chartBox?.width ?? 0) - chartViewBoxWidth)).toBeLessThanOrEqual(1);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.getByText('More assumptions').click();
  await expect(page.getByRole('spinbutton', { name: 'Market GDP · United States dollars (USD), trillions' }).first()).toBeVisible();
  const assumptionColumns = await page.locator('.advanced-a .assumption-group-fields.two').first().evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(assumptionColumns).toBe(2);
  const screenshotStyle = await page.addStyleTag({ content: '.sticky-scenarios { position:relative !important; top:auto !important; }' });
  await page.screenshot({ path: 'docs/dashboard-mobile.png', fullPage: true, animations: 'disabled' });
  await screenshotStyle.evaluate((style) => style.remove());
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.getByRole('tablist', { name: 'Choose scenario controls' })).toBeVisible();
    await expect(page.locator('.sticky-scenarios')).toHaveCSS('position', 'sticky');
    const responsiveWidths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    expect(responsiveWidths.document).toBeLessThanOrEqual(responsiveWidths.viewport);
  }
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

test('keeps chart lines distinct when both scenarios have the same title', async ({ page }) => {
  const duplicateKeyWarnings: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('same key')) duplicateKeyWarnings.push(message.text());
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  await page.getByLabel('Scenario A country').selectOption('australia');
  await page.getByLabel('Scenario B country').selectOption('australia');

  const migrationA = page.getByRole('spinbutton', { name: 'Scenario A net migration per 1,000 people per year' });
  const migrationB = page.getByRole('spinbutton', { name: 'Scenario B net migration per 1,000 people per year' });
  await migrationA.fill('8.4');
  await migrationB.fill('8.1');
  await expect(page.locator('.scenario-a .compact-scenario-head h2')).toHaveText('Australia · custom');
  await expect(page.locator('.scenario-b .compact-scenario-head h2')).toHaveText('Australia · custom');
  await migrationA.fill('8.5');

  const birthsChart = page.getByRole('img', { name: 'Annual births projection line chart' });
  await expect(birthsChart.locator('path[stroke="#3157d5"]')).toHaveCount(1);
  await expect(birthsChart.locator('path[stroke="#d45f39"]')).toHaveCount(1);
  expect(duplicateKeyWarnings).toEqual([]);
});

test('keeps each animated reset glyph centered inside its circular button', async ({ page }) => {
  await page.goto('/');
  const reset = page.getByRole('button', { name: 'Reset Scenario A to 10m model population defaults' });
  const icon = reset.locator('svg');
  const buttonBox = await reset.boundingBox();
  const iconBox = await icon.boundingBox();

  expect(buttonBox).not.toBeNull();
  expect(iconBox).not.toBeNull();
  expect(Math.abs((buttonBox!.x + buttonBox!.width / 2) - (iconBox!.x + iconBox!.width / 2))).toBeLessThan(0.5);
  expect(Math.abs((buttonBox!.y + buttonBox!.height / 2) - (iconBox!.y + iconBox!.height / 2))).toBeLessThan(0.5);

  await reset.hover();
  await expect(reset).toHaveCSS('background-color', 'rgb(220, 228, 255)');
  await expect(icon).toHaveCSS('transition-duration', '0.72s');
  await reset.screenshot({ path: 'test-results/reset-icon-hover.png' });
});
