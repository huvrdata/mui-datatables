const { test, expect } = require('@playwright/test');

test('examples page loads without JS errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  const url = new URL('/examples', process.env.BASE_URL || 'http://localhost:3000').href;
  console.log('Navigating to:', url);

  const response = await page.goto('/examples');
  console.log('Response status:', response?.status());
  console.log('Final URL:', page.url());

  await page.waitForLoadState('networkidle');

  // Click into an actual example to exercise the MUIDataTable component
  await page.getByText('Simple').first().click();
  await page.waitForLoadState('networkidle');

  expect(errors).toHaveLength(0);
});
