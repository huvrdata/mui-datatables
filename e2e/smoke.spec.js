const { test, expect } = require('@playwright/test');

test('examples page loads without JS errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  // Load the root page first — static export has no server-side routing
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Navigate to examples via client-side routing
  await page.getByText('Examples').first().click();
  await page.waitForLoadState('networkidle');

  // Click into an actual example to exercise the MUIDataTable component
  await page.getByText('Simple').first().click();
  await page.waitForLoadState('networkidle');

  expect(errors).toHaveLength(0);
});
