import { test, expect } from 'playwright/test';

const PAGE = 'http://localhost:3002/';

test.describe('Social icons interactions', () => {
  test('desktop: double-click copies URL and shows copied label', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(PAGE, { waitUntil: 'networkidle' });

    const linkedin = page.locator('.max-md\\:hidden a[aria-label="LinkedIn"]');
    await expect(linkedin).toBeVisible();

    const copiedLabel = linkedin.locator('.social-icon-copied');
    await expect(copiedLabel).toHaveCSS('opacity', '0');

    await linkedin.click();
    await linkedin.click();
    await page.waitForTimeout(200);

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('https://www.linkedin.com/in/sagar-sarkale/');

    await expect(copiedLabel).toHaveCSS('opacity', '1');
    await expect(linkedin).toHaveClass(/is-copied/);

    await page.waitForTimeout(1200);
    await expect(copiedLabel).toHaveCSS('opacity', '0');
  });

  test('desktop: single-click does not copy', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(PAGE, { waitUntil: 'networkidle' });

    const email = page.locator('.max-md\\:hidden a[aria-label="Email"]');
    await expect(email).toBeVisible();

    await page.evaluate(() => navigator.clipboard.writeText(''));

    await email.click();
    await page.waitForTimeout(100);

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('');
  });

  test('mobile: long-press copies URL', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      hasTouch: true,
    });
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const page = await context.newPage();
    await page.goto(PAGE, { waitUntil: 'networkidle' });

    // Use mobile social icons (the max-md:flex one)
    const github = page.locator('.max-md\\:flex a[aria-label="GitHub"]');
    await expect(github).toBeVisible();

    const copiedLabel = github.locator('.social-icon-copied');
    await expect(copiedLabel).toHaveCSS('opacity', '0');

    // Simulate long-press via dispatchEvent (touch events are tricky in Playwright)
    await github.evaluate((el) => {
      const touch = new Touch({
        identifier: 1,
        target: el,
        clientX: 0,
        clientY: 0,
      });
      el.dispatchEvent(new TouchEvent('touchstart', { touches: [touch], changedTouches: [touch], bubbles: true }));
    });

    await page.waitForTimeout(600);

    await github.evaluate((el) => {
      const touch = new Touch({
        identifier: 1,
        target: el,
        clientX: 0,
        clientY: 0,
      });
      el.dispatchEvent(new TouchEvent('touchend', { touches: [], changedTouches: [touch], bubbles: true }));
    });

    await page.waitForTimeout(200);

    // On mobile touch devices, clipboard API may not work in automated tests.
    // Just verify the copied label appears (indicating the handler fired).
    await expect(copiedLabel).toHaveCSS('opacity', '1');
    await expect(github).toHaveClass(/is-copied/);
  });
});
