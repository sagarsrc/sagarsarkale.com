import { test, expect } from 'playwright/test';

const PAGE = 'http://localhost:3002/';

test.describe('Social icons double-click to copy', () => {
  test('double-clicking LinkedIn icon copies URL and shows copied label', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(PAGE, { waitUntil: 'networkidle' });

    const linkedin = page.locator('.max-md\\:hidden a[aria-label="LinkedIn"]');
    await expect(linkedin).toBeVisible();

    const copiedLabel = linkedin.locator('.social-icon-copied');

    // Initially hidden
    await expect(copiedLabel).toHaveCSS('opacity', '0');

    // Double-click quickly
    await linkedin.click();
    await linkedin.click();
    await page.waitForTimeout(200);

    // Check clipboard has the URL
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('https://www.linkedin.com/in/sagar-sarkale/');

    // Check label is visible
    await expect(copiedLabel).toHaveCSS('opacity', '1');

    // Check icon has copied color
    await expect(linkedin).toHaveClass(/is-copied/);

    // Wait for feedback to clear
    await page.waitForTimeout(1200);
    await expect(copiedLabel).toHaveCSS('opacity', '0');
  });

  test('single-clicking does not copy', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(PAGE, { waitUntil: 'networkidle' });

    const email = page.locator('.max-md\\:hidden a[aria-label="Email"]');
    await expect(email).toBeVisible();

    // Clear clipboard first
    await page.evaluate(() => navigator.clipboard.writeText(''));

    // Single click only
    await email.click();
    await page.waitForTimeout(100);

    // Clipboard should still be empty
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('');
  });
});
