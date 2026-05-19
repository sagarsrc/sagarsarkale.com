import { test, expect } from '@playwright/test';

test.describe('mobile agents layout', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('header logo and nav have gap', async ({ page }) => {
    await page.goto('http://localhost:3000/agents/');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Take screenshot for visual inspection
    await page.screenshot({ path: 'test-results/mobile-header.png', fullPage: false });

    // Check that logo and nav don't overlap
    const logo = header.locator('text=sagar sarkale');
    const firstNav = header.locator('nav a').first();

    const logoBox = await logo.boundingBox();
    const navBox = await firstNav.boundingBox();

    expect(logoBox).toBeTruthy();
    expect(navBox).toBeTruthy();

    // Logo right edge should be left of nav left edge (with gap)
    expect(logoBox!.x + logoBox!.width).toBeLessThanOrEqual(navBox!.x);
  });

  test('sidebar toggle visible on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/agents/');
    await page.waitForLoadState('networkidle');

    const toggle = page.locator('button[aria-label="Toggle sidebar"]');
    await expect(toggle).toBeVisible();
  });

  test('desktop sidebar below header', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000/agents/');
    await page.waitForLoadState('networkidle');

    const header = page.locator('header');
    const sidebar = page.locator('aside').first();

    const headerBox = await header.boundingBox();
    const sidebarBox = await sidebar.boundingBox();

    expect(headerBox).toBeTruthy();
    expect(sidebarBox).toBeTruthy();

    // Sidebar top should be at or below header bottom
    expect(sidebarBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 1);

    await page.screenshot({ path: 'test-results/desktop-sidebar.png', fullPage: false });
  });
});
